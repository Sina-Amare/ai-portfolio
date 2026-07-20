/**
 * Admin session for /admin.
 *
 * A single shared password (ADMIN_PASSWORD) exchanged for an HMAC-signed,
 * httpOnly cookie. No user table, no third-party auth — proportionate for a
 * one-person dashboard, while still avoiding the classic mistakes: the password
 * is compared in constant time, the cookie carries a signature rather than the
 * password itself, and it expires.
 */
import { createHmac, timingSafeEqual, randomBytes, hkdfSync } from "node:crypto";

export const ADMIN_COOKIE = "sa_admin";
const MAX_AGE_SECONDS = 12 * 3600;

/**
 * Signing key for session cookies.
 *
 * Never the password itself: the cookie is handed to the browser, so signing
 * with the credential would turn any leaked cookie into an offline oracle for
 * cracking the password. When ADMIN_SESSION_SECRET isn't set we derive a
 * separate key from the password via HKDF instead — same "one env var to
 * configure" ergonomics, but the cookie no longer carries an HMAC of the
 * secret you actually type in.
 */
function secret(): string {
  const explicit = process.env.ADMIN_SESSION_SECRET;
  if (explicit) return explicit;
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return "";
  // hkdfSync returns an ArrayBuffer, not a Buffer.
  return Buffer.from(
    hkdfSync("sha256", password, "sa-admin-session", "session-signing-key-v1", 32),
  ).toString("hex");
}

export function adminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

/** Constant-time compare that also tolerates differing lengths. */
export function passwordMatches(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD ?? "";
  if (!expected) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    // Still burn a comparison so the reject path isn't obviously faster.
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Token shape: <expiry>.<nonce>.<hmac>. */
export function createSessionToken(now = Date.now()): string {
  const exp = now + MAX_AGE_SECONDS * 1000;
  const nonce = randomBytes(8).toString("hex");
  const payload = `${exp}.${nonce}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined, now = Date.now()): boolean {
  if (!token || !secret()) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [expRaw, nonce, mac] = parts as [string, string, string];
  const expected = sign(`${expRaw}.${nonce}`);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const exp = Number(expRaw);
  return Number.isFinite(exp) && exp > now;
}

export function sessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${MAX_AGE_SECONDS}${secure}`;
}

export function clearedCookie(): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

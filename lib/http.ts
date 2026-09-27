import { site } from "@/lib/site";

const bare = (host: string) => host.toLowerCase().replace(/^www\./, "");

/**
 * Cross-site guard for our own POST endpoints (contact, admin login, beacon).
 * Browsers always send Origin on a POST, so requiring it to be this site stops
 * another page from making its visitors submit the contact form or try admin
 * passwords. localhost is trusted only outside production.
 *
 * Without an explicit `host`, the host the request was sent to also counts, so
 * the form and login work on a preview or the vercel.app alias even when
 * site.url names another domain. A cross-site page can't forge either header.
 */
export function sameOrigin(req: Request, host?: string): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    const o = bare(new URL(origin).hostname);
    const own = host ? [host] : [new URL(site.url).hostname, new URL(req.url).hostname];
    if (own.some((h) => bare(h) === o)) return true;
    return process.env.NODE_ENV !== "production" && (o === "localhost" || o === "127.0.0.1");
  } catch {
    return false;
  }
}

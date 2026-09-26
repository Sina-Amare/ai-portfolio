/**
 * The browser half of analytics: the beacon transport and the action buffer.
 * Everything here lives in page memory; nothing is written to the device.
 */
import type { EventName } from "./beacon";
import { site } from "@/lib/site";

const ENDPOINT = "/api/track";
/** The beacon accepts at most this many events per flush. */
const MAX_EVENTS = 20;

let buffer: { n: EventName; p?: string }[] = [];

/** Note an action. It travels with the tracker's next engagement flush. */
export function track(n: EventName, p?: string): void {
  if (buffer.length < MAX_EVENTS) buffer.push(p ? { n, p } : { n });
}

export function takeEvents(): { n: EventName; p?: string }[] {
  const out = buffer;
  buffer = [];
  return out;
}

/** sendBeacon survives the page closing; keepalive fetch where it's missing or refuses. */
export function send(body: object): void {
  const json = JSON.stringify(body);
  try {
    if (navigator.sendBeacon?.(ENDPOINT, new Blob([json], { type: "application/json" }))) return;
  } catch {
    // Some Chromium builds refuse a Blob whose type isn't CORS-safelisted.
  }
  void fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: json,
    keepalive: true,
  }).catch(() => {
    /* analytics must never break the page */
  });
}

/** What following this link means: the résumé, an outbound target, or nothing worth counting. */
export function linkEvent(href: string, origin: string): [EventName, string?] | null {
  let url: URL;
  try {
    url = new URL(href, origin);
  } catch {
    return null;
  }
  if (url.protocol === "mailto:") return ["outbound", "email"];
  if (url.origin === origin) return url.pathname === site.resume ? ["resume_download"] : null;
  const host = url.hostname.replace(/^www\./, "");
  if (host === "mail.google.com") return ["outbound", "email"];
  if (host === "linkedin.com") return ["outbound", "linkedin"];
  if (host === "t.me" || host === "telegram.me") return ["outbound", "telegram"];
  if (host === "github.com")
    return ["outbound", url.pathname.split("/").filter(Boolean).length > 1 ? "repo" : "github"];
  return ["outbound"];
}

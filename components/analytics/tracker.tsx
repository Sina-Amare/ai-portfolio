"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { stripLocale } from "@/lib/locale";
import { linkEvent, send, takeEvents, track } from "@/lib/analytics/client";

const TICK_MS = 1000;
/** Active = the tab is visible and the visitor scrolled, pointed, tapped or typed this recently. */
const IDLE_MS = 60_000;
/** While active, time is also flushed this often, so a tab closed without pagehide loses ≤ 1 min. */
const FLUSH_MS = 60_000;
/** On screen at two 1-second samples (≈ 1 s) before a section counts as seen. */
const SEEN_SAMPLES = 2;
const ACTIVITY = ["pointerdown", "pointermove", "keydown", "scroll", "wheel", "touchstart"];

// Module scope, not refs: switching language re-mounts the [lang] layout (and
// this component), and a fresh ref would re-send the entry referrer and credit
// one arrival from Google twice, or drop the time the previous page earned.
let firstBeacon = true;
/** The public path being measured; null on /admin or before the first page. */
let page: string | null = null;
let activeMs = 0;
let lastTick = 0;
let lastActive = 0;
let lastFlush = 0;
/** Per page: samples each section was on screen. */
let onScreen: Record<string, number> = {};
/** Per page: seen sections already reported, so a seen-but-never-dominant one is sent once. */
let reported = new Set<string>();
/** Per flush: ms each section was the one taking most of the viewport. */
let dwell: Record<string, number> = {};

/**
 * Credit the time since the last sample, if the visitor was actually there,
 * and (with `scan`) to the section on screen.
 */
function sample(scan = true) {
  const now = Date.now();
  // Capped: a laptop waking from sleep must not credit the hours it slept.
  const dt = Math.min(now - lastTick, 2 * TICK_MS);
  lastTick = now;
  if (!page || document.visibilityState !== "visible" || now - lastActive > IDLE_MS) return;
  activeMs += dt;
  if (!scan) return;

  let top = "";
  let topPx = 0;
  for (const el of document.querySelectorAll<HTMLElement>("[data-analytics-section]")) {
    const r = el.getBoundingClientRect();
    const px = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
    if (px <= 0) continue;
    const name = el.dataset.analyticsSection!;
    onScreen[name] = (onScreen[name] ?? 0) + 1;
    if (px > topPx) [top, topPx] = [name, px];
  }
  if (top) dwell[top] = (dwell[top] ?? 0) + dt;
}

/** Send what the current page earned since the last flush: active time, sections, actions. */
function flush() {
  // Time only: on a route change the DOM already shows the next page, and its
  // sections must not be credited to this one. Dwell comes from the ticks.
  sample(false);
  const ms = Math.min(Math.round(activeMs), 1_800_000);
  const events = takeEvents();
  activeMs = 0;
  lastFlush = Date.now();
  // ponytail: under a second with no action isn't worth a beacon; that sliver is dropped.
  if (!page || (ms < 1000 && !events.length)) {
    dwell = {};
    return;
  }
  const sections: Record<string, number> = {};
  for (const [name, n] of Object.entries(onScreen)) {
    if (n < SEEN_SAMPLES || (!dwell[name] && reported.has(name))) continue;
    sections[name] = Math.round(dwell[name] ?? 0);
    reported.add(name);
  }
  dwell = {};
  send({ t: "eng", path: page, ms, sections, events });
}

/**
 * One beacon per page view (this is an App Router SPA, so a plain server-side
 * counter would only ever see the first page of a visit), plus engagement
 * flushes: active time, which sections were on screen, and actions noted with
 * track(). Flushed on route change, when the tab is hidden or closed, and at
 * most once a minute while active.
 *
 * Deliberately sends nothing identifying and stores nothing on the device: the
 * server derives location from Vercel's request headers and recognises the
 * visit itself. Automated browsers (navigator.webdriver) send nothing at all.
 */
export function Tracker() {
  // Only a change signal: the value is "/en/..." under the proxy's rewrite, so
  // the beacon reads the public URL from window.location instead.
  const pathname = usePathname();

  useEffect(() => {
    if (navigator.webdriver) return;
    lastTick = lastActive = lastFlush = Date.now();
    const active = () => {
      lastActive = Date.now();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
      else lastTick = lastActive = Date.now();
    };
    const onPageHide = () => flush();
    // One delegated listener sees every link: résumé, GitHub, LinkedIn, email, repos.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]");
      const ev = a && linkEvent(a.getAttribute("href")!, window.location.origin);
      if (ev) track(...ev);
    };
    const timer = window.setInterval(() => {
      sample();
      if (Date.now() - lastFlush >= FLUSH_MS) flush();
    }, TICK_MS);
    const opts = { capture: true, passive: true };
    for (const type of ACTIVITY) window.addEventListener(type, active, opts);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    document.addEventListener("click", onClick, true);
    return () => {
      window.clearInterval(timer);
      for (const type of ACTIVITY) window.removeEventListener(type, active, opts);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  useEffect(() => {
    if (navigator.webdriver) return;
    const path = window.location.pathname;
    if (path === page) return;
    flush(); // what the previous page earned
    onScreen = {};
    reported = new Set();
    // Don't count the owner reading their own dashboard — otherwise every visit
    // to /admin inflates the very numbers being read.
    const bare = stripLocale(path);
    page = bare === "/admin" || bare.startsWith("/admin/") ? null : path;
    if (!page) return;
    lastActive = Date.now(); // opening a page is activity

    // document.referrer does NOT change on client-side navigation — it keeps
    // returning the original external referrer for the life of the document.
    // Sending it every time would credit one arrival from Google to every page
    // in the visit, so only the first beacon carries it.
    const isEntry = firstBeacon;
    firstBeacon = false;
    send({ t: "pv", path, referrer: isEntry ? document.referrer : "" });
  }, [pathname]);

  return null;
}

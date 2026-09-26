"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { stripLocale } from "@/lib/locale";

// Module scope, not refs: switching language re-mounts the [lang] layout (and
// this component), and a fresh ref would re-send the entry referrer and credit
// one arrival from Google twice.
let lastSent: string | null = null;
let firstBeacon = true;

/**
 * Fires one beacon per page view, including client-side route changes (this is
 * an App Router SPA, so a plain server-side counter would only ever see the
 * first page of a session).
 *
 * Deliberately sends nothing identifying: the server derives country/timezone
 * from Vercel's request headers and hashes the visitor itself. Only the path
 * and referrer travel in the body.
 */
export function Tracker() {
  // Only a change signal: the value is "/en/..." under the proxy's rewrite, so
  // the beacon reads the public URL from window.location instead.
  const pathname = usePathname();

  useEffect(() => {
    const path = window.location.pathname;
    if (lastSent === path) return;
    // Don't count the owner reading their own dashboard — otherwise every visit
    // to /admin inflates the very numbers being read.
    const bare = stripLocale(path);
    if (bare === "/admin" || bare.startsWith("/admin/")) return;
    lastSent = path;

    // document.referrer does NOT change on client-side navigation — it keeps
    // returning the original external referrer for the life of the document.
    // Sending it every time would credit one arrival from Google to every page
    // in the session, so only the first beacon carries it.
    const isEntry = firstBeacon;
    firstBeacon = false;

    const body = JSON.stringify({ path, referrer: isEntry ? document.referrer : "" });

    // keepalive lets the request survive the page unloading mid-flight.
    void fetch("/api/track", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      /* analytics must never break the page */
    });
  }, [pathname]);

  return null;
}

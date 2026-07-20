"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

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
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);
  const firstBeacon = useRef(true);

  useEffect(() => {
    if (!pathname || lastSent.current === pathname) return;
    // Don't count the owner reading their own dashboard — otherwise every visit
    // to /admin inflates the very numbers being read.
    if (pathname === "/admin" || pathname.startsWith("/admin/")) return;
    lastSent.current = pathname;

    // document.referrer does NOT change on client-side navigation — it keeps
    // returning the original external referrer for the life of the document.
    // Sending it every time would credit one arrival from Google to every page
    // in the session, so only the first beacon carries it.
    const isEntry = firstBeacon.current;
    firstBeacon.current = false;

    const body = JSON.stringify({
      path: pathname,
      referrer: isEntry ? document.referrer : "",
    });

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

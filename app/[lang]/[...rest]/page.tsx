import { notFound } from "next/navigation";

// Unknown URLs reach here through the proxy's /en rewrite (or directly under
// /fa). Status is 404, but the server HTML is Next's error shell; the localized
// 404 appears after hydration (docs/decisions/001-locale-prefixed-urls.md).
export const dynamic = "force-dynamic";

export default function CatchAll() {
  notFound();
}

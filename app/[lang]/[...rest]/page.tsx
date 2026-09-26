import { notFound } from "next/navigation";

// Unknown URLs reach here through the proxy's /en rewrite (or directly under
// /fa), so the 404 renders inside the localized layout with the site's styling.
export const dynamic = "force-dynamic";

export default function CatchAll() {
  notFound();
}

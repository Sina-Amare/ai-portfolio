import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Static and English: browsers fetch the manifest without cookies, so a
// per-locale version could never be served anyway.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.role}`,
    short_name: site.name,
    description: "Python backend & AI/LLM engineer. Ask my AI assistant anything about my work.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
    icons: [{ src: "/icon", sizes: "32x32", type: "image/png" }],
  };
}

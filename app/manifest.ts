import type { MetadataRoute } from "next";
import { cookies } from "next/headers";
import { site } from "@/lib/site";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const locale = (await cookies()).get("locale")?.value === "fa" ? "fa" : "en";
  return {
    name: `${site.name} — ${locale === "fa" ? "توسعه‌دهندهٔ بک‌اند و AI" : site.role}`,
    short_name: site.name,
    description:
      locale === "fa"
        ? "پروژه‌ها و تجربه‌های سینا عماره در بک‌اند و AI؛ از دستیار سایت دربارهٔ کارهاش بپرس."
        : "Python backend & AI/LLM engineer. Ask my AI assistant anything about my work.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#0a0a0b",
    icons: [{ src: "/icon", sizes: "32x32", type: "image/png" }],
  };
}

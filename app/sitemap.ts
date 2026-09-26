import type { MetadataRoute } from "next";
import { projects } from "@/lib/projects";
import { LOCALES, localizedPath } from "@/lib/locale";
import { absoluteUrl, languageAlternates } from "@/lib/seo";

// No lastModified: the only date we have is the build time, and Google ignores
// lastmod that changes on every deploy.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", "/projects", ...projects.map((p) => `/projects/${p.slug}`), "/privacy"];
  return paths.flatMap((path) => {
    const languages = Object.fromEntries(
      Object.entries(languageAlternates(path)).map(([lang, p]) => [lang, absoluteUrl(p)]),
    );
    return LOCALES.map((lang) => ({
      url: absoluteUrl(localizedPath(path, lang)),
      alternates: { languages },
    }));
  });
}

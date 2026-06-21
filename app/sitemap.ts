import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { projects } from "@/lib/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  const lastModified = new Date();
  return [
    { url: base, lastModified, priority: 1 },
    { url: `${base}/projects`, lastModified, priority: 0.8 },
    ...projects.map((p) => ({
      url: `${base}/projects/${p.slug}`,
      lastModified,
      priority: 0.6,
    })),
  ];
}

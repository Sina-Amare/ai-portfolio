import type { Metadata } from "next";
import { site } from "@/lib/site";
import { pageCopy } from "@/lib/page-copy";
import { localizedPath, type Locale } from "@/lib/locale";

const OG_LOCALE = { en: "en_US", fa: "fa_IR" } as const;

/** Absolute URL of a site path. The root is the bare origin, the same form Next prints for canonicals. */
export function absoluteUrl(path: string): string {
  const url = new URL(path, site.url);
  return url.pathname === "/" && !url.search ? url.origin : url.href;
}

/** hreflang map for a bare path. English doubles as x-default: it's the unprefixed URL. */
export function languageAlternates(path: string) {
  return { en: path, fa: localizedPath(path, "fa"), "x-default": path };
}

/**
 * Full metadata for one localized page. Everything a link preview reads is set
 * explicitly because Next merges metadata shallowly: a page that sets
 * `openGraph` replaces the parent's whole object (images included), and a
 * parent's canonical or twitter title would otherwise leak into every child.
 * `title` is the page name; pass the home page's full title for "/".
 */
export function pageMetadata(
  lang: Locale,
  path: string,
  copy: { title: string; description: string },
): Metadata {
  const title = path === "/" ? copy.title : `${copy.title} — ${site.name}`;
  const url = localizedPath(path, lang);
  const images = [
    {
      url: localizedPath("/opengraph-image", lang),
      width: 1200,
      height: 630,
      alt: pageCopy[lang].home.title,
    },
  ];
  return {
    title: { absolute: title },
    description: copy.description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: "website",
      siteName: site.name,
      url,
      title,
      description: copy.description,
      locale: OG_LOCALE[lang],
      alternateLocale: [OG_LOCALE[lang === "fa" ? "en" : "fa"]],
      images,
    },
    twitter: { card: "summary_large_image", title, description: copy.description, images },
  };
}

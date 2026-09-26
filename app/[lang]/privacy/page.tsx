import type { Metadata } from "next";
import { PrivacyContent } from "@/components/privacy-content";
import { toLocale } from "@/lib/locale";
import { pageCopy } from "@/lib/page-copy";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = toLocale((await params).lang);
  const p = pageCopy[lang].privacy;
  return pageMetadata(lang, "/privacy", { title: p.eyebrow, description: p.meta });
}

export default function PrivacyPage() {
  return <PrivacyContent />;
}

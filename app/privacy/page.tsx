import type { Metadata } from "next";
import { cookies } from "next/headers";
import { PrivacyContent } from "@/components/privacy-content";
import { pageCopy } from "@/lib/page-copy";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await cookies()).get("locale")?.value === "fa" ? "fa" : "en";
  return {
    title: pageCopy[locale].privacy.eyebrow,
    description: pageCopy[locale].privacy.meta,
  };
}

export default function PrivacyPage() {
  return <PrivacyContent />;
}

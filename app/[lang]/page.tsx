import type { Metadata } from "next";
import { ChatHero } from "@/components/home/chat-hero";
import { Featured } from "@/components/home/featured";
import { WorkProjects } from "@/components/projects/work-projects";
import { About } from "@/components/home/about";
import { Contact } from "@/components/home/contact";
import { ScrollToHash } from "@/components/scroll-to-hash";
import { toLocale } from "@/lib/locale";
import { pageCopy } from "@/lib/page-copy";
import { pageMetadata } from "@/lib/seo";

// Only here, never on the layout: false anywhere up the tree would also stop
// /projects/[slug] and the catch-all from rendering the styled 404.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = toLocale((await params).lang);
  return pageMetadata(lang, "/", pageCopy[lang].home);
}

export default function Home() {
  return (
    <>
      <ScrollToHash />
      <ChatHero />
      <Featured />
      <WorkProjects preview />
      <About />
      <Contact />
    </>
  );
}

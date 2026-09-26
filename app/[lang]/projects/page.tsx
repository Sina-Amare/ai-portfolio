import type { Metadata } from "next";
import { ProjectsIndex } from "@/components/projects/projects-index";
import { toLocale } from "@/lib/locale";
import { pageCopy } from "@/lib/page-copy";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const lang = toLocale((await params).lang);
  return pageMetadata(lang, "/projects", pageCopy[lang].projects);
}

export default function ProjectsPage() {
  return <ProjectsIndex />;
}

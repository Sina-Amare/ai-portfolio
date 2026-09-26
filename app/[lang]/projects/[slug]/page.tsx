import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/lib/projects";
import { CaseStudy } from "@/components/projects/case-study";
import { toLocale } from "@/lib/locale";
import { pageMetadata } from "@/lib/seo";

type Params = { params: Promise<{ lang: string; slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const lang = toLocale(raw);
  return pageMetadata(lang, `/projects/${slug}`, {
    title: project.name,
    description: lang === "fa" ? project.summaryFa : project.summary,
  });
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return <CaseStudy project={project} />;
}

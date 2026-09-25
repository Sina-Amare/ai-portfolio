import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProject, projects } from "@/lib/projects";
import { CaseStudy } from "@/components/projects/case-study";
import { cookies } from "next/headers";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  const locale = (await cookies()).get("locale")?.value === "fa" ? "fa" : "en";
  const description = locale === "fa" ? project.summaryFa : project.summary;
  return {
    title: project.name,
    description,
    openGraph: { title: project.name, description },
  };
}

export default async function ProjectPage({ params }: Params) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return <CaseStudy project={project} />;
}

import type { Metadata } from "next";
import { ProjectsIndex } from "@/components/projects/projects-index";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Production-minded open-source projects by Sina Amareh — where backend resilience meets LLM engineering.",
};

export default function ProjectsPage() {
  return <ProjectsIndex />;
}

import type { Metadata } from "next";
import { ProjectsIndex } from "@/components/projects/projects-index";
import { cookies } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await cookies()).get("locale")?.value === "fa" ? "fa" : "en";
  return locale === "fa"
    ? {
        title: "پروژه‌ها",
        description:
          "پروژه‌های متن‌باز و دو ایجنت کاری سینا عماره؛ با توضیح مسئله، مسیر کار و تصمیم‌های فنی.",
      }
    : {
        title: "Projects",
        description:
          "Open-source projects and two workplace agents by Sina Amareh, with the problems, workflows, and engineering decisions behind them.",
      };
}

export default function ProjectsPage() {
  return <ProjectsIndex />;
}

"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/locale-provider";
import { pageCopy } from "@/lib/page-copy";
import { getProject } from "@/lib/projects";
import { site } from "@/lib/site";

/** Keep the browser tab and description in sync with an in-place language switch. */
export function LocaleMetadata() {
  const pathname = usePathname();
  const { locale } = useLocale();

  useEffect(() => {
    const project = pathname.startsWith("/projects/")
      ? getProject(pathname.split("/")[2] ?? "")
      : undefined;
    let title: string;
    let description: string;

    if (project) {
      title = project.name;
      description = locale === "fa" ? project.summaryFa : project.summary;
    } else if (pathname === "/projects") {
      title = locale === "fa" ? "پروژه‌ها" : "Projects";
      description =
        locale === "fa"
          ? "پروژه‌های متن‌باز و دو ایجنت کاری سینا عماره؛ با توضیح مسئله، مسیر کار و تصمیم‌های فنی."
          : "Open-source projects and two workplace agents by Sina Amareh, with the problems, workflows, and engineering decisions behind them.";
    } else if (pathname === "/privacy") {
      title = pageCopy[locale].privacy.eyebrow;
      description = pageCopy[locale].privacy.meta;
    } else if (pathname === "/admin") {
      title = pageCopy[locale].admin.meta;
      description = "";
    } else if (pathname === "/") {
      title =
        locale === "fa"
          ? "سینا عماره — توسعه‌دهندهٔ بک‌اند و AI"
          : `${site.name} — ${site.role}`;
      description =
        locale === "fa"
          ? "من سینا عماره‌ام؛ با Python بک‌اند و برنامه‌های AI می‌سازم. از پروژه‌ها و تجربه‌هام از دستیار سایت بپرس."
          : "Python backend & AI/LLM engineer. Resilient backend services, multi-provider LLM apps, and RAG. Ask my AI assistant anything about my work.";
    } else {
      title = pageCopy[locale].notFound.title;
      description = pageCopy[locale].notFound.body;
    }

    document.title = pathname === "/" ? title : `${title} — ${site.name}`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", description);
  }, [locale, pathname]);

  return null;
}

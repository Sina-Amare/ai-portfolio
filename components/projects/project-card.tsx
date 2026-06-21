import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/lib/projects";
import { cn } from "@/lib/utils";

export function ProjectCard({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={cn(
        "group glass hover:bg-card-hover relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="eyebrow text-[10px]">{project.year}</div>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight">
            {project.name}
          </h3>
          <p className="text-muted mt-0.5 text-[13px]">{project.tagline}</p>
        </div>
        <ArrowUpRight className="text-muted group-hover:text-accent h-5 w-5 shrink-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      </div>
      <p className="text-muted mt-4 flex-1 text-sm leading-relaxed">
        {project.summary}
      </p>
      <div className="mt-5 flex flex-wrap gap-1.5">
        {project.stack.map((s) => (
          <span
            key={s}
            className="text-muted font-mono rounded-full border border-border px-2 py-0.5 text-[10px]"
          >
            {s}
          </span>
        ))}
      </div>
    </Link>
  );
}

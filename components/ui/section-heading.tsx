import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  number,
  title,
  description,
  className,
}: {
  eyebrow?: string;
  number?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      <div className="flex items-center gap-3">
        {number && (
          <span className="text-accent font-mono text-xs">{number}</span>
        )}
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      </div>
      <h2 className="text-gradient mt-3 text-3xl font-semibold tracking-tight sm:text-[2.5rem] sm:leading-[1.1]">
        {title}
      </h2>
      {description && (
        <p className="text-muted mt-4 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

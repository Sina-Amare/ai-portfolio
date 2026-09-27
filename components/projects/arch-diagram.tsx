import { ChevronRight } from "lucide-react";
import { digits, type Locale } from "@/lib/locale";

/**
 * A clean CSS pipeline diagram. Below lg it stays on one line and the parent's
 * `overflow-x-auto` scrolls it sideways; from lg it wraps, so no step is cut
 * off beside the sidebar. Each step carries its outgoing arrow: a wrapped line
 * ends on an arrow (the pipeline continues) and never starts with one. The
 * arrow flips to point the right way in RTL.
 */
export function ArchDiagram({ steps, locale }: { steps: string[]; locale: Locale }) {
  return (
    <ol className="flex w-max gap-2 lg:w-auto lg:flex-wrap">
      {steps.map((step, i) => (
        <li key={step} className="flex shrink-0 items-center gap-2">
          <div className="glass flex items-center gap-2.5 rounded-xl px-3 py-2.5">
            <span className="text-accent-text font-mono text-[10px]">
              {digits(i + 1, locale, 2)}
            </span>
            <span className="text-[13px] whitespace-nowrap">{step}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className="text-muted h-4 w-4 shrink-0 rtl:-scale-x-100" />
          )}
        </li>
      ))}
    </ol>
  );
}

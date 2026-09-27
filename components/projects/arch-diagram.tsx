import { Fragment } from "react";
import { ChevronRight } from "lucide-react";
import { digits, type Locale } from "@/lib/locale";

/**
 * A clean CSS pipeline diagram. Stays on a single line (steps keep their
 * order); the parent's `overflow-x-auto` scrolls it horizontally on narrow
 * screens instead of wrapping. The arrow flips to point the right way in RTL.
 */
export function ArchDiagram({ steps, locale }: { steps: string[]; locale: Locale }) {
  return (
    <div className="flex w-max items-stretch gap-2">
      {steps.map((step, i) => (
        <Fragment key={step}>
          <div className="glass flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5">
            <span className="text-accent-text font-mono text-[10px]">
              {digits(i + 1, locale, 2)}
            </span>
            <span className="text-[13px] whitespace-nowrap">{step}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className="text-muted h-4 w-4 shrink-0 self-center rtl:-scale-x-100" />
          )}
        </Fragment>
      ))}
    </div>
  );
}

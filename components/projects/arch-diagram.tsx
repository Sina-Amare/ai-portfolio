import { Fragment } from "react";
import { ChevronRight } from "lucide-react";

/** A clean CSS pipeline diagram (no stock screenshots). */
export function ArchDiagram({ steps }: { steps: string[] }) {
  return (
    <div className="flex flex-wrap items-stretch gap-2">
      {steps.map((step, i) => (
        <Fragment key={step}>
          <div className="glass flex items-center gap-2.5 rounded-xl px-3 py-2.5">
            <span className="text-accent-2 font-mono text-[10px]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-[13px] whitespace-nowrap">{step}</span>
          </div>
          {i < steps.length - 1 && (
            <ChevronRight className="text-muted-2 h-4 w-4 shrink-0 self-center" />
          )}
        </Fragment>
      ))}
    </div>
  );
}

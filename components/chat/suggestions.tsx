"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

export function Suggestions({
  items,
  onPick,
  dir,
}: {
  items: readonly string[];
  onPick: (text: string) => void;
  dir: "ltr" | "rtl";
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={cn("flex flex-wrap justify-center gap-2", dir === "rtl" && "font-fa")}
      initial={reduce ? false : "hidden"}
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
      }}
    >
      {items.map((s) => (
        <motion.button
          key={s}
          type="button"
          dir={dir}
          onClick={() => onPick(s)}
          variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-muted hover:text-text hover:bg-accent-soft rounded-full border border-border px-3 py-1.5 text-[13px] transition-colors hover:border-accent/50"
        >
          {s}
        </motion.button>
      ))}
    </motion.div>
  );
}

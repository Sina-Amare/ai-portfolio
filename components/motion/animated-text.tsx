"use client";

import { Fragment } from "react";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * A subtle word-by-word reveal for headings — each word rises and fades in with
 * a small stagger. Accessible (the full text is exposed via aria-label; the
 * animated word spans are aria-hidden) and disabled under reduced motion.
 */
export function AnimatedText({
  text,
  className,
  delay = 0,
  inView = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  inView?: boolean;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;

  const words = text.split(" ");
  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05, delayChildren: delay } },
  };
  const word = {
    hidden: { opacity: 0, y: "0.4em" },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  };

  return (
    <motion.span
      aria-label={text}
      className={className}
      variants={container}
      initial="hidden"
      {...(inView
        ? { whileInView: "visible", viewport: { once: true, amount: 0.5 } }
        : { animate: "visible" })}
    >
      {words.map((w, i) => (
        <Fragment key={i}>
          <motion.span aria-hidden variants={word} className="inline-block">
            {w}
          </motion.span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </motion.span>
  );
}

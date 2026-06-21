"use client";

import { MotionConfig } from "motion/react";

/** App-wide motion config: respect the user's reduced-motion preference (skips transforms). */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

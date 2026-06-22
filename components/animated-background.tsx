/**
 * Site-wide ambient backdrop: a few slow-drifting amber orbs, fixed to the
 * viewport so empty space feels alive on every section. Pure CSS, behind all
 * content, and disabled under `prefers-reduced-motion`.
 */
export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="bg-orb bg-orb--1" />
      <div className="bg-orb bg-orb--2" />
      <div className="bg-orb bg-orb--3" />
    </div>
  );
}

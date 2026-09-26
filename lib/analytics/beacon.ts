/**
 * The beacon contract: what /api/track accepts, validated and normalized.
 *
 * Every name that survives this file becomes a Redis hash field, so nothing
 * open-ended gets through: sections, events and event props are allow-lists,
 * paths are folded onto real routes, referrers onto bare hosts, and durations
 * are capped. Unknown sections, events and props are dropped one by one (a
 * newer tracker must not lose a whole beacon); a malformed beacon is dropped.
 */
import { z } from "zod";
import { normalizePath, normalizeReferrer } from "./collect";

/** `data-analytics-section` names the tracker reports dwell time for. */
export const SECTIONS = [
  "hero",
  "featured",
  "workplace",
  "about",
  "contact",
  "projects-list",
  "case-study",
  "workplace-detail",
] as const;
export type Section = (typeof SECTIONS)[number];

export const EVENTS = [
  "chat_ask",
  "contact_submit",
  "resume_download",
  "outbound",
  "gallery_open",
  "palette_open",
  "lang_switch",
] as const;
export type EventName = (typeof EVENTS)[number];

/** Events that make a visit "engaged" on their own, whatever its active time. */
export const KEY_EVENTS: ReadonlySet<string> = new Set<EventName>([
  "chat_ask",
  "contact_submit",
  "resume_download",
  "outbound",
  "gallery_open",
]);

/** Event props besides project slugs: chat_ask chip|typed, outbound target, lang_switch target. */
const PROPS = ["chip", "typed", "github", "linkedin", "telegram", "email", "repo", "en", "fa"];

/** Half an hour: one beacon can't report more than a visit's idle window. */
export const MAX_MS = 1_800_000;
const Ms = z.number().int().min(0).max(MAX_MS);
const Path = z.string().max(512);

const Schema = z.discriminatedUnion("t", [
  z.object({ t: z.literal("pv"), path: Path, referrer: z.string().max(2048).optional() }),
  z.object({
    t: z.literal("eng"),
    path: Path,
    ms: Ms,
    sections: z.record(z.string().max(32), Ms).optional(),
    events: z
      .array(z.object({ n: z.string().max(32), p: z.string().max(40).optional() }))
      .max(20)
      .optional(),
  }),
]);

export type PageBeacon = { t: "pv"; path: string; referrer: string };
export type EngageBeacon = {
  t: "eng";
  path: string;
  ms: number;
  /** Sections seen this flush → dominant-section dwell ms (0 = seen, never dominant). */
  sections: Partial<Record<Section, number>>;
  /** "name" or "name:prop" → how many times, so repeats cost one write. */
  events: Record<string, number>;
};
export type Beacon = PageBeacon | EngageBeacon;

const isSection = (s: string): s is Section => (SECTIONS as readonly string[]).includes(s);
const isEvent = (s: string) => (EVENTS as readonly string[]).includes(s);

export function parseBeacon(
  raw: unknown,
  slugs: readonly string[],
  selfHost: string,
): Beacon | null {
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) return null;
  const b = parsed.data;
  const path = normalizePath(b.path, slugs);
  if (b.t === "pv")
    return { t: "pv", path, referrer: normalizeReferrer(b.referrer ?? "", selfHost) };

  const sections: EngageBeacon["sections"] = {};
  for (const [name, ms] of Object.entries(b.sections ?? {}))
    if (isSection(name)) sections[name] = ms;

  const events: Record<string, number> = {};
  for (const { n, p } of b.events ?? []) {
    if (!isEvent(n)) continue;
    const key = p && (PROPS.includes(p) || slugs.includes(p)) ? `${n}:${p}` : n;
    events[key] = (events[key] ?? 0) + 1;
  }
  return { t: "eng", path, ms: b.ms, sections, events };
}

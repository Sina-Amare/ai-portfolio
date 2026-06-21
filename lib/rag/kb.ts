import type { KnowledgeBase } from "./types";
import { EMBED } from "./embed";
import kbJson from "@/lib/kb.json";

const kb = kbJson as KnowledgeBase;

// Fail fast if the committed kb.json was built with a different embedding model/dim.
if (kb.model !== EMBED.model || kb.dim !== EMBED.dim) {
  throw new Error(
    `kb.json was built with ${kb.model}@${kb.dim}d but runtime expects ${EMBED.model}@${EMBED.dim}d. Re-run \`npm run embed\`.`,
  );
}

export function getKnowledgeBase(): KnowledgeBase {
  return kb;
}

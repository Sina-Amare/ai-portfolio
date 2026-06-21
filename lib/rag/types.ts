/** Output of the chunker (build-time only). */
export type ParsedChunk = {
  id: string;
  source: string;
  section: string;
  text: string;
  /** The text actually sent to the embedding model (with a context breadcrumb). */
  embedInput: string;
};

/** A chunk persisted in lib/kb.json. */
export type KBChunk = {
  id: string;
  source: string;
  section: string;
  text: string;
  embedding: number[];
};

export type KnowledgeBase = {
  model: string;
  dim: number;
  version: number;
  count: number;
  chunks: KBChunk[];
};

export type ScoredChunk = { chunk: KBChunk; score: number };

export type RetrievedSource = { source: string; section: string };

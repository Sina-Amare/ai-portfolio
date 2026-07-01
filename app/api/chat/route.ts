import {
  consumeStream,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
  streamText,
  type FinishReason,
  type UIMessage,
} from "ai";
import { z } from "zod";
import type { Lang } from "@/lib/i18n";
import { getKnowledgeBase } from "@/lib/rag/kb";
import { embedText } from "@/lib/rag/embed";
import { retrieve, RETRIEVAL_TOP_K } from "@/lib/rag/retrieve";
import { isInScope } from "@/lib/rag/threshold";
import type { ScoredChunk } from "@/lib/rag/types";
import {
  buildSystemPrompt,
  detectSmallTalk,
  errorMessage,
  greetingMessage,
  isAbusive,
  rateLimitMessage,
  refusalMessage,
  sanitizeInput,
  thanksMessage,
} from "@/lib/rag/prompt";
import { chatLadder } from "@/lib/rag/providers";
import { answerCache, embedCache, normalizeQuery } from "@/lib/rag/cache";
import { getClientIp, globalDailyOk, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BodySchema = z.object({
  messages: z.array(z.any()).min(1).max(40),
  lang: z.enum(["en", "fa"]).default("en"),
});

type Source = { source: string; section: string };
const COMPLETE_FINISH_REASONS = new Set<FinishReason>(["stop"]);

function isCompleteFinish(reason: FinishReason | "unknown"): reason is FinishReason {
  return COMPLETE_FINISH_REASONS.has(reason as FinishReason);
}

function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { "content-type": "application/json" },
  });
}

function userText(m: UIMessage): string {
  return (m.parts ?? [])
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join(" ")
    .trim();
}

function lastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return userText(messages[i]);
  }
  return "";
}

/**
 * Build the retrieval query from the last up-to-two user turns, so short
 * follow-ups ("and the challenges?", "tell me more") still retrieve the right
 * context instead of embedding to nothing and getting wrongly refused.
 */
function retrievalQuery(messages: UIMessage[]): string {
  const turns: string[] = [];
  for (let i = messages.length - 1; i >= 0 && turns.length < 2; i--) {
    if (messages[i].role !== "user") continue;
    const t = userText(messages[i]);
    if (t) turns.unshift(t);
  }
  return turns.join(" ");
}

function dedupeSources(scored: ScoredChunk[]): Source[] {
  const seen = new Set<string>();
  const out: Source[] = [];
  for (const s of scored) {
    const key = `${s.chunk.source}|${s.chunk.section}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ source: s.chunk.source, section: s.chunk.section });
  }
  return out.slice(0, 4);
}

/** Fake-stream a deterministic message over the same UI-message protocol (no LLM call). */
function cannedResponse(text: string) {
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const id = "0";
      writer.write({ type: "text-start", id });
      for (const word of text.split(/(\s+)/)) {
        if (word) writer.write({ type: "text-delta", id, delta: word });
        await new Promise((r) => setTimeout(r, 12));
      }
      writer.write({ type: "text-end", id });
    },
  });
  return createUIMessageStreamResponse({ stream });
}

/** Fake-stream a cached answer with its sources — instant first token, no LLM. */
function cachedResponse(text: string, sources: Source[]) {
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const id = "0";
      writer.write({ type: "text-start", id });
      for (const word of text.split(/(\s+)/)) {
        if (word) writer.write({ type: "text-delta", id, delta: word });
        await new Promise((r) => setTimeout(r, 8));
      }
      writer.write({ type: "text-end", id });
      writer.write({ type: "data-sources", id: "sources", data: sources });
    },
  });
  return createUIMessageStreamResponse({ stream });
}

function chatStreamResponse(stream: ReadableStream) {
  return createUIMessageStreamResponse({
    stream,
    consumeSseStream: consumeStream,
    headers: { "X-Accel-Buffering": "no" },
  });
}

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) return badRequest("Invalid request body");
  const { messages, lang } = parsed.data as { messages: UIMessage[]; lang: Lang };

  // Abuse protection: per-IP rate limit.
  const rl = rateLimit(getClientIp(req));
  if (!rl.ok) return cannedResponse(rateLimitMessage(lang));

  const question = sanitizeInput(lastUserText(messages));
  if (!question) return badRequest("Empty message");

  // Red flag: jailbreak / prompt-injection pre-filter (instant, no LLM).
  if (isAbusive(question)) return cannedResponse(refusalMessage(lang));

  // Small talk — answered warmly with no LLM call (and before retrieval), so a
  // greeting or a "thanks" never trips the relevance gate. Fires ONLY when the
  // message is nothing but a pleasantry; "hey, what did you build at Dekamond?"
  // and the colloquial-Persian "چطوری X رو ساختی؟" fall through to real RAG.
  const smallTalk = detectSmallTalk(question);
  if (smallTalk === "thanks") return cannedResponse(thanksMessage(lang));
  if (smallTalk === "greeting" || smallTalk === "capability")
    return cannedResponse(greetingMessage(lang));

  // Global daily cap → degrade gracefully to protect free-tier quota.
  if (!globalDailyOk()) return cannedResponse(refusalMessage(lang));

  // Answer cache (first-turn only): an identical question — e.g. a suggested
  // chip — is served instantly with the same grounded answer, skipping the
  // embedding call and the LLM entirely.
  const firstTurn = messages.length === 1;
  const cacheKey = `${lang}:${normalizeQuery(question)}`;
  if (firstTurn) {
    const hit = answerCache.get(cacheKey);
    if (hit) return cachedResponse(hit.text, hit.sources);
  }

  // Retrieve from the knowledge base — using the conversation-aware query so
  // follow-up questions keep their context.
  let scored: ScoredChunk[];
  let queryEmbedding: number[] = [];
  try {
    const query = sanitizeInput(retrievalQuery(messages)) || question;
    const normQuery = normalizeQuery(query);
    const cached = embedCache.get(normQuery);
    queryEmbedding = cached ?? (await embedText(query, "RETRIEVAL_QUERY", req.signal));
    if (!cached) embedCache.set(normQuery, queryEmbedding);
    scored = retrieve(getKnowledgeBase().chunks, queryEmbedding, RETRIEVAL_TOP_K);
  } catch {
    return cannedResponse(errorMessage(lang));
  }

  // Semantic answer cache (first-turn only): a *paraphrase* of an already-
  // answered question — e.g. "what is ScrapeGPT" vs "tell me about ScrapeGPT" —
  // is served from the same grounded answer, instantly, with no LLM call. The
  // high threshold keeps it to genuine restatements, never a different question.
  if (firstTurn) {
    const near = answerCache.findSimilar(queryEmbedding, 0.94, `${lang}:`);
    if (near) return cachedResponse(near.text, near.sources);
  }

  // Relevance gate — instant refusal for clearly off-topic asks, NO LLM call,
  // so latency and the LLM quota are protected. Greetings/small-talk were
  // already handled with a fast canned reply above, so this only fires for
  // genuinely out-of-scope questions.
  if (!isInScope(scored)) return cannedResponse(refusalMessage(lang));

  const system = buildSystemPrompt(lang, scored);
  const sources = dedupeSources(scored);
  const cleaned = messages
    .map((m) => ({
      ...m,
      parts: (m.parts ?? []).filter((p) => p.type === "text"),
    }))
    .filter((m) => m.parts.length > 0);
  const modelMessages = await convertToModelMessages(cleaned);
  const ladder = chatLadder(lang);
  if (ladder.length === 0) return cannedResponse(errorMessage(lang));

  const stream = createUIMessageStream({
    onError: () => errorMessage(lang),
    execute: async ({ writer }) => {
      const id = "0";
      let started = false;
      let full = "";

      for (const provider of ladder) {
        try {
          const result = streamText({
            model: provider.model,
            system,
            messages: modelMessages,
            temperature: 0.5,
            maxOutputTokens: 2200,
            // The ladder below IS our retry strategy: on a 503 / rate-limit we
            // want to fail over to the next key/model immediately, not let the
            // SDK burn ~2 backoff retries re-hitting the same struggling (or
            // already-exhausted) endpoint first. That per-provider stall is what
            // makes Persian feel like it hangs during a Gemini demand spike.
            // (The client also auto-retries the whole request, so a transient
            // blip still gets a second full pass.)
            maxRetries: 0,
            // Gemini 2.5 counts "thinking" tokens against maxOutputTokens — left
            // on, the model can spend its whole budget thinking and truncate the
            // visible answer mid-sentence. We want fast, direct replies here, so
            // turn it off. Groq/OpenRouter ignore the google namespace.
            providerOptions: {
              google: { thinkingConfig: { thinkingBudget: 0 } },
            },
            abortSignal: req.signal,
            timeout: 45_000,
            experimental_transform: smoothStream({ chunking: "word", delayInMs: 4 }),
          });

          for await (const delta of result.textStream) {
            if (!started) {
              writer.write({ type: "text-start", id });
              started = true;
            }
            full += delta;
            writer.write({ type: "text-delta", id, delta });
          }

          if (started) {
            const finishReason: FinishReason | "unknown" = await Promise.resolve(
              result.finishReason,
            ).catch(() => "unknown" as const);
            writer.write({ type: "text-end", id });

            if (!isCompleteFinish(finishReason)) {
              writer.write({ type: "error", errorText: errorMessage(lang) });
              return;
            }

            // Sources go LAST so the "thinking" indicator stays until real text
            // arrives (avoids an empty message during the model's time-to-first-token).
            writer.write({ type: "data-sources", id: "sources", data: sources });
            if (firstTurn && full.trim()) {
              answerCache.set(cacheKey, { text: full, sources, embedding: queryEmbedding });
            }
            return; // success
          }
          // Provider produced no text → fall through to the next one.
        } catch {
          if (started) {
            writer.write({ type: "text-end", id });
            writer.write({ type: "error", errorText: errorMessage(lang) });
            return; // partial answer already sent — stop here
          }
          // No text yet → try the next provider in the ladder.
        }
      }

      // Every provider failed before producing text → graceful fallback.
      if (!started) {
        const eid = "err";
        writer.write({ type: "text-start", id: eid });
        for (const word of errorMessage(lang).split(/(\s+)/)) {
          if (word) writer.write({ type: "text-delta", id: eid, delta: word });
        }
        writer.write({ type: "text-end", id: eid });
      }
    },
  });

  return chatStreamResponse(stream);
}

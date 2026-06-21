import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  smoothStream,
  streamText,
  type UIMessage,
} from "ai";
import { z } from "zod";
import type { Lang } from "@/lib/i18n";
import { getKnowledgeBase } from "@/lib/rag/kb";
import { embedText } from "@/lib/rag/embed";
import { retrieve } from "@/lib/rag/retrieve";
import { isInScope } from "@/lib/rag/threshold";
import type { ScoredChunk } from "@/lib/rag/types";
import {
  buildSystemPrompt,
  errorMessage,
  isAbusive,
  rateLimitMessage,
  refusalMessage,
  sanitizeInput,
} from "@/lib/rag/prompt";
import { chatLadder } from "@/lib/rag/providers";
import { getClientIp, globalDailyOk, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BodySchema = z.object({
  messages: z.array(z.any()).min(1).max(40),
  lang: z.enum(["en", "fa"]).default("en"),
});

type Source = { source: string; section: string };

function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { "content-type": "application/json" },
  });
}

function lastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role !== "user") continue;
    return (m.parts ?? [])
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join(" ");
  }
  return "";
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

  // Guard 3: jailbreak / prompt-injection pre-filter (instant, no LLM).
  if (isAbusive(question)) return cannedResponse(refusalMessage(lang));

  // Global daily cap → degrade gracefully to protect free-tier quota.
  if (!globalDailyOk()) return cannedResponse(refusalMessage(lang));

  // Retrieve from the knowledge base.
  let scored: ScoredChunk[];
  try {
    const queryEmbedding = await embedText(question, "RETRIEVAL_QUERY", req.signal);
    scored = retrieve(getKnowledgeBase().chunks, queryEmbedding, 5);
  } catch {
    return cannedResponse(errorMessage(lang));
  }

  // Guard 1: relevance threshold gate → instant refusal, NO LLM call.
  if (!isInScope(scored)) return cannedResponse(refusalMessage(lang));

  // Guard 2: grounded prompt + provenance, then stream with provider failover.
  const system = buildSystemPrompt(lang, scored);
  const sources = dedupeSources(scored);
  const cleaned = messages
    .map((m) => ({
      ...m,
      parts: (m.parts ?? []).filter((p) => p.type === "text"),
    }))
    .filter((m) => m.parts.length > 0);
  const modelMessages = await convertToModelMessages(cleaned);
  const ladder = chatLadder();
  if (ladder.length === 0) return cannedResponse(errorMessage(lang));

  const stream = createUIMessageStream({
    onError: () => errorMessage(lang),
    execute: async ({ writer }) => {
      writer.write({ type: "data-sources", id: "sources", data: sources });

      const id = "0";
      let started = false;

      for (const provider of ladder) {
        try {
          const result = streamText({
            model: provider.model,
            system,
            messages: modelMessages,
            temperature: 0.3,
            maxOutputTokens: 700,
            abortSignal: req.signal,
            experimental_transform: smoothStream({ chunking: "word", delayInMs: 12 }),
          });

          for await (const delta of result.textStream) {
            if (!started) {
              writer.write({ type: "text-start", id });
              started = true;
            }
            writer.write({ type: "text-delta", id, delta });
          }

          if (started) {
            writer.write({ type: "text-end", id });
            return; // success
          }
          // Provider produced no text → fall through to the next one.
        } catch {
          if (started) {
            writer.write({ type: "text-end", id });
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

  return createUIMessageStreamResponse({
    stream,
    headers: { "X-Accel-Buffering": "no" },
  });
}

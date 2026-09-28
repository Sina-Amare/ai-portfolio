import {
  APICallError,
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
import { detectDir, ui, type Lang } from "@/lib/i18n";
import { getKnowledgeBase } from "@/lib/rag/kb";
import { embedText } from "@/lib/rag/embed";
import { lexicalTurn } from "@/lib/rag/lexical";
import { messageText, rankTurn, retrievalQuery, RETRIEVAL_TOP_K } from "@/lib/rag/retrieve";
import { LEXICAL_THRESHOLD, RELEVANCE_THRESHOLD } from "@/lib/rag/threshold";
import type { ScoredChunk } from "@/lib/rag/types";
import {
  buildSystemPrompt,
  busyMessage,
  errorMessage,
  LEAK_MARKERS,
  rateLimitMessage,
  sanitizeInput,
} from "@/lib/rag/prompt";
import { cannedReply, classifyIntent, isAttack, scrubHistory } from "@/lib/rag/intent";
import { chatLadder, type ChatProvider } from "@/lib/rag/providers";
import { answerCache, embedCache, normalizeQuery, SEMANTIC_CACHE_THRESHOLD } from "@/lib/rag/cache";
import { getClientIp, globalDailyOk, rateLimit } from "@/lib/rate-limit";
import { noteChat, type ChatOutcome, type ChatTurn } from "@/lib/analytics/session";

// The chatbot explains this pipeline (gate, layers, tests) to visitors:
// update content/chatbot.md when it changes.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * One time budget for the whole request, shared by the embedding call and every
 * ladder rung, so the graceful fallback is always written before Vercel kills
 * the function at maxDuration.
 */
const DEADLINE_MS = 50_000;

// Only the shape the UI actually sends. A forged "system" turn or a null entry
// is a 400 and never reaches the model; extra fields (providerMetadata, …) are
// stripped here, and the turns are rebuilt from their text alone below.
const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  parts: z.array(z.object({ type: z.string(), text: z.string().optional() })),
});
const BodySchema = z.object({
  // No max: useChat re-sends the whole conversation every turn, so a cap here
  // kills long chats. The server keeps only the recent turns instead.
  messages: z.array(MessageSchema).min(1),
  lang: z.enum(["en", "fa"]).default("en"),
  // Sent by useChat; "regenerate-message" must produce a fresh answer.
  trigger: z.string().optional(),
});

/**
 * The answer cache exists for the suggestion chips (and paraphrases of them), so
 * only chip answers are ever WRITTEN. Otherwise one crafted question could seed
 * the answer other visitors are served for hours.
 */
const CHIP_QUESTIONS = new Set(
  [...ui.en.suggestions, ...ui.fa.suggestions].map((q) => normalizeQuery(q)),
);

/**
 * Rungs that just answered 429 sit out for a minute, so every request doesn't
 * re-probe an exhausted key before reaching one that works. Per instance.
 */
const COOLDOWN_MS = 60_000;
const cooledUntil = new Map<string, number>();

/** Turns the model sees; older ones are dropped server-side. */
const MAX_HISTORY = 12;
const MAX_ASSISTANT_CHARS = 4000;

/**
 * Streamed text is held back by this many characters, so a leak marker split
 * across chunks is caught before any of it reaches the visitor.
 */
const LEAK_LOOKAHEAD = Math.max(...LEAK_MARKERS.map((m) => m.length)) - 1;

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

/**
 * Rebuild each turn from its text alone, capped per role: earlier turns get the
 * same length limit as the question, and no client-set field survives.
 */
function toUIMessages(messages: z.infer<typeof MessageSchema>[]): UIMessage[] {
  const out: UIMessage[] = [];
  messages.forEach((m, i) => {
    const text = m.parts
      .filter((p) => p.type === "text")
      .map((p) => p.text ?? "")
      .join(" ");
    const capped =
      m.role === "user" ? sanitizeInput(text) : text.trim().slice(0, MAX_ASSISTANT_CHARS);
    if (capped) out.push({ id: String(i), role: m.role, parts: [{ type: "text", text: capped }] });
  });
  // Trimming can leave an assistant turn first; providers expect a user turn to open.
  const first = out.findIndex((m) => m.role === "user");
  return first < 0 ? [] : out.slice(first);
}

function lastUserText(messages: UIMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "user") return messageText(messages[i]);
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

/**
 * Fake-stream a cached answer with its sources — instant first token, no LLM.
 * Paced like the live path's smoothStream (4ms per word, none per space), so
 * the fast path never feels slower than a fresh answer.
 */
function cachedResponse(text: string, sources: Source[]) {
  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      const id = "0";
      writer.write({ type: "text-start", id });
      for (const word of text.split(/(\s+)/)) {
        if (word) writer.write({ type: "text-delta", id, delta: word });
        if (word.trim()) await new Promise((r) => setTimeout(r, 4));
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

/** A reply's chips, as source labels. */
const labels = (sources: Source[]) => [...new Set(sources.map((s) => s.source))];

export async function POST(req: Request) {
  const t0 = Date.now();
  const deadline = t0 + DEADLINE_MS;
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = BodySchema.safeParse(raw);
  if (!parsed.success) return badRequest("Invalid request body");
  // Counted before trimming: the answer cache is for a conversation's opening question.
  const firstTurn = parsed.data.messages.length === 1;
  // Regenerate resends the same opening question; serving the cache would just
  // replay the answer the visitor asked to replace.
  const readCache = firstTurn && parsed.data.trigger !== "regenerate-message";
  const messages = toUIMessages(parsed.data.messages.slice(-MAX_HISTORY));
  const question = sanitizeInput(lastUserText(messages));
  // A question typed in Persian script gets a Persian answer whatever the toggle
  // says (prompt, ladder and cache key all follow). Finglish is Latin script, so
  // it stays with the toggle.
  const lang: Lang = detectDir(question) === "rtl" ? "fa" : parsed.data.lang;

  // Abuse protection: per-IP rate limit. Not logged: a flood would fill /admin's log.
  const rl = rateLimit(getClientIp(req));
  if (!rl.ok) return cannedResponse(rateLimitMessage(lang));

  if (!question) return badRequest("Empty message");

  // /admin gets each turn once, on every path that replies: its outcome, topic (the
  // KB source retrieval leaned on most) and chip-or-typed as aggregates, and the
  // question with the reply exactly as shown, kept 30 days (decision 003).
  const chip = CHIP_QUESTIONS.has(normalizeQuery(question));
  let topic: string | undefined;
  // Set when the embedding call failed and retrieval fell back to keywords.
  let lexical = false;
  const note = (outcome: ChatOutcome, reply: string, turn: Partial<ChatTurn> = {}) => {
    try {
      noteChat(
        req,
        { outcome, topic, chip },
        {
          question,
          reply,
          lang,
          ms: Date.now() - t0,
          ...(lexical && { retrieval: "lexical" as const }),
          ...turn,
        },
      );
    } catch {
      // Analytics never breaks the chat, least of all mid-stream.
    }
  };

  // Canned wordings rotate: the same question gets the same one, a repeat later
  // in the chat gets another.
  const seed = `${normalizeQuery(question)}#${parsed.data.messages.length}`;

  // Layer 1 (lib/rag/intent.ts): injection, prompt extraction, encoded text and
  // free-ChatGPT tasks get a clapback; small talk a warm reply, but only when it
  // is the whole message ("hey, what did you build at Dekamond?" reaches RAG).
  // No embedding, no LLM, and a greeting never trips the relevance gate. After
  // the first turn, "yes" may answer the last reply's question, so it goes on.
  const intent = classifyIntent(question, !firstTurn);
  if (intent) {
    const reply = cannedReply(intent, lang, seed);
    note(isAttack(intent) ? "refused" : "smalltalk", reply, { intent });
    return cannedResponse(reply);
  }
  // The client sends the whole chat, so an attack from earlier turns (or a forged
  // assistant turn agreeing to one) is dropped before retrieval and the model.
  const history = scrubHistory(messages);

  // Answer cache (first-turn only): an identical question — e.g. a suggested
  // chip — is served instantly with the same grounded answer, skipping the
  // embedding call and the LLM entirely.
  const cacheKey = `${lang}:${normalizeQuery(question)}`;
  if (readCache) {
    const hit = answerCache.get(cacheKey);
    if (hit) {
      topic = hit.sources[0]?.source;
      note("cached", hit.text, { sources: labels(hit.sources) });
      return cachedResponse(hit.text, hit.sources);
    }
  }

  // Retrieve from the knowledge base with the question alone and, after the
  // first turn, the conversation-aware query too (in parallel), so a follow-up
  // keeps its project and a change of topic still finds its own notes.
  const chunks = getKnowledgeBase().chunks;
  const conversation = sanitizeInput(retrievalQuery(history)) || question;
  let scored: ScoredChunk[];
  let score: number;
  let queryEmbedding: number[] = [];
  const embedQuery = async (query: string) => {
    const normQuery = normalizeQuery(query);
    const cached = embedCache.get(normQuery);
    const embedding = cached ?? (await embedText(query, "RETRIEVAL_QUERY", req.signal));
    if (!cached) embedCache.set(normQuery, embedding);
    return embedding;
  };
  try {
    const [alone, chat] = await Promise.all([
      embedQuery(question),
      conversation === question ? null : embedQuery(conversation),
    ]);
    queryEmbedding = alone;
    ({ scored, score } = rankTurn(chunks, question, alone, chat, RETRIEVAL_TOP_K));
  } catch (err) {
    if (req.signal.aborted) {
      note("error", errorMessage(lang));
      return cannedResponse(errorMessage(lang));
    }
    // Embeddings down (the day's quota spent, every key refused, a timeout): the
    // answer ladder may still work, so retrieve by keywords over the same chunks,
    // behind their own gate (incident 2026-09-27). Status and message only.
    const message = err instanceof Error ? err.message.replace(/\s+/g, " ") : "unknown error";
    console.warn(`[chat] embedding failed → lexical fallback: ${message}`);
    lexical = true;
    ({ scored, score } = lexicalTurn(chunks, question, conversation, RETRIEVAL_TOP_K));
  }

  // Semantic answer cache (first-turn only): a *paraphrase* of an already-
  // answered question — e.g. "what is ScrapeGPT" vs "tell me about ScrapeGPT" —
  // is served from the same grounded answer, instantly, with no LLM call. The
  // high threshold keeps it to genuine restatements, never a different question.
  // The lexical fallback has no vector to compare.
  if (readCache && !lexical) {
    const near = answerCache.findSimilar(queryEmbedding, SEMANTIC_CACHE_THRESHOLD, `${lang}:`);
    if (near) {
      topic = near.sources[0]?.source;
      note("cached", near.text, { sources: labels(near.sources) });
      return cachedResponse(near.text, near.sources);
    }
  }

  // Relevance gate — instant refusal for clearly off-topic asks, NO LLM call,
  // so latency and the LLM quota are protected. Greetings/small-talk were
  // already handled with a fast canned reply above, so this only fires for
  // genuinely out-of-scope questions. Keyword scores have their own scale.
  if (score < (lexical ? LEXICAL_THRESHOLD : RELEVANCE_THRESHOLD)) {
    const reply = cannedReply("offtopic", lang, seed);
    // No topic: the nearest chunk of an off-topic question is noise.
    note("refused", reply, { intent: "offtopic" });
    return cannedResponse(reply);
  }
  topic = scored[0]?.chunk.source;

  // Global daily cap on LLM calls, checked last so cache hits, small talk and
  // refusals never spend it. Past it, say so honestly — the question is fine.
  if (!(await globalDailyOk())) {
    note("capped", busyMessage(lang));
    return cannedResponse(busyMessage(lang));
  }

  const system = buildSystemPrompt(lang, scored);
  const sources = dedupeSources(scored);
  const modelMessages = await convertToModelMessages(history);
  const all = chatLadder(lang);
  if (all.length === 0) {
    note("error", errorMessage(lang));
    return cannedResponse(errorMessage(lang));
  }
  // Cooled rungs go last rather than away: skipped while anything else works,
  // still tried before the visitor gets the error message.
  const cooled = (p: ChatProvider) => (cooledUntil.get(p.id) ?? 0) > Date.now();
  const ladder = [...all.filter((p) => !cooled(p)), ...all.filter(cooled)];

  const stream = createUIMessageStream({
    onError: () => errorMessage(lang),
    execute: async ({ writer }) => {
      const id = "0";
      let started = false;
      let shown = ""; // everything the visitor has been sent, for the log
      const send = (delta: string) => {
        if (!started) {
          writer.write({ type: "text-start", id });
          started = true;
        }
        writer.write({ type: "text-delta", id, delta });
        shown += delta;
      };

      for (const provider of ladder) {
        const left = deadline - Date.now();
        if (left < 1_000) break; // out of time → the fallback below
        // streamText reports provider errors here, not by throwing.
        let failure: unknown;
        let full = ""; // this rung's answer only: a failed rung's unsent text never prefixes it
        try {
          const result = streamText({
            onError: ({ error }) => {
              failure = error;
              // Which rung, its status and message only: the error object carries the
              // request body, i.e. the visitor's question, which must not reach the logs.
              const status = APICallError.isInstance(error) ? ` ${error.statusCode}` : "";
              const message = error instanceof Error ? error.message : "unknown error";
              console.error(`[chat] ${provider.id} failed${status}: ${message}`);
            },
            model: provider.model,
            system,
            messages: modelMessages,
            // Backstop to the schema: a system turn in history is an error, not a prompt.
            allowSystemInMessages: false,
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
            // Gemini counts "thinking" tokens against maxOutputTokens — left on, the
            // model can spend its budget thinking and truncate the visible answer.
            // Gemini 3 takes a thinking *level*: 3.5 Flash-Lite rejects the old
            // `thinkingBudget: 0` with a 400, and "minimal" gave every rung its first
            // token in ~2.5 s (2026-09-27). Groq/OpenRouter ignore the google namespace.
            providerOptions: {
              google: { thinkingConfig: { thinkingLevel: "minimal" } },
            },
            abortSignal: req.signal,
            // The rest of the budget; once streaming, a 10s gap between chunks
            // counts as a dead rung so the ladder moves on.
            timeout: { totalMs: left, chunkMs: 10_000 },
            experimental_transform: smoothStream({ chunking: "word", delayInMs: 4 }),
          });

          // Leak guard (layer 4): a model echoing its instructions ends the answer.
          // The last LEAK_LOOKAHEAD characters wait for the next chunk, so no part
          // of a marker is ever sent. An answer under way keeps its text up to the
          // marker; one that opens with the echo becomes just the clapback.
          let held = "";
          let leak: string | undefined;
          for await (const delta of result.textStream) {
            full += delta;
            held += delta;
            leak = LEAK_MARKERS.find((m) => held.includes(m));
            if (leak) break;
            if (held.length > LEAK_LOOKAHEAD) {
              send(held.slice(0, -LEAK_LOOKAHEAD));
              held = held.slice(-LEAK_LOOKAHEAD);
            }
          }
          if (leak) {
            console.warn(`[chat] leak-guard: ${provider.id} echoed "${leak}"`);
            const before = held.slice(0, held.indexOf(leak)).trimEnd();
            if (started && before) send(before);
            const clapback = cannedReply("extraction", lang, seed);
            send(started ? `\n\n${clapback}` : clapback);
            writer.write({ type: "text-end", id });
            // No sources, no cache write.
            note("refused", shown, { intent: "extraction", provider: provider.id });
            return;
          }
          if (held) send(held);

          if (started) {
            const finishReason: FinishReason | "unknown" = await Promise.resolve(
              result.finishReason,
            ).catch(() => "unknown" as const);
            writer.write({ type: "text-end", id });

            if (!isCompleteFinish(finishReason)) {
              writer.write({ type: "error", errorText: errorMessage(lang) });
              note("error", shown, { provider: provider.id, partial: true });
              return;
            }

            // Sources go LAST so the "thinking" indicator stays until real text
            // arrives (avoids an empty message during the model's time-to-first-token).
            writer.write({ type: "data-sources", id: "sources", data: sources });
            // A keyword-grounded answer isn't pinned for hours after embeddings recover.
            if (
              !lexical &&
              firstTurn &&
              full.trim() &&
              CHIP_QUESTIONS.has(normalizeQuery(question))
            ) {
              answerCache.set(cacheKey, { text: full, sources, embedding: queryEmbedding });
            }
            note("answered", shown, { sources: labels(sources), provider: provider.id });
            return; // success
          }
          // Provider produced no text → fall through to the next one.
        } catch (err) {
          if (started) {
            writer.write({ type: "text-end", id });
            writer.write({ type: "error", errorText: errorMessage(lang) });
            note("error", shown, { provider: provider.id, partial: true });
            return; // partial answer already sent — stop here
          }
          failure = err; // No text yet → try the next provider in the ladder.
        }
        // A 429 means this key/model is out of quota or rate-limited: rest it.
        if (APICallError.isInstance(failure) && failure.statusCode === 429) {
          cooledUntil.set(provider.id, Date.now() + COOLDOWN_MS);
        }
      }

      // Every provider failed before producing text → graceful fallback.
      note("error", errorMessage(lang));
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

// @vitest-environment node
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { POST } from "@/app/api/contact/route";

let ip = 0;
const fetchMock = vi.fn(
  async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
);

function call(body: unknown, fixedIp?: string) {
  return POST(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-forwarded-for": fixedIp ?? `20.0.0.${ip++}`,
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

const valid = {
  name: "Jane Recruiter",
  email: "jane@acme.com",
  message: "Loved your RAG work — are you free to chat next week?",
};

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockClear();
  process.env.TELEGRAM_BOT_TOKEN = "test-token";
  process.env.TELEGRAM_CHAT_ID = "123456";
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("POST /api/contact", () => {
  it("rejects malformed JSON with 400", async () => {
    const res = await call("not json");
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects a missing message with 400", async () => {
    const res = await call({ name: "Jane", email: "jane@acme.com" });
    expect(res.status).toBe(400);
  });

  it("rejects an invalid email with 400", async () => {
    const res = await call({ ...valid, email: "not-an-email" });
    expect(res.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("silently accepts (200) but does NOT send when the honeypot is filled", async () => {
    const res = await call({ ...valid, company: "spam-bot" });
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("delivers a valid message to Telegram with the configured chat id", async () => {
    const res = await call(valid);
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain("/bottest-token/sendMessage");
    const payload = JSON.parse(init.body as string);
    expect(payload.chat_id).toBe("123456");
    expect(payload.text).toContain("Jane Recruiter");
    expect(payload.text).toContain("jane@acme.com");
  });

  it("escapes HTML in user input before sending", async () => {
    await call({ ...valid, name: "<script>x</script>" });
    const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    const payload = JSON.parse(init.body as string);
    expect(payload.text).toContain("&lt;script&gt;");
    expect(payload.text).not.toContain("<script>");
  });

  it("returns 503 when the Telegram channel is not configured", async () => {
    delete process.env.TELEGRAM_BOT_TOKEN;
    delete process.env.TELEGRAM_CHAT_ID;
    const res = await call(valid);
    expect(res.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never leaks the bot token in the response body", async () => {
    const res = await call(valid);
    const text = await res.text();
    expect(text).not.toContain("test-token");
  });

  it("rate-limits repeated submissions from the same IP", async () => {
    const sameIp = "20.9.9.9";
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++) {
      const res = await call(valid, sameIp);
      statuses.push(res.status);
    }
    expect(statuses).toContain(429);
  });
});

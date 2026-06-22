import { z } from "zod";
import { contactRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 15;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z
    .string()
    .trim()
    .max(160)
    .refine((v) => EMAIL_RE.test(v), "A valid email is required"),
  contact: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(1, "Message is required").max(3000),
  // Honeypot — real users never see or fill this. Bots do.
  company: z.string().max(200).optional().default(""),
});

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

/** Escape the few characters that matter for Telegram's HTML parse mode. */
function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(req: Request) {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const parsed = ContactSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Please check the form.";
    return json({ error: first }, 400);
  }
  const { name, email, contact, message, company } = parsed.data;

  // Honeypot tripped → pretend success, send nothing.
  if (company.trim()) return json({ ok: true }, 200);

  const ip = getClientIp(req);
  const rl = contactRateLimit(ip);
  if (!rl.ok) {
    return json(
      { error: "Too many messages — please try again in a few minutes." },
      429,
    );
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return json(
      { error: "The contact channel isn't configured yet. Please email me directly." },
      503,
    );
  }

  const text =
    `📨 <b>New Contact Form Message</b>\n\n` +
    `👤 <b>Name:</b> ${esc(name)}\n` +
    `📧 <b>Email:</b> ${esc(email)}\n` +
    (contact ? `📱 <b>Reach via:</b> ${esc(contact)}\n` : "") +
    `\n💬 <b>Message:</b>\n${esc(message)}\n` +
    `\n———\n🌐 Portfolio Contact Form`;

  try {
    const tg = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!tg.ok) {
      return json(
        { error: "Couldn't deliver the message. Please email me directly." },
        502,
      );
    }
    return json({ ok: true }, 200);
  } catch {
    return json(
      { error: "Network error while sending. Please try again or email me." },
      502,
    );
  }
}

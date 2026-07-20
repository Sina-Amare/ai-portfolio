import { getClientIp, contactRateLimit } from "@/lib/rate-limit";
import { loginAllowed } from "@/lib/analytics/limit";
import {
  adminConfigured,
  clearedCookie,
  createSessionToken,
  passwordMatches,
  sessionCookie,
} from "@/lib/analytics/auth";

export const runtime = "nodejs";

/** Exchange the shared password for a signed session cookie. */
export async function POST(req: Request) {
  if (!adminConfigured()) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }
  // Two layers. The in-memory one is instant but per-lambda; the Redis one is
  // shared across instances and survives cold starts, which is what actually
  // stops a parallel brute-force (each fresh instance would otherwise hand out
  // its own budget). It also caps attempts globally, so spreading the guessing
  // across many IPs doesn't sidestep the per-IP counter.
  const ip = getClientIp(req);
  if (!contactRateLimit(ip).ok || !(await loginAllowed(ip))) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: unknown };
    password = typeof body.password === "string" ? body.password : "";
  } catch {
    return Response.json({ error: "bad_request" }, { status: 400 });
  }

  if (!passwordMatches(password)) {
    return Response.json({ error: "invalid" }, { status: 401 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "set-cookie": sessionCookie(createSessionToken()),
    },
  });
}

/** Sign out. */
export async function DELETE() {
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "content-type": "application/json", "set-cookie": clearedCookie() },
  });
}

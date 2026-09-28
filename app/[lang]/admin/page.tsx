import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Container } from "@/components/ui/container";
import { Dashboard } from "@/components/analytics/dashboard";
import { LoginForm } from "@/components/analytics/login-form";
import { SignOut } from "@/components/analytics/sign-out";
import { ADMIN_COOKIE, adminConfigured, verifySessionToken } from "@/lib/analytics/auth";
import { CONV_MAX, CONV_SHOWN, getConversations, getInsights } from "@/lib/analytics/insights";
import { analyticsEnabled } from "@/lib/analytics/store";
import { toLocale } from "@/lib/locale";
import { pageCopy } from "@/lib/page-copy";

// Never cache or prerender: it's per-request, authenticated, and always live.
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ range?: string; conv?: string; chat?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: pageCopy[toLocale((await params).lang)].admin.meta,
    robots: { index: false, follow: false },
  };
}

const ALLOWED_RANGES = [7, 30, 90];

export default async function AdminPage({ params, searchParams }: Props) {
  const locale = toLocale((await params).lang);
  const p = pageCopy[locale].admin;
  const authed = verifySessionToken((await cookies()).get(ADMIN_COOKIE)?.value);
  // Only accept known ranges — the value sizes a Redis pipeline, so an arbitrary
  // ?range=100000 would turn one page load into a huge command burst.
  const query = await searchParams;
  const requested = Number(query.range);
  const range = ALLOWED_RANGES.includes(requested) ? requested : 30;
  // Conversations shown: each costs a visit-record read, so clamp it the same way.
  const conv = Math.min(CONV_MAX, Math.max(CONV_SHOWN, Math.floor(Number(query.conv)) || 0));
  const [data, chats] =
    authed && analyticsEnabled()
      ? await Promise.all([getInsights(range), getConversations(range, conv)])
      : [null, null];

  return (
    <section className="pt-28 pb-24 sm:pt-32">
      <Container>
        {!authed ? (
          <>
            <LoginForm />
            {!adminConfigured() && (
              <p className="text-muted mx-auto mt-4 max-w-sm text-center text-xs">{p.setup}</p>
            )}
          </>
        ) : (
          <>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <div className="eyebrow">{p.eyebrow}</div>
                <h1 className="text-gradient mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  {p.title}
                </h1>
              </div>
              <SignOut />
            </div>

            {data && chats ? (
              <Dashboard data={data} chats={chats} openChat={query.chat} locale={locale} />
            ) : (
              <div className="glass rounded-[var(--radius-card)] p-6">
                <h2 className="text-base font-semibold">{p.disconnected}</h2>
                <p className="text-muted mt-2 text-sm leading-relaxed">{p.disconnectedBody}</p>
              </div>
            )}
          </>
        )}
      </Container>
    </section>
  );
}

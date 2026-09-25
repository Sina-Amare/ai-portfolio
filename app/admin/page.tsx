import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Container } from "@/components/ui/container";
import { Dashboard } from "@/components/analytics/dashboard";
import { LoginForm } from "@/components/analytics/login-form";
import { SignOut } from "@/components/analytics/sign-out";
import { AdminLocaleRefresh } from "@/components/analytics/locale-refresh";
import {
  ADMIN_COOKIE,
  adminConfigured,
  verifySessionToken,
} from "@/lib/analytics/auth";
import { analyticsEnabled, getOverview } from "@/lib/analytics/store";
import { pageCopy } from "@/lib/page-copy";

// Never cache or prerender: it's per-request, authenticated, and always live.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await cookies()).get("locale")?.value === "fa" ? "fa" : "en";
  return {
    title: pageCopy[locale].admin.meta,
    robots: { index: false, follow: false },
  };
}

const ALLOWED_RANGES = [7, 30, 90];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("locale")?.value === "fa" ? "fa" : "en";
  const p = pageCopy[locale].admin;
  const authed = verifySessionToken(cookieStore.get(ADMIN_COOKIE)?.value);
  // Only accept known ranges — the value sizes a Redis pipeline, so an arbitrary
  // ?range=100000 would turn one page load into a huge command burst.
  const requested = Number((await searchParams).range);
  const range = ALLOWED_RANGES.includes(requested) ? requested : 30;

  return (
    <section className="pt-28 pb-24 sm:pt-32">
      <AdminLocaleRefresh />
      <Container>
        {!authed ? (
          <>
            <LoginForm />
            {!adminConfigured() && (
              <p className="text-muted mx-auto mt-4 max-w-sm text-center text-xs">
                {p.setup}
              </p>
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

            {analyticsEnabled() ? (
              <Dashboard data={await getOverview(range)} locale={locale} />
            ) : (
              <div className="glass rounded-[var(--radius-card)] p-6">
                <h2 className="text-base font-semibold">{p.disconnected}</h2>
                <p className="text-muted mt-2 text-sm leading-relaxed">
                  {p.disconnectedBody}
                </p>
              </div>
            )}
          </>
        )}
      </Container>
    </section>
  );
}

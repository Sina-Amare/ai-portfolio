import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Container } from "@/components/ui/container";
import { Dashboard } from "@/components/analytics/dashboard";
import { LoginForm } from "@/components/analytics/login-form";
import { SignOut } from "@/components/analytics/sign-out";
import { ADMIN_COOKIE, adminConfigured, verifySessionToken } from "@/lib/analytics/auth";
import { analyticsEnabled, getOverview } from "@/lib/analytics/store";

// Never cache or prerender: it's per-request, authenticated, and always live.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  // Keep it out of search results and the sitemap.
  robots: { index: false, follow: false },
};

const ALLOWED_RANGES = [7, 30, 90];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const authed = verifySessionToken((await cookies()).get(ADMIN_COOKIE)?.value);
  // Only accept known ranges — the value sizes a Redis pipeline, so an arbitrary
  // ?range=100000 would turn one page load into a huge command burst.
  const requested = Number((await searchParams).range);
  const range = ALLOWED_RANGES.includes(requested) ? requested : 30;

  return (
    <section className="pt-28 pb-24 sm:pt-32">
      <Container>
        {!authed ? (
          <>
            <LoginForm />
            {!adminConfigured() && (
              <p className="text-muted mx-auto mt-4 max-w-sm text-center text-xs">
                Set <code className="font-mono">ADMIN_PASSWORD</code> in your environment
                to enable this page.
              </p>
            )}
          </>
        ) : (
          <>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <div className="eyebrow">Analytics</div>
                <h1 className="text-gradient mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Site traffic
                </h1>
              </div>
              <SignOut />
            </div>

            {analyticsEnabled() ? (
              <Dashboard data={await getOverview(range)} />
            ) : (
              <div className="glass rounded-[var(--radius-card)] p-6">
                <h2 className="text-base font-semibold">Analytics isn&apos;t connected yet</h2>
                <p className="text-muted mt-2 text-sm leading-relaxed">
                  Add an Upstash Redis integration to this Vercel project (free tier), then
                  redeploy. The site keeps working exactly as it does now until you do —
                  the beacon simply no-ops without{" "}
                  <code className="font-mono">UPSTASH_REDIS_REST_URL</code> and{" "}
                  <code className="font-mono">UPSTASH_REDIS_REST_TOKEN</code>.
                </p>
              </div>
            )}
          </>
        )}
      </Container>
    </section>
  );
}

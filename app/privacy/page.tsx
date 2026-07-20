import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What this site measures, what it deliberately doesn't, and how long anything is kept.",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mt-10">
    <h2 className="eyebrow">{title}</h2>
    <div className="text-text mt-3 max-w-2xl space-y-3 leading-[1.75]">{children}</div>
  </section>
);

export default function PrivacyPage() {
  return (
    <section className="pt-28 pb-24 sm:pt-32">
      <Container>
        <div className="eyebrow">Privacy</div>
        <h1 className="text-gradient mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
          What this site measures
        </h1>
        <p className="text-text mt-5 max-w-2xl text-lg leading-relaxed">
          I count visits so I know whether anyone reads this. That&apos;s the whole
          purpose — there is no advertising, no profiling, and nothing is shared with
          anyone.
        </p>

        <Section title="No cookies, no tracking across sites">
          <p>
            This site sets no cookies for analytics and stores nothing on your device.
            Nothing here follows you to other websites, and your visit is never combined
            with data from anywhere else.
          </p>
          <p>
            The one cookie the site can set is for the private admin dashboard, and only
            ever for me when I sign in to it.
          </p>
        </Section>

        <Section title="What is recorded">
          <p>For each page view, the server records only aggregate counters:</p>
          <ul className="list-disc space-y-1 ps-5">
            <li>the page path (e.g. <code className="font-mono text-[13px]">/projects</code>)</li>
            <li>the referring site&apos;s hostname only (e.g. <code className="font-mono text-[13px]">google.com</code>) — never the full URL, so search terms are never captured</li>
            <li>country and timezone, derived on the server from the connection, not read from your device</li>
            <li>a pseudonymous visitor id, described below</li>
          </ul>
        </Section>

        <Section title="Your IP address is never stored">
          <p>
            To tell one visitor from another without identifying anyone, the server
            computes a one-way SHA-256 hash of your IP address and browser user-agent,
            combined with a secret salt. Only that hash is written down — the IP address
            itself is never stored, logged, or retained.
          </p>
          <p>
            The salt is unique to each calendar month and expires with it. Once it is
            gone the hashes cannot be recomputed by anyone, including me, so visitors
            cannot be linked from one month to the next. That is why the dashboard only
            ever reports figures within the current month.
          </p>
        </Section>

        <Section title="Retention">
          <p>
            Aggregate counters are kept for at most 400 days and expire automatically.
            There is no raw event log and no per-visit history — only totals.
          </p>
        </Section>

        <Section title="Automated traffic">
          <p>
            Crawlers and bots are filtered out before anything is recorded, so the
            numbers reflect people rather than machines.
          </p>
        </Section>

        <Section title="Questions, or want your data removed?">
          <p>
            Because nothing stored can be traced back to an individual, there is no
            record of you to look up or delete. If you have any question about this,
            email me at{" "}
            <a className="text-accent underline-offset-4 hover:underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            .
          </p>
        </Section>
      </Container>
    </section>
  );
}

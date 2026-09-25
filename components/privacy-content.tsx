"use client";

import { site } from "@/lib/site";
import { pageCopy } from "@/lib/page-copy";
import { useLocale } from "@/components/locale-provider";
import { Container } from "@/components/ui/container";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="eyebrow">{title}</h2>
      <div className="text-text mt-3 max-w-2xl space-y-3 leading-[1.75]">
        {children}
      </div>
    </section>
  );
}

export function PrivacyContent() {
  const { locale } = useLocale();
  const p = pageCopy[locale].privacy;

  return (
    <section className="pt-28 pb-24 sm:pt-32">
      <Container>
        <div className="eyebrow">{p.eyebrow}</div>
        <h1 className="text-gradient mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
          {p.title}
        </h1>
        <p className="text-text mt-5 max-w-2xl text-lg leading-relaxed">
          {p.intro}
        </p>

        <Section title={p.cookiesTitle}>
          <p>{p.cookies}</p>
          <p>{p.adminCookie}</p>
        </Section>
        <Section title={p.recordedTitle}>
          <p>{p.recordedLead}</p>
          <ul className="list-disc space-y-1 ps-5">
            {p.recorded.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>
        <Section title={p.ipTitle}>
          <p>{p.ip}</p>
          <p>{p.salt}</p>
        </Section>
        <Section title={p.retentionTitle}>
          <p>{p.retention}</p>
        </Section>
        <Section title={p.botsTitle}>
          <p>{p.bots}</p>
        </Section>
        <Section title={p.contactTitle}>
          <p>
            {p.contact}{" "}
            <a
              className="text-accent underline-offset-4 hover:underline"
              href={`mailto:${site.email}`}
            >
              {site.email}
            </a>
          </p>
        </Section>
      </Container>
    </section>
  );
}

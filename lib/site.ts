/**
 * Central site configuration — single source of truth for identity, links, and SEO.
 */
export const site = {
  name: "Sina Amareh",
  firstName: "Sina",
  role: "Software Developer · Backend & AI",
  tagline: "Python backend + AI/LLM engineer",
  shortBio:
    "I build resilient backend services and LLM-powered applications — multi-provider RAG systems, async APIs, and secure-by-default tooling.",
  email: "sinaamareh0263@gmail.com",
  phone: "+98 938 516 5679",
  location: "Tehran, Iran",
  timezone: "UTC+3:30",
  availability: "Open to backend / AI engineering roles · Remote-friendly",
  url:
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000"),
  resume: "/resume.pdf",
  socials: {
    github: "https://github.com/Sina-Amare",
    linkedin: "https://www.linkedin.com/in/sina-amareh-909987286",
    email: "mailto:sinaamareh0263@gmail.com",
    // Opens Gmail's compose window pre-addressed — avoids the OS "pick an app"
    // dialog that a bare mailto: triggers on many machines.
    emailCompose:
      "https://mail.google.com/mail/?view=cm&fs=1&to=sinaamareh0263@gmail.com",
  },
} as const;

export type Site = typeof site;

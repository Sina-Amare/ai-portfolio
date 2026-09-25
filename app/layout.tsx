import type { Metadata, Viewport } from "next";
import {
  Bricolage_Grotesque,
  Inter,
  JetBrains_Mono,
  Vazirmatn,
} from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { site } from "@/lib/site";
import { dirOf, type Locale } from "@/lib/dictionary";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { MotionProvider } from "@/components/motion/motion-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { CommandPalette } from "@/components/command-palette";
import { AnimatedBackground } from "@/components/animated-background";
import { Tracker } from "@/components/analytics/tracker";
import { SkipLink } from "@/components/skip-link";
import { LocaleMetadata } from "@/components/locale-metadata";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const vazirmatn = Vazirmatn({
  variable: "--font-vazirmatn",
  subsets: ["arabic", "latin"],
  display: "swap",
  // Only needed when a visitor switches to Persian — don't block initial load.
  preload: false,
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await cookies()).get("locale")?.value === "fa" ? "fa" : "en";
  const role = locale === "fa" ? "توسعه‌دهندهٔ بک‌اند و AI" : site.role;
  const description =
    locale === "fa"
      ? "من سینا عماره‌ام؛ با Python بک‌اند و برنامه‌های AI می‌سازم. از پروژه‌ها و تجربه‌هام از دستیار سایت بپرس."
      : "Python backend & AI/LLM engineer. Resilient backend services, multi-provider LLM apps, and RAG. Ask my AI assistant anything about my work.";
  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name} — ${role}`,
      template: `%s — ${site.name}`,
    },
    description,
    keywords: [
      "Sina Amareh",
      "Python developer",
      "Backend engineer",
      "AI engineer",
      "LLM",
      "RAG",
      "FastAPI",
      "Django",
      "Next.js",
    ],
    authors: [{ name: site.name, url: site.url }],
    creator: site.name,
    openGraph: {
      type: "website",
      url: site.url,
      siteName: site.name,
      title: `${site.name} — ${role}`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${site.name} — ${role}`,
      description,
    },
    alternates: { canonical: site.url },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
    { media: "(prefers-color-scheme: light)", color: "#fbfaf7" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const locale: Locale =
    cookieStore.get("locale")?.value === "fa" ? "fa" : "en";
  return (
    <html
      lang={locale}
      dir={dirOf(locale)}
      data-locale={locale}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${bricolage.variable} ${inter.variable} ${jetbrainsMono.variable} ${vazirmatn.variable} h-full`}
    >
      <body
        suppressHydrationWarning
        className="bg-bg text-text flex min-h-dvh flex-col font-sans"
      >
        <ThemeProvider>
          <LocaleProvider initial={locale}>
            <SkipLink />
            <LocaleMetadata />
            <AnimatedBackground />
            <MotionProvider>
              <Nav />
              <main id="content" className="flex-1">
                {children}
              </main>
              <Footer />
            </MotionProvider>
            <CommandPalette />
            <Tracker />
          </LocaleProvider>
        </ThemeProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: site.name,
              jobTitle: "Software Developer — Backend & AI",
              url: site.url,
              email: site.email,
              sameAs: [site.socials.github, site.socials.linkedin],
              knowsAbout: [
                "Python",
                "FastAPI",
                "Django",
                "RAG",
                "LLM application engineering",
                "PostgreSQL",
                "Docker",
              ],
              knowsLanguage: ["English", "Persian"],
              alumniOf: [
                {
                  "@type": "CollegeOrUniversity",
                  name: "University of Guilan",
                },
                {
                  "@type": "CollegeOrUniversity",
                  name: "Islamic Azad University",
                },
              ],
              address: {
                "@type": "PostalAddress",
                addressLocality: "Tehran",
                addressCountry: "IR",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}

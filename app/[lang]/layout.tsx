import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter, JetBrains_Mono, Vazirmatn } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { site } from "@/lib/site";
import { LOCALES, dirOf, hasLocale, toLocale } from "@/lib/locale";
import { pageCopy } from "@/lib/page-copy";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { MotionProvider } from "@/components/motion/motion-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { CommandPalette } from "@/components/command-palette";
import { AnimatedBackground } from "@/components/animated-background";
import { Tracker } from "@/components/analytics/tracker";
import { SkipLink } from "@/components/skip-link";

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
  // Only Persian pages use it — don't block the English first paint.
  preload: false,
});

type Props = { params: Promise<{ lang: string }> };

// Both locales prerender; the proxy never routes anything else here.
export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

// Site-wide defaults only. Canonical, hreflang, openGraph and twitter are set
// per page (lib/seo.ts): metadata merges shallowly, so anything here would
// leak into every page that doesn't override it.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lang = toLocale((await params).lang);
  const home = pageCopy[lang].home;
  const name = site.localName[lang];
  return {
    metadataBase: new URL(site.url),
    title: { default: home.title, template: `%s — ${name}` },
    description: home.description,
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
    authors: [{ name, url: site.url }],
    creator: name,
    robots: { index: true, follow: true },
  };
}

// The site always opens dark (theme-provider's defaultTheme), so the browser
// bar matches that instead of the OS preference.
export const viewport: Viewport = { themeColor: "#0a0a0b" };

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode } & Props>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html
      lang={lang}
      dir={dirOf(lang)}
      data-locale={lang}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${bricolage.variable} ${inter.variable} ${jetbrainsMono.variable} ${vazirmatn.variable} h-full`}
    >
      <body suppressHydrationWarning className="bg-bg text-text flex min-h-dvh flex-col font-sans">
        <ThemeProvider>
          <LocaleProvider locale={lang}>
            <SkipLink />
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
              jobTitle: site.role,
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

/** A screenshot or video shown in the case-study gallery. Drop files in
 *  public/projects/<slug>/ and reference them here. Videos use a poster image. */
export type MediaItem = {
  type: "image" | "video";
  src: string;
  poster?: string;
  caption?: string;
};

export type Project = {
  slug: string;
  name: string;
  tagline: string;
  /** Persian tagline (proper nouns / tech terms stay in Latin). */
  taglineFa: string;
  year: string;
  stack: string[];
  repo: string;
  featured: boolean;
  /** Bento sizing on the projects grid. */
  span: "wide" | "normal";
  /** One-line outcome. */
  summary: string;
  /** Persian summary. */
  summaryFa: string;
  problem: string;
  role: string;
  highlights: { title: string; body: string }[];
  outcomes: string[];
  /** Steps rendered as a CSS/SVG pipeline diagram on the case study. */
  architecture: string[];
  /** Persian versions of the deep case-study content (tech terms stay Latin). */
  fa: {
    problem: string;
    role: string;
    highlights: { title: string; body: string }[];
    outcomes: string[];
    architecture: string[];
  };
  /** Card cover screenshot (projects grid + home). Optional — cards render
   *  text-only when absent. */
  cover?: string;
  /** Optional screenshots / videos for the case-study gallery. */
  media?: MediaItem[];
};

export const projects: Project[] = [
  {
    slug: "scrapegpt",
    name: "ScrapeGPT",
    tagline: "Self-hosted, AI-assisted web scraping",
    taglineFa: "اسکریپینگ وب با کمک AI، self-hosted",
    year: "2025",
    stack: ["FastAPI", "PostgreSQL", "LiteLLM", "React", "Playwright"],
    repo: "https://github.com/Sina-Amare/ScrapeGpt",
    featured: true,
    span: "wide",
    summary:
      "Paste a URL and an LLM proposes the extraction fields and selectors; the app re-validates and self-heals them against the real HTML, then crawls and exports clean CSV/JSON/XLSX.",
    summaryFa:
      "یه URL می‌دی و یه LLM فیلدها و selectorهای استخراج رو پیشنهاد می‌ده؛ برنامه همون‌ها رو روی HTML واقعی دوباره چک و خودش ترمیم می‌کنه، بعد crawl می‌کنه و خروجی تمیز CSV/JSON/XLSX می‌ده.",
    problem:
      "Scrapers built on hand-written CSS selectors are brittle — one layout change and they silently return nothing. ScrapeGPT lets an LLM discover the selectors from the page, then makes extraction resilient: it re-checks every selector against the real HTML, self-heals the ones that miss, and falls back through multiple strategies so even a wrong guess still yields records.",
    role: "Designed and built the full stack — a FastAPI + PostgreSQL backend, a provider-agnostic LLM layer (LiteLLM) with encrypted bring-your-own keys, and a React/TypeScript UI.",
    highlights: [
      {
        title: "AI proposes, code verifies",
        body: "An LLM reads a distilled DOM summary (not raw HTML) and proposes the repeated-item and per-field selectors — and the system never trusts them blindly.",
      },
      {
        title: "Self-healing selectors",
        body: "Every selector is re-run against the real page; ones that match nothing are relaxed or demoted, with a table-structure fallback, so an imperfect guess still extracts data.",
      },
      {
        title: "Dynamic, interaction-aware",
        body: "Detects on-page controls (toggles, dropdowns like Metric/Imperial), drives a real browser to flip them, and captures each variant — not just static HTML.",
      },
      {
        title: "Secure by default",
        body: "SSRF hardening (per-redirect-hop checks and connected-IP pinning against DNS rebinding) plus bring-your-own provider keys stored Fernet-encrypted.",
      },
    ],
    outcomes: [
      "Turns any page into clean, typed CSV / JSON / XLSX through a guided analyze → review → scope → extract flow, with field-coverage trust signals on the results.",
      "Degrades gracefully instead of returning nothing when the AI's selectors aren't perfect.",
    ],
    architecture: [
      "URL",
      "Safe fetch",
      "DOM summary",
      "LLM selectors",
      "Validate + heal",
      "Crawl + export",
    ],
    fa: {
      problem:
        "اسکریپرهایی که روی selectorهای دستی ساخته می‌شن خیلی شکننده‌ان — یه تغییر کوچیک تو ظاهر صفحه و دیگه بی‌صدا هیچی برنمی‌گردونن. ScrapeGPT می‌ذاره یه LLM خودِ selectorها رو از صفحه پیدا کنه، بعد استخراج رو مقاوم می‌کنه: هر selector رو روی HTML واقعی دوباره چک می‌کنه، اون‌هایی که جواب نمی‌دن رو خودش ترمیم می‌کنه، و چند استراتژیِ پشتیبان داره تا حتی اگه حدسِ AI غلط بود بازم داده در بیاد.",
      role: "کل استک رو طراحی کردم و ساختم — بک‌اند FastAPI + PostgreSQL، یه لایهٔ provider-agnostic برای LLM (با LiteLLM) که کلیدهای خود کاربر رو رمزنگاری‌شده نگه می‌داره، و یه رابط کاربری React/TypeScript.",
      highlights: [
        {
          title: "AI پیشنهاد می‌ده، کد تأیید می‌کنه",
          body: "یه LLM یه خلاصهٔ تمیز از DOM (نه HTML خام) رو می‌خونه و selectorهای آیتم‌تکرارشونده و هر فیلد رو پیشنهاد می‌ده — و سیستم هیچ‌وقت کورکورانه بهشون اعتماد نمی‌کنه.",
        },
        {
          title: "selectorهای self-healing",
          body: "هر selector روی صفحهٔ واقعی دوباره اجرا می‌شه؛ اون‌هایی که چیزی نمی‌گیرن آزادتر یا کم‌اهمیت می‌شن و یه fallback مبتنی بر ساختار جدول هم هست، پس یه حدسِ ناقص بازم داده در میاره.",
        },
        {
          title: "داینامیک و interaction-aware",
          body: "کنترل‌های روی صفحه (مثل toggle یا منوهای Metric/Imperial) رو تشخیص می‌ده، یه مرورگر واقعی رو می‌چرخونه تا عوضشون کنه و هر حالت رو جدا می‌گیره — نه فقط HTML ساکن.",
        },
        {
          title: "Secure by default",
          body: "محافظت در برابر SSRF (چکِ هر redirect و pin کردن IP واقعی در برابر DNS rebinding) به‌علاوهٔ کلیدهای اختصاصیِ کاربر که Fernet-رمزنگاری‌شده ذخیره می‌شن.",
        },
      ],
      outcomes: [
        "هر صفحه رو با یه جریان هدایت‌شده — analyze، بازبینی، انتخابِ scope و extract — به CSV / JSON / XLSXِ تمیز و typed تبدیل می‌کنه، با سیگنال‌های اعتماد روی پوششِ فیلدها.",
        "وقتی selectorهای AI کامل نیستن، به‌جای این‌که هیچی برنگردونه، با افتِ نرم بازم داده می‌ده.",
      ],
      architecture: [
        "URL",
        "دریافت امن",
        "خلاصهٔ DOM",
        "selector با LLM",
        "اعتبارسنجی + ترمیم",
        "crawl + خروجی",
      ],
    },
    cover: "/projects/scrapegpt/extraction-results.webp",
    media: [
      { type: "image", src: "/projects/scrapegpt/extraction-results.webp", caption: "The payoff — 96 records scraped into a clean table, each with its source URL, ready to export as CSV / JSON / XLSX" },
      { type: "image", src: "/projects/scrapegpt/workspace.webp", caption: "Guided analyze → review → scope → extract, with the AI's confidence per page" },
      { type: "image", src: "/projects/scrapegpt/quality.webp", caption: "Trust signals after a run — 96 records, nothing blocked or failed, and 100% coverage on every field" },
      { type: "image", src: "/projects/scrapegpt/providers.webp", caption: "Bring-your-own-key providers, encrypted at rest and tested before use" },
    ],
  },
  {
    slug: "aigram",
    name: "Aigram",
    tagline: "Telegram, but AI-powered — a self-hosted messenger",
    taglineFa: "تلگرام، ولی AI-powered — یه مسنجرِ self-hosted",
    year: "2025",
    stack: ["Python", "Telethon", "FastAPI", "PWA", "Gemini"],
    repo: "https://github.com/Sina-Amare/Aigram",
    featured: true,
    span: "normal",
    summary:
      "Turns your own Telegram account into a self-hosted, installable AI messenger (formerly SakaiBot). Read and send messages with inline media in a glassy web app, and call an LLM right inside any chat — analyze, ask, translate, image, voice. AI results land in a panel, so you decide what to send.",
    summaryFa:
      "اکانتِ خودِ تلگرامت رو به یه مسنجرِ AIِ self-hosted و قابلِ‌نصب تبدیل می‌کنه (قبلاً SakaiBot). توی یه وب‌اپِ شیشه‌ای پیام می‌خونی و می‌فرستی با مدیای inline، و درست داخلِ هر چتی یه LLM رو صدا می‌زنی — analyze، پرسش، ترجمه، تصویر، صدا. نتیجهٔ AI توی یه پنل میاد، پس خودت تصمیم می‌گیری چی بفرستی.",
    problem:
      "Telegram has no built-in AI, and bolting one on usually means copy-pasting into another app or handing a third-party bot your account. Aigram runs as a userbot on your own account (Telethon) behind a glassy, installable web app: a real messenger you can read and send from, with an AI co-pilot in every chat — your account, your keys, your server.",
    role: "Built it end-to-end in Python — the Telethon/MTProto core, a FastAPI + vanilla-JS PWA on the same asyncio loop, the multi-provider AI layer, and a single audited send-bridge with ban-safety throttling.",
    highlights: [
      {
        title: "A real, installable messenger",
        body: "A glassy PWA over your own account: grouped bubbles, inline photos/stickers/voice, reply/edit/forward/delete, live typing and presence pushed over SSE, dark + light — installable to your phone's home screen over a free Cloudflare Tunnel.",
      },
      {
        title: "AI in every chat — you stay in control",
        body: "An ✨ AI sheet inside any chat: analyze or ask about its history, prompt (deep-thinking + web search), translate with Persian phonetics, generate images, TTS/STT. Results land in a panel — saved, categorized, and filterable — and nothing is sent until you choose to.",
      },
      {
        title: "One audited path to Telegram",
        body: "FastAPI and the Telethon client share one MTProto session on a single asyncio loop, and a single audited bridge is the only code that ever writes to Telegram — with pacing and FloodWait handling for ban-safety.",
      },
      {
        title: "Stays up under quota limits",
        body: "Runs on Gemini (primary) with OpenRouter fallback and rotates up to 4 keys per provider; add, test, and hot-swap keys live in the panel with no restart.",
      },
    ],
    outcomes: [
      "Gives you a real messenger plus an AI co-pilot on your own Telegram account — installable on your phone, with no central party holding your session.",
      "Runs anywhere cheap: a €1.49 VPS, a home device, Termux, or a Raspberry Pi, with an Iran-friendly deploy path.",
    ],
    architecture: [
      "Pick a chat",
      "AI sheet",
      "Route provider / key",
      "LLM · image · voice",
      "Result in panel",
      "You send",
    ],
    fa: {
      problem:
        "تلگرام AI داخلی نداره، و معمولاً اضافه‌کردنش یعنی کپی‌پیست توی یه اپِ دیگه یا سپردنِ اکانتت به یه باتِ شخصِ‌ثالث. Aigram به‌صورتِ یوزربات روی اکانتِ خودت اجرا می‌شه (با Telethon) پشتِ یه وب‌اپِ شیشه‌ای و قابلِ‌نصب: یه مسنجرِ واقعی که ازش می‌خونی و می‌فرستی، با یه هم‌خلبانِ AI توی هر چت — اکانتِ خودت، کلیدهای خودت، سرورِ خودت.",
      role: "از صفر تا صد با Python ساختمش — هستهٔ Telethon/MTProto، یه PWA با FastAPI و وانیلا‌JS روی همون asyncio loop، لایهٔ multi-providerِ AI، و یه پلِ ارسالِ واحد و audit‌شده با throttleِ ضدِبن.",
      highlights: [
        {
          title: "یه مسنجرِ واقعی و قابلِ‌نصب",
          body: "یه PWAِ شیشه‌ای روی اکانتِ خودت: حباب‌های گروه‌بندی‌شده، عکس/استیکر/ویس inline، ریپلای/ادیت/فوروارد/حذف، تایپینگ و حضورِ زنده که روی SSE پوش می‌شه، دارک + لایت — قابلِ‌نصب روی هوم‌اسکرینِ گوشی از طریقِ یه Cloudflare Tunnelِ رایگان.",
        },
        {
          title: "AI توی هر چت — کنترل دستِ خودت",
          body: "یه شیتِ ✨ AI داخلِ هر چت: analyze یا پرسش از تاریخچه، prompt (تفکرِ عمیق + جست‌وجوی وب)، ترجمه با تلفظِ فارسی، ساختِ تصویر، TTS/STT. نتیجه‌ها توی یه پنل میان — ذخیره‌شده، دسته‌بندی‌شده و قابلِ فیلتر — و تا خودت نخوای، هیچی فرستاده نمی‌شه.",
        },
        {
          title: "یه مسیرِ واحد و audit‌شده به تلگرام",
          body: "‏FastAPI و کلاینتِ Telethon یه session واحدِ MTProto رو روی یه asyncio loopِ مشترک به اشتراک می‌ذارن، و یه پلِ واحد و audit‌شده تنها کدیه که اصلاً روی تلگرام می‌نویسه — با pacing و مدیریتِ FloodWait برای ضدِبن.",
        },
        {
          title: "زیر فشار سهمیه سرپا می‌مونه",
          body: "روی Gemini (اصلی) با fallbackِ OpenRouter می‌چرخه و تا ۴ کلید per provider رو rotate می‌کنه؛ کلیدها رو زنده توی پنل اضافه، تست و hot-swap می‌کنی، بدونِ restart.",
        },
      ],
      outcomes: [
        "یه مسنجرِ واقعی به‌علاوهٔ یه هم‌خلبانِ AI روی اکانتِ خودِ تلگرامت می‌ده — قابلِ‌نصب روی گوشی، بدونِ هیچ طرفِ مرکزی‌ای که session‌ت رو نگه داره.",
        "هرجای ارزونی اجرا می‌شه: یه VPSِ ۱.۴۹ یورویی، یه دستگاهِ خونگی، Termux، یا رزبری‌پای، با یه مسیرِ deployِ سازگار با ایران.",
      ],
      architecture: [
        "انتخاب چت",
        "شیتِ AI",
        "انتخاب سرویس‌دهنده / کلید",
        "LLM · تصویر · صدا",
        "نتیجه در پنل",
        "تو می‌فرستی",
      ],
    },
    cover: "/projects/aigram/chat-dark.webp",
    media: [
      { type: "image", src: "/projects/aigram/chat-dark.webp", caption: "A real Telegram messenger on your own account — grouped bubbles, inline media, live typing, dark + light" },
      { type: "image", src: "/projects/aigram/ai-result.webp", caption: "AI runs inside the chat; results land in the panel — saved, categorized, and yours to send or not" },
      { type: "image", src: "/projects/aigram/ai-sheet.webp", caption: "The ✨ AI sheet — analyze, ask, prompt, translate, image, TTS/STT" },
      { type: "image", src: "/projects/aigram/chat-mobile.webp", caption: "Installable PWA — the full messenger on your phone over a free Cloudflare Tunnel" },
    ],
  },
  {
    slug: "github-code-review",
    name: "RubricEval",
    tagline: "A rubric-driven code-evaluation platform",
    taglineFa: "یه پلتفرمِ ارزیابیِ کد بر پایهٔ rubric",
    year: "2025",
    stack: ["Next.js", "FastAPI", "LiteLLM", "PostgreSQL"],
    repo: "https://github.com/Sina-Amare/github-code-review",
    featured: true,
    span: "wide",
    summary:
      "Define a versioned rubric of weighted, gated criteria; submit a GitHub repo or ZIP and watch an LLM grade each criterion live against the real code — but a deterministic policy in code makes the final accept / review / reject call, reproducible and auditable.",
    summaryFa:
      "یه rubric نسخه‌دار از معیارهای وزن‌دار و gate-دار تعریف می‌کنی؛ یه ریپوی GitHub یا فایل ZIP می‌فرستی و زنده می‌بینی که یه LLM هر معیار رو روی کدِ واقعی نمره می‌ده — ولی یه policyِ قطعی توی کد تصمیمِ نهاییِ قبول / بازبینی / رد رو می‌گیره، تکرارپذیر و قابلِ ممیزی.",
    problem:
      "Most 'AI code reviewers' tangle three things together: what to evaluate, how to judge it, and how to decide. RubricEval separates them — the rubric is versioned data, the LLM only grades each criterion against the real files, and a pure policy function makes the decision — so one prompt tweak can't silently flip every result, and every decision is reproducible.",
    role: "Designed and built the full-stack platform — a FastAPI + async SQLAlchemy backend with a durable job queue, behind a Next.js / TypeScript frontend.",
    highlights: [
      {
        title: "The model grades, code decides",
        body: "An LLM scores each criterion, but a pure, exhaustively-tested policy function makes the accept / review / reject call — so decisions are reproducible and never at the mercy of LLM nondeterminism.",
      },
      {
        title: "Evidence verified against real files",
        body: "Every citation the model makes (path, line range, quote) is checked against the actual code and flagged if it can't be verified — fabricated evidence can't masquerade as proof.",
      },
      {
        title: "Rubrics are versioned data",
        body: "Each rubric is canonicalized and content-hashed; every review records the rubric hash, model, and prompt version, so a published rubric can't silently change and any result is reproducible.",
      },
      {
        title: "Built to run reliably",
        body: "A durable leased job queue (survives crashes, scales across workers), live replayable SSE streaming, a FakeLLM port for offline/CI runs, and a golden-set regression harness.",
      },
    ],
    outcomes: [
      "Turns code review into a repeatable, auditable, rubric-driven decision — not a one-off LLM opinion.",
      "Runs the whole engine deterministically offline (FakeLLM) and measures every prompt/model change against a golden set.",
    ],
    architecture: [
      "Repo or ZIP",
      "Ingest + normalize",
      "Grade per criterion",
      "Verify evidence",
      "Deterministic policy",
      "Streamed report",
    ],
    fa: {
      problem:
        "بیشترِ «ریویوئرهای کدِ AI» سه چیز رو قاطیِ هم می‌کنن: این‌که چی رو ارزیابی کنن، چطور قضاوت کنن، و چطور تصمیم بگیرن. RubricEval این‌ها رو جدا می‌کنه — rubric یه دادهٔ نسخه‌داره، LLM فقط هر معیار رو روی کدِ واقعی نمره می‌ده، و یه policyِ خالص تصمیم می‌گیره — پس یه تغییرِ کوچیک تو prompt نمی‌تونه بی‌صدا همهٔ نتیجه‌ها رو عوض کنه و هر تصمیم تکرارپذیره.",
      role: "کلِ پلتفرمِ full-stack رو طراحی کردم و ساختم — یه بک‌اند FastAPI + async SQLAlchemy با یه صفِ کارِ بادوام، پشتِ یه فرانت‌اند Next.js / TypeScript.",
      highlights: [
        {
          title: "مدل نمره می‌ده، کد تصمیم می‌گیره",
          body: "یه LLM به هر معیار نمره می‌ده، ولی یه policyِ خالص و کاملاً تست‌شده تصمیمِ قبول / بازبینی / رد رو می‌گیره — پس تصمیم‌ها تکرارپذیرن و هیچ‌وقت اسیرِ بی‌ثباتیِ LLM نیستن.",
        },
        {
          title: "شواهد روی فایل‌های واقعی تأیید می‌شن",
          body: "هر ارجاعی که مدل می‌ده (مسیر، بازهٔ خط، نقل‌قول) با کدِ واقعی چک می‌شه و اگه قابلِ تأیید نباشه علامت می‌خوره — شواهدِ ساختگی نمی‌تونن خودشون رو جای مدرک جا بزنن.",
        },
        {
          title: "rubricها دادهٔ نسخه‌دارن",
          body: "هر rubric، canonical و content-hash می‌شه؛ هر ارزیابی هشِ rubric و مدل و نسخهٔ prompt رو ثبت می‌کنه، پس یه rubricِ منتشرشده بی‌صدا عوض نمی‌شه و هر نتیجه تکرارپذیره.",
        },
        {
          title: "ساخته‌شده برای اجرای مطمئن",
          body: "یه صفِ کارِ بادوام (از crash جون سالم به در می‌بره و بین چند worker مقیاس می‌خوره)، استریمِ زندهٔ SSE با قابلیتِ replay، یه پورتِ FakeLLM برای اجرای offline/CI، و یه harnessِ رگرسیون با golden-set.",
        },
      ],
      outcomes: [
        "ریویوِ کد رو به یه تصمیمِ تکرارپذیر، قابلِ ممیزی و مبتنی بر rubric تبدیل می‌کنه — نه یه نظرِ یک‌بارهٔ LLM.",
        "کلِ موتور رو به‌صورتِ قطعی و offline (با FakeLLM) اجرا می‌کنه و هر تغییرِ prompt/مدل رو با یه golden-set می‌سنجه.",
      ],
      architecture: [
        "ریپو یا ZIP",
        "ingest + نرمال‌سازی",
        "نمره به هر معیار",
        "تأییدِ شواهد",
        "policyِ قطعی",
        "گزارشِ استریم‌شده",
      ],
    },
    cover: "/projects/github-code-review/live-evaluation.webp",
    media: [
      { type: "image", src: "/projects/github-code-review/live-evaluation.webp", caption: "Live per-criterion evaluation streaming to an accept / review / reject decision" },
      { type: "image", src: "/projects/github-code-review/report.webp", caption: "Final report — every verdict carries evidence, each citation highlighted in Monaco against the real file" },
      { type: "image", src: "/projects/github-code-review/task-builder.webp", caption: "Rubric as data — weighted criteria and gates, versioned and content-hashed" },
      { type: "image", src: "/projects/github-code-review/dashboard.webp", caption: "Tasks and recent verdicts at a glance" },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const featuredProjects = projects.filter((p) => p.featured);

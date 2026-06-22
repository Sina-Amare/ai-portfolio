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
      "Turns any page into clean, typed CSV / JSON / XLSX through a guided analyze → review → extract flow.",
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
        "هر صفحه رو با یه جریان هدایت‌شده — analyze، بازبینی و extract — به CSV / JSON / XLSXِ تمیز و typed تبدیل می‌کنه.",
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
    media: [
      { type: "image", src: "/projects/scrapegpt/preview-1.svg", caption: "Guided analyze → review → extract flow" },
      { type: "image", src: "/projects/scrapegpt/preview-2.svg", caption: "Clean, typed structured output" },
    ],
  },
  {
    slug: "sakaibot",
    name: "SakaiBot",
    tagline: "AI superpowers inside any Telegram chat",
    taglineFa: "ابرقدرت‌های AI داخل هر چت تلگرام",
    year: "2024",
    stack: ["Python", "Telethon", "Gemini", "OpenRouter"],
    repo: "https://github.com/Sina-Amare/SakaiBot",
    featured: true,
    span: "normal",
    summary:
      "A Telegram userbot on your own account: type a slash command in any chat to ask an LLM, translate, summarize/analyze history, generate images, or do voice — with key rotation and provider failover so it never goes down.",
    summaryFa:
      "یه یوزربات تلگرام روی اکانتِ خودت: تو هر چتی یه دستورِ اسلش بزن تا از یه LLM بپرسی، ترجمه کنی، تاریخچه رو خلاصه/تحلیل کنی، تصویر بسازی یا کار صوتی انجام بدی — با چرخش کلید و failover سرویس‌دهنده‌ها که هیچ‌وقت از کار نیفته.",
    problem:
      "Telegram has no built-in AI. SakaiBot runs as a userbot on your own account (via Telethon), so you can drop AI into any conversation — private or group — just by typing a command, instead of copy-pasting into another app.",
    role: "Built the userbot end-to-end in Python on Telethon — the command routing, the multi-modal handlers, and the resilience layer.",
    highlights: [
      {
        title: "Runs on your own account",
        body: "A Telethon userbot, not a Bot-API bot — so commands work inside any chat you're already in, and it edits your own message in place with the answer.",
      },
      {
        title: "A toolbox of commands",
        body: "/prompt (with optional deep-reasoning and web-grounded modes), /translate (with Persian phonetics), /analyze and /tellme over recent chat history, /image, and two-way voice (/tts, /stt).",
      },
      {
        title: "Stays up under quota limits",
        body: "Rotates across multiple API keys, fails over Gemini → OpenRouter, and drops from the Pro to the Flash tier when a model is exhausted — with circuit breakers and per-user rate limiting.",
      },
      {
        title: "A local web control panel",
        body: "A loopback-only FastAPI panel (bearer-token auth) reuses the same Telethon session, so you can browse chats and run every command from a browser — and it's read-only toward Telegram, so no accidental sends.",
      },
    ],
    outcomes: [
      "Brings ask-anything, translate, summarize, image, and voice into any Telegram chat — no extra app.",
      "Keeps answering through rate limits and key exhaustion with no manual restarts.",
    ],
    architecture: [
      "Slash command",
      "Route",
      "Pick provider / key",
      "LLM · image · voice",
      "Edit reply in place",
    ],
    fa: {
      problem:
        "تلگرام AI داخلی نداره. SakaiBot به‌صورت یوزربات روی اکانتِ خودت اجرا می‌شه (با Telethon)، پس فقط با تایپِ یه دستور می‌تونی AI رو بیاری وسطِ هر گفت‌وگویی — خصوصی یا گروهی — به‌جای این‌که هی کپی‌پیست کنی تو یه اپ دیگه.",
      role: "یوزربات رو از صفر تا صد با Python و روی Telethon ساختم — مسیریابیِ دستورها، هندلرهای multi-modal و لایهٔ resilience.",
      highlights: [
        {
          title: "روی اکانت خودت اجرا می‌شه",
          body: "یه یوزرباتِ Telethon، نه باتِ Bot API — پس دستورها تو هر چتی که توش هستی کار می‌کنن و جواب رو همون‌جا روی پیامِ خودت ویرایش می‌کنه.",
        },
        {
          title: "یه toolbox از دستورها",
          body: "‏/prompt (با حالت‌های استدلالِ عمیق و وب‌گراند)، /translate (با تلفظ فارسی)، /analyze و /tellme روی تاریخچهٔ اخیرِ چت، /image، و کار صوتیِ دوطرفه (/tts و /stt).",
        },
        {
          title: "زیر فشار سهمیه سرپا می‌مونه",
          body: "بین چند کلیدِ API می‌چرخه، از Gemini به OpenRouter سوییچ می‌کنه و وقتی یه مدل تموم می‌شه از Pro به Flash میاد پایین — با circuit breaker و محدودیتِ نرخِ per-user.",
        },
        {
          title: "یه control panel وب محلی",
          body: "یه پنل FastAPI که فقط روی loopback بالا میاد (با احراز هویت bearer-token) از همون session تلگرام استفاده می‌کنه، پس می‌تونی از مرورگر چت‌ها رو ببینی و همهٔ دستورها رو اجرا کنی — و نسبت به تلگرام read-only هست، پس هیچ پیامی اشتباهی فرستاده نمی‌شه.",
        },
      ],
      outcomes: [
        "پرسیدنِ هرچیزی، ترجمه، خلاصه، تصویر و صدا رو میاره تو هر چتِ تلگرام — بدونِ اپِ اضافه.",
        "زیر فشار rate limit و تموم‌شدنِ کلیدها، بدون restart دستی به جواب‌دادن ادامه می‌ده.",
      ],
      architecture: [
        "دستور اسلش",
        "مسیریابی",
        "انتخاب سرویس‌دهنده / کلید",
        "LLM · تصویر · صدا",
        "ویرایش پاسخ در جا",
      ],
    },
    media: [
      { type: "image", src: "/projects/sakaibot/preview-1.svg", caption: "Multi-modal commands in any chat" },
      { type: "image", src: "/projects/sakaibot/preview-2.svg", caption: "Stays alive through provider rate limits" },
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
    span: "normal",
    summary:
      "Define a versioned rubric of weighted, gated criteria; an LLM grades a submitted GitHub repo or ZIP against the real code, but a deterministic policy in code makes the final accept / review / reject call — reproducible and auditable.",
    summaryFa:
      "یه rubric نسخه‌دار از معیارهای وزن‌دار و gate-دار تعریف می‌کنی؛ یه LLM یه ریپوی GitHub یا فایل ZIP رو روی کدِ واقعی نمره می‌ده، ولی یه policyِ قطعی توی کد تصمیمِ نهاییِ قبول / بازبینی / رد رو می‌گیره — تکرارپذیر و قابلِ ممیزی.",
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
    media: [
      { type: "image", src: "/projects/github-code-review/preview-1.svg", caption: "Rubric-driven, reproducible decision" },
      { type: "image", src: "/projects/github-code-review/preview-2.svg", caption: "Evidence verified against the real code" },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const featuredProjects = projects.filter((p) => p.featured);

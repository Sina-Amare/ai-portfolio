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
        title: "Safe by default",
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
      role: "کل استک رو طراحی و ساختم — بک‌اند FastAPI + PostgreSQL، یه لایهٔ provider-agnostic برای LLM (با LiteLLM) که کلیدهای خود کاربر رو رمزنگاری‌شده نگه می‌داره، و یه رابط کاربری React/TypeScript.",
      highlights: [
        {
          title: "AI پیشنهاد می‌ده، کد تأیید می‌کنه",
          body: "یه LLM یه خلاصهٔ تمیز از DOM (نه HTML خام) رو می‌خونه و selectorهای آیتم‌تکرارشونده و هر فیلد رو پیشنهاد می‌ده — و سیستم هیچ‌وقت کورکورانه بهشون اعتماد نمی‌کنه.",
        },
        {
          title: "selectorهای خودترمیم",
          body: "هر selector روی صفحهٔ واقعی دوباره اجرا می‌شه؛ اون‌هایی که چیزی نمی‌گیرن آزادتر یا کم‌اهمیت می‌شن و یه fallback مبتنی بر ساختار جدول هم هست، پس یه حدسِ ناقص بازم داده در میاره.",
        },
        {
          title: "داینامیک و حساس به تعامل",
          body: "کنترل‌های روی صفحه (مثل toggle یا منوهای Metric/Imperial) رو تشخیص می‌ده، یه مرورگر واقعی رو می‌چرخونه تا عوضشون کنه و هر حالت رو جدا می‌گیره — نه فقط HTML ساکن.",
        },
        {
          title: "امن به‌صورت پیش‌فرض",
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
        title: "Persian-first details",
        body: "RTL-aware formatting, message pagination around Telegram's 4096-char limit, queued image generation, and partial voice-chunk retries.",
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
      role: "یوزربات رو از صفر تا صد با Python و روی Telethon ساختم — مسیریابیِ دستورها، هندلرهای چندرسانه‌ای و لایهٔ مقاومت.",
      highlights: [
        {
          title: "روی اکانت خودت اجرا می‌شه",
          body: "یه یوزرباتِ Telethon، نه باتِ Bot API — پس دستورها تو هر چتی که توش هستی کار می‌کنن و جواب رو همون‌جا روی پیامِ خودت ویرایش می‌کنه.",
        },
        {
          title: "یه جعبه‌ابزار از دستورها",
          body: "‏/prompt (با حالت‌های استدلالِ عمیق و وب‌گراند)، /translate (با تلفظ فارسی)، /analyze و /tellme روی تاریخچهٔ اخیرِ چت، /image، و کار صوتیِ دوطرفه (/tts و /stt).",
        },
        {
          title: "زیر فشار سهمیه سرپا می‌مونه",
          body: "بین چند کلیدِ API می‌چرخه، از Gemini به OpenRouter سوییچ می‌کنه و وقتی یه مدل تموم می‌شه از Pro به Flash میاد پایین — با circuit breaker و محدودیتِ نرخِ per-user.",
        },
        {
          title: "جزئیاتِ فارسی‌محور",
          body: "فرمت‌دهیِ RTL، تکه‌کردنِ پیام‌های بلندتر از سقفِ ۴۰۹۶ کاراکترِ تلگرام، صف برای تولیدِ تصویر، و retry روی تکه‌های صوتی.",
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
    name: "GitHub Code Review",
    tagline: "Automated, role-aware technical screening",
    taglineFa: "بررسی فنیِ خودکار و متناسب با نقش",
    year: "2025",
    stack: ["Python", "OpenRouter", "Telegram", "SQLite"],
    repo: "https://github.com/Sina-Amare/github-code-review",
    featured: true,
    span: "normal",
    summary:
      "Send a candidate's GitHub repo and a role; it reads the real code and returns a scored hire / no-hire report — with deterministic rules that override the LLM and guardrails that reject hallucinated evidence.",
    summaryFa:
      "یه ریپوی GitHub کاندیدا و یه نقش بهش می‌دی؛ کدِ واقعی رو می‌خونه و یه گزارشِ امتیازدارِ استخدام/عدم‌استخدام برمی‌گردونه — با قوانینِ قطعی که حرفِ LLM رو override می‌کنن و محافظ‌هایی که شواهدِ توهمیِ مدل رو رد می‌کنن.",
    problem:
      "First-pass code review of candidates is slow and inconsistent. This reads a real repository through a Telegram bot and turns it into a repeatable, criteria-driven, role-aware evaluation a hiring manager can trust.",
    role: "Designed the architecture and built it in Python — a clean ports-and-adapters core with a Telegram front end on OpenRouter.",
    highlights: [
      {
        title: "Ports-and-adapters architecture",
        body: "A pure domain core behind four ports (repo, analyzer, storage, notification), so the LLM, VCS, DB, or chat channel can each be swapped without touching the logic.",
      },
      {
        title: "Fits big repos into context",
        body: "Priority-tags files and token-budgets them with tiktoken — packing the most important code and truncating exactly to the model's window, instead of blind chunking.",
      },
      {
        title: "Code overrides the model",
        body: "A two-phase deterministic decision: fail on any missing mandatory requirement, reject past a penalty threshold, else score — overriding an LLM 'accept' when the objective counts disagree.",
      },
      {
        title: "Rejects hallucinated evidence",
        body: "Every cited file:line is checked against the real cloned files; invented evidence is dropped (and never penalizes the candidate), with multi-model fallback behind it.",
      },
    ],
    outcomes: [
      "Produces a scored, role-aware hire / no-hire / review report from any public candidate repo.",
      "Stays reliable and honest on large codebases — token-budgeted, multi-model, and hallucination-checked.",
    ],
    architecture: [
      "GitHub URL + role",
      "Shallow clone",
      "Priority + token budget",
      "Role-aware eval",
      "Verify evidence",
      "Scored report",
    ],
    fa: {
      problem:
        "بررسیِ اولیهٔ کدِ کاندیداها کند و ناهماهنگه. این ابزار از طریقِ یه باتِ تلگرام یه ریپوی واقعی رو می‌خونه و تبدیلش می‌کنه به یه ارزیابیِ تکرارپذیر، معیارمحور و متناسب با نقش که یه مدیرِ استخدام بتونه بهش تکیه کنه.",
      role: "معماری‌اش رو طراحی کردم و با Python ساختمش — یه هستهٔ تمیزِ ports-and-adapters با یه رابطِ تلگرام روی OpenRouter.",
      highlights: [
        {
          title: "معماری ports-and-adapters",
          body: "یه هستهٔ دامنهٔ خالص پشتِ چهار port (ریپو، تحلیل‌گر، ذخیره‌سازی، اعلان)، پس LLM، سیستمِ نسخه، دیتابیس یا کانالِ چت هرکدوم بدونِ دست‌زدن به منطق قابل‌تعویض‌ان.",
        },
        {
          title: "ریپوهای بزرگ رو تو context جا می‌ده",
          body: "فایل‌ها رو اولویت‌بندی می‌کنه و با tiktoken بودجهٔ token می‌بنده — مهم‌ترین کدها رو می‌چینه و دقیقاً به اندازهٔ پنجرهٔ مدل کوتاه می‌کنه، نه تکه‌کردنِ کور.",
        },
        {
          title: "کد، حرفِ مدل رو override می‌کنه",
          body: "یه تصمیمِ قطعیِ دومرحله‌ای: اگه هر شرطِ الزامی نباشه رد می‌کنه، از یه آستانهٔ جریمه که رد شد رد می‌کنه، وگرنه امتیاز می‌ده — و وقتی شمارشِ عینی خلافش رو بگه «قبولِ» LLM رو override می‌کنه.",
        },
        {
          title: "شواهدِ توهمی رو رد می‌کنه",
          body: "هر file:lineِ ارجاع‌شده با فایل‌های واقعیِ clone‌شده چک می‌شه؛ شواهدِ ساختگی حذف می‌شن (و هیچ‌وقت کاندیدا رو جریمه نمی‌کنن)، با fallback چندمدلی پشتش.",
        },
      ],
      outcomes: [
        "از هر ریپوی عمومیِ کاندیدا یه گزارشِ امتیازدارِ متناسب با نقش (استخدام / عدم‌استخدام / بازبینی) می‌سازه.",
        "روی کدبیس‌های بزرگ، قابل‌اعتماد و صادق می‌مونه — با بودجهٔ token، چندمدلی و چک‌شده در برابرِ توهم.",
      ],
      architecture: [
        "URLِ گیت‌هاب + نقش",
        "clone سطحی",
        "اولویت + بودجهٔ token",
        "ارزیابیِ متناسب با نقش",
        "تأییدِ شواهد",
        "گزارشِ امتیازدار",
      ],
    },
    media: [
      { type: "image", src: "/projects/github-code-review/preview-1.svg", caption: "Scored, role-aware hiring report" },
      { type: "image", src: "/projects/github-code-review/preview-2.svg", caption: "Reads a real candidate repository" },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const featuredProjects = projects.filter((p) => p.featured);

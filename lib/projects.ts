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
    tagline: "Self-hosted AI web data-extraction",
    taglineFa: "استخراج دادهٔ وب با AI — self-hosted",
    year: "2025",
    stack: ["FastAPI", "SQLAlchemy", "React", "TypeScript"],
    repo: "https://github.com/Sina-Amare/ScrapeGpt",
    featured: true,
    span: "wide",
    summary:
      "Turns any URL into structured data through a guided analyze → preview → extract flow.",
    summaryFa:
      "هر URL رو با یه جریان ساده — analyze، preview و extract — به دادهٔ ساختارمند تبدیل می‌کنه.",
    problem:
      "Scraping arbitrary sites for structured data is brittle: pages fight bots, servers can be tricked into SSRF, and long crawls crash halfway. ScrapeGPT makes extraction safe, guided, and resumable.",
    role: "Designed and built the full stack — a FastAPI backend, SQLAlchemy persistence, and a React/TypeScript UI.",
    highlights: [
      {
        title: "SSRF-safe fetching",
        body: "Outbound requests are validated to block internal and metadata addresses, so a malicious URL can't pivot into the network.",
      },
      {
        title: "Anti-bot handling",
        body: "Detects and works through Cloudflare and CAPTCHA challenges instead of silently failing.",
      },
      {
        title: "Crash-tolerant crawling",
        body: "Long crawls survive restarts and resume where they left off.",
      },
      {
        title: "Encrypted bring-your-own-key",
        body: "Users supply their own provider keys, stored encrypted — never in plaintext.",
      },
    ],
    outcomes: [
      "A guided analyze → preview → extract workflow that turns raw pages into clean, typed fields.",
      "Production-minded safety: SSRF guards, anti-bot handling, and resumable crawling.",
    ],
    architecture: [
      "URL input",
      "SSRF-safe fetch",
      "Anti-bot resolve",
      "LLM schema analyze",
      "Preview fields",
      "Structured data",
    ],
    fa: {
      problem:
        "اسکریپ‌کردن سایت‌های مختلف برای دادهٔ ساختارمند کارِ شکننده‌ایه: صفحه‌ها با بات‌ها می‌جنگن، سرور رو می‌شه گول زد و به SSRF کشوند، و crawlهای طولانی وسطِ کار crash می‌کنن. ScrapeGPT استخراج رو امن، هدایت‌شده و قابل‌ادامه می‌کنه.",
      role: "کل استک رو طراحی و ساختم — یه بک‌اند FastAPI، لایهٔ ماندگاری با SQLAlchemy و یه رابط کاربری با React/TypeScript.",
      highlights: [
        {
          title: "دریافت امن در برابر SSRF",
          body: "همهٔ درخواست‌های خروجی اعتبارسنجی می‌شن تا به آدرس‌های داخلی و metadata نرسن؛ این‌طوری یه URL مخرب نمی‌تونه به شبکهٔ داخلی نفوذ کنه.",
        },
        {
          title: "عبور از سیستم‌های ضدبات",
          body: "چالش‌های Cloudflare و CAPTCHA رو تشخیص می‌ده و ازشون رد می‌شه، به‌جای این‌که بی‌صدا شکست بخوره.",
        },
        {
          title: "crawlِ مقاوم در برابر خرابی",
          body: "crawlهای طولانی از restart جون سالم به در می‌برن و از همون‌جا که مونده بودن ادامه می‌دن.",
        },
        {
          title: "کلید اختصاصی و رمزنگاری‌شده",
          body: "کاربرها کلید سرویس‌دهندهٔ خودشون رو می‌دن که رمزنگاری‌شده ذخیره می‌شه — هیچ‌وقت به‌صورت plaintext.",
        },
      ],
      outcomes: [
        "یه جریان کاری هدایت‌شده — analyze، preview و extract — که صفحه‌های خام رو به فیلدهای تمیز و typed تبدیل می‌کنه.",
        "امنیت در حد یه محصول واقعی: محافظ SSRF، عبور از ضدبات و crawlِ قابل‌ادامه.",
      ],
      architecture: [
        "ورودی URL",
        "دریافت SSRF-safe",
        "عبور از ضدبات",
        "تحلیل schema با LLM",
        "پیش‌نمایش فیلدها",
        "دادهٔ ساختارمند",
      ],
    },
    media: [
      { type: "image", src: "/projects/scrapegpt/preview-1.svg", caption: "Guided analyze → preview → extract flow" },
      { type: "image", src: "/projects/scrapegpt/preview-2.svg", caption: "Clean, typed structured output" },
    ],
  },
  {
    slug: "sakaibot",
    name: "SakaiBot",
    tagline: "Resilient multi-LLM Telegram userbot",
    taglineFa: "ربات تلگرام با چند LLM، مقاوم و سرپا",
    year: "2024",
    stack: ["Python", "Telethon"],
    repo: "https://github.com/Sina-Amare/SakaiBot",
    featured: true,
    span: "normal",
    summary:
      "Summarization, translation, analysis, image generation, and voice for any Telegram chat — kept alive through rate limits.",
    summaryFa:
      "خلاصه‌سازی، ترجمه، تحلیل، تولید تصویر و کار صوتی توی هر چت تلگرام — حتی زیر فشار rate limit هم سرپا می‌مونه.",
    problem:
      "LLM bots fall over the moment a provider rate-limits or a key dies. SakaiBot is built so that never takes it down.",
    role: "Built the bot end-to-end in Python on Telethon.",
    highlights: [
      {
        title: "Automatic API-key rotation",
        body: "Rotates across keys so a single exhausted key never stops the bot.",
      },
      {
        title: "Provider / model failover",
        body: "Falls back across providers and models to ride through 429s and outages without restarts.",
      },
      {
        title: "Multi-modal",
        body: "Summarize, translate, analyze, generate images, and do speech-to-text / text-to-speech in any chat.",
      },
    ],
    outcomes: [
      "Stays up through provider rate limits with no manual restarts.",
      "Brings five-plus AI capabilities to groups and direct messages.",
    ],
    architecture: [
      "Telegram message",
      "Intent route",
      "Key / provider selector",
      "LLM · STT · TTS · image",
      "Reply",
    ],
    fa: {
      problem:
        "بات‌های LLM همون لحظه‌ای که یه سرویس‌دهنده rate-limit می‌کنه یا یه کلید می‌میره از کار می‌افتن. SakaiBot طوری ساخته شده که این اتفاق هیچ‌وقت زمینش نزنه.",
      role: "بات رو از صفر تا صد با Python و روی Telethon ساختم.",
      highlights: [
        {
          title: "چرخش خودکار کلیدها",
          body: "بین کلیدها می‌چرخه تا یه کلیدِ تموم‌شده هیچ‌وقت بات رو متوقف نکنه.",
        },
        {
          title: "جابه‌جایی بین سرویس‌دهنده‌ها و مدل‌ها",
          body: "بین سرویس‌دهنده‌ها و مدل‌ها جابه‌جا می‌شه تا بدون restart از خطاهای 429 و قطعی‌ها رد بشه.",
        },
        {
          title: "چندرسانه‌ای",
          body: "توی هر چت خلاصه می‌کنه، ترجمه و تحلیل می‌کنه، تصویر می‌سازه و کارهای speech-to-text و text-to-speech انجام می‌ده.",
        },
      ],
      outcomes: [
        "زیر فشار rate limit سرویس‌دهنده‌ها بدون restart دستی سرپا می‌مونه.",
        "بیش از پنج قابلیت AI رو به گروه‌ها و چت‌های خصوصی میاره.",
      ],
      architecture: [
        "پیام تلگرام",
        "تشخیص نیت",
        "انتخاب کلید / سرویس‌دهنده",
        "LLM · STT · TTS · تصویر",
        "پاسخ",
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
    tagline: "Automated technical-screening bot",
    taglineFa: "ربات خودکار بررسی فنی",
    year: "2025",
    stack: ["Python", "OpenRouter"],
    repo: "https://github.com/Sina-Amare/github-code-review",
    featured: true,
    span: "normal",
    summary:
      "Clones a candidate's repository and produces a role-aware, scored hiring report.",
    summaryFa:
      "ریپازیتوری کاندیدا رو clone می‌کنه و یه گزارش استخدامی امتیازدار و متناسب با نقش می‌سازه.",
    problem:
      "Screening engineering candidates by hand doesn't scale. This reads a real repository and turns it into a structured, role-aware evaluation.",
    role: "Designed the architecture and built it in Python on OpenRouter.",
    highlights: [
      {
        title: "Ports-and-adapters architecture",
        body: "A clean hexagonal core keeps the LLM, VCS, and reporting swappable and testable.",
      },
      {
        title: "Multi-model fallback",
        body: "Falls back across models so a provider hiccup doesn't break a review.",
      },
      {
        title: "Token budgeting",
        body: "Fits large repositories into model context windows with deliberate token budgeting.",
      },
    ],
    outcomes: [
      "Produces a scored hiring report from any candidate repository.",
      "Stays reliable and cost-controlled on large codebases.",
    ],
    architecture: [
      "Candidate repo",
      "Clone & index",
      "Token-budget chunks",
      "Role-aware LLM eval",
      "Scored report",
    ],
    fa: {
      problem:
        "غربال‌کردن دستی کاندیداهای مهندسی مقیاس‌پذیر نیست. این ابزار یه ریپازیتوری واقعی رو می‌خونه و تبدیلش می‌کنه به یه ارزیابی ساختارمند و متناسب با نقش.",
      role: "معماری‌اش رو طراحی کردم و با Python روی OpenRouter ساختمش.",
      highlights: [
        {
          title: "معماری ports-and-adapters",
          body: "یه هستهٔ hexagonalِ تمیز باعث می‌شه LLM، سیستم کنترل نسخه و گزارش‌گیری قابل‌تعویض و قابل‌تست بمونن.",
        },
        {
          title: "جابه‌جایی بین چند مدل",
          body: "بین مدل‌ها جابه‌جا می‌شه تا یه مشکل کوچیک از سمت سرویس‌دهنده یه بررسی رو خراب نکنه.",
        },
        {
          title: "مدیریت بودجهٔ token",
          body: "ریپازیتوری‌های بزرگ رو با مدیریت دقیق token توی context window مدل جا می‌ده.",
        },
      ],
      outcomes: [
        "از هر ریپازیتوری کاندیدا یه گزارش استخدامیِ امتیازدار می‌سازه.",
        "روی کدبیس‌های بزرگ، قابل‌اعتماد و با هزینهٔ کنترل‌شده باقی می‌مونه.",
      ],
      architecture: [
        "ریپازیتوری کاندیدا",
        "clone و ایندکس",
        "تکه‌بندی با بودجهٔ token",
        "ارزیابی LLM متناسب با نقش",
        "گزارش امتیازدار",
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

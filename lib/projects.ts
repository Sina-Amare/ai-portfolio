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
      "یه URL می‌دی و LLM فیلدها و selectorهای استخراج رو پیشنهاد می‌ده؛ برنامه اون‌ها رو روی HTML واقعی چک و اصلاح می‌کنه، بعد صفحه‌ها رو crawl می‌کنه و خروجی تمیز CSV/JSON/XLSX تحویل می‌ده.",
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
      "Survives its own failures: crawl pages are leased and written idempotently, a reaper reclaims dead leases, and a watchdog re-dispatches stalled runs — a mid-crawl crash costs a retry, not the dataset.",
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
        "اسکریپرهایی که با selector دستی ساخته می‌شن خیلی شکننده‌ان — یه تغییر کوچیک توی ظاهر صفحه کافیه تا بی‌سروصدا دیگه هیچی برنگردونن. ScrapeGPT پیدا کردن selectorها رو می‌سپره به LLM و بعد استخراج رو مقاوم می‌کنه: هر selector روی HTML واقعی دوباره چک می‌شه، اونایی که جواب نمی‌دن خودکار اصلاح می‌شن، و چند مسیر جایگزین هم هست تا حتی وقتی حدس AI غلط از آب درمیاد، باز هم داده به دست بیاد.",
      role: "کل استک رو خودم طراحی کردم و ساختم — بک‌اند FastAPI و PostgreSQL، یه لایه LLM مستقل از provider (با LiteLLM) که کلید API خود کاربر رو رمزنگاری‌شده نگه می‌داره، و رابط کاربری React/TypeScript.",
      highlights: [
        {
          title: "AI پیشنهاد می‌ده، کد تأیید می‌کنه",
          body: "LLM به جای HTML خام، یه خلاصه تمیز از ساختار صفحه می‌خونه و selector آیتم‌های تکراری و تک‌تک فیلدها رو پیشنهاد می‌ده — ولی سیستم هیچ‌وقت چشم‌بسته به این پیشنهادها اعتماد نمی‌کنه.",
        },
        {
          title: "selectorهایی که خودشون رو ترمیم می‌کنن",
          body: "هر selector یه بار دیگه روی صفحه واقعی اجرا می‌شه؛ اونایی که چیزی پیدا نمی‌کنن اول ساده‌تر می‌شن و اگه باز جواب ندن کنار می‌رن. یه مسیر جایگزین بر پایه ساختار جدول هم هست — پس حتی یه حدس ناقص هم داده برمی‌گردونه.",
        },
        {
          title: "صفحه‌های تعاملی رو هم بلده",
          body: "کنترل‌های تعاملی صفحه (مثل دکمه Metric/Imperial) رو تشخیص می‌ده، با یه مرورگر واقعی حالت‌هاشون رو عوض می‌کنه و از هر حالت جداگانه خروجی می‌گیره — نه فقط از HTML ثابت.",
        },
        {
          title: "امنیت از پایه",
          body: "در برابر حمله SSRF محافظت می‌شه (بررسی تک‌تک redirectها و قفل کردن IP مقصد در برابر DNS rebinding)، و کلید API خود کاربر هم با Fernet رمزنگاری و نگهداری می‌شه.",
        },
      ],
      outcomes: [
        "هر صفحه با یه مسیر مرحله‌به‌مرحله — تحلیل، بازبینی، انتخاب محدوده، استخراج — تبدیل می‌شه به خروجی تمیز CSV / JSON / XLSX، همراه با نشونه‌هایی که می‌گن پوشش هر فیلد چقدر کامله.",
        "وقتی selectorهای AI بی‌نقص نیستن، به جای اینکه دست‌خالی برگرده، هر چی قابل استخراجه رو تحویل می‌ده.",
        "از crash هم جون سالم به در می‌بره: صفحه‌ها اجاره‌ای (lease) پردازش می‌شن و نتیجه‌ها طوری نوشته می‌شن که تکرارشون مشکلی درست نکنه؛ اجاره‌های رهاشده پس گرفته می‌شن و یه watchdog اجراهای گیرکرده رو دوباره راه می‌ندازه — یعنی crash وسط کار فقط یه تلاش دوباره هزینه داره، نه کل دیتاست.",
      ],
      architecture: [
        "URL",
        "دریافت امن",
        "خلاصه صفحه",
        "پیشنهاد selector",
        "چک و ترمیم",
        "crawl و خروجی",
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
    taglineFa: "تلگرام، ولی با AI — یه مسنجر self-hosted",
    year: "2025",
    stack: ["Python", "Telethon", "FastAPI", "PWA", "Gemini"],
    repo: "https://github.com/Sina-Amare/Aigram",
    featured: true,
    span: "normal",
    summary:
      "Turns your own Telegram account into a self-hosted, installable AI messenger (formerly SakaiBot). Read and send messages with inline media in a glassy web app, and call an LLM right inside any chat — analyze, ask, translate, image, voice. AI results land in a panel, so you decide what to send.",
    summaryFa:
      "اکانت تلگرام خودت رو تبدیل می‌کنه به یه مسنجر هوشمند و قابل نصب (اسم قبلیش SakaiBot بود). توی یه وب‌اپ تمیز پیام می‌خونی و می‌فرستی — با عکس و ویس و استیکر — و توی هر چت هم می‌تونی از AI کمک بگیری: تحلیل چت، پرسش، ترجمه، ساخت تصویر، صدا. جواب AI اول توی یه پنل میاد و خودت تصمیم می‌گیری چی ارسال بشه.",
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
        "تلگرام AI داخلی نداره و راه‌های معمول اضافه کردنش هم جالب نیستن: یا باید مدام بین تلگرام و یه اپ دیگه کپی‌پیست کنی، یا اکانتت رو بسپری دست یه بات غریبه. Aigram به شکل یوزربات روی اکانت خودت اجرا می‌شه (با Telethon) و پشتش یه وب‌اپ تمیز و قابل نصب داره: یه مسنجر واقعی که باهاش می‌خونی و می‌فرستی، و توی هر چت یه دستیار AI کنارته — اکانت خودت، کلید خودت، سرور خودت.",
      role: "از صفر تا صد با Python ساختمش — هسته Telethon/MTProto، یه PWA با FastAPI و جاوااسکریپت خالص روی همون asyncio loop، لایه AI با چند provider، و یه مسیر ارسال واحد و کنترل‌شده که با فاصله‌گذاری بین پیام‌ها جلوی بن شدن اکانت رو می‌گیره.",
      highlights: [
        {
          title: "یه مسنجر واقعی و قابل نصب",
          body: "یه وب‌اپ تمیز روی اکانت خودت: حباب‌های پیام گروه‌بندی‌شده، عکس و استیکر و ویس داخل خود چت، ریپلای و ادیت و فوروارد و حذف، تایپینگ و وضعیت آنلاین لحظه‌ای، تم دارک و لایت — و با یه Cloudflare Tunnel رایگان می‌شینه روی صفحه اصلی گوشیت.",
        },
        {
          title: "AI توی هر چت — کنترل دست خودت",
          body: "توی هر چت یه منوی ✨ AI هست: تحلیل چت یا پرسش از تاریخچه‌ش، پرسیدن هر سوالی (با تفکر عمیق و جست‌وجوی وب)، ترجمه با تلفظ فارسی، ساخت تصویر، تبدیل متن به صدا و برعکس. جواب‌ها توی یه پنل ذخیره و دسته‌بندی می‌شن — و تا خودت نخوای هیچی ارسال نمی‌شه.",
        },
        {
          title: "فقط یه مسیر به تلگرام می‌نویسه",
          body: "FastAPI و کلاینت Telethon یه session مشترک MTProto دارن، روی یه asyncio loop. توی کل پروژه فقط یه ماژول اجازه داره روی تلگرام بنویسه — اون هم با فاصله‌گذاری بین پیام‌ها و مدیریت FloodWait، که اکانتت بن نشه.",
        },
        {
          title: "زیر فشار سهمیه سرپا می‌مونه",
          body: "Gemini سرویس اصلیه و OpenRouter پشتیبان؛ برای هر کدوم تا ۴ کلید می‌چرخه و موقع خطا یا تموم شدن سهمیه، خودکار جابه‌جا می‌شه. کلیدها رو هم همون لحظه توی پنل اضافه و تست و عوض می‌کنی، بدون restart.",
        },
      ],
      outcomes: [
        "یه مسنجر واقعی به‌علاوه یه دستیار AI، روی اکانت تلگرام خودت — قابل نصب روی گوشی، بدون اینکه session دست هیچ سرویس واسطی باشه.",
        "هر جای ارزونی اجرا می‌شه: یه VPS ماهی ۱٫۴۹ یورو، کامپیوتر خونه، Termux یا رزبری‌پای — با مسیر راه‌اندازی‌ای که از داخل ایران هم جواب می‌ده.",
      ],
      architecture: [
        "انتخاب چت",
        "منوی AI",
        "انتخاب سرویس و کلید",
        "LLM · تصویر · صدا",
        "جواب توی پنل",
        "ارسال با خودت",
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
    slug: "promptamp",
    name: "PromptAmp",
    tagline: "The prompt amplifier — your keys, any site",
    taglineFa: "تقویت‌کننده prompt — با کلید خودت، توی هر سایتی",
    year: "2026",
    stack: ["TypeScript", "WXT", "Manifest V3", "Vitest", "Playwright"],
    repo: "https://github.com/Sina-Amare/promptamp",
    featured: true,
    span: "normal",
    summary:
      "A browser extension that turns a rough draft into an engineered prompt inside any text field on any site — with your own API key. The result appears next to your original, nothing is replaced until you accept, and pasted code comes back byte-for-byte. Live on Firefox Add-ons.",
    summaryFa:
      "یه اکستنشن مرورگر که پیش‌نویس خام رو همون‌جا — توی هر فیلد متنی، توی هر سایتی — تبدیل می‌کنه به یه prompt درست‌وحسابی، با API key خودت. نتیجه کنار متن خودت نشون داده می‌شه و تا تأیید نکنی هیچی جایگزین نمی‌شه؛ کدی هم که paste کرده باشی بدون یه ذره تغییر برمی‌گرده. روی Firefox Add-ons منتشر شده.",
    problem:
      "Everyone types half-formed requests into AI tools and gets mediocre results — prompt-engineering advice lives in blog posts nobody applies mid-task. PromptAmp moves that skill into the text field itself: one tap turns the rough thought into a precise, structured prompt, in place, in English or Persian — and if the draft contains code or a log, that content is reproduced exactly; only the ask gets engineered.",
    role: "Built it end-to-end in TypeScript on WXT — the six-tier insertion engine, the BYOK provider layer with its failover chain and PKCE OAuth, the popup/options UI, and the Vitest + Playwright suites that drive the built extension in a real browser.",
    highlights: [
      {
        title: "Works in any text field",
        body: "Injecting text into other sites is the genuinely hard part — modern editors like the ones ChatGPT and Notion use silently reject it. PromptAmp's insertion engine tries six strategies in order, each writing the way real typing does, so the page's editor keeps working and your Ctrl+Z survives.",
      },
      {
        title: "Your keys, eight providers",
        body: "Strictly bring-your-own-key: OpenAI, Anthropic, Gemini, Groq, OpenRouter via one-click OAuth, local Ollama / LM Studio, or any OpenAI-compatible endpoint. The list order is a failover chain — a bad key or exhausted quota falls through to the next provider; a model's refusal deliberately doesn't.",
      },
      {
        title: "Keeps what you paste",
        body: "Pasted code, logs, and documents are reproduced byte-for-byte; only the rough request around them is engineered. Drafts work in English or Persian, and can output in a different language than they were written in.",
      },
      {
        title: "Private by construction",
        body: "No backend, no telemetry, no accounts. Keys live in storage.local (never sync), host permissions cover exactly the providers you use, and a soft spend cap warns before a runaway bill.",
      },
    ],
    outcomes: [
      "Published on Firefox Add-ons (AMO), with Chrome and Edge builds shipping from the same WXT codebase.",
      "Turns 'make it faster and add validation' into a structured, precise prompt with one tap — without your pasted code coming back changed.",
    ],
    architecture: [
      "Rough draft",
      "✦ button",
      "Your provider chain",
      "Side-by-side review",
      "Accept",
      "Insert into page",
    ],
    fa: {
      problem:
        "همه‌مون درخواست‌های نصفه‌نیمه توی ابزارهای AI می‌نویسیم و جواب‌های متوسط می‌گیریم؛ ترفندهای prompt نوشتن هم ته بلاگ‌پست‌هایی مونده که وسط کار کسی سراغشون نمی‌ره. PromptAmp این مهارت رو میاره توی خود فیلد متنی: یه کلیک، و فکر خام همون‌جا تبدیل می‌شه به یه prompt دقیق و مرتب — به انگلیسی یا فارسی. اگه هم توی پیش‌نویست کد یا لاگ باشه، عین خودش می‌مونه؛ فقط درخواستت بازنویسی می‌شه.",
      role: "کل اکستنشن رو با TypeScript روی WXT ساختم — موتور شش‌مرحله‌ای درج متن، لایه providerها با کلید خود کاربر و زنجیره failover و ورود OAuth، صفحه‌های popup و تنظیمات، و تست‌های Vitest و Playwright که اکستنشن ساخته‌شده رو توی مرورگر واقعی اجرا می‌کنن.",
      highlights: [
        {
          title: "توی هر فیلد متنی کار می‌کنه",
          body: "نوشتن متن توی سایت‌های دیگه همون بخش سخت ماجراست — ادیتورهای مدرن (مثل چیزی که ChatGPT یا Notion دارن) متن تزریقی رو بی‌سروصدا پس می‌زنن. PromptAmp شش روش رو به ترتیب امتحان می‌کنه و هر کدوم مثل تایپ واقعی می‌نویسن؛ نتیجه اینکه ادیتور صفحه خراب نمی‌شه و Ctrl+Z خودت هم سر جاشه.",
        },
        {
          title: "کلید خودت، هشت provider",
          body: "کاملاً با کلید خودت کار می‌کنه: OpenAI، ‏Anthropic، ‏Gemini، ‏Groq، ‏OpenRouter (با ورود یک‌کلیکی)، ‏Ollama و LM Studio روی سیستم خودت، یا هر سرویس سازگار با OpenAI. ترتیب لیست همون زنجیره failover هست: اگه کلیدی خطا بده یا سهمیه‌ش تموم شه، خودش می‌ره سراغ بعدی — ولی اگه مدلی از جواب دادن طفره بره، عمداً سراغ مدل بعدی نمی‌ره.",
        },
        {
          title: "چیزی که paste کردی دست نمی‌خوره",
          body: "کد، لاگ یا متنی که paste کردی عین خودش برمی‌گرده — بایت‌به‌بایت. فقط درخواستی که دورش نوشتی بازنویسی می‌شه. پیش‌نویس می‌تونه فارسی یا انگلیسی باشه و خروجی هم اگه بخوای به زبون دیگه‌ای در میاد.",
        },
        {
          title: "حریم خصوصی از پایه",
          body: "نه سروری در کاره، نه آماری جمع می‌شه، نه اکانتی لازمه. کلیدها فقط روی مرورگر خودت می‌مونن و هیچ‌وقت sync نمی‌شن، دسترسی اکستنشن محدود به همون سرویس‌هاییه که خودت انتخاب کردی، و یه سقف هزینه هم هست که قبل از بالا رفتن خرجت هشدار می‌ده.",
        },
      ],
      outcomes: [
        "روی Firefox Add-ons (AMO) منتشر شده؛ نسخه‌های Chrome و Edge هم از همین یه codebase بیرون میان.",
        "«سریع‌ترش کن و ولیدیشن اضافه کن» با یه کلیک تبدیل می‌شه به یه prompt دقیق و ساخت‌یافته — بدون اینکه کد paste‌شده‌ت دست بخوره.",
      ],
      architecture: [
        "پیش‌نویس خام",
        "دکمه ✦",
        "زنجیره providerها",
        "مقایسه کنار هم",
        "تأیید",
        "درج توی صفحه",
      ],
    },
    cover: "/projects/promptamp/preserve.webp",
    media: [
      { type: "image", src: "/projects/promptamp/preserve.webp", caption: "Keeps what you paste — code comes back byte-for-byte, only the ask gets engineered, in English or Persian" },
      { type: "image", src: "/projects/promptamp/languages.webp", caption: "Any rough idea, in any language — a Persian draft becomes a polished English prompt" },
    ],
  },
  {
    slug: "github-code-review",
    name: "RubricEval",
    tagline: "A rubric-driven code-evaluation platform",
    taglineFa: "پلتفرم ارزیابی کد بر پایه rubric",
    year: "2025",
    stack: ["Next.js", "FastAPI", "LiteLLM", "PostgreSQL"],
    repo: "https://github.com/Sina-Amare/github-code-review",
    featured: true,
    span: "wide",
    summary:
      "Define a versioned rubric of weighted, gated criteria; submit a GitHub repo or ZIP and watch an LLM grade each criterion live against the real code — but a deterministic policy in code makes the final accept / review / reject call, reproducible and auditable.",
    summaryFa:
      "یه rubric نسخه‌دار از معیارهای وزن‌دار تعریف می‌کنی، یه ریپوی GitHub یا فایل ZIP می‌فرستی، و زنده تماشا می‌کنی که LLM به هر معیار روی کد واقعی نمره می‌ده — ولی تصمیم نهایی قبول / بازبینی / رد رو یه policy قطعی توی کد می‌گیره؛ قابل تکرار و قابل حسابرسی.",
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
        body: "A durable leased job queue (survives crashes, scales across workers), live replayable SSE streaming, a swappable FakeLLM for offline/CI runs, and a golden-set regression harness.",
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
        "بیشتر «ریویوئرهای کد AI» سه تا کار متفاوت رو قاطی هم می‌کنن: چی ارزیابی بشه، چطور قضاوت بشه، و چطور تصمیم گرفته بشه. RubricEval این سه تا رو از هم جدا می‌کنه — rubric یه داده نسخه‌داره، LLM فقط به هر معیار روی کد واقعی نمره می‌ده، و تصمیم نهایی رو یه تابع policy قطعی می‌گیره. نتیجه اینکه یه تغییر کوچیک توی prompt نمی‌تونه بی‌سروصدا همه نتیجه‌ها رو عوض کنه و هر تصمیمی قابل تکراره.",
      role: "کل پلتفرم رو طراحی کردم و ساختم — بک‌اند FastAPI با SQLAlchemy غیرهمزمان و یه صف کار مقاوم، و فرانت‌اند Next.js با TypeScript.",
      highlights: [
        {
          title: "مدل نمره می‌ده، کد تصمیم می‌گیره",
          body: "LLM به هر معیار نمره می‌ده، ولی تصمیم قبول / بازبینی / رد رو یه تابع policy ساده و کاملاً تست‌شده می‌گیره — نتیجه‌ها قابل تکرارن و اسیر حال‌وهوای مدل نیستن.",
        },
        {
          title: "شواهد با فایل‌های واقعی چک می‌شن",
          body: "هر ارجاعی که مدل می‌ده (مسیر فایل، شماره خط، نقل‌قول) با کد واقعی مقایسه می‌شه و اگه تأیید نشه، علامت می‌خوره — مدرک ساختگی جایی برای قایم شدن نداره.",
        },
        {
          title: "rubric یعنی داده، نه کد",
          body: "هر rubric استانداردسازی و hash می‌شه؛ هر ارزیابی هم hash همون rubric و اسم مدل و نسخه prompt رو ثبت می‌کنه. پس نه rubric منتشرشده بی‌خبر عوض می‌شه، نه نتیجه‌ای غیرقابل تکرار می‌مونه.",
        },
        {
          title: "ساخته‌شده برای اجرای بی‌وقفه",
          body: "صف کاری که از crash جون سالم به در می‌بره و بین چند worker پخش می‌شه، گزارش زنده با قابلیت پخش دوباره، یه LLM ساختگی (FakeLLM) برای اجرای آفلاین و تست، و یه مجموعه مرجع برای سنجش هر تغییر prompt یا مدل.",
        },
      ],
      outcomes: [
        "ریویو کد رو تبدیل می‌کنه به یه تصمیم قابل تکرار و قابل حسابرسی بر پایه rubric — نه نظری که یه LLM همون یه بار داده.",
        "کل موتور بدون اینترنت و به شکل قطعی اجرا می‌شه (با FakeLLM) و هر تغییر prompt یا مدل با یه مجموعه مرجع سنجیده می‌شه.",
      ],
      architecture: [
        "ریپو یا ZIP",
        "دریافت و یکسان‌سازی",
        "نمره به هر معیار",
        "چک کردن شواهد",
        "policy قطعی",
        "گزارش زنده",
      ],
    },
    cover: "/projects/github-code-review/live-evaluation.webp",
    media: [
      { type: "image", src: "/projects/github-code-review/live-evaluation.webp", caption: "Live per-criterion evaluation streaming to an accept / review / reject decision" },
      { type: "image", src: "/projects/github-code-review/report.webp", caption: "Final report — every verdict carries evidence, each citation highlighted against the real file in Monaco (the VS Code editor)" },
      { type: "image", src: "/projects/github-code-review/task-builder.webp", caption: "Rubric as data — weighted criteria and gates, versioned and content-hashed" },
      { type: "image", src: "/projects/github-code-review/dashboard.webp", caption: "Tasks and recent verdicts at a glance" },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const featuredProjects = projects.filter((p) => p.featured);

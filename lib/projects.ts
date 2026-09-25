/** A screenshot or video shown in the case-study gallery. Drop files in
 *  public/projects/<slug>/ and reference them here. Videos use a poster image. */
export type MediaItem = {
  type: "image" | "video";
  src: string;
  poster?: string;
  caption?: string;
  captionFa?: string;
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
      "لینک صفحه رو می‌دی؛ LLM پیشنهاد می‌ده چه داده‌هایی رو از کجا برداریم. برنامه پیشنهادها رو روی HTML واقعی امتحان می‌کنه، خطاها رو اصلاح می‌کنه و در آخر دادهٔ تمیز رو به شکل CSV، JSON یا XLSX تحویل می‌ده.",
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
        "وقتی برای استخراج داده از یه سایت selectorها رو دستی می‌نویسی، یه تغییر کوچیک توی صفحه ممکنه همه‌چیز رو خراب کنه. بدتر اینکه گاهی برنامه بی‌سروصدا خروجی خالی می‌ده. ScrapeGPT از LLM کمک می‌گیره تا selectorها رو پیدا کنه، اما بعد خودش تک‌تک‌شون رو روی صفحهٔ واقعی امتحان می‌کنه. اگه چیزی پیدا نشه، selector رو اصلاح می‌کنه یا از مسیر جایگزین می‌ره تا کار با یه حدس اشتباه متوقف نشه.",
      role: "طراحی و ساخت کل برنامه با من بود: بک‌اند FastAPI و PostgreSQL، لایهٔ LLM با LiteLLM که به یه سرویس خاص وابسته نیست و کلید کاربر رو رمزنگاری می‌کنه، و رابط کاربری React/TypeScript.",
      highlights: [
        {
          title: "AI پیشنهاد می‌ده، کد تأیید می‌کنه",
          body: "LLM خلاصه‌ای از ساختار صفحه رو می‌بینه و selector آیتم‌ها و فیلدها رو پیشنهاد می‌ده. برنامه هر پیشنهاد رو روی HTML واقعی امتحان می‌کنه؛ صرفِ جواب مدل کافی نیست.",
        },
        {
          title: "وقتی صفحه عوض می‌شه، کار ادامه پیدا می‌کنه",
          body: "اگه یه selector چیزی پیدا نکنه، برنامه ساده‌ترش می‌کنه و دوباره امتحان می‌کنه. برای جدول‌ها هم یه روش جایگزین داره تا با یک پیشنهاد ناقص، کل استخراج از کار نیفته.",
        },
        {
          title: "با صفحه‌های تعاملی هم کار می‌کنه",
          body: "اگه داده پشت یه دکمه یا منوی کشویی باشه، کنترل رو پیدا می‌کنه و با مرورگر واقعی حالت‌های مختلفش رو باز می‌کنه. مثلاً می‌تونه هر دو حالت Metric و Imperial رو جداگانه بخونه.",
        },
        {
          title: "امنیت از پایه",
          body: "آدرس مقصد در هر redirect بررسی می‌شه و IP اتصال ثابت می‌مونه تا راه حمله‌های SSRF و DNS rebinding بسته بشه. کلید API کاربر هم با Fernet رمزنگاری می‌شه.",
        },
      ],
      outcomes: [
        "از بررسی صفحه تا انتخاب محدوده و استخراج، کاربر قدم‌به‌قدم جلو می‌ره. در آخر خروجی CSV، JSON یا XLSX می‌گیره و می‌بینه هر فیلد چقدر کامل استخراج شده.",
        "اگه پیشنهاد LLM کامل نباشه، برنامه روش‌های دیگه رو امتحان می‌کنه و داده‌هایی رو که پیدا کرده از دست نمی‌ده.",
        "اگه وسط crawl برنامه قطع بشه، صفحه‌های نیمه‌تمام دوباره پردازش می‌شن. نتیجه‌ها هم طوری ذخیره می‌شن که اجرای دوباره دادهٔ تکراری نسازه؛ لازم نیست کل کار از اول شروع بشه.",
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
      {
        type: "image",
        src: "/projects/scrapegpt/extraction-results.webp",
        caption:
          "The payoff — 96 records scraped into a clean table, each with its source URL, ready to export as CSV / JSON / XLSX",
        captionFa:
          "۹۶ ردیف دادهٔ تمیز، هرکدوم با لینک منبع؛ آمادهٔ خروجی CSV / JSON / XLSX",
      },
      {
        type: "image",
        src: "/projects/scrapegpt/workspace.webp",
        caption:
          "Guided analyze → review → scope → extract, with the AI's confidence per page",
        captionFa:
          "از تحلیل صفحه تا بازبینی و استخراج؛ میزان اطمینان AI هم برای هر صفحه مشخصه",
      },
      {
        type: "image",
        src: "/projects/scrapegpt/quality.webp",
        caption:
          "Trust signals after a run — 96 records, nothing blocked or failed, and 100% coverage on every field",
        captionFa:
          "نتیجهٔ اجرا: ۹۶ ردیف، بدون صفحهٔ مسدود یا ناموفق، با پوشش کامل همهٔ فیلدها",
      },
      {
        type: "image",
        src: "/projects/scrapegpt/providers.webp",
        caption:
          "Bring-your-own-key providers, encrypted at rest and tested before use",
        captionFa:
          "سرویس‌های AI با کلید خودت؛ کلیدها رمزنگاری و قبل از استفاده تست می‌شن",
      },
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
      "اکانت تلگرام خودت رو به یه مسنجر قابل نصب با AI تبدیل می‌کنه (اسم قبلیش SakaiBot بود). پیام‌ها و عکس و ویس رو توی وب‌اپ می‌بینی و می‌فرستی؛ توی هر چت هم می‌تونی از AI برای تحلیل، ترجمه، تصویر یا صدا کمک بگیری. جواب اول به خودت نشون داده می‌شه و ارسالش دست توئه.",
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
        "برای کمک گرفتن از AI وسط چت، معمولاً باید متن رو از تلگرام به یه برنامهٔ دیگه ببری. Aigram این کار رو داخل یه مسنجر قابل نصب انجام می‌ده که روی اکانت خودت اجرا می‌شه. پیام می‌خونی و می‌فرستی و دستیار AI هم توی همون چت در دسترسه؛ اکانت، کلیدها و سرور دست خودته.",
      role: "همهٔ بخش‌هاش رو با Python ساختم: اتصال Telethon/MTProto، وب‌اپ PWA با FastAPI و جاوااسکریپت روی یک asyncio loop، لایهٔ AI با چند سرویس و یک مسیر کنترل‌شده برای ارسال پیام.",
      highlights: [
        {
          title: "یه مسنجر واقعی و قابل نصب",
          body: "توی وب‌اپ می‌تونی پیام‌ها رو با عکس، استیکر و ویس ببینی؛ جواب بدی، ویرایش کنی یا بفرستی جلو. وضعیت تایپ و آنلاین بودن هم زنده میاد. نسخهٔ PWA با Cloudflare Tunnel روی گوشی نصب می‌شه.",
        },
        {
          title: "AI توی هر چت — کنترل دست خودت",
          body: "توی هر چت می‌تونی از AI دربارهٔ تاریخچهٔ همون گفتگو بپرسی، با جست‌وجوی وب جواب بگیری، ترجمه کنی، تصویر بسازی یا متن و صدا رو تبدیل کنی. جواب‌ها توی پنل ذخیره می‌شن و تا خودت انتخاب نکنی، برای کسی ارسال نمی‌شن.",
        },
        {
          title: "فقط یه مسیر به تلگرام می‌نویسه",
          body: "FastAPI و Telethon روی یک asyncio loop کار می‌کنن و یک session دارن. همهٔ پیام‌های خروجی از یک مسیر می‌گذرن؛ هم فاصلهٔ بین ارسال‌ها کنترل می‌شه، هم خطای FloodWait مدیریت می‌شه.",
        },
        {
          title: "زیر فشار سهمیه سرپا می‌مونه",
          body: "Gemini سرویس اصلیه و OpenRouter پشتیبان. اگه یه کلید خطا بده یا سهمیه‌ش تموم بشه، برنامه بین کلیدها جابه‌جا می‌شه. می‌تونی تا چهار کلید برای هر سرویس توی پنل اضافه و تست کنی، بدون restart.",
        },
      ],
      outcomes: [
        "مسنجر و دستیار AI روی اکانت خودت کار می‌کنن و روی گوشی هم قابل نصب‌اند؛ session اکانت پیش خودت می‌مونه.",
        "روی یه VPS ارزون، کامپیوتر خونه، Termux یا رزبری‌پای اجرا می‌شه. حتی برای راه‌اندازی از داخل ایران هم مسیر مشخص داره.",
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
      {
        type: "image",
        src: "/projects/aigram/chat-dark.webp",
        caption:
          "A real Telegram messenger on your own account — grouped bubbles, inline media, live typing, dark + light",
        captionFa:
          "مسنجر روی اکانت خودت؛ پیام‌ها، عکس و ویس، وضعیت لحظه‌ای و تم روشن و تیره",
      },
      {
        type: "image",
        src: "/projects/aigram/ai-result.webp",
        caption:
          "AI runs inside the chat; results land in the panel — saved, categorized, and yours to send or not",
        captionFa:
          "AI داخل همون چت جواب می‌ده؛ نتیجه توی پنل می‌مونه تا خودت برای ارسالش تصمیم بگیری",
      },
      {
        type: "image",
        src: "/projects/aigram/ai-sheet.webp",
        caption:
          "The ✨ AI sheet — analyze, ask, prompt, translate, image, TTS/STT",
        captionFa: "منوی AI برای تحلیل، پرسش، ترجمه، تصویر و تبدیل متن و صدا",
      },
      {
        type: "image",
        src: "/projects/aigram/chat-mobile.webp",
        caption:
          "Installable PWA — the full messenger on your phone over a free Cloudflare Tunnel",
        captionFa:
          "نسخهٔ قابل نصب روی گوشی، با دسترسی از راه Cloudflare Tunnel",
      },
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
      "یه اکستنشن مرورگر که درخواست خامت رو همون‌جا، توی فیلد متن هر سایتی، به یه prompt دقیق تبدیل می‌کنه. با کلید API خودت کار می‌کنه؛ نتیجه رو کنار متن اصلی می‌بینی و تا تأیید نکنی چیزی عوض نمی‌شه. کد paste‌شده هم دست‌نخورده می‌مونه. روی Firefox Add-ons منتشر شده.",
    problem:
      "Everyone types half-formed requests into AI tools and gets mediocre results — prompt-engineering advice lives in blog posts nobody applies mid-task. PromptAmp moves that skill into the text field itself: one tap turns the rough thought into a precise, structured prompt, in place, in whatever language you wrote it — and if the draft contains code or a log, that content is reproduced exactly; only the ask gets engineered.",
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
        body: "Pasted code, logs, and documents are reproduced byte-for-byte; only the rough request around them is engineered. Write the draft in any language and the prompt comes back in that language — or pick any output language you like, so a Persian draft can become a polished English prompt.",
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
        "وسط کار با ابزارهای AI، خیلی وقت‌ها یه درخواست عجولانه می‌نویسی و جواب مبهم می‌گیری. PromptAmp همون‌جا که داری متن رو می‌نویسی کمک می‌کنه درخواستت روشن‌تر و دقیق‌تر بشه. یه کلیک می‌کنی، نسخهٔ بهتر رو کنار متن اصلی می‌بینی و خودت تصمیم می‌گیری جاش بذاری یا نه. اگه کد یا لاگ هم paste کرده باشی، فقط متن درخواست تغییر می‌کنه.",
      role: "کل اکستنشن رو با TypeScript و WXT ساختم: موتور درج متن با شش روش، اتصال به چند سرویس AI با کلید خود کاربر و مسیر جایگزین، ورود OAuth، صفحه‌های تنظیمات و تست‌های Vitest و Playwright روی مرورگر واقعی.",
      highlights: [
        {
          title: "توی هر فیلد متنی کار می‌کنه",
          body: "ادیتورهای سایت‌ها یک‌شکل نیستن؛ بعضی‌ها متنی رو که اکستنشن وارد می‌کنه بی‌سروصدا رد می‌کنن. PromptAmp شش روش درج رو به ترتیب امتحان می‌کنه تا متن واقعاً ثبت بشه و Ctrl+Z هم کار کنه.",
        },
        {
          title: "کلید و انتخاب سرویس دست خودته",
          body: "با OpenAI، Anthropic، Gemini، Groq، OpenRouter، Ollama، LM Studio یا سرویس سازگار با OpenAI کار می‌کنه؛ برای OpenRouter ورود یک‌کلیکی هم داره. اگه کلید یا سهمیهٔ یه سرویس مشکل پیدا کنه، سراغ گزینهٔ بعدی می‌ره. جواب ندادن خود مدل باعث جابه‌جایی نمی‌شه.",
        },
        {
          title: "کد و لاگت دقیقاً همون می‌مونه",
          body: "کد، لاگ یا سندی که paste کردی بایت‌به‌بایت حفظ می‌شه؛ فقط درخواستی که دورش نوشتی بهتر می‌شه. زبون خروجی رو هم خودت انتخاب می‌کنی؛ مثلاً می‌تونی از پیش‌نویس فارسی یه prompt انگلیسی بگیری.",
        },
        {
          title: "حریم خصوصی از پایه",
          body: "اکانت و سرور مرکزی لازم نداره. کلیدها توی مرورگر خودت می‌مونن و sync نمی‌شن؛ دسترسی اکستنشن به سرویس‌هایی محدوده که انتخاب کردی. سقف هزینه هم قبل از بالا رفتن خرجت هشدار می‌ده.",
        },
      ],
      outcomes: [
        "روی Firefox Add-ons منتشر شده؛ نسخه‌های Chrome و Edge هم از همون codebase ساخته می‌شن.",
        "یه درخواست کوتاه مثل «سریع‌ترش کن و validation اضافه کن» رو با یه کلیک دقیق‌تر می‌کنه و کد paste‌شده رو همون‌طور نگه می‌داره.",
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
      {
        type: "image",
        src: "/projects/promptamp/preserve.webp",
        caption:
          "Keeps what you paste — code comes back byte-for-byte, only the ask gets engineered, in your draft's language",
        captionFa:
          "کدی که paste کردی دقیقاً همون‌طور می‌مونه؛ فقط درخواستت بهتر نوشته می‌شه",
      },
      {
        type: "image",
        src: "/projects/promptamp/languages.webp",
        caption:
          "Any rough idea, in any language — a Persian draft becomes a polished English prompt",
        captionFa:
          "پیش‌نویس رو به هر زبونی بنویس؛ مثلاً از متن فارسی یه prompt انگلیسی بگیر",
      },
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
      "معیارهای وزن‌دار و شرط‌های لازم رو توی یه rubric نسخه‌دار تعریف می‌کنی و ریپوی GitHub یا فایل ZIP می‌دی. LLM کد رو معیاربه‌معیار بررسی می‌کنه؛ تصمیم نهایی قبول، بازبینی یا رد رو قانون‌های مشخص برنامه می‌گیرن تا نتیجه قابل تکرار باشه.",
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
        "اگه همهٔ ارزیابی کد رو به یه prompt بسپری، معلوم نیست با تغییر prompt چرا نتیجه عوض شده. RubricEval سه کار رو جدا می‌کنه: معیارها توی rubric نسخه‌دار تعریف می‌شن، LLM روی فایل‌های واقعی به هر معیار نمره می‌ده و قانون‌های ثابت برنامه تصمیم نهایی رو می‌گیرن. می‌شه دید هر نتیجه از کجا اومده و بعداً هم دوباره همون ارزیابی رو انجام داد.",
      role: "کل پلتفرم رو طراحی و ساختم: بک‌اند FastAPI با SQLAlchemy غیرهمزمان و صف کار مقاوم، و فرانت‌اند Next.js با TypeScript.",
      highlights: [
        {
          title: "مدل نمره می‌ده، کد تصمیم می‌گیره",
          body: "LLM هر معیار رو جداگانه نمره می‌ده. بعد یه تابع policy تست‌شده با همون نمره‌ها تصمیم قبول، بازبینی یا رد رو می‌گیره؛ تصمیم به تغییر حال‌وهوای مدل وابسته نمی‌مونه.",
        },
        {
          title: "شواهد با فایل‌های واقعی چک می‌شن",
          body: "اگه مدل به یه فایل، شماره‌خط یا تکه‌کد استناد کنه، برنامه اون رو با فایل واقعی مقایسه می‌کنه. ارجاعی که پیدا نشه مشخص می‌شه تا به عنوان مدرک پذیرفته نشه.",
        },
        {
          title: "می‌شه فهمید هر نتیجه با کدوم معیار به دست اومده",
          body: "هر rubric یه hash داره و کنار نتیجه، اسم مدل و نسخهٔ prompt هم ثبت می‌شه. اگه معیارها بعداً تغییر کنن، معلومه نتیجهٔ قبلی با کدوم نسخه گرفته شده.",
        },
        {
          title: "ارزیابی وسط کار گم نمی‌شه",
          body: "کارها توی صفی می‌مونن که بعد از crash هم ادامه پیدا می‌کنه و بین چند worker پخش می‌شه. نتیجه‌ها زنده پخش می‌شن؛ با FakeLLM و مجموعهٔ مرجع هم می‌شه تغییرهای prompt یا مدل رو آفلاین تست کرد.",
        },
      ],
      outcomes: [
        "برای هر تصمیم، معیارها و شواهدش مشخصه؛ می‌شه ارزیابی رو دوباره انجام داد و نتیجه رو بررسی کرد.",
        "با FakeLLM می‌شه موتور رو بدون اینترنت اجرا کرد و تغییرهای prompt یا مدل رو با یه مجموعهٔ مرجع سنجید.",
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
      {
        type: "image",
        src: "/projects/github-code-review/live-evaluation.webp",
        caption:
          "Live per-criterion evaluation streaming to an accept / review / reject decision",
        captionFa:
          "نمرهٔ هر معیار زنده میاد و در آخر نتیجهٔ قبول، بازبینی یا رد مشخص می‌شه",
      },
      {
        type: "image",
        src: "/projects/github-code-review/report.webp",
        caption:
          "Final report — every verdict carries evidence, each citation highlighted against the real file in Monaco (the VS Code editor)",
        captionFa:
          "گزارش نهایی؛ مدرک هر نتیجه روی خط‌های واقعی فایل نشون داده می‌شه",
      },
      {
        type: "image",
        src: "/projects/github-code-review/task-builder.webp",
        caption:
          "Rubric as data — weighted criteria and gates, versioned and content-hashed",
        captionFa:
          "ساخت rubric با معیارهای وزن‌دار و شرط‌های لازم؛ هر نسخه hash خودش رو داره",
      },
      {
        type: "image",
        src: "/projects/github-code-review/dashboard.webp",
        caption: "Tasks and recent verdicts at a glance",
        captionFa: "تسک‌ها و نتیجه‌های اخیر، همه توی یک صفحه",
      },
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const featuredProjects = projects.filter((p) => p.featured);

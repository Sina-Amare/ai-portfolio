/**
 * Site-wide copy in English + Persian. Technical terms and proper nouns
 * (Python, FastAPI, RAG, Dekamond, …) intentionally stay in Latin script even
 * inside Persian strings — that's how Iranian engineers actually write.
 */
export type Locale = "en" | "fa";

export const LOCALES: Locale[] = ["en", "fa"];

export const dirOf = (l: Locale): "rtl" | "ltr" => (l === "fa" ? "rtl" : "ltr");

export const dict = {
  en: {
    nav: {
      home: "Home",
      projects: "Projects",
      about: "About",
      contact: "Contact",
      resume: "Résumé",
      command: "Command menu",
      menu: "Menu",
      homeLabel: "Sina Amareh — home",
      openMenu: "Open menu",
      closeMenu: "Close menu",
      language: "Language",
    },
    command: {
      placeholder: "Type a command or search…",
      empty: "No results found.",
      groupNav: "Navigation",
      groupLinks: "Links",
      groupTheme: "Theme",
      home: "Home",
      projects: "Projects",
      about: "About",
      contact: "Contact",
      resume: "Résumé",
      github: "GitHub",
      linkedin: "LinkedIn",
      email: "Email me",
      toggleTheme: "Toggle theme",
    },
    hero: {
      available: "available",
    },
    featured: {
      number: "01",
      eyebrow: "Selected work",
      title: "Things I've built",
      description:
        "Production-minded open-source projects where backend resilience meets LLM engineering.",
      all: "All projects",
    },
    work: {
      number: "02",
      eyebrow: "At work",
      title: "Agents built for real workflows",
      description:
        "Two workplace agents for focused social research and department-level decisions, with sources and manager feedback kept in the loop.",
      projectLabel: "Workplace agent",
      problem: "The problem",
      workflow: "How it works",
      decision: "The important decision",
      value: "What changed",
      highlights: "At a glance",
      more: "Explore the work projects",
    },
    about: {
      number: "03",
      eyebrow: "About",
      title: "A bit about me",
      bio: "I'm a Python developer with a Computer Science degree, focused on backend services and LLM-powered applications. Alongside that I work with Mercor as an AI training & evaluation contractor — designing adversarial prompts and tasks that find exactly where frontier models break. I learn mainly by building — my open-source projects are where ideas get tested and pushed toward production quality. I'm early in my career and still growing, but steady about shipping, writing tests, and seeing work through.",
      strengthsLabel: "What I bring",
      strengths: [
        "Applied AI/LLM work — RAG, LangGraph, and multi-provider failover behind FastAPI",
        "Frontier-model evaluation — adversarial prompts, golden answers, and rubrics that make failures reproducible",
        "Resilient backends — jobs are leased and watchdog-recovered, so a crash means a resumed run, not lost work",
        "Quick from prototype to production, with tests and clean architecture",
      ],
      quote:
        "Never had to explain something twice. Never came back empty-handed. Your biggest strength? Being a problem solver.",
      quoteBy: "— my lead at Dekamond",
      stackLabel: { ai: "LLM & AI", backend: "Backend", infra: "Data & Infra" },
      experienceLabel: "Experience",
      experience: [
        {
          role: "AI Training & Evaluation (Contract)",
          org: "Mercor",
          period: "2026 · present",
          note: "Adversarial evaluation of frontier LLMs — designing prompts and tasks built to make strong models fail on web search, multi-step reasoning, and the edge cases where they're confidently wrong, then writing verified golden answers and single-answer rubrics so every failure is reproducible and objectively scorable.",
        },
        {
          role: "Software Developer",
          org: "Dekamond",
          period: "2025 · 6 months",
          note: "Built AI & automation for Kaleri.ai — wrote multiple automation systems and data-scraping pipelines that collect and process data, plus multi-provider LLM workflows (LangGraph, RAG) behind FastAPI for BI tooling and internal developer tools, and cut LLM running costs ~70% with model routing, caching, and prompt optimization.",
        },
        {
          role: "Django Developer (Backend)",
          org: "Arnikup",
          period: "2024 · 6 months",
          note: "Built and maintained REST APIs for a food-delivery platform in a five-person team — modeling catalog and orders in PostgreSQL with Django REST Framework, offloading background work like order processing and notifications to Celery, using Redis for caching and as the task broker, containerizing services with Docker, and testing with pytest.",
        },
      ],
      educationLabel: "Education",
      education: [
        {
          degree: "M.Sc., Software Engineering",
          org: "Islamic Azad University — Science & Research, Tehran",
          period: "2025 – present",
        },
        {
          degree: "B.Sc., Computer Science",
          org: "University of Guilan, Rasht",
          period: "2020 – 2024",
        },
      ],
      recognitionLabel: "Recognition & languages",
      recognition: [
        "2nd place — team Python programming competition, University of Guilan (2023)",
        "Undergraduate research on Particle Swarm Optimization",
        "English (professional working proficiency) · Persian (native)",
      ],
    },
    contact: {
      eyebrow: "Get in touch",
      title: "Let's build something together",
      pitch:
        "I'm open to backend & AI engineering roles and interesting collaborations. Send a note — it reaches me instantly — or email me directly.",
      form: {
        name: "Name",
        namePh: "Your name",
        email: "Email",
        emailPh: "you@company.com",
        contact: "Phone / Telegram",
        optional: "(optional)",
        contactPh: "Another way to reach you",
        message: "Message",
        messagePh: "What would you like to talk about?",
        send: "Send message",
        sending: "Sending…",
        sent: "Message sent.",
        sentNote: "It landed straight in my inbox — I'll get back to you soon.",
        delivered: "delivered",
        another: "Send another",
        errRequired: "Please add your name, email, and a message.",
        errEmail: "That email doesn't look right — mind double-checking it?",
        errGeneric: "Something went wrong. Please try again.",
        errNetwork: "Network error. Please try again.",
        errRate: "Too many messages — please try again in a few minutes.",
        errConfig:
          "The contact channel isn't set up yet — please email me directly.",
      },
    },
    footer: {
      tagline: "Python backend + AI/LLM engineer · Tehran, Iran (UTC+3:30).",
      builtWith:
        "Built with Next.js & a live multi-provider RAG assistant — the chatbot on this site runs on my own code.",
      rights: "All rights reserved.",
    },
    projects: {
      eyebrow: "Work",
      title: "Projects",
      description:
        "Explore the open-source projects in full, then read about two private workplace agents and the problems they solved.",
      moreOnGithub: "More on GitHub",
      moreOnGithubNote:
        "Source for the open-source projects above, plus smaller experiments.",
      back: "All projects",
      year: "Year",
      stack: "Stack",
      viewRepo: "View repository",
      problem: "The problem",
      myRole: "My role",
      howItWorks: "How it works",
      highlights: "Engineering highlights",
      outcomes: "Outcomes",
      gallery: "Gallery",
    },
  },

  fa: {
    nav: {
      home: "خانه",
      projects: "پروژه‌ها",
      about: "درباره",
      contact: "تماس",
      resume: "رزومه",
      command: "دسترسی سریع",
      menu: "منو",
      homeLabel: "سینا عماره — خانه",
      openMenu: "باز کردن منو",
      closeMenu: "بستن منو",
      language: "زبان سایت",
    },
    command: {
      placeholder: "دنبال کدوم بخش می‌گردی؟",
      empty: "چیزی پیدا نشد.",
      groupNav: "بخش‌های سایت",
      groupLinks: "لینک‌ها",
      groupTheme: "ظاهر سایت",
      home: "خانه",
      projects: "پروژه‌ها",
      about: "درباره",
      contact: "تماس",
      resume: "رزومه",
      github: "GitHub",
      linkedin: "LinkedIn",
      email: "ایمیل بهم بزن",
      toggleTheme: "عوض کردن تم",
    },
    hero: {
      available: "آمادهٔ همکاری",
    },
    featured: {
      number: "۰۱",
      eyebrow: "نمونه‌کارها",
      title: "چیزهایی که ساختم",
      description:
        "پروژه‌های متن‌بازی که از یه ایده شروع شدن و تا یه محصول قابل استفاده جلو رفتن.",
      all: "همهٔ پروژه‌ها",
    },
    work: {
      number: "۰۲",
      eyebrow: "پروژه‌های کاری",
      title: "ایجنت‌هایی که یه کار واقعی رو جلو بردن",
      description:
        "دو ایجنت کاری برای تحقیق دقیق‌تر و تصمیم‌گیری دربارهٔ واحدهای کسب‌وکار؛ یکی با لینک منبع، یکی با بازخورد مدیر.",
      projectLabel: "ایجنت کاری",
      problem: "چه مشکلی رو حل کرد؟",
      workflow: "چطور کار می‌کنه؟",
      decision: "تصمیم فنی مهم",
      value: "چه چیزی بهتر شد؟",
      highlights: "در یک نگاه",
      more: "دیدن پروژه‌های کاری",
    },
    about: {
      number: "۰۳",
      eyebrow: "دربارهٔ من",
      title: "کمی دربارهٔ من",
      bio: "من توسعه‌دهنده Python‌ام و علوم کامپیوتر خوندم. بیشتر روی بک‌اند و برنامه‌هایی کار می‌کنم که از LLM استفاده می‌کنن. در کنار توسعه، با Mercor به شکل قراردادی مدل‌های AI رو ارزیابی می‌کنم: سؤال‌ها و تسک‌هایی می‌سازم که نقطه‌ضعف مدل‌های قوی رو پیدا کنن. بهترین راه یاد گرفتن برام ساختن چیزهای واقعیه؛ پروژه‌های متن‌بازم هم جایی‌ان که ایده‌ها رو امتحان می‌کنم و تا یه محصول قابل استفاده جلو می‌برم. هنوز اول مسیر حرفه‌ایم، ولی تحویل دادن کار درست، تست کردن و تموم کردن چیزی که شروع کردم برام جدیه.",
      strengthsLabel: "توی کار چه چیزهایی بلدم؟",
      strengths: [
        "ساخت برنامه‌های AI با RAG و LangGraph؛ جابه‌جایی بین چند مدل و سرویس پشت FastAPI",
        "ارزیابی LLM با سؤال‌های چالشی، جواب مرجع و rubricهایی که خطاها رو قابل تکرار می‌کنن",
        "بک‌اندی که بعد از crash هم کارش رو ادامه می‌ده: کارهای نیمه‌تمام دوباره برداشته می‌شن",
        "رسوندن ایده به محصولی که کار می‌کنه، با تست و کدی که بشه نگهش داشت",
      ],
      quote:
        "هیچ‌وقت لازم نشد چیزی رو دو بار بهت بگم. هیچ‌وقت دست‌خالی برنگشتی. بزرگ‌ترین نقطه‌قوتت؟ این‌که مشکل رو واقعاً حل می‌کنی.",
      quoteBy: "— سرپرستم در Dekamond",
      stackLabel: {
        ai: "LLM و AI",
        backend: "بک‌اند",
        infra: "داده و زیرساخت",
      },
      experienceLabel: "سابقهٔ کاری",
      experience: [
        {
          role: "آموزش و ارزیابی AI (قراردادی)",
          org: "Mercor",
          period: "۲۰۲۶ · اکنون",
          note: "برای ارزیابی مدل‌های AI، سؤال‌ها و تسک‌هایی می‌سازم که جاهای سخت رو هدف می‌گیرن: جست‌وجوی وب، استدلال چندمرحله‌ای و جواب‌های اشتباهی که خیلی مطمئن بیان می‌شن. برای هر تسک هم جواب مرجع و rubric دقیق می‌نویسم تا بشه خطا رو دوباره دید و با معیار مشخص نمره داد.",
        },
        {
          role: "توسعه‌دهنده نرم‌افزار",
          org: "Dekamond",
          period: "۲۰۲۵ · ۶ ماه",
          note: "برای Kaleri.ai روی AI و اتوماسیون کار کردم: چند سیستم جمع‌آوری و پردازش داده ساختم، برای ابزارهای داخلی و تحلیل کسب‌وکار جریان‌های کاری LLM با LangGraph و RAG پشت FastAPI راه انداختم و با انتخاب بهتر مدل، cache و بهینه‌سازی prompt هزینهٔ اجرای LLM رو حدود ۷۰٪ پایین آوردم.",
        },
        {
          role: "توسعه‌دهنده Django (بک‌اند)",
          org: "Arnikup",
          period: "۲۰۲۴ · ۶ ماه",
          note: "توی یه تیم پنج‌نفره روی بک‌اند اپ سفارش غذا کار کردم. APIهای محصولات و سفارش‌ها رو با Django REST Framework و PostgreSQL ساختم و نگه داشتم؛ کارهای پس‌زمینه مثل پردازش سفارش و اعلان‌ها رو به Celery سپردم. برای صف و cache از Redis، برای اجرا از Docker و برای تست از pytest استفاده کردیم.",
        },
      ],
      educationLabel: "تحصیلات",
      education: [
        {
          degree: "کارشناسی ارشد مهندسی نرم‌افزار",
          org: "دانشگاه آزاد اسلامی — واحد علوم و تحقیقات، تهران",
          period: "۲۰۲۵ – اکنون",
        },
        {
          degree: "کارشناسی علوم کامپیوتر",
          org: "دانشگاه گیلان، رشت",
          period: "۲۰۲۰ – ۲۰۲۴",
        },
      ],
      recognitionLabel: "افتخارها و زبان‌ها",
      recognition: [
        "مقام دوم مسابقهٔ تیمی برنامه‌نویسی Python، دانشگاه گیلان (۲۰۲۳)",
        "پژوهش دورهٔ کارشناسی روی الگوریتم Particle Swarm Optimization",
        "انگلیسی (سطح کاری حرفه‌ای) · فارسی (زبان مادری)",
      ],
    },
    contact: {
      eyebrow: "در تماس باشیم",
      title: "بیا با هم یه چیز خوب بسازیم",
      pitch:
        "برای کارهای بک‌اند و مهندسی AI و همکاری‌های جالب آماده‌ام. از همین‌جا پیام بده یا مستقیم ایمیل بزن؛ پیامت به دستم می‌رسه.",
      form: {
        name: "نام",
        namePh: "اسمت",
        email: "ایمیل",
        emailPh: "you@company.com",
        contact: "تلفن / تلگرام",
        optional: "(اختیاری)",
        contactPh: "یه راه دیگه برای تماس باهات",
        message: "پیام",
        messagePh: "می‌خوای دربارهٔ چی حرف بزنیم؟",
        send: "ارسال پیام",
        sending: "در حال ارسال…",
        sent: "پیامت رسید!",
        sentNote: "مستقیم رسید دستم — زود جوابت رو می‌دم.",
        delivered: "رسید",
        another: "یه پیام دیگه بفرست",
        errRequired: "لطفاً اسم، ایمیل و متن پیام رو پر کن.",
        errEmail: "به‌نظر میاد آدرس ایمیل درست نیست. یه بار دیگه چکش کن.",
        errGeneric: "یه مشکلی پیش اومد. لطفاً دوباره امتحان کن.",
        errNetwork: "مشکل شبکه. لطفاً دوباره تلاش کن.",
        errRate:
          "چندتا پیام پشت سر هم فرستادی. چند دقیقه دیگه دوباره امتحان کن.",
        errConfig: "کانال تماس هنوز آماده نیست — لطفاً مستقیم بهم ایمیل بزن.",
      },
    },
    footer: {
      tagline: "مهندس بک‌اند Python و AI/LLM · تهران، ایران (UTC+3:30).",
      builtWith:
        "این سایت رو با Next.js ساختم. دستیار RAG بالای صفحه هم روی کد خودم اجرا می‌شه.",
      rights: "همهٔ حقوق محفوظه.",
    },
    projects: {
      eyebrow: "نمونه‌کارها",
      title: "پروژه‌ها",
      description:
        "پروژه‌های متن‌بازم رو اینجا با جزئیات می‌بینی. پایین‌تر هم از دو ایجنت کاری گفتم که سورسشون خصوصی‌ه.",
      moreOnGithub: "بیشتر تو GitHub",
      moreOnGithubNote:
        "سورس پروژه‌های متن‌باز بالا و چند تجربهٔ کوچیک‌تر اونجاست.",
      back: "همهٔ پروژه‌ها",
      year: "سال",
      stack: "تکنولوژی‌ها",
      viewRepo: "دیدن ریپازیتوری",
      problem: "مسئله",
      myRole: "نقش من",
      howItWorks: "مسیر کار",
      highlights: "تصمیم‌های فنی مهم",
      outcomes: "نتیجه",
      gallery: "تصاویر و ویدیوها",
    },
  },
};

export type Dict = (typeof dict)["en"];

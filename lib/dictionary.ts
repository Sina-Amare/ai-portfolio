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
    about: {
      number: "02",
      eyebrow: "About",
      title: "A bit about me",
      bio: "I'm a Python developer with a Computer Science degree and around a year of professional experience, focused on backend services and LLM-powered applications. I learn mainly by building — my open-source projects are where ideas get tested and pushed toward production quality. I'm early in my career and still growing, but steady about shipping, writing tests, and seeing work through.",
      strengthsLabel: "What I bring",
      strengths: [
        "Applied AI/LLM work — RAG, LangGraph, and multi-provider failover behind FastAPI",
        "Resilient backends — async APIs, crash-tolerant jobs, graceful degradation",
        "Quick from prototype to production, with tests and clean architecture",
        "Root-cause problem solving — I dig until it actually works",
      ],
      quote:
        "Never had to explain something twice. Never came back empty-handed. Your biggest strength? Being a problem solver.",
      quoteBy: "— my lead at Dekamond",
      stackLabel: { ai: "LLM & AI", backend: "Backend", infra: "Data & Infra" },
      experienceLabel: "Experience",
      experience: [
        {
          role: "Software Developer",
          org: "Dekamond",
          period: "2025 · 6 months",
          note: "Built AI & automation for Kaleri.ai — multi-provider LLM workflows (LangGraph, RAG) behind FastAPI, and cut LLM running costs ~70% with model routing, caching, and prompt optimization.",
        },
        {
          role: "Django Developer (Backend)",
          org: "Arnikup",
          period: "2024 · 6 months",
          note: "Built REST APIs for a food-delivery platform in a five-person team — Django REST Framework, PostgreSQL, Redis, Celery, and Docker.",
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
        errConfig: "The contact channel isn't set up yet — please email me directly.",
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
        "A few production-minded things I've built — each one a place where backend resilience meets LLM engineering. Tap any card for the full story.",
      moreOnGithub: "More on GitHub",
      moreOnGithubNote: "Source for everything here, plus smaller experiments.",
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
      command: "منوی فرمان",
      menu: "منو",
    },
    hero: {
      available: "آمادهٔ همکاری",
    },
    featured: {
      number: "۰۱",
      eyebrow: "نمونه‌کارها",
      title: "چیزهایی که ساختم",
      description:
        "چند پروژهٔ متن‌باز که جدی ساختم؛ جایی که بک‌اند مقاوم و کار با LLM به هم می‌رسن.",
      all: "همهٔ پروژه‌ها",
    },
    about: {
      number: "۰۲",
      eyebrow: "دربارهٔ من",
      title: "کمی دربارهٔ من",
      bio: "یه توسعه‌دهندهٔ Python هستم با مدرک علوم کامپیوتر و حدود یک سال سابقهٔ کاری؛ بیشتر روی بک‌اند و اپلیکیشن‌هایی که با LLM کار می‌کنن تمرکز دارم. بیشتر با ساختن یاد می‌گیرم — پروژه‌های متن‌بازم همون‌جاییه که ایده‌ها رو تست می‌کنم و تا حد یه محصول واقعی جلو می‌برمشون. هنوز اول مسیرم و دارم رشد می‌کنم، ولی سر تحویل کار، تست نوشتن و تموم‌کردنش جدی و باثباتم.",
      strengthsLabel: "چی به کار اضافه می‌کنم",
      strengths: [
        "کار عملی با AI و LLM — RAG، LangGraph و جابه‌جایی خودکار بین چند سرویس‌دهنده، پشت FastAPI",
        "بک‌اند مقاوم — APIهای async، کارهایی که بعد از crash خودشون رو جمع‌وجور می‌کنن، و افت نرم به‌جای خطا",
        "سریع از نمونهٔ اولیه تا محصول نهایی، با تست و معماری تمیز",
        "حل مشکل از ریشه — تا وقتی واقعاً درست کار نکنه، ولش نمی‌کنم",
      ],
      quote:
        "هیچ‌وقت لازم نشد چیزی رو دوبار بهش بگم. هیچ‌وقت دست‌خالی برنگشت. بزرگ‌ترین نقطه‌قوتت؟ این‌که مشکل رو واقعاً حل می‌کنی.",
      quoteBy: "— سرپرستم تو Dekamond",
      stackLabel: { ai: "LLM و AI", backend: "بک‌اند", infra: "داده و زیرساخت" },
      experienceLabel: "سابقهٔ کاری",
      experience: [
        {
          role: "توسعه‌دهندهٔ نرم‌افزار",
          org: "Dekamond",
          period: "۲۰۲۵ · ۶ ماه",
          note: "ساخت بخش‌های AI و اتوماسیون برای Kaleri.ai — جریان‌های کاری چند-LLM (با LangGraph و RAG) پشت FastAPI، و کم‌کردن حدود ۷۰٪ از هزینهٔ اجرای مدل‌ها با مسیریابی هوشمند مدل، caching و بهینه‌کردن prompt.",
        },
        {
          role: "توسعه‌دهندهٔ Django (بک‌اند)",
          org: "Arnikup",
          period: "۲۰۲۴ · ۶ ماه",
          note: "ساخت REST APIها برای یه اپلیکیشن سفارش غذا توی یه تیم پنج‌نفره — با Django REST Framework، PostgreSQL، Redis، Celery و Docker.",
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
        "برای نقش‌های بک‌اند و مهندسی AI و همکاری‌های جالب پایه‌ام. یه پیام بفرست — مستقیم به دستم می‌رسه — یا همین‌جا بهم ایمیل بزن.",
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
        sentNote: "مستقیم اومد تو inboxم — زود جوابتو می‌دم.",
        delivered: "رسید",
        another: "یه پیام دیگه بفرست",
        errRequired: "لطفاً اسم، ایمیل و متن پیام رو پر کن.",
        errEmail: "ایمیل درست به‌نظر نمی‌رسه — یه بار دیگه چکش می‌کنی؟",
        errGeneric: "یه مشکلی پیش اومد. لطفاً دوباره امتحان کن.",
        errNetwork: "مشکل شبکه. لطفاً دوباره تلاش کن.",
        errRate: "یه‌کم تند فرستادی! چند دقیقه صبر کن و دوباره امتحان کن.",
        errConfig: "کانال تماس هنوز آماده نیست — لطفاً مستقیم بهم ایمیل بزن.",
      },
    },
    footer: {
      tagline: "مهندس بک‌اند Python و AI/LLM · تهران، ایران (UTC+3:30).",
      builtWith:
        "ساخته‌شده با Next.js و یه دستیار زندهٔ RAG — چت‌بات این سایت روی کد خودم اجرا می‌شه.",
      rights: "همهٔ حقوق محفوظه.",
    },
    projects: {
      eyebrow: "نمونه‌کارها",
      title: "پروژه‌ها",
      description:
        "چند پروژهٔ واقعی که ساختم — هرکدوم جاییه که بک‌اند مقاوم و مهندسی LLM به هم می‌رسن. روی هر کارت بزن تا کل ماجرا رو بخونی.",
      moreOnGithub: "بیشتر تو GitHub",
      moreOnGithubNote: "سورس همهٔ این‌ها، به‌علاوهٔ آزمایش‌های کوچیک‌تر.",
      back: "همهٔ پروژه‌ها",
      year: "سال",
      stack: "تکنولوژی‌ها",
      viewRepo: "دیدن ریپازیتوری",
      problem: "مسئله",
      myRole: "نقش من",
      howItWorks: "چطور کار می‌کنه",
      highlights: "نکته‌های مهندسی",
      outcomes: "نتیجه",
      gallery: "تصاویر و ویدیوها",
    },
  },
};

export type Dict = (typeof dict)["en"];

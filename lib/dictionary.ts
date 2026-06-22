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
      eyebrow: "کارهای منتخب",
      title: "چیزهایی که ساخته‌ام",
      description:
        "پروژه‌های متن‌بازِ تولیدی، جایی که پایداریِ back-end به مهندسیِ LLM می‌رسد.",
      all: "همهٔ پروژه‌ها",
    },
    about: {
      number: "۰۲",
      eyebrow: "درباره",
      title: "کمی دربارهٔ من",
      bio: "من یک توسعه‌دهندهٔ Python با مدرک علوم کامپیوتر و حدود یک سال تجربهٔ کاری هستم؛ تمرکزم روی سرویس‌های back-end و اپلیکیشن‌های مبتنی بر LLM است. بیشتر با ساختن یاد می‌گیرم — پروژه‌های متن‌بازم جایی هستند که ایده‌ها را تست می‌کنم و به کیفیت تولیدی می‌رسانم. اول مسیر حرفه‌ای‌ام هستم و در حال رشد، اما در تحویل دادن، نوشتن تست و به سرانجام رساندن کار، پیگیر و باثباتم.",
      strengthsLabel: "چه چیزی به تیم اضافه می‌کنم",
      strengths: [
        "کار عملی روی AI/LLM — RAG، LangGraph و failover چندارائه‌دهنده پشت FastAPI",
        "back-endهای مقاوم — APIهای async، jobهای مقاوم در برابر crash و افت آرام",
        "سریع از نمونهٔ اولیه تا تولید، همراه با تست و معماری تمیز",
        "حل مسئله از ریشه — تا واقعاً کار نکند، رهایش نمی‌کنم",
      ],
      quote:
        "هیچ‌وقت لازم نبود چیزی را دوبار توضیح بدهم. هیچ‌وقت دست‌خالی برنگشت. بزرگ‌ترین نقطه‌قوتت؟ این‌که یک problem solver واقعی هستی.",
      quoteBy: "— سرپرستم در Dekamond",
      stackLabel: { ai: "LLM و AI", backend: "Back-end", infra: "داده و زیرساخت" },
      experienceLabel: "تجربهٔ کاری",
      experience: [
        {
          role: "توسعه‌دهندهٔ نرم‌افزار",
          org: "Dekamond",
          period: "۲۰۲۵ · ۶ ماه",
          note: "ساخت بخش‌های AI و اتوماسیون برای Kaleri.ai — workflowهای چندارائه‌دهندهٔ LLM (با LangGraph و RAG) پشت FastAPI، و کاهش حدود ۷۰٪ هزینهٔ اجرای LLM با model routing، caching و بهینه‌سازی prompt.",
        },
        {
          role: "توسعه‌دهندهٔ Django (back-end)",
          org: "Arnikup",
          period: "۲۰۲۴ · ۶ ماه",
          note: "ساخت REST APIها برای یک پلتفرم سفارش غذا در تیمی پنج‌نفره — با Django REST Framework، PostgreSQL، Redis، Celery و Docker.",
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
      recognitionLabel: "افتخارات و زبان‌ها",
      recognition: [
        "مقام دوم — مسابقهٔ تیمی برنامه‌نویسی Python، دانشگاه گیلان (۲۰۲۳)",
        "پژوهش کارشناسی روی الگوریتم Particle Swarm Optimization",
        "انگلیسی (سطح کاریِ حرفه‌ای) · فارسی (زبان مادری)",
      ],
    },
    contact: {
      eyebrow: "در تماس باشیم",
      title: "بیا با هم یه چیز خوب بسازیم",
      pitch:
        "برای نقش‌های back-end و مهندسی AI و همکاری‌های جالب آماده‌ام. یک پیام بفرست — مستقیم به دستم می‌رسد — یا همین‌جا برایم ایمیل بزن.",
      form: {
        name: "نام",
        namePh: "نام شما",
        email: "ایمیل",
        emailPh: "you@company.com",
        contact: "تلفن / تلگرام",
        optional: "(اختیاری)",
        contactPh: "یک راه دیگر برای تماس با شما",
        message: "پیام",
        messagePh: "دربارهٔ چه چیزی می‌خواهی صحبت کنیم؟",
        send: "ارسال پیام",
        sending: "در حال ارسال…",
        sent: "پیام ارسال شد.",
        sentNote: "مستقیم رسید به inbox من — به‌زودی جوابت را می‌دهم.",
        delivered: "تحویل شد",
        another: "ارسال پیام دیگر",
        errRequired: "لطفاً نام، ایمیل و متن پیام را وارد کن.",
        errEmail: "ایمیل درست به‌نظر نمی‌رسد — یک‌بار دیگر چکش می‌کنی؟",
        errGeneric: "یک مشکلی پیش آمد. لطفاً دوباره امتحان کن.",
        errNetwork: "خطای شبکه. لطفاً دوباره تلاش کن.",
      },
    },
    footer: {
      tagline: "مهندس back-end پایتون و AI/LLM · تهران، ایران (UTC+3:30).",
      builtWith:
        "ساخته‌شده با Next.js و یک دستیار زندهٔ RAG چندارائه‌دهنده — چت‌بات این سایت روی کد خودم اجرا می‌شود.",
      rights: "همهٔ حقوق محفوظ است.",
    },
    projects: {
      eyebrow: "کارها",
      title: "پروژه‌ها",
      description:
        "چند چیز تولیدی که ساخته‌ام — هرکدام جایی که پایداریِ back-end به مهندسیِ LLM می‌رسد. روی هر کارت بزن تا کل ماجرا را بخوانی.",
      moreOnGithub: "بیشتر در GitHub",
      moreOnGithubNote: "سورس همهٔ این‌ها، به‌علاوهٔ آزمایش‌های کوچک‌تر.",
      back: "همهٔ پروژه‌ها",
      year: "سال",
      stack: "تکنولوژی‌ها",
      viewRepo: "مشاهدهٔ ریپازیتوری",
      problem: "مسئله",
      myRole: "نقش من",
      howItWorks: "چطور کار می‌کند",
      highlights: "نکات مهندسی",
      outcomes: "نتایج",
    },
  },
};

export type Dict = (typeof dict)["en"];

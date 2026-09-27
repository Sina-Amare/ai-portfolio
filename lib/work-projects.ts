import { BarChart3, Search, type LucideIcon } from "lucide-react";
import type { Project } from "@/lib/projects";

/** Public, anonymized account of a private workplace project: the same deep
 *  content as a case study, plus the card fields. */
export type WorkProjectCopy = Project["fa"] & {
  name: string;
  tagline: string;
  summary: string;
};

export type WorkProject = {
  id: string;
  year: number;
  icon: LucideIcon;
  stack: string[];
  en: WorkProjectCopy;
  fa: WorkProjectCopy;
};

export const workProjects: WorkProject[] = [
  {
    id: "social-research-agent",
    year: 2025,
    icon: Search,
    stack: ["Python", "LangGraph", "LLM", "Docker"],
    en: {
      name: "Social Research Agent",
      tagline: "Source-linked research briefs from social feeds, daily or on demand",
      summary:
        "I designed and built a LangGraph research agent that turns the daily flood of posts into a short, source-linked brief — and answers focused questions on demand, like what a set of accounts or their followers are saying about a topic.",
      problem:
        "The team followed several fast-moving subjects on X (Twitter): topic categories, specific people, communities, and whatever was trending. Keeping up meant running the same searches by hand every day, wading through noise, and still missing the posts that mattered. Focused questions — what a group of accounts, or their followers, were saying about a topic — took even longer.",
      role: "I designed and built it end to end: the LangGraph workflow, the collectors for topic categories, people, followers, communities, and trends, the filtering and relevance logic, the LLM prompts, and a Docker deployment that produces the daily brief on a schedule.",
      architecture: [
        "Scope",
        "Collect",
        "Filter & dedupe",
        "LLM relevance",
        "Summarize",
        "Deliver with source",
      ],
      highlights: [
        {
          title: "Code decides the facts, the model decides relevance",
          body: "Freshness, language, and duplicate checks are deterministic rules. The LLM is asked only what it's good at: is this worth a person's attention, and what topic is it?",
        },
        {
          title: "Never the same finding twice",
          body: "Links that were already delivered are skipped, and a thread is handled as one unit, so a post found through both a topic search and an account search appears in the brief once.",
        },
        {
          title: "Briefs built to be verified",
          body: "Every result carries a summary of up to 200 characters, two or three sentences on why it matters, and the original text with its link, so the reader can check the source before acting.",
        },
        {
          title: "Testable, and resilient to flaky APIs",
          body: "Data sources sit behind a small ports-and-adapters interface with a mock implementation, so the whole pipeline runs in tests without the network. Retry and cache layers keep a transient API failure from breaking the daily run.",
        },
      ],
      outcomes: [
        "A daily, source-linked brief replaced rounds of manual searching across categories, people, and communities.",
        "Focused questions about a topic, a set of accounts, or their followers could be answered on demand instead of by hand.",
        "Every finding was one click from its original, so the team could verify before acting.",
      ],
    },
    fa: {
      name: "ایجنت رصد شبکه‌های اجتماعی",
      tagline: "گزارش کوتاه با لینک منبع از شبکه‌های اجتماعی؛ هر روز یا هر وقت لازم باشه",
      summary:
        "یه ایجنت تحقیق با LangGraph طراحی کردم و ساختم که حجم زیاد پست‌های هر روز رو به یه گزارش کوتاه با لینک منبع تبدیل می‌کنه. به سؤال مشخص هم جواب می‌ده؛ مثلاً این‌که چند تا حساب خاص یا فالوئرهاشون دربارهٔ یه موضوع چی گفتن.",
      problem:
        "تیم چند موضوع پرتحرک رو توی X (توییتر) دنبال می‌کرد: دسته‌های موضوعی، آدم‌های مشخص، کامیونیتی‌ها و ترندها. برای عقب نموندن باید هر روز همون جست‌وجوها رو دستی تکرار می‌کرد، از بین کلی پست بی‌ربط رد می‌شد و باز هم ممکن بود پست مهم از قلم بیفته. سؤال‌های مشخص، مثل این‌که چند تا حساب یا فالوئرهاشون دربارهٔ یه موضوع چی می‌گن، از این هم وقت‌گیرتر بود.",
      role: "کل سیستم رو از طراحی تا اجرا خودم ساختم: workflow با LangGraph، جمع‌آوری از دسته‌های موضوعی، آدم‌ها، فالوئرها، کامیونیتی‌ها و ترندها، منطق فیلتر و سنجش ارتباط، promptهای LLM و اجرای زمان‌بندی‌شده توی Docker که گزارش روزانه رو خودکار می‌سازه.",
      architecture: [
        "تعیین محدوده",
        "جمع‌آوری",
        "فیلتر و حذف تکراری",
        "سنجش با LLM",
        "خلاصه",
        "تحویل با لینک منبع",
      ],
      highlights: [
        {
          title: "واقعیت با کد، قضاوت با مدل",
          body: "تازه بودن، زبان و تکراری بودن هر پست رو قاعده‌های مشخص چک می‌کنن. از LLM فقط چیزی رو می‌پرسم که واقعاً کارشه: این پست ارزش وقت گذاشتن داره یا نه، و موضوعش چیه.",
        },
        {
          title: "هیچ یافته‌ای دو بار نمیاد",
          body: "لینک‌هایی که قبلاً تحویل داده شدن کنار می‌رن و هر رشته‌توییت (thread) یه واحد حساب می‌شه؛ پستی که هم از جست‌وجوی موضوعی پیدا بشه هم از جست‌وجوی حساب‌ها، فقط یه بار توی گزارش میاد.",
        },
        {
          title: "گزارشی که بشه چکش کرد",
          body: "هر نتیجه یه خلاصهٔ حداکثر ۲۰۰ کاراکتری داره، دو سه جمله دربارهٔ این‌که چرا مهمه، و متن اصلی با لینکش؛ خواننده قبل از هر تصمیمی می‌تونه منبع رو ببینه.",
        },
        {
          title: "تست‌پذیر و مقاوم در برابر خطای API",
          body: "منبع‌های داده پشت یه interface کوچیک به سبک ports-and-adapters هستن و یه نسخهٔ mock هم دارن؛ برای همین کل مسیر بدون شبکه تست می‌شه. لایه‌های retry و cache هم نمی‌ذارن یه خطای موقتی API اجرای روزانه رو خراب کنه.",
        },
      ],
      outcomes: [
        "یه گزارش روزانه با لینک منبع جای جست‌وجوهای دستی و تکراری بین دسته‌ها، آدم‌ها و کامیونیتی‌ها رو گرفت.",
        "سؤال‌های مشخص دربارهٔ یه موضوع، چند حساب خاص یا فالوئرهاشون هر وقت لازم بود جواب داده می‌شد، نه با گشتن دستی.",
        "هر نتیجه فقط یه کلیک با منبع اصلیش فاصله داشت؛ قبل از هر تصمیمی می‌شد چکش کرد.",
      ],
    },
  },
  {
    id: "business-intelligence-agents",
    year: 2025,
    icon: BarChart3,
    stack: ["Python", "LangGraph", "MCP", "LLM", "Docker"],
    en: {
      name: "Business Intelligence Agents",
      tagline: "Specialist agents that turn department data into checked, actionable reports",
      summary:
        "I designed and built a multi-agent BI system: specialist agents for people operations, finance, and campaigns read department data through an MCP server, reason over figures that code has already checked, and write Persian reports with concrete next steps — then remember what the manager corrected.",
      problem:
        "Department data and past reports lived in different tools, and another set of fresh numbers wasn't what managers needed. They needed to know what had changed and why, what deserved attention, and what to do next — and for their corrections to carry into the next report instead of getting lost.",
      role: "I designed the architecture and built it end to end: an MCP server that exposes department data, report history, and saved feedback as tools; LangGraph orchestration across the specialist agents; a deterministic metrics layer; the Persian reporting prompts; and a scheduled Docker deployment that ran daily, weekly, and monthly analyses unattended.",
      architecture: [
        "Fetch via MCP",
        "Validate & compute",
        "Specialist agents",
        "Persian report",
        "Manager review",
        "Feedback memory",
      ],
      highlights: [
        {
          title: "Numbers first, narrative second",
          body: "Code computes 20+ financial ratios and period-over-period changes before the model sees anything. The LLM interprets checked figures and never does the arithmetic.",
        },
        {
          title: "What moves the business, not every line item",
          body: "A materiality filter ignores bank fees and small charges, unusual transactions are flagged one by one, and costs are split into fixed and variable, so the finance report talks about what actually moves the business.",
        },
        {
          title: "Each team measured by its own yardstick",
          body: "The people-operations agent evaluates against the KPIs each team defined for itself; the campaign agent compares cost per view with its target and suggests where to move budget.",
        },
        {
          title: "Memory you can inspect",
          body: "Manager corrections are stored as explicit review notes and retrieved on the next run. No retraining, fully auditable, and the manager keeps the final say.",
        },
      ],
      outcomes: [
        "Managers received daily, weekly, and monthly reports per department — what changed, what needs attention, what to do next — without anyone assembling them by hand.",
        "Recommendations rest on figures the code had already checked, not on the model's arithmetic.",
        "Reports were published to shared spreadsheets in right-to-left Persian, ready for the team to read and discuss.",
        "Each report built on the feedback given to the last one instead of starting from zero.",
      ],
    },
    fa: {
      name: "ایجنت‌های تحلیل و گزارش‌گیری",
      tagline: "ایجنت‌های تخصصی که داده‌های هر واحد رو به گزارش دقیق و قابل اجرا تبدیل می‌کنن",
      summary:
        "یه سیستم چندایجنتی BI طراحی کردم و ساختم: ایجنت‌های تخصصی منابع انسانی، مالی و کمپین‌ها داده‌های هر واحد رو از یه MCP server می‌گیرن، روی عددهایی کار می‌کنن که کد قبلاً چکشون کرده و گزارش فارسی با قدم‌های بعدی مشخص می‌نویسن؛ اصلاح‌های مدیر هم برای دفعهٔ بعد یادشون می‌مونه.",
      problem:
        "داده‌ها و گزارش‌های قبلی هر واحد توی چند ابزار مختلف پخش بود و مدیرها فقط یه سری عدد تازه لازم نداشتن. می‌خواستن بدونن چی عوض شده و چرا، کجا نیاز به توجه داره و قدم بعدی چیه؛ و این‌که اصلاح‌هایی که روی گزارش قبلی گفتن، توی گزارش بعدی هم لحاظ بشه و گم نشه.",
      role: "معماری رو طراحی کردم و کل سیستم رو خودم ساختم: یه MCP server که داده‌ها، گزارش‌های قبلی و بازخوردها رو به‌شکل tool در اختیار ایجنت‌ها می‌ذاره، هماهنگی ایجنت‌ها با LangGraph، لایهٔ محاسبهٔ شاخص‌ها، promptهای گزارش فارسی و اجرای زمان‌بندی‌شده توی Docker برای تحلیل‌های روزانه، هفتگی و ماهانه.",
      architecture: [
        "دریافت با MCP",
        "بررسی و محاسبه",
        "ایجنت‌های تخصصی",
        "گزارش فارسی",
        "بازبینی مدیر",
        "حافظهٔ بازخورد",
      ],
      highlights: [
        {
          title: "اول عدد، بعد تحلیل",
          body: "بیش از ۲۰ نسبت مالی و تغییر نسبت به دورهٔ قبل، قبل از این‌که مدل چیزی ببینه با کد حساب می‌شن؛ LLM عددهای چک‌شده رو تفسیر می‌کنه، نه این‌که خودش حساب‌وکتاب کنه.",
        },
        {
          title: "تراکنش‌های مهم، نه همهٔ تراکنش‌ها",
          body: "کارمزد بانکی و هزینه‌های جزئی با یه فیلتر اهمیت کنار می‌رن، تراکنش‌های غیرعادی تک‌به‌تک علامت می‌خورن و هزینه‌ها به ثابت و متغیر تفکیک می‌شن؛ گزارش مالی دربارهٔ چیزی حرف می‌زنه که واقعاً روی کسب‌وکار اثر داره.",
        },
        {
          title: "هر تیم با معیار خودش",
          body: "ایجنت منابع انسانی عملکرد رو با KPIهایی می‌سنجه که خود هر تیم تعریف کرده، و ایجنت کمپین هزینهٔ هر بازدید رو با هدفش مقایسه می‌کنه و پیشنهاد می‌ده بودجه کجا جابه‌جا بشه.",
        },
        {
          title: "حافظهٔ شفاف، نه جادو",
          body: "اصلاح‌های مدیر به‌شکل یادداشت ذخیره می‌شن و اجرای بعدی دوباره می‌خونتشون؛ مدل دوباره آموزش داده نمی‌شه و حرف آخر رو خود مدیر می‌زنه.",
        },
      ],
      outcomes: [
        "مدیرها گزارش روزانه، هفتگی و ماهانهٔ هر واحد رو داشتن: چی عوض شده، کجا باید دقت کرد و قدم بعدی چیه؛ بدون این‌که کسی دستی جمعش کنه.",
        "پیشنهادها روی عددهایی بنا شدن که کد قبلاً چکشون کرده بود، نه حساب‌وکتاب خود مدل.",
        "گزارش‌ها راست‌چین و فارسی توی شیت‌های مشترک تیم منتشر می‌شدن و همه همون‌جا می‌خوندنشون.",
        "هر گزارش از بازخورد گزارش قبلی استفاده می‌کرد و از صفر شروع نمی‌شد.",
      ],
    },
  },
];

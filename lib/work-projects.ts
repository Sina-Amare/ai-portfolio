/** Public, anonymized accounts of private workplace projects. */
export type WorkProjectCopy = {
  name: string;
  tagline: string;
  preview: string;
  highlights: string[];
  problem: string;
  workflow: string;
  steps: { title: string; detail: string }[];
  decision: string;
  value: string;
};

export type WorkProject = {
  id: string;
  stack: string[];
  en: WorkProjectCopy;
  fa: WorkProjectCopy;
};

export const workProjects: WorkProject[] = [
  {
    id: "social-research-agent",
    stack: ["Python", "LangGraph", "LLM"],
    en: {
      name: "Social Research Agent",
      tagline:
        "Research across topics, people, and followers without losing the source",
      preview:
        "An agent for daily discovery and focused questions. It searches topic categories, selected people, or followers' posts, then returns relevant tweets with short summaries and links to the originals.",
      highlights: [
        "Daily and on-demand",
        "Follower and account search",
        "Source-linked results",
      ],
      problem:
        "The team needed both a daily view of important conversations and answers to specific questions, such as what followers were saying about a topic. Searching categories, individual accounts, and tweets by hand meant repeating the same work and still missing useful posts.",
      workflow:
        "A scheduled run builds the daily feed; a request can narrow the search to a category, followers, particular people, or tweets about a chosen subject. LangGraph coordinates the research from search through a source-linked answer.",
      steps: [
        {
          title: "Set the scope",
          detail:
            "Start from the daily topics or a question about followers, selected accounts, or a specific subject.",
        },
        {
          title: "Search the right sources",
          detail:
            "Collect recent candidate tweets from the chosen categories, people, and account lists.",
        },
        {
          title: "Find the useful signal",
          detail:
            "Rules remove old and repeated links; an LLM judges relevance and groups posts by topic.",
        },
        {
          title: "Return something checkable",
          detail:
            "Deliver a short daily feed or a focused answer, with a summary and original link for each result.",
        },
      ],
      decision:
        "The hard part was covering a broad search without burying useful findings in noise. I kept dates and duplicate checks deterministic and used the LLM for relevance judgments. If a tweet appears through both a follower and a topic search, it appears once, and the original remains one click away.",
      value:
        "The team could ask a focused research question or scan the daily feed instead of opening several searches from scratch. Source links made every finding easy to verify before anyone acted on it.",
    },
    fa: {
      name: "ایجنت رصد شبکه‌های اجتماعی",
      tagline: "جست‌وجو بین موضوع‌ها، آدم‌ها و فالوئرها، با لینک منبع",
      preview:
        "هم هر روز پست‌های مهم رو پیدا می‌کنه، هم به سؤال مشخص جواب می‌ده: بین دسته‌های موضوعی، حساب آدم‌های خاص یا توییت‌های فالوئرها می‌گرده و نتیجه رو با خلاصه و لینک اصلی تحویل می‌ده.",
      highlights: [
        "گزارش روزانه و جست‌وجوی درخواستی",
        "جست‌وجو بین فالوئرها و افراد مشخص",
        "نتیجه با لینک اصلی",
      ],
      problem:
        "تیم هم می‌خواست هر روز از بحث‌های مهم باخبر بشه، هم به سؤال‌های مشخص جواب بده؛ مثلاً بفهمه فالوئرهای یه حساب دربارهٔ موضوعی خاص چی گفتن. گشتن بین دسته‌ها، حساب آدم‌های مختلف و توییت‌ها وقت می‌گرفت و باز هم ممکن بود پست خوب از قلم بیفته.",
      workflow:
        "ایجنت می‌تونه طبق برنامه یه لیست روزانه بسازه یا با یه درخواست مشخص، جست‌وجو رو به یک موضوع، فالوئرها، افراد خاص یا توییت‌های مرتبط محدود کنه. LangGraph از شروع جست‌وجو تا جوابِ قابل بررسی، مراحل رو هماهنگ می‌کنه.",
      steps: [
        {
          title: "محدودهٔ جست‌وجو رو مشخص می‌کنه",
          detail:
            "از موضوع‌های روزانه شروع می‌کنه یا سؤال کاربر رو دربارهٔ فالوئرها، افراد مشخص یا یه موضوع می‌گیره.",
        },
        {
          title: "سراغ منبع‌های مرتبط می‌ره",
          detail:
            "توییت‌های تازه رو از دسته‌های انتخاب‌شده، حساب آدم‌ها و فهرست فالوئرها پیدا می‌کنه.",
        },
        {
          title: "پست‌های ارزشمند رو جدا می‌کنه",
          detail:
            "قواعد مشخص، لینک‌های قدیمی و تکراری رو کنار می‌ذارن؛ LLM مرتبط بودن و موضوع پست‌ها رو می‌سنجه.",
        },
        {
          title: "نتیجهٔ قابل چک کردن می‌ده",
          detail:
            "یه لیست روزانه یا جواب متمرکز می‌سازه؛ هر مورد خلاصه و لینک توییت اصلی رو داره.",
        },
      ],
      decision:
        "سختی کار این بود که جست‌وجو گسترده باشه ولی نتیجه زیر پست‌های کم‌ارزش دفن نشه. تاریخ و تکراری بودن رو با قاعدهٔ مشخص چک کردم و تشخیص مرتبط بودن رو به LLM سپردم. اگه یه توییت هم از بین فالوئرها پیدا بشه هم از جست‌وجوی موضوعی، فقط یه بار نشون داده می‌شه و لینک اصلیش هم کنار نتیجه می‌مونه.",
      value:
        "تیم می‌تونست یه سؤال دقیق بپرسه یا لیست روزانه رو مرور کنه، بدون اینکه هر بار چند جست‌وجو رو از صفر انجام بده. لینک منبع هم کمک می‌کرد قبل از هر تصمیمی، خود توییت رو ببینه.",
    },
  },
  {
    id: "business-intelligence-agents",
    stack: ["Python", "LangGraph", "MCP", "LLM"],
    en: {
      name: "Business Intelligence Agents",
      tagline: "Department analysis that improves with manager feedback",
      preview:
        "Specialist agents evaluate business departments, compare current data with past reports, suggest next steps, and use saved manager feedback to make later reports more useful.",
      highlights: [
        "Department evaluations",
        "Actionable recommendations",
        "Feedback memory",
      ],
      problem:
        "Business departments kept data and reports in different tools. Managers needed more than a fresh set of numbers: they needed an evaluation of what changed, useful recommendations, and a way for their corrections to carry into the next report.",
      workflow:
        "LangGraph coordinates specialist agents for areas such as people operations, finance, and campaigns. MCP tools bring in current data, earlier reports, and saved feedback so each analysis has the context it needs.",
      steps: [
        {
          title: "Bring the context together",
          detail:
            "Retrieve each department's current data, previous reports, and relevant manager feedback.",
        },
        {
          title: "Check the numbers",
          detail:
            "Validate and normalize inputs, then calculate metrics and period-to-period changes before the LLM interprets them.",
        },
        {
          title: "Evaluate and recommend",
          detail:
            "Specialist agents explain performance, flag issues or opportunities, and draft Persian reports with suggested actions.",
        },
        {
          title: "Learn from the review",
          detail:
            "Ask the manager for feedback, save their corrections and decisions, and use those notes in later reports.",
        },
      ],
      decision:
        "The challenge was making recommendations trustworthy and improving them without treating the model's guesses as facts. Metrics are calculated before the LLM sees them; manager feedback is stored as explicit review notes and retrieved for later analyses. For example, the finance agent explains a checked expense-to-income ratio, while the manager can correct the interpretation and have that correction inform the next report.",
      value:
        "Managers got a repeatable view of department performance, possible issues, and concrete next steps. Reports could build on earlier findings and feedback instead of starting from zero each time, while the manager kept the final say.",
    },
    fa: {
      name: "ایجنت‌های تحلیل و گزارش‌گیری",
      tagline: "تحلیل واحدهای کسب‌وکار که از بازخورد مدیر بهتر می‌شه",
      preview:
        "ایجنت‌های تخصصی عملکرد واحدهای کسب‌وکار رو ارزیابی می‌کنن، داده‌ها رو با گزارش‌های قبلی می‌سنجن، پیشنهاد می‌دن و بازخورد مدیر رو برای گزارش‌های بعدی به خاطر می‌سپارن.",
      highlights: [
        "ارزیابی واحدهای کسب‌وکار",
        "پیشنهادهای قابل پیگیری",
        "حافظهٔ بازخورد مدیر",
      ],
      problem:
        "داده‌ها و گزارش‌های واحدهای مختلف توی چند ابزار پخش بود. مدیر فقط عدد جدید نمی‌خواست؛ باید می‌فهمید عملکرد هر بخش چه تغییری کرده، چه کاری ارزش پیگیری داره و نکته‌هایی که به گزارش قبلی گفته، توی گزارش بعدی هم لحاظ می‌شن یا نه.",
      workflow:
        "با LangGraph چند ایجنت تخصصی رو برای حوزه‌هایی مثل کارهای تیم، مالی و کمپین‌ها هماهنگ کردم. ابزارهای MCP داده‌های تازه، گزارش‌های قبلی و بازخوردهای ذخیره‌شده رو میارن تا هر تحلیل با زمینهٔ کافی انجام بشه.",
      steps: [
        {
          title: "اطلاعات قبلی و جدید رو کنار هم می‌ذاره",
          detail:
            "داده‌های هر واحد، گزارش‌های قبلی و بازخوردهای مرتبط مدیر رو می‌گیره.",
        },
        {
          title: "اول عددها رو چک می‌کنه",
          detail:
            "داده‌ها رو بررسی و یکدست می‌کنه؛ شاخص‌ها و تغییر نسبت به دورهٔ قبل پیش از رسیدن به LLM حساب می‌شن.",
        },
        {
          title: "ارزیابی و پیشنهاد می‌ده",
          detail:
            "ایجنت هر حوزه عملکردش رو توضیح می‌ده، مسئله‌ها و فرصت‌ها رو نشون می‌ده و گزارش فارسی با پیشنهادهای عملی می‌نویسه.",
        },
        {
          title: "از نظر مدیر یاد می‌گیره",
          detail:
            "بازخورد، اصلاح‌ها و تصمیم‌های مدیر رو می‌پرسه و ذخیره می‌کنه تا توی گزارش‌های بعدی ازشون استفاده کنه.",
        },
      ],
      decision:
        "سختی کار این بود که پیشنهادها هم روی عدد درست بنا بشن، هم از بازخورد مدیر بهتر بشن. شاخص‌ها قبل از رسیدن به LLM محاسبه می‌شن؛ نظر مدیر هم به‌صورت یادداشتِ مشخص ذخیره می‌شه و در تحلیل‌های بعدی دوباره خونده می‌شه. مثلاً ایجنت مالی نسبت هزینه به درآمدِ حساب‌شده رو توضیح می‌ده و اگه مدیر برداشتش رو اصلاح کنه، اون اصلاح توی گزارش بعدی هم به کار میاد.",
      value:
        "مدیر یک تصویر تکرارپذیر از عملکرد واحدها، مسئله‌های احتمالی و قدم‌های بعدی داشت. گزارش‌ها از یافته‌ها و بازخوردهای قبلی استفاده می‌کردن و هر بار از صفر شروع نمی‌شدن؛ تصمیم نهایی هم با خود مدیر می‌موند.",
    },
  },
];

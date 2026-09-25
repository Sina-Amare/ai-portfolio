/** Public, anonymized accounts of private workplace projects. */
export type WorkProjectCopy = {
  name: string;
  tagline: string;
  preview: string;
  problem: string;
  workflow: string;
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
      tagline: "From scattered conversations to a useful daily research feed",
      preview:
        "An agent that scans selected public conversations and trends, finds posts worth reading, and delivers a short, source-linked research feed each day.",
      problem:
        "Keeping up with relevant topics meant checking several sources by hand every day. There was too much to read, useful posts were easy to miss, and the same post could appear in more than one place.",
      workflow:
        "I built an agent that gathers recent posts from selected accounts, communities, and trends. LangGraph coordinates the stages: filter by time, ask an LLM to judge relevance and categorize candidates, check for previously saved links, then write a short summary with the original source for each selected post.",
      decision:
        "The hard part was keeping the feed useful without losing good material in the noise. I used the LLM where judgment matters — deciding whether a post is worth attention — and predictable rules for dates and duplicates. When the same post appears through a community and a trend, it enters the feed once.",
      value:
        "The team got a focused daily list instead of starting every search from scratch. Each item remained linked to its source, so people could check the original and decide what to follow up on.",
    },
    fa: {
      name: "ایجنت رصد شبکه‌های اجتماعی",
      tagline: "از چند منبع، یه لیست روزانهٔ به‌دردبخور",
      preview:
        "منابع و موضوع‌های داغ رو هر روز می‌گرده، پست‌های مهم رو پیدا می‌کنه و یه لیست کوتاه با خلاصه و لینک اصلی تحویل می‌ده.",
      problem:
        "برای اینکه بفهمیم توی موضوعات مهم چه خبر شده، باید هر روز چند منبع رو جداگانه می‌گشتیم. حجم پست‌ها زیاد بود، مطالب خوب راحت گم می‌شدن و یه پست هم ممکن بود از چند جا دوباره پیداش بشه.",
      workflow:
        "ایجنت پست‌های تازه رو از حساب‌ها، کامیونیتی‌ها و موضوع‌های داغی که انتخاب کرده بودیم می‌گیره. با LangGraph کار رو چند مرحله کردم: پست‌های قدیمی کنار می‌رن، LLM مرتبط بودن و دستهٔ هر پست رو بررسی می‌کنه، لینک‌های تکراری حذف می‌شن و برای موارد منتخب یه خلاصه با لینک اصلی ذخیره می‌شه.",
      decision:
        "سختی کار این بود که لیست خروجی زیر پست‌های کم‌ارزش و تکراری دفن نشه. تشخیص اینکه یه پست به درد تحقیق می‌خوره رو به LLM سپردم؛ تاریخ و تکراری بودن رو با قاعدهٔ مشخص چک کردم. مثلاً اگه یه پست هم توی کامیونیتی دیده بشه هم بین موضوع‌های داغ، فقط یه بار وارد لیست می‌شه.",
      value:
        "تیم هر روز یه لیست جمع‌وجور از مطالب مرتبط داشت و لازم نبود جست‌وجو رو از صفر شروع کنه. لینک اصلی کنار هر خلاصه بود تا بشه خود پست رو دید و تصمیم گرفت کدوم مورد ارزش پیگیری داره.",
    },
  },
  {
    id: "business-intelligence-agents",
    stack: ["Python", "LangGraph", "MCP", "LLM"],
    en: {
      name: "Business Intelligence Agents",
      tagline: "From scattered business data to reports people can act on",
      preview:
        "Specialist agents bring people, finance, and campaign data together, calculate dependable metrics, and turn changes over time into reports for managers to review.",
      problem:
        "People, finance, and campaign data lived in different tools. Each report meant gathering and reconciling the data, calculating metrics, and searching earlier reports to see what had changed. That made consistent reporting slow and difficult.",
      workflow:
        "I built specialist agents for the three areas. MCP tools give them access to current data and past reports, while LangGraph coordinates the analysis workflows. The system validates and normalizes inputs, calculates the metrics, then has each agent explain important changes and draft a Persian report with recommendations for a manager to review.",
      decision:
        "A convincing explanation is worthless if it starts with the wrong number. The system computes ratios and other metrics before the LLM sees them; the agents interpret those checked figures in historical context. For example, code calculates the expense-to-income ratio, and the finance agent explains how it moved between periods and what may need attention.",
      value:
        "Reporting became a repeatable process rather than a fresh exercise in joining tables. Managers could see changes, possible issues, and suggested next steps in one place, with the numbers behind the analysis available to check.",
    },
    fa: {
      name: "ایجنت‌های تحلیل و گزارش‌گیری",
      tagline: "از داده‌های پراکنده، گزارش‌هایی برای تصمیم‌گیری",
      preview:
        "ایجنت‌های تخصصی داده‌های کارهای تیم، هزینه‌ها و کمپین‌ها رو کنار هم می‌ذارن، شاخص‌ها رو حساب می‌کنن و تغییرهای مهم رو برای مدیر توضیح می‌دن.",
      problem:
        "اطلاعات کارهای تیم، هزینه‌ها و کمپین‌ها توی چند ابزار مختلف بود. برای هر گزارش باید داده‌ها رو کنار هم می‌ذاشتیم، شاخص‌ها رو حساب می‌کردیم و گزارش‌های قبلی رو می‌گشتیم تا بفهمیم چی عوض شده. این کار وقت می‌گرفت و تکرار یه روش ثابت رو سخت می‌کرد.",
      workflow:
        "برای این سه حوزه ایجنت‌های جدا ساختم. ابزارهای MCP داده‌ها و گزارش‌های قبلی رو در اختیارشون می‌ذارن و LangGraph جریان کارشون رو هماهنگ می‌کنه. اول داده‌ها بررسی و یکدست می‌شن و شاخص‌ها حساب می‌شن؛ بعد هر ایجنت تغییرهای مهم حوزهٔ خودش رو توضیح می‌ده و یه گزارش فارسی با پیشنهادهایی برای بررسی مدیر آماده می‌کنه.",
      decision:
        "نقطهٔ حساس این بود که یه تحلیل قانع‌کننده روی عدد اشتباه ارزشی نداره. برای همین محاسبهٔ نسبت‌ها و شاخص‌ها رو به LLM نسپردم؛ مدل عددهای بررسی‌شده و گزارش‌های قبلی رو می‌بینه و تغییرها رو تفسیر می‌کنه. مثلاً نسبت هزینه به درآمد اول با کد حساب می‌شه، بعد ایجنت مالی توضیح می‌ده نسبت به دورهٔ قبل چه تغییری کرده و چه چیزی ارزش پیگیری داره.",
      value:
        "گزارش‌گیری به یه روند تکرارپذیر تبدیل شد. مدیر می‌تونست تغییرها، مسئله‌های احتمالی و قدم‌های پیشنهادی رو یک‌جا ببینه و عددهای پشت تحلیل رو چک کنه؛ لازم نبود هر بار خودش چند جدول پراکنده رو کنار هم بذاره.",
    },
  },
];

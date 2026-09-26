# Business Intelligence Agents

## Purpose and value

Business Intelligence Agents is one of two workplace agent systems Sina designed and built end to end (the codebase is private): a multi-agent system in which specialist agents for people operations, finance, and campaigns analyze department data and write Persian reports with concrete recommendations. Department data and past reports lived in different tools, and managers needed more than fresh numbers: what changed and why, what deserved attention, what to do next, and for their corrections to carry into the next report. The system ran daily, weekly, and monthly analyses unattended, published the reports to shared spreadsheets in right-to-left Persian, and grounded every recommendation in figures the code had already checked. No quantified business impact is claimed.

## Workflow and engineering decisions

The pipeline: fetch via MCP, validate and compute, specialist agents, Persian report, manager review, feedback memory. Sina built an MCP server that exposes department data, report history, and saved manager feedback as tools, used LangGraph to orchestrate the specialist agents, and deployed the scheduler in Docker.

The core rule is numbers first, narrative second: code computes more than 20 financial ratios and period-over-period changes before the LLM sees anything, so the model interprets checked figures and never does the arithmetic. The finance agent ignores bank fees and small charges through a materiality filter, flags unusual individual transactions, and separates fixed from variable costs. The people-operations agent evaluates each team against the KPIs that team defined for itself, and the campaign agent compares cost per view with its target and suggests where to move budget.

Manager corrections are stored as explicit review notes and retrieved on the next run, so each report builds on the feedback given to the last one. Learning from feedback here means retrieving those notes, not retraining a model, and the manager keeps the final say.

## فارسی

«ایجنت‌های تحلیل و گزارش‌گیری» یکی از دو ایجنت کاریه که سینا از طراحی تا اجرا خودش ساخته (کدش خصوصیه). یه سیستم چندایجنتیه که توش ایجنت‌های تخصصی منابع انسانی، مالی و کمپین‌ها داده‌های هر واحد رو تحلیل می‌کنن و گزارش فارسی با پیشنهادهای مشخص می‌نویسن. داده‌ها و گزارش‌های قبلی توی چند ابزار پخش بود و مدیرها می‌خواستن بدونن چی عوض شده و چرا، کجا نیاز به توجه داره و قدم بعدی چیه. سیستم تحلیل‌های روزانه، هفتگی و ماهانه رو خودکار اجرا می‌کرد و گزارش‌ها رو راست‌چین توی شیت‌های مشترک منتشر می‌کرد. ادعای عددی دربارهٔ اثرش روی کسب‌وکار وجود نداره.

یه MCP server داده‌ها، گزارش‌های قبلی و بازخوردهای مدیر رو به‌شکل tool در اختیار ایجنت‌ها می‌ذاره و LangGraph کارشون رو هماهنگ می‌کنه. قاعدهٔ اصلی اینه: اول عدد، بعد تحلیل. بیش از ۲۰ نسبت مالی و تغییر نسبت به دورهٔ قبل با کد حساب می‌شن و LLM فقط عددهای چک‌شده رو تفسیر می‌کنه. ایجنت مالی کارمزد بانکی و تراکنش‌های کوچیک رو با فیلتر اهمیت کنار می‌ذاره، تراکنش‌های غیرعادی رو علامت می‌زنه و هزینه‌ها رو به ثابت و متغیر تفکیک می‌کنه. ایجنت منابع انسانی هر تیم رو با KPIهای خود اون تیم می‌سنجه و ایجنت کمپین هزینهٔ هر بازدید رو با هدفش مقایسه می‌کنه و برای جابه‌جایی بودجه پیشنهاد می‌ده. اصلاح‌های مدیر به‌شکل یادداشت ذخیره می‌شن و اجرای بعدی دوباره خونده می‌شن؛ «یاد گرفتن» اینجا یعنی استفاده از همین یادداشت‌ها، نه آموزش دوبارهٔ مدل، و حرف آخر با خود مدیره.

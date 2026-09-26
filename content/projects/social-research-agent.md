# Social Research Agent

## Purpose and value

The Social Research Agent is one of two workplace agents Sina designed and built end to end (the codebase is private). It is a LangGraph research agent that turns the daily flood of posts on X (Twitter) into a short, source-linked brief, and answers focused questions on demand — for example, what a set of accounts, or their followers, are saying about a topic. The team followed topic categories, specific people, communities, and trending topics. Before the agent, keeping up meant running the same searches by hand every day, wading through noise, and still missing the posts that mattered. The daily brief replaced that manual searching, focused questions could be answered on demand, and every finding stayed one click from its original post so the team could verify it before acting. No measured time-saving claim is available.

## Workflow and engineering decisions

The pipeline has six steps: scope, collect, filter and dedupe, LLM relevance, summarize, and deliver with the source. A scheduled Docker job builds the daily brief. A request can instead narrow the search to a topic category, selected people, an account's followers, communities, or trending topics, which the LLM first groups into the team's categories.

Sina's key design decision: code decides the facts, the model decides relevance. Freshness, language, and duplicate checks are deterministic rules; the LLM only judges whether a post deserves a person's attention and which topic it belongs to. Links that were already delivered are skipped and a thread is handled as one unit, so a post found through both a topic search and an account search appears in the brief once. Each result carries a summary of up to 200 characters, two or three sentences on why it matters, and the original text with its link.

Data sources sit behind a ports-and-adapters interface with a mock implementation, so the whole pipeline is tested without the network, and retry and cache layers keep a transient API failure from breaking the daily run. Sina built the LangGraph workflow, the collectors, the filtering and relevance logic, the LLM prompts, and the Docker deployment.

## فارسی

«ایجنت رصد شبکه‌های اجتماعی» یکی از دو ایجنت کاریه که سینا از طراحی تا اجرا خودش ساخته (کدش خصوصیه). یه ایجنت تحقیق با LangGraph که حجم زیاد پست‌های هر روز X (توییتر) رو به یه گزارش کوتاه با لینک منبع تبدیل می‌کنه و به سؤال‌های مشخص هم جواب می‌ده؛ مثلاً این‌که چند تا حساب خاص یا فالوئرهاشون دربارهٔ یه موضوع چی گفتن. تیم دسته‌های موضوعی، آدم‌های مشخص، کامیونیتی‌ها و ترندها رو دنبال می‌کرد و قبلاً باید هر روز همون جست‌وجوها رو دستی تکرار می‌کرد و باز هم پست مهم از قلم می‌افتاد. حالا گزارش روزانه جای این کار رو گرفته و هر نتیجه فقط یه کلیک با منبع اصلیش فاصله داره. ادعای عددی دربارهٔ صرفه‌جویی در زمان وجود نداره.

مسیر کار شش مرحله داره: تعیین محدوده، جمع‌آوری، فیلتر و حذف تکراری، سنجش با LLM، خلاصه و تحویل با لینک منبع. تازه بودن، زبان و تکراری بودن پست‌ها رو قاعده‌های مشخص چک می‌کنن و LLM فقط تشخیص می‌ده یه پست ارزش توجه داره یا نه و موضوعش چیه. لینک‌هایی که قبلاً تحویل داده شدن کنار می‌رن، هر رشته‌توییت یه واحد حساب می‌شه و هر نتیجه یه خلاصهٔ حداکثر ۲۰۰ کاراکتری، دو سه جمله دربارهٔ اهمیتش و متن اصلی با لینک داره. منبع‌های داده پشت یه interface با نسخهٔ mock هستن تا کل مسیر بدون شبکه تست بشه، و لایه‌های retry و cache نمی‌ذارن یه خطای موقتی API اجرای روزانه رو خراب کنه. اجرای روزانه با Docker زمان‌بندی شده.

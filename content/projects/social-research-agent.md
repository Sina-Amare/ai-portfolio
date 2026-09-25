# Social Research Agent

## Purpose and value

Sina built an internal research agent to turn several public conversation sources into a focused daily reading list. Checking selected accounts, communities, and trending topics by hand took repeated effort; relevant posts were easy to miss among unrelated or repeated items. The agent gives the team short summaries with links to the original posts, so people can review the source and choose what to pursue. No measured time-saving claim is available.

## Workflow and engineering decisions

A scheduled LangGraph workflow gathers recent posts from selected public sources. It filters by time, uses an LLM to judge relevance and categorize candidates, checks saved links to avoid duplicates, and stores a short summary and source link for each selected post in a private research queue. The hard part was keeping the output useful across overlapping, noisy sources. Rules handle dates and duplicate links; the LLM handles the judgment of whether a post deserves attention. If the same post appears through a community and a trend, it should enter the list once. People make the final editorial choice.

## فارسی

سینا این ایجنت رو ساخت تا تیم برای پیدا کردن چند پست مهم، هر روز چند منبع رو دستی زیر و رو نکنه. ایجنت پست‌های تازه رو از حساب‌ها، کامیونیتی‌ها و موضوع‌های داغی که انتخاب شده بودن جمع می‌کنه. LangGraph مراحل کار رو هماهنگ می‌کنه؛ LLM مرتبط بودن و موضوع پست‌ها رو می‌سنجه و برنامه پست‌های قدیمی و لینک‌های تکراری رو کنار می‌ذاره. برای هر مورد منتخب، یه خلاصهٔ کوتاه با لینک اصلی توی لیست خصوصی ذخیره می‌شه. تیم هر روز یه لیست جمع‌وجور برای بررسی داره و می‌تونه اصل هر پست رو هم بخونه. تصمیم نهایی دربارهٔ استفاده از محتوا با آدمه.

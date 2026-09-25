# Social Research Agent

## Purpose and value

Sina built a social research agent for both daily discovery and focused questions. The team needed to track topic categories and ask things such as what an account's followers were tweeting about a subject, or what selected people had said. Searching categories, accounts, and tweets by hand meant repeating work and still missing useful posts. The agent returns a short daily feed or a focused answer with summaries and links to the original tweets. No measured time-saving claim is available.

## Workflow and engineering decisions

A scheduled run builds the daily feed; a request can scope the search to a category, followers, selected people, or tweets about a chosen topic. LangGraph coordinates source selection, retrieval, relevance checking, and the answer. Rules handle dates and repeated links; an LLM judges whether a candidate is useful and groups it by topic. Every selected result keeps a short summary and original link. The hard part was broad coverage without burying good findings in noise: when one tweet appears in a follower search and a topic search, it enters the result once. People can verify the source and make the final editorial choice.

## فارسی

سینا این ایجنت رو ساخت تا تیم هم هر روز بحث‌های مهم رو پیدا کنه، هم بتونه سؤال دقیق بپرسه؛ مثلاً «فالوئرهای این حساب دربارهٔ فلان موضوع چی گفتن؟» یا «این چند نفر چه توییت‌هایی درباره‌اش داشتن؟». ایجنت بین دسته‌های موضوعی، فالوئرها، افراد انتخاب‌شده و توییت‌های مرتبط جست‌وجو می‌کنه. LangGraph مراحل رو هماهنگ می‌کنه. قواعد مشخص، پست‌های قدیمی و لینک‌های تکراری رو کنار می‌ذارن و LLM مرتبط بودن و موضوع پست‌ها رو می‌سنجه. خروجی، یه لیست روزانه یا جواب متمرکزه که کنار هر خلاصه لینک توییت اصلی رو داره. تیم لازم نیست هر بار چند جست‌وجو رو از صفر انجام بده و می‌تونه قبل از استفاده از هر نتیجه، منبعش رو چک کنه.

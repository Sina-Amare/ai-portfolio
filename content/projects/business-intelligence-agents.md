# Business Intelligence Agents

## Purpose and value

Sina built specialist agents to analyze business departments, including people operations, finance, and campaigns. Their data and previous reports lived in different tools. Managers needed an evaluation of performance, suggestions they could act on, and a way for their corrections to influence future reports. The agents produce Persian reports with checked numbers, explanations, and recommendations, then ask managers for feedback. No quantified impact or business outcome is claimed.

## Workflow and engineering decisions

LangGraph coordinates the specialist analysis workflows. MCP tools retrieve each department's current data, earlier reports, and relevant saved feedback. The system validates and normalizes inputs and computes metrics before an LLM interprets them. Each specialist evaluates changes against historical context, flags possible issues or opportunities, and drafts recommendations. The manager reviews the report, gives corrections or decisions, and that feedback is saved as memory for later runs. Learning from feedback here means retrieving those explicit notes to improve future evaluations and suggestions; it does not claim model retraining. The key difficulty was keeping recommendations grounded in checked figures and human review. For example, code computes an expense-to-income ratio first; the finance agent explains it, and a manager can correct the interpretation for the next report.

## فارسی

سینا برای تحلیل واحدهای کسب‌وکار، از جمله کارهای تیم، مالی و کمپین‌ها، ایجنت‌های تخصصی ساخت. داده‌ها و گزارش‌های قبلی توی چند ابزار بودن و مدیر علاوه بر عدد جدید، ارزیابی عملکرد و پیشنهاد قابل پیگیری می‌خواست. ابزارهای MCP داده‌های فعلی، گزارش‌های قبلی و بازخوردهای ذخیره‌شده رو میارن و LangGraph کار ایجنت‌ها رو هماهنگ می‌کنه. اول داده‌ها بررسی و یکدست می‌شن و شاخص‌ها با محاسبهٔ مشخص به دست میان؛ بعد هر ایجنت تغییرها رو ارزیابی می‌کنه و گزارش فارسی با پیشنهاد می‌نویسه. مدیر گزارش رو بررسی می‌کنه، نظر یا اصلاحش رو می‌گه و ایجنت اون بازخورد رو برای گزارش‌های بعدی نگه می‌داره. «یاد گرفتن» اینجا یعنی استفاده از همین یادداشت‌های ثبت‌شده در تحلیل بعدی، نه آموزش دوبارهٔ مدل. مثلاً نسبت هزینه به درآمد قبل از رسیدن به LLM حساب می‌شه و اگه مدیر تفسیر ایجنت رو اصلاح کنه، اون اصلاح در گزارش بعدی هم در دسترسه.

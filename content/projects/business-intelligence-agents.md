# Business Intelligence Agents

## Purpose and value

Sina built specialist workplace agents for people operations, finance, and campaign reporting. Their data came from different tools, so preparing a report meant reconciling sources, calculating metrics, and searching earlier reports for context. The agents made this a repeatable workflow: managers can review Persian reports that explain changes, possible issues, and suggested next steps with the underlying numbers available to check. No quantified impact or business outcome is claimed.

## Workflow and engineering decisions

LangGraph coordinates the specialist analysis workflows. MCP tools retrieve current data and earlier reports. The system validates and normalizes inputs and computes metrics before an LLM interprets them. Each specialist compares the current period with historical context and drafts findings and recommendations for manager review. The key difficulty was preventing a persuasive LLM explanation from resting on incorrect arithmetic or mismatched source data. For example, code computes an expense-to-income ratio first; the finance agent explains how it changed and what may merit attention. Calculation stays deterministic, while the LLM focuses on interpretation.

## فارسی

سینا برای گزارش‌های مربوط به کارهای تیم، هزینه‌ها و کمپین‌ها ایجنت‌های تخصصی ساخت. قبلاً برای هر گزارش باید داده‌های چند ابزار رو کنار هم می‌ذاشتیم، شاخص‌ها رو حساب می‌کردیم و گزارش‌های قبلی رو می‌گشتیم. ابزارهای MCP داده‌ها و گزارش‌های قبلی رو در اختیار ایجنت‌ها می‌ذارن و LangGraph جریان کارشون رو هماهنگ می‌کنه. داده‌ها اول بررسی و یکدست می‌شن و شاخص‌ها با محاسبهٔ مشخص به دست میان؛ بعد LLM تغییرها رو توضیح می‌ده و پیشنهادهایی برای بررسی مدیر می‌نویسه. مثلاً نسبت هزینه به درآمد قبل از رسیدن به مدل حساب می‌شه. نتیجه، گزارش‌های فارسیِ قابل بررسی بود که تغییرها و قدم‌های احتمالی بعدی رو یک‌جا نشون می‌داد.

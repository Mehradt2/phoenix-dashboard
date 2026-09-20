# Reporting Benchmark — KulePoshti

مدل گزارش کوله‌پشتی بر زنجیره تصمیم زیر بنا شده است:
`Executive → Risk → Root Cause → Person → Conversation → Evidence → Action`

## Executive View
- Volume
- Quality Average
- Open Review
- Critical Rate
- Quality Trend
- Risk Mix
- Failure Pareto

## QA Lead View
- Rule Pareto
- Critical findings
- Open Review
- Calibration drift
- Rule-pack version
- External-data gaps

## Team Lead View
- People table
- Recurring weaknesses
- Coaching priorities
- Review history
- Short-call exceptions

## Individual Profile
برای هر پزشک/نمونه‌گیر:
- Calls
- Average Score
- Pending Reviews
- Critical count
- Failure Pareto فردی
- تاریخچه مکالمات
- Evidence قابل Drill-down
- کنترل‌های عملیاتی مربوط به نقش
- سیگنال‌های طول تماس پزشک: کمتر از ۲۰ ثانیه و کمتر از ۸ دقیقه

## Separation of evidence sources
سه منبع باید در گزارش جدا بمانند:
1. Transcript-derived: قابل استخراج از صوت/STT.
2. Workflow-derived: فقط با Reviewer/CRM Evidence.
3. External DB-derived: زمان، CSAT، نوع سفارش، کنسلی، تحویل و سایر داده‌های عملیاتی.

هیچ KPI خارجی تا زمان اتصال منبع معتبر با مقدار ساختگی پر نمی‌شود.

## Sampler operational profile requirements
- انجام خارج از بازه و بعد از ۱۱:۳۰
- تحویل کمتر از ۷–۸ دقیقه به‌عنوان Exception
- سقف تحویل موفق ۱۵۰ دقیقه
- CSAT: ۱–۳ ضعیف، ۴ معمولی، ۵ عالی
- درصد و علت کنسلی
- تحویل ثبت‌نشده
- تأخیر بیش از ۲ ساعت در ثبت کنسلی/آزادسازی ظرفیت

## Physician operational profile requirements
- Visit contact attempts
- Interpretation attempts only when applicable
- Response recorded
- Organization-only interpretation
- No second organizational prescription
- Cancellation only during visit
- Golden-test gate from approved versioned list
- Short-call monthly signal

این ساختار برای جلوگیری از «یک Score مبهم» طراحی شده و باید امکان حرکت از KPI مدیریتی تا Evidence همان تماس را حفظ کند.

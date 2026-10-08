# PRD v2.5 — کوله‌پشتی QC Operations OS

## مسئله
نسخه قبلی عمدتاً UI/Validation بود و در مسیرهای واقعی پردازش، خروجی و پرونده‌سازی پایدار نبود. این نسخه محصول را به Data/Decision Platform تبدیل می‌کند.

## کاربران
QC Reviewer، Operator، Manager و تیم فنی.

## سه مسیر
- پزشک: امتیاز مکالمه، ابعاد QC، پرونده، تاریخچه و روند.
- نمونه‌گیر: پرونده و امتیاز مستقل با قواعد عملیاتی خودش.
- کاربر/VOC: موضوع، رضایت/عدم رضایت و تاریخچه.

## نیازمندی‌های حیاتی
Ogason Adapter، Transcript Integrity، Evidence Guard، Rule Engine نسخه‌دار، Human Review، PostgreSQL، Docker/On-Prem، CSV، فیلتر تاریخ شمسی/میلادی در UI، API قابل اتصال به دیتابیس واقعی، Audit/RBAC و AI اختیاری Local.

## Non-goal
AI نباید Transcript را بازنویسی کند؛ Tone نباید بدون Calibration روی Score اثر بگذارد؛ مدل نباید ثبت واقعی نسخه را جعل کند.

# KulePoshti QC Operations OS — Local Platform v2.5.0

Product/Engineering signature: mehradtorabi1

هدف این بسته تبدیل Validation UI به یک هسته قابل استقرار On-Premise برای پزشک، نمونه‌گیر و کاربر/VOC است.

مسیر داده:
Ogason STT → Transcript Integrity → Persian Normalization → Role/Entity Extraction → Evidence Guard → Rule Engine → Profile/History → Reporting/Review

اصل غیرقابل مذاکره: Transcript خام Ogason منبع حقیقت است و هیچ مدل تحلیلی حق بازنویسی آن را ندارد.

اجرا:
docker compose up --build

UI: http://localhost:8080
API: http://localhost:8080/api
Health: http://localhost:8080/api/health

این Release Production Foundation است. معیارهای Gold و Thresholdهای نهایی باید با Gold Dataset واقعی فارسی پزشکی کالیبره شوند؛ Accuracy ساختگی اعلام نمی‌شود.

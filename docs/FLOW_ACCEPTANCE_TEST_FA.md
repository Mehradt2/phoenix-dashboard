# Acceptance Test فلو عملیاتی QC — v1.2.0

## هدف
جلوگیری از تکرار خطایی که UI پیام Success نشان می‌داد اما Review/Profile خالی بود.

## Gate A — Sampler
- ایجاد Vault
- انتخاب حوزه نمونه‌گیر
- ورود فایل
- ثبت نام نمونه‌گیر
- ایجاد Transcript
- اجرای Rule Pack C01..C09
- Persist encrypted Case
- status = needs_review
- مشاهده نام فرد در Review Queue
- بازکردن Case و مشاهده Rule Evidence
- مشاهده همان فرد در Profile

## Gate B — Physician
- تغییر حوزه به پزشک
- ورود فایل متفاوت
- ثبت نام پزشک
- ایجاد Transcript
- اجرای PVQ-026..040
- Persist encrypted Case
- مشاهده Case در Review
- مشاهده PVQ Evidence
- مشاهده Physician Profile

## Gate C — ASR failure
- Timeout/Model failure نباید Success جعلی بسازد.
- Row باید Failed + reason شود.
- Manual Transcript و Retry باید در همان Row موجود باشند.
- هیچ Case ناقص در Report نباید ایجاد شود.

## Gate D — Persistence
بعد از `putCase`، `listCases` باید همان Case را برگرداند. UI قبل از نمایش پیام Success باید Reload Repository را await کند.

## Gate E — Profile
Profile فقط از Caseهای واقعاً Persist شده ساخته می‌شود؛ Seed/Demo data مجاز نیست.

## Gate F — Docs/Docker
هر Release باید Source + docs + Docker + migrations را در Recovery Artifact نگهدارد.

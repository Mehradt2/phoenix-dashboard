# وضعیت Release فعلی کوله‌پشتی

تاریخ ثبت: ۲۰۲۶-۰۹-۲۱

## Runtime عمومی فوری
- URL: `https://mehradt2.github.io/phoenix-dashboard/`
- Mode: Browser Local
- Source of truth برای SHA فعال: فایل `RELEASE.txt` روی همان دامنه
- Vault: Encrypted IndexedDB
- Shared Team DB در URL عمومی: خیر
- Audio Cloud Upload: صفر
- Paid AI/API dependency: صفر

## اصلاحات Release جاری
این Release برای برطرف‌کردن Gapهای مشاهده‌شده در فلو واقعی QC ایجاد شده است:
- Pipeline پردازش دیگر Success جعلی نشان نمی‌دهد؛ فقط پرونده واقعاً ذخیره‌شده وارد Review می‌شود.
- بارگذاری Whisper Fail-closed است: Auto روی WebGPU از Small و بدون WebGPU از Tiny استفاده می‌کند؛ Timeout مدل ۱۵۰ ثانیه و Fallback نهایی Tiny است. Transcript دستی و Retry نیز به‌عنوان مسیر بازیابی وجود دارد.
- پس از ساخت موفق پرونده، کاربر مستقیم به صف Review منتقل می‌شود.
- صف Review فقط پرونده‌های باز را نشان می‌دهد.
- Rule Pack نمونه‌گیران: `sampler-conversation-qc-1.1.0`.
- Rule Pack پزشکان: `physician-qc-2.0.0` / `DOC-009 · PVQ-026..040`.
- Physician Workflow Gate اضافه شده: ویزیت/تفسیر/ثبت پاسخ/کانال سازمانی/نسخه دوم/کنسلی/تست طلایی.
- Operational Policy نسخه‌دار برای پزشک و نمونه‌گیر اضافه شده است.
- پرونده فردی پزشک/نمونه‌گیر دارای Drill-down تماس، Failure Pareto، Critical، Review باز و سیگنال طول تماس است.
- Master List نمونه‌گیران با ۳۰ فرد فعال، گرید و شهر نسخه‌دار شده؛ افزودن دستی و Team DB persistence فعال است.
- هر Case نمونه‌گیر `occurredAt` و snapshot گرید/شهر دارد و گزارش بر اساس تاریخ دقیق، روز هفته، ماه شمسی و نام فیلتر و Export می‌شود.
- Duplicate Guard با SHA-256 از پردازش دوباره فایل صوتی جلوگیری می‌کند.
- CI علاوه بر Build/Test، Source + Docs + Docker را به‌صورت Recovery Artifact immutable بسته‌بندی می‌کند.

## Team Docker Runtime
معماری:
`React/Nginx → Node API → PostgreSQL 16` با Caddy TLS.

کنترل‌های اصلی:
- Login + RBAC
- Team shared cases/reviews/reports
- Transcript encryption at rest
- Append-only audit
- Versioned rule packs
- Audio خام به API ارسال نمی‌شود
- DB migration نسخه‌دار
- Docker/CI integration gate

## تفاوت Browser Local و Team Docker
### Browser Local
- شروع سریع برای اپراتور
- Vault مستقل هر Browser
- Whisper/AI روی همان دستگاه
- Backup دستی رمزگذاری‌شده
- داده بین اپراتورها مشترک نیست

### Team Docker
- پایگاه داده مشترک
- حساب کاربری و RBAC
- Case/Review مشترک
- مناسب اتصال به دیتابیس واقعی سازمان
- Audio همچنان Local-first باقی می‌ماند

## داده‌هایی که هنوز از منبع بیرونی لازم دارند
سیستم نباید این موارد را از روی Transcript جعل کند و تا اتصال DB واقعی با برچسب External/Workflow نمایش می‌دهد:
- تعداد واقعی تلاش‌های تماس در CRM/Call Log
- نوع سرویس سازمانی/B2C
- لیست مصوب تست‌های طلایی
- زمان نمونه‌گیری تا تحویل
- CSAT نمونه‌گیر
- علت/زمان کنسلی
- تحویل ثبت‌نشده و آزادسازی ظرفیت

## Production Gates
- Browser build/test/smoke: باید در GitHub Actions PASS شود.
- Real Audio ASR Gate: دو WAV فارسی واقعیِ قابل Decode (نمونه‌گیر و پزشک) باید بدون Transcript دستی از Whisper → Persist → QC → Review Evidence → Profile عبور کنند.
- همین Real Audio Gate باید یک‌بار روی Preview محلی CI و بار دوم روی URL عمومی GitHub Pages PASS شود.
- فایل `VERIFIED.txt` فقط بعد از PASS شدن تست عمومی ساخته می‌شود؛ نبودن آن یا ناهماهنگی SHA یعنی Release نهایی تأیید نشده است.
- Team Docker validate/integration/publish: باید PASS شود.
- Public domain: فقط پس از تطابق `RELEASE.txt` و `VERIFIED.txt` با SHA جاری معتبر است.
- Windows Offline: Evidence track مستقل و هنوز نیازمند Production Gate اختصاصی است.

هیچ Release بدون Source، Docker، Docs، Tests و Recovery Artifact هم‌زمان «Done» محسوب نمی‌شود.

## E2E واقعی Case Pipeline
Gate جاری دو مسیر مستقل را تست می‌کند:
1. مسیر بازیابی Manual Transcript برای نمونه‌گیر و پزشک تا Persist، Review Evidence و Profile.
2. مسیر واقعی صوت برای نمونه‌گیر و پزشک با WAV فارسی تولیدشده در CI: Audio Decode → Whisper محلی → Transcript → Persist → QC Rule Evidence → Review → Profile.

در تست واقعی صوت هیچ دکمه Transcript دستی استفاده نمی‌شود. اگر Whisper مدل را بارگیری نکند، Transcript کمتر از حداقل باشد، Case ذخیره نشود، Evidence ساخته نشود یا Profile تشکیل نشود، Release Fail می‌شود. همین Gate بعد از انتشار روی URL عمومی نیز تکرار می‌شود.

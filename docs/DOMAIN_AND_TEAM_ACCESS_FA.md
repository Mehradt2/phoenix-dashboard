# دامنه و دسترسی تیم QC

## دسترسی عملیاتی فوری
دامنه Public فعلی:
`https://mehradt2.github.io/phoenix-dashboard/`

این URL توسط اپراتورها قابل استفاده است، اما **Browser-local** است؛ هر مرورگر Vault مستقل دارد و Dashboard مشترک سازمانی نمی‌سازد.

## دامنه Team Runtime
برای کار تیمی مشترک باید Docker Runtime روی Host نصب و یک دامنه به آن متصل شود:
مثال:
`https://qc.example.org`

DNS:
- A/AAAA → IP Host
- Caddy گواهی TLS را اتوماتیک می‌گیرد.
- فقط 80/443 Public.
- PostgreSQL و API port مستقیم Public نیستند.

## نقش‌ها
- **operator**: ورود فایل، اجرای STT/QC، مشاهده پرونده.
- **reviewer**: همه operator + ثبت Review.
- **supervisor**: Review + مدیریت عملیاتی/Rule Pack + حذف نرم پرونده.
- **admin**: مدیریت کاربران و تنظیمات زیرساختی.

## Audio Path
Browser → Decode/Whisper/Rule Engine

Audio خام به Team API نمی‌رود.

## Data Path
Browser → HTTPS → API → PostgreSQL

Transcript روی API قبل از ذخیره با AES-256-GCM رمز می‌شود.

## شرایط Go-live تیمی
- Domain/TLS PASS
- Admin password rotated
- حداقل دو Reviewer واقعی ساخته شوند
- Backup اولیه PASS
- Restore Drill روی Host تستی
- Login/Review/Audit E2E PASS
- Retention policy داده تصویب شود

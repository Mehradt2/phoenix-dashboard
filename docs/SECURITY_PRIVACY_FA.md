# امنیت و حریم داده

## Threat model
دارایی‌های حساس:
- Transcript فارسی پزشکی/عملیاتی
- QC evidence و review
- هویت اپراتور/پزشک/نمونه‌گیر
- Rule Pack و Audit
- Credentials/Secrets

## Controls
### Audio
- Audio خام فقط در Browser پردازش می‌شود.
- Team API endpoint برای Audio وجود ندارد.
- Cloud ASR ممنوع در این Runtime.

### Transcript
Browser-local:
- AES-GCM داخل Vault.

Team:
- HTTPS در Transport.
- AES-256-GCM قبل از ذخیره PostgreSQL.
- Key فقط از Secret/Environment.

### Authentication
- Password hash: scrypt + random salt.
- Session token random؛ فقط hash در DB.
- Cookie: HttpOnly, SameSite=Strict, Secure در Production.
- 5 تلاش ناموفق → lock موقت 15 دقیقه.

### RBAC
operator / reviewer / supervisor / admin.

### Audit
Append-only در DB و Trigger مانع Update/Delete می‌شود.

### Network
- PostgreSQL فقط Docker internal network.
- Public: 80/443.
- API پشت same-origin reverse proxy.

### Secrets
- هرگز Commit نشوند.
- `.env` در Host، ترجیحاً Secret Manager.
- DATA_ENCRYPTION_KEY و DB Password Rotate شوند.

## Retention
Retention نهایی باید توسط عملیات/حقوقی تصویب شود. تا آن زمان:
- Audio persist نمی‌شود.
- Soft-deleted cases نگه داشته می‌شوند تا Policy purge مشخص شود.
- Audit قابل حذف عادی نیست.

## Security release gate
- dependency scan
- login brute-force smoke
- RBAC negative tests
- Origin/Cookie behavior
- DB not exposed
- restore drill
- no audio upload endpoint

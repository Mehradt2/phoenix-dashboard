# وضعیت Release فعلی کوله‌پشتی

تاریخ ثبت: ۲۰۲۶-۰۹-۲۱

## Runtime عمومی فوری
- URL: `https://mehradt2.github.io/phoenix-dashboard/`
- Mode: Browser Local
- Release SHA منتشرشده: `869e5e781b6e10e8251322eea28eebbf17e25af1`
- GitHub Pages CI: **PASS**
- مناسب برای اپراتور QC: **YES — با Vault مستقل هر مرورگر**
- Shared Team DB: **NO در این URL**

## Team Docker Runtime
آخرین کد Docker/Backend که Full Integration PASS گرفته:
- Source SHA: `4a429f85ea8d882df66306ee9cfa0b4f44cdae0e`
- Workflow: KulePoshti Team Docker
- Validate: **PASS**
- PostgreSQL migration: **PASS**
- API health: **PASS**
- Auth/RBAC smoke: **PASS**
- Team browser E2E: **PASS**
- User management E2E: **PASS**
- Web image publish: **PASS**
- API image publish: **PASS**

Images:
- `ghcr.io/mehradt2/kuleposhti-web:4a429f85ea8d882df66306ee9cfa0b4f44cdae0e`
- `ghcr.io/mehradt2/kuleposhti-api:4a429f85ea8d882df66306ee9cfa0b4f44cdae0e`

## تفاوت دو Runtime
### Browser Local
برای شروع فوری تیم، بدون سرور و هزینه:
- هر اپراتور Vault خودش را دارد.
- Audio/STT/QC محلی است.
- Backup رمزگذاری‌شده دستی.
- داده بین افراد مشترک نیست.

### Team Docker
برای کار تیمی واقعی:
- Login سازمانی.
- Roleهای operator/reviewer/supervisor/admin.
- PostgreSQL مشترک.
- Transcript encrypted-at-rest.
- Audit append-only.
- Dashboard و Profile مشترک.
- Audio خام همچنان به API ارسال نمی‌شود.

## وضعیت Production
- Browser Local operational: **YES**
- Team Docker integration-ready: **YES**
- Team Docker public-domain deployment: **نیازمند Host/DNS متعلق به سازمان**
- Windows Offline Production evidence: **جریان مستقل؛ هنوز Production PASS نهایی نشده**

هیچ Host عمومی اشتراکی برای داده پزشکی بدون تصمیم زیرساخت/حریم‌داده به‌صورت خودکار ایجاد نشده است.

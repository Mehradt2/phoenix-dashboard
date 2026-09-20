# Runbook استقرار Team Docker

## هدف
ساخت یک Runtime مشترک برای تیم QC بدون وابستگی به AppDeploy/Railway/Render.

## پیش‌نیاز
- Linux host با Docker Engine + Compose v2
- حداقل شروع: 2 vCPU / 4GB RAM / 30GB Disk
- دامنه DNS شده به Public IP یا DNS داخلی
- پورت 80/443
- Git

> Whisper در این Runtime در Browser اجرا می‌شود؛ Host برای STT به GPU نیاز ندارد.

## نصب
```bash
git clone <repo>
cd phoenix-dashboard
git checkout kuleposhti-operational-web-v1
cp .env.example .env
sh ops/generate-secrets.sh
```

خروجی Secret generator را در `.env` قرار دهید. سپس:
```bash
docker compose build
docker compose up -d db
docker compose run --rm migrate
docker compose up -d
docker compose ps
sh ops/smoke.sh
```

## Local validation بدون TLS
```bash
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d db
docker compose -f docker-compose.yml -f docker-compose.local.yml run --rm migrate
docker compose -f docker-compose.yml -f docker-compose.local.yml up -d api web
```
سپس: `http://localhost:8088`

## اولین Admin
فقط وقتی جدول users خالی است، API از:
- `BOOTSTRAP_ADMIN_EMAIL`
- `BOOTSTRAP_ADMIN_PASSWORD`

یک Admin می‌سازد. بعد از ایجاد کاربران واقعی، Password اولیه را در Secret Store Rotate کنید.

## Upgrade
1. Backup.
2. Pull source.
3. Build images.
4. Run migration.
5. Start API/Web.
6. Smoke.
7. بررسی Audit و Review flow.

```bash
sh ops/backup.sh
git pull
docker compose build
docker compose run --rm migrate
docker compose up -d
sh ops/smoke.sh
```

## Rollback
Application image باید با SHA Git Tag شود. در صورت خطای Release:
- DB migration فقط backward-safe باشد یا migration rollback مستند داشته باشد.
- Image قبلی را Restore کنید.
- اگر Schema destructive بوده، Backup قبل Release را Restore کنید.

## ممنوع
- Publish مستقیم PostgreSQL روی Internet.
- ارسال Audio خام به API.
- نگهداری Secret در Git.
- استفاده از `latest` به‌تنهایی برای Production pin.


## Imageهای مرجع GHCR
پس از PASS شدن CI، دو Image با Git SHA و tag پایدار منتشر می‌شوند:
- `ghcr.io/mehradt2/kuleposhti-web:team-latest`
- `ghcr.io/mehradt2/kuleposhti-api:team-latest`

برای استقرار قابل بازیابی Production، **از SHA tag همان Release استفاده کنید** و نه صرفاً `team-latest`.

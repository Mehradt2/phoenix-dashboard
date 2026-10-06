# Runbook مهاجرت به سرور داخلی — Intelligence v2

## پیش‌نیاز
- Linux x86_64
- Docker Engine + Compose v2
- دسترسی شبکه به Oganson
- DNS داخلی
- PostgreSQL volume backup

## مراحل
1. Clone repo.
2. Checkout `kuleposhti-local-intelligence-v2`.
3. `.env.example → .env`.
4. Secretهای واقعی تولید شود.
5. `OGANSON_BASE_URL` به IP/DNS داخلی Oganson تنظیم شود.
6. `docker compose config`.
7. `docker compose build`.
8. `docker compose up -d db`.
9. migration.
10. `docker compose up -d api web caddy`.
11. Health:
   - /api/health
   - /api/v2/intelligence/health
12. ارسال Transcript synthetic فارسی.
13. بررسی Profile/History/CSV.
14. سپس UAT داده واقعی.

## Rollback
- Imageها با Git SHA pin شوند.
- migrationها forward-only هستند؛ rollback اپ با image قبلی و DB backup انجام شود.

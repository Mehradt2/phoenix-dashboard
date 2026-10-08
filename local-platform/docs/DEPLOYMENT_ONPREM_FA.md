# استقرار داخلی

پیش‌نیاز: Docker Engine + Compose، شبکه داخلی، DNS داخلی و سرور Linux.

راه‌اندازی:
cp .env.example .env
docker compose up -d --build

دامنه: Reverse Proxy سازمانی را به سرویس web وصل کنید. UI APIها را با مسیر نسبی /api صدا می‌زند، بنابراین مهاجرت دامنه نیازمند تغییر Frontend نیست.

DB واقعی: DATABASE_URL را به PostgreSQL واقعی تغییر دهید. در Production migration رسمی Alembic جایگزین init شود.

Backup: DB + Rule Packs + Config + Model Manifest + docs باید در Backup Bundle قرار گیرند و Restore در محیط جداگانه Verify شود.

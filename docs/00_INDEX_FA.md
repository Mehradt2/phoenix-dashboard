# کوله‌پشتی — فهرست مرجع فنی و Knowledge Base

این پوشه **مرجع بازیابی، پیاده‌سازی مجدد و تحویل به تیم فنی/زیرساخت** است. هیچ Release نباید بدون به‌روزرسانی این Index و اسناد مرتبط نهایی شود.

## وضعیت Runtimeها
1. **Operational Web / Browser Local**
   - دامنه عمومی: `https://mehradt2.github.io/phoenix-dashboard/`
   - Audio روی Browser می‌ماند.
   - Whisper و AI محلی.
   - Vault رمزگذاری‌شده در IndexedDB.
   - مناسب شروع سریع اپراتورها؛ داده بین مرورگرها مشترک نیست.

2. **Team Docker Runtime**
   - React Web + Node API + PostgreSQL 16 + Caddy TLS.
   - همان QC Domain Logic با Repository Adapter.
   - Audio خام همچنان به Backend ارسال نمی‌شود.
   - Transcript/QC مجاز در Team DB ثبت و Transcript با AES-256-GCM رمز می‌شود.
   - Auth/RBAC/Session/Audit فعال.
   - مقصد مناسب تیم QC مشترک و اتصال به دیتابیس واقعی.

3. **Windows Offline Target**
   - Tauri/Rust + SQLite WAL + whisper.cpp.
   - مسیر Disaster Recovery و استفاده بدون اینترنت.
   - Production Evidence مستقل لازم دارد.

## اسناد اصلی
- `CURRENT_RELEASE_STATUS_FA.md` — وضعیت Release و Evidence جاری.
- `QC_OPERATOR_QUICKSTART_FA.md` — راهنمای شروع سریع اپراتور QC.
- `TECH_HANDOFF_CHECKLIST_FA.md` — چک‌لیست تحویل به مهندسی و زیرساخت.
- `PRODUCT_ARCHITECTURE_FA.md` — معماری محصول.
- `DOCKER_TEAM_RUNBOOK_FA.md` — نصب و اجرای Docker.
- `DOMAIN_AND_TEAM_ACCESS_FA.md` — دامنه، TLS و دسترسی تیم.
- `DATABASE_SCHEMA_FA.md` — مدل داده PostgreSQL.
- `API_CONTRACT_FA.md` — قرارداد API و RBAC.
- `SECURITY_PRIVACY_FA.md` — امنیت/حریم داده.
- `RECOVERY_DR_FA.md` — Backup/Restore/Disaster Recovery.
- `OBSERVABILITY_SRE_FA.md` — Health, Log, Alert و SLO.
- `KNOWLEDGE_BASE_OPERATIONS_FA.md` — روش نگهداری Knowledge Base.
- `AGILE_RELEASE_GOVERNANCE_FA.md` — Definition of Done و Release Gates.
- `AI_LOCAL_POLICY_FA.md` — سیاست AI بدون هزینه.
- `REPORTING_BENCHMARK_FA.md` — طراحی گزارش و Drill-down.
- `WHISPER_BROWSER_POLICY_FA.md` — سیاست ASR مرورگر.

## Source of Truth
- Source branch: `kuleposhti-operational-web-v1`
- Static publishing branch: `main`
- DB migrations: `server/migrations/`
- Runtime API: `server/src/`
- Docker: `docker/`, `docker-compose.yml`
- Ops scripts: `ops/`
- CI: `.github/workflows/kuleposhti-pages.yml`, `kuleposhti-docker.yml`

## قانون بازیابی
هر مهندس جدید باید بتواند فقط با Clone Repository + این Index:
1. Browser runtime را Build کند.
2. Team Docker را روی Host جدید بالا بیاورد.
3. DB را Migration کند.
4. Backup را Restore کند.
5. Smoke Test بگیرد.
6. دامنه جدید را بدون تغییر Business Logic متصل کند.

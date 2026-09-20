# ADR-001 — Dual Runtime + Repository Adapter

Status: Accepted

## Context
کوله‌پشتی هم به یک URL سریع و رایگان برای اپراتور نیاز دارد و هم در نهایت به دیتابیس مشترک/On-prem/Windows نیاز خواهد داشت. وابستگی مستقیم UI به IndexedDB یا PostgreSQL باعث Rewrite می‌شود.

## Decision
Business/QC Domain از Storage جدا می‌ماند.
`src/repository.ts` Runtime را انتخاب می‌کند:
- local → encrypted IndexedDB
- team → HTTPS API/PostgreSQL

Audio در هر دو حالت روی Client باقی می‌ماند.

## Consequences
مثبت:
- Provider-independent
- مهاجرت به DB واقعی بدون Rewrite Rule Engine
- GitHub Pages فوری
- Team Docker قابل استقرار داخلی

هزینه:
- دو Repository Adapter باید در Regression Suite حفظ شوند.
- Feature parity باید تست شود.

## Rejected
- AppDeploy-only runtime
- Browser-only به‌عنوان معماری نهایی
- Upload Audio به Backend Free-tier

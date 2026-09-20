# مدل داده PostgreSQL — Team Runtime

Migration مرجع: `server/migrations/001_init.sql`

## users
هویت کاربران تیم:
- email unique
- display_name
- password_salt/hash با scrypt
- role: operator/reviewer/supervisor/admin
- active

## sessions
Sessionهای Server-side:
- token فقط در Cookie HttpOnly است.
- DB فقط SHA256 token را نگه می‌دارد.
- expiry قابل تنظیم.

## cases
پرونده QC مشترک:
- domain: sampler/physician
- person_name
- source_name
- audio_sha256 unique
- duration_seconds
- transcript_iv / transcript_cipher
- stt_json
- qc_json
- status
- created_by / updated_by
- soft delete: deleted_at

Raw Audio در DB وجود ندارد.

## reviews
تصمیم انسانی:
- decision
- conversation/workflow/final score
- note
- workflow evidence
- reviewer
- timestamp

## ai_insights
خروجی Copilot:
- model
- summary رمزگذاری‌شده
- payload
- actor/time

AI Insight حق تغییر Score ندارد.

## rule_packs
Rule Packهای نسخه‌دار:
- domain
- version
- candidate/active/retired
- SHA256
- JSON content

## audit_events
Append-only:
- actor
- case
- domain
- action
- detail
- timestamp

Trigger دیتابیس UPDATE/DELETE روی Audit را Reject می‌کند.

## Indexها
برای:
- domain + created_at
- status
- person
- reviews by case
- audit by case/time

## اصول Migration
- Forward-only و idempotent.
- هر migration نام‌دار و در `schema_migrations` ثبت می‌شود.
- migration destructive بدون Backup + rollback plan ممنوع.

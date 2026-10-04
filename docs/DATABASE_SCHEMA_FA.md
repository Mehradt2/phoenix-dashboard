# مدل داده PostgreSQL — Team Runtime

Migrationهای مرجع: `001_init.sql`، `002_sampler_registry_case_date.sql` و `003_text_intelligence_v2.sql`

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
- occurred_at — تاریخ واقعی مکالمه
- person_meta — snapshot گرید/شهر نمونه‌گیر در زمان ثبت
- soft delete: deleted_at

Raw Audio در DB وجود ندارد.

## samplers
Master List مشترک نمونه‌گیران:
- full_name unique
- grade
- city
- active
- source: seed/manual
- created_at / updated_at

Seed اولیه شامل ۳۰ نمونه‌گیر فعال تهران است و افزودن دستی از API/UI قابل انجام است.

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


## v2 — subjects
هویت مشترک پرونده برای physician / sampler / voc:
- domain
- external_key
- display_name
- metadata

## cases v2
فیلدهای جدید:
- subject_id
- external_source / external_id
- occurred_at_ts
- transcript_analysis_json
- processing_version

## voc_topics
Topicهای Normalized برای گزارش VOC:
- topic_code
- confidence
- satisfaction
- urgency
- evidence

## processing_events
Trace مرحله‌ای ingest / text intelligence برای مانیتورینگ و بازیابی.

## medical_lexicon_versions
Version/SHA/Status برای واژه‌نامه فارسی پزشکی.

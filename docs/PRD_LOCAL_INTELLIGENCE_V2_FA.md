# PRD — KulePoshti Local Intelligence v2

## مسئله
محصول قبلی بیش از حد به Audio/Browser processing نزدیک بود. معماری نهایی باید متن فارسی خروجی Oganson را به تصمیم QC قابل دفاع، پرونده فردی و VOC تبدیل کند و روی سرور داخلی بدون Cloud AI اجرا شود.

## کاربران
- QC Operator: Intake، Review، Evidence.
- QC Reviewer: تأیید/ارجاع/Override.
- Supervisor: پروفایل فردی، Trend، Export.
- Admin/Infrastructure: کاربران، Docker، Backup/Restore.
- Operations Manager: گزارش مدیریتی Physician/Sampler/VOC.

## Jobs-to-be-done
### پزشک
Transcript → Evidence → PVQ Rules → Score/Review Gate → پرونده پزشک → Trend/History.

### نمونه‌گیر
Transcript → QP Rules → Conversation Score → Workflow Review → Final Score → پرونده نمونه‌گیر.

### VOC
Transcript → Topic → Sentiment → Satisfaction → Urgency → پرونده/History کاربر.

## MVP Acceptance
- Oganson webhook/pull integration.
- فارسی normalization.
- Medical entities: drug/disease/lab/symptom/dose.
- Physician/Sampler deterministic engines.
- VOC topic/sentiment/satisfaction.
- Shared PostgreSQL history.
- Date filters Gregorian/Jalali.
- CSV export.
- RBAC + append-only audit.
- Docker Compose local deployment.
- E2E CI with synthetic Persian transcript fixtures.

## Non-goals MVP
- LLM حق تغییر مستقیم Score ندارد.
- Audio prosody/tone نهایی از Transcript استنتاج نمی‌شود.
- Medical diagnosis تولید نمی‌شود.
- Speaker role بدون metadata حدس زده نمی‌شود.

## Success metrics
- Ingest idempotency = 100%.
- Critical rule recall on Gold ≥ 98%.
- False critical approval = 0.
- VOC topic macro-F1 target ≥ 0.85 after labeled pilot.
- Sentiment macro-F1 target ≥ 0.85 after labeled pilot.
- Profile/history query p95 < 1s for 100k interactions on target server.

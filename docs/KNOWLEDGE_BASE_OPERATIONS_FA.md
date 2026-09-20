# روش نگهداری Knowledge Base پروژه

این سند الزام‌آور است. Documentation یک Deliverable فرعی نیست؛ بخشی از Product Definition of Done است.

## بعد از هر تغییر کدام اسناد باید بررسی شوند؟
### UI/UX
- README
- PRODUCT_ARCHITECTURE
- Reporting/UX docs
- Test/E2E

### QC Rule
- Rule Pack version
- QC Engine tests
- Knowledge base
- Release notes
- Calibration requirements

### Database/API
- DATABASE_SCHEMA
- API_CONTRACT
- Migration
- Recovery Runbook

### Docker/Infra
- DOCKER_TEAM_RUNBOOK
- DOMAIN_AND_TEAM_ACCESS
- SECURITY
- OBSERVABILITY
- RECOVERY

### AI/Model
- AI_LOCAL_POLICY
- WHISPER policy
- Gold/Calibration evidence

## ثبت تصمیم
تصمیمات معماری غیرقابل‌بدیهی در `docs/adr/` ثبت شوند:
- Context
- Decision
- Alternatives
- Consequences
- Rollback

## نسخه‌گذاری
- Product/UI: semver یا release SHA.
- Rule Pack: نسخه مستقل.
- DB Schema: migration number.
- AI model: model ID + revision/hash وقتی ممکن.
- Docker image: Git SHA؛ latest فقط convenience.

## Handoff به تیم فنی
مهندس جدید باید بتواند:
- در <30 دقیقه معماری را بفهمد.
- در <60 دقیقه Local/Team Runtime را Build کند.
- با Runbook روی Host آزمایشی Deploy کند.
- DB را Restore کند.
- مسیر Case → Review → Report را تست کند.

## ممنوع
- تغییر Production بدون سند.
- تغییر Rule بدون Version.
- تغییر Schema مستقیم بدون Migration.
- تغییر Model بدون Calibration evidence.

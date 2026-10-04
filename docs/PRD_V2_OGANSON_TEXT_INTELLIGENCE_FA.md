# PRD — KulePoshti v2 / Oganson Text Intelligence

## مسئله
Oganson سرویس لوکال تبدیل صوت به متن است. کوله‌پشتی از این Release به بعد مسئول STT نیست؛ مسئولیت اصلی آن **فهم متن فارسی، ساخت Evidence، امتیازدهی کنترل‌شده، پرونده‌سازی و گزارش** است.

## کاربران
- اپراتور QC
- Reviewer / Supervisor
- مدیر عملیات
- مدیر پزشکی
- مدیر تجربه مشتری / VOC
- تیم مهندسی و زیرساخت

## سه Domain
1. پزشک: Transcript → PVQ/QC → Human Review → پرونده پزشک → تاریخچه/Trend/Export.
2. نمونه‌گیر: Transcript → Conversation QC + Workflow Evidence → Final Score → پرونده نمونه‌گیر.
3. VOC: Transcript → Topic + Satisfaction + Urgency → پرونده کاربر → History/Trend/Export.

## تجربه مطلوب
Oganson متن را Push می‌کند؛ Case بدون Upload دستی در صف Review ظاهر می‌شود. Reviewer باید Evidence هر تصمیم را ببیند. Profile هر فرد تاریخچه کامل و Drill-down دارد.

## MVP
- Webhook امن Oganson.
- Dedup بر اساس source/externalId.
- Persian normalization.
- Medical entity extraction.
- Physician/Sampler/VOC engines.
- PostgreSQL shared history.
- Profiles + date range.
- CSV export با تاریخ میلادی و شمسی.
- Docker Compose Local.
- Audit و RBAC.

## Non-goals MVP
- تشخیص پزشکی یا توصیه درمانی.
- Root Cause قطعی VOC بدون داده عملیاتی.
- Auto-final کردن Ruleهای پزشک که Metadata/Role خارجی می‌خواهند.
- Cloud AI یا API پولی.

## Acceptance
- Ingest تکراری Case جدید نسازد.
- Failure سرویس متن Case جعلی نسازد.
- Critical Rule بدون Evidence Auto-approve نشود.
- VOC Other/Neutral/Mixed وارد Review شود.
- تاریخ شمسی و میلادی به یک بازه DB یکسان نگاشت شوند.
- سه Domain E2E در Docker CI عبور کنند.
- Raw audio در KulePoshti DB ذخیره نشود.

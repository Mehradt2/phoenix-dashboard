# معماری یکپارچه کوله‌پشتی — Local Intelligence v2

## تصمیم معماری
اوگانسون فقط **ASR Provider محلی** است. کوله‌پشتی مالک متن استانداردشده، NLP فارسی، QC، VOC، پرونده، تاریخچه، Rule Pack، Review و Reporting است.

```
Audio
  ↓
Oganson Local ASR
  ↓ canonical transcript contract
KulePoshti Local API
  ├─ Persian Normalizer
  ├─ Medical Entity Extractor
  ├─ Domain Router
  ├─ Physician QC Engine
  ├─ Sampler QC Engine
  ├─ VOC Topic/Sentiment Engine
  ├─ Human Review Gates
  ↓
PostgreSQL 16
  ├─ subjects
  ├─ interactions
  ├─ interaction_reviews
  └─ interaction_audit_events
  ↓
Profiles / History / Reports / CSV Export
```

## اصول
1. Audio بین سرویس‌ها دست‌به‌دست نمی‌شود؛ Oganson متن/metadata را تحویل می‌دهد.
2. Transcript و Analysis حساس در DB با AES-GCM رمز می‌شوند.
3. امتیاز Critical فقط از Evidence و Rule Pack نسخه‌دار تولید می‌شود.
4. هر Rule وابسته به Metadata/Audio که از متن قابل اثبات نیست Fail-closed به Human Review می‌رود.
5. VOC امتیاز پزشک/نمونه‌گیر نیست؛ Topic + Sentiment + Satisfaction + Urgency تولید می‌کند.
6. تاریخ canonical در DB میلادی/timestamptz است؛ API هم فیلتر شمسی و هم میلادی می‌پذیرد.
7. هر ASR دیگری بعداً فقط Adapter جدید می‌خواهد؛ QC Engine Rewrite نمی‌شود.

## سرویس‌ها
- web: رابط QC و گزارش.
- api: Auth/RBAC + Oganson Adapter + Intelligence + Reporting.
- db: PostgreSQL 16.
- oganson: سرویس خارجی/داخلی موجود؛ از طریق `OGANSON_BASE_URL`.
- caddy: HTTPS در شبکه داخلی.

## Failure policy
- Oganson Down: Intake متوقف؛ پرونده‌های قبلی، Review و Reports ادامه دارند.
- Transcript ناکافی: non_scorable.
- Confidence پایین: Human Review Gate.
- Rule metadata unavailable: review_required، نه حدس.
- Duplicate external_id: idempotent ingest.

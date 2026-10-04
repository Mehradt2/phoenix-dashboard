# معماری v2 — Local Server / Text Intelligence

## Context
تمام Runtime روی شبکه داخلی است.

```
Audio
  ↓
Oganson Local ASR
  ↓  signed transcript envelope
KulePoshti API / Ingest Gateway
  ↓
Persian Text Intelligence
  ├─ normalization
  ├─ sentence segmentation
  ├─ medical entities
  ├─ negation / numbers
  └─ evidence extraction
  ↓
Domain Router
  ├─ Physician QC
  ├─ Sampler QC
  └─ VOC Intelligence
  ↓
PostgreSQL 16
  ├─ cases
  ├─ subjects
  ├─ reviews
  ├─ voc_topics
  ├─ processing_events
  └─ audit_events
  ↓
Team UI → Review → Profiles → Reports → Export
```

## سرویس‌ها
- `db`: PostgreSQL.
- `text-intelligence`: Python 3.12 + Hazm + deterministic domain engines.
- `api`: Node 22 / RBAC / encryption / Oganson adapter.
- `web`: React/Nginx.
- `caddy`: TLS برای دامنه داخلی.

## اصل معماری
Oganson Adapter، Text Brain و Domain Scoring جدا هستند. تغییر ASR نباید Rule Engine را بازنویسی کند.

## Envelope Oganson
حداقل:
- externalId
- domain: physician | sampler | voc
- subjectId
- subjectName
- occurredAt
- text

اختیاری:
- durationSeconds
- confidence
- segments
- audioSha256
- metadata / subjectMeta

Auth: header `x-oganson-token`.

## Persian Text Brain
Pipeline:
`Unicode/Arabic normalization → digit normalization → Hazm normalization → segmentation → domain lexicon → entities → rules → evidence`.

Medical lexicon نسخه‌دار است و شامل دارو، بیماری، تست آزمایشگاهی، علائم و Negation می‌شود.

## Fail-closed
- Transcript ناکافی = non-scorable.
- Text Intelligence unavailable = 503؛ Case جعلی ساخته نمی‌شود.
- Physician metadata rules unresolved = review_required.
- VOC Other/Neutral/Mixed = Review.
- AI Generative در MVP مرجع Score نیست.

## Scale
MVP بدون Kafka/Redis اجرا می‌شود؛ PostgreSQL و processing_events برای trace کافی است. اگر نرخ ingest از ظرفیت پردازش بیشتر شد، queue service مستقل اضافه می‌شود بدون تغییر Contract.

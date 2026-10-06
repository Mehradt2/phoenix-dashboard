# قرارداد اتصال Oganson ↔ KulePoshti

## اصل
Oganson مسئول Speech-to-Text است و کوله‌پشتی مسئول Text Intelligence.

## Webhook
`POST /api/v2/integrations/oganson/ingest`

Header:
`x-oganson-token: <shared-secret>`

Canonical payload:
```json
{
  "external_id": "call-123",
  "domain": "physician",
  "subject": {"external_id":"doctor-42","name":"دکتر ..."},
  "customer_external_id": "user-991",
  "transcript": "متن فارسی...",
  "confidence": 0.91,
  "occurred_at": "2026-10-07T10:15:00+03:30",
  "source_name": "call-123.wav",
  "language": "fa",
  "segments": [],
  "metadata": {}
}
```

## Pull fallback
`POST /api/v2/integrations/oganson/pull/:jobId`

Environment:
- OGANSON_BASE_URL
- OGANSON_SHARED_TOKEN
- OGANSON_HEALTH_PATH
- OGANSON_RESULT_PATH

## Idempotency
`source_provider + external_id` unique است. Retry نباید Interaction تکراری بسازد.

## Security
- فقط شبکه داخلی.
- Secret مشترک.
- Raw audio وارد API کوله‌پشتی نمی‌شود.
- Transcript در PostgreSQL رمز می‌شود.

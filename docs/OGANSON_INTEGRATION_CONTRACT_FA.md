# قرارداد اتصال Oganson → KulePoshti

Endpoint:
`POST /api/integrations/oganson/transcripts`

Header:
`x-oganson-token: <shared-secret>`

Example:
```json
{
  "externalId": "call-20261004-0001",
  "domain": "physician",
  "subjectId": "doctor-123",
  "subjectName": "نام پزشک",
  "occurredAt": "2026-10-04T08:00:00+03:30",
  "durationSeconds": 322,
  "confidence": 0.91,
  "text": "متن فارسی...",
  "segments": [],
  "metadata": {},
  "subjectMeta": {}
}
```

Response 201:
- caseId
- domain
- qc
- entities
- processingVersion

Idempotency:
`external_source=oganson + external_id` unique است. Retry Oganson Case را Duplicate نمی‌کند.

Errors:
- 400 invalid payload
- 401 invalid token
- 503 text intelligence unavailable

Security:
- این Endpoint فقط در شبکه داخلی publish شود.
- Secret در Secret Store باشد.
- Transcript در PostgreSQL encrypted-at-rest ذخیره می‌شود.
- Raw audio از Oganson به KulePoshti لازم نیست منتقل شود.

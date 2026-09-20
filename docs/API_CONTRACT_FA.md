# قرارداد API — Team Runtime v1

Base: همان Origin رابط کاربری، Prefix: `/api`

## Health
`GET /api/health`
بدون Auth؛ برای Load balancer/SRE.

## Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

Session در Cookie HttpOnly + SameSite=Strict.

## Cases
- `GET /api/cases`
- `GET /api/cases/hash/:sha256`
- `GET /api/cases/:id`
- `POST /api/cases`
- `DELETE /api/cases/:id` — supervisor/admin، حذف نرم

ورودی Case شامل Audio نیست. فقط Transcript/STT/QC/Metadata.

## Review
`POST /api/cases/:id/reviews`
Role: reviewer/supervisor/admin.

Review note الزامی است.
Critical override باید در UI و Audit دلیل داشته باشد.

## AI Insight
`POST /api/cases/:id/ai-insight`
فقط خروجی Copilot محلی؛ Summary قبل DB رمز می‌شود.

## Audit
`GET /api/audit`
Role: reviewer/supervisor/admin.

## Users
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id`
Role: admin.

## Rule Packs
- `GET /api/rule-packs`
- `POST /api/rule-packs` — supervisor/admin

## Error Contract
JSON:
```json
{"error":"machine_readable_code"}
```

خطای داخلی نباید Stack Trace یا Secret به Client بدهد.

## Compatibility
Frontend از `src/repository.ts` استفاده می‌کند:
- Local runtime → Encrypted IndexedDB
- Team runtime → این API

QC Engine وابسته به Storage backend نیست.

# QA Plan — Local Intelligence v2

## Golden sets
سه Gold Set مستقل:
- Physician
- Sampler
- VOC

هر رکورد:
- transcript raw
- normalized transcript
- domain
- expected rules/topics
- expected sentiment/satisfaction
- critical labels
- annotator A/B
- adjudicated result

## Test layers
1. Unit: normalization, entities, rules, sentiment.
2. Contract: Oganson aliases → canonical payload.
3. DB migration.
4. API ingest/idempotency.
5. Profile/history aggregation.
6. Gregorian/Jalali filters.
7. CSV UTF-8 export.
8. RBAC.
9. Encryption/decryption.
10. Docker integration.

## Production gates
- Critical Recall ≥ 98%.
- Critical false approval = 0.
- Physician/Sampler score agreement with adjudicated reviewer: MAE target ≤ 5 points.
- VOC topic Macro-F1 ≥ 0.85.
- VOC sentiment Macro-F1 ≥ 0.85.
- Jalali/Gregorian date boundary tests PASS.
- Backup → clean restore PASS.

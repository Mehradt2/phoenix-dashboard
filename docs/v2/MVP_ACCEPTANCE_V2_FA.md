# MVP / Acceptance Plan — Local Text Intelligence v2

## P0 — must pass
1. Oganson adapter accepts canonical transcript payload.
2. Duplicate source_call_id/transcript_id is idempotent.
3. Persian normalization is deterministic.
4. Physician, sampler and VOC route independently.
5. Physician/sampler scoring is rule-pack versioned.
6. VOC topic and satisfaction return confidence + evidence.
7. Insufficient evidence → needs_review.
8. Profiles are keyed by trusted subject_id.
9. Full history is queryable by date.
10. Jalali and Gregorian filters resolve to same UTC boundaries.
11. CSV + JSON export.
12. PostgreSQL migration + clean restore.
13. Docker Compose brings all services up on a clean host.
14. No internet required at runtime after model provisioning.
15. Audit event for ingest, score, review, override, export.

## Gold minimum
- Smoke: 20 per domain.
- Pilot: 100 per domain.
- Production promotion: >=300 diverse cases per domain or statistically justified equivalent.
- Double annotation on at least 20% of Gold.
- adjudication on all disagreements affecting critical rules.

## Test classes
Contract, unit, Persian normalization, medical aliases, negation, rule regression, profile history, Jalali/Gregorian boundary, API E2E, database restore, docker clean-host, load/burst.

## Performance MVP
- text-only processing p95 < 2s/call on internal CPU target excluding model cold-start.
- 100-transcript batch accepted without loss.
- no score loss on service restart.

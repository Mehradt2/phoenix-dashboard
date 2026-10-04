# Test & QC Plan v2

## Unit
- Persian normalization.
- Medical entities.
- Sampler rules.
- Physician review-required behavior.
- VOC topic/satisfaction.
- Jalali/Gregorian conversion.

## Integration
1. PostgreSQL migrate.
2. Text service health.
3. Oganson physician ingest.
4. Oganson sampler ingest.
5. Oganson VOC ingest.
6. dedup.
7. login/RBAC.
8. profile query.
9. date filter Gregorian.
10. date filter Jalali.
11. CSV export.

## UAT فارسی
Corpus باید شامل:
- محاوره و نیم‌فاصله/ی عربی/ک عربی.
- اسم دارو و دوز.
- بیماری و Negation.
- تست‌های آزمایشگاهی.
- رضایت، نارضایتی، Mixed.
- Topic چندگانه.
- جمله‌های مبهم.
- تماس بسیار کوتاه/Transcript ناقص.

## Release Gate
Release زمانی قابل Pilot است که CI سبز باشد و Gold فارسی توسط دو Annotator + adjudication بررسی شود.

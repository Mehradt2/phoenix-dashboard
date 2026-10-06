# Benchmark و Model Strategy — فارسی پزشکی/عملیاتی

## نتیجه طراحی
برای امتیازدهی QC از **Hybrid Evidence-first** استفاده می‌کنیم، نه LLM-only:
1. Normalization فارسی
2. Lexicon/Regex deterministic
3. Domain Rule Engine
4. Optional local classifier/embedding for ambiguous text
5. Human Review for critical/low-confidence

## Baselineهای بررسی‌شده
- Hazm: normalization/tokenization/lemmatization فارسی؛ مناسب preprocessing محلی.
- ParsBERT: مدل monolingual فارسی با derivativeهای sentiment/classification/NER؛ Candidate مرحله دوم.
- multilingual-e5-small: MIT، 94 زبان؛ Candidate برای semantic matching و clustering.
- Qwen2.5-0.5B-Instruct: local advisory copilot؛ حق تغییر score ندارد.

## چرا MVP بدون Transformer اجباری شروع می‌شود؟
- Rules پزشک/نمونه‌گیر contractual هستند.
- Latency و dependency کمتر.
- Explainability کامل.
- Gold Dataset هنوز برای fine-tune حوزه پزشکی/عملیاتی کافی نیست.
- بعد از ساخت Gold می‌توان ParsBERT/E5 را به‌عنوان assistive layer Benchmark کرد.

## Model Promotion Gate
هیچ مدل local classifier/LLM به Production scoring وارد نمی‌شود مگر:
- dataset دوبل annotation؛
- adjudication؛
- macro-F1/critical recall threshold؛
- no-regression مقابل deterministic baseline؛
- reproducible model manifest + SHA256.

# Benchmark — Persian Medical Text Processing v2

## هدف
دقت روی فارسی محاوره‌ای، کلمات پزشکی/دارویی، عدد/دوز، Negation، Topic و Satisfaction؛ بدون API پولی.

## Candidate A — Hazm + Lexicon + Deterministic Rules
نقش: baseline و مرجع قابل ممیزی.
مزیت: سریع، explainable، آفلاین، بدون GPU.
ضعف: paraphrase پیچیده و ambiguity.

Hazm برای normalization/tokenization فارسی انتخاب شده و در Image روی 0.12.1 pin می‌شود.

## Candidate B — Persian encoder classifier
ParsBERT/XLM-R فقط بعد از corpus برچسب‌خورده برای Topic/Sentiment/NER benchmark می‌شوند.
کاربرد مناسب: classifierهای ثابت و کم‌هزینه.
ریسک: بدون Fine-tune روی مکالمات واقعی QC نباید Production claim شود.

## Candidate C — Qwen3-4B Local
کاربرد: extraction مبهم و adjudication کمکی.
مزیت: Apache-2.0، multilingual، قابل اجرا در شبکه داخلی.
نقش پیشنهادی: Candidate محلی بعد از Baseline؛ **نه scorer نهایی**.

## Candidate D — Qwen3-8B Local
Candidate کیفیت بالاتر روی سرور قوی‌تر. فقط اگر uplift روی Gold فارسی نسبت به 4B و Rule baseline معنی‌دار باشد.

## انتخاب MVP
**Hazm + versioned medical lexicon + deterministic evidence rules**.
LLM در Critical Path MVP نیست.

## Gold Dataset
سه مجموعه مستقل:
- Physician
- Sampler
- VOC

هر رکورد: transcript raw، normalized، domain، entities، expected rules/topics، satisfaction، evidence spans، adjudication.

## Gateهای پیشنهادی
Pilot:
- Critical rule recall >= 98%
- Medication/test/disease entity recall >= 95%
- Negation accuracy >= 99%
- VOC dissatisfaction recall >= 95%
- VOC Topic macro-F1 >= 0.90
- Evidence hallucination = 0 برای rules deterministic

این مقادیر Target پذیرش‌اند، نه نتیجه Benchmark فعلی.

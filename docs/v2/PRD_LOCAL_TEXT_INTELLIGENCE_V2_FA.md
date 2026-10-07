# PRD — KulePoshti Local Text Intelligence v2
Status: MVP implementation baseline
Target runtime: Local / On-prem / Docker
Language: Persian-first

## Problem
Oganson converts audio to transcript. KulePoshti must turn that transcript into evidence-backed operational records for:
1. Physician QC
2. Sampler QC
3. VOC / user voice

The system must be deterministic where a business rule exists, use local NLP/AI only as an assistive layer, preserve complete history, and be deployable on internal infrastructure without paid API dependencies.

## Product outcomes
- One physician profile with time-series QC history, rule findings, critical failures, medical entities and review history.
- One sampler profile with conversation score, workflow score, final score, operational violations and coaching history.
- One user/VOC history with topic, subtopic, sentiment/satisfaction, complaint reason, resolution state and repeated-contact history.
- Jalali and Gregorian date filters and export.
- All raw transcripts and derived records auditable and versioned.
- Oganson transport replaceable through an adapter.

## Core principles
- Evidence-first: every scored rule must point to transcript evidence.
- Fail-closed: insufficient evidence produces review, not invented pass/fail.
- Rule-first, model-assisted: deterministic rule packs define scores; NLP/LLM assists extraction/classification.
- Persian/medical aware: normalization, informal Persian, numbers, drug/disease/symptom vocabulary.
- Local-only by default.
- Reproducible with Docker Compose.
- No paid API in critical path.

## Personas
QC Operator, QC Reviewer, Supervisor, Product/Operations Manager, Infrastructure Engineer, Data Analyst.

## MVP scope
### Common ingestion
Oganson transcript webhook/poll adapter; idempotency key; transcript version; source call id; domain; speaker labels if available; timestamps.

### Physician
Rule-pack scoring, critical gates, medical entity extraction, review queue, physician profile, date history, exports.

### Sampler
Conversation rule pack + workflow evidence + 70/30 score when evidence complete, retry/cancellation guard, sampler profile/history/export.

### VOC
Topic taxonomy, sentiment: satisfied / neutral / dissatisfied / unknown, complaint severity, resolution signal, repeat-topic history, user profile, exports.

### Out of scope for MVP
Automatic medical diagnosis, treatment recommendation, autonomous final QC approval, cross-domain identity matching without a trusted ID source.

## Success metrics
- >=98% critical-rule recall on adjudicated Gold.
- >=95% medical entity recall for the approved entity set.
- >=99% negation accuracy on critical phrases.
- VOC topic macro-F1 >=0.90 on approved internal Gold before autonomous routing.
- Sentiment/satisfaction macro-F1 >=0.90 before automatic use in reports.
- 0 fabricated evidence.
- 100% scored rules include evidence reference.
- 100% record changes produce audit event.

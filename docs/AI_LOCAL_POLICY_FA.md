# سیاست AI محلی و بدون هزینه

## Approved runtime classes
### ASR
- Standard: onnx-community/whisper-small
- High Quality Candidate: onnx-community/whisper-large-v3-turbo
- No API token / paid inference dependency.

### Text Copilot
- Browser candidate: onnx-community/Qwen2.5-0.5B-Instruct
- Purpose: summary, risk hints, coaching suggestions.
- It is advisory and cannot alter deterministic QC score.

## Fail-closed principles
- If model load fails, the user keeps deterministic QC/manual review.
- If transcript is insufficient, score becomes null.
- If evidence is absent, AI cannot invent it.
- Medical/operational signals are grounded to transcript evidence.
- Tone and decision signals remain isolated from QC score unless a future approved rule explicitly changes governance.

## Promotion criteria
A model becomes approved only after domain Gold evidence. Speed alone cannot promote a model.

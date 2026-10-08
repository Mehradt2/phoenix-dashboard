# Benchmark و انتخاب مدل فارسی پزشکی

تصمیم معماری: Hybrid pipeline شامل Normalization deterministic، Lexicon/Pattern، Evidence Guard، مدل فارسی در صورت فعال بودن، Rule Engine و Human Review برای Low-confidence.

Candidateها: ParsBERT به‌عنوان مدل عمومی فارسی و SINA-BERT به‌عنوان Candidate تخصصی پزشکی فارسی. مدل‌های multilingual فقط Baseline مقایسه‌ای هستند.

Gold: دو Annotation مستقل، adjudication و سنجش Intent F1، Topic F1، Satisfaction Macro-F1، Medical Entity F1، Negation Accuracy، Medication/Dose Accuracy، Vitamin-D Agreement Precision/Recall، Evidence Grounding Precision و همبستگی Score با Reviewer.

هیچ نتیجه Benchmark واقعی بدون اجرای Gold Dataset اعلام نمی‌شود.

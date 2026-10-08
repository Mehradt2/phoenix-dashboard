# معماری یکپارچه v2.5

Ogason → Ingress/Idempotency → Transcript Integrity → Persian Normalizer → Role/Entity Extraction → Evidence Guard → Medical/VOC/Tone → Versioned Rule Engine → PostgreSQL → Profile/History/Reporting/Review/Export

اصل: AI یک لایه کمکی است؛ تصمیم امتیازدهی قابل توضیح باید از Rule Pack و Evidence عبور کند.

مدل هوش: Candidate پایه ParsBERT برای Persian NLP؛ SINA-BERT به‌عنوان Candidate پژوهشی/Benchmark پزشکی. هیچ مدل عمومی به‌تنهایی Gold Production نیست.

استقرار: Docker Compose برای MVP؛ PostgreSQL؛ UI و API مستقل؛ Ogason از طریق Adapter.

Recovery: Backup شامل DB، Rule Packs، Model Manifest، Config و Documentation است؛ Raw Audio طبق Policy فعلی دائمی ذخیره نمی‌شود.

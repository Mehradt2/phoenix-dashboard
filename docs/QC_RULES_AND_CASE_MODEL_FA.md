# مدل اجرایی QC، شروط و پرونده افراد — v1.2.0

## فلو اجباری
`Upload → SHA256 → ASR → Transcript → Domain QC → Persist → Review Queue → Human Evidence → Profile → Reports → Audit`

Release فقط زمانی PASS است که این زنجیره برای **هر دو حوزه پزشک و نمونه‌گیر** E2E اجرا شود. نمایش پیام «Batch پردازش شد» بدون Case واقعاً ذخیره‌شده ممنوع است.

## نمونه‌گیر
### Conversation Rule Pack
نسخه: `sampler-conversation-qc-1.1.0`

C01 شروع حرفه‌ای و معرفی — 8  
C02 تأیید مخاطب/هویت — 9  
C03 روز و بازه مراجعه — 15 — **Critical**  
C04 آدرس و جزئیات دسترسی — 15 — **Critical**  
C05 ETA/تماس قبل رسیدن — 10  
C06 آمادگی و ناشتایی — 20 — **Critical**  
C07 فرصت سؤال — 8  
C08 جمع‌بندی و تأیید نهایی — 8  
C09 لحن حرفه‌ای — 7

### Workflow
Conversation و Workflow جدا هستند. Final فقط وقتی هر دو معتبر باشند:
`Final = 0.70 × Conversation + 0.30 × Workflow`

عدم پاسخ نیازمند Evidence مستقل تلاش‌ها، فاصله ۲۰ دقیقه، Retry صبح و وضعیت نهایی است. Transcript حق جعل Workflow ندارد.

### پرونده نمونه‌گیر
- تعداد تماس‌ها
- تعداد Scored / Non-scorable
- Average
- Review Open
- Critical Count/Rate
- Failure Pareto
- Rule Compliance
- تاریخچه تماس Drill-down
- KPIهای بیرونی مثل CSAT/تحویل/کنسلی فقط بعد از اتصال Data Source واقعی

## پزشک
### Controlled PVQ
نسخه: `physician-qc-2.0.0`  
Catalog: `DOC-009 / PVQ-026..040`

PVQ-026 No Answer = Non-scorable  
PVQ-027 احراز بیمار  
PVQ-028 ولی معتبر کودک  
PVQ-029 همراه فاقد اختیار برای بالغ = Critical  
PVQ-030 Brand Match  
PVQ-031 Duplicate Contact  
PVQ-032 Reschedule Boundary  
PVQ-033 Cancellation Boundary  
PVQ-034 Medication + Dose  
PVQ-035 Structured History + Preparation  
PVQ-036 Audio Intelligibility  
PVQ-037 Communication Energy  
PVQ-038 Unsupported Medical Certainty  
PVQ-039 Speaker Role Resolution Gate  
PVQ-040 Low Confidence Review Gate

### Signals جدا از Score
- Vitamin D decision intelligence
- Tone / empathy / clarity
- Duration signal
این Signalها بدون Rule مصوب حق تغییر مستقیم Score را ندارند.

### پرونده پزشک
- Scored vs Non-scorable
- Avg QC
- Review Rate
- Critical Calls
- Rule Compliance
- Short-call signals
- Failure Pareto
- Call history
- PVQ evidence per call

## ASR
سه سطح:
- Auto: روی WebGPU = Small؛ بدون WebGPU = Tiny برای پایداری
- Standard: Small
- High Quality Candidate: Large-v3-Turbo در سخت‌افزار مناسب
- Fallback نهایی: Tiny
- API پولی: صفر
- اگر ASR شکست بخورد، Case موفق جعلی ساخته نمی‌شود؛ Manual Transcript مسیر رسمی Recovery است.

## Acceptance
CI باید حداقل این‌ها را Pass کند:
1. Unit tests نمونه‌گیر.
2. Unit tests PVQ پزشک.
3. Build/TypeScript.
4. Browser E2E.
5. ساخت Case نمونه‌گیر از فایل → Review → Evidence → Profile.
6. ساخت Case پزشک از فایل → Review → PVQ Evidence → Profile.
7. Responsive smoke.
8. Docs + Docker recovery bundle.

# عملیات QC نمونه‌گیران — Master List، تاریخ و Batch واقعی

تاریخ: ۲۰۲۶-۰۹-۲۱  
وضعیت: Operational Control Document

## هدف
هر فایل مکالمه نمونه‌گیر باید قبل از QC به یک نمونه‌گیر فعال و یک تاریخ مکالمه مشخص متصل شود. نام فایل صوتی منبع هویت یا تاریخ نیست؛ فایل‌های Hash-based باید در زمان Ingest توسط اپراتور به Master List و تاریخ صحیح متصل شوند.

## Master List
فهرست پایه شامل ۳۰ نمونه‌گیر فعال تهران است و در `src/samplerRegistry.ts` نسخه‌دار شده است. در Team Runtime همین فهرست در جدول `samplers` PostgreSQL Seed می‌شود. افزودن نمونه‌گیر جدید از UI مجاز است و در Browser Local روی دستگاه و در Team Runtime به‌صورت مشترک در DB ذخیره می‌شود.

## مدل ثبت هر Case نمونه‌گیر
فیلدهای اجباری/کنترلی:
- `personName`: نام نمونه‌گیر از Master List فعال.
- `occurredAt`: تاریخ واقعی مکالمه با فرمت ISO Date.
- `personMeta.grade`: گرید در زمان ثبت.
- `personMeta.city`: شهر در زمان ثبت.
- `sourceName`: نام فایل صوتی.
- `audioSha256`: Hash برای جلوگیری از پردازش تکراری.
- Transcript، STT metadata، QC Evidence، Review و Audit.

اگر نام نمونه‌گیر در Master List فعال نباشد، Case نمونه‌گیر ذخیره نمی‌شود و اپراتور باید ابتدا فرد را اضافه کند.

## گزارش
گزارش نمونه‌گیران باید در سطح زیر قابل فیلتر و Export باشد:
- تاریخ دقیق
- روز هفته
- ماه شمسی
- نام نمونه‌گیر
- گرید
- شهر
- فایل
- Conversation Score
- Workflow Score
- Final Score
- Risk
- Review Status

CSV خروجی UTF-8 BOM دارد تا فارسی در Excel/Google Sheets به‌درستی باز شود.

## Batch نمونه صوتی واقعی دریافت‌شده در ۲۰۲۶-۰۹-۲۱
۸ فایل WAV بررسی فنی شدند؛ ۷ فایل یکتا هستند. دو فایل زیر Byte-identical هستند و باید توسط Duplicate Guard فقط یک بار وارد QC شوند:
- `e92b3076adc8d63b2b597042f1773dc550974a559781c1dea9a3e454.wav`
- `e92b3076adc8d63b2b597042f1773dc550974a559781c1dea9a3e454 (1).wav`

ویژگی فنی Batch:
- همه فایل‌ها: WAV، Mono، 8 kHz (کیفیت تلفنی)
- Duration فایل‌های یکتا: 68.20، 51.86، 51.26، 76.52، 86.94، 30.00 و 79.84 ثانیه
- Clipping قابل‌توجه در نمونه‌ها مشاهده نشد.
- فایل ۳۰ ثانیه‌ای `f521bb09279c5d7d96c1c763f16eed86dd8e685280aba6e0ada7db80.wav` حدود ۸۱٪ فریم کم‌انرژی دارد؛ Transcript/Score آن باید با Human Review کنترل شود و نباید صرفاً بر مبنای طول فایل معتبر فرض شود.

نام‌های Hash-based این فایل‌ها اطلاعات قابل اتکایی درباره نام نمونه‌گیر یا تاریخ تماس ندارند؛ بنابراین اتصال Name/Date باید در UI انجام شود و از روی filename حدس زده نشود.

## Acceptance Gate
Release نمونه‌گیر فقط وقتی قابل تأیید است که:
1. Master List سی نفره در UI نمایش داده شود.
2. افزودن دستی یک نمونه‌گیر جدید کار کند.
3. Batch بتواند برای هر فایل Name و Date جداگانه بگیرد.
4. فایل خارج از Master List ذخیره نشود.
5. Duplicate SHA-256 رد شود.
6. WAV واقعی از Decode → Whisper → Transcript → QC → Review Evidence → Profile عبور کند.
7. گزارش نام/تاریخ/روز/ماه و CSV فیلترشده تولید شود.
8. Team DB migration و API سامپلرها PASS شود.

## CI Probe
Validation روی Pull Request draft اجرا می‌شود تا Log و Stepهای Build/Test/Whisper قبل از Release قابل مشاهده باشند.

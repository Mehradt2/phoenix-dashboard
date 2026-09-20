# سیاست Whisper مرورگری — KulePoshti

## اصل غیرقابل‌تغییر
Runtime مرورگری نباید برای ASR به API پولی، Token خصوصی یا اشتراک inference وابسته شود.

## پروفایل‌ها
- Standard: whisper-small، مدل پیش‌فرض عملیات.
- High Quality Candidate: whisper-large-v3-turbo، فقط با WebGPU و Hardware Guard.
- Auto: عمداً Standard را انتخاب می‌کند تا Batchهای طولانی و ۱۰۰ فایل باعث فشار غیرقابل‌کنترل RAM/GPU نشوند.

## محدودیت‌های Browser
1. اولین اجرا باید وزن مدل را از Hub عمومی دانلود کند.
2. Cache مرورگر می‌تواند توسط Browser/OS پاک شود.
3. WebGPU به GPU/Driver/Browser وابسته است؛ WASM fallback کندتر است.
4. Turbo دانلود و حافظه بسیار بیشتری می‌خواهد و برای همه سیستم‌ها مناسب نیست.
5. Browser runtime جایگزین Windows Offline Pack برای محیط بدون اینترنت نیست.

## Production Gate
هیچ مدل فقط با RTF بهتر انتخاب نمی‌شود. برنده باید روی Gold فارسی:
- WER
- Critical Term Recall
- Medical/operational terminology
- Numbers
- Negation
- Silence Hallucination
- RTF
را پاس کند.

Smoke Gate حداقل ۲۰ Case و Production Gate حداقل ۵۰ Case یکتای adjudicated دارد.

## داده
Raw audio برای inference در همان دستگاه می‌ماند. Transcript/QC فقط داخل Vault رمزگذاری‌شده همان Browser ذخیره می‌شوند.

## مالکیت
Engineering metadata: mehradtorabi1

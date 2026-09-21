# معماری AI آفلاین کوله‌پشتی — 2026-09-21

## هدف
کوله‌پشتی باید بتواند بدون API پولی و در حالت Bundled Offline، صوت فارسی را روی همان دستگاه به متن تبدیل کند و یک Copilot محلی برای خلاصه، Evidence و Coaching اجرا کند. هیچ‌کدام از مدل‌های AI اجازه تغییر امتیاز QC، Critical Rule یا تصمیم Human Review را ندارند.

## دو لایه AI
### 1. ASR محلی
- Auto روی دستگاه دارای WebGPU: Whisper Small با `encoder_model=fp32` و `decoder_model_merged=q4`.
- Auto بدون WebGPU: Whisper Tiny با `q8` روی WASM.
- High Quality: Large v3 Turbo فقط پس از Hardware Guard و Gold فارسی؛ Candidate باقی می‌ماند.
- Fallback همیشه Fail-closed و قابل مشاهده در Evidence است.

### 2. Local Copilot
- مدل پایه: `onnx-community/Qwen2.5-0.5B-Instruct`.
- وظیفه: Summary، Risk note، Evidence قابل مشاهده، Coaching و علامت‌گذاری موارد نیازمند بررسی انسانی.
- در Bundled Offline از `q4` استفاده می‌شود تا یک Model Pack روی WebGPU و WASM قابل حمل باشد.
- خروجی Copilot Advisory-only است و Score isolation در کد حفظ می‌شود.

## Model Source Policy
### auto
مدل در اولین استفاده از Hub دریافت و در Browser Cache نگه‌داری می‌شود. Inference روی دستگاه انجام می‌شود، اما Bootstrap اولیه به اینترنت نیاز دارد.

### bundled
`allowRemoteModels=false` و `allowLocalModels=true` است. مدل‌ها فقط از `modelBase` محلی خوانده می‌شوند. نبودن فایل مدل باعث خطای صریح می‌شود و هیچ Remote fallback انجام نمی‌شود.

## Model Pack
Specification: `offline/model-pack.json`

پروفایل Portable:
- Whisper Tiny برای مسیر سازگاری.
- Qwen2.5-0.5B-Instruct q4 برای Copilot.
- Variantهای لازم Whisper برای WebGPU mixed precision و WASM q8.

پروفایل Standard:
- Portable +
- Whisper Small برای ASR اصلی.

ساخت Pack:
```
pip install "huggingface_hub>=0.34,<1"
python scripts/build_offline_model_pack.py --profile portable
node scripts/verify-offline-model-pack.mjs offline-models portable
```

Builder در پایان `model-pack.lock.json` می‌سازد و SHA-256 و Revision واقعی هر فایل/مدل را ثبت می‌کند.

## Windows Offline
مسیر Desktop:
`React/Vite → Tauri 2 → WebView2 → Transformers.js/ONNX Runtime → Local Models`

Build:
```
npm install
python scripts/build_offline_model_pack.py --profile portable
npm run desktop:build
```

`scripts/build-desktop.mjs` قبل از Tauri build:
1. Model Pack را Verify می‌کند.
2. UI را با Base نسبی می‌سازد.
3. مدل‌ها را داخل `dist/models` Stage می‌کند.
4. Runtime را روی `modelSource=bundled` قفل می‌کند.
5. `OFFLINE_BUILD.txt` را برای Audit تولید می‌کند.

خروجی Windows هدف: NSIS installer.

## Docker Offline
```
docker compose -f docker-compose.yml -f docker-compose.local.yml -f docker-compose.offline.yml up -d
```
مدل‌ها از پوشه `./offline-models` فقط به‌صورت Read-only در Nginx mount می‌شوند و Browser از همان Host داخلی آن‌ها را دریافت می‌کند.

## Acceptance Gates
- هیچ Request مدل به اینترنت در Bundled Mode.
- Audio Cloud Transport = 0.
- ASR: WAV → Transcript → QC → Review Evidence.
- Copilot: Transcript → Local generation → advisory insight.
- Missing Model Pack = explicit failure، نه Remote fallback.
- Portable Pack روی دستگاه بدون WebGPU نیز کار کند.
- Windows build واقعاً روی Windows Runner تولید شود.
- Gold فارسی و Real Audio قبل از Production Sign-off پاس شوند.

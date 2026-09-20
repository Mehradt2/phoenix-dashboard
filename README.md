# KulePoshti Operational Web

نسخه بدون نصب و Browser-local کوله‌پشتی برای QC مکالمات فارسی.

## Current public runtime
https://mehradt2.github.io/phoenix-dashboard/

## Runtime architecture
Browser → Audio decode/resample → Silence Guard → Whisper (WebGPU/WASM) → deterministic QC → encrypted IndexedDB Vault → Human Review → Profile / Report / CSV.

- Raw audio cloud transport: **false**
- Paid ASR API: **false**
- API token required for Whisper inference: **false**
- Shared backend/database: **none in this runtime**
- Batch intake: **up to 100 files**, processed sequentially to protect browser memory.
- Supported operational focus in this baseline: **Sampler QC**.

## Whisper policy
### Standard / Auto
`onnx-community/whisper-small`

Auto intentionally selects Small for operational stability.

### High Quality candidate
`onnx-community/whisper-large-v3-turbo`

Turbo is manual-only and requires WebGPU + hardware/storage guards. It remains a **candidate**, not a production winner, until Persian Gold benchmarking passes.

### Safety gate
Gold benchmark tracks WER, critical-term recall, number recall, negation recall, silence hallucination and RTF.
- Smoke evidence: >=20 adjudicated unique cases.
- Production evidence: >=50 adjudicated unique cases.
- Medical safety metrics take priority over speed.

## Privacy
Each browser creates a local encrypted Vault:
- PBKDF2-SHA256 key derivation
- AES-GCM case encryption
- Passphrase never leaves browser
- Raw audio is not persisted by the app
- Encrypted backup/restore is available

This is not a shared-team database. Central online synchronization remains a separate future runtime.

## Release
Source branch: `kuleposhti-operational-web-v1`
Publishing branch: `main`

Every source push runs:
`npm install → npm run check → npm run build → publish immutable dist → GitHub Pages`.

The release workflow writes `RELEASE.txt` with source SHA and privacy/runtime flags.

## Product / Engineering metadata
Contribution signature: `mehradtorabi1`

This metadata must never affect patient data, QC logic, scoring, model output or clinical interpretation.

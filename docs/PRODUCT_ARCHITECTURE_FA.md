# معماری محصول کوله‌پشتی — Operational Web / Offline-Compatible

## اصل معماری
UI، QC Domain Logic، AI Runtime و Storage نباید به هم قفل شوند.

```
Presentation
  ├─ Domain Switch: Physician / Sampler
  ├─ Command Center / Review / Profiles / Reports
  ↓
Application Services
  ├─ Ingest & Batch
  ├─ Review Workflow
  ├─ Reporting
  ├─ Model Calibration
  ↓
Domain
  ├─ physicianQcEngine
  ├─ sampler qcEngine
  ├─ evidence / critical gates
  ├─ tone & decision signals (score-isolated)
  ↓
AI Runtime
  ├─ Whisper Browser Local
  └─ Qwen Local Copilot (advisory only)
  ↓
Repository Contract
  ├─ Local encrypted IndexedDB Vault (current web runtime)
  └─ Future Central / Windows adapters
```

## Current production-like web runtime
- Static GitHub Pages shell.
- No paid AI API.
- Raw audio never leaves browser.
- Transcript/cases encrypted in local Vault.
- Append-only encrypted Audit store.
- Multi-domain case model.
- Batch max 100, bounded sequential STT.
- Human Review remains mandatory for candidate auto-scoring.

## Backend contract boundary
The local Vault is currently the active repository. Central multi-user storage is deliberately not simulated. A future adapter may implement the same operations against PostgreSQL/SQLite without changing QC domain rules:
- cases.list/get/put/delete
- hash.exists
- review.submit
- audit.append/list
- backup.export/import
- aiInsight.save

## Offline target
Windows/Tauri remains a separate runtime target:
React UI → Rust/Tauri services → SQLite WAL → whisper.cpp → Rule Engine → Audit/Profiles/Reports.

## Security invariants
1. Audio cloud transport = false.
2. Paid AI dependency = false.
3. Copilot cannot mutate QC score.
4. Critical findings block normal approval.
5. Overrides require human note and audit.
6. No synthetic business data in management reports.
7. No claimed Production PASS without real Gold/Windows evidence.

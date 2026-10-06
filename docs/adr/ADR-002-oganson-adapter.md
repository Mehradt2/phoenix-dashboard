# ADR-002 — Oganson decoupled local STT integration

Decision: Treat Oganson as an external local STT provider behind an adapter.

Why:
- protects QC business logic from STT schema changes;
- supports future Whisper/other engines;
- permits replaying historical transcripts;
- makes text brain independently testable.

Consequence:
No QC module may call Oganson directly. All inputs must pass the canonical transcript contract.

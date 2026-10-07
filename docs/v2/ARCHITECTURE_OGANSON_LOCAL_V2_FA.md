# معماری یکپارچه KulePoshti v2 — Oganson → Text Brain → Profiles

## Big picture
```
Oganson Local STT
   ↓
Oganson Adapter / Ingestion API
   ↓
Transcript Canonicalizer
   ├─ Persian normalization
   ├─ number/unit normalization
   ├─ colloquial variants
   ├─ speaker/timestamp preservation
   └─ transcript integrity checks
   ↓
Text Intelligence Pipeline
   ├─ Medical entity extraction
   ├─ negation/context detection
   ├─ intent/topic classification
   ├─ sentiment/satisfaction
   └─ evidence span indexing
   ↓
Domain Router
   ├─ Physician QC Engine
   ├─ Sampler QC Engine
   └─ VOC Engine
   ↓
Human Review / Overrides
   ↓
Profiles + History + Reports
   ↓
PostgreSQL + Audit
```

## Service boundaries
### 1. oganson-adapter
Protocol-isolation layer. No scoring logic.
Supports:
- webhook POST
- polling client
- batch import JSON
- health/capabilities handshake

Canonical contract:
```json
{
  "source":"oganson",
  "source_call_id":"...",
  "transcript_id":"...",
  "domain":"physician|sampler|voc",
  "subject_id":"trusted-internal-id",
  "subject_name":"display only",
  "language":"fa",
  "text":"...",
  "segments":[{"speaker":"A","start_ms":0,"end_ms":4200,"text":"..."}],
  "created_at":"ISO-8601",
  "stt":{"model":"...","confidence":0.91}
}
```

If Oganson's real schema differs, only this adapter changes.

### 2. text-brain
Pure text intelligence; no UI.
Responsibilities:
- Persian normalization.
- entity spans.
- negation/context.
- topic/sentiment.
- domain evidence features.
Returns machine-readable evidence, never a UI string only.

### 3. qc-engine
Authoritative scoring.
- Versioned rule packs.
- deterministic rules.
- critical gates.
- score status = scorable / non_scorable / needs_review.
AI output cannot mutate score directly.

### 4. profile-service
Maintains physician, sampler and VOC/user longitudinal record.
Identity uses trusted internal subject_id; name alone is never a key.

### 5. reporting
Date range: Gregorian and Jalali input; storage always UTC ISO timestamps.
Exports: CSV/JSON initially; PDF later.

## Storage
PostgreSQL 16.
Core tables:
transcripts, transcript_segments, text_entities, qc_cases, qc_findings, qc_reviews, physician_profiles, sampler_profiles, voc_interactions, voc_topics, audit_events, rule_packs, model_registry.

## Local deployment
Caddy/Nginx → Web → API → PostgreSQL
                     ↘ text-brain
                     ↘ oganson-adapter

Internal network only by default. External internet is not required after images/models are provisioned.

## Security
- RBAC.
- append-only audit.
- transcript encryption at rest.
- secrets via env/secret store.
- DB port not public.
- no public AI fallback.
- model manifests + SHA256.

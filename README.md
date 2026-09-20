# KulePoshti — Persian QC Operations OS

کوله‌پشتی یک سیستم Local-first / Team-ready برای کنترل کیفیت مکالمات فارسی پزشکان و نمونه‌گیران است.

## Quick access
### Operational Browser Runtime
https://mehradt2.github.io/phoenix-dashboard/

- بدون نصب
- Whisper و AI داخل مرورگر
- Audio خام از دستگاه خارج نمی‌شود
- Vault رمزگذاری‌شده Browser-local
- مناسب شروع فوری اپراتورهای QC
- داده این Runtime بین Browserها مشترک نیست

### Shared Team Runtime
Docker stack:
`React/Nginx → Node API → PostgreSQL 16` با Caddy TLS.

- Login + RBAC
- Team shared cases/reviews/reports
- AES-256-GCM transcript encryption
- append-only audit
- versioned rule packs
- provider-independent
- raw audio never sent to API

Start here: [docs/00_INDEX_FA.md](docs/00_INDEX_FA.md)

## Domains
- Physician QC
- Sampler QC

هسته مشترک:
`Local ASR → Transcript → Evidence → Versioned Rules → Human Review → Audit → Profiles/Reports`

## Zero-cost AI policy
- Whisper Small: operational baseline
- Whisper Large-v3-Turbo: quality candidate until Persian Gold approval
- Qwen2.5-0.5B-Instruct: local advisory Copilot
- no OpenAI API / paid inference / HF inference token in critical path
- AI Copilot cannot mutate deterministic QC score

## Docker Team Mode
```bash
cp .env.example .env
sh ops/generate-secrets.sh
# place generated values in .env
docker compose build
docker compose up -d db
docker compose run --rm migrate
docker compose up -d
sh ops/smoke.sh
```

Detailed runbook: [docs/DOCKER_TEAM_RUNBOOK_FA.md](docs/DOCKER_TEAM_RUNBOOK_FA.md)

## Documentation / Knowledge Base
Documentation is a Release Gate. Required recovery knowledge:
- Architecture
- Docker/Domain
- Database/API
- Security/Privacy
- Backup/Restore
- Observability/SRE
- Agile/Release governance
- AI/Whisper policy
- Reporting benchmark
- ADRs

Index: [docs/00_INDEX_FA.md](docs/00_INDEX_FA.md)

## CI/CD
### Operational Web
`.github/workflows/kuleposhti-pages.yml`
- contract check
- unit tests
- TypeScript/Vite build
- browser E2E
- mobile smoke
- immutable public release
- public URL smoke

### Team Docker
`.github/workflows/kuleposhti-docker.yml`
- frontend tests/build
- API tests
- compose validation
- PostgreSQL migration
- Team stack integration
- login/RBAC smoke
- Team runtime config smoke
- GHCR web/api image publish

## Privacy invariants
1. Audio cloud transport = false.
2. Paid ASR dependency = false.
3. Evidence is required for QC pass.
4. Critical findings block normal approval.
5. Human override requires evidence/note/audit.
6. AI does not silently change QC score.
7. Audit is append-only.
8. Database schema changes require migrations.
9. Release without updated docs/recovery knowledge is not Done.

## Source of truth
- source branch: `kuleposhti-operational-web-v1`
- static release branch: `main`
- DB migrations: `server/migrations`
- Docker: `docker-compose.yml`
- API: `server/src`
- KB manifest: `knowledge/PROJECT_KNOWLEDGE.json`

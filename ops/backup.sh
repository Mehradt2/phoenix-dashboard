#!/usr/bin/env sh
set -eu
mkdir -p backups
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="backups/kuleposhti_${STAMP}.dump"
docker compose exec -T db pg_dump -U "${POSTGRES_USER:-kuleposhti}" -d "${POSTGRES_DB:-kuleposhti}" -Fc > "$OUT"
sha256sum "$OUT" > "$OUT.sha256"
echo "Backup: $OUT"

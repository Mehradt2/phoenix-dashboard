#!/usr/bin/env sh
set -eu
mkdir -p backups
stamp=$(date +%Y%m%d_%H%M%S)
docker compose exec -T db pg_dump -U qc -d qc > "backups/qc_${stamp}.sql"
tar -czf "backups/kuleposhti_${stamp}.tar.gz" docs models "backups/qc_${stamp}.sql"
sha256sum "backups/kuleposhti_${stamp}.tar.gz" > "backups/kuleposhti_${stamp}.sha256"
echo "backup ready"

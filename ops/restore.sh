#!/usr/bin/env sh
set -eu
FILE="${1:?usage: ops/restore.sh backups/file.dump}"
test -f "$FILE"
echo "Restore target: ${POSTGRES_DB:-kuleposhti}"
docker compose stop api web
docker compose exec -T db dropdb -U "${POSTGRES_USER:-kuleposhti}" --if-exists "${POSTGRES_DB:-kuleposhti}"
docker compose exec -T db createdb -U "${POSTGRES_USER:-kuleposhti}" "${POSTGRES_DB:-kuleposhti}"
cat "$FILE" | docker compose exec -T db pg_restore -U "${POSTGRES_USER:-kuleposhti}" -d "${POSTGRES_DB:-kuleposhti}" --clean --if-exists --no-owner
docker compose run --rm migrate
docker compose start api web
echo "Restore complete; run ops/smoke.sh"

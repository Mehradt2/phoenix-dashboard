#!/usr/bin/env sh
set -eu
test -n "$1"
cat "$1" | docker compose exec -T db psql -U qc -d qc
echo "restore command completed; run QA before production use"

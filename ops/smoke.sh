#!/usr/bin/env sh
set -eu
URL="${1:-https://${DOMAIN}}"
echo "Checking $URL"
curl -fsS "$URL/healthz"
curl -fsS "$URL/api/health"
echo
echo "Smoke PASS"

#!/usr/bin/env sh
set -eu
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d '\n')"
echo "DATA_ENCRYPTION_KEY=$(openssl rand -base64 32 | tr -d '\n')"
echo "BOOTSTRAP_ADMIN_PASSWORD=$(openssl rand -base64 24 | tr -d '\n')"

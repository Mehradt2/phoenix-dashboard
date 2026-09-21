#!/bin/sh
set -eu
MODEL_SOURCE="${KP_MODEL_SOURCE:-auto}"
case "$MODEL_SOURCE" in
  auto|bundled) ;;
  *) MODEL_SOURCE="auto" ;;
esac
MODEL_BASE="${KP_MODEL_BASE:-/models/}"
cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.__KP_RUNTIME__={mode:"${KP_RUNTIME_MODE:-team}",apiBase:"",release:"${KP_RELEASE:-docker}",modelSource:"$MODEL_SOURCE",modelBase:"$MODEL_BASE"};
EOF

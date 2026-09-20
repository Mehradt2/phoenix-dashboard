#!/bin/sh
set -eu
cat > /usr/share/nginx/html/runtime-config.js <<EOF
window.__KP_RUNTIME__={mode:"${KP_RUNTIME_MODE:-team}",apiBase:"",release:"${KP_RELEASE:-docker}"};
EOF

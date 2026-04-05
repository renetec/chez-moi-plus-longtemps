#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8080}"

cd "$(dirname "$0")"
echo "Chez Moi Plus Longtemps disponible sur http://127.0.0.1:${PORT}"
python3 -m http.server "${PORT}"

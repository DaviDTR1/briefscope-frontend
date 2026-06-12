#!/usr/bin/env bash
# Deploy built frontend to all 3 BriefScope plugin variants.
# Run from briefscope-frontend/: npm run deploy

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$(dirname "$SCRIPT_DIR")"
PLUGINS_DIR="$(dirname "$FRONTEND_DIR")"
DIST="$FRONTEND_DIR/dist"

VARIANTS=(
  "briefscope-cloud"
  "briefscope-local-cpu"
  "briefscope-local-gpu"
)

if [ ! -d "$DIST" ]; then
  echo "Error: dist/ not found. Run 'npm run build' first."
  exit 1
fi

for VARIANT in "${VARIANTS[@]}"; do
  DEST="$PLUGINS_DIR/$VARIANT/frontend_dist"
  rm -rf "$DEST"
  cp -r "$DIST" "$DEST"
  echo "✓ $VARIANT/frontend_dist actualizado"
done

echo ""
echo "Deploy completo. Los 3 plugins tienen el frontend actualizado."

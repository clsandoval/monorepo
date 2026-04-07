#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENGINE_DIR="$SCRIPT_DIR/../engine"
FRONTEND_DIR="$SCRIPT_DIR/../frontend"

echo "Building irontide-wasm..."
cd "$ENGINE_DIR"

# Build with wasm-pack
wasm-pack build crates/irontide-wasm \
    --target web \
    --out-dir "$FRONTEND_DIR/src/wasm/pkg" \
    --out-name irontide

echo "WASM build complete!"
echo "Output: $FRONTEND_DIR/src/wasm/pkg/"
ls -lh "$FRONTEND_DIR/src/wasm/pkg/"*.wasm 2>/dev/null || echo "(no .wasm files yet)"

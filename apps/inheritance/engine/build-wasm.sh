#!/usr/bin/env bash
#
# The single documented command that builds the succession engine's WASM
# artifact into the frontend package directory.
#
#   bash apps/inheritance/engine/build-wasm.sh
#   (or, from apps/inheritance/frontend/:  npm run build:wasm)
#
# `frontend/src/wasm/pkg/inheritance_engine_bg.wasm` is a build artifact and is
# gitignored, so a clean checkout has no WASM binary and the five WASM-dependent
# frontend test files fail at readFileSync with ENOENT until this script runs.
#
# wasm-pack can exit 0 in configurations where nothing usable lands in
# --out-dir. A build script that trusts its own exit code is exactly the kind of
# gate that certifies nothing, so the three post-build checks below (existence,
# size floor, WebAssembly magic number) are the point of this script, not
# decoration.
#
# This script never edits engine/Cargo.lock or engine/Cargo.toml. wasm-pack
# reads the pinned wasm-bindgen version out of the committed Cargo.lock and
# fetches the exactly matching CLI, so there is no version to reconcile here.

set -euo pipefail

# --- GATE-09 skip accounting -----------------------------------------------
# total = 3, the three post-build checks this script performs (existence, size
# floor, magic number). skipped = how many of the three did not execute.
# Printed on EVERY exit path, success and failure alike.
WASM_CHECKS_TOTAL=3
WASM_CHECKS_RUN=0
report_skips() {
  echo "GATE-SKIPS total=$WASM_CHECKS_TOTAL skipped=$((WASM_CHECKS_TOTAL - WASM_CHECKS_RUN))"
}

ENGINE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_DIR="$ENGINE_DIR/../frontend/src/wasm/pkg"
WASM_FILE="$OUT_DIR/inheritance_engine_bg.wasm"

# --- Preflight -------------------------------------------------------------

if ! command -v wasm-pack >/dev/null 2>&1; then
  echo "wasm-pack not found. Install it with: cargo install wasm-pack" >&2
  report_skips
  exit 1
fi

if ! rustup target list --installed | grep -q '^wasm32-unknown-unknown$'; then
  echo "Adding missing rust target wasm32-unknown-unknown ..." >&2
  rustup target add wasm32-unknown-unknown
fi

# --- Build -----------------------------------------------------------------

cd "$ENGINE_DIR"
wasm-pack build --target web --out-dir "$OUT_DIR"

# --- Post-build verification ------------------------------------------------

WASM_CHECKS_RUN=$((WASM_CHECKS_RUN + 1))
if [ ! -f "$WASM_FILE" ]; then
  echo "WASM ARTIFACT MISSING: wasm-pack exited 0 but $WASM_FILE does not exist" >&2
  report_skips
  exit 1
fi

WASM_CHECKS_RUN=$((WASM_CHECKS_RUN + 1))
WASM_SIZE="$(wc -c < "$WASM_FILE" | tr -d ' ')"
if [ "$WASM_SIZE" -lt 100000 ]; then
  echo "WASM ARTIFACT TOO SMALL: $WASM_FILE is $WASM_SIZE bytes, expected at least 100000" >&2
  report_skips
  exit 1
fi

WASM_CHECKS_RUN=$((WASM_CHECKS_RUN + 1))
WASM_MAGIC="$(head -c 4 "$WASM_FILE" | od -An -tx1 | tr -d ' \n')"
if [ "$WASM_MAGIC" != "0061736d" ]; then
  echo "WASM ARTIFACT NOT A WEBASSEMBLY BINARY: $WASM_FILE starts with 0x$WASM_MAGIC, expected 0x0061736d" >&2
  report_skips
  exit 1
fi

report_skips
echo "WASM BUILD OK: $WASM_FILE ($WASM_SIZE bytes)"

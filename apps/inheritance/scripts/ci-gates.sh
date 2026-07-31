#!/usr/bin/env bash
#
# ci-gates.sh — the single fail-closed runner for all four project gates.
#
#   bash apps/inheritance/scripts/ci-gates.sh            # run all four
#   bash apps/inheritance/scripts/ci-gates.sh --only 3   # run one, for local iteration
#
# This is the exact command .github/workflows/inheritance-ci.yml executes, so CI
# behavior is reproducible and debuggable on a developer machine rather than only
# after a push.
#
# There is deliberately no option for omitting a gate. There must be no way to
# run "all gates except one" and still get a success message.

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

ONLY=""
while [ $# -gt 0 ]; do
  case "$1" in
    --only)
      ONLY="${2:-}"
      if [[ ! "$ONLY" =~ ^[1-4]$ ]]; then
        echo "--only requires a gate number: 1, 2, 3, or 4" >&2
        exit 1
      fi
      shift 2
      ;;
    *)
      echo "unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

# --- Preflight --------------------------------------------------------------

require_tool() {
  local tool="$1"
  local install_hint="$2"
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "MISSING TOOL: $tool — install with: $install_hint" >&2
    exit 1
  fi
}

require_tool cargo     "https://rustup.rs"
require_tool rustup    "https://rustup.rs"
require_tool wasm-pack "cargo install wasm-pack"
require_tool node      "https://github.com/nvm-sh/nvm (Node 20)"
require_tool npm       "ships with Node 20"

if [ ! -d "$APP_DIR/frontend/node_modules" ]; then
  echo "MISSING DEPS: run npm ci in frontend/" >&2
  exit 1
fi

run_gate() {
  local n="$1"
  [ -z "$ONLY" ] || [ "$ONLY" = "$n" ]
}

# Every gate below runs bare. `set -e` is active and no gate is wrapped in `||`,
# so any nonzero exit aborts this script immediately with that gate's status.
# Do NOT add `if` or short-circuit error handling around a gate — that is exactly
# how a swallow-the-error idiom slips in later and turns a red gate green.

# --- Gate 1/4: engine tests -------------------------------------------------
# Fastest gate with the strongest signal, and it needs no Node or WASM toolchain.
if run_gate 1; then
  echo ""
  echo "=== GATE 1/4: engine tests (cargo test) ==="
  cd "$APP_DIR/engine"
  cargo test
fi

# --- Gate 2/4: WASM build ---------------------------------------------------
# Must precede gate 3: the frontend suite loads inheritance_engine_bg.wasm from
# disk, and that file is gitignored, so on a clean checkout it does not exist
# until this gate produces it.
if run_gate 2; then
  echo ""
  echo "=== GATE 2/4: WASM build (engine/build-wasm.sh) ==="
  bash "$APP_DIR/engine/build-wasm.sh"
fi

# --- Gate 3/4: frontend test gate -------------------------------------------
# Runs the complete 2,416-test suite and diffs it against test-baseline.json.
# NOT plain `npm test`: that is red on the 46 known failures and tells CI nothing.
if run_gate 3; then
  echo ""
  echo "=== GATE 3/4: frontend suite vs known-failure ledger (npm run test:gate) ==="
  cd "$APP_DIR/frontend"
  npm run test:gate
fi

# --- Gate 4/4: typecheck ----------------------------------------------------
# The --force flag is mandatory here. Without it, an incremental build can no-op
# against a stale tsconfig.tsbuildinfo and report clean on a tree with type errors.
if run_gate 4; then
  echo ""
  echo "=== GATE 4/4: typecheck (npx tsc -b --force) ==="
  cd "$APP_DIR/frontend"
  npx tsc -b --force
fi

echo ""
if [ -n "$ONLY" ]; then
  echo "GATE $ONLY PASSED (ran with --only $ONLY; this is NOT a full gate run)"
else
  echo "ALL GATES PASSED (4/4)"
fi

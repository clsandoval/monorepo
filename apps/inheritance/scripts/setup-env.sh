#!/usr/bin/env bash
#
# setup-env.sh — the single documented command that brings up a complete local
# environment for this app from a clean checkout.
#
#   bash apps/inheritance/scripts/setup-env.sh
#
# It is idempotent. Running it twice is safe, and the second run is fast: every
# step checks whether its work is already done before doing it, and the Supabase
# stack is left alone when a container named supabase_db_inheritance is already
# up.
#
# This script PERFORMS the bring-up. It does not judge it. The verdict comes
# from scripts/check-env-ready.mjs, which cannot write anything, and which this
# script invokes as its last step. Keeping the two apart is deliberate: a script
# that both performs an action and grades it can always report success for work
# it did not actually do.
#
# PORTS. This app's local Supabase runs on the 55320-55329 block, not the
# Supabase default 54321-54324. Those defaults are claimed by a sibling app in
# this monorepo whose containers are suffixed _cumbebvamlhqvphrkevb. This script
# never stops, restarts or resets a container belonging to another project; the
# collision is resolved by this app moving, which frontend/supabase/config.toml
# already encodes.
#
# This script never resets the database. Database contents are owned by the
# migration and seed plans, and a routine bring-up that silently drops a
# developer's local data is a hazard rather than a convenience.
#
# EXIT CODES
#   0  environment is up and scripts/check-env-ready.mjs agrees
#   1  check-env-ready.mjs reported the environment not ready
#   2  a precondition outside this script's authority is missing (SETUP CANNOT RUN)

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$APP_DIR/frontend"

SUPABASE_CLI_VERSION="2.110.0"
SUPABASE_TARBALL="supabase_linux_amd64.tar.gz"
SUPABASE_URL="https://github.com/supabase/cli/releases/download/v${SUPABASE_CLI_VERSION}/${SUPABASE_TARBALL}"
DB_CONTAINER="supabase_db_inheritance"

# Set to an absolute path when the CLI is installed somewhere not yet on PATH.
SUPABASE_BIN="supabase"

cannot_run() {
  echo "SETUP CANNOT RUN: $1" >&2
  exit 2
}

# --- 1. Docker preflight ----------------------------------------------------
# Installing or starting a container runtime is outside this script's authority.

if ! command -v docker >/dev/null 2>&1; then
  cannot_run "docker daemon unreachable"
fi
if ! docker info >/dev/null 2>&1; then
  cannot_run "docker daemon unreachable"
fi

# --- 2. Rust WASM target ----------------------------------------------------

if ! command -v rustup >/dev/null 2>&1; then
  cannot_run "rustup not found — install from https://rustup.rs"
fi
if ! rustup target list --installed | grep -q '^wasm32-unknown-unknown$'; then
  echo "Adding rust target wasm32-unknown-unknown ..."
  rustup target add wasm32-unknown-unknown
fi

# --- 3. wasm-pack -----------------------------------------------------------

if ! command -v wasm-pack >/dev/null 2>&1; then
  if ! command -v cargo >/dev/null 2>&1; then
    cannot_run "cargo not found — install from https://rustup.rs"
  fi
  echo "Installing wasm-pack ..."
  cargo install wasm-pack
fi

# --- 4. Frontend dependencies ----------------------------------------------

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "Installing frontend dependencies ..."
  ( cd "$FRONTEND_DIR" && npm ci )
fi

# --- 5. Supabase CLI, pinned to 2.110.0 -------------------------------------
# The CLI version determines the Postgres, GoTrue and storage-service images it
# pulls, so an unpinned CLI silently changes what "the local environment" means
# between two runs of this same script.

install_supabase_cli() {
  local tmpdir
  tmpdir="$(mktemp -d)"
  echo "Installing Supabase CLI ${SUPABASE_CLI_VERSION} ..."
  curl -fsSL "$SUPABASE_URL" -o "$tmpdir/$SUPABASE_TARBALL"
  tar -xzf "$tmpdir/$SUPABASE_TARBALL" -C "$tmpdir"
  mkdir -p "$HOME/.local/bin"
  mv "$tmpdir/supabase" "$HOME/.local/bin/supabase"
  chmod +x "$HOME/.local/bin/supabase"
  rm -rf "$tmpdir"

  if ! command -v supabase >/dev/null 2>&1 \
     || [ "$(command -v supabase)" != "$HOME/.local/bin/supabase" ]; then
    echo "NOTE: add \$HOME/.local/bin to your PATH to use 'supabase' directly."
    SUPABASE_BIN="$HOME/.local/bin/supabase"
  fi
}

if ! command -v supabase >/dev/null 2>&1; then
  install_supabase_cli
elif [ "$(supabase --version 2>/dev/null | tr -d '[:space:]')" != "$SUPABASE_CLI_VERSION" ]; then
  install_supabase_cli
fi

# --- 6. Start the stack -----------------------------------------------------

RUNNING="$(docker ps --filter "name=${DB_CONTAINER}" --format '{{.Names}}' || true)"
if [ -n "$RUNNING" ]; then
  echo "Supabase already running for project inheritance"
else
  echo "Starting Supabase ..."
  set +e
  START_OUT="$( cd "$FRONTEND_DIR" && "$SUPABASE_BIN" start 2>&1 )"
  START_EXIT=$?
  set -e
  echo "$START_OUT"
  if [ "$START_EXIT" -ne 0 ]; then
    cannot_run "supabase start failed"
  fi
fi

# --- 7. Write frontend/.env.local -------------------------------------------
# SERVICE_ROLE_KEY is deliberately excluded: nothing in frontend/src reads it,
# and a service-role key in a Vite env file is shipped to the browser.

STATUS_ENV="$( cd "$FRONTEND_DIR" && "$SUPABASE_BIN" status -o env )"
API_URL="$(printf '%s\n' "$STATUS_ENV" | sed -n 's/^API_URL="\{0,1\}\([^"]*\)"\{0,1\}$/\1/p' | head -1)"
ANON_KEY="$(printf '%s\n' "$STATUS_ENV" | sed -n 's/^ANON_KEY="\{0,1\}\([^"]*\)"\{0,1\}$/\1/p' | head -1)"

if [ -z "$API_URL" ] || [ -z "$ANON_KEY" ]; then
  echo "$STATUS_ENV" >&2
  cannot_run "supabase status -o env did not report API_URL and ANON_KEY"
fi

cat > "$FRONTEND_DIR/.env.local" <<EOF
# Generated by scripts/setup-env.sh — gitignored, do not commit.
VITE_SUPABASE_URL=$API_URL
VITE_SUPABASE_ANON_KEY=$ANON_KEY
VITE_APP_URL=http://localhost:5173
EOF

echo "Wrote $FRONTEND_DIR/.env.local"

# --- 8. Build the WASM artifact ---------------------------------------------

bash "$APP_DIR/engine/build-wasm.sh"

# --- 9. Verify --------------------------------------------------------------
# The verdict belongs to the read-only checker, not to this script.

set +e
node "$APP_DIR/scripts/check-env-ready.mjs"
CHECK_EXIT=$?
set -e

if [ "$CHECK_EXIT" -ne 0 ]; then
  exit "$CHECK_EXIT"
fi

echo "SETUP COMPLETE"

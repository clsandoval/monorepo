#!/usr/bin/env bash
#
# ci-gates.sh — the single fail-closed runner for every gate in gates.manifest.json.
#
#   bash apps/inheritance/scripts/ci-gates.sh             # run every gate
#   bash apps/inheritance/scripts/ci-gates.sh --only G5   # run one, for local iteration
#
# This is the exact command .github/workflows/inheritance-ci.yml executes, so CI
# behavior is reproducible and debuggable on a developer machine rather than only
# after a push.
#
# The gate list is NOT hardcoded here. It is read from gates.manifest.json, in
# `order`, honoring each gate's `precondition`. That is what makes the manifest
# real rather than documentation: a gate can only stop running by being removed
# from the manifest, and scripts/check-gate-manifest.mjs rejects that (the gate
# set may only grow — see GATES.md).
#
# There is deliberately no option for omitting a gate. There must be no way to
# run "all gates except one" and still get a whole-run success message. There is
# also no flag for pointing this runner at a different manifest file, so no
# invocation can aim it at a weaker gate set.
#
# EXIT CONTRACT — three values, because "the gate failed" and "the gate could not
# run" are opposite situations. One is information about the product, the other
# about the environment, and conflating them is how a long unattended loop
# quietly redefines success.
#
#   | Code | Meaning                          | Marker printed          |
#   |------|----------------------------------|-------------------------|
#   |  0   | Every gate ran and passed        | ALL GATES PASSED (n/n)  |
#   |  1   | A gate ran and failed            | GATE FAILED: <id>       |
#   |  2   | A gate could not run at all      | GATE CANNOT RUN: <id>   |
#   |      |                                  | HALT: <reason>          |
#
# Cannot-run conditions, enumerated so nobody has to judge: a missing required
# tool; a false `precondition`; a gate command exiting 127 (command not found);
# an unreadable or unparseable gates.manifest.json.
#
# Exit 2 is a HALT, not a failure to route around. The operator stops, reports
# BLOCKED using the five-field template in .planning/PLAN-STANDARD.md section 3,
# and pastes the real command output. Editing a gate, a precondition, the
# manifest, or a test to make the halt go away is prohibited.
#
# Every exit path — success, gate failure and halt alike — writes
# .gate-runs/latest.json via a trap. A recorder that only runs on success records
# nothing about the situation it exists to detect.

set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MANIFEST="$APP_DIR/gates.manifest.json"
RUN_DIR="$APP_DIR/.gate-runs"
RUN_FILE="$RUN_DIR/latest.json"

STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# --- run-record state -------------------------------------------------------
# Accumulated as the run proceeds and serialized by the EXIT trap below.

OUTCOME="cannot-run"
FAILURE_SIGNATURE=""
MANIFEST_VERSION="0"
GATES_TOTAL="0"
GATE_IDS=""        # newline-separated, manifest order
GATE_RESULTS=""    # newline-separated "id<TAB>status<TAB>exit_code<TAB>started<TAB>ended"

record_gate() {
  # id status exit_code started ended  ("" exit_code means JSON null)
  GATE_RESULTS="${GATE_RESULTS}${1}	${2}	${3}	${4}	${5}
"
}

# The serializer is held in a variable so that every `set +e` in this script is
# immediately followed by the `$?` capture it belongs to, with nothing in
# between. Values reach node through the environment, so no shell-side JSON
# escaping is hand-rolled.
RECORD_WRITER_JS='
  const fs = require("fs");
  const env = process.env;
  const seen = new Map();
  for (const line of (env.GSD_GATE_RESULTS || "").split("\n")) {
    if (line.trim() === "") continue;
    const [id, status, code, s, e] = line.split("\t");
    seen.set(id, {
      id,
      status,
      exit_code: code === "" ? null : Number(code),
      started_at: s === "" ? null : s,
      ended_at: e === "" ? null : e,
    });
  }
  // Every manifest gate appears, including ones that never started. That
  // absence-as-data is what the coverage check turns into a report.
  const gates = [];
  for (const id of (env.GSD_GATE_IDS || "").split("\n")) {
    if (id.trim() === "") continue;
    gates.push(
      seen.get(id) || { id, status: "not-run", exit_code: null, started_at: null, ended_at: null },
    );
  }
  const rec = {
    schema: 1,
    started_at: env.GSD_STARTED_AT,
    ended_at: env.GSD_ENDED_AT,
    outcome: env.GSD_OUTCOME,
    failure_signature: env.GSD_SIGNATURE,
    manifest_version: Number(env.GSD_MANIFEST_VERSION),
    gates_total: Number(env.GSD_GATES_TOTAL),
    only: env.GSD_ONLY,
    gates,
  };
  fs.writeFileSync(env.GSD_RUN_FILE, JSON.stringify(rec, null, 2) + "\n");
'

write_run_record() {
  mkdir -p "$RUN_DIR"
  set +e
  GSD_ENDED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)" GSD_OUTCOME="$OUTCOME" GSD_SIGNATURE="$FAILURE_SIGNATURE" GSD_STARTED_AT="$STARTED_AT" GSD_MANIFEST_VERSION="$MANIFEST_VERSION" GSD_GATES_TOTAL="$GATES_TOTAL" GSD_ONLY="${ONLY:-}" GSD_GATE_IDS="$GATE_IDS" GSD_GATE_RESULTS="$GATE_RESULTS" GSD_RUN_FILE="$RUN_FILE" node -e "$RECORD_WRITER_JS"
  REC_RC=$?
  set -e
  if [ "$REC_RC" -ne 0 ]; then
    echo "WARNING: could not write $RUN_FILE" >&2
  fi
}

trap write_run_record EXIT

halt() {
  # $1 = gate id or "preflight"/"manifest", $2 = reason, $3 = failure signature
  OUTCOME="cannot-run"
  FAILURE_SIGNATURE="$3"
  echo "" >&2
  echo "GATE CANNOT RUN: $1" >&2
  echo "HALT: $2" >&2
  echo "" >&2
  echo "This is a HALT (exit 2), not a gate failure. Stop and report BLOCKED per" >&2
  echo ".planning/PLAN-STANDARD.md section 3, pasting the real command output." >&2
  echo "Do NOT edit a gate, a precondition, the manifest or a test to clear it." >&2
  exit 2
}

# --- arguments --------------------------------------------------------------

ONLY=""
while [ $# -gt 0 ]; do
  case "$1" in
    --only)
      ONLY="${2:-}"
      if [ -z "$ONLY" ]; then
        echo "--only requires a gate id" >&2
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

# --- injection hooks --------------------------------------------------------
# These four variables exist ONLY to keep the exit contract under test. They are
# FAIL-CLOSED ONLY: each one can turn a green run red, and none of them can turn
# a red run green. There is no variable and no flag anywhere in this script that
# skips a gate, marks a gate optional, or converts a nonzero result to success.

INJ_MISSING_TOOL="${GATES_INJECT_MISSING_TOOL:-}"
INJ_PRECONDITION_FAIL="${GATES_INJECT_PRECONDITION_FAIL:-}"
INJ_GATE_FAIL="${GATES_INJECT_GATE_FAIL:-}"
INJ_NOT_FOUND="${GATES_INJECT_NOT_FOUND:-}"

[ -n "$INJ_MISSING_TOOL" ] && echo "INJECTED FAILURE ACTIVE: GATES_INJECT_MISSING_TOOL=$INJ_MISSING_TOOL"
[ -n "$INJ_PRECONDITION_FAIL" ] && echo "INJECTED FAILURE ACTIVE: GATES_INJECT_PRECONDITION_FAIL=$INJ_PRECONDITION_FAIL"
[ -n "$INJ_GATE_FAIL" ] && echo "INJECTED FAILURE ACTIVE: GATES_INJECT_GATE_FAIL=$INJ_GATE_FAIL"
[ -n "$INJ_NOT_FOUND" ] && echo "INJECTED FAILURE ACTIVE: GATES_INJECT_NOT_FOUND=$INJ_NOT_FOUND"

# --- load the manifest ------------------------------------------------------

if [ ! -f "$MANIFEST" ]; then
  halt "manifest" "gates.manifest.json is missing or unparseable" "PREFLIGHT:manifest"
fi

# Same reason as RECORD_WRITER_JS above: the reader lives in a variable so the
# errexit suspension below sits directly on top of its exit-status capture.
MANIFEST_READER_JS='
  const m = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
  if (!Array.isArray(m.gates) || m.gates.length === 0) process.exit(1);
  const out = m.gates.slice().sort((a, b) => a.order - b.order);
  console.log("VERSION\t" + m.version + "\t" + out.length);
  for (const g of out) {
    console.log([g.id, g.name, g.command, g.precondition, g.blocking].join("\t"));
  }
'

set +e
GATE_LINES="$(node -e "$MANIFEST_READER_JS" "$MANIFEST" 2>/dev/null)"
MANIFEST_RC=$?
set -e
if [ "$MANIFEST_RC" -ne 0 ] || [ -z "$GATE_LINES" ]; then
  halt "manifest" "gates.manifest.json is missing or unparseable" "PREFLIGHT:manifest"
fi

MANIFEST_VERSION="$(printf '%s\n' "$GATE_LINES" | head -1 | cut -f2)"
GATES_TOTAL="$(printf '%s\n' "$GATE_LINES" | head -1 | cut -f3)"
GATE_LINES="$(printf '%s\n' "$GATE_LINES" | tail -n +2)"
GATE_IDS="$(printf '%s\n' "$GATE_LINES" | cut -f1)"

if [ -n "$ONLY" ]; then
  if ! printf '%s\n' "$GATE_IDS" | grep -qx -- "$ONLY"; then
    echo "unknown gate id: $ONLY" >&2
    echo "valid gate ids: $(printf '%s\n' "$GATE_IDS" | tr '\n' ' ')" >&2
    exit 1
  fi
fi

# --- Preflight --------------------------------------------------------------
# A missing toolchain is information about the environment, not about the
# product, so every preflight failure exits 2 and never 1.

require_tool() {
  local tool="$1"
  local install_hint="$2"
  if [ "$tool" = "$INJ_MISSING_TOOL" ] || ! command -v "$tool" >/dev/null 2>&1; then
    halt "preflight" "missing tool: $tool — install with: $install_hint" "PREFLIGHT:$tool"
  fi
}

require_tool cargo     "https://rustup.rs"
require_tool rustup    "https://rustup.rs"
require_tool wasm-pack "cargo install wasm-pack"
require_tool node      "https://github.com/nvm-sh/nvm (Node 20)"
require_tool npm       "ships with Node 20"

if [ ! -d "$APP_DIR/frontend/node_modules" ]; then
  halt "preflight" "missing deps: run npm ci in frontend/" "PREFLIGHT:node_modules"
fi

# --- Run each gate in manifest order ----------------------------------------
# Every gate below runs bare inside an explicit exit-code capture. `set +e` is
# only ever paired with an immediate `rc=$?` and an explicit branch. Do NOT wrap
# a gate in a short-circuit that discards its status, nor in an `if` around its
# success — that is exactly how a swallow-the-error idiom slips in later and
# turns a red gate green.

POSITION=0
RAN=0
while IFS=$'\t' read -r GATE_ID GATE_NAME GATE_CMD GATE_PRE GATE_BLOCKING; do
  [ -z "$GATE_ID" ] && continue
  POSITION=$((POSITION + 1))

  if [ -n "$ONLY" ] && [ "$ONLY" != "$GATE_ID" ]; then
    continue
  fi

  echo ""
  echo "=== GATE $GATE_ID ($POSITION/$GATES_TOTAL): $GATE_NAME ==="

  GATE_STARTED="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

  EFFECTIVE_PRE="$GATE_PRE"
  if [ "$GATE_ID" = "$INJ_PRECONDITION_FAIL" ]; then
    EFFECTIVE_PRE="false"
  fi

  set +e
  ( cd "$APP_DIR" && bash -c "$EFFECTIVE_PRE" >/dev/null 2>&1 )
  PRE_RC=$?
  set -e
  if [ "$PRE_RC" -ne 0 ]; then
    record_gate "$GATE_ID" "cannot-run" "" "$GATE_STARTED" "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    halt "$GATE_ID" "precondition failed — $EFFECTIVE_PRE" "CANNOT_RUN:$GATE_ID"
  fi

  EFFECTIVE_CMD="$GATE_CMD"
  if [ "$GATE_ID" = "$INJ_GATE_FAIL" ]; then
    EFFECTIVE_CMD="exit 3"
  fi
  if [ "$GATE_ID" = "$INJ_NOT_FOUND" ]; then
    EFFECTIVE_CMD="definitely-not-a-real-binary-xyz"
  fi

  set +e
  ( cd "$APP_DIR" && bash -c "$EFFECTIVE_CMD" )
  rc=$?
  set -e

  GATE_ENDED="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

  if [ "$rc" -eq 127 ]; then
    # 127 is "command not found". The gate did not run; it cannot have failed.
    record_gate "$GATE_ID" "cannot-run" "$rc" "$GATE_STARTED" "$GATE_ENDED"
    halt "$GATE_ID" "command not found — $EFFECTIVE_CMD" "CANNOT_RUN:$GATE_ID"
  fi

  if [ "$rc" -ne 0 ]; then
    record_gate "$GATE_ID" "fail" "$rc" "$GATE_STARTED" "$GATE_ENDED"
    OUTCOME="fail"
    FAILURE_SIGNATURE="$GATE_ID:$rc"
    echo "" >&2
    echo "GATE FAILED: $GATE_ID (exit $rc)" >&2
    exit 1
  fi

  record_gate "$GATE_ID" "pass" "$rc" "$GATE_STARTED" "$GATE_ENDED"
  RAN=$((RAN + 1))
done <<< "$GATE_LINES"

OUTCOME="pass"
FAILURE_SIGNATURE=""

# --- Coverage closeout ------------------------------------------------------
# Reaching here means every gate this run executed passed. That is NOT the same
# as "every gate in the frozen manifest ran". scripts/gate-coverage.mjs joins the
# manifest (the expectation) against the run record (the observation) and exits 1
# with SCOPE NARROWED when a passing run skipped a blocking gate. It runs BEFORE
# the success line, so a narrowed run can never print a whole-run success message.
#
# Skipped on --only: a partial run legitimately reaches one gate, and reporting a
# narrowing on every developer iteration would train operators to ignore it.
# The gate-failure and halt paths already exited above, so this is the full green
# path only.

if [ -n "$ONLY" ]; then
  echo ""
  echo "Coverage is not evaluated on a partial run (--only $ONLY)."
else
  echo ""
  write_run_record
  set +e
  node "$APP_DIR/scripts/gate-coverage.mjs" --run "$RUN_FILE"
  COVERAGE_RC=$?
  set -e
  if [ "$COVERAGE_RC" -ne 0 ]; then
    OUTCOME="fail"
    FAILURE_SIGNATURE="coverage:$COVERAGE_RC"
    echo "" >&2
    echo "GATE FAILED: coverage (exit $COVERAGE_RC)" >&2
    exit 1
  fi
fi

echo ""
if [ -n "$ONLY" ]; then
  echo "GATE $ONLY PASSED (ran with --only $ONLY; this is NOT a full gate run)"
else
  echo "ALL GATES PASSED ($RAN/$GATES_TOTAL)"
fi

#!/usr/bin/env bash
#
# coverage-report.sh — the single documented command that produces a per-module
# region/line/function coverage report for the Rust succession engine.
#
#   bash apps/inheritance/scripts/coverage-report.sh
#
# NO CRATE IS INSTALLED. Neither cargo-llvm-cov nor cargo-tarpaulin is used or
# needed. `llvm-profdata` and `llvm-cov` ship inside the rustc sysroot via the
# rustup component `llvm-tools-preview`, so engine/Cargo.toml and
# engine/Cargo.lock are never touched by this script.
#
# WHY REGIONS AND NOT BRANCHES. Stable Rust's coverage instrumentation is
# region-based. The `Branches` column of `llvm-cov report` is EMPTY on stable
# because MC/DC branch counters require a nightly flag. Requirement COV-04 asks
# which branches no test exercises; the finest granularity stable Rust can
# actually answer that with is the coverage region, which is what this report
# uses. A report that silently printed an empty Branches column would be worse
# than one that says plainly which granularity it measures.
#
# THERE IS NO PERCENTAGE THRESHOLD, here or in the gate. COV-04 asks for a
# report, not a number, and nothing in the requirement or the repository grounds
# a particular percentage. Inventing one would be exactly the ungrounded
# decision this project forbids. The gate (scripts/check-coverage.mjs) asserts
# only what is grounded: the report can be produced, every engine module appears
# in it, and the set of modules at EXACTLY zero coverage has not grown.
#
# Outputs:
#   .gate-runs/coverage/export.json   raw llvm-cov export (gitignored)
#   .gate-runs/coverage/summary.json  reduced per-module summary (gitignored)
#   engine/COVERAGE.md                the committed human-readable report
#
# Exit 0 on success, 1 on any failure. No other exit code.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENGINE_DIR="$APP_DIR/engine"
COV_DIR="$APP_DIR/.gate-runs/coverage"

# --- Toolchain resolution ---------------------------------------------------
# llvm-profdata and llvm-cov are NOT on PATH. They live in the rustc sysroot.

HOST="$(rustc -vV | sed -n 's/^host: //p')"
LLVM_BIN="$(rustc --print sysroot)/lib/rustlib/${HOST}/bin"

if [ ! -x "${LLVM_BIN}/llvm-profdata" ] || [ ! -x "${LLVM_BIN}/llvm-cov" ]; then
  echo "COVERAGE TOOLCHAIN MISSING: install with rustup component add llvm-tools-preview" >&2
  echo "  looked in: ${LLVM_BIN}" >&2
  exit 1
fi

# --- Instrumented test run --------------------------------------------------

rm -rf "$COV_DIR"
mkdir -p "$COV_DIR/profraw"

cd "$ENGINE_DIR"
RUSTFLAGS="-C instrument-coverage" \
LLVM_PROFILE_FILE="${COV_DIR}/profraw/cov-%p-%m.profraw" \
CARGO_TARGET_DIR="${COV_DIR}/target" \
  cargo test --tests >"${COV_DIR}/cargo-test.log" 2>&1 || {
    echo "COVERAGE TEST RUN FAILED: cargo test --tests exited nonzero under instrumentation" >&2
    tail -30 "${COV_DIR}/cargo-test.log" >&2
    exit 1
  }

shopt -s nullglob
PROFRAW=("${COV_DIR}"/profraw/*.profraw)
shopt -u nullglob
if [ ${#PROFRAW[@]} -eq 0 ]; then
  echo "COVERAGE PROFILE MISSING: the instrumented run produced no .profraw files" >&2
  exit 1
fi

"${LLVM_BIN}/llvm-profdata" merge -sparse "${PROFRAW[@]}" -o "${COV_DIR}/cov.profdata"

# --- Export -----------------------------------------------------------------
# One -object per test executable produced by the instrumented build.

OBJECT_ARGS=()
for f in "${COV_DIR}"/target/debug/deps/*; do
  [ -f "$f" ] || continue
  case "$f" in
    *.d|*.so|*.rlib|*.rmeta|*.wasm) continue ;;
  esac
  [ -x "$f" ] || continue
  OBJECT_ARGS+=("-object" "$f")
done

if [ ${#OBJECT_ARGS[@]} -eq 0 ]; then
  echo "COVERAGE OBJECTS MISSING: no instrumented test executable found under ${COV_DIR}/target/debug/deps" >&2
  exit 1
fi

"${LLVM_BIN}/llvm-cov" export \
  -instr-profile="${COV_DIR}/cov.profdata" \
  -format=text \
  -ignore-filename-regex='(/\.cargo/|/rustc/)' \
  "${OBJECT_ARGS[@]}" >"${COV_DIR}/export.json"

# --- Reduce to summary.json and render COVERAGE.md --------------------------
# node: builtins only, no package, no network.

COV_DIR="$COV_DIR" ENGINE_DIR="$ENGINE_DIR" node --input-type=module -e '
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const covDir = process.env.COV_DIR;
const engineDir = process.env.ENGINE_DIR;

const raw = JSON.parse(readFileSync(path.join(covDir, "export.json"), "utf8"));

// llvm-cov export emits { data: [ { files: [...], functions: [...] } ] }.
const byFile = new Map();

for (const datum of raw.data ?? []) {
  for (const f of datum.files ?? []) {
    if (!f.filename.includes("engine/src/")) continue;
    const rel = path.relative(engineDir, f.filename);
    const s = f.summary ?? {};
    byFile.set(rel, {
      file: rel,
      regions_total: s.regions?.count ?? 0,
      regions_uncovered: s.regions?.notcovered ?? 0,
      functions_total: s.functions?.count ?? 0,
      functions_uncovered:
        (s.functions?.count ?? 0) - (s.functions?.covered ?? 0),
      lines_total: s.lines?.count ?? 0,
      lines_uncovered: (s.lines?.count ?? 0) - (s.lines?.covered ?? 0),
      uncovered_function_names: [],
    });
  }

  for (const fn of datum.functions ?? []) {
    if ((fn.count ?? 0) !== 0) continue;
    for (const filename of fn.filenames ?? []) {
      if (!filename.includes("engine/src/")) continue;
      const rel = path.relative(engineDir, filename);
      const mod = byFile.get(rel);
      if (!mod) continue;
      const name = fn.name ?? "<unnamed>";
      if (!mod.uncovered_function_names.includes(name)) {
        mod.uncovered_function_names.push(name);
      }
    }
  }
}

const modules = [...byFile.values()].sort((a, b) => a.file.localeCompare(b.file));
for (const m of modules) m.uncovered_function_names.sort();

const generatedAt = new Date().toISOString();
writeFileSync(
  path.join(covDir, "summary.json"),
  JSON.stringify({ generated_at: generatedAt, modules }, null, 2) + "\n"
);

// --- The committed human report -------------------------------------------
const lines = [];
lines.push("# Engine coverage report");
lines.push("");
lines.push(`Generated: ${generatedAt}`);
lines.push("");
lines.push("Regenerate with:");
lines.push("");
lines.push("```bash");
lines.push("bash apps/inheritance/scripts/coverage-report.sh");
lines.push("```");
lines.push("");
lines.push(
  "**Regions, not branches.** Stable Rust coverage instrumentation is region-based, so the"
);
lines.push(
  "`Branches` column of `llvm-cov report` is empty on stable — MC/DC branch counters need a nightly"
);
lines.push(
  "flag. A coverage *region* is the finest granularity stable Rust can report, and it is what this"
);
lines.push("table measures. **There is no percentage threshold anywhere in this report or in gate G12.**");
lines.push(
  "COV-04 asks which parts of each module no test enters; picking a target percentage would be an"
);
lines.push("ungrounded decision, so none is made.");
lines.push("");
lines.push("| Module | Regions | Uncovered regions | Lines | Uncovered lines | Functions | Uncovered functions |");
lines.push("|---|---:|---:|---:|---:|---:|---:|");
for (const m of modules) {
  lines.push(
    `| \`${m.file}\` | ${m.regions_total} | ${m.regions_uncovered} | ${m.lines_total} | ${m.lines_uncovered} | ${m.functions_total} | ${m.functions_uncovered} |`
  );
}
const totals = modules.reduce(
  (a, m) => ({
    r: a.r + m.regions_total,
    ru: a.ru + m.regions_uncovered,
    l: a.l + m.lines_total,
    lu: a.lu + m.lines_uncovered,
    f: a.f + m.functions_total,
    fu: a.fu + m.functions_uncovered,
  }),
  { r: 0, ru: 0, l: 0, lu: 0, f: 0, fu: 0 }
);
lines.push(
  `| **TOTAL (${modules.length} modules)** | ${totals.r} | ${totals.ru} | ${totals.l} | ${totals.lu} | ${totals.f} | ${totals.fu} |`
);
lines.push("");
lines.push("Modules where every region is uncovered are declared, with a reason, in");
lines.push("`apps/inheritance/coverage-zero.lock`. That ledger may only shrink.");
lines.push("");

for (const m of modules) {
  if (m.uncovered_function_names.length === 0) continue;
  lines.push(`### Uncovered functions — \`${m.file}\``);
  lines.push("");
  for (const name of m.uncovered_function_names) {
    lines.push(`- \`${name}\``);
  }
  lines.push("");
}

writeFileSync(path.join(engineDir, "COVERAGE.md"), lines.join("\n"));
process.stdout.write(String(modules.length));
' >"${COV_DIR}/module-count.txt"

MODULE_COUNT="$(cat "${COV_DIR}/module-count.txt")"
echo "COVERAGE REPORT WRITTEN — ${MODULE_COUNT} engine modules"

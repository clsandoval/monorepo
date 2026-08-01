#!/usr/bin/env npx tsx
/**
 * check-one-fact-set.ts — the succession engine and the estate-tax engine must never silently
 * disagree about the date of death.
 *
 *   cd frontend && npx tsx scripts/check-one-fact-set.ts
 *   cd frontend && npx tsx scripts/check-one-fact-set.ts --fixtures <dir> --src <dir>
 *
 * WHAT THIS GATE PROVES. The date of death is the one fact both engines are keyed on. It selects
 * PRE_TRAIN versus TRAIN deduction rules, it decides whether the TRAIN-repealed medical deduction
 * applies, and it is the first line of both the Deed of Extrajudicial Settlement and BIR Form 1801.
 * Before Phase 18 it was entered twice, into two JSONB columns, with no comparison between them —
 * two spines that could disagree, in a product whose entire claim is defensibility. Phase 18 made
 * one fact set the spine. This gate is what keeps that true after Phase 18 stops watching.
 *
 * Five assertions, each with its own literal marker so a failure says WHICH rule broke:
 *
 *   SECOND DATE FIELD           — a control under src/ writes EstateTaxWizardState.decedent.dateOfDeath
 *   FACT SET NOT SHARED         — the estate-tax route does not consult the fact set, or reads the
 *                                 projected decedent_name column instead
 *   DISAGREEMENT NOT REFUSED    — the real rule, over committed fixture rows, fails to refuse a
 *                                 disagreement or fails to print both dates
 *   DATE NOT KEYED TO TAX       — the real tax engine's regime, medical deduction or tax due does
 *                                 not move across the TRAIN boundary
 *   ENGINE INPUT DATE MISMATCH  — the date the tax path reads is not byte-identical to the date the
 *                                 compiled succession engine is handed, or the engine computed nothing
 *
 * Plus two error markers, both refusing to pass:
 *
 *   CORPUS EMPTY                — zero fixture rows examined, exit 1
 *   FACT SET CHECK CANNOT RUN:  — a fixture or the WASM artifact is missing or unparseable, exit 2
 *                                 (the project's distinct "a gate could not run" code)
 *
 * NO EXCEPTION LIST, NO MUTATING FLAG. This script holds no exception list, no tolerated-
 * disagreement table and no baseline file, and it has no flag that writes, repairs, regenerates,
 * accepts, updates or waives anything. Its only two flags are read-only path overrides that exist
 * so the committed fixtures and the empty-corpus path can be driven. A gate that carries a list of
 * tolerated disagreements acquires an entry the first time it is inconvenient, and that entry is
 * invisible in every green run that follows.
 *
 * IT RESTATES NO RULE. Every verdict comes from `src/lib/fact-set.ts` and every tax figure comes
 * from `src/lib/estate-tax-engine`. `frontend/tsconfig.json` includes only `src`, so this runner is
 * NOT typechecked by G4 — which is exactly why it holds no logic of its own. A rule implemented
 * here would be a second implementation of a legal rule, which this codebase's invariant 5 forbids.
 *
 * A GREEN RUN ON ZERO ROWS IS A FAILURE BY CONSTRUCTION. A fixtures directory that silently matched
 * no file, or a WASM load that silently returned nothing, would print no violations and exit 0
 * forever — the gate would certify its own absence. So: zero fixture rows exits 1 with CORPUS
 * EMPTY; a missing .wasm exits 2 rather than skipping check 5; and check 5 requires a POSITIVE
 * per_heir_shares length, so an engine returning an empty object fails rather than passes.
 *
 * WHY THE SUCCESSION ENGINE'S INVARIANCE IS NOT ASSERTED. 18-BASELINE.md records that the
 * succession engine's output does not move with the date of death, over the whole committed corpus.
 * Asserting that invariance would freeze today's behaviour as a permanent expectation and would
 * turn this gate red the day question LAWYER-08 is answered and RA 11642 retroactivity is
 * implemented — a gate whose correct fix is "weaken me" is a gate that gets weakened. This gate
 * asserts the date ARRIVES at the engine, never that it CHANGES the answer.
 *
 * THE CORRECT RESPONSE TO A RED RUN IS A BLOCKED REPORT WITH THE PASTED OUTPUT — never an edit to
 * this script, and never an edit to a baseline.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  assertOneFactSet,
  factSetFromCaseRow,
  factSetConflictMessage,
} from '../src/lib/fact-set';
import { computeEstateTax } from '../src/lib/estate-tax-engine';
import { createDefaultEstateTaxState } from '../src/types/estate-tax';
// @ts-expect-error — journey/engine.mjs is untyped JavaScript outside tsconfig's include.
import { computeEngineOutput } from '../journey/engine.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function flag(name: string): string | null {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? (process.argv[i + 1] as string) : null;
}

const FIXTURES_DIR = flag('--fixtures') ?? path.resolve(HERE, 'fixtures');
const SRC_DIR = flag('--src') ?? path.resolve(HERE, '..', 'src');

const FIXTURE_NAMES = [
  'fact-set-agree.json',
  'fact-set-disagree.json',
  'fact-set-missing-date.json',
] as const;

const violations: string[] = [];
const report: string[] = [];
let rowsExamined = 0;

function cannotRun(message: string): never {
  console.error(`FACT SET CHECK CANNOT RUN: ${message}`);
  process.exit(2);
}

// ── Check 1 — SECOND DATE FIELD ─────────────────────────────────────────────

const WRITER_LITERAL = ['dateOfDeath:', 'e.target.value'].join(' ');

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '__tests__') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

report.push('## Check 1 — SECOND DATE FIELD');
let writerFiles: string[] = [];
try {
  writerFiles = walk(SRC_DIR).filter((f) =>
    fs.readFileSync(f, 'utf8').includes(WRITER_LITERAL),
  );
} catch (err) {
  cannotRun(`could not scan ${SRC_DIR}: ${err instanceof Error ? err.message : String(err)}`);
}
if (writerFiles.length > 0) {
  for (const f of writerFiles) {
    violations.push(`SECOND DATE FIELD ${path.relative(SRC_DIR, f)}`);
    report.push(`  SECOND DATE FIELD ${path.relative(SRC_DIR, f)} writes the tax-side date`);
  }
} else {
  report.push(`  ok — 0 of ${walk(SRC_DIR).length} source files write the tax-side date`);
}

// ── Check 2 — FACT SET NOT SHARED ───────────────────────────────────────────

report.push('## Check 2 — FACT SET NOT SHARED');
const ROUTE_PATH = path.join(SRC_DIR, 'routes', 'cases', '$caseId.tax.tsx');
let routeText = '';
try {
  routeText = fs.readFileSync(ROUTE_PATH, 'utf8');
} catch (err) {
  cannotRun(`could not read ${ROUTE_PATH}: ${err instanceof Error ? err.message : String(err)}`);
}
if (!routeText.includes('assertOneFactSet(')) {
  violations.push('FACT SET NOT SHARED no assertOneFactSet(');
  report.push('  FACT SET NOT SHARED — the route never calls assertOneFactSet(');
}
if (!routeText.includes('applyFactSet(')) {
  violations.push('FACT SET NOT SHARED no applyFactSet(');
  report.push('  FACT SET NOT SHARED — the route never calls applyFactSet(');
}
if (routeText.includes('row.decedent_name')) {
  violations.push('FACT SET NOT SHARED reads row.decedent_name');
  report.push('  FACT SET NOT SHARED — the route reads the projected row.decedent_name column');
}
if (
  routeText.includes('assertOneFactSet(') &&
  routeText.includes('applyFactSet(') &&
  !routeText.includes('row.decedent_name')
) {
  report.push('  ok — the route consults the fact set and reads no projected column');
}

// ── Check 3 — DISAGREEMENT NOT REFUSED ──────────────────────────────────────

report.push('## Check 3 — DISAGREEMENT NOT REFUSED');
const rows: Record<string, ReturnType<typeof JSON.parse>> = {};
for (const name of FIXTURE_NAMES) {
  const p = path.join(FIXTURES_DIR, name);
  if (!fs.existsSync(p)) continue;
  try {
    rows[name] = JSON.parse(fs.readFileSync(p, 'utf8'));
    rowsExamined++;
  } catch (err) {
    cannotRun(`could not parse ${p}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

if (rowsExamined > 0) {
  const agree = rows['fact-set-agree.json'];
  const disagree = rows['fact-set-disagree.json'];
  const missing = rows['fact-set-missing-date.json'];

  const vAgree = agree ? assertOneFactSet(agree) : null;
  const vDisagree = disagree ? assertOneFactSet(disagree) : null;
  const vMissing = missing ? assertOneFactSet(missing) : null;

  report.push(`  agree        -> ${vAgree?.kind ?? 'ABSENT'}`);
  report.push(`  disagree     -> ${vDisagree?.kind ?? 'ABSENT'}`);
  report.push(`  missing-date -> ${vMissing?.kind ?? 'ABSENT'}`);

  if (vAgree?.kind !== 'ok') {
    violations.push('DISAGREEMENT NOT REFUSED agree fixture is not ok');
    report.push('  DISAGREEMENT NOT REFUSED — the agreeing fixture did not return ok');
  }
  if (vDisagree?.kind !== 'disagreement') {
    violations.push('DISAGREEMENT NOT REFUSED disagree fixture is not refused');
    report.push('  DISAGREEMENT NOT REFUSED — the disagreeing fixture was not refused');
  } else {
    const expected = factSetConflictMessage(vDisagree.succession, vDisagree.tax);
    const printsBoth =
      vDisagree.message.includes(vDisagree.succession) &&
      vDisagree.message.includes(vDisagree.tax) &&
      vDisagree.message === expected;
    report.push(`  refusal prints both dates -> ${printsBoth}`);
    if (!printsBoth) {
      violations.push('DISAGREEMENT NOT REFUSED refusal does not print both dates');
      report.push('  DISAGREEMENT NOT REFUSED — the refusal does not print both dates');
    }
  }
  if (vMissing?.kind !== 'missing-date') {
    violations.push('DISAGREEMENT NOT REFUSED missing-date fixture is not refused');
    report.push('  DISAGREEMENT NOT REFUSED — the missing-date fixture was not refused');
  }
}

// ── Check 4 — DATE NOT KEYED TO TAX ─────────────────────────────────────────

report.push('## Check 4 — DATE NOT KEYED TO TAX');
function probeState(dod: string) {
  const s = createDefaultEstateTaxState();
  s.decedent.name = 'Probe';
  s.decedent.dateOfDeath = dod;
  s.decedent.address = 'Quezon City';
  s.executor.name = 'Exec';
  s.personalProperties.push({
    id: 'p1',
    subtype: 'cash',
    description: 'Bank',
    fmv: 10000000,
    ownership: 'exclusive',
  } as never);
  s.specialDeductions.medicalExpenses = 400000;
  return s;
}

const pre = computeEstateTax(probeState('2017-12-31'));
const post = computeEstateTax(probeState('2018-01-01'));

report.push(
  `  2017-12-31 rules=${pre.regimeDetection.deductionRules} medical=${pre.specialDeductions.item37d_medical_expenses} tax_due=${pre.tax_due}`,
);
report.push(
  `  2018-01-01 rules=${post.regimeDetection.deductionRules} medical=${post.specialDeductions.item37d_medical_expenses} tax_due=${post.tax_due}`,
);

if (pre.regimeDetection.deductionRules === post.regimeDetection.deductionRules) {
  violations.push('DATE NOT KEYED TO TAX deductionRules did not move');
  report.push('  DATE NOT KEYED TO TAX — deductionRules is the same on both sides of the boundary');
}
if (
  pre.specialDeductions.item37d_medical_expenses === post.specialDeductions.item37d_medical_expenses
) {
  violations.push('DATE NOT KEYED TO TAX medical deduction did not move');
  report.push('  DATE NOT KEYED TO TAX — the medical deduction is the same on both sides');
}
if (pre.tax_due === post.tax_due) {
  violations.push('DATE NOT KEYED TO TAX tax_due did not move');
  report.push('  DATE NOT KEYED TO TAX — tax_due is the same on both sides');
}

// ── Check 5 — ENGINE INPUT DATE MISMATCH ────────────────────────────────────

report.push('## Check 5 — ENGINE INPUT DATE MISMATCH');
const agreeRow = rows['fact-set-agree.json'];
if (agreeRow) {
  const fromRule = factSetFromCaseRow(agreeRow).dateOfDeath;
  const handedToEngine = agreeRow.input_json?.decedent?.date_of_death;

  let output: { per_heir_shares?: unknown[] };
  try {
    output = await computeEngineOutput(agreeRow.input_json);
  } catch (err) {
    cannotRun(err instanceof Error ? err.message : String(err));
  }

  const heirRows = output.per_heir_shares?.length ?? 0;
  report.push(`  fact set date=[${fromRule}] engine input date=[${handedToEngine}] heir_rows=${heirRows}`);

  if (fromRule !== handedToEngine) {
    violations.push('ENGINE INPUT DATE MISMATCH');
    report.push('  ENGINE INPUT DATE MISMATCH — the tax path and the engine were handed different dates');
  }
  if (heirRows === 0) {
    violations.push('ENGINE INPUT DATE MISMATCH engine computed nothing');
    report.push('  ENGINE INPUT DATE MISMATCH — the engine returned 0 heir rows, so nothing was proven');
  }
  if (fromRule === handedToEngine && heirRows > 0) {
    report.push('  ok — one date reached both paths and the engine really computed');
  }
}

// ── Report and verdict ──────────────────────────────────────────────────────

console.log(report.join('\n'));
console.log('');

if (rowsExamined === 0) {
  console.log(`CORPUS EMPTY — 0 fixture rows examined from ${FIXTURES_DIR}`);
  console.log('A gate that examines nothing certifies nothing. This is a failure by construction.');
  process.exit(1);
}

console.log('=========================================================');
console.log(`ONE FACT SET CHECK — ${rowsExamined} fixture row(s) examined`);
for (const marker of [
  'SECOND DATE FIELD',
  'FACT SET NOT SHARED',
  'DISAGREEMENT NOT REFUSED',
  'DATE NOT KEYED TO TAX',
  'ENGINE INPUT DATE MISMATCH',
]) {
  const n = violations.filter((v) => v.startsWith(marker)).length;
  console.log(`  ${marker.padEnd(28)} ${n === 0 ? 'ok' : `${n} violation(s)`}`);
}
console.log('=========================================================');

if (violations.length > 0) {
  console.log(`ONE FACT SET CHECK FAILED — ${violations.length} violation(s)`);
  process.exit(1);
}
console.log('ONE FACT SET OK');
process.exit(0);

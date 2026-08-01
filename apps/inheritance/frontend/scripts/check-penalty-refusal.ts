#!/usr/bin/env npx tsx
/**
 * check-penalty-refusal.ts — the engine must never publish a penalty figure it
 * cannot defend, and must never fill one in because a consumer needed a number.
 *
 *   cd frontend && npx tsx scripts/check-penalty-refusal.ts
 *   cd frontend && npx tsx scripts/check-penalty-refusal.ts --src <dir> --registry <file>
 *
 * WHAT THIS GATE PROVES. Before Phase 20 the estate-tax pipeline ended with
 * `surcharges: 0`, `interest: 0`, `compromise_penalty: 0` and a
 * `total_amount_due` silently equal to the base tax. Most estates entering a
 * small Philippine firm are years late, so that return understated what the
 * client owes — silent wrongness on a page a lawyer signs, which this project
 * ranks as categorically worse than a loud stop. Phase 20 replaced all four
 * with a declined line carrying its governing section and an absent total.
 * This gate is what keeps that true after Phase 20 stops watching.
 *
 * The failure it exists to catch is specific and predictable: A FUTURE AGENT
 * SUPPLIES A RATE BECAUSE A CONSUMER NEEDED A NUMBER. Nothing else in the
 * repository would notice. The type system accepts 0.25 as readily as null; the
 * unit tests would be updated in the same edit; the display would render a peso
 * figure and look more finished than before. The only durable defence is a
 * check that asserts what is ABSENT.
 *
 * Six assertions, each with its own literal marker so a red run says WHICH rule
 * broke:
 *
 *   SILENT ZERO SURVIVES        — a hardcoded penalty zero, or a total assigned
 *                                 from the base tax, back in pipeline.ts
 *   WALL CLOCK IN ENGINE        — any new Date() or Date.now() under
 *                                 src/lib/estate-tax-engine/
 *   TOTAL CLAIMS COMPLETENESS   — a real computation publishing a non-null
 *                                 total while any line is declined
 *   LINE MISSING ITS SECTION    — a penalty line with an empty authority, or a
 *                                 determined line still carrying a lawyerDecision
 *   RATE INVENTED               — a numeric literal in penalties.ts outside the
 *                                 fixed whitelist, or a % or a Math.round
 *   DECLINED LINE UNRECORDED    — a declined line whose lawyerDecision id is not
 *                                 in .planning/lawyer-decisions.json
 *
 * Plus two error markers, both refusing to pass:
 *
 *   CORPUS EMPTY                — zero items examined, exit 1
 *   PENALTY CHECK CANNOT RUN:   — the environment, not the product, is at fault,
 *                                 exit 2 (the project's distinct
 *                                 "a gate could not run" code)
 *
 * RATE INVENTED IS THE LOAD-BEARING ONE. The other five catch a regression;
 * that one catches the decision this whole phase was arranged to prevent, at the
 * moment it is made.
 *
 * NO EXCEPTION LIST, NO MUTATING FLAG. This script holds no exception list, no
 * tolerated-violation table and no baseline file, and it has no flag that
 * writes, repairs, regenerates, accepts, updates or waives anything. Its only
 * two flags are read-only path overrides that exist so a fixture registry and
 * the empty-corpus path can be driven. A gate that carries a list of tolerated
 * violations acquires an entry the first time it is inconvenient, and that entry
 * is invisible in every green run that follows.
 *
 * IT RESTATES NO RULE. Every verdict comes from `src/lib/estate-tax-engine` and
 * every string comes from `penalties.ts`. `frontend/tsconfig.json` includes only
 * `src`, so this runner is NOT typechecked by G4 — which is exactly why it holds
 * no logic of its own. A rule implemented here would be a second implementation
 * of a legal rule, which this codebase's invariant 5 forbids.
 *
 * A GREEN RUN ON ZERO EXAMINED ITEMS IS A FAILURE BY CONSTRUCTION. A source scan
 * whose walk matched nothing would print no violations and exit 0 forever — the
 * gate would certify its own absence. So: zero examined items exits 1 with
 * CORPUS EMPTY; an engine walk finding fewer than five modules exits 2; a
 * literal extraction finding nothing exits 2; and the computation check requires
 * a POSITIVE penalties.lines.length of exactly three, so an engine returning an
 * empty tuple fails rather than passes.
 *
 * DECLINED LINE UNRECORDED ASSERTS EXISTENCE, NEVER STATUS. Asserting that a
 * decision is still unanswered would turn this gate red on the day the lawyer
 * answers, and a gate whose correct fix is "weaken me" is a gate that gets
 * weakened.
 *
 * THE CORRECT RESPONSE TO A RED RUN IS A BLOCKED REPORT WITH THE PASTED OUTPUT —
 * never an edit to this script, and never an edit to a baseline.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { computeEstateTax } from '../src/lib/estate-tax-engine';
import { createDefaultEstateTaxState } from '../src/types/estate-tax';

const HERE = path.dirname(fileURLToPath(import.meta.url));

function flag(name: string): string | null {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? (process.argv[i + 1] as string) : null;
}

const SRC_DIR = flag('--src') ?? path.resolve(HERE, '..', 'src');
const REGISTRY_PATH =
  flag('--registry') ?? path.resolve(HERE, '..', '..', '.planning', 'lawyer-decisions.json');

const ENGINE_DIR = path.join(SRC_DIR, 'lib', 'estate-tax-engine');
const PIPELINE_PATH = path.join(ENGINE_DIR, 'pipeline.ts');
const PENALTIES_PATH = path.join(ENGINE_DIR, 'penalties.ts');

/** The complete set of numeric literals permitted in penalties.ts. */
const LITERAL_WHITELIST = new Set(['0', '1', '2', '6', '10', '12', '86400000']);

const violations: string[] = [];
const report: string[] = [];
let examined = 0;

function cannotRun(message: string): never {
  console.error(`PENALTY CHECK CANNOT RUN: ${message}`);
  skipReport(examined);
  process.exit(2);
}

function skipReport(total: number): void {
  console.log(`GATE-SKIPS total=${total} skipped=0`);
}

function read(file: string, what: string): string {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (err) {
    cannotRun(`could not read ${what} at ${file}: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// ── Check 1 — SILENT ZERO SURVIVES ──────────────────────────────────────────

report.push('## Check 1 — SILENT ZERO SURVIVES');
const pipelineText = read(PIPELINE_PATH, 'pipeline.ts');

const ZERO_LITERALS = ['surcharges: 0', 'interest: 0', 'compromise_penalty: 0'];
const TOTAL_FROM_BASE = 'total_amount_due: taxComputation.estateTaxDue';

for (const literal of [...ZERO_LITERALS, TOTAL_FROM_BASE]) {
  examined += 1;
  const count = pipelineText.split(literal).length - 1;
  if (count > 0) {
    violations.push(`SILENT ZERO SURVIVES ${literal} occurs ${count} time(s) in pipeline.ts`);
    report.push(`  SILENT ZERO SURVIVES  "${literal}" x${count}`);
  } else {
    report.push(`  ok — "${literal}" absent from pipeline.ts`);
  }
}

// ── Check 2 — WALL CLOCK IN ENGINE ──────────────────────────────────────────

report.push('## Check 2 — WALL CLOCK IN ENGINE');

function engineModules(dir: string): string[] {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (err) {
    cannotRun(`could not scan ${dir}: ${err instanceof Error ? err.message : String(err)}`);
  }
  return entries
    .filter((e) => e.isFile() && e.name.endsWith('.ts'))
    .map((e) => path.join(dir, e.name));
}

const modules = engineModules(ENGINE_DIR);
if (modules.length < 5) {
  cannotRun(
    `walk of ${ENGINE_DIR} found only ${modules.length} module(s); the estate-tax engine holds `
      + 'more than that, so the path is wrong rather than the code being clean',
  );
}
const WALL_CLOCK_LITERALS = ['new Date()', 'Date.now()'];
for (const file of modules) {
  examined += 1;
  const text = fs.readFileSync(file, 'utf8');
  for (const literal of WALL_CLOCK_LITERALS) {
    if (text.includes(literal)) {
      violations.push(`WALL CLOCK IN ENGINE ${path.basename(file)} contains ${literal}`);
      report.push(`  WALL CLOCK IN ENGINE  ${path.basename(file)} contains ${literal}`);
    }
  }
}
report.push(`  ${modules.length} engine module(s) walked`);

// ── Check 3 — RATE INVENTED ─────────────────────────────────────────────────

report.push('## Check 3 — RATE INVENTED');
const penaltiesText = read(PENALTIES_PATH, 'penalties.ts');

/**
 * Numeric literals in CODE. Comments and string/template literals are stripped
 * first, because a section number inside a citation string ("NIRC Sec. 248") is
 * text a lawyer reads, not a rate the engine could apply. The whole point of
 * this check is what the code can multiply by.
 */
function codeNumericLiterals(source: string): string[] {
  let s = source;
  s = s.replace(/\/\*[\s\S]*?\*\//g, ' ');
  s = s.replace(/(^|[^:])\/\/[^\n]*/g, '$1 ');
  s = s.replace(/'(?:[^'\\\n]|\\.)*'/g, "''");
  s = s.replace(/"(?:[^"\\\n]|\\.)*"/g, '""');
  s = s.replace(/`(?:[^`\\]|\\.)*`/g, '``');
  const found = new Set<string>();
  const re = /(?<![A-Za-z0-9_$.])\d+(?:\.\d+)?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) found.add(m[0]);
  return [...found].sort((a, b) => Number(a) - Number(b));
}

const literals = codeNumericLiterals(penaltiesText);
if (literals.length === 0) {
  cannotRun(
    'extraction found zero numeric literals in penalties.ts; the module necessarily contains at '
      + 'least the month counts, so the extraction is broken',
  );
}
for (const literal of literals) {
  examined += 1;
  if (!LITERAL_WHITELIST.has(literal)) {
    violations.push(`RATE INVENTED penalties.ts holds the numeric literal ${literal}`);
    report.push(`  RATE INVENTED  numeric literal ${literal} is outside the whitelist`);
  }
}
report.push(`  literal set found: {${literals.join(', ')}}`);
report.push(`  whitelist:         {${[...LITERAL_WHITELIST].join(', ')}}`);

examined += 1;
if (penaltiesText.includes('%')) {
  violations.push('RATE INVENTED penalties.ts contains a % character');
  report.push('  RATE INVENTED  penalties.ts contains a % character');
}
examined += 1;
if (penaltiesText.includes('Math.round')) {
  violations.push('RATE INVENTED penalties.ts contains Math.round');
  report.push('  RATE INVENTED  penalties.ts contains Math.round');
}

// ── The three real computations ─────────────────────────────────────────────

const CASES = [
  { name: 'A', dateOfDeath: '2020-06-15', filingDate: '2025-06-15' },
  { name: 'B', dateOfDeath: '2015-03-31', filingDate: '2025-06-15' },
  { name: 'C', dateOfDeath: '2020-06-15', filingDate: '' },
] as const;

type Assessed = {
  name: string;
  deadline: string | null;
  daysLate: number | null;
  output: ReturnType<typeof computeEstateTax>;
};

const results: Assessed[] = [];
for (const c of CASES) {
  examined += 1;
  let output: ReturnType<typeof computeEstateTax>;
  try {
    const state = createDefaultEstateTaxState();
    state.decedent.dateOfDeath = c.dateOfDeath;
    state.filing.assumedFilingDate = c.filingDate;
    output = computeEstateTax(state);
  } catch (err) {
    cannotRun(
      `computeEstateTax threw on case ${c.name}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
  const lateness = output.penalties.lateness;
  results.push({
    name: c.name,
    deadline: lateness.kind === 'determined' ? lateness.lateness.statutoryDeadline : null,
    daysLate: lateness.kind === 'determined' ? lateness.lateness.daysLate : null,
    output,
  });
}

// ── Check 4 — TOTAL CLAIMS COMPLETENESS ─────────────────────────────────────

report.push('## Check 4 — TOTAL CLAIMS COMPLETENESS');
for (const r of results) {
  const p = r.output.penalties;
  if (p.lines.length !== 3) {
    violations.push(`TOTAL CLAIMS COMPLETENESS case ${r.name} has ${p.lines.length} line(s), not 3`);
    report.push(`  TOTAL CLAIMS COMPLETENESS  case ${r.name} has ${p.lines.length} line(s)`);
    continue;
  }
  const anyDeclined = p.lines.some((l) => l.status === 'declined');
  for (const line of p.lines) {
    if (line.status === 'declined' && line.centavos !== null) {
      violations.push(
        `TOTAL CLAIMS COMPLETENESS case ${r.name} line ${line.id} is declined but carries ${line.centavos}`,
      );
      report.push(`  TOTAL CLAIMS COMPLETENESS  case ${r.name} ${line.id} declined with an amount`);
    }
  }
  if (anyDeclined && p.complete) {
    violations.push(`TOTAL CLAIMS COMPLETENESS case ${r.name} is complete while a line is declined`);
    report.push(`  TOTAL CLAIMS COMPLETENESS  case ${r.name} complete=true with a declined line`);
  }
  if (anyDeclined && r.output.total_amount_due !== null) {
    violations.push(
      `TOTAL CLAIMS COMPLETENESS case ${r.name} publishes total_amount_due ${r.output.total_amount_due} while a line is declined`,
    );
    report.push(
      `  TOTAL CLAIMS COMPLETENESS  case ${r.name} total_amount_due=${r.output.total_amount_due} with a declined line`,
    );
  }
  const projections: [string, number | null, number | null][] = [
    ['surcharges', r.output.surcharges, p.lines[0].centavos],
    ['interest', r.output.interest, p.lines[1].centavos],
    ['compromise_penalty', r.output.compromise_penalty, p.lines[2].centavos],
  ];
  for (const [field, flat, fromLine] of projections) {
    if (flat !== fromLine) {
      violations.push(
        `TOTAL CLAIMS COMPLETENESS case ${r.name} ${field}=${flat} drifted from the line it projects (${fromLine})`,
      );
      report.push(`  TOTAL CLAIMS COMPLETENESS  case ${r.name} ${field} drifted from its line`);
    }
  }
}

const [caseA, caseB] = results;
if (caseA && caseB) {
  if (caseA.deadline === caseB.deadline) {
    violations.push(
      `TOTAL CLAIMS COMPLETENESS two different dates of death produced the same statutory deadline ${caseA.deadline}`,
    );
    report.push('  TOTAL CLAIMS COMPLETENESS  the deadline is not a function of the date of death');
  }
  report.push(`  case A deadline ${caseA.deadline}, daysLate ${caseA.daysLate}`);
  report.push(`  case B deadline ${caseB.deadline}, daysLate ${caseB.daysLate}`);
  report.push(`  case C lateness ${results[2]?.output.penalties.lateness.kind}`);
}

// ── Check 5 — LINE MISSING ITS SECTION ──────────────────────────────────────

report.push('## Check 5 — LINE MISSING ITS SECTION');
for (const r of results) {
  for (const line of r.output.penalties.lines) {
    if (line.authority.trim() === '') {
      violations.push(`LINE MISSING ITS SECTION case ${r.name} line ${line.id} has an empty authority`);
      report.push(`  LINE MISSING ITS SECTION  case ${r.name} ${line.id} authority is empty`);
    }
    if (line.status === 'declined') {
      if (line.lawyerDecision === null || line.lawyerDecision.trim() === '') {
        violations.push(
          `LINE MISSING ITS SECTION case ${r.name} declined line ${line.id} has no lawyerDecision`,
        );
        report.push(`  LINE MISSING ITS SECTION  case ${r.name} ${line.id} has no lawyerDecision`);
      }
      if (line.declinedReason === null || line.declinedReason.trim() === '') {
        violations.push(
          `LINE MISSING ITS SECTION case ${r.name} declined line ${line.id} has no declinedReason`,
        );
        report.push(`  LINE MISSING ITS SECTION  case ${r.name} ${line.id} has no declinedReason`);
      }
    } else if (line.lawyerDecision !== null) {
      violations.push(
        `LINE MISSING ITS SECTION case ${r.name} determined line ${line.id} still points at ${line.lawyerDecision}`,
      );
      report.push(
        `  LINE MISSING ITS SECTION  case ${r.name} ${line.id} is determined but still points at a question`,
      );
    }
  }
}
if (caseA) {
  for (const line of caseA.output.penalties.lines) {
    report.push(`  ${line.id.padEnd(20)} authority "${line.authority}"`);
  }
}

// ── Check 6 — DECLINED LINE UNRECORDED ──────────────────────────────────────

report.push('## Check 6 — DECLINED LINE UNRECORDED');
let registryIds: Set<string>;
try {
  const parsed = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8')) as {
    decisions?: { id?: string }[];
  };
  if (!Array.isArray(parsed.decisions)) throw new Error('no decisions array');
  registryIds = new Set(parsed.decisions.map((d) => String(d.id)));
} catch (err) {
  cannotRun(
    `could not parse the decision registry at ${REGISTRY_PATH}: ${err instanceof Error ? err.message : String(err)}`,
  );
}
for (const r of results) {
  for (const line of r.output.penalties.lines) {
    if (line.status !== 'declined' || line.lawyerDecision === null) continue;
    // Existence only, never status. Asserting that the decision is still open
    // would turn this gate red the day the lawyer replies, and a gate whose
    // correct fix is "weaken me" is a gate that gets weakened.
    if (!registryIds.has(line.lawyerDecision)) {
      violations.push(
        `DECLINED LINE UNRECORDED case ${r.name} line ${line.id} points at ${line.lawyerDecision}, which is not in the registry`,
      );
      report.push(
        `  DECLINED LINE UNRECORDED  ${line.lawyerDecision} is not in ${path.basename(REGISTRY_PATH)}`,
      );
    }
  }
}
if (caseA) {
  const matched = caseA.output.penalties.lines
    .map((l) => l.lawyerDecision)
    .filter((id): id is string => id !== null && registryIds.has(id));
  report.push(`  registry ids matched by the declined lines: ${matched.join(', ')}`);
}

// ── Report and verdict ──────────────────────────────────────────────────────

console.log(report.join('\n'));
console.log('');

if (examined === 0) {
  console.log('CORPUS EMPTY — 0 items examined');
  console.log('A gate that examines nothing certifies nothing. This is a failure by construction.');
  skipReport(0);
  process.exit(1);
}

console.log('=========================================================');
console.log(`PENALTY REFUSAL CHECK — ${examined} item(s) examined`);
for (const marker of [
  'SILENT ZERO SURVIVES',
  'WALL CLOCK IN ENGINE',
  'TOTAL CLAIMS COMPLETENESS',
  'LINE MISSING ITS SECTION',
  'RATE INVENTED',
  'DECLINED LINE UNRECORDED',
]) {
  const n = violations.filter((v) => v.startsWith(marker)).length;
  console.log(`  ${marker.padEnd(28)} ${n === 0 ? 'ok' : `${n} violation(s)`}`);
}
console.log('=========================================================');

if (violations.length > 0) {
  for (const v of violations) console.error(v);
  console.log(`PENALTY REFUSAL CHECK FAILED — ${violations.length} violation(s)`);
  skipReport(examined);
  process.exit(1);
}
console.log('PENALTY REFUSAL OK');
skipReport(examined);
process.exit(0);

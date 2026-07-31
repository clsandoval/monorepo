#!/usr/bin/env node
/**
 * check-journey-registry.mjs — the STATIC half of journey verification.
 *
 *   node scripts/check-journey-registry.mjs
 *
 * The live journey gate (G17) needs Docker, a running Supabase stack, a built
 * application and a browser. This one needs none of those: it reads files. That
 * split exists so the most common way for journey coverage to rot — a step
 * declared with no rubric, a rubric naming an assertion kind that does not exist,
 * a reference deleted while its step stayed behind — is caught on a bare runner,
 * loudly, without a container in sight.
 *
 * A static gate that quietly needed Docker would report an environment problem as
 * a product failure, so this script opens NO network connection, launches NO
 * browser, and invokes NO external command. That property is checkable by grep and
 * is asserted by this plan's own acceptance criteria.
 *
 * Violations, each with its own literal marker so a failure says which rule broke:
 *
 *   STEP FIELD INVALID   — unknown field, out-of-set enumerated value, bad id, bad settleMs
 *   DUPLICATE STEP ID    — the same id in more than one record across all registry files
 *   RUBRIC MISSING       — a step's rubric names a file that does not exist
 *   RUBRIC KIND INVALID  — an assertion kind outside ASSERTION_KINDS, or a missing required field
 *   RUBRIC ID MISMATCH   — a rubric's rubricId differs from the step id naming it
 *   REFERENCE MISSING    — references/<stepId>.png or .json is absent
 *   TOLERANCE RAISED     — a sidecar's maxDiffPixels is non-zero with no approvedBy recorded
 *   ORPHAN REFERENCE     — a references/<name>.png whose <name> is not a declared step id
 *   UNKNOWN URL TOKEN    — a uuid-shaped literal in a step url that is neither in fixtures.json
 *                          nor the single declared refusal token
 *
 * TOLERANCE RAISED permits a non-zero tolerance ONLY when approvedBy is recorded.
 * REFERENCES.md allows exactly one measured reason to raise it — a platform whose
 * text rasterisation differs — and requires that whoever raised it be named. An
 * unattributed non-zero tolerance is the silent widening that document prohibits.
 *
 * ASSERTION_KINDS and ACTION_KINDS are IMPORTED, never re-typed. A second copy of a
 * closed set is a second place for it to drift.
 *
 * Dependency-free apart from those two imports: node: builtins only. Exit 0 on
 * zero violations, 1 otherwise. There is no flag that rewrites anything.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { ASSERTION_KINDS } from '../frontend/journey/rubric.mjs';
import { ACTION_KINDS } from '../frontend/journey/actions.mjs';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');

const STEPS_DIR = path.join(APP_DIR, 'frontend', 'journey', 'steps');
const RUBRICS_DIR = path.join(APP_DIR, 'frontend', 'journey', 'rubrics');
const REFERENCES_DIR = path.join(APP_DIR, 'frontend', 'journey', 'references');
const FIXTURES_PATH = path.join(APP_DIR, 'frontend', 'supabase', 'fixtures.json');

/** The requirement ids a Phase 11 journey step may claim. */
const REQUIREMENTS = ['JRNY-02', 'JRNY-03', 'JRNY-04'];
/** The session identities journey/session.mjs can produce. */
const SESSION_KINDS = ['none', 'alpha', 'beta', 'orphan'];
/** Exactly the fields a step record may carry. */
const STEP_FIELDS = [
  'id', 'requirement', 'url', 'session', 'localStorage', 'sessionStorage',
  'reset', 'actions', 'settleMs', 'rubric', 'allowConsoleErrors',
];
/** The reset names journey/resets.mjs exports. */
const RESET_NAMES = ['noop', 'orphan-no-org', 'orphan-invitation-pending'];

/**
 * The one uuid a step url may carry that is deliberately NOT a fixture: the
 * token an invitation must be refused for.
 */
const REFUSAL_TOKEN = '00000000-0000-4000-8000-0000000000ff';

const ID_RE = /^[a-z0-9-]+$/;
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;

/** Required fields per assertion kind, mirroring journey/rubric.mjs. */
const REQUIRED_FIELDS = {
  text_equals: ['selector', 'expect'],
  text_contains: ['selector', 'expect'],
  text_absent: ['selector', 'expect'],
  element_visible: ['selector'],
  element_absent: ['selector'],
  element_count: ['selector', 'expect'],
  attribute_equals: ['selector', 'attr', 'expect'],
  no_console_error: [],
};

const violations = [];
let checks = 0;

function violation(marker, detail) {
  violations.push(`${marker} — ${detail}`);
}
function check() {
  checks += 1;
}

/** Exit 1 with REGISTRY UNREADABLE. Never exit 0 on an internal error. */
function unreadable(message) {
  console.error(`REGISTRY UNREADABLE: ${message}`);
  process.exit(1);
}

// --- read inputs ------------------------------------------------------------

if (!existsSync(STEPS_DIR)) unreadable(`${STEPS_DIR} does not exist`);
if (!existsSync(RUBRICS_DIR)) unreadable(`${RUBRICS_DIR} does not exist`);
if (!existsSync(REFERENCES_DIR)) unreadable(`${REFERENCES_DIR} does not exist`);
if (!existsSync(FIXTURES_PATH)) unreadable(`${FIXTURES_PATH} does not exist`);

let fixturesText;
try {
  fixturesText = readFileSync(FIXTURES_PATH, 'utf8');
} catch (err) {
  unreadable(`could not read ${FIXTURES_PATH}: ${err && err.message}`);
}
const fixtureUuids = new Set(fixturesText.match(UUID_RE) || []);

const steps = [];
for (const file of readdirSync(STEPS_DIR).filter((f) => f.endsWith('.json')).sort()) {
  const full = path.join(STEPS_DIR, file);
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(full, 'utf8'));
  } catch (err) {
    unreadable(`${file} is not parseable JSON: ${err && err.message}`);
  }
  if (!Array.isArray(parsed.steps)) unreadable(`${file} has no 'steps' array`);
  for (const step of parsed.steps) steps.push({ step, file });
}

// --- 1. STEP FIELD INVALID / DUPLICATE STEP ID ------------------------------

const seenIds = new Set();

for (const { step, file } of steps) {
  const where = `${file}:${step.id === undefined ? '<no id>' : step.id}`;

  check();
  for (const key of Object.keys(step)) {
    if (!STEP_FIELDS.includes(key)) violation('STEP FIELD INVALID', `${where} has unknown field '${key}'`);
  }
  for (const key of STEP_FIELDS) {
    if (step[key] === undefined) violation('STEP FIELD INVALID', `${where} is missing field '${key}'`);
  }

  check();
  if (typeof step.id !== 'string' || !ID_RE.test(step.id)) {
    violation('STEP FIELD INVALID', `${where} has an id not matching ^[a-z0-9-]+$`);
  } else if (seenIds.has(step.id)) {
    violation('DUPLICATE STEP ID', `'${step.id}' appears in more than one record`);
  } else {
    seenIds.add(step.id);
  }

  check();
  if (!REQUIREMENTS.includes(step.requirement)) {
    violation('STEP FIELD INVALID', `${where} has requirement '${step.requirement}', not one of ${REQUIREMENTS.join(', ')}`);
  }

  check();
  if (!SESSION_KINDS.includes(step.session)) {
    violation('STEP FIELD INVALID', `${where} has session '${step.session}', not one of ${SESSION_KINDS.join(', ')}`);
  }

  check();
  if (step.reset !== null && !RESET_NAMES.includes(step.reset)) {
    violation('STEP FIELD INVALID', `${where} names reset '${step.reset}', which journey/resets.mjs does not export`);
  }

  check();
  if (!Number.isInteger(step.settleMs) || step.settleMs < 0) {
    violation('STEP FIELD INVALID', `${where} has settleMs '${step.settleMs}', which must be a non-negative integer`);
  }

  check();
  if (!Array.isArray(step.actions)) {
    violation('STEP FIELD INVALID', `${where} has actions that is not an array`);
  } else {
    for (const action of step.actions) {
      if (!ACTION_KINDS.includes(action && action.kind)) {
        violation('STEP FIELD INVALID', `${where} has action kind '${action && action.kind}', not one of ${ACTION_KINDS.join(', ')}`);
      }
    }
  }

  // --- UNKNOWN URL TOKEN ---
  check();
  for (const uuid of String(step.url || '').match(UUID_RE) || []) {
    if (!fixtureUuids.has(uuid) && uuid !== REFUSAL_TOKEN) {
      violation(
        'UNKNOWN URL TOKEN',
        `${where} url carries ${uuid}, which is neither in supabase/fixtures.json nor the declared refusal token ${REFUSAL_TOKEN}`,
      );
    }
  }

  // --- RUBRIC MISSING / RUBRIC KIND INVALID / RUBRIC ID MISMATCH ---
  check();
  const rubricPath = path.join(RUBRICS_DIR, String(step.rubric));
  if (!existsSync(rubricPath)) {
    violation('RUBRIC MISSING', `${where} names rubric '${step.rubric}', which is not in journey/rubrics/`);
  } else {
    let rubric;
    try {
      rubric = JSON.parse(readFileSync(rubricPath, 'utf8'));
    } catch (err) {
      violation('RUBRIC KIND INVALID', `${where} rubric '${step.rubric}' is not parseable: ${err && err.message}`);
      rubric = null;
    }
    if (rubric) {
      check();
      if (rubric.rubricId !== step.id) {
        violation('RUBRIC ID MISMATCH', `rubric '${step.rubric}' declares rubricId '${rubric.rubricId}' but is named by step '${step.id}'`);
      }
      check();
      if (!Array.isArray(rubric.assertions) || rubric.assertions.length === 0) {
        violation('RUBRIC KIND INVALID', `rubric '${step.rubric}' has no assertions array`);
      } else {
        for (const a of rubric.assertions) {
          if (!ASSERTION_KINDS.includes(a && a.kind)) {
            violation('RUBRIC KIND INVALID', `rubric '${step.rubric}' assertion '${a && a.id}' has kind '${a && a.kind}', not one of ${ASSERTION_KINDS.join(', ')}`);
            continue;
          }
          for (const field of REQUIRED_FIELDS[a.kind]) {
            if (a[field] === undefined) {
              violation('RUBRIC KIND INVALID', `rubric '${step.rubric}' assertion '${a.id}' of kind '${a.kind}' omits required field '${field}'`);
            }
          }
        }
      }
    }
  }

  // --- REFERENCE MISSING / TOLERANCE RAISED ---
  check();
  const pngPath = path.join(REFERENCES_DIR, `${step.id}.png`);
  const sidecarPath = path.join(REFERENCES_DIR, `${step.id}.json`);
  if (!existsSync(pngPath)) {
    violation('REFERENCE MISSING', `step '${step.id}' has no approved reference at journey/references/${step.id}.png`);
  }
  if (!existsSync(sidecarPath)) {
    violation('REFERENCE MISSING', `step '${step.id}' has no tolerance sidecar at journey/references/${step.id}.json`);
  } else {
    check();
    let sidecar;
    try {
      sidecar = JSON.parse(readFileSync(sidecarPath, 'utf8'));
    } catch (err) {
      violation('REFERENCE MISSING', `sidecar for '${step.id}' is not parseable: ${err && err.message}`);
      sidecar = null;
    }
    if (sidecar && sidecar.maxDiffPixels !== 0) {
      if (!sidecar.approvedBy) {
        violation(
          'TOLERANCE RAISED',
          `step '${step.id}' has maxDiffPixels ${sidecar.maxDiffPixels} with no approvedBy recorded`,
        );
      }
    }
  }
}

// --- ORPHAN REFERENCE -------------------------------------------------------

const referencePngs = readdirSync(REFERENCES_DIR).filter((f) => f.endsWith('.png'));
for (const png of referencePngs) {
  check();
  const name = png.slice(0, -'.png'.length);
  if (!seenIds.has(name)) {
    violation('ORPHAN REFERENCE', `journey/references/${png} has no declared step '${name}'`);
  }
}

// --- verdict ----------------------------------------------------------------

console.log(`GATE-SKIPS total=${checks} skipped=0`);

if (violations.length > 0) {
  for (const v of violations) console.error(v);
  process.exit(1);
}

console.log(`JOURNEY REGISTRY ok steps=${seenIds.size} references=${referencePngs.length}`);
process.exit(0);

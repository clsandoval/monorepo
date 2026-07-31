#!/usr/bin/env node
/*
 * journey/run.mjs — the live journey runner.
 *
 * Phase 10 built a harness that only ever saw committed HTML fixtures. This is
 * the thing that points it at the real application, backed by the real database:
 * build, serve, drive headless chromium through a declared step, evaluate the
 * rubric, compare against the reference image, write artifacts, report.
 *
 * THIS FILE NEVER PROMOTES A REFERENCE. It imports no module that writes into
 * `journey/references/` and contains no such write itself. A gate able to
 * overwrite its own reference could go green by rewriting its own expectation,
 * and the change would never appear in front of a human. Reference promotion is
 * a separate, human-invoked command — see `journey/REFERENCES.md`. The literal
 * substring naming that command is deliberately absent from this file so the
 * property is checkable by grep.
 *
 * Usage, from `frontend/`:
 *   node journey/run.mjs --all
 *   node journey/run.mjs --step <stepId>      # repeatable
 *   node journey/run.mjs --list               # print ids, exit 0, start nothing
 *
 * Exit codes:
 *   0 — every selected step passed.  `JOURNEY PASS steps=<n> failed=0`
 *   1 — at least one step failed.    `JOURNEY FAIL steps=<n> failed=<k>`
 *   2 — the run could not START.     `JOURNEY CANNOT RUN: <reason>`
 *
 * The 0/1/2 split is this project's established three-valued contract (GATES.md
 * §2): "could not run" must never be reported as "ran and found nothing wrong".
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ACTION_KINDS, runAction } from './actions.mjs';
import { newRunStamp, writeStepArtifacts } from './artifacts.mjs';
import { captureScreenshot, launchBrowser, newJourneyPage } from './browser.mjs';
import { DIFF_MARKERS, compareToReference } from './diff.mjs';
import { RESETS } from './resets.mjs';
import { evaluateRubric, validateRubric } from './rubric.mjs';
import {
  seedAuthSession,
  seedLocalStorage,
  seedSessionStorage,
} from './seed.mjs';
import { JourneyCannotRun, buildApp, startPreview } from './serve.mjs';
import { SESSION_KINDS, adminClient, getSession, readStackEnv } from './session.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const STEPS_DIR = path.join(HERE, 'steps');
const RUBRICS_DIR = path.join(HERE, 'rubrics');
const REFERENCES_DIR = path.join(HERE, 'references');
const FIXTURES_DIR = path.join(HERE, 'fixtures');

/** The requirement ids a step in this phase's registry may claim. */
const REQUIREMENTS = Object.freeze(['JRNY-02', 'JRNY-03', 'JRNY-04']);

/** Exactly the fields a step record may carry. An extra field is rejected. */
const STEP_FIELDS = Object.freeze([
  'id',
  'requirement',
  'url',
  'session',
  'localStorage',
  'sessionStorage',
  'reset',
  'actions',
  'settleMs',
  'rubric',
  'allowConsoleErrors',
]);

const ID_RE = /^[a-z0-9-]+$/;

function cannotRun(reason) {
  console.error(`JOURNEY CANNOT RUN: ${reason}`);
  process.exit(2);
}

function invalid(detail) {
  throw new Error(`STEPS INVALID: ${detail}`);
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

/**
 * Read every `*.json` under `journey/steps/`, in alphabetical file order, and
 * concatenate their `steps` arrays. One file per requirement group is what keeps
 * three plans out of each other's way.
 */
function readRegistry() {
  if (!fs.existsSync(STEPS_DIR)) invalid(`${STEPS_DIR} does not exist`);

  const files = fs
    .readdirSync(STEPS_DIR)
    .filter((f) => f.endsWith('.json'))
    .sort();

  const steps = [];
  for (const file of files) {
    const full = path.join(STEPS_DIR, file);
    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(full, 'utf8'));
    } catch (err) {
      invalid(`${file} is not parseable JSON: ${err && err.message}`);
    }
    if (!Array.isArray(parsed.steps)) invalid(`${file} has no 'steps' array`);
    for (const step of parsed.steps) steps.push({ ...step, __file: file });
  }
  return steps;
}

/** Reject anything the runner would otherwise have to guess about. */
function validateRegistry(steps) {
  const seen = new Set();

  for (const step of steps) {
    const where = `${step.__file}:${step.id === undefined ? '<no id>' : step.id}`;

    for (const key of Object.keys(step)) {
      if (key === '__file') continue;
      if (!STEP_FIELDS.includes(key)) invalid(`${where} has unknown field '${key}'`);
    }
    for (const key of STEP_FIELDS) {
      if (step[key] === undefined) invalid(`${where} is missing required field '${key}'`);
    }

    if (typeof step.id !== 'string' || !ID_RE.test(step.id)) {
      invalid(`${where} has an id that does not match ^[a-z0-9-]+$`);
    }
    if (seen.has(step.id)) invalid(`duplicate step id '${step.id}'`);
    seen.add(step.id);

    if (!REQUIREMENTS.includes(step.requirement)) {
      invalid(`${where} has requirement '${step.requirement}', not one of ${REQUIREMENTS.join(', ')}`);
    }
    if (typeof step.url !== 'string' || !step.url.startsWith('/')) {
      invalid(`${where} has url '${step.url}', which must begin with '/'`);
    }
    if (!SESSION_KINDS.includes(step.session)) {
      invalid(`${where} has session '${step.session}', not one of ${SESSION_KINDS.join(', ')}`);
    }
    for (const [field, value] of [
      ['localStorage', step.localStorage],
      ['sessionStorage', step.sessionStorage],
    ]) {
      if (value === null || typeof value !== 'object' || Array.isArray(value)) {
        invalid(`${where} has ${field} that is not an object`);
      }
      for (const [k, v] of Object.entries(value)) {
        if (typeof v !== 'string') invalid(`${where} ${field}['${k}'] is not a string`);
      }
    }
    if (step.reset !== null && !Object.prototype.hasOwnProperty.call(RESETS, step.reset)) {
      invalid(`${where} names reset '${step.reset}', which journey/resets.mjs does not export`);
    }
    if (!Array.isArray(step.actions)) invalid(`${where} has actions that is not an array`);
    for (const action of step.actions) {
      if (!ACTION_KINDS.includes(action && action.kind)) {
        invalid(`${where} has action kind '${action && action.kind}', not one of ${ACTION_KINDS.join(', ')}`);
      }
    }
    if (!Number.isInteger(step.settleMs) || step.settleMs < 0) {
      invalid(`${where} has settleMs '${step.settleMs}', which must be a non-negative integer`);
    }
    if (typeof step.rubric !== 'string') invalid(`${where} has a rubric that is not a string`);
    const rubricPath = path.join(RUBRICS_DIR, step.rubric);
    if (!fs.existsSync(rubricPath)) invalid(`${where} names rubric '${step.rubric}', which does not exist`);
    try {
      validateRubric(JSON.parse(fs.readFileSync(rubricPath, 'utf8')));
    } catch (err) {
      invalid(`${where} rubric '${step.rubric}' is invalid: ${err && err.message}`);
    }
    if (typeof step.allowConsoleErrors !== 'boolean') {
      invalid(`${where} has allowConsoleErrors that is not a boolean`);
    }
  }
  return steps;
}

/** `@file:<name>` resolves to the contents of `journey/fixtures/<name>`. */
function resolveStorage(entries, where) {
  const out = {};
  for (const [k, v] of Object.entries(entries)) {
    if (v.startsWith('@file:')) {
      const name = v.slice('@file:'.length);
      const full = path.join(FIXTURES_DIR, name);
      if (!fs.existsSync(full)) invalid(`${where} references @file:${name}, which does not exist`);
      out[k] = fs.readFileSync(full, 'utf8');
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { all: false, list: false, stepIds: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--all') {
      args.all = true;
    } else if (token === '--list') {
      args.list = true;
    } else if (token === '--step') {
      const value = argv[i + 1];
      if (!value) cannotRun('--step requires a step id');
      args.stepIds.push(value);
      i += 1;
    } else {
      cannotRun(`unknown argument '${token}'`);
    }
  }
  if (!args.all && !args.list && args.stepIds.length === 0) {
    cannotRun('nothing selected: pass --all, --step <id> or --list');
  }
  return args;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// ---------------------------------------------------------------------------
// One step
// ---------------------------------------------------------------------------

async function runStep({ browser, origin, stackEnv, admin, runStamp, step }) {
  const markers = [];

  // 1. Reset. Declared by name; the registry validator already proved the name exists.
  if (step.reset !== null) {
    await RESETS[step.reset](admin);
  }

  const page = await newJourneyPage(browser);
  try {
    // 2. Seed BEFORE first paint. src/main.tsx reads the session on mount, so a
    //    session installed after navigation would arrive one render too late.
    if (step.session !== 'none') {
      const session = await getSession(stackEnv, step.session);
      await seedAuthSession(page, origin, session);
    }
    const local = resolveStorage(step.localStorage, step.id);
    const sess = resolveStorage(step.sessionStorage, step.id);
    if (Object.keys(local).length > 0) await seedLocalStorage(page, origin, local);
    if (Object.keys(sess).length > 0) await seedSessionStorage(page, origin, sess);

    // 3. Navigate.
    await page.goto(`${origin}${step.url}`, { waitUntil: 'load' });
    await sleep(step.settleMs);

    // 4. Actions.
    for (const action of step.actions) {
      await runAction(page, action);
    }
    await sleep(step.settleMs);

    // 5. Capture.
    const actualPng = await captureScreenshot(page);

    // 6. Rubric — the content check.
    const rubric = JSON.parse(fs.readFileSync(path.join(RUBRICS_DIR, step.rubric), 'utf8'));
    const rubricResult = await evaluateRubric(page, rubric);

    // 7. Diff — the layout check. Kept separate from the rubric on purpose.
    const diffResult = compareToReference(actualPng, step.id, REFERENCES_DIR);

    const referencePngPath = path.join(REFERENCES_DIR, `${step.id}.png`);
    const referencePng = fs.existsSync(referencePngPath)
      ? fs.readFileSync(referencePngPath)
      : null;

    writeStepArtifacts({
      runStamp,
      stepId: step.id,
      actualPng,
      referencePng,
      rubricResult,
      diffResult,
    });

    if (!rubricResult.passed) markers.push(DIFF_MARKERS.RUBRIC_FAILURE);
    if (diffResult.status === 'fail') markers.push(...diffResult.markers);

    // A console error is a step failure in its own right unless the step opts
    // out; the rubric's no_console_error assertion covers the usual case.
    const consoleErrors = page.__journeyConsoleErrors || [];
    if (!step.allowConsoleErrors && consoleErrors.length > 0
        && !markers.includes(DIFF_MARKERS.RUBRIC_FAILURE)) {
      markers.push(DIFF_MARKERS.RUBRIC_FAILURE);
    }

    return { passed: markers.length === 0, markers };
  } catch (err) {
    return {
      passed: false,
      markers: [`${DIFF_MARKERS.STEP_ERROR} ${err && err.message ? err.message : String(err)}`],
    };
  } finally {
    await page.close().catch(() => {});
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));

  let registry;
  try {
    registry = validateRegistry(readRegistry());
  } catch (err) {
    cannotRun(err && err.message ? err.message : String(err));
  }

  // --list starts nothing: no build, no server, no browser.
  if (args.list) {
    for (const step of registry) console.log(step.id);
    process.exit(0);
  }

  let selected;
  if (args.all) {
    selected = registry;
  } else {
    selected = [];
    for (const id of args.stepIds) {
      const found = registry.find((s) => s.id === id);
      if (!found) cannotRun(`--step '${id}' is not in the registry`);
      selected.push(found);
    }
  }

  // FAIL-CLOSED INJECTION HOOK. The only environment variable this runner reads.
  // It can force a cannot-run and NOTHING else — it can never turn a red run
  // green. Same rule scripts/ci-gates.sh applies to its injection variables.
  const stackEnv = process.env.JOURNEY_FORCE_NO_STACK === '1' ? null : readStackEnv();
  if (stackEnv === null || !stackEnv.API_URL) {
    cannotRun('local Supabase stack is not running');
  }

  let preview = null;
  let browser = null;
  let failed = 0;

  try {
    await buildApp();
    preview = await startPreview();
    try {
      browser = await launchBrowser();
    } catch (err) {
      throw new JourneyCannotRun(
        `chromium is not installed or failed to launch: ${err && err.message ? err.message : err}`,
      );
    }

    const admin = adminClient(stackEnv);
    const runStamp = newRunStamp();

    for (const step of selected) {
      const result = await runStep({
        browser,
        origin: preview.origin,
        stackEnv,
        admin,
        runStamp,
        step,
      });
      if (!result.passed) {
        failed += 1;
        console.error(`JOURNEY STEP FAILED ${step.id}: ${result.markers.join(' ')}`);
      }
    }
  } catch (err) {
    if (err instanceof JourneyCannotRun) {
      // Cleanup still has to happen before exiting.
      if (browser) await browser.close().catch(() => {});
      if (preview) await preview.stop().catch(() => {});
      cannotRun(err.reason);
    }
    throw err;
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (preview) await preview.stop().catch(() => {});
  }

  // Printed on BOTH the pass and the fail path — scripts/check-gate-skips.mjs
  // reads this line out of the gate log regardless of outcome. It is deliberately
  // NOT printed on the cannot-run path, where no step was ever selected.
  console.log(`GATE-SKIPS total=${selected.length} skipped=0`);

  if (failed > 0) {
    console.error(`JOURNEY FAIL steps=${selected.length} failed=${failed}`);
    process.exit(1);
  }
  console.log(`JOURNEY PASS steps=${selected.length} failed=0`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`JOURNEY STEP FAILED <runner>: ${DIFF_MARKERS.STEP_ERROR} ${err && err.stack ? err.stack : err}`);
  process.exit(1);
});

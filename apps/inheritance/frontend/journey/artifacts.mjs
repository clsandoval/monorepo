/*
 * journey/artifacts.mjs — the ONLY module that writes journey artifacts.
 *
 * JRNY-12: every gate failure must write the screenshot, the diff image and the
 * failing assertion text to a durable, inspectable location. At 3am, unattended,
 * the artifact is the only evidence that will still exist tomorrow — so the record
 * has to be diagnostic, not a bare "failed".
 *
 * The layout below is depended on by `approve.mjs`, which reads
 * `<newest run>/<stepId>/actual.png` when a reference is legitimately re-approved.
 * `<runStamp>` is an ISO timestamp with `:` and `.` replaced, chosen precisely so
 * that LEXICAL DESCENDING ORDER EQUALS NEWEST-FIRST — that is what makes
 * `approve.mjs`'s "newest run" selection a sort rather than a stat call.
 *
 * This module writes nothing outside ARTIFACT_ROOT. In particular it never writes
 * into the approved-image store; only `approve.mjs` does.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(HERE, '..');

/** Absolute path of frontend/.journey-runs — gitignored, per-run detail. */
export const ARTIFACT_ROOT = path.join(FRONTEND_ROOT, '.journey-runs');

/**
 * Retention cap. A month-long unattended loop must not fill the disk with PNGs,
 * so only this many run directories survive.
 */
export const MAX_RETAINED_RUNS = 20;

/** `2026-07-31T09-12-33-441Z` — sorts newest-last ascending, newest-first descending. */
export function newRunStamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function pruneOldRuns() {
  if (!fs.existsSync(ARTIFACT_ROOT)) return;
  const runs = fs
    .readdirSync(ARTIFACT_ROOT, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
    .reverse();
  for (const stale of runs.slice(MAX_RETAINED_RUNS)) {
    fs.rmSync(path.join(ARTIFACT_ROOT, stale), { recursive: true, force: true });
  }
}

function failureText({ runStamp, stepId, stepDir, markers, rubricResult, diffResult }) {
  const lines = [];
  lines.push(markers.join(' '));
  lines.push(`Step: ${stepId}`);
  lines.push(`Run: ${runStamp}`);

  if (rubricResult && rubricResult.passed === false) {
    for (const a of rubricResult.assertions.filter((x) => !x.passed)) {
      lines.push(
        `FAILED ${a.id} kind=${a.kind} expected=${JSON.stringify(a.expected)} actual=${JSON.stringify(a.actual)}`,
      );
    }
  }
  if (diffResult && diffResult.status === 'fail') {
    lines.push(`DIFF diffPixels=${diffResult.diffPixels} maxDiffPixels=${diffResult.maxDiffPixels}`);
  }

  lines.push(`Artifacts: ${stepDir}`);
  return `${lines.join('\n')}\n`;
}

/**
 * Write one step's artifacts. Returns the step directory path.
 *
 * @param {{runStamp:string, stepId:string, actualPng:Buffer, referencePng?:Buffer|null, rubricResult?:object|null, diffResult?:object|null}} args
 * @returns {string}
 */
export function writeStepArtifacts({
  runStamp,
  stepId,
  actualPng,
  referencePng = null,
  rubricResult = null,
  diffResult = null,
}) {
  const stepDir = path.join(ARTIFACT_ROOT, runStamp, stepId);
  fs.mkdirSync(stepDir, { recursive: true });

  // Always.
  fs.writeFileSync(path.join(stepDir, 'actual.png'), actualPng);
  fs.writeFileSync(
    path.join(stepDir, 'assertions.json'),
    `${JSON.stringify(rubricResult, null, 2)}\n`,
    'utf8',
  );

  // When available.
  if (Buffer.isBuffer(referencePng)) {
    fs.writeFileSync(path.join(stepDir, 'reference.png'), referencePng);
  }
  if (diffResult && Buffer.isBuffer(diffResult.diffPng)) {
    fs.writeFileSync(path.join(stepDir, 'diff.png'), diffResult.diffPng);
  }

  // Only on failure. A step fails when the rubric failed, the diff failed, or both —
  // and when both, BOTH marker sets appear on line 1. Collapsing them would destroy
  // the rubric-versus-diff distinction the whole mechanism exists to preserve.
  const markers = [];
  if (rubricResult && rubricResult.passed === false) markers.push('RUBRIC FAILURE');
  if (diffResult && diffResult.status === 'fail') markers.push(...diffResult.markers);

  if (markers.length > 0) {
    fs.writeFileSync(
      path.join(stepDir, 'FAILURE.txt'),
      failureText({ runStamp, stepId, stepDir, markers, rubricResult, diffResult }),
      'utf8',
    );
  }

  pruneOldRuns();
  return stepDir;
}

/*
 * journey/artifacts-probe.mjs — induce a REAL double failure and inspect the disk.
 *
 * The three wave-2 mechanisms are composed here for the first time: a rubric that
 * fails, a perceptual diff that fails, and the artifact writer that has to record
 * BOTH. The load-bearing assertion is on FAILURE.txt's first line: it must name
 * `RUBRIC FAILURE` and `DIFF FAILURE` together. A record naming only one of the two
 * would defeat JRNY-10's whole point — a reader could no longer tell a stale
 * reference from a wrong number.
 *
 * The final section closes the seam neither 10-03 nor 10-04 could verify alone:
 * `approve.mjs` was written before the artifact layout existed, so this probe
 * drives it against a real artifact and then DELETES what it approved, because
 * `journey/references/` must ship holding only `.gitkeep`.
 *
 * Exits non-zero on any assertion failure.
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { launchBrowser, newJourneyPage, captureScreenshot } from './browser.mjs';
import { evaluateRubric } from './rubric.mjs';
import { compareToReference } from './diff.mjs';
import { newRunStamp, writeStepArtifacts } from './artifacts.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(HERE, '..');
const BASIC = path.join(HERE, 'fixtures', 'basic.html');
const MUTATED = path.join(HERE, 'fixtures', 'mutated.html');
const RUBRIC = JSON.parse(fs.readFileSync(path.join(HERE, 'rubrics', 'fixture-basic.json'), 'utf8'));
const REFERENCES_DIR = path.join(HERE, 'references');

const STEP_ID = 'probe-both-failed';
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47]);

function assertPng(filePath) {
  const stat = fs.statSync(filePath);
  assert.ok(stat.size > 0, `${filePath} is empty`);
  const head = Buffer.alloc(4);
  const fd = fs.openSync(filePath, 'r');
  fs.readSync(fd, head, 0, 4, 0);
  fs.closeSync(fd);
  assert.ok(
    Buffer.compare(head, PNG_SIGNATURE) === 0,
    `${filePath} does not begin with the PNG signature (got ${head.toString('hex')})`,
  );
}

async function main() {
  const tempRefs = fs.mkdtempSync(path.join(os.tmpdir(), 'journey-artifacts-probe-'));
  const browser = await launchBrowser();
  try {
    // 1. Capture basic.html and make it the reference in a TEMP directory.
    const basicPage = await newJourneyPage(browser);
    await basicPage.goto(pathToFileURL(BASIC).href);
    const referencePng = await captureScreenshot(basicPage);
    await basicPage.close();

    fs.writeFileSync(path.join(tempRefs, `${STEP_ID}.png`), referencePng);
    fs.writeFileSync(
      path.join(tempRefs, `${STEP_ID}.json`),
      JSON.stringify({ maxDiffPixels: 0, approvedOn: '2026-07-31', approvedBy: 'artifacts-probe' }),
      'utf8',
    );

    // 2. Capture mutated.html and evaluate the SAME rubric → rubric failure.
    const mutatedPage = await newJourneyPage(browser);
    await mutatedPage.goto(pathToFileURL(MUTATED).href);
    const actualPng = await captureScreenshot(mutatedPage);
    const rubricResult = await evaluateRubric(mutatedPage, RUBRIC);
    assert.equal(rubricResult.passed, false, 'the mutated fixture must fail the basic rubric');

    // 3. Compare against the reference → diff failure.
    const diffResult = compareToReference(actualPng, STEP_ID, tempRefs);
    assert.equal(diffResult.status, 'fail', 'the mutated capture must fail the diff');

    // 4. Write the artifacts.
    const runStamp = newRunStamp();
    const stepDir = writeStepArtifacts({
      runStamp,
      stepId: STEP_ID,
      actualPng,
      referencePng,
      rubricResult,
      diffResult,
    });

    // 5. Five files, all non-empty; three valid PNGs.
    for (const name of ['actual.png', 'reference.png', 'diff.png', 'assertions.json', 'FAILURE.txt']) {
      const p = path.join(stepDir, name);
      assert.ok(fs.existsSync(p), `${name} was not written`);
      assert.ok(fs.statSync(p).size > 0, `${name} is empty`);
    }
    for (const name of ['actual.png', 'reference.png', 'diff.png']) {
      assertPng(path.join(stepDir, name));
    }

    // 6. THE load-bearing assertion: both mechanisms named on line 1.
    const failureText = fs.readFileSync(path.join(stepDir, 'FAILURE.txt'), 'utf8');
    const firstLine = failureText.split('\n')[0];
    assert.ok(
      firstLine.includes('RUBRIC FAILURE'),
      `FAILURE.txt line 1 does not name RUBRIC FAILURE: "${firstLine}"`,
    );
    assert.ok(
      firstLine.includes('DIFF FAILURE'),
      `FAILURE.txt line 1 does not name DIFF FAILURE: "${firstLine}"`,
    );

    // 7. Per-assertion and per-diff detail.
    assert.ok(/^FAILED \S+ kind=/m.test(failureText), 'FAILURE.txt has no FAILED <id> line');
    assert.ok(/^DIFF diffPixels=\d+/m.test(failureText), 'FAILURE.txt has no DIFF diffPixels= line');

    // 8. assertions.json round-trips.
    const parsed = JSON.parse(fs.readFileSync(path.join(stepDir, 'assertions.json'), 'utf8'));
    assert.equal(parsed.assertions.length, 8, 'assertions.json must carry all 8 assertion results');

    // 9. Approval round-trip against the REAL artifact layout.
    const approveOut = execFileSync(
      process.execPath,
      [path.join(HERE, 'approve.mjs'), STEP_ID, '--by', 'probe'],
      { cwd: FRONTEND_ROOT, encoding: 'utf8' },
    );
    assert.ok(
      approveOut.includes(`APPROVED ${STEP_ID}`),
      `expected an APPROVED line, got: ${approveOut}`,
    );

    const approvedPng = path.join(REFERENCES_DIR, `${STEP_ID}.png`);
    const approvedJson = path.join(REFERENCES_DIR, `${STEP_ID}.json`);
    assert.ok(fs.existsSync(approvedPng), 'approve.mjs did not write the reference PNG');
    assert.ok(fs.existsSync(approvedJson), 'approve.mjs did not write the sidecar');
    const sidecar = JSON.parse(fs.readFileSync(approvedJson, 'utf8'));
    assert.equal(sidecar.maxDiffPixels, 0);
    assert.equal(sidecar.approvedBy, 'probe');
    assert.match(sidecar.approvedOn, /^\d{4}-\d{2}-\d{2}$/);

    // 10. Remove what was approved — references/ must ship holding only .gitkeep.
    fs.rmSync(approvedPng);
    fs.rmSync(approvedJson);
    assert.ok(!fs.existsSync(approvedPng), 'the approved PNG was not cleaned up');
    assert.ok(!fs.existsSync(approvedJson), 'the approved sidecar was not cleaned up');

    const failedAssertions = rubricResult.failedCount;
    console.log(
      `ARTIFACTS-PROBE ok files=5 markers=both failedAssertions=${failedAssertions} ` +
        `diffPixels=${diffResult.diffPixels} approveRoundTrip=true`,
    );
  } finally {
    await browser.close();
    fs.rmSync(tempRefs, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(`ARTIFACTS-PROBE FAILED: ${err && err.message ? err.message : err}`);
  process.exit(1);
});

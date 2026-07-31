/*
 * journey/diff-probe.mjs — proof that the comparator produces all four outcomes.
 *
 * Operates entirely inside a temp directory created with `fs.mkdtempSync`, so it
 * never touches `frontend/journey/references/`. A probe that wrote into the real
 * reference store would itself be the thing this mechanism exists to prevent.
 *
 * Exits non-zero on any assertion failure.
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { PNG } from 'pngjs';

import { launchBrowser, newJourneyPage, captureScreenshot } from './browser.mjs';
import { compareToReference, DIFF_MARKERS } from './diff.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASIC = path.join(HERE, 'fixtures', 'basic.html');
const MUTATED = path.join(HERE, 'fixtures', 'mutated.html');

const STEP_ID = 'probe-step';

async function capture(browser, fixturePath) {
  const page = await newJourneyPage(browser);
  await page.goto(pathToFileURL(fixturePath).href);
  const buffer = await captureScreenshot(page);
  await page.close();
  return buffer;
}

async function main() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'journey-diff-probe-'));
  const browser = await launchBrowser();
  try {
    const basicPng = await capture(browser, BASIC);
    const mutatedPng = await capture(browser, MUTATED);

    // --- 1. REFERENCE MISSING ---------------------------------------------
    const missing = compareToReference(basicPng, STEP_ID, tempDir);
    assert.equal(missing.status, 'fail', 'an absent reference must fail');
    assert.ok(
      missing.markers.includes(DIFF_MARKERS.REFERENCE_MISSING),
      `expected REFERENCE MISSING, got [${missing.markers.join(', ')}]`,
    );
    assert.equal(missing.diffPixels, null, 'no pixel comparison is possible without a reference');

    // --- 2. pass (zero differing pixels) -----------------------------------
    fs.writeFileSync(path.join(tempDir, `${STEP_ID}.png`), basicPng);
    fs.writeFileSync(
      path.join(tempDir, `${STEP_ID}.json`),
      JSON.stringify({ maxDiffPixels: 0, approvedOn: '2026-07-31', approvedBy: 'diff-probe' }),
      'utf8',
    );
    const pass = compareToReference(basicPng, STEP_ID, tempDir);
    assert.equal(pass.status, 'pass', `expected a pass, got [${pass.markers.join(', ')}]`);
    assert.equal(pass.markers.length, 0);
    // A same-image comparison MUST report exactly zero differing pixels. A nonzero
    // count here would mean the capture is not deterministic and the whole
    // mechanism is unusable — the fix is never to raise maxDiffPixels.
    assert.equal(pass.diffPixels, 0, `same-image comparison reported ${pass.diffPixels} differing pixels`);

    // --- 3. DIFF FAILURE ----------------------------------------------------
    const failure = compareToReference(mutatedPng, STEP_ID, tempDir);
    assert.equal(failure.status, 'fail');
    assert.ok(
      failure.markers.includes(DIFF_MARKERS.DIFF_FAILURE),
      `expected DIFF FAILURE, got [${failure.markers.join(', ')}]`,
    );
    assert.ok(failure.diffPixels > 0, `expected a nonzero diff, got ${failure.diffPixels}`);
    assert.ok(Buffer.isBuffer(failure.diffPng), 'diffPng must be a Buffer when a pixel comparison ran');
    assert.ok(
      failure.diffPng.length > 1000,
      `diff image is suspiciously small: ${failure.diffPng.length} bytes`,
    );

    // --- 4. REFERENCE SIZE MISMATCH ----------------------------------------
    const tiny = new PNG({ width: 10, height: 10 });
    fs.writeFileSync(path.join(tempDir, `${STEP_ID}.png`), PNG.sync.write(tiny));
    const mismatch = compareToReference(basicPng, STEP_ID, tempDir);
    assert.equal(mismatch.status, 'fail');
    assert.ok(
      mismatch.markers.includes(DIFF_MARKERS.REFERENCE_SIZE_MISMATCH),
      `expected REFERENCE SIZE MISMATCH, got [${mismatch.markers.join(', ')}]`,
    );
    assert.equal(
      mismatch.diffPixels,
      null,
      'no pixel comparison may be attempted at mismatched dimensions',
    );

    // --- 5. approve.mjs refuses --------------------------------------------
    let approveExit = 0;
    try {
      execFileSync(process.execPath, [path.join(HERE, 'approve.mjs'), 'no-such-step'], {
        stdio: 'pipe',
        cwd: path.resolve(HERE, '..'),
      });
    } catch (err) {
      approveExit = err.status;
    }
    assert.ok(approveExit !== 0, 'approve.mjs must exit nonzero when no artifact exists');

    console.log(
      `DIFF-PROBE ok missing=true pass=true diff=${failure.diffPixels} sizeMismatch=true approveRefused=true`,
    );
  } finally {
    await browser.close();
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(`DIFF-PROBE FAILED: ${err && err.message ? err.message : err}`);
  process.exit(1);
});

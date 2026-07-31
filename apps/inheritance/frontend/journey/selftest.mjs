/*
 * journey/selftest.mjs — gate G15. Proves the journey harness still works.
 *
 * Composes the four probe mechanisms into eleven named cases: the rubric evaluator,
 * the perceptual comparator, the artifact writer and the seeding seams. Every case
 * runs even after one fails — failures are collected, not short-circuited, for the
 * same reason plan 10-02 requires the rubric to evaluate every assertion: a check
 * that stops at its first failure tells you one thing when it could have told you
 * four.
 *
 * Boundary, deliberate: no Docker, no Supabase, no built application, no network.
 * Everything here asserts against the committed fixtures under journey/fixtures/.
 * Anything needing more belongs to Phase 11.
 *
 * Never writes into journey/references/ — every case needing a reference directory
 * uses fs.mkdtempSync and removes it. The gate never invokes the approval command
 * for an approval; the single reference to it below is the child-process REFUSAL
 * case, which asserts a nonzero exit.
 *
 * Exit contract:
 *   0 — every case passed
 *   1 — a case failed; each failing case is named on stdout
 *   2 — could not run: chromium is not installed
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { PNG } from 'pngjs';

import { launchBrowser, newJourneyPage, captureScreenshot } from './browser.mjs';
import { ASSERTION_KINDS, evaluateRubric } from './rubric.mjs';
import { compareToReference, DIFF_MARKERS } from './diff.mjs';
import { newRunStamp, writeStepArtifacts } from './artifacts.mjs';
import {
  INTAKE_DRAFT_KEY,
  QUICK_CALC_KEY,
  seedLocalStorage,
  seedSessionStorage,
  seedSearchParams,
} from './seed.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(HERE, '..');
const BASIC = path.join(HERE, 'fixtures', 'basic.html');
const MUTATED = path.join(HERE, 'fixtures', 'mutated.html');
const RUBRIC = JSON.parse(fs.readFileSync(path.join(HERE, 'rubrics', 'fixture-basic.json'), 'utf8'));

const PORT = 4173;
const ORIGIN = `http://127.0.0.1:${PORT}`;

function withTempRefs(fn) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'journey-selftest-'));
  try {
    return fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

async function main() {
  let browser;
  try {
    browser = await launchBrowser();
  } catch (err) {
    const msg = String(err && err.message ? err.message : err);
    if (/Executable doesn'?t exist|browserType.launch|playwright install/i.test(msg)) {
      console.error(
        'JOURNEY SELFTEST cannot-run: chromium is not installed; run npx playwright install chromium',
      );
      process.exit(2);
    }
    throw err;
  }

  const server = await new Promise((resolve) => {
    const html = fs.readFileSync(BASIC);
    const s = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    });
    s.listen(PORT, '127.0.0.1', () => resolve(s));
  });

  // Shared captures, taken once through the single browser.
  const basicPage = await newJourneyPage(browser);
  await basicPage.goto(pathToFileURL(BASIC).href);
  const basicPng = await captureScreenshot(basicPage);

  const mutatedPage = await newJourneyPage(browser);
  await mutatedPage.goto(pathToFileURL(MUTATED).href);
  const mutatedPng = await captureScreenshot(mutatedPage);

  const cases = [
    [
      'rubric-positive',
      async () => {
        const r = await evaluateRubric(basicPage, RUBRIC);
        assert.equal(r.total, 8, `expected 8 assertions, got ${r.total}`);
        assert.equal(
          r.failedCount,
          0,
          `expected 8/8, failures: ${JSON.stringify(r.assertions.filter((a) => !a.passed))}`,
        );
        assert.equal(r.passed, true);
      },
    ],
    [
      'rubric-negative',
      async () => {
        const r = await evaluateRubric(mutatedPage, RUBRIC);
        assert.equal(r.passed, false, 'the mutated fixture must fail the basic rubric');
        const failed = new Set(r.assertions.filter((a) => !a.passed).map((a) => a.id));
        for (const id of [
          'heir-share-shows-one-million',
          'heir-share-not-one-point-five-million',
          'warning-banner-visible',
        ]) {
          assert.ok(failed.has(id), `expected '${id}' to fail; failing: [${[...failed].join(', ')}]`);
        }
      },
    ],
    [
      'rubric-all-kinds',
      async () => {
        const used = new Set(RUBRIC.assertions.map((a) => a.kind));
        for (const kind of ASSERTION_KINDS) {
          assert.ok(used.has(kind), `rubric kind '${kind}' is never exercised`);
        }
        assert.equal(used.size, ASSERTION_KINDS.length);
      },
    ],
    [
      'rubric-unknown-kind',
      async () => {
        let threw = false;
        try {
          await evaluateRubric(basicPage, {
            rubricId: 'unknown',
            assertions: [{ id: 'a', kind: 'vibe_check' }],
          });
        } catch (err) {
          threw = true;
          assert.ok(
            String(err.message).startsWith('RUBRIC INVALID:'),
            `expected RUBRIC INVALID:, got "${err.message}"`,
          );
        }
        assert.ok(threw, 'an unknown kind must throw, never be skipped');
      },
    ],
    [
      'diff-reference-missing',
      async () =>
        withTempRefs((dir) => {
          const r = compareToReference(basicPng, 'g15', dir);
          assert.equal(r.status, 'fail');
          assert.ok(r.markers.includes(DIFF_MARKERS.REFERENCE_MISSING), r.markers.join(','));
        }),
    ],
    [
      'diff-pass',
      async () =>
        withTempRefs((dir) => {
          fs.writeFileSync(path.join(dir, 'g15.png'), basicPng);
          fs.writeFileSync(
            path.join(dir, 'g15.json'),
            JSON.stringify({ maxDiffPixels: 0, approvedOn: '2026-07-31', approvedBy: 'selftest' }),
          );
          const r = compareToReference(basicPng, 'g15', dir);
          assert.equal(r.status, 'pass', r.markers.join(','));
          assert.equal(r.diffPixels, 0, `same-image comparison reported ${r.diffPixels} pixels`);
        }),
    ],
    [
      'diff-failure',
      async () =>
        withTempRefs((dir) => {
          fs.writeFileSync(path.join(dir, 'g15.png'), basicPng);
          fs.writeFileSync(
            path.join(dir, 'g15.json'),
            JSON.stringify({ maxDiffPixels: 0, approvedOn: '2026-07-31', approvedBy: 'selftest' }),
          );
          const r = compareToReference(mutatedPng, 'g15', dir);
          assert.equal(r.status, 'fail');
          assert.ok(r.markers.includes(DIFF_MARKERS.DIFF_FAILURE), r.markers.join(','));
          assert.ok(r.diffPixels > 0, `expected a nonzero diff, got ${r.diffPixels}`);
          assert.ok(Buffer.isBuffer(r.diffPng) && r.diffPng.length > 1000, 'diff image missing or tiny');
        }),
    ],
    [
      'diff-size-mismatch',
      async () =>
        withTempRefs((dir) => {
          fs.writeFileSync(path.join(dir, 'g15.png'), PNG.sync.write(new PNG({ width: 10, height: 10 })));
          fs.writeFileSync(
            path.join(dir, 'g15.json'),
            JSON.stringify({ maxDiffPixels: 0, approvedOn: '2026-07-31', approvedBy: 'selftest' }),
          );
          const r = compareToReference(basicPng, 'g15', dir);
          assert.ok(r.markers.includes(DIFF_MARKERS.REFERENCE_SIZE_MISMATCH), r.markers.join(','));
          assert.equal(r.diffPixels, null, 'no pixel comparison may run at mismatched dimensions');
        }),
    ],
    [
      'artifacts-both-markers',
      async () => {
        const rubricResult = await evaluateRubric(mutatedPage, RUBRIC);
        const stepDir = withTempRefs((dir) => {
          fs.writeFileSync(path.join(dir, 'g15-both.png'), basicPng);
          fs.writeFileSync(
            path.join(dir, 'g15-both.json'),
            JSON.stringify({ maxDiffPixels: 0, approvedOn: '2026-07-31', approvedBy: 'selftest' }),
          );
          const diffResult = compareToReference(mutatedPng, 'g15-both', dir);
          return writeStepArtifacts({
            runStamp: newRunStamp(),
            stepId: 'g15-both',
            actualPng: mutatedPng,
            referencePng: basicPng,
            rubricResult,
            diffResult,
          });
        });
        for (const name of [
          'actual.png',
          'reference.png',
          'diff.png',
          'assertions.json',
          'FAILURE.txt',
        ]) {
          const p = path.join(stepDir, name);
          assert.ok(fs.existsSync(p), `${name} was not written`);
          assert.ok(fs.statSync(p).size > 0, `${name} is empty`);
        }
        const first = fs.readFileSync(path.join(stepDir, 'FAILURE.txt'), 'utf8').split('\n')[0];
        assert.ok(first.includes('RUBRIC FAILURE'), `line 1 lacks RUBRIC FAILURE: "${first}"`);
        assert.ok(first.includes('DIFF FAILURE'), `line 1 lacks DIFF FAILURE: "${first}"`);
      },
    ],
    [
      'seed-storage-and-params',
      async () => {
        const page = await newJourneyPage(browser);
        try {
          await seedLocalStorage(page, ORIGIN, { [INTAKE_DRAFT_KEY]: 'probe-draft' });
          await seedSessionStorage(page, ORIGIN, { [QUICK_CALC_KEY]: 'true' });
          await page.goto(seedSearchParams(ORIGIN, { step: '3' }));
          const text = (await page.locator('[data-testid="seed-readout"]').innerText()).trim();
          assert.equal(text, 'probe-draft|true|3', `first-paint seeding read "${text}"`);
        } finally {
          await page.close();
        }
      },
    ],
    [
      'approve-refuses',
      async () => {
        let exit = 0;
        try {
          execFileSync(process.execPath, [path.join(HERE, 'approve.mjs'), 'no-such-step'], {
            cwd: FRONTEND_ROOT,
            stdio: 'pipe',
          });
        } catch (err) {
          exit = err.status;
        }
        assert.ok(exit !== 0, 'the approval command must refuse when no artifact exists');
      },
    ],
  ];

  const failures = [];
  for (const [name, fn] of cases) {
    try {
      await fn();
    } catch (err) {
      failures.push([name, err && err.message ? err.message : String(err)]);
    }
  }

  await browser.close();
  await new Promise((resolve) => server.close(resolve));

  for (const [name, message] of failures) {
    console.log(`SELFTEST FAILED ${name}: ${message}`);
  }
  // Printed on BOTH paths — gate G8 reads this line from the gate's log regardless
  // of outcome.
  console.log(`GATE-SKIPS total=${cases.length} skipped=0`);
  process.exit(failures.length === 0 ? 0 : 1);
}

main().catch((err) => {
  console.log(`SELFTEST FAILED harness: ${err && err.message ? err.message : err}`);
  console.log('GATE-SKIPS total=11 skipped=0');
  process.exit(1);
});

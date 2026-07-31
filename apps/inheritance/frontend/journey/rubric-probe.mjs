/*
 * journey/rubric-probe.mjs — proof that the rubric evaluator is a CHECK.
 *
 * A rubric evaluator nobody has watched fail is not known to be a gate. This probe
 * observes three things against the committed wave-1 fixtures:
 *
 *   1. it PASSES on basic.html (8/8),
 *   2. it FAILS on mutated.html, and fails the SPECIFICALLY NAMED assertions — a
 *      probe that only asserted "something failed" would pass even if the evaluator
 *      failed the wrong ones,
 *   3. it REFUSES an unknown kind and a duplicate assertion id, rather than skipping
 *      or interpreting them.
 *
 * Exits non-zero on any assertion failure.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { launchBrowser, newJourneyPage } from './browser.mjs';
import { evaluateRubric } from './rubric.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASIC = path.join(HERE, 'fixtures', 'basic.html');
const MUTATED = path.join(HERE, 'fixtures', 'mutated.html');
const RUBRIC_PATH = path.join(HERE, 'rubrics', 'fixture-basic.json');

const RUBRIC = JSON.parse(fs.readFileSync(RUBRIC_PATH, 'utf8'));

// The three assertions the mutated fixture is built to break.
const EXPECTED_FAILING_IDS = [
  'heir-share-shows-one-million',
  'heir-share-not-one-point-five-million',
  'warning-banner-visible',
];

async function expectThrows(fn, tokenPrefix, what) {
  let threw = false;
  try {
    await fn();
  } catch (err) {
    threw = true;
    assert.ok(
      String(err.message).startsWith(tokenPrefix),
      `${what}: expected a message beginning "${tokenPrefix}", got "${err.message}"`,
    );
  }
  assert.ok(threw, `${what}: expected a throw, none happened`);
}

async function main() {
  const browser = await launchBrowser();
  try {
    // --- 1. Positive -------------------------------------------------------
    const pageBasic = await newJourneyPage(browser);
    await pageBasic.goto(pathToFileURL(BASIC).href);
    const positive = await evaluateRubric(pageBasic, RUBRIC);

    assert.equal(positive.rubricId, 'fixture-basic');
    assert.equal(positive.total, 8, `expected 8 assertions, got ${positive.total}`);
    assert.equal(
      positive.failedCount,
      0,
      `expected 0 failures on basic.html, got: ${JSON.stringify(positive.assertions.filter((a) => !a.passed))}`,
    );
    assert.equal(positive.passed, true);
    for (const a of positive.assertions) {
      assert.equal(typeof a.passed, 'boolean', `assertion ${a.id} has a non-boolean passed`);
      assert.ok(typeof a.id === 'string' && a.id.length > 0, 'every assertion result needs a non-empty id');
    }

    // --- 2. Negative -------------------------------------------------------
    const pageMutated = await newJourneyPage(browser);
    await pageMutated.goto(pathToFileURL(MUTATED).href);
    const negative = await evaluateRubric(pageMutated, RUBRIC);

    assert.equal(negative.passed, false, 'the mutated fixture must not pass the basic rubric');
    assert.ok(
      negative.failedCount >= 3,
      `expected at least 3 failures on mutated.html, got ${negative.failedCount}`,
    );
    const failedIds = new Set(negative.assertions.filter((a) => !a.passed).map((a) => a.id));
    for (const id of EXPECTED_FAILING_IDS) {
      assert.ok(
        failedIds.has(id),
        `expected assertion '${id}' to fail on mutated.html; failing ids were [${[...failedIds].join(', ')}]`,
      );
    }

    // --- 3. Refusal --------------------------------------------------------
    await expectThrows(
      () => evaluateRubric(pageBasic, { rubricId: 'unknown-kind', assertions: [{ id: 'a', kind: 'vibe_check' }] }),
      'RUBRIC INVALID:',
      'UNKNOWN_KIND',
    );
    await expectThrows(
      () =>
        evaluateRubric(pageBasic, {
          rubricId: 'duplicate-id',
          assertions: [
            { id: 'same', kind: 'element_absent', selector: '#nope' },
            { id: 'same', kind: 'element_absent', selector: '#nope2' },
          ],
        }),
      'RUBRIC INVALID:',
      'DUPLICATE_ID',
    );

    console.log(
      `RUBRIC-PROBE ok positive=${positive.total - positive.failedCount}/${positive.total} ` +
        `negative=${negative.failedCount}/${negative.total} ` +
        `unknownKindRejected=true duplicateIdRejected=true`,
    );
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(`RUBRIC-PROBE FAILED: ${err && err.message ? err.message : err}`);
  process.exit(1);
});

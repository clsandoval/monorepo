/*
 * journey/persistence.mjs — a nine-heir family tree, entered through the real
 * wizard in a real browser and read back out of a real Postgres, WITHOUT ever
 * clicking Compute (SAVE-05, gate G35).
 *
 * WHAT THIS PROVES. Phase 19's whole claim is "work now reaches the database
 * that previously did not". Every plan before this one drove the code through
 * in-process fakes — a mocked `@/lib/cases`, a `renderHook` harness, fake
 * timers. That is exactly the sampling that certified this defect for as long
 * as it existed: seven unit cases passed for months against a hook the
 * application could not reach. A unit test cannot reload a page, so the
 * requirement is only met when a browser does it against a live stack.
 *
 * WHY A STANDALONE SCRIPT AND NOT A REGISTRY STEP. The journey harness offers
 * two shapes. A registry step needs an approved reference PNG, and
 * scripts/check-journey-registry.mjs fails with `REFERENCE MISSING` without
 * one; producing a FIRST reference image is a human visual judgement no agent
 * may make. A standalone gate script — the shape journey/money-parity.mjs (G19)
 * and journey/rls-isolation.mjs (G18) already use — drives a real browser with
 * no reference image, no perceptual diff and no approval step. This file is the
 * second shape.
 *
 * IT CREATES AND DELETES ITS OWN CASE ROW, and never touches a seeded one. The
 * case-alpha-no-output reset in journey/resets.mjs nulls output_json,
 * decedent_name and date_of_death and sets status to draft — it does NOT
 * restore input_json. A gate that typed nine heirs into the seeded Alpha case
 * would leave them there permanently, silently redefining the fact pattern that
 * G19 money parity computes against. Check 7 asserts Alpha's input_json is
 * byte-identical before and after this run.
 *
 * IT ASSERTS STRUCTURE AND IDENTITY, NEVER A PESO FIGURE. Nine rows, nine
 * names, output_json still null. It performs no engine computation and reads no
 * committed expected amount, so it cannot drift from the engine and cannot fail
 * for a reason that belongs to G19.
 *
 * Exit contract, the project's three-valued one: 0 passed, 1 failed, 2 could not
 * run (`PERSISTENCE CANNOT RUN:` on stderr).
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { readStackEnv, adminClient, getSession } from './session.mjs';
import { readFixtures, seedAuthSession } from './seed.mjs';
import { buildApp, startPreview, JourneyCannotRun } from './serve.mjs';
import { launchBrowser, newJourneyPage } from './browser.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

const TARGET_HEIRS = 9;
const DEBOUNCE_SETTLE_MS = 4000;
const SAVED_TIMEOUT_MS = 15000;
const TOTAL_CHECKS = 7;

function cannotRun(reason) {
  console.error(`PERSISTENCE CANNOT RUN: ${reason}`);
  process.exit(2);
}

function expectedName(index) {
  return `Heir ${index + 1}`;
}

async function main() {
  const env = readStackEnv();
  if (env === null || !env.API_URL) {
    cannotRun('local Supabase stack is not running');
  }

  const fixtures = readFixtures();
  const admin = adminClient(env);
  const alphaCaseId = fixtures.orgs.alpha.case_id;

  let startingInput;
  try {
    startingInput = JSON.parse(
      readFileSync(join(HERE, '../../engine/examples/cases/02-married-3lc.json'), 'utf8'),
    );
  } catch (err) {
    cannotRun(`could not read the starting case file: ${err && err.message ? err.message : err}`);
  }

  const startCount = Array.isArray(startingInput.family_tree)
    ? startingInput.family_tree.length
    : 0;
  if (startCount < 1 || startCount > TARGET_HEIRS - 1) {
    cannotRun(
      `the starting case has ${startCount} family_tree entries; the run needs between 1 and ${
        TARGET_HEIRS - 1
      } so that at least one Add Person click is meaningful`,
    );
  }

  // Check 7's prior, taken before anything is driven.
  const { data: alphaBefore, error: alphaBeforeErr } = await admin
    .from('cases')
    .select('input_json')
    .eq('id', alphaCaseId)
    .single();
  if (alphaBeforeErr) {
    cannotRun(`could not read the seeded Alpha case input_json: ${alphaBeforeErr.message}`);
  }
  const alphaSnapshot = JSON.stringify(alphaBefore.input_json);

  // This gate's OWN row. Declared outside the try so the finally can delete it.
  let tempCaseId = null;
  let preview = null;
  let browser = null;
  const failures = [];

  const { data: created, error: createErr } = await admin
    .from('cases')
    .insert({
      user_id: fixtures.orgs.alpha.user_id,
      org_id: fixtures.orgs.alpha.org_id,
      title: 'Journey — wizard persistence',
      status: 'draft',
      input_json: startingInput,
      output_json: null,
      decedent_name: startingInput?.decedent?.name ?? null,
      date_of_death: startingInput?.decedent?.date_of_death ?? null,
    })
    .select('id')
    .single();
  if (createErr) {
    cannotRun(`could not create the temporary case row: ${createErr.message}`);
  }
  tempCaseId = created.id;

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

    const session = await getSession(env, 'alpha');
    const page = await newJourneyPage(browser);

    try {
      await seedAuthSession(page, preview.origin, session);
      await page.goto(`${preview.origin}/cases/${tempCaseId}?step=2`, { waitUntil: 'load' });
      await page.waitForSelector('[data-testid="family-tree-step"]');

      const renderedStart = await page.$$eval(
        '[data-testid="person-card"]',
        (els) => els.length,
      );
      if (renderedStart !== startCount) {
        // A harness mismatch must never be reported as a product defect.
        throw new JourneyCannotRun(
          `the wizard rendered ${renderedStart} person cards but the starting input has ${startCount}`,
        );
      }

      for (let n = renderedStart; n < TARGET_HEIRS; n += 1) {
        await page.click('[data-testid="add-person"]');
        await page.waitForFunction(
          (expected) =>
            document.querySelectorAll('[data-testid="person-card"]').length === expected,
          n + 1,
          { timeout: 10000 },
        );
      }

      for (let i = 0; i < TARGET_HEIRS; i += 1) {
        await page.fill(`[data-testid="person-name-${i}"]`, expectedName(i));
      }

      // ---- check 5: the lawyer can see the save state ----
      try {
        await page.waitForSelector('[data-testid="wizard-save-status"]', {
          timeout: SAVED_TIMEOUT_MS,
        });
        await page.waitForFunction(
          () => {
            const el = document.querySelector('[data-testid="wizard-save-status"]');
            return !!el && (el.innerText || el.textContent || '').trim() === 'Saved';
          },
          undefined,
          { timeout: SAVED_TIMEOUT_MS },
        );
      } catch {
        const shown = await page
          .$eval('[data-testid="wizard-save-status"]', (el) =>
            (el.innerText || el.textContent || '').trim(),
          )
          .catch(() => null);
        failures.push(
          `STATUS NOT SHOWN: the save indicator never reached "Saved"; it held ${
            shown === null ? 'no element at all' : JSON.stringify(shown)
          }`,
        );
      }

      // Compute has deliberately NOT been clicked.
      await page.waitForTimeout(DEBOUNCE_SETTLE_MS);

      // ---- checks 1, 2 and 4a: what the database actually holds ----
      const { data: stored, error: storedErr } = await admin
        .from('cases')
        .select('input_json, output_json')
        .eq('id', tempCaseId)
        .single();
      if (storedErr) {
        throw new JourneyCannotRun(`could not read back the temporary case: ${storedErr.message}`);
      }

      const storedTree = Array.isArray(stored.input_json?.family_tree)
        ? stored.input_json.family_tree
        : [];
      if (storedTree.length !== TARGET_HEIRS) {
        failures.push(
          `NOT PERSISTED: the database holds ${storedTree.length} family_tree entries, expected ${TARGET_HEIRS}`,
        );
      }
      if (stored.output_json !== null) {
        failures.push(
          `COMPUTE LEAKED: output_json is not null, so this row was written by a computation rather than by autosave`,
        );
      }
      for (let i = 0; i < TARGET_HEIRS; i += 1) {
        const got = storedTree[i] ? storedTree[i].name : undefined;
        if (got !== expectedName(i)) {
          failures.push(
            `NAME LOST: stored family_tree[${i}].name is ${JSON.stringify(got)}, expected ${JSON.stringify(expectedName(i))}`,
          );
        }
      }

      // ---- checks 3 and 4b: what survives a reload ----
      await page.reload({ waitUntil: 'load' });
      await page.waitForSelector('[data-testid="family-tree-step"]');
      const reloadedCards = await page.$$eval(
        '[data-testid="person-card"]',
        (els) => els.length,
      );
      if (reloadedCards !== TARGET_HEIRS) {
        failures.push(
          `RELOAD LOST: the reloaded wizard shows ${reloadedCards} person cards, expected ${TARGET_HEIRS}`,
        );
      }
      const reloadedNames = await page.$$eval('[data-testid^="person-name-"]', (els) =>
        els.map((el) => ({
          id: el.getAttribute('data-testid') || '',
          value: el.value,
        })),
      );
      for (const entry of reloadedNames) {
        const index = Number(entry.id.replace(/^person-name-/, ''));
        if (!Number.isInteger(index)) continue;
        if (entry.value !== expectedName(index)) {
          failures.push(
            `NAME LOST: reloaded ${entry.id} holds ${JSON.stringify(entry.value)}, expected ${JSON.stringify(expectedName(index))}`,
          );
        }
      }

      // ---- check 6: the unmount flush ----
      // Type, then navigate away CLIENT-SIDE inside the debounce window. The
      // sidebar Cases link is a TanStack Link, so this unmounts the case route
      // without a page load — the exact situation that used to discard the save.
      await page.fill('[data-testid="person-name-0"]', 'Flushed Heir');
      await page.locator('a[href="/cases"]').first().click();
      await page.waitForTimeout(DEBOUNCE_SETTLE_MS);

      const { data: afterUnmount, error: afterUnmountErr } = await admin
        .from('cases')
        .select('input_json')
        .eq('id', tempCaseId)
        .single();
      if (afterUnmountErr) {
        throw new JourneyCannotRun(
          `could not read the temporary case after unmount: ${afterUnmountErr.message}`,
        );
      }
      const flushedName = afterUnmount.input_json?.family_tree?.[0]?.name;
      if (flushedName !== 'Flushed Heir') {
        failures.push(
          `UNMOUNT LOST: family_tree[0].name is ${JSON.stringify(flushedName)} after navigating away inside the debounce window, expected "Flushed Heir"`,
        );
      }
    } finally {
      await page.close().catch(() => {});
    }

    // ---- check 7: the seeded fixture is untouched ----
    const { data: alphaAfter, error: alphaAfterErr } = await admin
      .from('cases')
      .select('input_json')
      .eq('id', alphaCaseId)
      .single();
    if (alphaAfterErr) {
      throw new JourneyCannotRun(
        `could not re-read the seeded Alpha case: ${alphaAfterErr.message}`,
      );
    }
    if (JSON.stringify(alphaAfter.input_json) !== alphaSnapshot) {
      failures.push(
        `FIXTURE MUTATED: the seeded Alpha case input_json changed during this run; G19 money parity computes against it`,
      );
    }
  } catch (err) {
    // A cannot-run reason exits 2 and is never reported as a failure of the
    // product; anything else is a failure of this run and joins the list, so the
    // skip report below is emitted on exactly one fail path.
    if (err instanceof JourneyCannotRun) {
      await teardown(browser, preview, admin, tempCaseId);
      cannotRun(err.message);
    }
    failures.push(`PERSISTENCE ERROR: ${err && err.stack ? err.stack : err}`);
  }

  await teardown(browser, preview, admin, tempCaseId);

  if (failures.length > 0) {
    for (const line of failures) console.error(line);
    console.log(`GATE-SKIPS total=7 skipped=0`);
    console.error(`PERSISTENCE FAIL checks=${TOTAL_CHECKS} failed=${failures.length}`);
    process.exit(1);
  }

  console.log(`GATE-SKIPS total=7 skipped=0`);
  console.log(`PERSISTENCE PASS heirs=${TARGET_HEIRS} checks=${TOTAL_CHECKS}`);
  process.exit(0);
}

/**
 * Runs on EVERY exit path, including the failure and cannot-run paths. An
 * orphaned case row would accumulate one per run.
 */
async function teardown(browser, preview, admin, tempCaseId) {
  if (browser) await browser.close().catch(() => {});
  if (preview && typeof preview.stop === 'function') await preview.stop().catch(() => {});
  if (tempCaseId && admin) {
    const { error } = await admin.from('cases').delete().eq('id', tempCaseId);
    if (error) {
      console.error(`TEMP CASE DELETE FAILED ${tempCaseId}: ${error.message}`);
    } else {
      console.log(`TEMP CASE DELETED ${tempCaseId}`);
    }
  }
}

// Only run the gate when this file is EXECUTED. Importing it must be free of
// side effects.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(
      `PERSISTENCE FAIL checks=${TOTAL_CHECKS} failed=? : ${err && err.stack ? err.stack : err}`,
    );
    process.exit(1);
  });
}

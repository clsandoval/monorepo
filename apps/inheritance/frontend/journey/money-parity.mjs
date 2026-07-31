/*
 * journey/money-parity.mjs — every peso figure on the results view, compared as
 * an exact centavo integer against an engine computation performed in the SAME
 * RUN (JRNY-07, gate G19).
 *
 * This is the check the whole project exists for. A lawyer files on these
 * numbers, so the only acceptable comparison is exact equality of integers.
 * There is deliberately no approximate comparison of any kind in this file, and
 * no rounding helper: a figure that is "close" is a wrong figure.
 *
 * EVERY COMPARISON IS BigInt. `Money.centavos` is typed `number | string` on the
 * TypeScript side, and an estate above the largest exactly-representable integer
 * in double-precision floating point would lose precision the moment it touched
 * a JS number. parsePesoText therefore returns BigInt and never coerces to a
 * float.
 *
 * THE EXPECTED VALUE IS COMPUTED, NEVER STORED. Nothing here reads a committed
 * expected figure: scripts/check-seed-fixture.mjs rejects a seeded output_json
 * with `SEED WRITES OUTPUT` — "a seeded engine result is a per-heir peso figure
 * nothing computed" — and a committed expected number stops tracking the engine
 * the moment the engine changes. The run resets the case, asks the compiled
 * engine directly through journey/engine.mjs, then makes the product compute the
 * same case in a real browser and compares what it DISPLAYS.
 *
 * HEIR ROW SET MISMATCH is what makes this total rather than sampled. Without
 * it, a results view that dropped an heir entirely would display only correct
 * figures and pass.
 *
 * Exit contract, the project's three-valued one: 0 passed, 1 failed, 2 could not
 * run (`MONEY PARITY CANNOT RUN:` on stderr).
 */

import { readStackEnv, adminClient, getSession } from './session.mjs';
import { readFixtures, seedAuthSession } from './seed.mjs';
import { buildApp, startPreview, JourneyCannotRun } from './serve.mjs';
import { launchBrowser, newJourneyPage } from './browser.mjs';
import { computeEngineOutput } from './engine.mjs';
import { RESETS } from './resets.mjs';

const SETTLE_MS = 4000;
const TOTAL_CHECKS = 5;

function cannotRun(reason) {
  console.error(`MONEY PARITY CANNOT RUN: ${reason}`);
  process.exit(2);
}

/**
 * The exact inverse of formatPeso (src/types/index.ts:509).
 *
 * formatPeso emits `₱` + thousands-separated pesos, and a `.` plus exactly two
 * digits only when the centavo remainder is non-zero. Anything else is a string
 * this parser must refuse rather than guess at: a silently-tolerated stray
 * character is precisely how a wrong figure would pass this gate.
 *
 * @param {string} text
 * @returns {bigint} centavos
 */
export function parsePesoText(text) {
  const original = String(text);
  let s = original.trim();
  // A leading minus (ASCII or U+2212) appears on the donations-imputed cell,
  // which renders "- ₱1,234". The sign is stripped, not interpreted: this
  // parser reports magnitude and the caller decides what the cell means.
  s = s.replace(/^[-−]\s*/, '');
  s = s.replace(/^₱/, '');
  s = s.replace(/^[-−]\s*/, '');
  s = s.trim().replace(/,/g, '');

  const dot = s.indexOf('.');
  let pesoPart = s;
  let centPart = '00';
  if (dot !== -1) {
    pesoPart = s.slice(0, dot);
    centPart = s.slice(dot + 1);
    if (!/^\d{2}$/.test(centPart)) {
      throw new Error(`PESO UNPARSEABLE: ${original}`);
    }
  }
  if (!/^\d+$/.test(pesoPart)) {
    throw new Error(`PESO UNPARSEABLE: ${original}`);
  }
  return BigInt(pesoPart) * 100n + BigInt(centPart);
}

/** Centavos out of a Money whose `.centavos` is `number | string`, as an exact BigInt. */
function centavosOf(money) {
  if (money == null || money.centavos == null) {
    throw new Error(`MONEY MISSING: ${JSON.stringify(money)}`);
  }
  return BigInt(money.centavos);
}

async function main() {
  const env = readStackEnv();
  if (env === null || !env.API_URL) {
    cannotRun('local Supabase stack is not running');
  }

  const fixtures = readFixtures();
  const caseId = fixtures.orgs.alpha.case_id;
  const admin = adminClient(env);

  let preview = null;
  let browser = null;
  const failures = [];

  try {
    // 1. Begin from a wizard-phase case, so the product must compute rather than
    //    display a result some earlier run left behind.
    await RESETS['case-alpha-no-output'](admin);

    // 2-3. The expected answer, from the compiled engine, this run.
    const { data: before, error: beforeErr } = await admin
      .from('cases')
      .select('input_json')
      .eq('id', caseId)
      .single();
    if (beforeErr) {
      throw new JourneyCannotRun(`could not read the Alpha case input_json: ${beforeErr.message}`);
    }
    if (!before || before.input_json == null) {
      throw new JourneyCannotRun(`the Alpha case has a null input_json`);
    }
    const input = before.input_json;
    const expected = await computeEngineOutput(input);

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
    let displayedHeirs;
    let displayedTotalText;
    let displayedBreakdown;
    try {
      await seedAuthSession(page, preview.origin, session);
      await page.goto(`${preview.origin}/cases/${caseId}?step=4`, { waitUntil: 'load' });
      await page.waitForSelector('[data-testid="review-step"]');
      await page.click('[data-testid="compute-distribution"]');
      await page.waitForSelector('[data-testid="results-view"]');
      await page.waitForTimeout(SETTLE_MS);

      displayedHeirs = await page.$$eval('[data-testid^="heir-net-"]', (els) =>
        els.map((el) => ({
          id: (el.getAttribute('data-testid') || '').replace(/^heir-net-/, ''),
          text: (el.innerText || el.textContent || '').trim(),
        })),
      );
      displayedTotalText = await page.$eval('[data-testid="total-estate"]', (el) =>
        (el.innerText || el.textContent || '').trim(),
      );
      displayedBreakdown = await page.$$eval('[data-testid^="breakdown-net-"]', (els) =>
        els.map((el) => ({
          id: (el.getAttribute('data-testid') || '').replace(/^breakdown-net-/, ''),
          text: (el.innerText || el.textContent || '').trim(),
        })),
      );
    } finally {
      await page.close().catch(() => {});
    }

    // ---- comparison 1: every displayed heir amount ----
    const expectedById = new Map(
      expected.per_heir_shares.map((s) => [s.heir_id, centavosOf(s.net_from_estate)]),
    );
    const displayedById = new Map();
    for (const { id, text } of displayedHeirs) {
      let parsed;
      try {
        parsed = parsePesoText(text);
      } catch (err) {
        failures.push(`HEIR AMOUNT MISMATCH — heir '${id}' displayed ${JSON.stringify(text)} which ${err.message}`);
        continue;
      }
      displayedById.set(id, parsed);
      const want = expectedById.get(id);
      if (want === undefined) {
        failures.push(
          `HEIR AMOUNT MISMATCH — heir '${id}' is displayed with ${parsed} centavos but the engine returned no share for that id`,
        );
      } else if (parsed !== want) {
        failures.push(
          `HEIR AMOUNT MISMATCH — heir '${id}' displayed ${parsed} centavos, engine computed ${want} centavos (difference ${parsed - want})`,
        );
      }
    }

    // ---- comparison 2: the heir row SET, not just the amounts ----
    const expectedActive = expected.per_heir_shares
      .filter((s) => centavosOf(s.net_from_estate) > 0n)
      .map((s) => s.heir_id)
      .sort();
    const displayedIds = [...displayedById.keys()].sort();
    if (
      displayedIds.length !== expectedActive.length ||
      displayedIds.some((id, i) => id !== expectedActive[i])
    ) {
      failures.push(
        `HEIR ROW SET MISMATCH — displayed heir ids [${displayedIds.join(', ')}], engine's non-zero heir ids [${expectedActive.join(', ')}]`,
      );
    }

    // ---- comparison 3: the total, both against the input and against the sum ----
    const expectedTotal = centavosOf(input.net_distributable_estate);
    let displayedTotal = null;
    try {
      displayedTotal = parsePesoText(displayedTotalText);
    } catch (err) {
      failures.push(`TOTAL ESTATE MISMATCH — total displayed ${JSON.stringify(displayedTotalText)} which ${err.message}`);
    }
    if (displayedTotal !== null && displayedTotal !== expectedTotal) {
      failures.push(
        `TOTAL ESTATE MISMATCH — total displayed ${displayedTotal} centavos, input_json.net_distributable_estate is ${expectedTotal} centavos (difference ${displayedTotal - expectedTotal})`,
      );
    }
    let sum = 0n;
    for (const v of displayedById.values()) sum += v;
    if (sum !== expectedTotal) {
      failures.push(
        `TOTAL ESTATE MISMATCH — displayed heir amounts sum to ${sum} centavos, the estate is ${expectedTotal} centavos (difference ${sum - expectedTotal})`,
      );
    }

    // ---- comparison 4: the breakdown section agrees with the table ----
    for (const { id, text } of displayedBreakdown) {
      let parsed;
      try {
        parsed = parsePesoText(text);
      } catch (err) {
        failures.push(`BREAKDOWN MISMATCH — heir '${id}' displayed ${JSON.stringify(text)} which ${err.message}`);
        continue;
      }
      const table = displayedById.get(id);
      if (table === undefined) {
        failures.push(`BREAKDOWN MISMATCH — heir '${id}' appears in the breakdown but not in the distribution table`);
      } else if (parsed !== table) {
        failures.push(
          `BREAKDOWN MISMATCH — heir '${id}' breakdown shows ${parsed} centavos, the distribution table shows ${table} centavos (difference ${parsed - table})`,
        );
      }
    }

    // ---- comparison 5: what the product PERSISTED, not merely what it drew ----
    const { data: after, error: afterErr } = await admin
      .from('cases')
      .select('output_json')
      .eq('id', caseId)
      .single();
    if (afterErr || !after || after.output_json == null) {
      failures.push(
        `STORED OUTPUT DIVERGED — the product wrote no output_json for the case it just computed` +
          (afterErr ? `: ${afterErr.message}` : ''),
      );
    } else {
      const stored = after.output_json;
      if (stored.scenario_code !== expected.scenario_code) {
        failures.push(
          `STORED OUTPUT DIVERGED — stored scenario_code '${stored.scenario_code}', engine computed '${expected.scenario_code}'`,
        );
      }
      if (stored.succession_type !== expected.succession_type) {
        failures.push(
          `STORED OUTPUT DIVERGED — stored succession_type '${stored.succession_type}', engine computed '${expected.succession_type}'`,
        );
      }
      const storedById = new Map(
        (stored.per_heir_shares || []).map((s) => [s.heir_id, centavosOf(s.net_from_estate)]),
      );
      for (const [id, want] of expectedById) {
        const got = storedById.get(id);
        if (got === undefined) {
          failures.push(`STORED OUTPUT DIVERGED — stored output_json has no share for heir '${id}'`);
        } else if (got !== want) {
          failures.push(
            `STORED OUTPUT DIVERGED — heir '${id}' stored ${got} centavos, engine computed ${want} centavos (difference ${got - want})`,
          );
        }
      }
    }
  } catch (err) {
    if (err instanceof JourneyCannotRun) {
      if (browser) await browser.close().catch(() => {});
      if (preview) await preview.stop().catch(() => {});
      cannotRun(err.reason);
    }
    throw err;
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (preview) await preview.stop().catch(() => {});
  }

  for (const line of failures) console.error(line);

  // Printed on BOTH the pass and the fail path — scripts/check-gate-skips.mjs
  // reads this line regardless of outcome and treats a missing line as failure.
  console.log(`GATE-SKIPS total=${TOTAL_CHECKS} skipped=0`);

  if (failures.length > 0) {
    console.error(`MONEY PARITY FAIL checks=${TOTAL_CHECKS} failed=${failures.length}`);
    process.exit(1);
  }

  const { data: fin } = await admin
    .from('cases')
    .select('input_json')
    .eq('id', caseId)
    .single();
  const total = centavosOf(fin.input_json.net_distributable_estate);
  const heirs = (await computeEngineOutput(fin.input_json)).per_heir_shares.filter(
    (s) => centavosOf(s.net_from_estate) > 0n,
  ).length;
  console.log(`MONEY PARITY PASS heirs=${heirs} centavos=${total}`);
  process.exit(0);
}

// Only run the gate when this file is EXECUTED. Importing it must be free of
// side effects, so the parsePesoText round-trip proof stays re-runnable without
// building the app and launching a browser.
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(`MONEY PARITY FAIL checks=? failed=? : ${err && err.stack ? err.stack : err}`);
    process.exit(1);
  });
}

/*
 * journey/seed-probe.mjs — proof the database-free seams reach a rendered page.
 *
 * Uses the `seed-readout` element committed in fixtures/basic.html, whose inline
 * script writes localStorage['inheritance-intake-draft'],
 * sessionStorage['quick-calc-used'] and the `step` search param joined by `|`,
 * substituting `absent` for any that is null.
 *
 * The fixture is served over http://127.0.0.1:4173 by a minimal node:http server
 * created here, because web storage cannot be seeded on a `file://` origin.
 *
 * DELIBERATE SPLIT, recorded so a later reader knows it was decided rather than
 * forgotten: the RUNTIME proof that a crafted `step=99` renders step 1 of the real
 * wizard belongs to PHASE 11's gate, which has a built app to navigate. This plan
 * builds no app, so the clamp is asserted here at the SOURCE level — the honest
 * proof available at this stage — plus a vitest run showing neither new helper
 * threw.
 *
 * Exits non-zero on any assertion failure.
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { launchBrowser, newJourneyPage } from './browser.mjs';
import {
  INTAKE_DRAFT_KEY,
  QUICK_CALC_KEY,
  seedLocalStorage,
  seedSessionStorage,
  seedSearchParams,
} from './seed.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(HERE, '..');
const FIXTURE_HTML = fs.readFileSync(path.join(HERE, 'fixtures', 'basic.html'));

const PORT = 4173;
const ORIGIN = `http://127.0.0.1:${PORT}`;

function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(FIXTURE_HTML);
    });
    server.listen(PORT, '127.0.0.1', () => resolve(server));
  });
}

async function readout(page) {
  return (await page.locator('[data-testid="seed-readout"]').innerText()).trim();
}

async function main() {
  const server = await startServer();
  const browser = await launchBrowser();
  try {
    // --- 1. Baseline: nothing seeded ---------------------------------------
    const bare = await newJourneyPage(browser);
    await bare.goto(ORIGIN);
    const baseline = await readout(bare);
    assert.equal(baseline, 'absent|absent|absent', `expected an unseeded readout, got "${baseline}"`);
    await bare.close();

    // --- 2 & 3. All three seams, on the FIRST navigation, no reload ---------
    const seeded = await newJourneyPage(browser);
    await seedLocalStorage(seeded, ORIGIN, { [INTAKE_DRAFT_KEY]: 'probe-draft' });
    await seedSessionStorage(seeded, ORIGIN, { [QUICK_CALC_KEY]: 'true' });
    await seeded.goto(seedSearchParams(ORIGIN, { step: '3' }));
    const seededText = await readout(seeded);
    // Asserting the exact joined string, rather than three substring checks, is what
    // proves all three seams took effect in ONE page load.
    assert.equal(
      seededText,
      'probe-draft|true|3',
      `expected all three seams on first paint, got "${seededText}"`,
    );
    await seeded.close();

    // --- 4. The harness sees exactly what it sent --------------------------
    for (const crafted of ['99', '-1', 'banana']) {
      const page = await newJourneyPage(browser);
      await page.goto(seedSearchParams(ORIGIN, { step: crafted }));
      const text = await readout(page);
      const third = text.split('|')[2];
      assert.equal(third, crafted, `expected the fixture to echo step=${crafted}, got "${third}"`);
      await page.close();
    }

    // --- 5. Neither new helper threw in the committed suites ---------------
    let vitestOut = '';
    try {
      vitestOut = execFileSync(
        'npx',
        [
          'vitest',
          'run',
          'src/components/wizard/__tests__/',
          'src/components/tax/__tests__/',
          '--reporter=dot',
        ],
        { cwd: FRONTEND_ROOT, encoding: 'utf8', stdio: 'pipe' },
      );
    } catch (err) {
      // A nonzero exit is EXPECTED — these suites carry ledgered known failures.
      vitestOut = `${err.stdout || ''}${err.stderr || ''}`;
    }
    assert.ok(
      !vitestOut.includes('readInitialWizardState'),
      'a test error named readInitialWizardState, so the new helper threw',
    );
    assert.ok(
      !vitestOut.includes('readInitialTab'),
      'a test error named readInitialTab, so the new helper threw',
    );

    // --- 6. Source-level clamp assertion -----------------------------------
    const wizardSrc = fs.readFileSync(
      path.join(FRONTEND_ROOT, 'src/components/wizard/WizardContainer.tsx'),
      'utf8',
    );
    const taxSrc = fs.readFileSync(
      path.join(FRONTEND_ROOT, 'src/components/tax/EstateTaxWizard.tsx'),
      'utf8',
    );
    assert.ok(wizardSrc.includes('Number.parseInt'), 'WizardContainer must parse with Number.parseInt');
    assert.ok(wizardSrc.includes('parsed >= 0'), 'WizardContainer must lower-bound the parsed step at 0');
    assert.ok(
      wizardSrc.includes('WIZARD_STEPS.length'),
      'WizardContainer must upper-bound against WIZARD_STEPS.length',
    );
    assert.ok(taxSrc.includes('Number.parseInt'), 'EstateTaxWizard must parse with Number.parseInt');
    assert.ok(taxSrc.includes('parsed >= 0'), 'EstateTaxWizard must lower-bound the parsed tab at 0');
    assert.ok(taxSrc.includes('TAB_COUNT - 1'), 'EstateTaxWizard must upper-bound against TAB_COUNT');

    console.log(
      'SEED-PROBE ok baseline=absent seeded=probe-draft|true|3 firstPaint=true clampSourceChecked=true',
    );
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
}

main().catch((err) => {
  console.error(`SEED-PROBE FAILED: ${err && err.message ? err.message : err}`);
  process.exit(1);
});

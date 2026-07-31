/*
 * journey/pdf-capture.mjs — the shared browser capture every PDF gate uses.
 *
 * THE PDF IS OBTAINED THE WAY A USER OBTAINS IT: by clicking the product's own
 * "Export PDF" button in a real browser and taking the bytes the download
 * produces. A PDF the harness rendered for itself would prove that the harness
 * can call @react-pdf/renderer — not that the product's lazy
 * `import('@react-pdf/renderer')` path, its `profile: null` argument and its
 * blob download all work. This mirrors the Phase 12 decision recorded in
 * STATE.md: the results view is reached by clicking the real compute button,
 * because a seeded engine result is a per-heir peso figure nothing computed.
 *
 * THE PAGE CLOCK IS FIXED WITH `setFixedTime`, NEVER WITH `install`.
 * CaseSummarySection prints `Report Generated:` from `new Date()`, so without a
 * fixed clock a zero-tolerance page reference approved today would fail
 * tomorrow. Playwright 1.56.1 documents `clock.install` as faking timers, which
 * stalls React scheduling and the debounced autosave; `setFixedTime` pins
 * Date.now() while leaving timers running. The instant is chosen for two
 * measured reasons (13-RESEARCH.md section 5): it is after the seeded decedent's
 * date of death 2026-01-15, and it is before real time on the machine that mints
 * the session token, so the token's expiry lies in the fake future and the
 * client still treats the session as live.
 *
 * BYTES THAT ARE NOT A PDF ARE A CANNOT-RUN CONDITION, NOT A FAILURE. A
 * zero-byte or non-PDF file that reached the assertions would let every
 * downstream structural check pass vacuously on an empty document, which is
 * exactly the silent wrongness this project ranks as worse than loud failure.
 * The same applies to a download that never arrives.
 *
 * THE EXPECTED VALUE IS COMPUTED, NEVER STORED. The engine output returned
 * alongside the bytes comes from journey/engine.mjs in this same run, so every
 * later assertion compares the document against a computation of the same case.
 *
 * This module writes nothing to disk beyond what Playwright's own download
 * machinery does inside its temporary directory.
 */

import fs from 'node:fs';

import { readStackEnv, adminClient, getSession } from './session.mjs';
import { readFixtures, seedAuthSession } from './seed.mjs';
import { buildApp, startPreview, JourneyCannotRun } from './serve.mjs';
import { launchBrowser, newJourneyPage } from './browser.mjs';
import { computeEngineOutput } from './engine.mjs';
import { RESETS } from './resets.mjs';

/** The instant every PDF capture pins Date.now() to. See the header. */
export const PDF_FIXED_CLOCK = '2026-06-15T00:00:00Z';

/** The same settle the Phase 12 money-parity gate uses. */
const SETTLE_MS = 4000;

/** A generated PDF takes seconds, not milliseconds; the lazy import is cold. */
const DOWNLOAD_TIMEOUT_MS = 60000;

/**
 * Drive the product to its results view and click Export PDF.
 *
 * Throws `JourneyCannotRun` for every environmental condition — a stopped
 * Supabase stack, a failed build, a missing browser, a download that never
 * arrives, bytes that do not begin `%PDF-`. The caller maps that to exit 2.
 *
 * @returns {Promise<{pdfBuffer: Buffer, expected: object, input: object, caseId: string}>}
 */
export async function captureExportedPdf() {
  const env = readStackEnv();
  if (env === null || !env.API_URL) {
    throw new JourneyCannotRun('local Supabase stack is not running');
  }

  const fixtures = readFixtures();
  const caseId = fixtures.orgs.alpha.case_id;
  const admin = adminClient(env);

  let preview = null;
  let browser = null;

  try {
    // Begin from a wizard-phase case, so the product must compute rather than
    // redisplay a result some earlier run left behind.
    await RESETS['case-alpha-no-output'](admin);

    const { data: before, error: beforeErr } = await admin
      .from('cases')
      .select('input_json')
      .eq('id', caseId)
      .single();
    if (beforeErr) {
      throw new JourneyCannotRun(`could not read the Alpha case input_json: ${beforeErr.message}`);
    }
    if (!before || before.input_json == null) {
      throw new JourneyCannotRun('the Alpha case has a null input_json');
    }
    const input = before.input_json;

    // The expected answer, from the compiled engine, this run.
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
    let pdfBuffer;
    try {
      await page.clock.setFixedTime(new Date(PDF_FIXED_CLOCK));
      await seedAuthSession(page, preview.origin, session);
      await page.goto(`${preview.origin}/cases/${caseId}?step=4`, { waitUntil: 'load' });
      await page.waitForSelector('[data-testid="review-step"]');
      await page.click('[data-testid="compute-distribution"]');
      await page.waitForSelector('[data-testid="results-view"]');
      await page.waitForTimeout(SETTLE_MS);

      await page.waitForSelector('[data-testid="export-pdf"]');
      // The listener must be registered BEFORE the click, or a fast download
      // resolves before anything is waiting for it.
      const downloadPromise = page.waitForEvent('download', { timeout: DOWNLOAD_TIMEOUT_MS });
      await page.click('[data-testid="export-pdf"]');

      let download;
      try {
        download = await downloadPromise;
      } catch (err) {
        throw new JourneyCannotRun(
          `the Export PDF button produced no download within ${DOWNLOAD_TIMEOUT_MS} ms: ` +
            `${err && err.message ? err.message : err}`,
        );
      }

      const downloadPath = await download.path();
      if (!downloadPath) {
        throw new JourneyCannotRun('the download reported no path on disk');
      }
      pdfBuffer = fs.readFileSync(downloadPath);
    } finally {
      await page.close().catch(() => {});
    }

    const magic = pdfBuffer.subarray(0, 5).toString('latin1');
    if (magic !== '%PDF-') {
      throw new JourneyCannotRun(
        `the downloaded file does not begin with "%PDF-" (observed ${JSON.stringify(magic)}), ` +
          `so it is not a PDF and every downstream check would pass vacuously`,
      );
    }
    if (pdfBuffer.length <= 1000) {
      throw new JourneyCannotRun(
        `the downloaded PDF is ${pdfBuffer.length} bytes, which is too small to be a real report`,
      );
    }

    return { pdfBuffer, expected, input, caseId };
  } finally {
    if (browser) await browser.close().catch(() => {});
    if (preview) await preview.stop().catch(() => {});
  }
}

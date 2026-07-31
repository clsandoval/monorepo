/*
 * journey/print-layout.mjs — gate G25. Print layout verified from RENDERED
 * OUTPUT, never from stylesheet source text (PDF-05).
 *
 * A stylesheet's text says nothing about what a browser did with it. A rule can
 * be overridden by specificity, dropped by a parse error, scoped to a media
 * query that never matches, or shipped in a bundle the page never loads — and a
 * check that greps the source file passes in every one of those cases. That is
 * the failure mode this file exists to remove: it opens no stylesheet, and it
 * reads no source file off disk at all.
 *
 * Every value asserted here comes from one of exactly two places:
 *   - getComputedStyle inside the page, under page.emulateMedia({ media: 'print' })
 *   - the bytes page.pdf() produced, read through journey/pdf.mjs
 *
 * page.pdf is called with preferCSSPageSize true and NO margin option, so the
 * paper size and the margins come from the document's own @page rule rather than
 * from an argument this check supplied. Passing a margin would make the check
 * agree with its own input.
 *
 * THE TWO MARGIN THRESHOLDS ARE FIXED INTEGERS, recorded in 13-RESEARCH.md
 * section 8: 90 pixels from the top and 70 pixels from the left, at a raster
 * resolution of 100 dots per inch. The basis is arithmetic — 25 mm is 98.4 px
 * and 20 mm is 78.7 px at 100 dpi — and each threshold sits a few pixels inside
 * its nominal value to absorb glyph bearing while remaining far above the
 * near-zero offset a page ignoring @page would produce. Neither number is ever
 * adjusted to make a run pass.
 *
 * Exit contract, the project's three-valued one: 0 passed, 1 failed, 2 could not
 * run (`PRINT LAYOUT CANNOT RUN:` on stderr).
 */

import { PNG } from 'pngjs';

import { readStackEnv, adminClient, getSession } from './session.mjs';
import { readFixtures, seedAuthSession } from './seed.mjs';
import { buildApp, startPreview, JourneyCannotRun } from './serve.mjs';
import { launchBrowser, newJourneyPage } from './browser.mjs';
import { pdfPageInfo, rasterizePdfPages, PDF_MARKERS } from './pdf.mjs';
import { RESETS } from './resets.mjs';

const SETTLE_MS = 4000;
const TOTAL_CHECKS = 7;

/** Raster resolution for the margin scan, in dots per inch. */
const RASTER_DPI = 100;

/** 25 mm is 98.4 px at 100 dpi; 90 leaves room for glyph bearing. */
const MIN_TOP_INK_PX = 90;

/** 20 mm is 78.7 px at 100 dpi; 70 leaves room for glyph bearing. */
const MIN_LEFT_INK_PX = 70;

/** The four selectors the stylesheet claims to hide in print media. */
const CHROME_SELECTORS = ['nav', '[data-sidebar]', '.sidebar', '.no-print'];

/** A channel value at or above this counts as paper, not ink. */
const INK_THRESHOLD = 250;

function cannotRun(reason) {
  console.error(`PRINT LAYOUT CANNOT RUN: ${reason}`);
  console.log(`GATE-SKIPS total=${TOTAL_CHECKS} skipped=${TOTAL_CHECKS}`);
  process.exit(2);
}

/**
 * First raster row and first raster column carrying ink.
 *
 * @param {Buffer} pngBuffer
 * @returns {{topInkPx: number|null, leftInkPx: number|null, width: number, height: number}}
 */
function firstInkOffsets(pngBuffer) {
  const png = PNG.sync.read(pngBuffer);
  const { width, height, data } = png;
  let topInkPx = null;
  let leftInkPx = null;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (width * y + x) << 2;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a > 0 && r < INK_THRESHOLD && g < INK_THRESHOLD && b < INK_THRESHOLD) {
        if (topInkPx === null) topInkPx = y;
        if (leftInkPx === null || x < leftInkPx) leftInkPx = x;
      }
    }
  }

  return { topInkPx, leftInkPx, width, height };
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
  let topInkPx = null;
  let leftInkPx = null;

  try {
    await RESETS['case-alpha-computed'](admin);

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
    let screenPrintOnly;
    let printed;
    let printValues;
    try {
      await seedAuthSession(page, preview.origin, session);
      await page.goto(`${preview.origin}/cases/${caseId}`, { waitUntil: 'load' });
      await page.waitForSelector('[data-testid="results-view"]');
      await page.waitForTimeout(SETTLE_MS);

      // The SCREEN baseline, read before any media switch. Without it a
      // stylesheet that did nothing at all would satisfy PRINT ONLY HIDDEN.
      screenPrintOnly = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('.print-header'));
        return {
          total: els.length,
          hidden: els.filter((el) => getComputedStyle(el).display === 'none').length,
        };
      });

      await page.emulateMedia({ media: 'print' });

      printValues = await page.evaluate((selectors) => {
        const body = getComputedStyle(document.body);
        const hiddenCounts = {};
        for (const selector of selectors) {
          const els = Array.from(document.querySelectorAll(selector));
          hiddenCounts[selector] = {
            total: els.length,
            hidden: els.filter((el) => getComputedStyle(el).display === 'none').length,
          };
        }
        const headers = Array.from(document.querySelectorAll('.print-header'));
        return {
          bodyFontFamily: body.fontFamily,
          bodyFontSize: body.fontSize,
          hiddenCounts,
          printHeaderShown: {
            total: headers.length,
            shown: headers.filter((el) => getComputedStyle(el).display === 'block').length,
          },
        };
      }, CHROME_SELECTORS);

      // preferCSSPageSize true, and deliberately NO margin option.
      printed = await page.pdf({ preferCSSPageSize: true });
    } finally {
      await page.close().catch(() => {});
    }

    // ---- 1. PRINT FONT FAMILY ----
    if (!printValues.bodyFontFamily.includes('Times New Roman')) {
      failures.push(
        `PRINT FONT FAMILY — expected the computed body font family under print media to contain ` +
          `"Times New Roman"; observed ${JSON.stringify(printValues.bodyFontFamily)}`,
      );
    }

    // ---- 2. PRINT FONT SIZE ----
    // 12 point at the reference resolution of 96 dots per inch is 16px.
    if (printValues.bodyFontSize !== '16px') {
      failures.push(
        `PRINT FONT SIZE — expected the computed body font size under print media to be "16px" ` +
          `(12pt at 96 dpi); observed ${JSON.stringify(printValues.bodyFontSize)}`,
      );
    }

    // ---- 3. PRINT CHROME VISIBLE ----
    // A selector matching zero elements passes: the results route may
    // legitimately render no .sidebar, and asserting a count would assert the
    // page's structure rather than the stylesheet's effect.
    for (const selector of CHROME_SELECTORS) {
      const { total, hidden } = printValues.hiddenCounts[selector];
      if (total > 0 && hidden !== total) {
        failures.push(
          `PRINT CHROME VISIBLE — selector ${JSON.stringify(selector)} matched ${total} element(s) ` +
            `under print media but only ${hidden} computed display:none; ${total - hidden} would ` +
            `still print`,
        );
      }
    }

    // ---- 4. PRINT ONLY HIDDEN ----
    const { total: headerTotal, shown: headerShown } = printValues.printHeaderShown;
    if (headerTotal > 0) {
      if (headerShown !== headerTotal) {
        failures.push(
          `PRINT ONLY HIDDEN — ${headerTotal} .print-header element(s) exist but only ${headerShown} ` +
            `computed display:block under print media`,
        );
      }
      if (screenPrintOnly.hidden === 0) {
        failures.push(
          `PRINT ONLY HIDDEN — none of the ${screenPrintOnly.total} .print-header element(s) was ` +
            `display:none on SCREEN, so the stylesheet is not actually switching them on for print`,
        );
      }
    }

    // ---- 5. PRINT PAGE SIZE ----
    let info;
    try {
      info = pdfPageInfo(printed);
    } catch (err) {
      if (err && err.message && err.message.startsWith(PDF_MARKERS.TOOLCHAIN_MISSING)) {
        throw new JourneyCannotRun(err.message);
      }
      throw err;
    }
    const widthPt = Math.round(info.widthPt);
    const heightPt = Math.round(info.heightPt);
    if (widthPt !== 595 || heightPt !== 842) {
      failures.push(
        `PRINT PAGE SIZE — expected the printed document to be A4 (595 x 842 pts); observed ` +
          `${info.widthPt} x ${info.heightPt} pts over ${info.pages} page(s)`,
      );
    }

    // ---- 6 and 7. the margins, measured edge-to-first-ink ----
    let pages;
    try {
      pages = rasterizePdfPages(printed, RASTER_DPI);
    } catch (err) {
      if (err && err.message && err.message.startsWith(PDF_MARKERS.TOOLCHAIN_MISSING)) {
        throw new JourneyCannotRun(err.message);
      }
      throw err;
    }

    const scan = firstInkOffsets(pages[0]);
    topInkPx = scan.topInkPx;
    leftInkPx = scan.leftInkPx;

    if (topInkPx === null || topInkPx < MIN_TOP_INK_PX) {
      failures.push(
        `PRINT TOP MARGIN — expected the first ink on page 1 to be at least ${MIN_TOP_INK_PX} px ` +
          `from the top edge at ${RASTER_DPI} dpi (25 mm is 98.4 px); observed ` +
          `${topInkPx === null ? 'no ink at all' : `${topInkPx} px`} on a ${scan.width}x${scan.height} raster`,
      );
    }
    if (leftInkPx === null || leftInkPx < MIN_LEFT_INK_PX) {
      failures.push(
        `PRINT LEFT MARGIN — expected the first ink on page 1 to be at least ${MIN_LEFT_INK_PX} px ` +
          `from the left edge at ${RASTER_DPI} dpi (20 mm is 78.7 px); observed ` +
          `${leftInkPx === null ? 'no ink at all' : `${leftInkPx} px`} on a ${scan.width}x${scan.height} raster`,
      );
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

  // Printed on BOTH paths — scripts/check-gate-skips.mjs reads this line
  // regardless of outcome and treats a missing line as a failure.
  console.log(`GATE-SKIPS total=${TOTAL_CHECKS} skipped=0`);

  if (failures.length > 0) {
    console.error(`PRINT LAYOUT FAIL checks=${TOTAL_CHECKS} failed=${failures.length}`);
    process.exit(1);
  }

  console.log(`PRINT LAYOUT PASS checks=${TOTAL_CHECKS} topInk=${topInkPx} leftInk=${leftInkPx}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`PRINT LAYOUT FAIL checks=? failed=? : ${err && err.stack ? err.stack : err}`);
  console.log(`GATE-SKIPS total=${TOTAL_CHECKS} skipped=0`);
  process.exit(1);
});

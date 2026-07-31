/*
 * journey/browser-probe.mjs — proof that launch + capture work, runnable in isolation.
 *
 * This probe goes through the shared launch helper (`./browser.mjs`) and never
 * imports the browser driver directly. That is the point: if a later plan starts
 * launching its own browser, this probe stops being evidence about the path the
 * gates actually use.
 *
 * Exits non-zero on any assertion failure (node:assert/strict throws).
 */

import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

import { launchBrowser, newJourneyPage, captureScreenshot } from './browser.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE = path.join(HERE, 'fixtures', 'basic.html');

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

async function main() {
  const browser = await launchBrowser();
  try {
    const page = await newJourneyPage(browser);
    await page.goto(pathToFileURL(FIXTURE).href);

    const first = await captureScreenshot(page);
    assert.ok(
      first.length > 1000,
      `expected a screenshot larger than 1000 bytes, got ${first.length}`,
    );
    assert.ok(
      Buffer.compare(first.subarray(0, 8), PNG_SIGNATURE) === 0,
      `expected a PNG signature, got ${first.subarray(0, 8).toString('hex')}`,
    );

    const second = await captureScreenshot(page);
    assert.ok(
      Buffer.compare(first, second) === 0,
      `two consecutive captures of the same page differed (${first.length} vs ${second.length} bytes)`,
    );

    const consoleErrors = page.__journeyConsoleErrors;
    assert.ok(Array.isArray(consoleErrors), 'page.__journeyConsoleErrors must be an array');
    assert.equal(
      consoleErrors.length,
      0,
      `expected zero console errors, got: ${JSON.stringify(consoleErrors)}`,
    );

    console.log(
      `BROWSER-PROBE ok bytes=${first.length} deterministic=true consoleErrors=${consoleErrors.length}`,
    );
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(`BROWSER-PROBE FAILED: ${err && err.message ? err.message : err}`);
  process.exit(1);
});

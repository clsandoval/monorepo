/*
 * journey/browser.mjs — the ONLY place in this repository that launches a browser.
 *
 * Every screenshot this project ever takes is captured through `newJourneyPage` +
 * `captureScreenshot` below. Nothing else may import `playwright` directly.
 *
 * The option values in this file are a DETERMINISM CONTRACT, not preferences.
 * Viewport size, device scale factor, reduced motion, forced colors, the injected
 * stylesheet that kills animations/transitions/the text caret, and the screenshot
 * options together are what make two runs of the same page on the same machine
 * produce byte-identical PNGs. A perceptual-diff gate that flickers is a gate the
 * loop learns to ignore.
 *
 * Changing ANY value in this file invalidates every approved reference image under
 * `frontend/journey/references/`. Re-approval is a deliberate, separate act — see
 * `frontend/journey/REFERENCES.md`.
 */

import { chromium } from 'playwright';

/** The determinism stylesheet, injected on every navigation. */
const DETERMINISM_CSS =
  '*, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }';

/**
 * Launch headless chromium with the fixed options.
 * @returns {Promise<import('playwright').Browser>}
 */
export async function launchBrowser() {
  return chromium.launch({ headless: true });
}

/**
 * Open a page at the fixed viewport, install the determinism stylesheet so it
 * survives navigation, and start capturing console errors and page errors into
 * `page.__journeyConsoleErrors` (an array of plain strings).
 *
 * @param {import('playwright').Browser} browser
 * @returns {Promise<import('playwright').Page>}
 */
export async function newJourneyPage(browser) {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
    forcedColors: 'none',
  });

  // Re-inject the determinism stylesheet after every navigation. `addInitScript`
  // runs before page scripts on each new document, so the DOMContentLoaded
  // listener it registers reinstalls the rule for every `page.goto`.
  await page.addInitScript((css) => {
    document.addEventListener('DOMContentLoaded', () => {
      const style = document.createElement('style');
      style.setAttribute('data-journey-determinism', 'true');
      style.textContent = css;
      document.head.appendChild(style);
    });
  }, DETERMINISM_CSS);

  const consoleErrors = [];
  page.__journeyConsoleErrors = consoleErrors;

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(String(msg.text()));
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(String(err && err.message ? err.message : err));
  });

  return page;
}

/**
 * Capture a full-page PNG. Returns a Buffer and writes NOTHING to disk —
 * plan 10-04 owns every disk write in this harness.
 *
 * @param {import('playwright').Page} page
 * @returns {Promise<Buffer>}
 */
export async function captureScreenshot(page) {
  return page.screenshot({ fullPage: true, animations: 'disabled' });
}

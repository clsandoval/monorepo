/*
 * journey/seo-smoke.mjs — the landing, blog and marketing smoke gate (JRNY-11).
 *
 * Three assertions per route, against the BUILT application in a real browser:
 *
 *   SEO RENDER FAILURE  the route rendered no <h1>, or its <h1> is empty
 *   SEO CONSOLE ERROR   the page logged something to console.error
 *   SEO BAD STATUS      some response observed while loading answered >= 400
 *
 * IT DELIBERATELY CHECKS NO LAYOUT. JRNY-11 asks for a smoke check, not for
 * layout freezing, and fourteen reference PNGs of long marketing pages would be
 * fourteen images to re-bless on every copy edit — on the one part of the
 * product where no peso figure appears. This file writes nothing to disk and
 * has no path that can create or update a reference image.
 *
 * "No 404" is implemented as the stronger, checkable thing. src/router.ts
 * declares no notFoundComponent, so there is no not-found screen to look for; a
 * route that does not exist renders the app shell with nothing in it. What IS
 * observable is the network: no response fetched while loading the route may
 * carry an HTTP status of 400 or above. No status is allow-listed and no route
 * is exempted — a real route that legitimately fetches something answering 4xx
 * is a finding to report, not a list to append to.
 *
 * The route list is committed data in seo-routes.json, not a scan of src/routes/.
 *
 * Exit contract, the project's three-valued one:
 *   0  every route passed
 *   1  at least one route failed
 *   2  the check could not start (no chromium, failed build, no preview server,
 *      invalid route list). Printed as `SEO CANNOT RUN:` on stderr. A could-not-
 *      run reported as a failure is how a long loop silently redefines success.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildApp, startPreview, JourneyCannotRun } from './serve.mjs';
import { launchBrowser, newJourneyPage } from './browser.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROUTES_PATH = path.join(HERE, 'seo-routes.json');

/** The settle window every registered journey step uses. */
const SETTLE_MS = 1200;

const MARKERS = Object.freeze({
  RENDER: 'SEO RENDER FAILURE',
  CONSOLE: 'SEO CONSOLE ERROR',
  STATUS: 'SEO BAD STATUS',
});

function cannotRun(reason) {
  console.error(`SEO CANNOT RUN: ${reason}`);
  process.exit(2);
}

/**
 * Read and validate the committed route list. A malformed list is a cannot-run,
 * never a route failure: nothing was checked, so nothing may be reported red.
 */
function readRoutes() {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(ROUTES_PATH, 'utf8'));
  } catch (err) {
    cannotRun(`SEO ROUTES INVALID: cannot read ${ROUTES_PATH}: ${err && err.message ? err.message : err}`);
  }

  const routes = parsed && parsed.routes;
  if (!Array.isArray(routes) || routes.length === 0) {
    cannotRun('SEO ROUTES INVALID: `routes` must be a non-empty array');
  }

  const seen = new Set();
  for (const [i, entry] of routes.entries()) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      cannotRun(`SEO ROUTES INVALID: routes[${i}] is not an object`);
    }
    const keys = Object.keys(entry).sort();
    if (keys.length !== 2 || keys[0] !== 'label' || keys[1] !== 'path') {
      cannotRun(
        `SEO ROUTES INVALID: routes[${i}] has keys [${keys.join(', ')}], expected exactly [label, path]`,
      );
    }
    for (const key of ['path', 'label']) {
      if (typeof entry[key] !== 'string' || entry[key].length === 0) {
        cannotRun(`SEO ROUTES INVALID: routes[${i}].${key} must be a non-empty string`);
      }
    }
    if (!entry.path.startsWith('/')) {
      cannotRun(`SEO ROUTES INVALID: routes[${i}].path '${entry.path}' does not start with '/'`);
    }
    if (seen.has(entry.path)) {
      cannotRun(`SEO ROUTES INVALID: routes[${i}].path '${entry.path}' is a duplicate`);
    }
    seen.add(entry.path);
  }

  return routes;
}

/**
 * Check one route. Collects EVERY failure rather than returning on the first,
 * so one run tells the whole truth about a page instead of one symptom of it.
 *
 * @returns {Promise<string[]>} zero or more fully-formatted failure lines
 */
async function checkRoute(browser, origin, route) {
  const page = await newJourneyPage(browser);
  const failures = [];
  /** @type {{url: string, status: number}[]} */
  const badResponses = [];

  // Registered BEFORE goto, so a response arriving during navigation is not missed.
  page.on('response', (response) => {
    const status = response.status();
    if (status >= 400) {
      badResponses.push({ url: response.url(), status });
    }
  });

  try {
    await page.goto(`${origin}${route.path}`, { waitUntil: 'load' });
    await page.waitForTimeout(SETTLE_MS);

    const heading = await page.evaluate(() => {
      const el = document.querySelector('h1');
      if (!el) return null;
      return (el.innerText || el.textContent || '').trim();
    });

    if (heading === null) {
      failures.push(`${MARKERS.RENDER} ${route.path} — no <h1> element exists on the page`);
    } else if (heading.length === 0) {
      failures.push(`${MARKERS.RENDER} ${route.path} — the first <h1> has empty text`);
    }

    const consoleErrors = page.__journeyConsoleErrors || [];
    if (consoleErrors.length > 0) {
      failures.push(
        `${MARKERS.CONSOLE} ${route.path} — ${consoleErrors.length} console error(s), first: ${consoleErrors[0]}`,
      );
    }

    if (badResponses.length > 0) {
      const first = badResponses[0];
      failures.push(
        `${MARKERS.STATUS} ${route.path} — ${badResponses.length} response(s) >= 400, first: HTTP ${first.status} ${first.url}`,
      );
    }
  } finally {
    await page.close().catch(() => {});
  }

  return failures;
}

async function main() {
  const routes = readRoutes();

  let preview = null;
  let browser = null;
  let failed = 0;

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

    for (const route of routes) {
      const failures = await checkRoute(browser, preview.origin, route);
      if (failures.length > 0) {
        failed += 1;
        for (const line of failures) console.error(line);
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

  // Printed on BOTH the pass and the fail path — scripts/check-gate-skips.mjs
  // reads this line out of the gate log regardless of outcome and treats a
  // missing line as a failure rather than as zero skips. Deliberately NOT
  // printed on the cannot-run path, where no route was ever checked.
  console.log(`GATE-SKIPS total=${routes.length} skipped=0`);

  if (failed > 0) {
    console.error(`SEO SMOKE FAIL routes=${routes.length} failed=${failed}`);
    process.exit(1);
  }
  console.log(`SEO SMOKE PASS routes=${routes.length} failed=0`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`SEO SMOKE FAIL routes=? failed=? : ${err && err.stack ? err.stack : err}`);
  process.exit(1);
});

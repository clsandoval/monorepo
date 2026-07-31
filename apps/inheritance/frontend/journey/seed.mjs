/*
 * journey/seed.mjs — the seeding seams every later journey gate calls.
 *
 * JRNY-01: any UI state a gate needs must be reachable WITHOUT clicking through the
 * steps before it. A real browser cannot reach into a React tree — it can set a URL,
 * a cookie, or web storage, and nothing else. These helpers are those seams.
 *
 * Storage is installed with `addInitScript`, never with an `evaluate` call after
 * navigation. An `evaluate` runs after the app has already mounted and read storage,
 * which is too late for a draft-recovery path — precisely the path Phase 11 has to
 * verify. `addInitScript` runs before any page script on every navigation, which is
 * the only correct seam.
 *
 * Web storage is origin-scoped and cannot be written from `about:blank`, so each
 * storage helper navigates to `origin` first when the page has not left about:blank.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES_PATH = path.resolve(HERE, '..', 'supabase', 'fixtures.json');

/** `GuidedIntakeForm.tsx:24` — the guided-intake draft key. */
export const INTAKE_DRAFT_KEY = 'inheritance-intake-draft';

/** `QuickCalcWidget.tsx:14` — the anonymous quick-calc gate key (sessionStorage). */
export const QUICK_CALC_KEY = 'quick-calc-used';

async function ensureOrigin(page, origin) {
  if (page.url() === 'about:blank' || page.url() === '') {
    await page.goto(origin);
  }
}

async function seedStorage(page, origin, entries, which) {
  await page.addInitScript(
    ({ pairs, store }) => {
      try {
        const target = store === 'local' ? window.localStorage : window.sessionStorage;
        for (const [k, v] of pairs) target.setItem(k, v);
      } catch {
        // Origin denied storage access; the caller's assertion will surface it.
      }
    },
    { pairs: Object.entries(entries), store: which },
  );
  await ensureOrigin(page, origin);
}

/** Install localStorage key/value pairs before first paint. */
export async function seedLocalStorage(page, origin, entries) {
  await seedStorage(page, origin, entries, 'local');
}

/** Install sessionStorage key/value pairs before first paint. */
export async function seedSessionStorage(page, origin, entries) {
  await seedStorage(page, origin, entries, 'session');
}

/**
 * Return `url` with the given search params applied. Callers never
 * string-concatenate a query string.
 */
export function seedSearchParams(url, params) {
  const u = new URL(url);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, String(v));
  return u.toString();
}

/**
 * Parse frontend/supabase/fixtures.json. Resolved relative to THIS module, so it
 * works regardless of the process working directory.
 */
export function readFixtures() {
  return JSON.parse(fs.readFileSync(FIXTURES_PATH, 'utf8'));
}

/**
 * Write a supabase-js session into localStorage before first paint.
 *
 * The storage key format `sb-<projectRef>-auth-token` is supabase-js's own
 * convention, derived from the first hostname label of the project URL. It is
 * DERIVED at runtime rather than hardcoded — and `seed-smoke.mjs` verifies that a
 * real session can actually be obtained against the live stack, rather than
 * trusting the derivation on faith.
 */
export async function seedAuthSession(page, origin, session) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || origin;
  const ref = new URL(supabaseUrl).hostname.split('.')[0];
  const key = `sb-${ref}-auth-token`;

  await page.addInitScript(
    ({ storageKey, value }) => {
      try {
        window.localStorage.setItem(storageKey, value);
      } catch {
        // Origin denied storage access; the caller's assertion will surface it.
      }
    },
    { storageKey: key, value: JSON.stringify(session) },
  );
  await ensureOrigin(page, origin);
  return key;
}

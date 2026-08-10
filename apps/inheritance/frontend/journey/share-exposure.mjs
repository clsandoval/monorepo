/*
 * journey/share-exposure.mjs — the anonymous data path stays DELETED (JRNY-08).
 *
 * RESTORED 2026-08-10 by the H1 hardening loop under owner delegation, with its
 * contract inverted to match the product that exists now. The original file
 * asserted that `get_shared_case` — then the product's ONE anonymous data path —
 * returned exactly six columns. cut(01)/cut(02) deleted the share feature, and
 * migration 017 dropped the function itself, which had outlived its feature as
 * an orphaned SECURITY DEFINER anon-executable (measured live 2026-08-10).
 *
 * What this gate proves now: the product has NO anonymous data path, and the
 * deleted one cannot silently come back. A red run here means someone
 * resurrected anonymous access without a reviewed migration and without
 * changing this contract in front of a human — which is exactly the event this
 * file exists to make loud. Do not edit the checks to match a new response.
 *
 * Exit contract, the project's three-valued one: 0 passed, 1 failed, 2 could
 * not run. Every check is evaluated; none short-circuits.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';

import { readStackEnv } from './session.mjs';
import { readFixtures } from './seed.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.resolve(HERE, '..', 'supabase', 'migrations');
const SRC_DIR = path.resolve(HERE, '..', 'src');

const TOTAL_CHECKS = 4;

function cannotRun(reason) {
  console.error(`SHARE EXPOSURE CANNOT RUN: ${reason}`);
  process.exit(2);
}

/** Recursively list files under a dir (src/ holds no cycles or symlinks). */
function listFiles(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(p));
    else out.push(p);
  }
  return out;
}

async function main() {
  const env = readStackEnv();
  if (env === null || !env.API_URL) cannotRun('local Supabase stack is not running');
  if (!env.ANON_KEY) cannotRun('the local stack reported no ANON_KEY');

  const failures = [];
  const fixtures = readFixtures();

  // 1. ANONYMOUS ON PURPOSE: calling the dropped RPC with the seeded Alpha
  //    share token must answer "no such function" (PostgREST PGRST202 → 404),
  //    never a row. A service-role key would make this check worthless.
  const res = await fetch(`${env.API_URL}/rest/v1/rpc/get_shared_case`, {
    method: 'POST',
    headers: {
      apikey: env.ANON_KEY,
      Authorization: `Bearer ${env.ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_token: fixtures.orgs.alpha.share_token ?? '00000000-0000-4000-8000-0000000000fe' }),
  });
  if (res.status !== 404) {
    const body = (await res.text()).slice(0, 200);
    failures.push(
      `SHARE PATH RESURRECTED — anon rpc get_shared_case answered HTTP ${res.status} (expected 404 function-not-found): ${body}`,
    );
  }

  // 2. The anon role must not read the cases table directly either.
  const anon = createClient(env.API_URL, env.ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: anonRows, error: anonErr } = await anon.from('cases').select('id').limit(1);
  if (!anonErr && Array.isArray(anonRows) && anonRows.length > 0) {
    failures.push('SHARE PATH RESURRECTED — anon role read a row from cases directly');
  }

  // 3. Source-level resurrection guard: no module under src/ names the RPC.
  const callers = listFiles(SRC_DIR).filter(
    (p) => /\.(ts|tsx)$/.test(p) && !/__tests__/.test(p) && fs.readFileSync(p, 'utf8').includes('get_shared_case'),
  );
  if (callers.length > 0) {
    failures.push(`SHARE PATH RESURRECTED — src/ names get_shared_case: ${callers.join(', ')}`);
  }

  // 4. Migration-level guard: the drop exists, and no LATER migration re-creates
  //    the function (lexicographic filename order is migration order).
  const migrations = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort();
  const dropIdx = migrations.findIndex((f) =>
    fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8').match(/DROP FUNCTION IF EXISTS public\.get_shared_case/),
  );
  if (dropIdx === -1) {
    failures.push('SHARE PATH RESURRECTED — no migration drops public.get_shared_case');
  } else {
    const recreators = migrations
      .slice(dropIdx + 1)
      .filter((f) => /CREATE (OR REPLACE )?FUNCTION (public\.)?get_shared_case/i.test(fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8')));
    if (recreators.length > 0) {
      failures.push(`SHARE PATH RESURRECTED — migration(s) after the drop re-create it: ${recreators.join(', ')}`);
    }
  }

  // Read by scripts/check-gate-skips.mjs on pass and fail alike; deliberately
  // absent on the cannot-run path, where nothing was checked.
  console.log(`GATE-SKIPS total=${TOTAL_CHECKS} skipped=0`);

  for (const line of failures) console.error(line);
  if (failures.length > 0) {
    console.error(`SHARE EXPOSURE FAIL checks=${TOTAL_CHECKS} failed=${failures.length}`);
    process.exit(1);
  }
  console.log(`SHARE EXPOSURE PASS checks=${TOTAL_CHECKS} failed=0`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`SHARE EXPOSURE FAIL: ${err && err.stack ? err.stack : err}`);
  process.exit(1);
});

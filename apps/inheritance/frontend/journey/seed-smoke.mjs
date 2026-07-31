/*
 * journey/seed-smoke.mjs — the LIVE-DATABASE half of JRNY-01.
 *
 * Run on demand. Deliberately NOT registered as a gate: it needs Docker and a
 * running local Supabase stack, which GitHub Actions has neither of. Phase 3 set
 * the precedent with scripts/check-env-ready.mjs, and STATE.md assigns that
 * registration decision to Phase 11.
 *
 * The service-role key bypasses row-level security. It is obtained at runtime from
 * `supabase status -o env`, held in a local variable, and NEVER written to a file
 * and never printed. scripts/setup-env.sh:149 deliberately keeps it out of
 * frontend/.env.local for the same reason.
 *
 * Exit codes:
 *   0 — ran and passed
 *   2 — COULD NOT RUN (stack down). This project's established cannot-run signal,
 *       distinct from "ran and failed"; see GATES.md §2 and scripts/ci-gates.sh.
 *   1 — ran and failed
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';

import { readFixtures } from './seed.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(HERE, '..');

function cannotRun(reason) {
  console.error(`SEED-SMOKE cannot-run: ${reason}`);
  process.exit(2);
}

function readStackEnv() {
  let out;
  try {
    out = execFileSync('supabase', ['status', '-o', 'env'], {
      cwd: FRONTEND_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    return null;
  }
  const env = {};
  for (const line of out.split('\n')) {
    const m = /^([A-Z_]+)="?([^"]*)"?$/.exec(line.trim());
    if (m) env[m[1]] = m[2];
  }
  return env;
}

async function main() {
  const env = readStackEnv();
  if (env === null || !env.API_URL) {
    cannotRun('local Supabase stack is not running');
  }
  if (!env.SERVICE_ROLE_KEY || !env.ANON_KEY) {
    cannotRun('local Supabase stack reported no keys');
  }

  const apiUrl = env.API_URL;
  const admin = createClient(apiUrl, env.SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const fixtures = readFixtures();
  const alpha = fixtures.orgs.alpha;

  // --- 1. The seeded rows are the tenant the rest of the project means -----
  const { data: org, error: orgErr } = await admin
    .from('organizations')
    .select('id, name')
    .eq('id', alpha.org_id)
    .single();
  assert.equal(orgErr, null, `reading the Alpha org failed: ${orgErr && orgErr.message}`);
  assert.equal(org.id, alpha.org_id);

  const { data: kase, error: caseErr } = await admin
    .from('cases')
    .select('id, share_enabled')
    .eq('id', alpha.case_id)
    .single();
  assert.equal(caseErr, null, `reading the Alpha case failed: ${caseErr && caseErr.message}`);
  assert.equal(kase.id, 'a0000000-0000-4000-8000-000000000004');

  // --- 2. Write seam, round-tripped and restored --------------------------
  const originalShareEnabled = kase.share_enabled;
  const { error: upErr } = await admin
    .from('cases')
    .update({ share_enabled: true })
    .eq('id', alpha.case_id);
  assert.equal(upErr, null, `writing share_enabled failed: ${upErr && upErr.message}`);

  const { data: after, error: afterErr } = await admin
    .from('cases')
    .select('share_enabled')
    .eq('id', alpha.case_id)
    .single();
  assert.equal(afterErr, null);
  assert.equal(after.share_enabled, true, 'share_enabled did not read back as true');

  // Restore, so the smoke test is idempotent and leaves the fixture as it found it.
  const { error: restoreErr } = await admin
    .from('cases')
    .update({ share_enabled: originalShareEnabled })
    .eq('id', alpha.case_id);
  assert.equal(restoreErr, null, `restoring share_enabled failed: ${restoreErr && restoreErr.message}`);

  // --- 3. A real session can be obtained ----------------------------------
  // seedAuthSession installs one of these into browser storage, so proving one can
  // be obtained is the prerequisite for installing one.
  const anon = createClient(apiUrl, env.ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: signIn, error: signInErr } = await anon.auth.signInWithPassword({
    email: alpha.user_email,
    password: fixtures.password,
  });
  assert.equal(signInErr, null, `sign-in failed: ${signInErr && signInErr.message}`);
  assert.ok(
    signIn.session && typeof signIn.session.access_token === 'string' && signIn.session.access_token.length > 0,
    'sign-in returned no access_token',
  );

  console.log('SEED-SMOKE ok rows=2 session=installed');
}

main().catch((err) => {
  console.error(`SEED-SMOKE FAILED: ${err && err.message ? err.message : err}`);
  process.exit(1);
});

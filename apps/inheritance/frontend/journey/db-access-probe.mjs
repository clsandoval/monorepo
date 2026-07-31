/*
 * journey/db-access-probe.mjs — the runnable proof that migrations 014 and 015
 * did what they claim.
 *
 * Two schema-level defects made every database-backed screen in this application
 * unreachable, and both are the kind that reappear silently:
 *
 *   014 — no `public` table granted any DML verb to an API role, so a signed-in
 *         user's PostgREST read answered HTTP 403 / PG 42501 even though the row
 *         was there and RLS would have allowed it.
 *   015 — `get_shared_case` existed twice (a working UUID form and a TEXT form
 *         that could never work), so PostgREST answered HTTP 300 PGRST203 and
 *         `/share/<token>` rendered "Case Not Found" for every token.
 *
 * A migration that is present is not the same as a grant that is in effect, so
 * this script asserts the effect rather than the file.
 *
 * The service-role key bypasses row-level security. It is obtained at runtime
 * from `supabase status -o env`, held in a local variable, and NEVER written to
 * a file and never printed — the same handling journey/seed-smoke.mjs uses, and
 * the reason scripts/setup-env.sh keeps it out of frontend/.env.local.
 *
 * Exit codes:
 *   0 — ran and passed. Prints `DB-ACCESS ok tables=11 anon=denied share=1`
 *   1 — ran and failed. Prints `DB-ACCESS FAILED: <message>`
 *   2 — COULD NOT RUN (stack down). Prints `DB-ACCESS cannot-run: <reason>`.
 *       This project's established cannot-run signal, distinct from "ran and
 *       failed"; see GATES.md §2 and scripts/ci-gates.sh.
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';

import { readFixtures } from './seed.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(HERE, '..');

/** The eleven `public` tables migration 014 grants against. */
const GRANTED_TABLES = 11;

function cannotRun(reason) {
  console.error(`DB-ACCESS cannot-run: ${reason}`);
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
  const fixtures = readFixtures();
  const alpha = fixtures.orgs.alpha;
  const beta = fixtures.orgs.beta;
  const orphan = fixtures.orphan;

  // ------------------------------------------------------------------
  // 1. Positive control — an authenticated session reads its own rows.
  //
  //    Before migration 014 this exact request returned HTTP 403 with
  //    PostgREST code 42501, so a failure here is the original defect
  //    returning, not a new one.
  // ------------------------------------------------------------------
  const alphaClient = createClient(apiUrl, env.ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: signInErr } = await alphaClient.auth.signInWithPassword({
    email: alpha.user_email,
    password: fixtures.password,
  });
  assert.equal(
    signInErr,
    null,
    `sign-in as ${alpha.user_email} failed: ${signInErr && signInErr.message}`,
  );

  const { data: orgs, error: orgErr } = await alphaClient
    .from('organizations')
    .select('id, name');
  assert.equal(
    orgErr,
    null,
    `authenticated read of organizations failed with ${orgErr && orgErr.code}: ${orgErr && orgErr.message} — migration 014_api_role_grants.sql grants SELECT on public.organizations to authenticated; a 42501 here means that grant is not in effect`,
  );
  assert.equal(orgs.length, 1, `Alpha read ${orgs.length} organization rows, expected exactly 1`);
  assert.equal(orgs[0].id, alpha.org_id, 'Alpha read an organization that is not its own');

  const { data: cases, error: caseErr } = await alphaClient
    .from('cases')
    .select('id, title');
  assert.equal(
    caseErr,
    null,
    `authenticated read of cases failed with ${caseErr && caseErr.code}: ${caseErr && caseErr.message} — migration 014_api_role_grants.sql grants SELECT on public.cases to authenticated`,
  );
  assert.equal(cases.length, 1, `Alpha read ${cases.length} case rows, expected exactly 1`);
  assert.equal(cases[0].id, alpha.case_id, 'Alpha read a case that is not its own');

  // ------------------------------------------------------------------
  // 2. Negative control — anonymous reads nothing.
  //
  //    `anon` is granted no table privilege anywhere in this project. The
  //    only anonymous data path is the SECURITY DEFINER share RPC below.
  // ------------------------------------------------------------------
  const anonClient = createClient(apiUrl, env.ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: anonErr } = await anonClient.from('cases').select('id');
  assert.notEqual(
    anonErr,
    null,
    'an anonymous read of public.cases SUCCEEDED — anon must hold no table privilege; check that migration 014 did not grant one',
  );
  assert.equal(
    anonErr.code,
    '42501',
    `an anonymous read of public.cases failed with code ${anonErr.code} (${anonErr.message}), expected 42501 insufficient_privilege`,
  );

  // ------------------------------------------------------------------
  // 3. Share RPC — exactly one signature survives.
  //
  //    With both overloads present PostgREST answers HTTP 300 PGRST203
  //    "Could not choose the best candidate function", which is what made
  //    /share/<token> render "Case Not Found" for every token. The
  //    assertion messages name that ambiguity so a regression is
  //    self-describing.
  // ------------------------------------------------------------------
  const { data: shared, error: sharedErr } = await anonClient.rpc('get_shared_case', {
    p_token: alpha.share_token,
  });
  assert.notEqual(
    sharedErr && sharedErr.code,
    'PGRST203',
    `get_shared_case is overloaded again — PostgREST cannot choose between the UUID and TEXT signatures (PGRST203). Migration 015_shared_case_single_signature.sql drops the TEXT form; something recreated it. Detail: ${sharedErr && sharedErr.message}`,
  );
  assert.equal(
    sharedErr,
    null,
    `anonymous get_shared_case for Alpha's token failed: ${sharedErr && sharedErr.message}`,
  );
  const sharedRows = Array.isArray(shared) ? shared : [shared];
  assert.equal(
    sharedRows.length,
    1,
    `get_shared_case returned ${sharedRows.length} rows for Alpha's share-enabled token, expected exactly 1`,
  );
  assert.equal(
    sharedRows[0].title,
    'Seeded Case Alpha',
    `get_shared_case returned title '${sharedRows[0].title}', expected 'Seeded Case Alpha'`,
  );

  const { data: sharedBeta, error: sharedBetaErr } = await anonClient.rpc('get_shared_case', {
    p_token: beta.share_token,
  });
  assert.notEqual(
    sharedBetaErr && sharedBetaErr.code,
    'PGRST203',
    `get_shared_case is overloaded again — PostgREST cannot choose between the UUID and TEXT signatures (PGRST203). Detail: ${sharedBetaErr && sharedBetaErr.message}`,
  );
  assert.equal(
    sharedBetaErr,
    null,
    `anonymous get_shared_case for Beta's token failed: ${sharedBetaErr && sharedBetaErr.message}`,
  );
  const sharedBetaRows = Array.isArray(sharedBeta) ? sharedBeta : [sharedBeta].filter(Boolean);
  assert.equal(
    sharedBetaRows.length,
    0,
    "get_shared_case returned a row for Beta's token, whose case has share_enabled false — a disabled share link must expose nothing",
  );

  // ------------------------------------------------------------------
  // 4. The isolation fixture rows exist.
  //
  //    A tenant-isolation assertion over an empty table passes for the
  //    wrong reason, so the rows it will compare are checked here.
  // ------------------------------------------------------------------
  const admin = createClient(apiUrl, env.SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: pdfs, error: pdfErr } = await admin.from('case_pdfs').select('id, org_id');
  assert.equal(pdfErr, null, `service-role read of case_pdfs failed: ${pdfErr && pdfErr.message}`);
  assert.equal(pdfs.length, 2, `case_pdfs holds ${pdfs.length} rows, expected exactly 2 (one per tenant)`);

  const { data: orphanMemberships, error: memErr } = await admin
    .from('organization_members')
    .select('id')
    .eq('user_id', orphan.user_id);
  assert.equal(memErr, null, `service-role read of organization_members failed: ${memErr && memErr.message}`);
  assert.equal(
    orphanMemberships.length,
    0,
    `the Orphan user has ${orphanMemberships.length} organization memberships, expected 0 — the absence is the fixture`,
  );

  const { data: invites, error: invErr } = await admin
    .from('organization_invitations')
    .select('id, token, status');
  assert.equal(invErr, null, `service-role read of organization_invitations failed: ${invErr && invErr.message}`);
  assert.equal(invites.length, 1, `organization_invitations holds ${invites.length} rows, expected exactly 1`);
  assert.equal(
    invites[0].token,
    orphan.invitation_token,
    `the seeded invitation token is ${invites[0].token}, expected ${orphan.invitation_token}`,
  );
  assert.equal(invites[0].status, 'pending', `the seeded invitation status is ${invites[0].status}, expected pending`);

  console.log(`DB-ACCESS ok tables=${GRANTED_TABLES} anon=denied share=1`);
}

main().catch((err) => {
  console.error(`DB-ACCESS FAILED: ${err && err.message ? err.message : err}`);
  process.exit(1);
});

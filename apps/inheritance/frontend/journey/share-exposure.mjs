/*
 * journey/share-exposure.mjs — what the one anonymous data path exposes (JRNY-08).
 *
 * `get_shared_case` is the only function in this product an unauthenticated
 * caller may execute, and it is SECURITY DEFINER precisely so it can bypass RLS
 * for the single row a valid token names. That makes its returned column list a
 * security boundary rather than an implementation detail.
 *
 * THE SIX EXPECTED NAMES BELOW ARE TRANSCRIBED FROM
 * supabase/migrations/015_shared_case_single_signature.sql, whose RETURNS TABLE
 * lists exactly: title, status, input_json, output_json, decedent_name,
 * date_of_death. Migration 015's own header records that the superseded TEXT
 * overload returned eight columns -- two extra output blobs no client reads --
 * and that widening what an anonymous share link exposes is an OWNER DECISION.
 *
 * So a red run here means the contract moved, not that this check is stale. Do
 * not edit the arrays to match a new response; that is the one edit which would
 * turn this file from a gate into a mirror.
 *
 * Exit contract, the project's three-valued one: 0 passed, 1 failed, 2 could not
 * run. Every check is evaluated; none short-circuits, so one run reports the
 * whole truth about the boundary.
 */

import { createClient } from '@supabase/supabase-js';

import { readStackEnv } from './session.mjs';
import { readFixtures } from './seed.mjs';

/** Transcribed from migration 015's RETURNS TABLE, in its order. */
const EXPECTED_FIELDS = Object.freeze([
  'title',
  'status',
  'input_json',
  'output_json',
  'decedent_name',
  'date_of_death',
]);

/**
 * Names that must never reach an anonymous caller: the tenancy keys that would
 * let one firm enumerate another, the token and flag that control sharing
 * itself, and the three blobs the superseded overload leaked.
 */
const FORBIDDEN_FIELDS = Object.freeze([
  'id',
  'org_id',
  'user_id',
  'client_id',
  'share_token',
  'share_enabled',
  'tax_input_json',
  'tax_output_json',
  'comparison_output_json',
]);

/*
 * A token belonging to no case. Deliberately ONE DIGIT different from the
 * refusal token scripts/check-journey-registry.mjs declares (…ff), so the two
 * can never be confused, and it appears in no step url so no static rule sees it.
 */
const ABSENT_TOKEN = '00000000-0000-4000-8000-0000000000fe';

const TOTAL_CHECKS = 6;

function cannotRun(reason) {
  console.error(`SHARE EXPOSURE CANNOT RUN: ${reason}`);
  process.exit(2);
}

async function main() {
  const env = readStackEnv();
  if (env === null || !env.API_URL) {
    cannotRun('local Supabase stack is not running');
  }
  if (!env.ANON_KEY) {
    cannotRun('the local stack reported no ANON_KEY');
  }

  // ANONYMOUS ON PURPOSE. This check is worthless with a service-role key: that
  // key bypasses everything, so it would pass against any function whatsoever.
  const anon = createClient(env.API_URL, env.ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const fixtures = readFixtures();
  const failures = [];

  const alpha = await anon.rpc('get_shared_case', {
    p_token: fixtures.orgs.alpha.share_token,
  });

  // 1. The call itself must succeed. A PostgREST error here (PGRST203, 42883)
  //    means the signature moved, which migration 015 exists to prevent.
  if (alpha.error) {
    failures.push(
      `SHARE RPC ERROR — get_shared_case(alpha) returned ${alpha.error.code ?? '?'}: ${alpha.error.message}`,
    );
  }

  const rows = Array.isArray(alpha.data) ? alpha.data : [];

  // 2. Exactly one row for a valid, enabled token.
  if (rows.length !== 1) {
    failures.push(`SHARE ROW COUNT — expected exactly 1 row for the Alpha token, observed ${rows.length}`);
  }

  const row = rows[0];
  const observed = row ? Object.keys(row).sort() : [];
  const expectedSorted = [...EXPECTED_FIELDS].sort();

  // 3. The key set must equal the six expected names EXACTLY — not "contains",
  //    which would pass a widened response.
  if (observed.length !== expectedSorted.length || observed.some((k, i) => k !== expectedSorted[i])) {
    failures.push(
      `SHARE FIELD SET — expected exactly [${expectedSorted.join(', ')}], observed [${observed.join(', ')}]`,
    );
  }

  // 4. And none of the nine forbidden names, checked independently so a leak is
  //    named even when the set comparison already failed.
  const leaked = FORBIDDEN_FIELDS.filter((f) => observed.includes(f));
  if (leaked.length > 0) {
    failures.push(`SHARE FIELD LEAKED — forbidden column(s) present in the anonymous response: ${leaked.join(', ')}`);
  }

  // 5. Beta's share_enabled is FALSE: a real token whose sharing is off must
  //    return nothing. This is the negative control for the positive above.
  const beta = await anon.rpc('get_shared_case', {
    p_token: fixtures.orgs.beta.share_token,
  });
  const betaRows = Array.isArray(beta.data) ? beta.data : [];
  if (beta.error || betaRows.length !== 0) {
    failures.push(
      `SHARE DISABLED LEAK — the Beta token has share_enabled=false but returned ${betaRows.length} row(s)` +
        (beta.error ? ` with error ${beta.error.code ?? '?'}: ${beta.error.message}` : ''),
    );
  }

  // 6. A token belonging to no case must return nothing rather than erroring or
  //    guessing.
  const unknown = await anon.rpc('get_shared_case', { p_token: ABSENT_TOKEN });
  const unknownRows = Array.isArray(unknown.data) ? unknown.data : [];
  if (unknown.error || unknownRows.length !== 0) {
    failures.push(
      `SHARE UNKNOWN TOKEN — a token belonging to no case returned ${unknownRows.length} row(s)` +
        (unknown.error ? ` with error ${unknown.error.code ?? '?'}: ${unknown.error.message}` : ''),
    );
  }

  for (const line of failures) console.error(line);

  // Printed on BOTH the pass and the fail path — scripts/check-gate-skips.mjs
  // reads this line regardless of outcome and treats a missing line as failure.
  console.log(`GATE-SKIPS total=${TOTAL_CHECKS} skipped=0`);

  if (failures.length > 0) {
    console.error(`SHARE EXPOSURE FAIL checks=${TOTAL_CHECKS} failed=${failures.length}`);
    process.exit(1);
  }
  console.log(`SHARE EXPOSURE PASS fields=${EXPECTED_FIELDS.length} forbidden=${leaked.length}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`SHARE EXPOSURE FAIL checks=? failed=? : ${err && err.stack ? err.stack : err}`);
  process.exit(1);
});

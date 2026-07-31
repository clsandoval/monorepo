#!/usr/bin/env node
/*
 * journey/rls-isolation.mjs — the runnable proof of COV-06.
 *
 * "A user in org A cannot read, write or enumerate org B's cases, PDFs or shared
 * links" is one sentence, and the trap inside it is the whole difficulty. Before
 * migration 014, an isolation assertion would have passed for entirely the wrong
 * reason: every table answered HTTP 403 / 42501 to every API role, so "org A sees
 * none of org B's rows" was true because org A saw NO rows at all. `case_pdfs` had
 * the same problem from the other side — it held zero rows, so the assertion held
 * over an empty table.
 *
 * That is the failure mode this project exists to prevent, so EVERY negative here
 * is paired with a positive control on the same table with the same verb. A suite
 * whose control fails is a red suite, not a green one.
 *
 * The two negative outcomes are kept distinct on purpose:
 *   no-rows — the request SUCCEEDED and returned nothing. That is row-level security.
 *   denied  — the request FAILED with PostgREST code 42501. That is a missing grant.
 * Collapsing them would stop a red run from saying which mechanism produced it.
 *
 * NO ISOLATION ASSERTION IS MADE THROUGH THE SERVICE-ROLE CLIENT. That client
 * bypasses RLS, so using it for an assertion would make the assertion vacuous. It
 * is used only to establish and check the fixture preconditions, and its key is
 * read at runtime into a local variable — never written to a file, never printed.
 *
 * Exit codes:
 *   0 — every case matched.  `ISOLATION ok cases=14 surfaces=4`
 *   1 — a case did not.      `ISOLATION FAILED <id>: expected <e>, got <o>` per failure
 *   2 — the stack is down.   `ISOLATION cannot-run: <reason>`
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';

import { readFixtures } from './seed.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(HERE, '..');
const CASES_PATH = path.join(HERE, 'isolation-cases.json');

/*
 * The id used by the cross-tenant INSERT probe. This is the ONE uuid written
 * literally in this file, and deliberately so: it must NOT be a fixture id. It
 * names a row that should never come into existence, and the suite deletes it
 * before and after the case loop so a previous interrupted run cannot decide the
 * outcome. Every other id in this file comes from readFixtures().
 */
const PROBE_PDF_ID = 'f0000000-0000-4000-8000-000000000001';

function cannotRun(reason) {
  console.error(`ISOLATION cannot-run: ${reason}`);
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

/** rows | no-rows | denied | error:<code> — the observed outcome vocabulary. */
function classify({ data, error }) {
  if (error) {
    if (error.code === '42501') return 'denied';
    return `error:${error.code || 'unknown'}`;
  }
  const rows = Array.isArray(data) ? data : (data == null ? [] : [data]);
  return rows.length > 0 ? 'rows' : 'no-rows';
}

async function main() {
  const env = readStackEnv();
  if (env === null || !env.API_URL) cannotRun('local Supabase stack is not running');
  if (!env.SERVICE_ROLE_KEY || !env.ANON_KEY) cannotRun('local Supabase stack reported no keys');

  const fixtures = readFixtures();
  const alpha = fixtures.orgs.alpha;
  const beta = fixtures.orgs.beta;

  const admin = createClient(env.API_URL, env.SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // ------------------------------------------------------------------
  // Preconditions. A missing fixture is an ENVIRONMENT fact, so it is a
  // cannot-run rather than a failure — reporting it as a failed isolation
  // assertion would send someone hunting a policy bug that is not there.
  // ------------------------------------------------------------------
  {
    const { data: pdfs, error } = await admin.from('case_pdfs').select('id, org_id');
    if (error) cannotRun(`could not read case_pdfs as service_role: ${error.message}`);
    const seeded = pdfs.filter((p) => p.id !== PROBE_PDF_ID);
    if (seeded.length !== 2) {
      cannotRun(`case_pdfs holds ${seeded.length} seeded rows, expected 2 — run 'npx supabase db reset --local'`);
    }
  }
  {
    const { data: cases, error } = await admin
      .from('cases')
      .select('id, share_enabled')
      .in('id', [alpha.case_id, beta.case_id]);
    if (error) cannotRun(`could not read cases as service_role: ${error.message}`);
    if (cases.length !== 2) cannotRun(`expected both tenants' cases to exist, found ${cases.length}`);
    const a = cases.find((c) => c.id === alpha.case_id);
    const b = cases.find((c) => c.id === beta.case_id);
    if (a.share_enabled !== true) cannotRun("Alpha's case must have share_enabled true");
    if (b.share_enabled !== false) cannotRun("Beta's case must have share_enabled false");
  }

  // A previous interrupted run must not decide pdfs-alpha-inserts-beta.
  await admin.from('case_pdfs').delete().eq('id', PROBE_PDF_ID);

  // ------------------------------------------------------------------
  // Actor clients. Each carries a REAL access token from a real password
  // grant, so every request below travels the same path the browser does.
  // ------------------------------------------------------------------
  async function actorClient(who) {
    const anon = createClient(env.API_URL, env.ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    if (who === 'anon') return anon;
    const email = who === 'alpha' ? alpha.user_email : beta.user_email;
    const { error } = await anon.auth.signInWithPassword({ email, password: fixtures.password });
    if (error) cannotRun(`could not sign in as ${who} (${email}): ${error.message}`);
    return anon;
  }

  const clients = {
    anon: await actorClient('anon'),
    alpha: await actorClient('alpha'),
    beta: await actorClient('beta'),
  };

  const own = { alpha, beta };
  const other = { alpha: beta, beta: alpha };

  async function runCase(kase) {
    const client = clients[kase.actor];
    const mine = own[kase.actor] || alpha;
    const theirs = other[kase.actor] || beta;

    if (kase.surface === 'org') {
      const target = kase.operation === 'read-own' ? mine.org_id : theirs.org_id;
      return classify(await client.from('organizations').select('id, name').eq('id', target));
    }

    if (kase.surface === 'cases') {
      if (kase.operation === 'read-own') {
        if (kase.actor === 'anon') {
          return classify(await client.from('cases').select('id'));
        }
        return classify(await client.from('cases').select('id, title').eq('id', mine.case_id));
      }
      if (kase.operation === 'read-other') {
        return classify(await client.from('cases').select('id, title').eq('id', theirs.case_id));
      }
      // update-own / update-other. The current status is written back
      // unchanged, so the UPDATE policy is exercised without altering content.
      const targetId = kase.operation === 'update-own' ? mine.case_id : theirs.case_id;
      const { data: current, error: readErr } = await admin
        .from('cases')
        .select('status')
        .eq('id', targetId)
        .single();
      if (readErr) cannotRun(`could not read current status of ${targetId}: ${readErr.message}`);
      return classify(
        await client.from('cases').update({ status: current.status }).eq('id', targetId).select('id'),
      );
    }

    if (kase.surface === 'pdfs') {
      if (kase.operation === 'read-own') {
        return classify(await client.from('case_pdfs').select('id').eq('id', mine.pdf_id));
      }
      if (kase.operation === 'read-other') {
        return classify(await client.from('case_pdfs').select('id').eq('id', theirs.pdf_id));
      }
      // insert-other
      return classify(
        await client
          .from('case_pdfs')
          .insert({
            id: PROBE_PDF_ID,
            case_id: theirs.case_id,
            user_id: theirs.user_id,
            org_id: theirs.org_id,
            pdf_type: 'distribution_summary',
            storage_key: 'probe/cross-tenant-insert.pdf',
            file_size: 1,
          })
          .select('id'),
      );
    }

    // share-links
    if (kase.operation === 'rpc-own-token') {
      return classify(await client.rpc('get_shared_case', { p_token: alpha.share_token }));
    }
    if (kase.operation === 'rpc-other-token') {
      return classify(await client.rpc('get_shared_case', { p_token: beta.share_token }));
    }
    // read-other: enumerating the OTHER tenant's share token out of `cases`.
    return classify(
      await client.from('cases').select('share_token').eq('id', theirs.case_id),
    );
  }

  // ------------------------------------------------------------------
  // The case loop
  // ------------------------------------------------------------------
  const cases = JSON.parse(fs.readFileSync(CASES_PATH, 'utf8')).cases;
  const perSurface = new Map();
  let failed = 0;

  for (const kase of cases) {
    if (!perSurface.has(kase.surface)) perSurface.set(kase.surface, { pass: 0, fail: 0 });
    const tally = perSurface.get(kase.surface);

    let observed;
    try {
      observed = await runCase(kase);
    } catch (err) {
      observed = `threw:${err && err.message ? err.message : err}`;
    }

    if (observed === kase.expect) {
      tally.pass += 1;
    } else {
      tally.fail += 1;
      failed += 1;
      console.error(`ISOLATION FAILED ${kase.id}: expected ${kase.expect}, got ${observed}`);
    }
  }

  // Leave the database exactly as it was found.
  await admin.from('case_pdfs').delete().eq('id', PROBE_PDF_ID);

  for (const surface of ['org', 'cases', 'pdfs', 'share-links']) {
    const tally = perSurface.get(surface) || { pass: 0, fail: 0 };
    console.log(`ISOLATION SURFACE ${surface.padEnd(11)} pass=${tally.pass} fail=${tally.fail}`);
  }

  // Printed on BOTH the pass and the fail path; scripts/check-gate-skips.mjs
  // reads this line regardless of outcome and treats a missing line as failure.
  console.log(`GATE-SKIPS total=${cases.length} skipped=0`);

  if (failed > 0) {
    console.error(`ISOLATION FAILED cases=${cases.length} failed=${failed}`);
    process.exit(1);
  }
  console.log(`ISOLATION ok cases=${cases.length} surfaces=${perSurface.size}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(`ISOLATION FAILED cases=? failed=? : ${err && err.message ? err.message : err}`);
  process.exit(1);
});

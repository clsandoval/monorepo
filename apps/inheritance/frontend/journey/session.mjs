/*
 * journey/session.mjs — real sessions for the three seeded fixture users.
 *
 * A journey gate that stubbed authentication would be testing its own stub. Every
 * session here is obtained by an actual password grant against the running local
 * stack, then installed into browser storage by `journey/seed.mjs:seedAuthSession`
 * before first paint.
 *
 * THE SERVICE-ROLE KEY IS NEVER WRITTEN TO A FILE AND NEVER PRINTED. It is read at
 * runtime from `supabase status -o env` into a local variable — the handling
 * `journey/seed-smoke.mjs` established, and the reason `scripts/setup-env.sh`
 * deliberately keeps it out of `frontend/.env.local`.
 */

import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';

import { readFixtures } from './seed.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(HERE, '..');

/** The closed set of session identities a step record may name. */
export const SESSION_KINDS = Object.freeze(['none', 'alpha', 'beta', 'orphan']);

/**
 * Read the local stack's environment. Returns null when the stack is not
 * running, which the caller turns into a cannot-run rather than a failure.
 *
 * Identical in shape to journey/seed-smoke.mjs's reader, deliberately, so the
 * two cannot drift apart.
 *
 * @returns {object|null}
 */
export function readStackEnv() {
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

/**
 * Sign in as one of the three seeded users and return the supabase-js session.
 *
 * @param {object} stackEnv
 * @param {'alpha'|'beta'|'orphan'} who
 * @returns {Promise<object>} the session object
 */
export async function getSession(stackEnv, who) {
  const fixtures = readFixtures();

  let email;
  if (who === 'alpha' || who === 'beta') {
    email = fixtures.orgs[who].user_email;
  } else if (who === 'orphan') {
    email = fixtures.orphan.user_email;
  } else {
    // Rejected rather than returned as null: a silently-missing session would
    // screenshot a signed-out page and the rubric would blame the product.
    throw new Error(`SESSION UNKNOWN: ${who}`);
  }

  const anon = createClient(stackEnv.API_URL, stackEnv.ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await anon.auth.signInWithPassword({
    email,
    password: fixtures.password,
  });
  if (error) {
    throw new Error(`SESSION SIGN-IN FAILED for ${who} (${email}): ${error.message}`);
  }
  if (!data.session) {
    throw new Error(`SESSION SIGN-IN FAILED for ${who} (${email}): no session returned`);
  }
  return data.session;
}

/**
 * A service-role client. Bypasses RLS; used only for resets and fixture reads.
 *
 * @param {object} stackEnv
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function adminClient(stackEnv) {
  return createClient(stackEnv.API_URL, stackEnv.SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

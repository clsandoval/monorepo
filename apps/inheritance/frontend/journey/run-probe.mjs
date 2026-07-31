#!/usr/bin/env node
/*
 * journey/run-probe.mjs — asserts run.mjs's cannot-run contract.
 *
 * A gate nobody has seen FAIL is not known to be a gate. The exit-2 path is the
 * one that matters most here: if "the stack is down" were reported as exit 0,
 * every journey gate would go green on a machine with no database and nobody
 * would notice until a wrong number reached a lawyer.
 *
 * This probe asserts that path without needing the stack to actually be down,
 * by invoking run.mjs as a child process in three configurations and reading the
 * exit code and stdout/stderr of each.
 *
 * Exit 0 on success (`RUN-PROBE ok cases=3`), 1 on failure.
 */

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FRONTEND_ROOT = path.resolve(HERE, '..');

function runCli(args, extraEnv = {}) {
  const res = spawnSync(process.execPath, [path.join('journey', 'run.mjs'), ...args], {
    cwd: FRONTEND_ROOT,
    encoding: 'utf8',
    env: { ...process.env, ...extraEnv },
  });
  return {
    code: res.status,
    out: `${res.stdout || ''}${res.stderr || ''}`,
  };
}

function main() {
  // 1. An unknown --step id is a cannot-run, not a zero-step pass. Reporting
  //    "0 failures" for a step that does not exist is precisely the silent
  //    scope narrowing this project exists to prevent.
  const unknown = runCli(['--step', 'does-not-exist']);
  assert.equal(
    unknown.code,
    2,
    `--step does-not-exist exited ${unknown.code}, expected 2. Output: ${unknown.out}`,
  );
  assert.ok(
    /^JOURNEY CANNOT RUN:.*does-not-exist/m.test(unknown.out),
    `--step does-not-exist did not print a JOURNEY CANNOT RUN line naming the id. Output: ${unknown.out}`,
  );

  // 2. The fail-closed injection hook. JOURNEY_FORCE_NO_STACK can only force a
  //    cannot-run; there is no variable that can force a pass.
  const noStack = runCli(['--step', 'auth-signin'], { JOURNEY_FORCE_NO_STACK: '1' });
  assert.equal(
    noStack.code,
    2,
    `JOURNEY_FORCE_NO_STACK=1 exited ${noStack.code}, expected 2. Output: ${noStack.out}`,
  );
  assert.ok(
    noStack.out.includes('JOURNEY CANNOT RUN: local Supabase stack is not running'),
    `JOURNEY_FORCE_NO_STACK=1 did not print the stack-down reason. Output: ${noStack.out}`,
  );

  // 3. --list is the one mode that starts nothing and always succeeds.
  const list = runCli(['--list']);
  assert.equal(list.code, 0, `--list exited ${list.code}, expected 0. Output: ${list.out}`);
  assert.ok(
    list.out.split('\n').includes('auth-signin'),
    `--list did not print auth-signin. Output: ${list.out}`,
  );

  console.log('RUN-PROBE ok cases=3');
}

try {
  main();
  process.exit(0);
} catch (err) {
  console.error(`RUN-PROBE FAILED: ${err && err.message ? err.message : err}`);
  process.exit(1);
}

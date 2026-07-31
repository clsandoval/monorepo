#!/usr/bin/env node
/**
 * check-env-ready.mjs — the read-only verdict on whether this app's local
 * environment is actually up.
 *
 *   node scripts/check-env-ready.mjs
 *   node scripts/check-env-ready.mjs --api-port <n>
 *   node scripts/check-env-ready.mjs --config <path>
 *
 * This script JUDGES the environment. It never brings one up. It has no flag
 * that repairs, installs, starts, resets or regenerates anything, and it calls
 * no filesystem write of any kind — its only output is stdout and stderr. That
 * separation is the whole point, and it is the same reason no rewrite flag
 * exists on scripts/check-gate-manifest.mjs: a check that can repair what it
 * inspects will eventually report success for work it performed itself rather
 * than for work that was already there. scripts/setup-env.sh performs; this
 * file grades.
 *
 * PORTS ARE NOT HARDCODED. The api and db ports are read out of
 * frontend/supabase/config.toml, because a checker carrying its own copy of the
 * port numbers can drift away from the config — and closing that class of drift
 * is why this phase exists. The two flags are read-only overrides: --api-port
 * substitutes a port so the PORT CLOSED path can be exercised without taking
 * the stack down, and --config points at a different config file.
 *
 * Every violation is collected and printed. The script never returns on the
 * first failure, because an operator who fixes one precondition and reruns to
 * discover the next one wastes a cycle per problem.
 *
 * Markers, each naming exactly which precondition is unmet:
 *
 *   DOCKER UNREACHABLE   — docker missing from PATH, or `docker info` nonzero
 *   CLI MISSING          — `supabase --version` does not exit 0
 *   CLI VERSION          — CLI present but not the pinned version
 *   STACK DOWN           — no running container named supabase_db_inheritance
 *   PORT CLOSED          — a TCP connect to a configured port did not succeed
 *   ENV FILE MISSING     — frontend/.env.local does not exist
 *   ENV FILE INCOMPLETE  — required keys absent, or a placeholder anon key
 *   ENV URL MISMATCH     — the env file's port disagrees with the config
 *   DEPS MISSING         — frontend/node_modules does not exist
 *   WASM MISSING         — the compiled engine binary is not present
 *
 * Dependency-free: node: builtins only. Exit 0 on zero violations, 1 otherwise.
 * There is no other exit code.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import net from 'node:net';
import { spawnSync } from 'node:child_process';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');

const EXPECTED_CLI_VERSION = '2.110.0';
const DB_CONTAINER = 'supabase_db_inheritance';
const CONNECT_TIMEOUT_MS = 2000;
const MIN_ANON_KEY_LENGTH = 20;

const DEFAULT_CONFIG = path.join(APP_DIR, 'frontend', 'supabase', 'config.toml');
const ENV_FILE = path.join(APP_DIR, 'frontend', '.env.local');
const NODE_MODULES = path.join(APP_DIR, 'frontend', 'node_modules');
const WASM_FILE = path.join(
  APP_DIR, 'frontend', 'src', 'wasm', 'pkg', 'inheritance_engine_bg.wasm',
);

const failures = [];
function fail(marker, detail) {
  failures.push(`${marker} — ${detail}`);
}

// --- argument parsing -------------------------------------------------------

function parseArgs(argv) {
  const out = { apiPort: null, config: DEFAULT_CONFIG };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--api-port') {
      const value = Number(argv[i + 1]);
      if (!Number.isInteger(value) || value < 1 || value > 65535) {
        console.error(`ENV NOT READY: BAD ARGUMENT — --api-port needs an integer 1-65535, got ${argv[i + 1]}`);
        process.exit(1);
      }
      out.apiPort = value;
      i += 1;
    } else if (arg === '--config') {
      const value = argv[i + 1];
      if (!value) {
        console.error('ENV NOT READY: BAD ARGUMENT — --config needs a path');
        process.exit(1);
      }
      out.config = path.resolve(process.cwd(), value);
      i += 1;
    } else {
      console.error(`ENV NOT READY: BAD ARGUMENT — unknown option ${arg}`);
      process.exit(1);
    }
  }
  return out;
}

// --- config parsing ---------------------------------------------------------

/**
 * Line-oriented read of the first `port` key inside each requested section.
 * Deliberately not a full TOML parser: the only values needed are two integers,
 * and pulling in a parser would mean a dependency this script is forbidden.
 */
function readSectionPorts(configPath, sections) {
  const found = Object.create(null);
  const text = readFileSync(configPath, 'utf8');
  let current = null;
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (line.startsWith('#')) continue;
    const header = line.match(/^\[([^\]]+)\]$/);
    if (header) {
      current = header[1];
      continue;
    }
    if (current === null || !sections.includes(current)) continue;
    if (found[current] !== undefined) continue;
    const kv = line.match(/^port\s*=\s*(\d+)/);
    if (kv) found[current] = Number(kv[1]);
  }
  return found;
}

// --- probes -----------------------------------------------------------------

function run(cmd, args) {
  try {
    const res = spawnSync(cmd, args, { encoding: 'utf8' });
    if (res.error) return { ok: false, code: null, stdout: '', stderr: String(res.error.message) };
    return {
      ok: res.status === 0,
      code: res.status,
      stdout: res.stdout || '',
      stderr: res.stderr || '',
    };
  } catch (err) {
    return { ok: false, code: null, stdout: '', stderr: String(err && err.message) };
  }
}

function tcpOpen(port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;
    const done = (result) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(CONNECT_TIMEOUT_MS);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
    socket.connect(port, '127.0.0.1');
  });
}

// --- main -------------------------------------------------------------------

async function main() {
  const args = parseArgs(process.argv.slice(2));

  // Config must be readable before anything that depends on its ports.
  if (!existsSync(args.config)) {
    console.error(`ENV NOT READY: CONFIG MISSING — ${args.config} does not exist`);
    console.error('Run: bash scripts/setup-env.sh');
    process.exit(1);
  }

  let ports;
  try {
    ports = readSectionPorts(args.config, ['api', 'db']);
  } catch (err) {
    console.error(`ENV NOT READY: CONFIG UNREADABLE — ${args.config}: ${err && err.message}`);
    console.error('Run: bash scripts/setup-env.sh');
    process.exit(1);
  }

  if (ports.api === undefined || ports.db === undefined) {
    console.error(`ENV NOT READY: CONFIG UNREADABLE — ${args.config} has no [api] port and/or no [db] port`);
    console.error('Run: bash scripts/setup-env.sh');
    process.exit(1);
  }

  const configApiPort = ports.api;
  const apiPort = args.apiPort === null ? configApiPort : args.apiPort;
  const dbPort = ports.db;

  // 1. DOCKER UNREACHABLE
  const dockerInfo = run('docker', ['info']);
  if (!dockerInfo.ok) {
    fail('DOCKER UNREACHABLE', 'docker is not on PATH or `docker info` exited nonzero');
  }

  // 2/3. CLI MISSING / CLI VERSION
  const cli = run('supabase', ['--version']);
  if (!cli.ok) {
    fail('CLI MISSING', '`supabase --version` did not exit 0');
  } else {
    const observed = cli.stdout.trim();
    if (observed !== EXPECTED_CLI_VERSION) {
      fail('CLI VERSION', `expected ${EXPECTED_CLI_VERSION}, observed ${observed || '(no output)'}`);
    }
  }

  // 4. STACK DOWN
  const psOut = run('docker', ['ps', '--filter', `name=${DB_CONTAINER}`, '--format', '{{.Names}}']);
  if (!psOut.ok || !psOut.stdout.split('\n').map((s) => s.trim()).includes(DB_CONTAINER)) {
    fail('STACK DOWN', `no running container named ${DB_CONTAINER}`);
  }

  // 5. PORT CLOSED — reported per port, naming which service it belongs to.
  const apiOpen = await tcpOpen(apiPort);
  if (!apiOpen) {
    fail('PORT CLOSED', `api port ${apiPort} on 127.0.0.1 did not accept a connection within ${CONNECT_TIMEOUT_MS}ms`);
  }
  const dbOpen = await tcpOpen(dbPort);
  if (!dbOpen) {
    fail('PORT CLOSED', `db port ${dbPort} on 127.0.0.1 did not accept a connection within ${CONNECT_TIMEOUT_MS}ms`);
  }

  // 6/7/8. env file
  if (!existsSync(ENV_FILE)) {
    fail('ENV FILE MISSING', `${ENV_FILE} does not exist`);
  } else {
    const envText = readFileSync(ENV_FILE, 'utf8');
    const urlLine = envText.split('\n').find((l) => l.startsWith('VITE_SUPABASE_URL='));
    const keyLine = envText.split('\n').find((l) => l.startsWith('VITE_SUPABASE_ANON_KEY='));

    if (!urlLine) {
      fail('ENV FILE INCOMPLETE', `${ENV_FILE} has no VITE_SUPABASE_URL= line`);
    }
    if (!keyLine) {
      fail('ENV FILE INCOMPLETE', `${ENV_FILE} has no VITE_SUPABASE_ANON_KEY= line`);
    } else {
      const anon = keyLine.slice('VITE_SUPABASE_ANON_KEY='.length).trim();
      if (anon.length < MIN_ANON_KEY_LENGTH) {
        fail(
          'ENV FILE INCOMPLETE',
          `VITE_SUPABASE_ANON_KEY is ${anon.length} characters, expected at least ${MIN_ANON_KEY_LENGTH} — a placeholder left in place is not a configured environment`,
        );
      }
    }

    if (urlLine) {
      const rawUrl = urlLine.slice('VITE_SUPABASE_URL='.length).trim();
      let envPort = null;
      try {
        envPort = Number(new URL(rawUrl).port);
      } catch {
        envPort = null;
      }
      if (envPort !== configApiPort) {
        fail(
          'ENV URL MISMATCH',
          `VITE_SUPABASE_URL is ${rawUrl} (port ${envPort === null || Number.isNaN(envPort) ? 'unparseable' : envPort}) but ${args.config} declares api port ${configApiPort}`,
        );
      }
    }
  }

  // 9. DEPS MISSING
  if (!existsSync(NODE_MODULES)) {
    fail('DEPS MISSING', `${NODE_MODULES} does not exist`);
  }

  // 10. WASM MISSING
  if (!existsSync(WASM_FILE)) {
    fail('WASM MISSING', `${WASM_FILE} does not exist`);
  }

  if (failures.length > 0) {
    for (const f of failures) console.error(`ENV NOT READY: ${f}`);
    console.error('Run: bash scripts/setup-env.sh');
    process.exit(1);
  }

  console.log(`ENV READY — api ${apiPort}, db ${dbPort}, container ${DB_CONTAINER}`);
  process.exit(0);
}

main();

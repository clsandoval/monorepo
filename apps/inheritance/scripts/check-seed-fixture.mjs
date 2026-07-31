#!/usr/bin/env node
/**
 * check-seed-fixture.mjs — static agreement between the seed SQL, the published
 * id registry, and the engine case the seeded legal content is copied from.
 *
 *   node scripts/check-seed-fixture.mjs
 *   node scripts/check-seed-fixture.mjs --seed <path> --fixtures <path> --engine-case <path>
 *
 * GATE-06 requires `supabase/seed.sql` to produce a known org, user and case
 * fixture that later gates can reference by ID. That contract only holds while
 * the ids in `frontend/supabase/fixtures.json` and the ids in the SQL are the
 * same set — the moment they diverge, a gate references a row that does not
 * exist, and it fails for a reason having nothing to do with the product.
 *
 * The most important check here is the third one. The seeded `input_json` is a
 * byte-for-byte copy of a committed engine fixture, because authoring a family
 * tree means choosing which succession rules the fixture exercises, and that is
 * the beginning of a legal judgment no agent on this project may make. A byte
 * comparison is what keeps "copied" from silently becoming "adapted".
 *
 * Violations, each with its own literal marker:
 *
 *   FIXTURE DRIFT           — a uuid in one file and not the other, either way
 *   FIXTURE INCOMPLETE      — the registry is missing a required key
 *   SEED INPUT NOT COPIED   — the embedded input_json is not the engine case
 *   SEED WRITES OUTPUT      — the seed stores an engine result nothing computed
 *   SEED PLAINTEXT PASSWORD — a password appears outside a crypt() call
 *   SEED SCAN UNREADABLE    — an input file is missing or unparseable
 *
 * Reads repo files only. No database, no socket, no subprocess — so it runs
 * wherever the other gates run. It has no flag that rewrites, repairs or
 * regenerates anything; the three flags are read-only path overrides so fixtures
 * can drive the failure paths.
 *
 * Dependency-free: node: builtins only. Exit 0 on zero violations, 1 otherwise.
 * There is no other exit code.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');

const DEFAULT_SEED = path.join(APP_DIR, 'frontend', 'supabase', 'seed.sql');
const DEFAULT_FIXTURES = path.join(APP_DIR, 'frontend', 'supabase', 'fixtures.json');
const DEFAULT_ENGINE_CASE = path.join(APP_DIR, 'engine', 'examples', 'cases', '02-married-3lc.json');

const REQUIRED_ORG_KEYS = [
  'org_id', 'org_name', 'org_slug',
  'user_id', 'user_email',
  'client_id', 'case_id', 'share_token',
];
const REQUIRED_ORGS = ['alpha', 'beta'];
const SEED_PASSWORD = 'test-password-123';
const UUID_RE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g;

const violations = [];
function violation(marker, detail) {
  violations.push(`${marker} — ${detail}`);
}

/** Exit 1 with SEED SCAN UNREADABLE. Never exit 0 on an internal error. */
function unreadable(message) {
  console.error(`SEED SCAN UNREADABLE: ${message}`);
  process.exit(1);
}

// --- argument parsing -------------------------------------------------------

function parseArgs(argv) {
  const out = { seed: DEFAULT_SEED, fixtures: DEFAULT_FIXTURES, engineCase: DEFAULT_ENGINE_CASE };
  const map = { '--seed': 'seed', '--fixtures': 'fixtures', '--engine-case': 'engineCase' };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (map[arg]) {
      const value = argv[i + 1];
      if (!value) unreadable(`${arg} needs a path`);
      out[map[arg]] = path.resolve(process.cwd(), value);
      i += 1;
    } else {
      unreadable(`unknown option ${arg}`);
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));

// --- read inputs ------------------------------------------------------------

for (const [label, file] of [
  ['seed', args.seed], ['fixtures', args.fixtures], ['engine case', args.engineCase],
]) {
  if (!existsSync(file)) unreadable(`${label} file ${file} does not exist`);
}

let seedText;
let fixtures;
let engineCaseText;
try {
  seedText = readFileSync(args.seed, 'utf8');
} catch (err) {
  unreadable(`could not read ${args.seed}: ${err && err.message}`);
}
try {
  fixtures = JSON.parse(readFileSync(args.fixtures, 'utf8'));
} catch (err) {
  unreadable(`could not parse ${args.fixtures}: ${err && err.message}`);
}
try {
  engineCaseText = readFileSync(args.engineCase, 'utf8');
} catch (err) {
  unreadable(`could not read ${args.engineCase}: ${err && err.message}`);
}

// --- 2. FIXTURE INCOMPLETE --------------------------------------------------
// Runs before the drift comparison because a malformed registry makes the uuid
// sets meaningless rather than merely unequal.

if (typeof fixtures.password !== 'string') {
  violation('FIXTURE INCOMPLETE', `${path.relative(APP_DIR, args.fixtures)} has no 'password' key`);
}
if (fixtures.orgs === undefined || fixtures.orgs === null || typeof fixtures.orgs !== 'object') {
  violation('FIXTURE INCOMPLETE', `${path.relative(APP_DIR, args.fixtures)} has no 'orgs' object`);
} else {
  const orgKeys = Object.keys(fixtures.orgs).sort();
  if (orgKeys.join(',') !== REQUIRED_ORGS.join(',')) {
    violation(
      'FIXTURE INCOMPLETE',
      `'orgs' has keys [${orgKeys.join(', ')}], expected exactly [${REQUIRED_ORGS.join(', ')}]`,
    );
  }
  for (const [name, org] of Object.entries(fixtures.orgs)) {
    for (const key of REQUIRED_ORG_KEYS) {
      if (org === null || typeof org !== 'object' || org[key] === undefined) {
        violation('FIXTURE INCOMPLETE', `org '${name}' is missing required key '${key}'`);
      }
    }
  }
}

// --- 1. FIXTURE DRIFT -------------------------------------------------------
// Compared in BOTH directions: an id that exists only in the registry breaks the
// gates that reference it, and an id that exists only in the SQL is an
// unpublished row a later gate cannot address.

function uuidsIn(text) {
  return new Set((text.match(UUID_RE) || []));
}

const registryText = JSON.stringify(fixtures);
const registryUuids = uuidsIn(registryText);
const seedUuids = uuidsIn(seedText);

// The all-zero instance_id is GoTrue's fixed sentinel, not a fixture identity.
const IGNORED = new Set(['00000000-0000-0000-0000-000000000000']);

let matched = 0;
for (const id of registryUuids) {
  if (IGNORED.has(id)) continue;
  if (!seedUuids.has(id)) {
    violation('FIXTURE DRIFT', `${id} is in ${path.relative(APP_DIR, args.fixtures)} but not in ${path.relative(APP_DIR, args.seed)}`);
  } else {
    matched += 1;
  }
}
for (const id of seedUuids) {
  if (IGNORED.has(id)) continue;
  if (!registryUuids.has(id)) {
    violation('FIXTURE DRIFT', `${id} is in ${path.relative(APP_DIR, args.seed)} but not in ${path.relative(APP_DIR, args.fixtures)}`);
  }
}

// --- 3. SEED INPUT NOT COPIED ----------------------------------------------

const DOLLAR = '$json$';
const embedded = [];
{
  let from = 0;
  for (;;) {
    const open = seedText.indexOf(DOLLAR, from);
    if (open === -1) break;
    const close = seedText.indexOf(DOLLAR, open + DOLLAR.length);
    if (close === -1) break;
    embedded.push(seedText.slice(open + DOLLAR.length, close));
    from = close + DOLLAR.length;
  }
}

if (embedded.length === 0) {
  violation(
    'SEED INPUT NOT COPIED',
    `${path.relative(APP_DIR, args.seed)} embeds no $json$-quoted input_json to compare`,
  );
} else {
  const expected = engineCaseText.replace(/\s+$/, '');
  embedded.forEach((block, i) => {
    if (block.replace(/\s+$/, '') !== expected) {
      violation(
        'SEED INPUT NOT COPIED',
        `embedded input_json #${i + 1} differs from ${path.relative(APP_DIR, args.engineCase)}; the seeded family tree must be a byte-for-byte copy, never adapted`,
      );
    }
  });
}

// --- 4. SEED WRITES OUTPUT --------------------------------------------------

if (seedText.includes('output_json')) {
  violation(
    'SEED WRITES OUTPUT',
    `${path.relative(APP_DIR, args.seed)} mentions output_json; a seeded engine result is a per-heir peso figure nothing computed`,
  );
}

// --- 5. SEED PLAINTEXT PASSWORD ---------------------------------------------
// The password legitimately appears inside crypt(...). Anywhere else it is
// stored or compared unhashed.

for (const line of seedText.split('\n')) {
  if (!line.includes(SEED_PASSWORD)) continue;
  if (line.includes('crypt(')) continue;
  violation(
    'SEED PLAINTEXT PASSWORD',
    `'${SEED_PASSWORD}' appears outside a crypt() call: ${line.trim()}`,
  );
}

// --- verdict ----------------------------------------------------------------

if (violations.length > 0) {
  for (const v of violations) console.error(v);
  process.exit(1);
}

const orgCount = Object.keys(fixtures.orgs).length;
console.log(`SEED OK — ${orgCount} orgs, ${matched} ids matched`);
console.log('INPUT COPIED FROM engine/examples/cases/02-married-3lc.json');
process.exit(0);

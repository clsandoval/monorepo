#!/usr/bin/env node
/**
 * check-storage-buckets.mjs — static parity between the storage buckets the code
 * references and the storage buckets a migration creates.
 *
 *   node scripts/check-storage-buckets.mjs
 *   node scripts/check-storage-buckets.mjs --src <dir> --migrations <dir>
 *
 * GATE-07 requires every runtime-required bucket to come from a migration file
 * rather than from a manual dashboard action. A hand-made bucket does not survive
 * `supabase db reset`, does not exist in a teammate's environment, and does not
 * exist in CI — so the feature that needs it fails for an environmental reason
 * that reads like a product bug.
 *
 * A one-time count is not a guarantee, though. The runtime set has exactly one
 * member today; the point of this file is that it still has to agree tomorrow.
 *
 * Violations, each with its own literal marker so a failure says which rule broke:
 *
 *   1. UNMIGRATED BUCKET          — code references a bucket no migration creates
 *   2. ORPHAN BUCKET              — a migration creates a bucket no code references
 *   3. UNRESOLVED BUCKET REFERENCE— a .storage.from(IDENT) whose IDENT cannot be
 *                                   resolved to a literal in the same file
 *   4. RUNTIME BUCKET CREATION    — application code calls createBucket
 *   5. BUCKET SCAN UNREADABLE     — a scan root is missing or unreadable
 *
 * ORPHAN BUCKET is a failure rather than a note on purpose: an unreferenced
 * bucket means the two halves have drifted, and the legitimate way to add a
 * bucket is to add its code reference in the same commit.
 *
 * UNRESOLVED BUCKET REFERENCE is a violation rather than a skip for the same
 * reason: silently ignoring a reference it could not read would let a bucket
 * escape the very comparison this file exists to perform.
 *
 * This check reads repo files only. It opens no socket and starts no
 * subprocess, so it runs wherever the other gates run — including CI, which has
 * no database. It has no flag that rewrites, repairs or regenerates anything;
 * the only two flags are read-only path overrides so fixtures can drive the
 * failure paths.
 *
 * Dependency-free: node: builtins only. Exit 0 on zero violations, 1 otherwise.
 * There is no other exit code.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');

const DEFAULT_SRC = path.join(APP_DIR, 'frontend', 'src');
const DEFAULT_MIGRATIONS = path.join(APP_DIR, 'frontend', 'supabase', 'migrations');

const violations = [];
function violation(marker, detail) {
  violations.push(`${marker} — ${detail}`);
}

/** Exit 1 with BUCKET SCAN UNREADABLE. Never exit 0 on an internal error. */
function unreadable(message) {
  console.error(`BUCKET SCAN UNREADABLE: ${message}`);
  process.exit(1);
}

// --- argument parsing -------------------------------------------------------

function parseArgs(argv) {
  const out = { src: DEFAULT_SRC, migrations: DEFAULT_MIGRATIONS };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--src' || arg === '--migrations') {
      const value = argv[i + 1];
      if (!value) unreadable(`${arg} needs a directory path`);
      const key = arg === '--src' ? 'src' : 'migrations';
      out[key] = path.resolve(process.cwd(), value);
      i += 1;
    } else {
      unreadable(`unknown option ${arg}`);
    }
  }
  return out;
}

// --- directory walking ------------------------------------------------------

function walk(dir, predicate, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    let st;
    try {
      st = statSync(full);
    } catch {
      continue;
    }
    if (st.isDirectory()) {
      // A bucket referenced only from a test is not a runtime requirement.
      if (entry === '__tests__') continue;
      walk(full, predicate, acc);
    } else if (predicate(full)) {
      acc.push(full);
    }
  }
  return acc;
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

/**
 * Blank out comment bodies, preserving every character position and every
 * newline so reported line numbers still refer to the original file.
 *
 * Without this, a doc comment that merely mentions `.storage.from(X)` — exactly
 * the sort of comment this check's own fixtures carry — is read as a real call
 * site and fails the gate spuriously. A check that fires on prose is a check
 * people learn to route around.
 */
function blankComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(m.length - p1.length));
}

// --- the referenced set -----------------------------------------------------

const FROM_LITERAL = /\.storage\s*\.\s*from\s*\(\s*(['"])([^'"]+)\1\s*\)/g;
const FROM_IDENT = /\.storage\s*\.\s*from\s*\(\s*([A-Za-z_$][\w$]*)\s*\)/g;
const CREATE_BUCKET = /\.?createBucket\s*\(/g;

function constLiteralIn(text, identifier) {
  const re = new RegExp(
    `\\bconst\\s+${identifier.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s*(?::[^=]*)?=\\s*(['"])([^'"]+)\\1`,
  );
  const m = text.match(re);
  return m ? m[2] : null;
}

function collectReferenced(srcDir) {
  const referenced = new Map(); // name -> "file:line"
  const files = walk(srcDir, (f) => f.endsWith('.ts') || f.endsWith('.tsx'));

  for (const file of files) {
    const text = blankComments(readFileSync(file, 'utf8'));
    const rel = path.relative(APP_DIR, file);

    for (const m of text.matchAll(FROM_LITERAL)) {
      const name = m[2];
      if (!referenced.has(name)) referenced.set(name, `${rel}:${lineOf(text, m.index)}`);
    }

    for (const m of text.matchAll(FROM_IDENT)) {
      const ident = m[1];
      const resolved = constLiteralIn(text, ident);
      if (resolved === null) {
        violation(
          'UNRESOLVED BUCKET REFERENCE',
          `${rel}:${lineOf(text, m.index)} calls .storage.from(${ident}) but no literal 'const ${ident} = "..."' exists in that file`,
        );
      } else if (!referenced.has(resolved)) {
        referenced.set(resolved, `${rel}:${lineOf(text, m.index)}`);
      }
    }

    for (const m of text.matchAll(CREATE_BUCKET)) {
      violation(
        'RUNTIME BUCKET CREATION',
        `${rel}:${lineOf(text, m.index)} creates a bucket from application code; buckets must come from a migration`,
      );
    }
  }
  return referenced;
}

// --- the migrated set -------------------------------------------------------

const INSERT_BUCKETS = /INSERT\s+INTO\s+storage\.buckets/gi;

function collectMigrated(migrationsDir) {
  const migrated = new Map(); // id -> file
  const files = walk(migrationsDir, (f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    // Same reasoning as the source scan: a SQL comment describing the statement
    // must not be read as the statement.
    const text = readFileSync(file, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
      .replace(/--[^\n]*/g, (m) => ' '.repeat(m.length));
    const rel = path.relative(APP_DIR, file);
    for (const m of text.matchAll(INSERT_BUCKETS)) {
      // The bucket id is the first single-quoted string after the statement head.
      const after = text.slice(m.index + m[0].length);
      const quoted = after.match(/'([^']+)'/);
      if (quoted && !migrated.has(quoted[1])) migrated.set(quoted[1], rel);
    }
  }
  return migrated;
}

// --- main -------------------------------------------------------------------

const args = parseArgs(process.argv.slice(2));

for (const [label, dir] of [['src', args.src], ['migrations', args.migrations]]) {
  if (!existsSync(dir)) unreadable(`${label} directory ${dir} does not exist`);
  try {
    if (!statSync(dir).isDirectory()) unreadable(`${label} path ${dir} is not a directory`);
  } catch (err) {
    unreadable(`${label} directory ${dir} is unreadable: ${err && err.message}`);
  }
}

let referenced;
let migrated;
try {
  referenced = collectReferenced(args.src);
} catch (err) {
  unreadable(`could not scan ${args.src}: ${err && err.message}`);
}
try {
  migrated = collectMigrated(args.migrations);
} catch (err) {
  unreadable(`could not scan ${args.migrations}: ${err && err.message}`);
}

for (const [name, where] of referenced) {
  if (!migrated.has(name)) {
    violation(
      'UNMIGRATED BUCKET',
      `'${name}' is referenced at ${where} but no migration creates it`,
    );
  }
}

for (const [id, where] of migrated) {
  if (!referenced.has(id)) {
    violation(
      'ORPHAN BUCKET',
      `'${id}' is created by ${where} but no code references it`,
    );
  }
}

if (violations.length > 0) {
  for (const v of violations) console.error(v);
  process.exit(1);
}

console.log(`BUCKETS OK — ${referenced.size} referenced, ${migrated.size} migrated`);
process.exit(0);

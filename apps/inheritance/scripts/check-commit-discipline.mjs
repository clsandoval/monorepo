#!/usr/bin/env node
/**
 * check-commit-discipline.mjs — the mixed-commit history audit.
 *
 *   node scripts/check-commit-discipline.mjs
 *   node scripts/check-commit-discipline.mjs --from-json <path>   # fixture-driven
 *   node scripts/check-commit-discipline.mjs --range <rev-range>  # diagnosis only
 *
 * This app lives inside a monorepo with a concurrent auto-committer. The damage
 * mode runs in both directions: our broad stage absorbing its in-flight edits, or
 * its broad stage absorbing our staged work into a commit named "fitness log".
 * Either way the resulting commit touches apps/inheritance/ TOGETHER WITH paths
 * outside it — a MIXED COMMIT. That single signature catches both directions.
 *
 * The audit deliberately does NOT filter by author, committer, or commit message.
 * Filtering out the auto-committer would hide the exact commit this audit exists
 * to catch: the one where its stage swallowed ours. Scope is judged by path, not
 * by identity. A commit that never touches apps/inheritance/ is simply irrelevant
 * here — the auto-committer's own work is none of our business.
 *
 * The floor is a hard-coded constant with no flag that advances it. A movable
 * watermark is an escape hatch: an agent could advance it past its own violation.
 *
 * This script never writes to the repository and never mutates history.
 * Dependency-free: node: builtins only. Exit 0 on zero violations, 1 otherwise.
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

/** Project init. Permanent floor. No flag moves this. */
const AUDIT_FLOOR = 'bdee3c498c7c7a801125ab21e97be32f88b57593';

/** A path belongs to this app when it is under the app dir, or is the app's CI workflow. */
const ALLOWED_PREFIX = 'apps/inheritance/';
const ALLOWED_EXACT = '.github/workflows/inheritance-ci.yml';

const APP_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

function fatal(message) {
  console.error(message);
  process.exit(1);
}

function isAllowed(p) {
  return p.startsWith(ALLOWED_PREFIX) || p === ALLOWED_EXACT;
}

function isAppPath(p) {
  return p.startsWith(ALLOWED_PREFIX);
}

/** Run git with an explicit argv and shell:false. Never interpolate into a shell. */
function git(args, cwd) {
  const res = spawnSync('git', args, { cwd, encoding: 'utf8', shell: false });
  if (res.error || res.status === null) {
    fatal(
      'GIT UNAVAILABLE: could not run `git ' + args.join(' ') + '`: ' +
        (res.error ? res.error.message : 'no exit status'),
    );
  }
  return res;
}

function readJson(filePath) {
  if (!existsSync(filePath)) {
    fatal('COMMIT LIST UNREADABLE: no such file: ' + filePath);
  }
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (err) {
    fatal('COMMIT LIST UNREADABLE: ' + filePath + ' is not valid JSON: ' + err.message);
  }
  return undefined;
}

// --- arguments --------------------------------------------------------------

const argv = process.argv.slice(2);
let fromJson = null;
let range = null;

for (let i = 0; i < argv.length; i += 1) {
  const arg = argv[i];
  if (arg === '--from-json') {
    const v = argv[i + 1];
    if (!v) fatal('COMMIT LIST UNREADABLE: --from-json requires a path argument');
    fromJson = path.resolve(process.cwd(), v);
    i += 1;
  } else if (arg === '--range') {
    const v = argv[i + 1];
    if (!v) fatal('GIT UNAVAILABLE: --range requires a rev-range argument');
    range = v;
    i += 1;
  } else {
    fatal('GIT UNAVAILABLE: unknown argument: ' + arg + ' (only --from-json and --range exist)');
  }
}

// --- gather commits ---------------------------------------------------------

let commits;
let sourceLabel;

if (fromJson !== null) {
  const parsed = readJson(fromJson);
  if (!Array.isArray(parsed)) {
    fatal('COMMIT LIST UNREADABLE: ' + fromJson + ' must be a JSON array of {sha, subject, files}');
  }
  commits = parsed.map((c) => ({
    sha: String(c.sha || ''),
    subject: String(c.subject || ''),
    files: Array.isArray(c.files) ? c.files : [],
  }));
  sourceLabel = path.relative(APP_DIR, fromJson) || fromJson;
} else {
  const topRes = git(['rev-parse', '--show-toplevel'], APP_DIR);
  if (topRes.status !== 0) {
    fatal('GIT UNAVAILABLE: not inside a git repository (from ' + APP_DIR + ')');
  }
  const gitRoot = topRes.stdout.trim();

  // FLOOR NOT ANCESTOR — the floor commit must still be in history. If it is not,
  // history was rewritten, which this project forbids. The audit reads history; it
  // never repairs it.
  const anc = git(['merge-base', '--is-ancestor', AUDIT_FLOOR, 'HEAD'], gitRoot);
  if (anc.status !== 0) {
    fatal(
      'FLOOR NOT ANCESTOR: ' + AUDIT_FLOOR + ' is not an ancestor of HEAD.\n' +
        '  The audit floor has left history, which means a rewrite (rebase, amend,\n' +
        '  reset or filter) happened. That is prohibited. Restore history; do not\n' +
        '  move the floor — it is a hard-coded constant with no flag to advance it.',
    );
  }

  const effectiveRange = range === null ? AUDIT_FLOOR + '..HEAD' : range;
  sourceLabel = effectiveRange;

  const logRes = git(['log', '--format=%H%x09%s', effectiveRange], gitRoot);
  if (logRes.status !== 0) {
    fatal('GIT UNAVAILABLE: `git log ' + effectiveRange + '` failed: ' + logRes.stderr.trim());
  }

  commits = [];
  for (const line of logRes.stdout.split('\n')) {
    if (line.trim() === '') continue;
    const tab = line.indexOf('\t');
    const sha = tab === -1 ? line.trim() : line.slice(0, tab);
    const subject = tab === -1 ? '' : line.slice(tab + 1);
    const showRes = git(['show', '--name-only', '--format=', sha], gitRoot);
    if (showRes.status !== 0) {
      fatal('GIT UNAVAILABLE: `git show ' + sha + '` failed: ' + showRes.stderr.trim());
    }
    const files = showRes.stdout.split('\n').map((s) => s.trim()).filter((s) => s !== '');
    commits.push({ sha, subject, files });
  }
}

// --- audit ------------------------------------------------------------------

const violations = [];
let appTouching = 0;

let auditedCount = 0;
for (const c of commits) {
  auditedCount += 1;
  const touchesApp = c.files.some(isAppPath);
  if (!touchesApp) continue;
  appTouching += 1;
  const foreign = c.files.filter((p) => !isAllowed(p));
  if (foreign.length > 0) {
    violations.push(
      'MIXED COMMIT: ' + c.sha + ' ' + c.subject + '\n' +
        '  This commit touches ' + ALLOWED_PREFIX + ' AND ' + foreign.length +
        ' path(s) outside the allowlist:\n' +
        foreign.map((p) => '    ' + p).join('\n') + '\n' +
        '  A commit must never mix this app with another area. Either our stage\n' +
        '  absorbed somebody else\'s in-flight work, or theirs absorbed ours.',
    );
  }
}

// --- GATE-09 skip accounting ------------------------------------------------
// total = commits in the audited range; skipped = in range but not audited.
function reportSkips() {
  console.log('GATE-SKIPS total=' + commits.length + ' skipped=' + (commits.length - auditedCount));
}

if (violations.length > 0) {
  console.error('');
  console.error('=========================================================');
  console.error('COMMIT DISCIPLINE AUDIT FAILED — ' + violations.length + ' violation(s)');
  console.error('=========================================================');
  console.error('  source: ' + sourceLabel);
  for (const v of violations) {
    console.error('');
    console.error(v);
  }
  console.error('');
  console.error('History is never rewritten to clear this. Report the finding.');
  console.error('Commit with: bash apps/inheritance/scripts/safe-commit.sh -m "<msg>" <path>...');
  console.error('');
  reportSkips();
  process.exit(1);
}

console.log(
  'COMMIT DISCIPLINE OK — ' + commits.length + ' commit(s) audited over ' + sourceLabel +
    ', ' + appTouching + ' touching ' + ALLOWED_PREFIX + ', 0 mixed',
);
reportSkips();
process.exit(0);

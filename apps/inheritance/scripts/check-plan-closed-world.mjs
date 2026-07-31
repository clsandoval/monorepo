#!/usr/bin/env node
/**
 * check-plan-closed-world.mjs — the closed-world plan lint (gate G6).
 *
 *   node scripts/check-plan-closed-world.mjs             # lint every .planning/phases/ * / *-PLAN.md
 *   node scripts/check-plan-closed-world.mjs --file <p>  # lint one file (drives the fixtures)
 *   node scripts/check-plan-closed-world.mjs --list      # print the discovered plan files, exit 0
 *
 * PROJECT.md delegates implementation to a deliberately cheap model whose only job
 * is to follow plans. Such a model does not stop and ask when a plan leaves a
 * decision open — it invents one. In this codebase an invented decision is an
 * invented reading of the Civil Code or an invented money unit, and either
 * produces a number a lawyer could file. So "closed-world" cannot be a slogan; it
 * has to be a check that fails the build.
 *
 * The rules, and the marker each one prints, are specified in
 * .planning/PLAN-STANDARD.md. They are:
 *
 *   1. MISSING FRONTMATTER KEY   6. THIN ACCEPTANCE
 *   2. UNKNOWN REQUIREMENT       7. OPEN WORLD PHRASE
 *   3. BROKEN DEPENDENCY         8. LEGAL JUDGMENT IN PLAN
 *   4. MISSING SECTION           9. UNGROUNDED LEGAL FIX
 *   5. INCOMPLETE TASK
 *
 * Rules 7 and 8 scan PROSE ONLY: fenced code blocks are removed and inline code
 * spans are blanked before the phrase lists are applied. That is not a loophole —
 * a hedge word inside a literal command or a grep pattern is data, not an
 * instruction, and a plan documenting a prohibited token has to be able to quote
 * it. scripts/fixtures/plan-fenced.md is the committed regression fixture for it.
 *
 * There is no waiver flag, no allowlist and no suppression comment, by design: an
 * escape hatch that turns off a closed-world rule per line reintroduces exactly
 * the discretion the rule removes. This script never writes to any plan file.
 *
 * Dependency-free: node: builtins only. Exit 0 on zero violations, 1 otherwise.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const SCRIPT_DIR = path.dirname(new URL(import.meta.url).pathname);
const APP_DIR = path.resolve(SCRIPT_DIR, '..');
const PHASES_DIR = path.join(APP_DIR, '.planning', 'phases');
const REQUIREMENTS_PATH = path.join(APP_DIR, '.planning', 'REQUIREMENTS.md');

// Rule 7 — phrases that hand a decision to the executing agent.
// Case-insensitive except for the three in CASE_SENSITIVE_PHRASES below.
const OPEN_WORLD_PHRASES = [
  'as appropriate',
  'if needed',
  'if necessary',
  'use your judgment',
  'use your best judgment',
  'best judgment',
  'you decide',
  'as you see fit',
  'choose an appropriate',
  'choose the best',
  'some reasonable',
  'the reasonable reading',
  'figure out',
  'something like',
  'as desired',
  'or similar',
  'whatever makes sense',
  'TBD',
  'TODO',
  '???',
];

// Rule 8 — phrases asking the executor to decide a point of law. PROJECT.md
// forbids any agent from doing so; this makes the prohibition fail at lint time.
const LEGAL_JUDGMENT_PHRASES = [
  'decide whether art',
  'interpret art',
  'the correct legal reading',
  'pick the reading',
  'choose the reading',
  'decide the legal',
  'determine the correct interpretation',
];

// These three match case-sensitively so that `.todo` / `numTodoTests` in ordinary
// lowercase prose is not a hit, while a literal TODO marker is.
const CASE_SENSITIVE_PHRASES = new Set(['TBD', 'TODO', '???']);

const REQUIRED_FRONTMATTER_KEYS = [
  'phase',
  'plan',
  'wave',
  'depends_on',
  'files_modified',
  'autonomous',
  'requirements',
  'must_haves',
];

const REQUIRED_SECTIONS = [
  '<objective>',
  '<constraints>',
  '<tasks>',
  '<verification>',
  '<success_criteria>',
];

const REQUIRED_TASK_FIELDS = [
  'read_first',
  'action',
  'verify',
  'acceptance_criteria',
  'done',
];

// Rule 9 — lawyer-blocked fixes and the recorded decision each one must cite.
// Transcribed from ROADMAP.md Phase 14 and .planning/REQUIREMENTS.md.
const LAWYER_BLOCKED = [
  ['LAW-06', 'LAWYER-06'],
  ['LAW-07', 'LAWYER-04'],
  ['LAW-12', 'LAWYER-08'],
];

function fatal(message) {
  console.error(message);
  process.exit(1);
}

/** Walk .planning/phases/ * / *-PLAN.md without a glob dependency. */
function discoverPlans() {
  const found = [];
  if (!existsSync(PHASES_DIR)) return found;
  for (const entry of readdirSync(PHASES_DIR).sort()) {
    const dir = path.join(PHASES_DIR, entry);
    let st;
    try {
      st = statSync(dir);
    } catch {
      continue;
    }
    if (!st.isDirectory()) continue;
    for (const f of readdirSync(dir).sort()) {
      if (f.endsWith('-PLAN.md')) found.push(path.join(dir, f));
    }
  }
  return found;
}

/**
 * Line-based frontmatter extraction. The frontmatter in this project is flat
 * scalars, flow arrays and block sequences only, so a YAML dependency would be
 * pure supply-chain surface for no gain.
 */
function parseFrontmatter(lines) {
  const keys = new Set();
  const values = new Map();
  let start = -1;
  let end = -1;
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim() === '---') {
      if (start === -1) {
        start = i;
      } else {
        end = i;
        break;
      }
    }
  }
  if (start === -1 || end === -1) return { keys, values, start, end, body: 0 };

  for (let i = start + 1; i < end; i += 1) {
    const m = /^([a-z_]+):(.*)$/.exec(lines[i]);
    if (!m) continue;
    const key = m[1];
    const rest = m[2].trim();
    keys.add(key);
    const items = [];
    if (rest.startsWith('[') && rest.endsWith(']')) {
      // Flow array: [GATE-01, GATE-02] or ["01-02"] or []
      const inner = rest.slice(1, -1).trim();
      if (inner !== '') {
        for (const piece of inner.split(',')) {
          const v = piece.trim().replace(/^["']|["']$/g, '');
          if (v !== '') items.push(v);
        }
      }
    } else if (rest === '') {
      // Block sequence: subsequent `  - item` lines up to the next top-level key.
      for (let j = i + 1; j < end; j += 1) {
        if (/^[a-z_]+:/.test(lines[j])) break;
        const im = /^\s+-\s+(.+)$/.exec(lines[j]);
        if (im) items.push(im[1].trim().replace(/^["']|["']$/g, ''));
      }
    } else {
      items.push(rest.replace(/^["']|["']$/g, ''));
    }
    values.set(key, items);
  }

  // must_haves must carry a `truths:` entry before the next top-level key.
  if (keys.has('must_haves')) {
    let hasTruths = false;
    let inBlock = false;
    for (let i = start + 1; i < end; i += 1) {
      if (/^must_haves:/.test(lines[i])) {
        inBlock = true;
        continue;
      }
      if (inBlock) {
        if (/^[a-z_]+:/.test(lines[i])) break;
        if (/^\s+truths:/.test(lines[i])) {
          hasTruths = true;
          break;
        }
      }
    }
    if (!hasTruths) keys.delete('must_haves');
  }

  return { keys, values, start, end, body: end + 1 };
}

/**
 * Build the prose view: fenced code blocks removed entirely, inline code spans
 * blanked. Returns an array parallel to `lines` (same length, same indices) so a
 * violation can still report a real line number.
 */
function proseView(lines, bodyStart) {
  const out = new Array(lines.length).fill('');
  let inFence = false;
  for (let i = bodyStart; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    out[i] = line.replace(/`[^`]*`/g, ' ');
  }
  return out;
}

/** Extract the inner text of the first <tag>...</tag> in a block, or null. */
function tagContent(block, tag) {
  const open = '<' + tag + '>';
  const close = '</' + tag + '>';
  const a = block.indexOf(open);
  if (a === -1) return null;
  const b = block.indexOf(close, a + open.length);
  if (b === -1) return null;
  return block.slice(a + open.length, b);
}

function lintFile(filePath, knownRequirements, violations) {
  let raw;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch (err) {
    violations.push(filePath + ':1: PLAN UNREADABLE — ' + err.message);
    return 0;
  }
  const lines = raw.split('\n');
  const rel = path.relative(APP_DIR, filePath) || filePath;
  const add = (line, marker, detail) => {
    violations.push(rel + ':' + line + ': ' + marker + ' — ' + detail);
  };

  const fm = parseFrontmatter(lines);
  if (fm.start === -1 || fm.end === -1) {
    add(1, 'MISSING FRONTMATTER KEY', 'no YAML frontmatter block found at all');
    return 0;
  }

  // Rule 1 — MISSING FRONTMATTER KEY
  for (const key of REQUIRED_FRONTMATTER_KEYS) {
    if (!fm.keys.has(key)) {
      const detail =
        key === 'must_haves'
          ? 'must_haves is absent, or present without a truths: entry'
          : 'required frontmatter key `' + key + '` is absent';
      add(fm.start + 1, 'MISSING FRONTMATTER KEY', detail);
    }
  }

  // Rule 2 — UNKNOWN REQUIREMENT
  for (const id of fm.values.get('requirements') || []) {
    if (!knownRequirements.has(id)) {
      add(
        fm.start + 1,
        'UNKNOWN REQUIREMENT',
        id + ' does not appear in .planning/REQUIREMENTS.md',
      );
    }
  }

  // Rule 3 — BROKEN DEPENDENCY
  const dir = path.dirname(filePath);
  for (const dep of fm.values.get('depends_on') || []) {
    const target = path.join(dir, dep + '-PLAN.md');
    if (!existsSync(target)) {
      add(
        fm.start + 1,
        'BROKEN DEPENDENCY',
        dep + ' has no matching ' + dep + '-PLAN.md in ' + path.basename(dir),
      );
    }
  }

  // Rule 4 — MISSING SECTION
  for (const section of REQUIRED_SECTIONS) {
    const idx = lines.findIndex((l, i) => i > fm.end && l.trim() === section);
    if (idx === -1) {
      add(fm.end + 1, 'MISSING SECTION', 'the plan has no ' + section + ' section');
    }
  }

  // Rules 5 and 6 — INCOMPLETE TASK, THIN ACCEPTANCE
  const taskStarts = [];
  for (let i = fm.end + 1; i < lines.length; i += 1) {
    const m = /^\s*<task([ >])/.exec(lines[i]);
    if (m) taskStarts.push(i);
  }
  for (let t = 0; t < taskStarts.length; t += 1) {
    const from = taskStarts[t];
    const to = t + 1 < taskStarts.length ? taskStarts[t + 1] : lines.length;
    const block = lines.slice(from, to).join('\n');
    for (const field of REQUIRED_TASK_FIELDS) {
      const content = tagContent(block, field);
      if (content === null || content.trim() === '') {
        add(
          from + 1,
          'INCOMPLETE TASK',
          '<' + field + '> is absent or empty in this task',
        );
      }
    }
    const ac = tagContent(block, 'acceptance_criteria');
    if (ac !== null) {
      const bullets = ac.split('\n').filter((l) => l.trim().startsWith('-'));
      if (bullets.length < 2) {
        add(
          from + 1,
          'THIN ACCEPTANCE',
          '<acceptance_criteria> has ' + bullets.length +
            ' bullet line(s); at least 2 are required',
        );
      }
    }
  }

  // Rules 7 and 8 — prose only.
  const prose = proseView(lines, fm.end + 1);
  const scanPhrases = (phrases, marker) => {
    for (let i = 0; i < prose.length; i += 1) {
      const line = prose[i];
      if (line === '') continue;
      const lower = line.toLowerCase();
      for (const phrase of phrases) {
        if (CASE_SENSITIVE_PHRASES.has(phrase)) {
          const re =
            phrase === '???'
              ? /\?\?\?/
              : new RegExp('\\b' + phrase + '\\b');
          if (re.test(line)) {
            add(i + 1, marker, 'prose contains ' + JSON.stringify(phrase));
          }
        } else if (lower.includes(phrase)) {
          add(i + 1, marker, 'prose contains ' + JSON.stringify(phrase));
        }
      }
    }
  };
  scanPhrases(OPEN_WORLD_PHRASES, 'OPEN WORLD PHRASE');
  scanPhrases(LEGAL_JUDGMENT_PHRASES, 'LEGAL JUDGMENT IN PLAN');

  // Rule 9 — UNGROUNDED LEGAL FIX
  const reqs = new Set(fm.values.get('requirements') || []);
  for (const [law, lawyer] of LAWYER_BLOCKED) {
    if (reqs.has(law) && !raw.includes(lawyer)) {
      add(
        fm.start + 1,
        'UNGROUNDED LEGAL FIX',
        law + ' is lawyer-blocked and this plan never cites ' + lawyer,
      );
    }
  }

  return taskStarts.length;
}

// --- arguments --------------------------------------------------------------

const argv = process.argv.slice(2);
let singleFile = null;
let listOnly = false;

for (let i = 0; i < argv.length; i += 1) {
  const arg = argv[i];
  if (arg === '--file') {
    const v = argv[i + 1];
    if (!v) fatal('PLAN UNREADABLE: --file requires a path argument');
    singleFile = path.resolve(process.cwd(), v);
    i += 1;
  } else if (arg === '--list') {
    listOnly = true;
  } else {
    fatal('PLAN UNREADABLE: unknown argument: ' + arg + ' (only --file and --list exist)');
  }
}

const files = singleFile === null ? discoverPlans() : [singleFile];

if (listOnly) {
  for (const f of files) console.log(path.relative(APP_DIR, f) || f);
  process.exit(0);
}

if (files.length === 0) {
  fatal(
    'NO PLANS FOUND: discovered zero *-PLAN.md files under ' + PHASES_DIR + '\n' +
      '  A lint that silently passes on an empty set is worse than no lint.',
  );
}

for (const f of files) {
  if (!existsSync(f)) {
    fatal('PLAN UNREADABLE: no such file: ' + f);
  }
}

if (!existsSync(REQUIREMENTS_PATH)) {
  fatal('PLAN UNREADABLE: no such file: ' + REQUIREMENTS_PATH);
}
const requirementsText = readFileSync(REQUIREMENTS_PATH, 'utf8');
const knownRequirements = new Set(
  requirementsText.match(/\b[A-Z][A-Z0-9]*-[0-9]{2}\b/g) || [],
);

const violations = [];
let lintedCount = 0;
let taskTotal = 0;
for (const f of files) {
  taskTotal += lintFile(f, knownRequirements, violations);
  lintedCount += 1;
}

// --- GATE-09 skip accounting ------------------------------------------------
// total  = *-PLAN.md files discovered; skipped = discovered but not linted.
function reportSkips() {
  console.log('GATE-SKIPS total=' + files.length + ' skipped=' + (files.length - lintedCount));
}

if (violations.length > 0) {
  console.error('');
  console.error('=========================================================');
  console.error('CLOSED-WORLD PLAN LINT FAILED — ' + violations.length + ' violation(s)');
  console.error('=========================================================');
  for (const v of violations) {
    console.error('  ' + v);
  }
  console.error('');
  console.error('See .planning/PLAN-STANDARD.md for each rule. There is no waiver');
  console.error('mechanism: the fix is to state the missing decision concretely.');
  console.error('');
  reportSkips();
  process.exit(1);
}

console.log('PLANS OK — ' + files.length + ' plan file(s), ' + taskTotal + ' task(s) checked');
reportSkips();
process.exit(0);

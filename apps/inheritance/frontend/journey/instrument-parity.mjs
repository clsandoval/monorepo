/*
 * journey/instrument-parity.mjs — gate G39, "instrument parity".
 *
 * EVERY ASSERTION IS MADE AGAINST THE PDF THE PRODUCT'S OWN "Export PDF" BUTTON
 * PRODUCED DURING THIS RUN. The bytes come from `journey/pdf-capture.mjs`, which
 * drives a real browser, clicks the real control and takes the real download. A
 * document this harness rendered for itself would prove the harness can call
 * @react-pdf/renderer — not that a lawyer pressing the button gets an
 * instrument.
 *
 * WHAT IT PROVES, the five things Phase 23 built:
 *
 *   1. LETTERHEAD MISSING          — a configured firm name and address reached the page
 *   2. ATTRIBUTION LINE MISSING    — five labelled counsel credentials reached the page
 *   3. WARNING NOT PRINTED         — every engine warning, with its severity and its heir
 *   4. MARKDOWN ASTERISK IN PDF    — no markdown emphasis marker survived
 *   5. CITATION ARTICLE REPEATED   — no citation line names its article twice
 *
 * THE EXPECTED WARNING SET IS COMPUTED, NEVER STORED. It is the compiled
 * engine's own output for this run, returned by the capture alongside the bytes,
 * so the gate compares the document against a computation of the same case.
 *
 * THE ATTRIBUTION VALUES COME FROM A COMMITTED FIXTURE OF FACTS the gate itself
 * writes and then restores. The five are pairwise distinct so a crossed binding
 * cannot pass by coincidence. The labels are TRANSCRIBED from
 * `src/components/pdf/AttributionSection.tsx` rather than imported: a gate that
 * imported the product's own constants would agree with the product rather than
 * with the document.
 *
 * THE SEEDED ALPHA CASE EMITS ZERO WARNINGS. It is a verbatim copy of
 * `engine/examples/cases/02-married-3lc.json`. A run capturing it would assert
 * warning parity over an empty set and pass vacuously, so this gate supplies its
 * own warning-bearing fact set — a byte-for-byte copy of the committed engine
 * case `17-adopted-child.json`, chosen because it is one of only two committed
 * cases that produce a warning and the only one whose warning names a heir.
 * Choosing a family structure is the beginning of a legal judgment no agent may
 * make, which is exactly why the fixture is a copy rather than hand-written.
 *
 * A RUN THAT EXAMINES AN EMPTY CORPUS FAILS. Zero warnings, zero attribution
 * lines or zero citation lines is exit 1 with `INSTRUMENT CORPUS EMPTY`. A gate
 * that asserted nothing is not a gate.
 *
 * IT BORROWS AND RESTORES. The Alpha case `input_json` and the seven profile
 * columns are stashed before anything is written and restored in a `finally`
 * that runs on the pass path, the fail path and the throw path — G17, G19, G23,
 * G24 and G25 all read those rows afterwards.
 *
 * IT HAS NO WRITE PATH AND NO FLAG. It never writes into either reference image
 * directory, parses no command-line argument at all, and has no approval,
 * repair, acceptance or regeneration switch.
 *
 * IT DECIDES NO POINT OF PHILIPPINE LAW. It compares text against the engine's
 * own output and against a committed fixture of facts. It never judges whether a
 * warning is correct or whether an article is the right one.
 *
 * Exit contract, the project's three-valued one: 0 passed, 1 failed, 2 could not
 * run (`INSTRUMENT PARITY CANNOT RUN:` on stderr).
 */

import { readFileSync } from 'node:fs';

import { JourneyCannotRun } from './serve.mjs';
import { captureExportedPdf } from './pdf-capture.mjs';
import { extractPdfText, PDF_MARKERS } from './pdf.mjs';
import { readStackEnv, adminClient } from './session.mjs';
import { readFixtures } from './seed.mjs';
import { canonicalAlphaInput } from './resets.mjs';

const TOTAL_CHECKS = 5;

/**
 * Exit 2. ONLY callable before anything has been written, or after the restore
 * has run.
 *
 * `process.exit()` does NOT run pending `finally` blocks. A cannot-run raised
 * from inside the borrow window would therefore leave the seeded Alpha case
 * carrying another case's fact set — which is threat T-23-07a, and which this
 * gate was observed doing before the borrow window was restructured to convert
 * every cannot-run into a thrown `JourneyCannotRun`, restore, and only then
 * exit.
 */
function cannotRun(reason) {
  console.error(`INSTRUMENT PARITY CANNOT RUN: ${reason}`);
  console.log(`GATE-SKIPS total=${TOTAL_CHECKS} skipped=${TOTAL_CHECKS}`);
  process.exit(2);
}

/**
 * The five attribution labels, transcribed from AttributionSection.tsx.
 * `key` is the snake_case column the fixture holds the value under.
 */
const ATTRIBUTION_PAIRS = Object.freeze([
  { label: 'Counsel:', key: 'counsel_name' },
  { label: 'Roll of Attorneys No.:', key: 'roll_of_attorneys_no' },
  { label: 'IBP Roll No.:', key: 'ibp_roll_no' },
  { label: 'PTR No.:', key: 'ptr_no' },
  { label: 'MCLE Compliance No.:', key: 'mcle_compliance_no' },
]);

/** The seven profile columns the gate writes, and therefore must restore. */
const PROFILE_COLUMNS = Object.freeze([
  'firm_name',
  'firm_address',
  'counsel_name',
  'roll_of_attorneys_no',
  'ibp_roll_no',
  'ptr_no',
  'mcle_compliance_no',
]);

/**
 * The severity map, transcribed from src/lib/warnings-lines.ts for the same
 * reason the labels are: the gate must agree with the document, not with the
 * module that produced it.
 */
const SEVERITY_BY_CATEGORY = Object.freeze({
  preterition: 'error',
  max_restarts: 'error',
  inofficiousness: 'warning',
  disinheritance: 'warning',
  vacancy_unresolved: 'warning',
  unknown_donee: 'info',
});

function severityOf(category) {
  return SEVERITY_BY_CATEGORY[category] ?? 'info';
}

function readJsonFixture(name) {
  return JSON.parse(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));
}

async function main() {
  const env = readStackEnv();
  if (env === null || !env.API_URL) {
    cannotRun('local Supabase stack is not running');
  }

  const admin = adminClient(env);
  const fixtures = readFixtures();
  const caseId = fixtures.orgs.alpha.case_id;
  const userId = fixtures.orgs.alpha.user_id;

  const warningInput = readJsonFixture('warning-input-alpha.json');
  const profileFixture = readJsonFixture('firm-profile-alpha.json');

  /*
   * No runtime stash. The restore below writes the CANONICAL seeded values —
   * input_json from the committed engine case (the value seed.sql embeds,
   * enforced byte-for-byte by scripts/check-seed-fixture.mjs) and the profile
   * columns to their seeded schema defaults (seed.sql inserts only id, email,
   * full_name). A stash read at run start was observed to perpetuate its own
   * poison: a run killed inside the borrow window skips the restore, and the
   * NEXT run then stashes the already-poisoned row and faithfully restores it.
   * Restoring constants makes the restore idempotent and correct on every path,
   * including after a crash of a previous run.
   */
  const canonicalInput = canonicalAlphaInput();
  const canonicalProfile = {};
  for (const col of PROFILE_COLUMNS) {
    canonicalProfile[col] = null;
  }

  const failures = [];
  let warningCount = 0;
  let attributionChecked = 0;
  let citationLines = 0;
  // Set instead of exiting, so the restore below always runs first.
  let cannotRunReason = null;

  try {
    // ── Capture, with the warning-bearing fact set and a configured firm ──
    const prepare = async (client) => {
      const { error: e1 } = await client
        .from('cases')
        .update({ input_json: warningInput })
        .eq('id', caseId);
      if (e1) throw new JourneyCannotRun(`could not write the warning fixture: ${e1.message}`);

      const { error: e2 } = await client
        .from('user_profiles')
        .update(profileFixture)
        .eq('id', userId);
      if (e2) throw new JourneyCannotRun(`could not write the profile fixture: ${e2.message}`);
    };

    let captured;
    try {
      captured = await captureExportedPdf({ prepare });
    } catch (err) {
      if (err instanceof JourneyCannotRun) throw err;
      if (err && typeof err.message === 'string' && err.message.startsWith(PDF_MARKERS.TOOLCHAIN_MISSING)) {
        throw new JourneyCannotRun(err.message);
      }
      throw err;
    }

    let rawText;
    try {
      rawText = extractPdfText(captured.pdfBuffer);
    } catch (err) {
      throw new JourneyCannotRun(
        `could not extract text from the exported PDF: ${err && err.message ? err.message : err}`,
      );
    }
    const text = rawText.replace(/\s+/g, ' ');

    // ── 1. LETTERHEAD MISSING ──────────────────────────────────────────
    for (const key of ['firm_name', 'firm_address']) {
      const value = profileFixture[key];
      if (!text.includes(value)) {
        failures.push(
          `LETTERHEAD MISSING — the exported document does not contain ${JSON.stringify(value)}, ` +
            `which the firm profile this run configured holds in ${key}`,
        );
      }
    }

    // ── 2. ATTRIBUTION LINE MISSING ────────────────────────────────────
    for (const { label, key } of ATTRIBUTION_PAIRS) {
      const expected = `${label} ${profileFixture[key]}`;
      attributionChecked += 1;
      if (!text.includes(expected)) {
        failures.push(
          `ATTRIBUTION LINE MISSING — the exported document does not contain ${JSON.stringify(expected)}`,
        );
      }
    }

    // ── 3. WARNING NOT PRINTED ─────────────────────────────────────────
    const warnings = captured.expected.warnings ?? [];
    warningCount = warnings.length;

    if (warningCount > 0 && !text.includes('Manual Review Required')) {
      failures.push(
        'WARNING SECTION MISSING — the engine produced at least one warning but the exported ' +
          'document does not contain the heading "Manual Review Required"',
      );
    }

    for (const w of warnings) {
      if (!text.includes(w.description)) {
        failures.push(
          `WARNING NOT PRINTED — the exported document does not contain the description of the ` +
            `${JSON.stringify(w.category)} warning: ${JSON.stringify(w.description)}`,
        );
      }

      const severity = severityOf(w.category);
      if (!text.includes(`[${severity}]`)) {
        failures.push(
          `WARNING SEVERITY NOT PRINTED — the ${JSON.stringify(w.category)} warning classifies as ` +
            `${JSON.stringify(severity)} but the exported document does not contain ${JSON.stringify(`[${severity}]`)}`,
        );
      }

      if (w.related_heir_id !== null && w.related_heir_id !== undefined) {
        const match = (captured.expected.per_heir_shares ?? []).find(
          (s) => s.heir_id === w.related_heir_id,
        );
        const heirName = match ? match.heir_name : `UNRESOLVED HEIR ${w.related_heir_id}`;
        const expected = `Related heir: ${heirName}`;
        if (!text.includes(expected)) {
          failures.push(
            `WARNING HEIR NOT PRINTED — the ${JSON.stringify(w.category)} warning names heir ` +
              `${JSON.stringify(w.related_heir_id)} but the exported document does not contain ` +
              `${JSON.stringify(expected)}`,
          );
        }
      }
    }

    // ── 4. MARKDOWN ASTERISK IN PDF ────────────────────────────────────
    // Built from char codes so this file holds no literal asterisk pair of its
    // own to confuse a later grep over the gate set.
    const STAR = String.fromCharCode(42);
    const MARKER = STAR + STAR;
    const at = rawText.indexOf(MARKER);
    if (at !== -1) {
      const context = rawText.slice(Math.max(0, at - 20), at + 20);
      failures.push(
        `MARKDOWN ASTERISK IN PDF — the extracted text contains a markdown emphasis marker at ` +
          `index ${at}: ${JSON.stringify(context)}`,
      );
    }

    // ── 5. CITATION ARTICLE REPEATED ───────────────────────────────────
    // A citation line begins with three letters, a period, a number, an
    // optional paragraph-sign suffix, then a colon and a space.
    const CITATION_LEAD = /^([A-Za-z]{3}\.\s*(\d+)(?:\s*¶\s*\d+)?)\s*:\s/;
    for (const line of rawText.split('\n')) {
      const trimmed = line.trim();
      const lead = CITATION_LEAD.exec(trimmed);
      if (lead === null) continue;
      citationLines += 1;

      const articleNumber = lead[2];
      const token = new RegExp(`[A-Za-z]{3}\\.\\s*${articleNumber}\\b`, 'g');
      const count = (trimmed.match(token) ?? []).length;
      if (count > 1) {
        failures.push(
          `CITATION ARTICLE REPEATED — ${JSON.stringify(trimmed)} names its article ${count} times`,
        );
      }
    }

    // ── 6. INSTRUMENT CORPUS EMPTY ─────────────────────────────────────
    if (warningCount === 0 || attributionChecked === 0 || citationLines === 0) {
      failures.push(
        `INSTRUMENT CORPUS EMPTY — warnings=${warningCount} attributionLines=${attributionChecked} ` +
          `citationLines=${citationLines}; this run asserted nothing and a gate that examines an ` +
          `empty corpus is not a gate`,
      );
    }
  } catch (err) {
    // A cannot-run raised inside the borrow window becomes a deferred exit, so
    // the restore in the `finally` below still runs. Anything else propagates.
    if (err instanceof JourneyCannotRun) {
      cannotRunReason = err.reason ?? err.message;
    } else {
      throw err;
    }
  } finally {
    // ── Restore, on every path: pass, fail, cannot-run and throw ──────
    // Errors are captured, not ignored: a restore that silently fails leaves
    // the seeded row poisoned and every later journey step rendering the wrong
    // case (observed 2026-08-10 as 18 G17 steps red with scenario I1, no
    // spouse). They are re-raised AFTER the borrow window closes.
    const { error: restoreCaseErr } = await admin
      .from('cases')
      .update({ input_json: canonicalInput })
      .eq('id', caseId);
    const { error: restoreProfileErr } = await admin
      .from('user_profiles')
      .update(canonicalProfile)
      .eq('id', userId);
    if (restoreCaseErr || restoreProfileErr) {
      const msgs = [restoreCaseErr?.message, restoreProfileErr?.message].filter(Boolean).join('; ');
      cannotRunReason = `RESTORE FAILED — seeded Alpha rows may be poisoned, re-run supabase seed: ${msgs}`;
    }
  }

  // Only now, with the borrowed rows given back, may the process exit.
  if (cannotRunReason !== null) cannotRun(cannotRunReason);

  // ── Report ───────────────────────────────────────────────────────────
  for (const f of failures) console.error(f);
  console.log(`GATE-SKIPS total=${TOTAL_CHECKS} skipped=0`);

  if (failures.length > 0) {
    console.error(`INSTRUMENT PARITY FAIL checks=${TOTAL_CHECKS} failed=${failures.length}`);
    process.exit(1);
  }

  console.log(
    `INSTRUMENT PARITY PASS warnings=${warningCount} attributionLines=${attributionChecked} ` +
      `citationLines=${citationLines} letterhead=1`,
  );
}

main().catch((err) => {
  console.error(`INSTRUMENT PARITY FAIL checks=? failed=? : ${err && err.stack ? err.stack : err}`);
  console.log(`GATE-SKIPS total=${TOTAL_CHECKS} skipped=0`);
  process.exit(1);
});

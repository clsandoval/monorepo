/**
 * The pasteable schedule-of-shares clause, as plain text.
 *
 * THIS MODULE RENDERS AND NEVER COMPUTES. Every peso string it prints is
 * `line.displayAmount` or `schedule.statedSumDisplay`, already built by
 * `buildDeedSchedule`; every article it prints is an element of `line.articles`,
 * already copied verbatim from the engine; every notice it prints is a constant
 * imported from `./schedule-lines`. This file holds the LAYOUT and owns no
 * value — exactly the relationship `frontend/src/lib/form1801-csv.ts` has to
 * `buildForm1801Lines`. It therefore cannot disagree with the DOCX or with the
 * screen about what the schedule says.
 *
 * A REFUSED LINE PRINTS NO NUMBER AND NO ARTICLE, so a refusal can never be
 * misread as a share. Line numbering still runs 1..N over every heir block,
 * refused ones included, so a heir's position on the schedule is stable whether
 * or not the engine flagged them.
 *
 * NOTHING ELSE OF THE DEED IS EMITTED. There is no parties clause, no
 * publication clause, no bond clause, no undertaking, no acknowledgment, no
 * jurat, no notarial block and no operative adjudicating sentence — and the
 * clause says so on its own face, so a reader cannot mistake this for a filed
 * instrument.
 *
 * Separator is `\n` throughout, and the returned string carries no trailing
 * newline, so `split('\n')` yields no empty final element and the DOCX gains no
 * spurious empty paragraph.
 */

import type { DeedSchedule } from './schedule-lines';
import {
  DEED_CLAUSE_TITLE,
  DEED_SCOPE_NOTICE,
  DEED_AUTHORITY_NOTICE,
  DEED_WORDING_OPEN_QUESTION,
  DOCUMENT_REFUSAL_HEADING,
  LINE_REFUSAL_LABEL,
  REFUSAL_CLOSING,
  SUM_INCOMPLETE_NOTICE,
} from './schedule-lines';
import { slugifyName } from '../pdf-export';

/** The marker line that opens the heir-block section. The parity gate anchors on it. */
const SHARES_MARKER = 'SHARES';

/** The stated-amount field prefix. The three leading spaces are part of the constant. */
const SHARE_FIELD = '   Share: ';

/** The article field prefix. The three leading spaces are part of the constant. */
const ARTICLES_FIELD = '   Governing article(s): ';

/** Indentation for every continuation line inside a heir block. */
const INDENT = '   ';

/**
 * Render the whole clause.
 *
 * Exactly one block per element of `schedule.lines`, in the engine's own order,
 * separated by exactly one blank line, introduced by the fixed `SHARES` marker
 * — which is what lets the parity gate align blocks to `per_heir_shares` by
 * index rather than by scanning for something that looks like a share.
 */
export function buildDeedClauseText(schedule: DeedSchedule): string {
  const lines: string[] = [];

  lines.push(DEED_CLAUSE_TITLE);
  lines.push('');
  lines.push(`Estate of: ${schedule.decedentName}`);
  lines.push(`Date of death: ${schedule.dateOfDeath}`);
  lines.push(`Net distributable estate as entered: ${schedule.netEstateDisplay}`);
  lines.push('');
  lines.push(DEED_SCOPE_NOTICE);
  lines.push('');
  lines.push(DEED_AUTHORITY_NOTICE);
  lines.push('');
  lines.push(DEED_WORDING_OPEN_QUESTION);
  lines.push('');

  if (schedule.documentRefusals.length > 0) {
    lines.push(DOCUMENT_REFUSAL_HEADING);
    for (const refusal of schedule.documentRefusals) {
      lines.push(`- ${refusal}`);
    }
    lines.push('');
  }

  lines.push(SHARES_MARKER);
  lines.push('');

  if (schedule.lines.length === 0) {
    lines.push(`${INDENT}No heir share was returned by the engine.`);
  } else {
    for (let k = 0; k < schedule.lines.length; k += 1) {
      const line = schedule.lines[k]!;
      if (k > 0) {
        lines.push('');
      }
      lines.push(`${k + 1}. ${line.heirName} (${line.categoryLabel})`);
      if (line.kind === 'stated') {
        lines.push(`${SHARE_FIELD}${line.displayAmount}`);
        lines.push(`${ARTICLES_FIELD}${line.articles.join('; ')}`);
      } else {
        lines.push(`${INDENT}${LINE_REFUSAL_LABEL}`);
        for (const reason of line.refusalReasons) {
          lines.push(`${INDENT}- ${reason}`);
        }
        lines.push(`${INDENT}${REFUSAL_CLOSING}`);
      }
    }
  }

  lines.push('');
  lines.push(`Lines stated: ${schedule.statedCount}`);
  lines.push(`Lines refused: ${schedule.refusedCount}`);
  lines.push(`Sum of the shares stated above: ${schedule.statedSumDisplay}`);
  if (schedule.refusedCount > 0) {
    lines.push(SUM_INCOMPLETE_NOTICE);
  }

  return lines.join('\n');
}

/**
 * The download base name, without an extension.
 *
 * A blank or punctuation-only decedent name slugs to the empty string, which
 * would produce two consecutive hyphens; `unnamed-decedent` stands in instead.
 */
export function deedClauseBaseName(schedule: DeedSchedule): string {
  const slug = slugifyName(schedule.decedentName) || 'unnamed-decedent';
  return `deed-schedule-of-shares-${slug}-${schedule.dateOfDeath}`;
}

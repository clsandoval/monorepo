/**
 * The deed schedule-of-shares LINE MODEL — the one site that builds a deed line.
 *
 * THIS MODULE IS THE SOLE CONSTRUCTOR of a deed schedule line, of a deed peso
 * amount string and of a deed article list. The clause text (22-03), the DOCX
 * (22-04) and the on-screen section (22-05) are all renderers over what this
 * module returns, so three renderers cannot disagree about which lines exist,
 * what each line states, or which article governs it.
 *
 * THE ENGINE IS THE SINGLE ATTRIBUTION AUTHORITY. Every article string on every
 * line is a verbatim element of `InheritanceShare.legal_basis`, copied by array
 * copy and never parsed, reordered, deduplicated, prefixed, suffixed or looked
 * up. THIS FILE CONTAINS NO ARTICLE LITERAL AND DERIVES NO ARTICLE. That is
 * CLAUDE.md invariant 5 and gate G14, and it is why a citation on the deed
 * cannot drift from the citation on the screen.
 *
 * THE MONEY FIELD IS `net_from_estate` — the same field `journey/money-parity.mjs`
 * already asserts for the `heir-net-*` cells on the results screen. A deed
 * stating a different field than the screen the lawyer just read would be a
 * second, silently-disagreeing figure, which is the one unrecoverable failure.
 *
 * ALL ARITHMETIC IS BigInt. `Money.centavos` is typed `Centavos | string`
 * precisely because an estate may exceed the safe integer range of a JS double,
 * and a peso figure on a legal instrument is the last place precision may be
 * lost. No double coercion of a centavo value occurs anywhere in this module.
 *
 * THE FOUR REFUSAL RULES DECIDE NO POINT OF LAW. Each tests the SHAPE of the
 * engine output — an empty article list, a negative amount, a heir-scoped
 * manual-review flag, a document-scoped manual-review flag — and never the
 * meaning of a statute. Where a line cannot be stated, the schedule says so and
 * supplies no wording, rather than inventing one.
 *
 * HEIR ORDER IS THE ENGINE'S OWN `per_heir_shares` ORDER, unchanged. Sorting a
 * schedule of shares would imply an order of preference the engine did not state.
 *
 * Source of truth for the refusal rules: 22-RESEARCH.md §4.
 */

import type { EngineInput, EngineOutput } from '../../types';
import { EFFECTIVE_CATEGORY_LABELS } from '../../types';

/** The clause heading. */
export const DEED_CLAUSE_TITLE = 'SCHEDULE OF SHARES';

/** States plainly what this document is not, so nobody files it as a deed. */
export const DEED_SCOPE_NOTICE =
  'This document is the schedule-of-shares clause only. It contains no parties clause, no publication clause, no bond clause, no undertaking, no acknowledgment and no signature block, and it is not itself a Deed of Extrajudicial Settlement.';

/** States where every article on the schedule came from. */
export const DEED_AUTHORITY_NOTICE =
  'Each stated line below carries the Civil Code article or articles the computation engine emitted for that heir. No article on this schedule was supplied by the document generator.';

// LAWYER-DECISION: LAWYER-13 — the open question this notice discloses.
// Recorded in .planning/LAWYER-AGENDA.md and .planning/lawyer-decisions.json.
// NO READING HAS BEEN ADOPTED. The generator states a peso amount because that
// is the figure the engine computes; whether a Deed of Extrajudicial Settlement
// instead requires per-property identification is the lawyer's to answer, and
// until they do the question is disclosed on the face of every clause rather
// than silently resolved one way.
export const DEED_WORDING_OPEN_QUESTION =
  "This schedule states each heir's share as a peso amount. It identifies no specific property and adjudicates none. Whether a Deed of Extrajudicial Settlement requires per-property identification is recorded as open question LAWYER-13 in .planning/LAWYER-AGENDA.md and has not been answered.";

/** Heading over the document-scoped refusals. */
export const DOCUMENT_REFUSAL_HEADING = 'MANUAL REVIEW REQUIRED BEFORE THIS SCHEDULE IS USED';

/** What stands where a peso amount would otherwise stand on a refused line. */
export const LINE_REFUSAL_LABEL = 'MANUAL REVIEW REQUIRED — NO SHARE STATED';

/** R1 — the engine emitted no governing article. */
export const REFUSAL_NO_ARTICLE =
  'The engine emitted no governing article for this heir, so no line is stated.';

/** R0 — the engine returned a negative net share. */
export const REFUSAL_NEGATIVE_AMOUNT =
  'The engine returned a negative net share for this heir, which this schedule will not state.';

/** R2 — prefix before a verbatim heir-scoped engine flag. */
export const REFUSAL_FLAGGED_PREFIX = 'The engine raised a manual-review flag against this heir: ';

/** Closes every refusal: no wording is supplied. */
export const REFUSAL_CLOSING = 'A lawyer must decide this line. No wording is supplied for it.';

/** Qualifies the sum whenever any line is refused. */
export const SUM_INCOMPLETE_NOTICE =
  'This sum covers the stated lines only and is incomplete while any line above is refused.';

export type DeedLineKind = 'stated' | 'refused';

export interface DeedScheduleLine {
  heirId: string;
  heirName: string;
  categoryLabel: string;
  kind: DeedLineKind;
  amountCentavos: string | null;
  displayAmount: string | null;
  articles: string[];
  refusalReasons: string[];
}

export interface DeedSchedule {
  decedentName: string;
  dateOfDeath: string;
  netEstateCentavos: string;
  netEstateDisplay: string;
  lines: DeedScheduleLine[];
  documentRefusals: string[];
  statedCount: number;
  refusedCount: number;
  statedSumCentavos: string;
  statedSumDisplay: string;
}

/**
 * Format a centavo value as a deed peso amount.
 *
 * The two centavo digits are ALWAYS printed. This deliberately differs from
 * `formatPeso` in `src/types/index.ts`, which drops a trailing `.00`, because a
 * deed states centavos explicitly or states nothing at all.
 *
 * Throws on a negative value: a negative share is refused by
 * `buildDeedSchedule` under rule R0 and must never be formatted as an amount.
 */
export function formatDeedPesos(centavos: bigint | number | string): string {
  const c = BigInt(centavos);
  if (c < 0n) {
    throw new Error('DEED NEGATIVE AMOUNT: ' + c.toString());
  }
  return 'PHP ' + (c / 100n).toLocaleString('en-US') + '.' + (c % 100n).toString().padStart(2, '0');
}

/**
 * Build the deed schedule from one engine input and its engine output.
 *
 * Pure: reads no clock, no storage and no network. Every heir name and article
 * is passed through raw and unmodified — escaping belongs to whichever renderer
 * owns an encoding, never here, or a legitimate name containing an ampersand
 * would be double-escaped on the plain-text surface.
 */
export function buildDeedSchedule(input: EngineInput, output: EngineOutput): DeedSchedule {
  const documentRefusals: string[] = [];
  for (const flag of output.warnings) {
    if (flag.related_heir_id === null) {
      documentRefusals.push(`${flag.category}: ${flag.description}`);
    }
  }

  const lines: DeedScheduleLine[] = [];
  for (const share of output.per_heir_shares) {
    const categoryLabel =
      EFFECTIVE_CATEGORY_LABELS[share.heir_category] ?? (share.heir_category as string);
    const articles = [...share.legal_basis];
    const c = BigInt(share.net_from_estate.centavos);

    const refusalReasons: string[] = [];
    if (c < 0n) {
      refusalReasons.push(REFUSAL_NEGATIVE_AMOUNT);
    }
    if (share.legal_basis.length === 0) {
      refusalReasons.push(REFUSAL_NO_ARTICLE);
    }
    for (const flag of output.warnings) {
      if (flag.related_heir_id === share.heir_id) {
        refusalReasons.push(`${REFUSAL_FLAGGED_PREFIX}${flag.category}: ${flag.description}`);
      }
    }

    const refused = refusalReasons.length > 0;
    lines.push({
      heirId: share.heir_id,
      heirName: share.heir_name,
      categoryLabel,
      kind: refused ? 'refused' : 'stated',
      amountCentavos: refused ? null : c.toString(),
      displayAmount: refused ? null : formatDeedPesos(c),
      articles,
      refusalReasons,
    });
  }

  let statedCount = 0;
  let refusedCount = 0;
  let statedSum = 0n;
  for (const line of lines) {
    if (line.kind === 'stated') {
      statedCount += 1;
      statedSum += BigInt(line.amountCentavos!);
    } else {
      refusedCount += 1;
    }
  }

  const netEstate = BigInt(input.net_distributable_estate.centavos);
  let netEstateDisplay: string;
  try {
    netEstateDisplay = formatDeedPesos(netEstate);
  } catch {
    // A negative estate is never printed as an amount.
    netEstateDisplay = REFUSAL_NEGATIVE_AMOUNT;
  }

  return {
    decedentName: input.decedent.name,
    dateOfDeath: input.decedent.date_of_death,
    netEstateCentavos: netEstate.toString(),
    netEstateDisplay,
    lines,
    documentRefusals,
    statedCount,
    refusedCount,
    statedSumCentavos: statedSum.toString(),
    statedSumDisplay: formatDeedPesos(statedSum),
  };
}

/**
 * The engine-warning LINE MODEL — the one site where a `ManualFlag` becomes text.
 *
 * THIS MODULE IS THE SOLE CONSTRUCTOR of what a warning says. The results
 * screen (`components/results/WarningsPanel.tsx`) and the exported report
 * (`components/pdf/WarningsSection.tsx`) both render the array this module
 * returns, so the two surfaces cannot disagree about a warning's severity, its
 * category, its text or the heir it names. Before this module existed they were
 * two independent literal layouts and they did disagree: the screen printed a
 * severity word and `Related heir: <name>`, the PDF printed neither.
 *
 * IT NEVER LOSES A WARNING. `buildWarningLines` returns exactly one entry per
 * input flag, in input order. It does not filter, sort, merge or de-duplicate,
 * and a `related_heir_id` that matches no awarded share produces a loud
 * `UNRESOLVED HEIR <id>` marker rather than a silently dropped field. In a
 * product whose headline feature is refusing to guess, a warning that vanishes
 * on its way to the page is the one unrecoverable failure.
 *
 * IT DECIDES NO POINT OF LAW. It classifies a category string the engine
 * already emitted and resolves an id the engine already emitted. It never reads
 * a warning's prose and never infers a rule from it, so the severity map cannot
 * be steered by the text it is classifying. THIS FILE CONTAINS NO ARTICLE
 * LITERAL AND DERIVES NO ARTICLE — that is CLAUDE.md invariant 5 and gate G14.
 *
 * IT IS PURE. No clock, no socket, no DOM, and its only import is a type-only
 * one. Both a browser renderer and a headless gate can call it.
 */

import type { ManualFlag, InheritanceShare } from '../types';

export type WarningSeverity = 'error' | 'warning' | 'info';

/**
 * The heading both surfaces print. Taken verbatim from the words the results
 * screen already used, so the screen keeps its wording and the PDF adopts it.
 */
export const WARNINGS_HEADING = 'Manual Review Required';

/** The label that precedes a resolved heir name, verbatim from the screen. */
export const RELATED_HEIR_LABEL = 'Related heir:';

export interface WarningLine {
  severity: WarningSeverity;
  category: string;
  description: string;
  relatedHeirName: string | null;
}

/**
 * The one severity map. Six category-to-severity pairs, and anything the engine
 * emits that is not among them falls through to `info` rather than being
 * dropped or guessed at.
 */
const SEVERITY_BY_CATEGORY: Readonly<Record<string, WarningSeverity>> = Object.freeze({
  preterition: 'error',
  max_restarts: 'error',
  inofficiousness: 'warning',
  disinheritance: 'warning',
  vacancy_unresolved: 'warning',
  unknown_donee: 'info',
});

/** Determine warning severity from the engine's category string. */
export function getWarningSeverity(category: string): WarningSeverity {
  return SEVERITY_BY_CATEGORY[category] ?? 'info';
}

/**
 * Build one line per engine warning, in input order.
 *
 * `shares` is the same array the caller already renders; the heir lookup is an
 * exact `heir_id` equality against it, so a name can only surface if it is
 * already on the same page.
 */
export function buildWarningLines(
  warnings: ManualFlag[],
  shares: InheritanceShare[],
): WarningLine[] {
  return warnings.map((warning) => {
    const heirId = warning.related_heir_id;

    let relatedHeirName: string | null = null;
    if (heirId !== null && heirId !== undefined) {
      const match = shares.find((s) => s.heir_id === heirId);
      relatedHeirName = match ? match.heir_name : `UNRESOLVED HEIR ${heirId}`;
    }

    return {
      severity: getWarningSeverity(warning.category),
      category: warning.category,
      description: warning.description,
      relatedHeirName,
    };
  });
}

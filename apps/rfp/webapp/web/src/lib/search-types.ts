// M3 shared contract between /api/search (backend) and the results UI (frontend).
// This file is the interface both build tracks code against — do not drift it unilaterally.

/** What one Luna plan-call extracts from the user's freeform query. kind:"board" = no/none-search
 *  query (greeting, gibberish, empty) → default board, zero model cost. */
export type SearchPlan = {
  kind: "search" | "board";
  /** FTS terms, already synonym-expanded by the model, joined with OR at execution. 0..6 items. */
  terms: string[];
  province?: string;
  abc_min?: number;
  abc_max?: number;
  /** only show notices closing within N days */
  days_max?: number;
  /** short human summary of the interpretation, e.g. "drainage · Cavite · under ₱5M" */
  note: string;
};

/** One row in the results list — subset of rfp search --json hit fields + Notice card fields. */
export type ResultRow = {
  id: number;
  source: string | null;
  title: string;
  agency: string;
  location: string | null;
  province: string | null;
  abc: number | null;
  abc_lot_min: number | null;
  abc_lot_max: number | null;
  mode_norm: string | null;
  closing_at: string | null;
  closing_day: string | null;
  work_type: string | null;
  needs_pcab: number | null;
  /** days to closing, negative = closed, null = no date */
  days: number | null;
  /** match snippet when the row came from a term search */
  snippet?: string | null;
};

/** POST /api/search
 *  body {q}                     → interpret (Luna, once) + execute, returns first page + plan
 *  body {plan, offset, limit?}  → execute only (no Luna) — pagination / re-fetch
 *  body {} or {q:""}            → board plan, first page
 */
export type SearchRequest = { q?: string; plan?: SearchPlan; offset?: number; limit?: number };

export type SearchResponse = {
  plan: SearchPlan;
  /** total matching candidates (board: count of Active notices) */
  total: number;
  offset: number;
  results: ResultRow[];
  /** true when another page exists past offset+results.length */
  more: boolean;
};

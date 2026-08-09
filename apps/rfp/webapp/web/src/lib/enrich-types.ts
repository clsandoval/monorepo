// M4 shared contract: the Enrich result (pipeline output = detail page input) and the
// awards-intel row. Both build tracks code against this file — do not drift it unilaterally.

export type EnrichDoc = {
  name: string;
  pages?: number;
  status: "extracted" | "ocr" | "scanned-unreadable" | "too-large" | "fetch-failed";
};

export type Enrich = {
  version: 1;
  at: string; // ISO timestamp of the run
  /** "docs" = grounded in downloaded attachments (mPhilGEPS); "notice-text" = legacy/no-docs,
   *  extracted from the live notice page text only — the UI labels this honestly. */
  source_kind: "docs" | "notice-text";
  summary: string;
  /** What you must deliver. Grounded: `source` names the doc (or "notice text"). */
  deliverables: { item: string; qty?: string; unit?: string; detail?: string; source: string }[];
  /** What you must be/submit. kind "document" = found in the bid docs (quote required);
   *  kind "statutory" comes ONLY from the static rules table, never the model. */
  qualifications: { requirement: string; quote?: string; source: string; kind: "document" | "statutory" }[];
  key_dates: { label: string; value: string }[]; // pre-bid conf, opening, delivery/duration…
  bid_security?: string;
  red_flags: string[]; // e.g. "closes in 2 days", "0-day contract duration", "scanned docs unreadable"
  docs: EnrichDoc[];
  usd: number; // Luna cost of the extraction pass
};

/** GET /api/notice/[id]/enrich → {enrich} (cached) or 404 {error}.
 *  POST same URL → runs the pipeline (returns cached result unless {force:true}), then {enrich}.
 *  Errors: 429 rate-limited, 502 {error} when the live fetch fails, 500 otherwise. */

export type SimilarAward = {
  winner: string;
  winner_province: string | null;
  title: string;
  contract_amount: number;
  abc: number | null;
  win_ratio: number | null; // contract_amount / abc
  award_date: string;
};

/** awards_similar.py CLI contract (lives in RFP_DIR):
 *  python3 awards_similar.py --classification "Civil Works" --province "Cavite" --abc 3900000
 *  → JSON array of SimilarAward, best-first (same classification; province match then ABC
 *  proximity 0.3–3x; newest first within tier; max 5). Empty array when nothing matches. */

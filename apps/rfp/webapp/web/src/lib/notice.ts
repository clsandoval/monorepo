// M4 detail-page data: one corpus row (+tags, +parsed province), awards intel via the
// awards_similar.py CLI, a BOQ heuristic parser, and the static statutory-requirements table.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";
import { readSql } from "@/lib/corpus";
import type { SimilarAward } from "@/lib/enrich-types";

const pexec = promisify(execFile);
const RFP_DIR = process.env.RFP_DIR ?? join(process.cwd(), "..", "..");

export type NoticeDetail = {
  id: number;
  source: string | null;
  title: string;
  agency: string;
  location: string | null;
  province: string | null; // parsed (notice_location), falls back to corpus.location
  abc: number | null;
  abc_lot_min: number | null;
  abc_lot_max: number | null;
  mode: string | null;
  mode_norm: string | null;
  classification: string | null;
  category: string | null;
  status: string | null;
  description: string | null;
  publish_day: string | null;
  closing_at: string | null;
  solicitation_no: string | null;
  delivery: string | null;
  contact: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  work_type: string | null;
  needs_pcab: number | null;
  eligibility: string[]; // tags.eligibility JSON array — extra items named in THIS notice
  scope: string | null;
};

const s = (r: Record<string, unknown>, k: string) => (typeof r[k] === "string" && r[k] !== "" ? (r[k] as string) : null);
const n = (r: Record<string, unknown>, k: string) => (typeof r[k] === "number" ? (r[k] as number) : null);

export async function getNotice(id: number): Promise<NoticeDetail | null> {
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  const rows = await readSql(
    `SELECT c.id, c.source, c.title, c.agency, c.location, c.abc, c.abc_lot_min, c.abc_lot_max,
            c.mode, c.mode_norm, c.classification, c.category, c.status, c.description,
            c.publish_day, c.closing_at, c.solicitation_no, c.delivery_period, c.delivery_days,
            c.contact, c.contact_email, c.contact_phone,
            t.work_type, t.needs_pcab, t.eligibility, t.scope,
            nl.location AS parsed_province
     FROM corpus c
     LEFT JOIN tags t ON t.id = c.id AND t.source = c.source
     LEFT JOIN (SELECT nid, location FROM notice_location WHERE ord = 0) nl ON nl.nid = c.nid
     WHERE c.id = ${id}`, 1);
  const r = rows[0];
  if (!r) return null;
  let eligibility: string[] = [];
  try {
    const e = JSON.parse((r.eligibility as string) ?? "[]");
    if (Array.isArray(e)) eligibility = e.filter((x): x is string => typeof x === "string");
  } catch { /* stored as free text or malformed — drop */ }
  const days = n(r, "delivery_days");
  return {
    id: r.id as number, source: s(r, "source"), title: (r.title as string) ?? `Notice ${id}`,
    agency: (r.agency as string) ?? "", location: s(r, "location"),
    province: s(r, "parsed_province") ?? s(r, "location"),
    abc: n(r, "abc"), abc_lot_min: n(r, "abc_lot_min"), abc_lot_max: n(r, "abc_lot_max"),
    mode: s(r, "mode"), mode_norm: s(r, "mode_norm"), classification: s(r, "classification"),
    category: s(r, "category"), status: s(r, "status"), description: s(r, "description"),
    publish_day: s(r, "publish_day"), closing_at: s(r, "closing_at"),
    solicitation_no: s(r, "solicitation_no"),
    delivery: s(r, "delivery_period") ?? (days != null ? `${days} days` : null),
    contact: s(r, "contact"), contact_email: s(r, "contact_email"), contact_phone: s(r, "contact_phone"),
    work_type: s(r, "work_type"), needs_pcab: n(r, "needs_pcab"),
    eligibility, scope: s(r, "scope"),
  };
}

/** Deep link to the real notice — the two PhilGEPS systems have different detail pages. */
export function philgepsUrl(source: string | null, id: number): string {
  return source === "legacy"
    ? `https://notices.philgeps.gov.ph/GEPSNONPILOT/Tender/SplashBidNoticeAbstractUI.aspx?refID=${id}`
    : `https://philgeps.gov.ph/Indexes/viewLiveTenderDetails/${id}`;
}

// ---------------------------------------------------------------- similar awards (T1's CLI)

/** awards_similar.py per the contract in enrich-types.ts. Tolerates a missing script
 *  (T1 ships it in parallel) and any CLI failure → []. */
export async function getSimilarAwards(
  classification: string | null, province: string | null, abc: number | null,
): Promise<SimilarAward[]> {
  if (!classification || abc == null) return [];
  const args = ["awards_similar.py", "--classification", classification, "--abc", String(abc)];
  if (province) args.push("--province", province);
  try {
    const { stdout } = await pexec("python3", args, { cwd: RFP_DIR, timeout: 15_000, maxBuffer: 1 << 20 });
    const out = JSON.parse(stdout.trim() || "[]");
    if (!Array.isArray(out)) return [];
    return out.filter((a): a is SimilarAward =>
      a && typeof a.winner === "string" && typeof a.contract_amount === "number").slice(0, 5);
  } catch { return []; }
}

// ---------------------------------------------------------------- BOQ parser

export type BoqRow = { item: string; unit: string; qty: number };

// Unit vocab seen in corpus descriptions (normalized: lowercase, trailing dots stripped).
const UNIT_SET = new Set([
  "pc", "pcs", "piece", "pieces", "lot", "lots", "set", "sets", "unit", "units", "pair", "pairs",
  "sheet", "sheets", "sht", "shts", "length", "lengths", "bag", "bags", "box", "boxes", "roll",
  "rolls", "ream", "reams", "pack", "packs", "can", "cans", "gal", "gals", "gallon", "gallons",
  "kg", "kgs", "kilo", "kilos", "kls", "l.s", "ls", "ea", "each", "sq.m", "sqm", "cu.m", "cum",
  "m.t", "mt", "ln.m", "l.m", "lm", "m2", "m3", "m³", "liter", "liters", "litre", "ltr", "ltrs",
  "bdle", "bdles", "bundle", "bundles", "btl", "btls", "bottle", "bottles", "mo", "mos", "month",
  "months", "day", "days", "meter", "meters", "sack", "sacks", "tube", "tubes", "elf", "truckload",
]);
const isUnit = (tok: string) => UNIT_SET.has(tok.toLowerCase().replace(/[.,;:)]+$/, ""));
const numOf = (tok: string): number | null => {
  if (!/^[\d,]+(\.\d+)?$/.test(tok)) return null;
  const v = Number(tok.replace(/,/g, ""));
  return Number.isFinite(v) ? v : null;
};
// Enumeration markers: "I." "A." "A.1" "B.2.3" "301" "1)" — a row label, kept as the item start.
const isMarker = (tok: string) =>
  /^(?:[IVXLCDM]+\.|[A-Za-z]\.(?:\d+(?:\.\d+)*)?|\d+(?:\.\d+)*\.?|\(?\d+\))$/.test(tok);

const cleanItem = (toks: string[]): string | null => {
  // Trim header/preamble noise: start the item at its LAST enumeration marker.
  let start = 0;
  for (let i = toks.length - 1; i >= 0; i--) if (isMarker(toks[i])) { start = i; break; }
  // A bare row label with no words is noise, not an item.
  const item = toks.slice(start).join(" ").trim();
  if (item.length < 2 || item.length > 160 || !/[A-Za-z]{2}/.test(item)) return null;
  return item;
};

/** Heuristic BOQ extractor. Descriptions carry line items in two shapes:
 *  A (trailing qty):  "I. Project Billboard pc. 1.00 [6,439.23] II. Mobilization lot 1.00 …"
 *  B (leading qty):   "1. 246 Bags Portland Cement 2. 19.5 Cu.m River Washed Sand …"
 *  Picks whichever shape yields more rows; null (→ prose fallback) under 3 rows. */
export function parseBoq(description: string | null): BoqRow[] | null {
  if (!description) return null;
  const toks = description.split(/\s+/).filter(Boolean);

  const modeA: BoqRow[] = [];
  let start = 0;
  for (let i = 1; i < toks.length - 1; i++) {
    const qty = numOf(toks[i + 1]);
    if (!isUnit(toks[i]) || qty == null) continue;
    const item = cleanItem(toks.slice(start, i));
    if (item && qty > 0 && qty < 1e7) modeA.push({ item, unit: toks[i].replace(/[,;:]+$/, ""), qty });
    i += 1;
    if (i + 1 < toks.length && numOf(toks[i + 1]) != null) i += 1; // trailing unit price — skip
    start = i + 1;
  }

  const modeB: BoqRow[] = [];
  const bounds: { i: number; qty: number; unit: string }[] = [];
  for (let i = 0; i < toks.length - 1; i++) {
    const qty = numOf(toks[i]);
    if (qty != null && isUnit(toks[i + 1])) { bounds.push({ i, qty, unit: toks[i + 1].replace(/[,;:]+$/, "") }); i += 1; }
  }
  for (let b = 0; b < bounds.length; b++) {
    const from = bounds[b].i + 2;
    const to = b + 1 < bounds.length ? bounds[b + 1].i : Math.min(toks.length, from + 24);
    let seg = toks.slice(from, to);
    while (seg.length && (isMarker(seg[seg.length - 1]) || numOf(seg[seg.length - 1]) != null)) seg = seg.slice(0, -1); // next row's label / price
    const item = seg.join(" ").trim();
    if (item.length >= 2 && item.length <= 160 && /[A-Za-z]{2}/.test(item) && bounds[b].qty > 0 && bounds[b].qty < 1e7)
      modeB.push({ item, unit: bounds[b].unit, qty: bounds[b].qty });
  }

  const best = modeA.length >= modeB.length ? modeA : modeB;
  if (best.length < 3) return null;
  return guardBoq(best.slice(0, 120), toks, description);
}

/** Reject-when-unsure gate. A wrong-but-confident quantities table is WORSE for a bidder than
 *  prose (verified live: row-shifted qty/unit, item-numbers-as-qty, prose-as-BOQ). Each guard
 *  targets a measured failure shape; anything tripped → null → prose fallback. */
function guardBoq(rows: BoqRow[], toks: string[], description: string): BoqRow[] | null {
  // 1. price-qty-unit ambiguity: "ITEM ₱85.00 5.00 pair NEXT…" — two numbers directly before a
  //    unit means one is a price and row binding is guesswork. (Good shape "pc. 1.00 6,439.23"
  //    puts the price AFTER unit+qty and stays legal.)
  let ambiguous = 0;
  for (let i = 0; i + 2 < toks.length; i++) {
    if (/^[\d,]+\.\d{2}$/.test(toks[i]) && numOf(toks[i + 1]) != null && isUnit(toks[i + 2])) ambiguous++;
  }
  if (ambiguous >= 2) return null;
  // 2. item-number-as-qty: qtys forming 1..n are row indices from an "Item No." column.
  if (rows.length >= 3 && rows.every((r, i) => r.qty === i + 1)) return null;
  // 3. garbled column splits: items starting on a dangling fragment ("of 100s 2 Amlodipine…").
  const fragments = rows.filter((r) => /^(of|per|and|the|for|to|with|x)\b/i.test(r.item)).length;
  if (fragments >= 2) return null;
  // 4. prose-as-BOQ: a real BOQ IS the description; a few rows scraped out of long prose are
  //    not. Threshold is low (0.12) because deep BOQs carry unquantified sub-item lines
  //    (measured: real 8.5K-char BOQ ≈ 0.3 consumed, ITB prose ≈ 0.05).
  const consumed = rows.reduce((n, r) => n + r.item.length + r.unit.length + String(r.qty).length + 3, 0);
  if (consumed / description.length < 0.12) return null;
  // 5. per-row junk: explicit money or overlong text inside an item.
  if (rows.some((r) => /₱|\bPHP\b|\bPhp\b/i.test(r.item) || r.item.length > 140)) return null;
  // 6. leaked price tokens: "3,772.00 2 Beef, Ground…" — an unskipped price + row index glued to
  //    the item. Money = comma-thousands, or bare 2-decimals ≥ 50 (dimensions like "0.93 m" are
  //    not money; sub-₱50 unit prices don't appear in BOQ descriptions). ≥2 affected rows = the
  //    whole shape is shifted → reject; exactly 1 = drop that row, keep the honest rest.
  const moneyTok = (s: string) => s.split(/\s+/).some((t) =>
    /^₱?\d{1,3}(,\d{3})+(\.\d{2})?$/.test(t) || (/^\d+\.\d{2}$/.test(t) && Number(t) >= 50));
  const moneyRows = rows.filter((r) => moneyTok(r.item));
  if (moneyRows.length >= 2) return null;
  const kept = moneyRows.length === 1 ? rows.filter((r) => !moneyTok(r.item)) : rows;
  // 7. merged-row items: long AND number-riddled ("…tab x 100 1000 tabs <next drug> 30mg…") means
  //    row boundaries were lost. Short dimension-heavy items (lumber "2 x 2 x 8") stay legal.
  const numHeavy = kept.filter((r) =>
    r.item.length > 90 && (r.item.match(/(^|\s)\d+(\.\d+)?(?=\s|$)/g) ?? []).length >= 3);
  if (numHeavy.length >= 2) return null;
  // 8. spec-sheets and merged package lists masquerading as rows: bullet chars mean product
  //    spec bullets ("• Tank capacity: 6 meters" is not a deliverable); items that END on a
  //    dangling dash are merged multi-line packages with lost row boundaries.
  if (kept.filter((r) => r.item.includes("•")).length >= 2) return null;
  if (kept.filter((r) => /[-–]\s*$/.test(r.item)).length >= 2) return null;
  if (kept.length < 3) return null;
  // cosmetic: strip dot-leader runs ("Oil Filter ………………") and dangling trailing dashes
  return kept.map((r) => ({ ...r, item: r.item.replace(/[….·]{3,}/g, " ").replace(/\s+/g, " ").replace(/[-–]\s*$/, "").trim() }));
}

// ---------------------------------------------------------------- statutory requirements

/** Display a win-ratio as a percentage that NEVER shows a sub-100% win as "100%" — the naive
 *  round has two holes verified live: r=0.995 exactly (strict > excluded it → "100%") and
 *  r∈[0.9995,1) (toFixed(1) → "100.0"). Rule: below 1, floor to one decimal; ≥99 keeps the
 *  decimal ("99.5%", "99.9%"), lower rounds normally ("87%"); r≥1 rounds ("100%", "102%"). */
export function winPct(r: number): string {
  const v = r * 100;
  if (r >= 1) return `${Math.round(v)}%`;
  const f = Math.floor(v * 10) / 10;
  return f >= 99 ? `${f.toFixed(1)}%` : `${Math.round(v)}%`;
}

export type Requirement = { item: string; statute: string };

/** STATIC rules table (BUILD-SPEC: statutory items never come from the model). Keyed by
 *  mode_norm bucket + classification/PCAB flag. Header must caveat "confirm in bid docs". */
export function requirementsFor(
  mode_norm: string | null, classification: string | null, needs_pcab: number | null,
): Requirement[] {
  const mn = (mode_norm ?? "").toLowerCase();
  const infra = classification === "Civil Works" || needs_pcab === 1;
  if (mn.includes("public bidding")) {
    const reqs: Requirement[] = [
      { item: "PhilGEPS Certificate of Platinum Registration (Annex A eligibility documents current)", statute: "IRR §8.5.2" },
      { item: "Registration certificate — SEC, DTI, or CDA", statute: "IRR §23.1" },
      { item: "Valid Mayor's / business permit", statute: "IRR §23.1" },
      { item: "Tax clearance", statute: "EO 398" },
      { item: "Statement of ongoing contracts + single largest completed similar contract (SLCC) ≥ 50% of the ABC", statute: "IRR §23.1" },
      { item: "Audited financial statements, stamped received by BIR", statute: "IRR §23.1" },
      { item: "Net Financial Contracting Capacity (NFCC) ≥ ABC", statute: "IRR §23.1" },
      { item: "Omnibus Sworn Statement, notarized", statute: "IRR §25.3" },
      { item: "Bid security: 2% cash/cashier's check, 5% surety bond, or bid-securing declaration", statute: "IRR §27.2" },
    ];
    if (infra) reqs.push({ item: "Valid PCAB contractor's license, category matching the ABC", statute: "RA 4566" });
    return reqs;
  }
  if (mn.includes("small value")) return [
    { item: "Price quotation on the RFQ form issued with this notice", statute: "IRR §53.9" },
    { item: "Valid Mayor's / business permit", statute: "GPPB Res. 09-2020" },
    { item: "PhilGEPS registration number (Red membership suffices)", statute: "IRR §54.6" },
    { item: "Omnibus Sworn Statement (for ABC above ₱500K)", statute: "GPPB Res. 09-2020" },
    { item: "Income / business tax returns (for ABC above ₱500K)", statute: "IRR §53.9" },
  ];
  if (mn.includes("shopping")) return [
    { item: "Price quotation", statute: "IRR §52" },
    { item: "PhilGEPS registration number", statute: "IRR §54.6" },
    { item: "Valid Mayor's / business permit", statute: "GPPB Res. 09-2020" },
  ];
  return [
    { item: "PhilGEPS registration", statute: "IRR §8.5.2" },
    { item: "Eligibility documents as listed in the bid documents", statute: "RA 9184" },
    { item: "Omnibus Sworn Statement, notarized", statute: "IRR §25.3" },
  ];
}

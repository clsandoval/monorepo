// M5 map data unit tests — assert-based, no framework, no server. Run: bun qa/map-unit.ts
// Everything runs against the LIVE dbs (awards.db is mid-backfill), so fixtures are picked
// dynamically: a supplier with ≥2 awards, one with exactly 1, and a corpus agency with open
// notices. Counts are never assumed — only shapes, invariants, and the evidence-only gate.
export {}; // top-level await needs module scope
let fails = 0;
const ok = (name: string, cond: boolean, detail = "") => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  " + detail}`);
  if (!cond) fails++;
};

const M = await import("../src/lib/map");

// EVIDENCE-ONLY gate (BUILD-SPEC M5, ship-blocking): none of the banned accusation terms
// may appear in ANY output field. Word-boundary match so data like "Sheller" or a person
// named "Roshelle" doesn't trip it; test slugs are chosen to avoid firms literally named
// e.g. "BAGO SHELL SERVICE STATION" (source data, not generated language).
const BANNED = /\b(shell|dummy|rigged|wired|corrupt|corrupted|corruption)\b/i;
const clean = (v: unknown) => !BANNED.test(JSON.stringify(v ?? ""));

// --- suppliers index (live) ---
const idx = await M.getSupplierIndex(1);
ok("supplier index non-empty", idx.length > 0, String(idx.length));
ok("index rows have shape", idx.slice(0, 20).every((r) =>
  typeof r.winner_norm === "string" && typeof r.winner === "string" &&
  typeof r.n === "number" && typeof r.value === "number"), JSON.stringify(idx[0]));
const idx2 = await M.getSupplierIndex(2);
ok("--min-awards 2 filters", idx2.length > 0 && idx2.every((r) => r.n >= 2), String(idx2.length));

// --- supplier with ≥2 awards: walk the index until one has a computable median and a
// banned-clean profile (a live, growing db means no fixed slug is guaranteed) ---
let multi: import("../src/lib/map").SupplierProfile | null = null;
let multiSlug = "";
for (const r of idx2.slice(0, 25)) {
  if (BANNED.test(r.winner_norm)) continue;
  const p = await M.getSupplier(r.winner_norm);
  if (p && p.totals.median_win_ratio !== null && clean(p)) { multi = p; multiSlug = r.winner_norm; break; }
}
ok("found a ≥2-award supplier with median + clean output", multi !== null, "none in top 25");
if (multi) {
  console.log(`  [multi slug: ${multiSlug}]`);
  ok("multi: winner display name", multi.winner.length > 0, multi.winner);
  ok("multi: totals coherent", multi.totals.contracts >= 2 && multi.totals.won_value > 0 &&
    multi.totals.entities >= 1, JSON.stringify(multi.totals));
  ok("multi: median win ratio ∈ (0, 1.5]",
    multi.totals.median_win_ratio! > 0 && multi.totals.median_win_ratio! <= 1.5,
    String(multi.totals.median_win_ratio));
  ok("multi: wins ≤50 and newest-first", multi.wins.length <= 50 &&
    multi.wins.every((w, i) => i === 0 || (w.award_date_iso ?? "") <= (multi!.wins[i - 1].award_date_iso ?? "~")),
    JSON.stringify(multi.wins.map((w) => w.award_date_iso)));
  ok("multi: win rows have shape", multi.wins.every((w) =>
    (w.buyer_kind === null || w.buyer_kind === "agency" || w.buyer_kind === "recorded_by") &&
    (w.contract_amount === null || typeof w.contract_amount === "number")), JSON.stringify(multi.wins[0]));
  ok("multi: categories + entities aggregate ≤ contracts",
    multi.categories.every((c) => c.n >= 1 && c.n <= multi!.totals.contracts) &&
    multi.entities.reduce((s, e) => s + e.n, 0) <= multi.totals.contracts,
    JSON.stringify({ cats: multi.categories.length, ents: multi.entities.length }));
}

// --- supplier with exactly 1 award must render fine (thin-data rule) ---
const single1 = idx.find((r) => r.n === 1 && !BANNED.test(JSON.stringify(r)));
ok("index has a 1-award supplier", !!single1);
if (single1) {
  const p = await M.getSupplier(single1.winner_norm);
  console.log(`  [single slug: ${single1.winner_norm}]`);
  ok("single: profile loads", p !== null && p.totals.contracts === 1 && p.wins.length === 1,
    JSON.stringify(p?.totals));
  ok("single: hero fields present", !!p && p.winner.length > 0 &&
    (p.province === null || typeof p.province === "string"), JSON.stringify({ w: p?.winner, pr: p?.province }));
}

// --- entity dossier (agency known to have open notices in corpus) ---
const AGENCY = "CITY OF QUEZON";
const e = await M.getEntity(AGENCY);
ok("entity loads", e !== null && e.agency === AGENCY, JSON.stringify(e?.agency));
if (e) {
  ok("entity: province from notice_location mode", typeof e.province === "string" && e.province!.length > 0, String(e.province));
  ok("entity: spend_12mo shape", typeof e.spend_12mo.value === "number" && typeof e.spend_12mo.contracts === "number",
    JSON.stringify(e.spend_12mo));
  ok("entity: winner shares sum ≤ 1.001", e.winners.reduce((s, w) => s + w.share, 0) <= 1.001,
    JSON.stringify(e.winners.map((w) => w.share)));
  ok("entity: winners ≤10 sorted by value", e.winners.length <= 10 &&
    e.winners.every((w, i) => i === 0 || w.value <= e.winners[i - 1].value));
  ok("entity: has signals", e.contestability.signals.length >= 1, String(e.contestability.signals.length));
  ok("entity: every evidence line contains its stat number",
    e.contestability.signals.every((s) => s.stat.length > 0 && s.evidence.includes(s.stat)),
    JSON.stringify(e.contestability.signals));
  // DESCRIPTOR VOCAB LOCKED — market words only, nothing else may ever appear here
  ok("entity: descriptor ∈ {concentrated, mixed, open}",
    (["concentrated", "mixed", "open"] as const).includes(e.contestability.descriptor),
    String(e.contestability.descriptor));
  ok("entity: open notices ≤20, Active shape", e.open_notices.length > 0 && e.open_notices.length <= 20 &&
    e.open_notices.every((n) => typeof n.id === "number" && (n.source === "legacy" || n.source === "mphilgeps")),
    JSON.stringify(e.open_notices[0]));
  const now = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 19); // Manila, as search.ts
  ok("entity: open notices not yet closed", e.open_notices.every((n) => n.closing_at === null || n.closing_at >= now),
    JSON.stringify(e.open_notices.map((n) => n.closing_at)));
  ok("entity: contact block clean (present or omitted, never partial garbage)",
    e.contact === null || !!(e.contact.raw || e.contact.email || e.contact.phone), JSON.stringify(e.contact));
}

// --- evidence-only gate across ALL outputs fetched above ---
ok("banned terms absent from every output field", clean(multi) && clean(e) && clean(idx2.slice(0, 25)),
  "accusation language leaked into output");

// --- unknown / unavailable ---
ok("unknown supplier → null", (await M.getSupplier("NO SUCH SUPPLIER ZZZ 404")) === null);
ok("unknown agency → null", (await M.getEntity("NO SUCH AGENCY ZZZ 404")) === null);
process.env.RFP_AWARDS_DB = "/nonexistent/awards.db";
process.env.RFP_CORPUS_DB = "/nonexistent/corpus.db";
ok("missing awards db → supplier null, index []",
  (await M.getSupplier(multiSlug || "X")) === null && (await M.getSupplierIndex(1)).length === 0);
ok("missing corpus db → entity null", (await M.getEntity(AGENCY)) === null);
delete process.env.RFP_AWARDS_DB;
delete process.env.RFP_CORPUS_DB;

console.log(`\n${fails === 0 ? "ALL PASS" : fails + " FAILED"}`);
process.exit(fails ? 1 : 0);

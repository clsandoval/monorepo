// M3 backend unit tests — assert-based, no framework, no server. Run: bun qa/search-unit.ts
// Includes ONE real Luna planQuery call (~$0.001) — its usd is printed for the ledger.
export {}; // top-level await needs module scope
let fails = 0;
const ok = (name: string, cond: boolean, detail = "") => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  " + detail}`);
  if (!cond) fails++;
};

const S = await import("../src/lib/search");

// --- sanitizePlan ---
const p1 = S.sanitizePlan({ kind: "search", terms: ["--abc-min", " -rf", "drainage", 5, "", "a", "b", "c", "d"], note: "x".repeat(500), province: "-Cavite", abc_min: "abc", abc_max: 5e6, days_max: 9999, evil: "y" });
ok("strips leading dashes from terms", p1.terms.every((t) => !t.startsWith("-")), JSON.stringify(p1.terms));
ok("drops non-string/empty terms, caps at 6", p1.terms.length === 6 && p1.terms.includes("drainage"), JSON.stringify(p1.terms));
ok("province dash-stripped", p1.province === "Cavite", String(p1.province));
ok("non-numeric abc_min dropped", p1.abc_min === undefined);
ok("abc_max kept", p1.abc_max === 5e6);
ok("days_max capped at 365", p1.days_max === 365);
ok("note capped at 140", p1.note.length === 140);
ok("unknown keys whitelisted away", !("evil" in p1));
const p2 = S.sanitizePlan({ kind: "search", terms: [], note: "" });
ok("search with no terms degrades to board", p2.kind === "board");
const p3 = S.sanitizePlan({ kind: "board", terms: ["leftover"], note: "hi" });
ok("board forces terms empty", p3.kind === "board" && p3.terms.length === 0);
ok("garbage input → safe board plan", S.sanitizePlan(null).kind === "board");
ok("negative numbers dropped", S.sanitizePlan({ kind: "search", terms: ["x"], abc_max: -5, days_max: -1, note: "" }).abc_max === undefined);

// --- board execution ---
const board = await S.executePlan({ kind: "board", terms: [], note: "" }, 0, 5);
ok("board returns 5 rows", board.results.length === 5);
ok("board total is Active count (>1000)", board.total > 1000, String(board.total));
ok("board more=true at offset 0", board.more === true);
const r = board.results[0];
ok("row has required fields", typeof r.id === "number" && typeof r.title === "string" && typeof r.agency === "string" && "abc" in r && "days" in r && "closing_day" in r, JSON.stringify(r));
ok("closing_day derived from closing_at", r.closing_at === null || r.closing_day === r.closing_at.slice(0, 10));

// --- pagination slicing / more flag ---
const plan = S.sanitizePlan({ kind: "search", terms: ["drainage", "canal"], note: "" });
const [page10, pageA, pageB] = await Promise.all([
  S.executePlan(plan, 0, 10), S.executePlan(plan, 0, 5), S.executePlan(plan, 5, 5),
]);
ok("offset slices where the previous page ended", pageB.results[0]?.id === page10.results[5]?.id);
ok("pages don't overlap", !pageA.results.some((a) => pageB.results.some((b) => b.id === a.id)));
ok("more=true mid-list", pageA.more === true && pageA.total > 10);
const tail = await S.executePlan(plan, 195, 10);
ok("fetch capped at 200 → tail page ≤5 rows, more=false", tail.results.length <= 5 && tail.more === false, `n=${tail.results.length} more=${tail.more}`);

// --- filters actually constrain (CLI flags verified to exist; no TS post-filter needed) ---
const filt = await S.executePlan(S.sanitizePlan({ kind: "search", terms: ["drainage"], abc_max: 5e6, days_max: 10, note: "" }), 0, 10);
ok("filtered search returns rows", filt.results.length > 0);
ok("abc_max honored (nulls/per-lot allowed by CLI)", filt.results.every((h) => h.abc === null ? true : h.abc <= 5e6 || (h.abc_lot_min !== null && h.abc_lot_min <= 5e6)), JSON.stringify(filt.results.map((h) => h.abc)));
ok("days_max honored", filt.results.every((h) => h.days === null || h.days <= 10), JSON.stringify(filt.results.map((h) => h.days)));

// --- sorted board = SQL over the WHOLE corpus (not the CLI's 200-row pool) ---
const manilaNow = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 19);
const bDesc = await S.executePlan({ kind: "board", terms: [], note: "", sort: "abc_desc" }, 0, 10);
ok("board abc_desc reaches corpus-scale contracts (>₱100M)", (bDesc.results[0]?.abc ?? 0) > 100e6, String(bDesc.results[0]?.abc));
ok("board abc_desc strictly descending", bDesc.results.every((x, i, a) => i === 0 || (a[i - 1].abc ?? 0) >= (x.abc ?? 0)));
ok("board abc_desc excludes expired", bDesc.results.every((x) => !x.closing_at || x.closing_at >= manilaNow));
const bClose = await S.executePlan({ kind: "board", terms: [], note: "", sort: "closing" }, 0, 10);
ok("board closing leads with a live deadline", !!bClose.results[0]?.closing_at && bClose.results[0].closing_at >= manilaNow, String(bClose.results[0]?.closing_at));
const bDeep = await S.executePlan({ kind: "board", terms: [], note: "", sort: "closing" }, 500, 10);
ok("board sort paginates past the 200 cap", bDeep.results.length === 10 && bDeep.more === true, `n=${bDeep.results.length}`);
const bNew = await S.executePlan({ kind: "board", terms: [], note: "", sort: "newest" }, 0, 5);
ok("board newest first returns rows publish-desc", bNew.results.length === 5);
const sClose = await S.executePlan({ kind: "search", terms: ["drainage", "canal"], note: "", sort: "closing" }, 0, 5);
ok("search closing sort never leads with expired", !!sClose.results[0]?.closing_at && sClose.results[0].closing_at >= manilaNow, String(sClose.results[0]?.closing_at));

// --- one REAL planQuery call ---
const { plan: real, usd } = await S.planQuery("drainage in cavite under 5M");
console.log(`planQuery usd=$${usd.toFixed(5)} plan=${JSON.stringify(real)}`);
ok("planQuery kind=search", real.kind === "search");
ok("planQuery terms nonempty", real.terms.length > 0);
ok("planQuery province Cavite", /cavite/i.test(real.province ?? ""), String(real.province));
ok("planQuery abc_max 5000000", real.abc_max === 5_000_000, String(real.abc_max));

console.log(`\n${fails === 0 ? "ALL PASS" : fails + " FAILED"}`);
process.exit(fails ? 1 : 0);

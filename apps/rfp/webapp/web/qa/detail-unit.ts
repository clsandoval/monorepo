// M4 detail-page unit tests — assert-based, no framework, no server. Run: bun qa/detail-unit.ts
// parseBoq is exercised on REAL corpus descriptions (fetched live by id, varied shapes).
export {}; // top-level await needs module scope
let fails = 0;
const ok = (name: string, cond: boolean, detail = "") => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  " + detail}`);
  if (!cond) fails++;
};

const N = await import("../src/lib/notice");
const { readSql } = await import("../src/lib/corpus");

const desc = async (id: number): Promise<string> =>
  ((await readSql(`SELECT description FROM corpus WHERE id = ${id}`, 1))[0]?.description as string) ?? "";

// --- parseBoq: real description shapes ---
// 13147059 (legacy): "I. Project Billboard pc. 1.00 6,439.23 II. …" — trailing qty + unit price
const a = N.parseBoq(await desc(13147059));
ok("13147059 roman BOQ parses", a !== null && a.length >= 8, `rows=${a?.length}`);
ok("13147059 has Project Billboard pc 1", !!a?.some((r) => /Project Billboard/i.test(r.item) && /^pc/i.test(r.unit) && r.qty === 1), JSON.stringify(a?.slice(0, 3)));
ok("13147059 unit price NOT taken as qty (Reinforcing Bars kgs 16,160.22)",
  !!a?.some((r) => /Reinforcing Bars/i.test(r.item) && r.qty === 16160.22), JSON.stringify(a?.filter((r) => /Bars/i.test(r.item))));

// 13143222 (legacy): "A.1 Mobilization / Demobilization LS 1.00 … B.1.1 Site Clearing sqm 50.00"
const b = N.parseBoq(await desc(13143222));
ok("13143222 coded BOQ parses", b !== null && b.length >= 10, `rows=${b?.length}`);
ok("13143222 Site Clearing sqm 50", !!b?.some((r) => /Site Clearing/i.test(r.item) && r.qty === 50), JSON.stringify(b?.slice(0, 6)));
ok("13143222 items trimmed to their row label (no header bleed)",
  !!b && b.every((r) => r.item.length <= 160), JSON.stringify(b?.map((r) => r.item.length)));

// 13137921 (legacy): "1. 246 Bags Portland Cement 2. 19.5 Cu.m River Washed Sand …" — leading qty
const c = N.parseBoq(await desc(13137921));
ok("13137921 qty-leading list parses", c !== null && c.length >= 8, `rows=${c?.length}`);
ok("13137921 246 Bags Portland Cement", !!c?.some((r) => /Portland Cement/i.test(r.item) && r.qty === 246 && /^bags$/i.test(r.unit)), JSON.stringify(c?.slice(0, 3)));
ok("13137921 next row's marker trimmed from item tail", !!c && !c.some((r) => /\d+\.$/.test(r.item)), JSON.stringify(c?.map((r) => r.item)));

// 45552 (mphilgeps): newline BOQ whose parse bleeds across section totals ("Sub Total 2027
// OVERALL TOTAL…") — one garbled row poisons trust, so the guards must REJECT it to prose.
const d = N.parseBoq(await desc(45552));
ok("45552 section-bleed table rejected → prose", d === null, JSON.stringify(d?.slice(0, 3)));

// 13180327 (legacy): pure invitation-to-bid prose — must fall back to null (prose rendering)
const e = N.parseBoq(await desc(13180327));
ok("13180327 prose description → null (fallback)", e === null, JSON.stringify(e?.slice(0, 3)));
ok("empty/null description → null", N.parseBoq(null) === null && N.parseBoq("") === null);

// --- winPct: the two verified live rounding holes must stay closed ---
ok("winPct 0.995 → 99.5% (was '100%')", N.winPct(0.995) === "99.5%", N.winPct(0.995));
ok("winPct 0.9995 → 99.9% (was '100.0%')", N.winPct(0.9995) === "99.9%", N.winPct(0.9995));
ok("winPct 0.99949 → 99.9%", N.winPct(0.99949) === "99.9%", N.winPct(0.99949));
ok("winPct 1 → 100%", N.winPct(1) === "100%");
ok("winPct 1.02 → 102%", N.winPct(1.02) === "102%");
ok("winPct 0.87 → 87%", N.winPct(0.87) === "87%");
ok("winPct never shows 100 for r<1", ![0.995, 0.999, 0.9999, 0.99999].some((r) => N.winPct(r).startsWith("100")));

// --- guardBoq: measured garbage shapes must reject (verify pass findings; wrong-but-confident
// quantities are worse than prose for a bidder) ---
for (const [id, why] of [
  [13175538, "price-qty-unit shift (₱85.00 5.00 pair)"],
  [28274, "item-numbers-as-qty (Item No. column)"],
  [47693, "ITB prose scraped into a fake BOQ"],
  [13141886, "garbled column splits (of 100s …)"],
  [13167597, "leaked price+index prefixes (3,772.00 2 Beef…)"],
  [13182752, "merged pharma rows (number-riddled long items)"],
  [13176093, "spec-sheet bullets (• Tank capacity)"],
  [13177912, "dash-merged package lists"],
] as const) {
  const g = N.parseBoq(await desc(id));
  ok(`${id} rejected: ${why}`, g === null, JSON.stringify(g?.slice(0, 2)));
}

// --- getNotice (real ids, both sources) ---
const legacy = await N.getNotice(13180327);
ok("getNotice legacy row", !!legacy && /Multi-Purpose Hall/i.test(legacy.title) && legacy.source === "legacy");
ok("legacy abc + contact + email", legacy?.abc === 150000 && legacy?.contact_email === "castanoslejos115@gmail.com", JSON.stringify({ abc: legacy?.abc, em: legacy?.contact_email }));
ok("legacy tags joined (scope, pcab, eligibility)", !!legacy?.scope && legacy?.needs_pcab === 1 && legacy!.eligibility.length > 0, JSON.stringify({ scope: legacy?.scope, el: legacy?.eligibility }));
ok("legacy province parsed", legacy?.province === "Cavite", String(legacy?.province));
const mp = await N.getNotice(45552);
ok("getNotice mphilgeps row", !!mp && mp.source === "mphilgeps" && mp.title.length > 5, JSON.stringify({ t: mp?.title }));
ok("unknown id → null", (await N.getNotice(999_999_999)) === null);
ok("garbage id → null (no SQL reaches the CLI)", (await N.getNotice(NaN)) === null && (await N.getNotice(-5)) === null);

// --- philgepsUrl per source ---
ok("legacy deep link", N.philgepsUrl("legacy", 13180327) === "https://notices.philgeps.gov.ph/GEPSNONPILOT/Tender/SplashBidNoticeAbstractUI.aspx?refID=13180327");
ok("mphilgeps deep link", N.philgepsUrl("mphilgeps", 45552) === "https://philgeps.gov.ph/Indexes/viewLiveTenderDetails/45552");

// --- getSimilarAwards: tolerant of T1's CLI not existing yet ---
const aw = await N.getSimilarAwards("Civil Works", "Cavite", 3_900_000);
ok("similar awards → array (missing script tolerated → [])", Array.isArray(aw) && aw.length <= 5, JSON.stringify(aw));
if (aw.length) ok("award rows match SimilarAward shape", aw.every((x) => typeof x.winner === "string" && typeof x.contract_amount === "number"), JSON.stringify(aw[0]));
ok("no classification/abc → [] without spawning", (await N.getSimilarAwards(null, "Cavite", 1)).length === 0 && (await N.getSimilarAwards("Goods", null, null)).length === 0);

// --- statutory requirements table ---
const pb = N.requirementsFor("public bidding", "Civil Works", 1);
ok("public bidding + civil works includes PCAB (RA 4566)", pb.some((r) => /PCAB/.test(r.item) && r.statute === "RA 4566"));
ok("public bidding includes bid security + OSS + SLCC", pb.some((r) => /Bid security/i.test(r.item)) && pb.some((r) => /Omnibus/i.test(r.item)) && pb.some((r) => /SLCC/.test(r.item)));
const goods = N.requirementsFor("public bidding", "Goods", 0);
ok("public bidding goods: no PCAB line", !goods.some((r) => /PCAB/.test(r.item)));
const svp = N.requirementsFor("negotiated procurement - small value procurement (sec. 53.9)", "Goods", null);
ok("SVP bucket: RFQ-led, no Platinum/bid-security", svp.some((r) => /RFQ/i.test(r.item)) && !svp.some((r) => /Platinum|Bid security/i.test(r.item)));
ok("unknown mode → generic fallback", N.requirementsFor(null, null, null).length >= 3);
ok("every requirement carries a statute tag", [...pb, ...goods, ...svp].every((r) => r.statute.length >= 5));

console.log(`\n${fails === 0 ? "ALL PASS" : fails + " FAILED"}`);
process.exit(fails ? 1 : 0);

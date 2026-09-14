// M4 T1 unit gate: quote-verification filter, statutory merge, awards_similar.py against the
// real awards.db, cache round-trip. Mechanical assertions, no Luna, no network.
// Run: bun qa/enrich-unit.ts        (add --live to also run two real enriches — spends Luna $)
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  buildFullText, getCached, mechanicalRedFlags, saveCache, statutoryFor, verifyModelOut,
  type Fetched, type RawModelOut,
} from "../src/lib/enrich";
import type { Enrich, SimilarAward } from "../src/lib/enrich-types";

const RFP_DIR = process.env.RFP_DIR ?? join(process.cwd(), "..", "..");
let fails = 0;
const check = (name: string, ok: boolean, detail = "") => {
  console.log(`${ok ? "OK  " : "FAIL"} ${name}${ok || !detail ? "" : ` — ${detail}`}`);
  if (!ok) fails++;
};

// ---- 1. quote-verification filter (fake Luna output vs fixture text) ----------------------
{
  const fixture: Fetched = {
    source: "mphilgeps",
    page: { title: "Supply of Pipes", abc: 1000000, delivery_period: "0 Day/s" },
    description: "Bidders must have completed a similar contract of at least PHP 500,000.",
    docs: [
      { name: "Terms of Reference.pdf", status: "extracted", pages: 3,
        text: "The supplier shall provide  ISO 9001   certification\nand a project engineer with 5 years experience." },
      { name: "Plans.pdf", status: "scanned-unreadable", pages: 10, text: "" },
    ],
  };
  const fullText = buildFullText(fixture);
  const raw: RawModelOut = {
    summary: "Pipe supply for a municipal waterworks.",
    deliverables: [
      { item: "Pipes", qty: "100", unit: "pcs", source: "Terms of Reference.pdf" },
      { item: "Valves", source: "notice text" },
      { item: "Invented thing", source: "Some Other Doc.pdf" }, // unknown source → drop
    ],
    qualifications: [
      // verbatim modulo whitespace → keep
      { requirement: "ISO 9001 certification", quote: "provide ISO 9001 certification", source: "Terms of Reference.pdf" },
      // from the description (notice text) → keep
      { requirement: "SLCC PHP 500k", quote: "completed a similar contract of at least PHP 500,000", source: "notice text" },
      // fabricated quote → drop
      { requirement: "24-month warranty", quote: "a warranty of twenty four months is required", source: "Terms of Reference.pdf" },
      // no quote → drop
      { requirement: "Quoteless", source: "notice text" },
    ] as never,
    key_dates: [{ label: "Pre-bid", value: "17-Aug-2026" }],
    red_flags: ["docs reference Annex C which is not attached"],
  };
  const v = verifyModelOut(raw, fullText, fixture.docs.map((d) => d.name));
  check("quote filter keeps whitespace-normalized verbatim quotes", v.qualifications.length === 2,
    JSON.stringify(v.qualifications.map((q) => q.requirement)));
  check("fabricated + quoteless qualifications dropped",
    !v.qualifications.some((q) => q.requirement.includes("warranty") || q.requirement === "Quoteless"));
  check("all kept qualifications are kind=document", v.qualifications.every((q) => q.kind === "document"));
  check("deliverable citing unknown source dropped", v.deliverables.length === 2,
    JSON.stringify(v.deliverables.map((d) => d.item)));
  check("deliverable citing notice text kept", v.deliverables.some((d) => d.source === "notice text"));

  const flags = mechanicalRedFlags("2026-08-10T10:00:00", fixture.page, fixture.docs);
  check("mechanical flags: closes ≤3 days", flags.some((f) => f.startsWith("closes in") || f.includes("past closing")), JSON.stringify(flags));
  check("mechanical flags: 0-day duration", flags.some((f) => f.includes("0-day")));
  check("mechanical flags: scanned-unreadable doc", flags.some((f) => f.includes("unreadable")));
}

// ---- 2. statutory merge by mode ------------------------------------------------------------
{
  const cw = statutoryFor("public bidding", "Civil Works");
  const goods = statutoryFor("competitive bidding (public bidding)", "Goods");
  const svp = statutoryFor("small value procurement", "Goods");
  check("PB+CW has PCAB + SLCC + NFCC (7 items)",
    cw.length === 7 && cw.some((q) => q.requirement.includes("PCAB")) && cw.some((q) => q.requirement.includes("SLCC")));
  check("PB+Goods drops PCAB/SLCC (5 items)",
    goods.length === 5 && !goods.some((q) => q.requirement.includes("PCAB") || q.requirement.includes("SLCC")));
  check("SVP is the RFQ set (4 items, Mayor's permit, no bid security)",
    svp.length === 4 && svp.some((q) => q.requirement.includes("Mayor")) && !svp.some((q) => q.requirement.includes("Bid security")));
  check("all statutory items are kind=statutory",
    [...cw, ...goods, ...svp].every((q) => q.kind === "statutory"));
}

// ---- 3. awards_similar.py against the real awards.db ---------------------------------------
{
  const run = (args: string[]): SimilarAward[] =>
    JSON.parse(execFileSync("python3", ["awards_similar.py", ...args], { cwd: RFP_DIR, encoding: "utf8" }));
  const cw = run(["--classification", "Civil Works", "--province", "Iloilo", "--abc", "150000"]);
  check("civil works query returns ≤5", cw.length > 0 && cw.length <= 5, String(cw.length));
  check("rows carry the SimilarAward shape",
    cw.every((r) => typeof r.winner === "string" && r.winner && typeof r.contract_amount === "number" && typeof r.award_date === "string"));
  check("province match ranks first", cw[0].winner_province === "Iloilo",
    JSON.stringify(cw.map((r) => r.winner_province)));
  const goods = run(["--classification", "goods", "--abc", "500000"]);
  check("classification match is case-insensitive", goods.length === 5, String(goods.length));
  const dates = goods.map((r) => Date.parse(r.award_date.replace(/-/g, " ")));
  check("within tier newest-first", dates.every((d, i) => i === 0 || d <= dates[i - 1]), JSON.stringify(goods.map((r) => r.award_date)));
  check("no cross-classification junk (empty for unknown)", run(["--classification", "Xyzzy"]).length === 0);
  check("missing db → []", JSON.parse(execFileSync("python3",
    ["awards_similar.py", "--classification", "Goods", "--db", "/nonexistent.db"], { cwd: RFP_DIR, encoding: "utf8" })).length === 0);
}

// ---- 4. cache round-trip -------------------------------------------------------------------
{
  const dir = mkdtempSync(join(tmpdir(), "enrich-qa-"));
  process.env.RFP_ENRICH_DIR = dir;
  const e: Enrich = {
    version: 1, at: new Date().toISOString(), source_kind: "notice-text", summary: "s",
    deliverables: [], qualifications: statutoryFor("public bidding", "Civil Works"),
    key_dates: [], red_flags: [], docs: [], usd: 0.01,
  };
  saveCache(424242, e);
  const back = getCached(424242);
  check("cache round-trip", JSON.stringify(back) === JSON.stringify(e));
  check("cache miss → null", getCached(424243) === null);
  rmSync(dir, { recursive: true, force: true });
  delete process.env.RFP_ENRICH_DIR;
}

// ---- 5. --live: two real enriches (mphilgeps w/ docs + legacy) — spends Luna $ -------------
if (process.argv.includes("--live")) {
  const { runEnrich } = await import("../src/lib/enrich");
  for (const id of [55582, 13162896]) {
    const t0 = Date.now();
    const e = await runEnrich(id);
    console.log(`\n== live enrich ${id} (${((Date.now() - t0) / 1000).toFixed(1)}s, $${e.usd.toFixed(4)})`);
    console.log(JSON.stringify(e, null, 1).slice(0, 3000));
    check(`live ${id}: summary + statutory present`, e.summary.length > 20 && e.qualifications.some((q) => q.kind === "statutory"));
    check(`live ${id}: source_kind honest`, id === 13162896 ? e.source_kind === "notice-text" : e.source_kind === "docs");
    check(`live ${id}: usd sane`, e.usd > 0 && e.usd < 0.1, String(e.usd));
    check(`live ${id}: cache hit`, getCached(id) !== null);
  }
}

console.log(fails ? `\nENRICH-UNIT FAIL (${fails})` : "\nENRICH-UNIT OK");
process.exit(fails ? 1 : 0);

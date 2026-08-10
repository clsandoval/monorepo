import { test, expect, type Page } from "@playwright/test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

// M5 E2E — The Map: /supplier/[slug] + /entity/[slug]. The awards db is being backfilled
// LIVE (~36 rows/min), so every slug is picked AT RUNTIME from map_query.py / the corpus —
// never hardcoded. Assertions that need ref_id-joined awards (win → notice links, share
// bars) are conditional: the join is thin by design until listing harvests catch up.
const pexec = promisify(execFile);
const RFP_DIR = "/home/clsandoval/cs/monorepo/apps/rfp";

async function py(args: string[]): Promise<string> {
  const { stdout } = await pexec("python3", args, { cwd: RFP_DIR, timeout: 30_000, maxBuffer: 16 << 20 });
  return stdout.trim();
}
const mapQuery = async <T>(args: string[]): Promise<T> => JSON.parse((await py(["map_query.py", ...args])) || "null") as T;
const sql = async (q: string, limit = 40): Promise<Record<string, unknown>[]> =>
  JSON.parse((await py(["rfp", "sql", q, "--json", "--limit", String(limit)])) || "[]");

// React-rendered HTML escapes text — match names against their escaped form.
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#x27;");

// EVIDENCE-ONLY gate (ship-blocking): no accusation vocabulary anywhere in a rendered page.
const BANNED = /\b(shell compan\w*|dummy|rigged|wired|corrupt\w*)\b/i;

// Palette gate — same checker as visual.spec: neutrals + blue family only.
async function assertGrayscale(page: Page) {
  const offenders = await page.evaluate(() => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 1;
    const ctx = cv.getContext("2d", { willReadFrequently: true })!;
    const seen = new Set<string>(); const bad: string[] = [];
    const toRgb = (c: string): [number, number, number, number] => {
      ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = "#000"; ctx.fillStyle = c;
      ctx.fillRect(0, 0, 1, 1); const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3]];
    };
    for (const el of Array.from(document.querySelectorAll("*")).slice(0, 4000)) {
      const s = getComputedStyle(el as Element);
      for (const prop of ["color", "backgroundColor", "borderColor"] as const) {
        const c = s[prop]; if (!c || seen.has(c)) continue; seen.add(c);
        const [r, g, b, a] = toRgb(c);
        if (a === 0) continue;
        const saturated = Math.max(r, g, b) - Math.min(r, g, b) > 10;
        const blueFamily = b > g && b - r > 10;
        if (saturated && !blueFamily) bad.push(`${prop}=${c} -> rgb(${r},${g},${b})`);
      }
    }
    return bad.slice(0, 10);
  });
  expect(offenders, `non-grayscale colors: ${offenders.join(", ")}`).toHaveLength(0);
}

async function noHorizontalOverflow(page: Page, path: string) {
  for (const width of [390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `horizontal overflow ${overflow}px at ${width} on ${path}`).toBeLessThanOrEqual(2);
  }
}

type IndexRow = { winner_norm: string; winner: string; n: number; value: number };
type Supplier = {
  winner: string; province: string | null;
  totals: { won_value: number; contracts: number; entities: number; median_win_ratio: number | null };
  wins: { ref_id: string | null; buyer_kind: string | null }[];
};
type Entity = {
  agency: string;
  winners: { n: number; share: number }[];
  contestability: { signals: { evidence: string }[]; descriptor: string };
  open_notices: { id: number }[];
};

// Runtime-picked fixtures (see beforeAll).
let supplierSlug: string; let supplier: Supplier;
let thinSlug: string | null = null;           // a 1-award supplier — must render fine
let entityAgency: string; let entity: Entity;
let awardsNoticeId: number | null = null;     // a notice whose detail shows similar awards

test.beforeAll(async () => {
  const index = await mapQuery<IndexRow[]>(["suppliers", "--min-awards", "1"]);
  expect(index.length, "awards db has suppliers").toBeGreaterThan(0);
  const rich = index.find((r) => r.n >= 2) ?? index[0];
  supplierSlug = rich.winner_norm;
  supplier = await mapQuery<Supplier>(["supplier", "--norm", supplierSlug]);
  // the index is top-by-value (capped) — a 1-award supplier may not rank; ask the db
  thinSlug = (await py(["-c",
    "import sqlite3, json; db = sqlite3.connect('file:awards.db?mode=ro', uri=True);" +
    "r = db.execute(\"select winner_norm from awards where winner_norm is not null\"" +
    "\" group by winner_norm having count(*)=1 limit 1\").fetchone();" +
    "print(json.dumps(r[0] if r else None))"])
    .then((s) => JSON.parse(s) as string | null)) ?? null;

  // entity: the Active-notice-heavy agency whose dossier has signals + open notices;
  // prefer one with winners (ref_id-joined awards) when the live data has any.
  const agencies = await sql(
    "SELECT agency, COUNT(*) AS n FROM corpus WHERE status='Active' AND agency != ''" +
    " GROUP BY agency ORDER BY n DESC LIMIT 6");
  let fallback: { agency: string; dossier: Entity } | null = null;
  for (const a of agencies) {
    const d = await mapQuery<Entity>(["entity", "--agency", String(a.agency)]);
    if (!d?.agency || d.contestability.signals.length === 0 || d.open_notices.length === 0) continue;
    fallback ??= { agency: String(a.agency), dossier: d };
    if (d.winners.length > 0) { fallback = { agency: String(a.agency), dossier: d }; break; }
  }
  expect(fallback, "no agency yields a dossier with signals + open notices").not.toBeNull();
  entityAgency = fallback!.agency;
  entity = fallback!.dossier;

  // a notice whose classification/abc matches recorded awards → similar-awards section renders
  const candidates = await sql(
    "SELECT id, classification, abc FROM corpus WHERE status='Active'" +
    " AND abc IS NOT NULL AND classification IS NOT NULL ORDER BY publish_day DESC LIMIT 20");
  for (const c of candidates) {
    const out = JSON.parse((await py(["awards_similar.py", "--classification", String(c.classification),
      "--abc", String(c.abc)])) || "[]");
    if (Array.isArray(out) && out.length > 0) { awardsNoticeId = Number(c.id); break; }
  }
});

test("supplier page is SSR: raw HTML carries the name, peso figures and a real <title>", async ({ request }) => {
  const res = await request.get(`/supplier/${encodeURIComponent(supplierSlug)}`);
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toContain(esc(supplier.winner));
  expect(html).toContain("₱");
  expect(html).toContain(`${esc(supplier.winner)} — supplier profile — bidkita`); // real <title>

  expect(BANNED.test(html), `banned term in supplier HTML: ${html.match(BANNED)?.[0]}`).toBe(false);
});

test("supplier stats are sane; wins rows render dense with date + amount", async ({ page }) => {
  await page.goto(`/supplier/${encodeURIComponent(supplierSlug)}`);
  await expect(page.getByTestId("supplier-profile")).toBeVisible();
  await expect(page.getByTestId("stat-total-won")).toHaveText(/₱[\d,.]+[KMB]?/);
  const contracts = Number((await page.getByTestId("stat-contracts").locator("p").first().textContent()) ?? "0");
  // live backfill: the db may have grown between the pick and the render — never assert equality
  expect(contracts).toBeGreaterThanOrEqual(supplier.totals.contracts);
  await expect(page.getByTestId("stat-entities").locator("p").first()).toHaveText(/^\d+$/);
  await expect(page.getByTestId("stat-median-ratio").locator("p").first()).toHaveText(/^(\d+(\.\d)?%|—)$/);
  const rows = page.getByTestId("supplier-wins").locator("li");
  expect(await rows.count()).toBeGreaterThanOrEqual(1);
  // the meta line (date · won-at-%) is the text-xs mono <p>; the amount is text-sm mono
  await expect(rows.first().locator("p.font-mono.text-xs")).toHaveText(/([A-Z][a-z]{2} \d{1,2}, \d{4}|date —)/);
  // amounts render with the full-precision peso format
  await expect(page.getByTestId("supplier-wins").getByText(/₱[\d,]+/).first()).toBeVisible();
});

test("supplier win → notice links only when the award joins a corpus notice", async ({ page }) => {
  await page.goto(`/supplier/${encodeURIComponent(supplierSlug)}`);
  const links = page.getByTestId("win-notice-link");
  const joined = supplier.wins.filter((w) => w.buyer_kind === "agency" && w.ref_id != null).length;
  if (joined === 0) {
    expect(await links.count(), "no joined wins → no /notice/ links").toBe(0);
  } else {
    expect(await links.count()).toBeGreaterThanOrEqual(1);
    for (const href of await links.evaluateAll((as) => as.map((a) => a.getAttribute("href"))))
      expect(href).toMatch(/^\/notice\/\d+$/);
  }
});

test("a 1-award supplier renders a clean page (thin data, no empty shell)", async ({ page }) => {
  test.skip(thinSlug == null, "no 1-award supplier in the live db right now");
  await page.goto(`/supplier/${encodeURIComponent(thinSlug!)}`);
  await expect(page.getByTestId("supplier-profile")).toBeVisible();
  await expect(page.getByTestId("stat-contracts").locator("p").first()).toHaveText("1");
  expect(await page.getByTestId("supplier-wins").locator("li").count()).toBe(1);
  expect(BANNED.test(await page.content())).toBe(false);
});

test("unknown supplier and entity slugs 404", async ({ request }) => {
  expect((await request.get("/supplier/NO%20SUCH%20SUPPLIER%20XYZ")).status()).toBe(404);
  expect((await request.get("/entity/NO%20SUCH%20AGENCY%20XYZ")).status()).toBe(404);
});

test("entity page is SSR with a real title; banned terms absent", async ({ request }) => {
  const res = await request.get(`/entity/${encodeURIComponent(entityAgency)}`);
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toContain(esc(entityAgency));
  expect(html).toContain("procuring entity — bidkita");
  expect(BANNED.test(html), `banned term in entity HTML: ${html.match(BANNED)?.[0]}`).toBe(false);
});

test("entity dossier: descriptor is market vocabulary; every evidence line carries digits", async ({ page }) => {
  await page.goto(`/entity/${encodeURIComponent(entityAgency)}`);
  await expect(page.getByTestId("entity-dossier")).toBeVisible();
  await expect(page.getByTestId("market-descriptor")).toHaveText(/^(concentrated|mixed|open)$/);
  const evidence = page.getByTestId("signal-evidence");
  const n = await evidence.count();
  expect(n).toBeGreaterThanOrEqual(1);
  for (let i = 0; i < n; i++) expect(await evidence.nth(i).textContent()).toMatch(/\d/);
});

test("entity share bars sum sanely and read '% · n of total'", async ({ page }) => {
  test.skip(entity.winners.length === 0,
    "no ref_id-joined awards for this entity yet (backfill is thin by design)");
  await page.goto(`/entity/${encodeURIComponent(entityAgency)}`);
  const labels = await page.getByTestId("share-label").allTextContents();
  expect(labels.length).toBeGreaterThanOrEqual(1);
  let pctSum = 0;
  for (const l of labels) {
    const m = l.match(/^(\d+)% · ([\d,]+) of ([\d,]+)$/);   // counts are locale-formatted
    expect(m, `share label malformed: ${l}`).not.toBeNull();
    pctSum += Number(m![1]);
    const strip = (s: string) => Number(s.replace(/,/g, ""));
    expect(strip(m![2])).toBeLessThanOrEqual(strip(m![3]));
  }
  expect(pctSum, `share percentages sum to ${pctSum}`).toBeLessThanOrEqual(105);
  for (const w of await page.getByTestId("share-bar").evaluateAll(
    (els) => els.map((e) => parseFloat((e as HTMLElement).style.width))))
    expect(w).toBeLessThanOrEqual(100);
});

test("entity open-notice rows link to /notice/<id>", async ({ page }) => {
  await page.goto(`/entity/${encodeURIComponent(entityAgency)}`);
  const rows = page.getByTestId("entity-open-notices").getByTestId("result-row");
  expect(await rows.count()).toBeGreaterThanOrEqual(1);
  for (const href of await rows.evaluateAll((as) => as.map((a) => a.getAttribute("href"))))
    expect(href).toMatch(/^\/notice\/\d+$/);
});

test("notice detail → winner link → supplier page; agency link → entity page", async ({ page }) => {
  test.skip(awardsNoticeId == null, "no active notice currently matches recorded awards");
  await page.goto(`/notice/${awardsNoticeId}`);
  await expect(page.getByTestId("similar-awards")).toBeVisible();
  const winner = (await page.getByTestId("winner-link").first().textContent())?.trim();
  await page.getByTestId("winner-link").first().click();
  await expect(page).toHaveURL(/\/supplier\/.+/);
  await expect(page.getByTestId("supplier-profile")).toBeVisible();
  // the display-name normalization (TS mirror of awards.py norm_winner) found the same firm
  await expect(page.getByTestId("stat-contracts").locator("p").first()).toHaveText(/^\d+$/);
  expect(await page.getByTestId("supplier-wins").locator("li").count()).toBeGreaterThanOrEqual(1);
  expect(winner, "winner display name missing").toBeTruthy();

  await page.goBack();
  await page.getByTestId("agency-link").click();
  await expect(page).toHaveURL(/\/entity\/.+/);
  await expect(page.getByTestId("entity-dossier")).toBeVisible();
});

test("palette gate + no horizontal overflow on both pages", async ({ page }) => {
  await page.goto(`/supplier/${encodeURIComponent(supplierSlug)}`);
  await expect(page.getByTestId("supplier-profile")).toBeVisible();
  await assertGrayscale(page);
  await noHorizontalOverflow(page, "/supplier");
  await page.goto(`/entity/${encodeURIComponent(entityAgency)}`);
  await expect(page.getByTestId("entity-dossier")).toBeVisible();
  await assertGrayscale(page);
  await noHorizontalOverflow(page, "/entity");
});

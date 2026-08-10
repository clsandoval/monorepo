import { test, expect, type Page } from "@playwright/test";

// S3 E2E — the results-first surface. Serial on ONE shared page so the real-Luna search
// happens once and its state (plan chip, rows, ?q=) is reused by the later tests.
const Q = "drainage works in Cavite under 5M";

test.describe.configure({ mode: "serial" });

let page: Page;
test.beforeAll(async ({ browser }) => { page = await browser.newPage(); });
test.afterAll(async () => { await page.close(); });

// The results pane scrolls in an inner div (#pane-results = .min-h-0.flex-1.overflow-y-auto),
// NOT the document — scroll THAT.
async function scrollResultsPane() {
  await page.evaluate(() => {
    const el = document.getElementById("pane-results");
    if (el) el.scrollTop = el.scrollHeight;
  });
}

function rowHrefs() {
  return page.$$eval('[data-testid="result-row"]', (els) => els.map((a) => a.getAttribute("href") ?? ""));
}

test("land → board rows render + count line", async () => {
  await page.goto("/");
  await expect(page.getByTestId("result-row").first()).toBeVisible({ timeout: 15_000 });
  expect(await page.getByTestId("result-row").count()).toBeGreaterThanOrEqual(10);
  await expect(page.getByText(/[\d,]+ open notices · Source: PhilGEPS/)).toBeVisible();
  await expect(page.getByTestId("plan-note")).toHaveCount(0); // no chip on the default board
});

test("board infinite scroll appends more rows, no duplicate ids", async () => {
  const before = await page.getByTestId("result-row").count();
  await scrollResultsPane();
  await expect
    .poll(() => page.getByTestId("result-row").count(), { timeout: 15_000 })
    .toBeGreaterThan(before);
  const hrefs = await rowHrefs();
  expect(new Set(hrefs).size, "duplicate row hrefs after append").toBe(hrefs.length);
});

test("search via the box → rows update + plan-note chip (real Luna)", async () => {
  const boardFirst = (await rowHrefs())[0];
  await page.getByTestId("search-input").fill(Q);
  await page.getByTestId("search-submit").click();
  await expect(page.getByTestId("plan-note")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("result-row").first()).toBeVisible();
  await expect(page.getByText(/[\d,]+ results · Source: PhilGEPS/)).toBeVisible();
  expect((await rowHrefs())[0], "list did not update from the board").not.toBe(boardFirst);
  expect(page.url()).toContain("?q=");
});

test("search results infinite scroll → more rows append, no duplicate ids", async () => {
  const before = await page.getByTestId("result-row").count();
  await scrollResultsPane();
  await expect
    .poll(() => page.getByTestId("result-row").count(), { timeout: 15_000 })
    .toBeGreaterThan(before);
  const hrefs = await rowHrefs();
  expect(new Set(hrefs).size, "duplicate row hrefs after append").toBe(hrefs.length);
});

// M4: rows link in-app to /notice/<id>; the PhilGEPS deep link lives on the row's ↗ affordance.
test("row links to /notice/<id>; row ↗ is a PhilGEPS deep link shaped by source", async () => {
  const rows = await page.$$eval('[data-testid="result-row"]', (els) =>
    els.slice(0, 25).map((a) => ({
      href: a.getAttribute("href") ?? "",
      id: a.querySelector("span")?.textContent?.trim() ?? "",
      ext: a.parentElement?.querySelector('[data-testid="row-external"]')?.getAttribute("href") ?? "",
    })));
  expect(rows.length).toBeGreaterThan(0);
  for (const r of rows) {
    expect(r.href, `row href not internal: ${r.href}`).toBe(`/notice/${r.id}`);
    const m =
      r.ext.match(/^https:\/\/notices\.philgeps\.gov\.ph\/GEPSNONPILOT\/Tender\/SplashBidNoticeAbstractUI\.aspx\?refID=(\d+)$/) ??
      r.ext.match(/^https:\/\/philgeps\.gov\.ph\/Indexes\/viewLiveTenderDetails\/(\d+)$/);
    expect(m, `↗ not a PhilGEPS deep link: ${r.ext}`).not.toBeNull();
    expect(m![1], `↗ id ≠ row id (${r.ext})`).toBe(r.id);
  }
});

test("?q= reload restores the search", async () => {
  expect(decodeURIComponent(page.url())).toContain(`?q=${Q}`);
  await page.reload();
  await expect(page.getByTestId("search-input")).toHaveValue(Q);
  await expect(page.getByTestId("plan-note")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("result-row").first()).toBeVisible();
});

test("tab-ai → query auto-runs in a NEW session (real Luna); tab back → rows preserved", async () => {
  const before = await rowHrefs();
  await page.getByTestId("tab-ai").click();
  // Google-style handoff: fresh session, the query is sent automatically as a user turn
  await expect(page.locator("main").getByText(Q).first()).toBeVisible({ timeout: 10_000 });
  await expect(page.getByTestId("chat-input")).toHaveValue(""); // sent, not just prefilled
  await expect(page.getByTestId("result-row").first()).toBeHidden(); // results pane hidden, not unmounted
  // let the auto-run finish so later tests aren't mid-stream
  await expect(page.getByTestId("assistant-text").last()).toHaveText(/.{30,}/, { timeout: 100_000 });
  await page.getByTestId("tab-results").click();
  await expect(page.getByTestId("plan-note")).toBeVisible();
  expect(await rowHrefs(), "rows changed after tab round-trip").toEqual(before);
});

test("sort by budget high→low reorders; budget filter constrains every row", async () => {
  const abcOf = async () => page.$$eval('[data-testid="result-row"]', (rows) =>
    rows.map((r) => {
      const t = r.querySelector(".font-bold")?.textContent ?? "";
      const m = t.match(/₱([\d.]+)([KMB])/);
      return m ? Number(m[1]) * ({ K: 1e3, M: 1e6, B: 1e9 })[m[2] as "K" | "M" | "B"] : null;
    }).filter((x): x is number => x != null));
  const sortSettled = page.waitForResponse((r) => r.url().includes("/api/search") && r.request().method() === "POST");
  await page.getByTestId("sort").selectOption("abc_desc");
  await sortSettled;
  // DOM paints after the response lands — poll until the strict ordering holds
  await expect.poll(async () => {
    const a = await abcOf();
    return a.length > 0 && a.every((v, i) => i === 0 || a[i - 1] >= v);
  }, { timeout: 15_000 }).toBe(true);
  await page.getByTestId("filters-toggle").click();
  // Budget semantics are per-LOT (a bidder bids a lot): a multi-lot notice with a big headline ABC
  // legitimately passes the cap when a lot fits — and abc_desc puts exactly those first. So assert
  // on the API rows (headline OR lot_min within cap), not the rendered headline figures.
  const respP = page.waitForResponse((r) => r.url().includes("/api/search") && r.request().method() === "POST");
  await page.getByTestId("filter-budget").selectOption("1000000");
  const rows = (await (await respP).json()).results as { abc: number | null; abc_lot_min: number | null }[];
  expect(rows.length).toBeGreaterThan(0);
  for (const r of rows) {
    const eff = Math.min(r.abc ?? Infinity, r.abc_lot_min ?? Infinity);
    expect(eff, `row over budget: abc=${r.abc} lot_min=${r.abc_lot_min}`).toBeLessThanOrEqual(1e6);
  }
});

test("chip × → back to the board", async () => {
  await page.getByLabel("Clear search, back to all open notices").click();
  await expect(page.getByTestId("plan-note")).toHaveCount(0, { timeout: 15_000 });
  await expect(page.getByText(/[\d,]+ open notices · Source: PhilGEPS/)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("search-input")).toHaveValue("");
  await expect(page.getByTestId("result-row").first()).toBeVisible();
});

test("BOARD sort: budget high→low sorts the WHOLE corpus; closing-soon never leads closed", async () => {
  // regression: board sort used to reorder only the 200-row soonest-closing pool, so "budget
  // high→low" topped out at a few ₱M instead of the corpus-wide ₱B contracts.
  await page.getByTestId("sort").selectOption("abc_desc");
  await expect.poll(async () => {
    const t = await page.locator('[data-testid="result-row"] .font-bold').first().textContent();
    const m = t?.match(/₱([\d.]+)([KMB])/);
    return m ? Number(m[1]) * ({ K: 1e3, M: 1e6, B: 1e9 })[m[2] as "K" | "M" | "B"] : 0;
  }, { timeout: 15_000 }).toBeGreaterThan(100e6);
  await page.getByTestId("sort").selectOption("closing");
  await expect.poll(async () =>
    (await page.locator('[data-testid="result-row"]').evaluateAll((rows) =>
      rows.slice(0, 10).map((r) => r.textContent ?? ""))).filter((t) => t.includes("closed")).length,
    { timeout: 15_000 }).toBe(0);
  await page.getByTestId("sort").selectOption("newest");
  await expect(page.getByTestId("result-row").first()).toBeVisible({ timeout: 15_000 });
  // restore board default for later tests — and WAIT for the refetch to land, else the next
  // test scrolls mid-replace and its append never happens
  const settled = page.waitForResponse((r) => r.url().includes("/api/search") && r.request().method() === "POST");
  await page.getByTestId("sort").selectOption("closing");
  await settled;
  await expect(page.getByTestId("result-row").first()).toBeVisible({ timeout: 15_000 });
});

test("bidding-round filter: negotiated shows only NEGOTIATED-chipped rows", async () => {
  // the filters row may already be open from the previous test — toggle only if closed
  if (!(await page.getByTestId("filter-round").isVisible())) await page.getByTestId("filters-toggle").click();
  const settled = page.waitForResponse((r) => r.url().includes("/api/search") && r.request().method() === "POST");
  await page.getByTestId("filter-round").selectOption("negotiated");
  await settled;
  await expect(page.getByTestId("result-row").first()).toBeVisible({ timeout: 15_000 });
  const rows = await page.getByTestId("result-row").count();
  const chips = await page.getByTestId("round-chip").filter({ hasText: "NEGOTIATED" }).count();
  expect(chips, `${chips}/${rows} rows carry the NEGOTIATED chip`).toBe(rows);
  // clear back to any-round for the tests that follow
  const settled2 = page.waitForResponse((r) => r.url().includes("/api/search") && r.request().method() === "POST");
  await page.getByTestId("filter-round").selectOption("");
  await settled2;
  await page.getByTestId("filters-toggle").click();
});

test("detail page ← Results restores appended pages + scroll WITHOUT bfcache", async () => {
  // build up 3 pages of board state, navigate deep, come back — sessionStorage restore must
  // bring back all rows and the scroll position (CDP disables bfcache, so this test is real).
  await scrollResultsPane();
  await expect.poll(() => page.getByTestId("result-row").count(), { timeout: 15_000 }).toBeGreaterThanOrEqual(40);
  await scrollResultsPane();
  await expect.poll(() => page.getByTestId("result-row").count(), { timeout: 15_000 }).toBeGreaterThanOrEqual(60);
  const hrefs = await rowHrefs();
  const deepRow = page.getByTestId("result-row").nth(45);
  await deepRow.scrollIntoViewIfNeeded();
  await deepRow.click();
  await expect(page).toHaveURL(/\/notice\/\d+/);
  await page.getByText("← Results").click();
  await expect(page).not.toHaveURL(/\/notice\//);
  await expect.poll(() => page.getByTestId("result-row").count(), { timeout: 15_000 }).toBe(hrefs.length);
  expect(await rowHrefs(), "rows differ after back").toEqual(hrefs);
  const scrollTop = await page.evaluate(() => document.getElementById("pane-results")?.scrollTop ?? 0);
  expect(scrollTop, "scroll position not restored").toBeGreaterThan(0);
});

test("zero horizontal overflow at 390 / 768 / 1280", async () => {
  for (const width of [390, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await expect(page.getByTestId("result-row").first()).toBeVisible();
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `horizontal overflow ${overflow}px at ${width}`).toBeLessThanOrEqual(2);
  }
});

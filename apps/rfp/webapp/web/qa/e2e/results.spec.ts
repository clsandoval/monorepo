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

test("row href is a PhilGEPS deep link shaped by source, id matching the row", async () => {
  const rows = await page.$$eval('[data-testid="result-row"]', (els) =>
    els.slice(0, 25).map((a) => ({
      href: a.getAttribute("href") ?? "",
      id: a.querySelector("span")?.textContent?.trim() ?? "",
    })));
  expect(rows.length).toBeGreaterThan(0);
  for (const r of rows) {
    const m =
      r.href.match(/^https:\/\/notices\.philgeps\.gov\.ph\/GEPSNONPILOT\/Tender\/SplashBidNoticeAbstractUI\.aspx\?refID=(\d+)$/) ??
      r.href.match(/^https:\/\/philgeps\.gov\.ph\/Indexes\/viewLiveTenderDetails\/(\d+)$/);
    expect(m, `href not a PhilGEPS deep link: ${r.href}`).not.toBeNull();
    expect(m![1], `href id ≠ row id (${r.href})`).toBe(r.id);
  }
});

test("?q= reload restores the search", async () => {
  expect(decodeURIComponent(page.url())).toContain(`?q=${Q}`);
  await page.reload();
  await expect(page.getByTestId("search-input")).toHaveValue(Q);
  await expect(page.getByTestId("plan-note")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("result-row").first()).toBeVisible();
});

test("tab-ai → chat input prefilled with the query; tab back → rows preserved", async () => {
  const before = await rowHrefs();
  await page.getByTestId("tab-ai").click();
  await expect(page.getByTestId("chat-input")).toHaveValue(Q); // query carries over
  await expect(page.getByTestId("result-row").first()).toBeHidden(); // results pane hidden, not unmounted
  await page.getByTestId("tab-results").click();
  await expect(page.getByTestId("plan-note")).toBeVisible();
  expect(await rowHrefs(), "rows changed after tab round-trip").toEqual(before);
});

test("chip × → back to the board", async () => {
  await page.getByLabel("Clear search, back to all open notices").click();
  await expect(page.getByTestId("plan-note")).toHaveCount(0, { timeout: 15_000 });
  await expect(page.getByText(/[\d,]+ open notices · Source: PhilGEPS/)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByTestId("search-input")).toHaveValue("");
  await expect(page.getByTestId("result-row").first()).toBeVisible();
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

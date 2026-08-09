import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

// G3/S4 visual QA — capture each UI state + assert the style-11 palette: neutrals plus EXACTLY
// one hue, signal blue #1550D8 (any shade/alpha of it). Any red/green/yellow/etc is a failure.
// Surfaces: results board · interpreted search · AI Mode chat. Screenshots land in qa/shots/
// and are sent to Telegram by qa/send-shots.sh after the run.
const SHOTS = `${process.cwd()}/qa/shots/`;
test.beforeAll(() => mkdirSync(SHOTS, { recursive: true }));

// Saturated colors (channel spread > 10) must be blue-family: b strictly the max channel.
async function assertGrayscale(page: import("@playwright/test").Page) {
  const offenders = await page.evaluate(() => {
    // Resolve any CSS color (lab/oklch/rgb/named) to sRGB via a canvas, then check channel spread.
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
        if (a === 0) continue; // fully transparent — irrelevant
        const saturated = Math.max(r, g, b) - Math.min(r, g, b) > 10;
        // blue-family: blue dominates and red trails it clearly (accepts #1550D8 and its tints)
        const blueFamily = b > g && b - r > 10;
        if (saturated && !blueFamily) bad.push(`${prop}=${c} -> rgb(${r},${g},${b})`);
      }
    }
    return bad.slice(0, 10);
  });
  expect(offenders, `non-grayscale colors: ${offenders.join(", ")}`).toHaveLength(0);
}

test("capture states + grayscale on board, search and AI Mode", async ({ page }) => {
  // 1. landing = the board
  await page.goto("/");
  await expect(page.getByTestId("result-row").first()).toBeVisible({ timeout: 15_000 });
  await page.screenshot({ path: `${SHOTS}01-board.png`, fullPage: true });
  await assertGrayscale(page);

  // 2. interpreted search (one real Luna plan call) — rows + plan chip
  await page.getByTestId("search-input").fill("drainage works in Cavite under 5M");
  await page.getByTestId("search-submit").click();
  await expect(page.getByTestId("plan-note")).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId("result-row").first()).toBeVisible();
  await page.screenshot({ path: `${SHOTS}02-search-results.png`, fullPage: true });
  await assertGrayscale(page);

  // 3. AI Mode empty state (query carried over into the input)
  await page.getByTestId("tab-ai").click();
  await expect(page.getByTestId("empty-state")).toBeVisible();
  await page.screenshot({ path: `${SHOTS}03-ai-empty.png`, fullPage: true });
  await assertGrayscale(page);

  // 4. chat reply with cards (real Luna turn)
  await page.getByTestId("chat-input").fill("small drainage jobs in Cavite under 5M, PCAB C");
  await page.getByTestId("send").click();
  await expect(page.getByTestId("assistant-text").first()).toHaveText(/[A-Za-z].{40,}/, { timeout: 100_000 });
  await expect(page.getByTestId("cards").first()).toBeVisible({ timeout: 10_000 });
  await page.screenshot({ path: `${SHOTS}04-ai-cards.png`, fullPage: true });
  await assertGrayscale(page);

  // 5. session panel populated
  await page.getByTestId("new-session").click();
  await page.getByTestId("new-session").click();
  await page.screenshot({ path: `${SHOTS}05-session-panel.png`, fullPage: true });
  await assertGrayscale(page);
});

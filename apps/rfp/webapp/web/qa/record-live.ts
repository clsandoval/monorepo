// Record the results-first journey against LIVE prod, then print the .webm path.
// land → board → search → infinite scroll → AI Mode (query carried, 2 chat turns) → tab back.
// Usage: bun qa/record-live.ts   (URL from RFP_LIVE_URL or default)
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const U = process.env.RFP_LIVE_URL ?? "https://rfp-finder-ph.fly.dev";
const DIR = `${process.cwd()}/qa/video`;
mkdirSync(DIR, { recursive: true });
mkdirSync(`${process.cwd()}/qa/shots`, { recursive: true });

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: DIR, size: { width: 1280, height: 800 } } });
const page = await ctx.newPage();

// Wait for the current in-flight assistant turn to finish (final text, then cards if expected).
async function awaitReply(cards = true) {
  await page.getByTestId("assistant-text").last().waitFor({ timeout: 110000 });
  await page.waitForFunction(() => {
    const els = document.querySelectorAll('[data-testid="assistant-text"]');
    const last = els[els.length - 1]; return !!last && (last.textContent || "").replace(/\s/g, "").length > 30;
  }, { timeout: 110000 }).catch(() => {});
  if (cards) await page.getByTestId("cards").last().waitFor({ timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1600);
}

async function ask(msg: string, cards = true) {
  const box = page.getByTestId("chat-input");
  await box.click(); await box.fill(msg); await page.waitForTimeout(400); await box.press("Enter");
  await awaitReply(cards);
}

// 1) land → the board (open notices, closing soon)
await page.goto(U, { waitUntil: "networkidle" });
await page.getByTestId("result-row").first().waitFor({ timeout: 30000 });
await page.waitForTimeout(1500);

// 2) search → interpreted list + plan chip
const q = "drainage works in Cavite under 5M";
await page.getByTestId("search-input").click();
await page.getByTestId("search-input").fill(q);
await page.waitForTimeout(400);
await page.getByTestId("search-submit").click();
await page.getByTestId("plan-note").waitFor({ timeout: 30000 });
await page.getByTestId("result-row").first().waitFor({ timeout: 30000 });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${DIR}/../shots/live-results.png`, fullPage: true });

// 3) infinite scroll — the results pane scrolls in its inner div (#pane-results)
for (let i = 0; i < 2; i++) {
  await page.evaluate(() => {
    const el = document.getElementById("pane-results");
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  });
  await page.waitForTimeout(2200);
}
await page.evaluate(() => document.getElementById("pane-results")?.scrollTo({ top: 0, behavior: "smooth" }));
await page.waitForTimeout(1200);

// 4) AI Mode — Google-style handoff: the query auto-runs in a fresh session
await page.getByTestId("tab-ai").click();
await awaitReply(true);
await page.screenshot({ path: `${DIR}/../shots/live-cards.png`, fullPage: true });
await ask("only ones above ₱2M, closing in the next few weeks");

// 5) tab back → results preserved
await page.getByTestId("tab-results").click();
await page.waitForTimeout(1800);

// 6) M4: open a notice detail page, enrich it, come back
await page.getByTestId("result-row").first().click();
await page.waitForURL(/\/notice\/\d+/);
await page.waitForTimeout(2500); // read the detail page
const enrichBtn = page.getByRole("button", { name: /enrich/i });
if (await enrichBtn.isVisible().catch(() => false)) {
  await enrichBtn.click();
  // enrich fetches + extracts + one Luna pass — up to ~2min; cached notices render instantly
  await page.getByText(/deliverables|qualifications/i).first().waitFor({ timeout: 180_000 }).catch(() => {});
  await page.waitForTimeout(2500);
}
await page.screenshot({ path: `${DIR}/../shots/live-detail-enriched.png`, fullPage: true });
await page.getByText("← Results").click();
await page.waitForTimeout(1500);

await ctx.close(); // flushes the video
await b.close();
console.log("VIDEO_DIR", DIR);

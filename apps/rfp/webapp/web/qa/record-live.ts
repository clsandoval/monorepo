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
for (const _ of [0, 1]) {
  await page.evaluate(() => {
    const el = document.getElementById("pane-results");
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  });
  await page.waitForTimeout(2200);
}
await page.evaluate(() => document.getElementById("pane-results")?.scrollTo({ top: 0, behavior: "smooth" }));
await page.waitForTimeout(1200);

// 4) AI Mode — the query carries into the chat input; send it, then refine
await page.getByTestId("tab-ai").click();
await page.waitForTimeout(1000);
await page.getByTestId("send").click(); // prefilled with the carried-over query
await awaitReply(true);
await page.screenshot({ path: `${DIR}/../shots/live-cards.png`, fullPage: true });
await ask("only ones above ₱2M, closing in the next few weeks");

// 5) tab back → results preserved
await page.getByTestId("tab-results").click();
await page.waitForTimeout(1800);

await ctx.close(); // flushes the video
await b.close();
console.log("VIDEO_DIR", DIR);

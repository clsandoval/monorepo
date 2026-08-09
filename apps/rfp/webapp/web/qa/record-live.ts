// Record a full end-to-end session against LIVE prod, then print the .webm path.
// Usage: bun qa/record-live.ts   (URL from RFP_LIVE_URL or default)
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const U = process.env.RFP_LIVE_URL ?? "https://rfp-finder-ph.fly.dev";
const DIR = `${process.cwd()}/qa/video`;
mkdirSync(DIR, { recursive: true });

const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1280, height: 800 }, recordVideo: { dir: DIR, size: { width: 1280, height: 800 } } });
const page = await ctx.newPage();

async function ask(msg: string, cards = true) {
  const box = page.getByTestId("chat-input");
  await box.click(); await box.fill(msg); await page.waitForTimeout(400); await box.press("Enter");
  await page.getByTestId("assistant-text").last().waitFor({ timeout: 110000 });
  // wait until final (non-placeholder) text
  await page.waitForFunction(() => {
    const els = document.querySelectorAll('[data-testid="assistant-text"]');
    const last = els[els.length - 1]; return !!last && (last.textContent || "").replace(/\s/g, "").length > 30;
  }, { timeout: 110000 }).catch(() => {});
  if (cards) await page.getByTestId("cards").last().waitFor({ timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1600);
}

await page.goto(U, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await ask("hi, what can you help me with?", false);   // greeting → intro
await ask("find me drainage work in Bulacan");          // the previously-broken follow-up
await page.screenshot({ path: `${DIR}/../shots/live-cards.png`, fullPage: true }); // still for eyeballing the carousel
await page.mouse.wheel(0, 700); await page.waitForTimeout(900); await page.mouse.wheel(0, -400);
await ask("only ones above ₱2M");                        // refine
await page.getByTestId("new-session").click(); await page.waitForTimeout(800);
await ask("small civil works in Cavite under ₱5M");     // new session
await page.getByTestId("session-item").nth(1).click(); await page.waitForTimeout(1500); // switch back

await ctx.close(); // flushes the video
await b.close();
console.log("VIDEO_DIR", DIR);

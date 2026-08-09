// P4 cross-device check against LIVE: zero horizontal overflow + drawer behavior at 3 widths.
import { chromium } from "@playwright/test";
const U = process.env.RFP_LIVE_URL ?? "https://rfp-finder-ph.fly.dev";
const DIR = `${process.cwd()}/qa/shots`;
const widths = [390, 768, 1280];
const b = await chromium.launch();
let fails = 0;
for (const w of widths) {
  const page = await b.newPage({ viewport: { width: w, height: 800 } });
  await page.goto(U, { waitUntil: "networkidle" });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  // mobile (<768) must show hamburger; desktop must show static panel
  const menu = await page.getByTestId("open-menu").isVisible().catch(() => false);
  const panelStatic = await page.getByTestId("new-session").isVisible().catch(() => false);
  const ok = overflow <= 2 && (w < 768 ? menu : panelStatic);
  if (!ok) fails++;
  console.log(`w=${w} overflow=${overflow} menu=${menu} panel=${panelStatic} ${ok ? "OK" : "FAIL"}`);
  await page.screenshot({ path: `${DIR}/cd-${w}.png`, fullPage: true });
  await page.close();
}
await b.close();
console.log(fails ? `CROSSDEVICE FAIL (${fails})` : "CROSSDEVICE OK");
process.exit(fails ? 1 : 0);

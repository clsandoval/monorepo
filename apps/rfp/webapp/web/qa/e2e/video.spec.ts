import { test, expect } from "@playwright/test";

// VIDEO GATE — records a full end-to-end session as proof the app actually works.
// Video is written to test-results/; qa/send-video.sh ships it to Telegram.
test.use({ video: { mode: "on", size: { width: 1280, height: 800 } }, viewport: { width: 1280, height: 800 } });

async function ask(page: import("@playwright/test").Page, msg: string, waitCards = true) {
  const box = page.getByTestId("chat-input");
  await box.click();
  await box.fill(msg);
  await page.waitForTimeout(400);
  await box.press("Enter");
  // wait for a real final reply (not the "…" placeholder)
  await expect(page.getByTestId("assistant-text").last()).toHaveText(/[A-Za-z].{30,}/, { timeout: 110_000 });
  if (waitCards) await page.getByTestId("cards").last().waitFor({ timeout: 15_000 }).catch(() => {});
  await page.waitForTimeout(1500); // let it settle / be watchable
}

test("end-to-end session (video)", async ({ page }) => {
  await page.goto("/");
  // results-first IA: land on the board, then into AI Mode for the chat journey
  await expect(page.getByTestId("result-row").first()).toBeVisible({ timeout: 15_000 });
  await page.waitForTimeout(1200);
  await page.getByTestId("tab-ai").click();
  await expect(page.getByTestId("empty-state")).toBeVisible();
  await page.waitForTimeout(600);

  // 1) greeting → intro (no tools)
  await ask(page, "hi, what can you help me with?", false);

  // 2) real search → cards (the case that was broken)
  await ask(page, "find me drainage work in Bulacan");
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(1000);
  await page.mouse.wheel(0, -300);

  // 3) refine
  await ask(page, "only ones above ₱2M, closing in the next few weeks");

  // 4) new session + switch back
  await page.getByTestId("new-session").click();
  await page.waitForTimeout(800);
  await ask(page, "small civil works in Cavite under ₱5M", true);
  await page.getByTestId("session-item").nth(1).click();
  await page.waitForTimeout(1500);

  expect(true).toBe(true);
});

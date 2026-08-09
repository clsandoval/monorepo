import { test, expect, type Page } from "@playwright/test";

// G4/S3 E2E — results-first IA: landing is the board; chat lives behind the AI Mode tab.
// One real Luna chat turn in the chat test.

async function openAi(page: Page) {
  await page.goto("/");
  await page.getByTestId("tab-ai").click();
}

test("landing shows the board; AI tab shows chat empty state + session panel", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("result-row").first()).toBeVisible({ timeout: 15_000 });
  await page.getByTestId("tab-ai").click();
  await expect(page.getByTestId("empty-state")).toBeVisible();
  await expect(page.getByTestId("new-session")).toBeVisible();
});

test("new session appears in the panel", async ({ page }) => {
  await openAi(page);
  await page.getByTestId("new-session").click();
  await expect(page.getByTestId("session-item").first()).toBeVisible();
});

test("chat turn streams a reply and renders cards", async ({ page }) => {
  await openAi(page);
  await page.getByTestId("chat-input").fill("small drainage jobs in Cavite under 5M, PCAB C");
  await page.getByTestId("send").click();
  // wait for the FINAL reply (real sentence), not the "…" streaming placeholder
  await expect(page.getByTestId("assistant-text").first()).toHaveText(/[A-Za-z].{40,}/, { timeout: 100_000 });
  // cards hydrate from cited ids for a query that should return civil-works notices
  await expect(page.getByTestId("cards").first()).toBeVisible({ timeout: 10_000 });
});

test("session persists across reload", async ({ page }) => {
  await openAi(page);
  await page.getByTestId("new-session").click();
  await page.getByTestId("chat-input").fill("hello");
  const before = await page.getByTestId("session-item").count();
  await page.reload();
  await page.getByTestId("tab-ai").click(); // reload lands on Results — go back to chat
  await expect(page.getByTestId("session-item").first()).toBeVisible();
  expect(await page.getByTestId("session-item").count()).toBeGreaterThanOrEqual(before);
});

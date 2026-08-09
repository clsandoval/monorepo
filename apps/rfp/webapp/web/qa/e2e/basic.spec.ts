import { test, expect } from "@playwright/test";

// G4 E2E — runs against a Playwright-managed `next start`. One real Luna turn in the chat test.

test("landing + session panel render", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("empty-state")).toBeVisible();
  await expect(page.getByTestId("new-session")).toBeVisible();
});

test("new session appears in the panel", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("new-session").click();
  await expect(page.getByTestId("session-item").first()).toBeVisible();
});

test("chat turn streams a reply and renders cards", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("chat-input").fill("small drainage jobs in Cavite under 5M, PCAB C");
  await page.getByTestId("send").click();
  // wait for the FINAL reply (real sentence), not the "…" streaming placeholder
  await expect(page.getByTestId("assistant-text").first()).toHaveText(/[A-Za-z].{40,}/, { timeout: 100_000 });
  // cards hydrate from cited ids for a query that should return civil-works notices
  await expect(page.getByTestId("cards").first()).toBeVisible({ timeout: 10_000 });
});

test("session persists across reload", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("new-session").click();
  await page.getByTestId("chat-input").fill("hello");
  const before = await page.getByTestId("session-item").count();
  await page.reload();
  await expect(page.getByTestId("session-item").first()).toBeVisible();
  expect(await page.getByTestId("session-item").count()).toBeGreaterThanOrEqual(before);
});

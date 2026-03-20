import { test, expect } from '@playwright/test';
import { startServer, stopServer } from './helpers/server';

test.beforeAll(async () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY must be set for slash command E2E tests');
  }
  await startServer();
});

test.afterAll(async () => {
  await stopServer();
});

test('slash command is sent to agent verbatim', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder('Type a message');
  await input.fill('/help');
  await input.press('Control+Enter');

  await expect(page.getByText('/help')).toBeVisible();

  const assistantBubble = page.locator('[class*="bg-zinc-800"]').last();
  await expect(assistantBubble).toBeVisible({ timeout: 120_000 });
});

test('multi-turn conversation works', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder('Type a message');

  await input.fill('What is in readme.txt?');
  await input.press('Control+Enter');

  await expect(page.getByText(/test knowledgebase/i)).toBeVisible({ timeout: 120_000 });

  await input.fill('Now read data.csv and tell me the sum of the values column.');
  await input.press('Control+Enter');

  await expect(page.getByText('600')).toBeVisible({ timeout: 120_000 });
});

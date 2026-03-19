import { test, expect } from '@playwright/test';
import { startServer, stopServer } from './helpers/server';

test.beforeAll(async () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY must be set for chat E2E tests');
  }
  await startServer();
});

test.afterAll(async () => {
  await stopServer();
});

test('send message and receive agent response', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder('Type a message');
  await input.fill('What files are in the workspace? Just list the filenames.');
  await input.press('Control+Enter');

  await expect(page.getByText('What files are in the workspace?')).toBeVisible();
  await expect(page.getByText('readme.txt')).toBeVisible({ timeout: 120_000 });
});

test('agent uses tool and tool use block renders', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder('Type a message');
  await input.fill('Read the file notes.md and tell me what the action item is.');
  await input.press('Control+Enter');

  await expect(page.locator('text=Read').first()).toBeVisible({ timeout: 120_000 });
  await expect(page.getByText(/review budget/i)).toBeVisible({ timeout: 120_000 });
});

test('agent can search with Grep', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder('Type a message');
  await input.fill('Search all files for the word "priorities" and tell me which file contains it.');
  await input.press('Control+Enter');

  await expect(page.getByText(/notes\.md/i)).toBeVisible({ timeout: 120_000 });
});

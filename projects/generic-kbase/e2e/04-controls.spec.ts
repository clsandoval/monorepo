import { test, expect } from '@playwright/test';
import { startServer, stopServer } from './helpers/server';

test.beforeAll(async () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY must be set for control E2E tests');
  }
  await startServer();
});

test.afterAll(async () => {
  await stopServer();
});

test('New Session clears chat', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder('Type a message');
  await input.fill('Say hello');
  await input.press('Control+Enter');

  await expect(page.locator('.mb-4').first()).toBeVisible({ timeout: 120_000 });

  await page.getByRole('button', { name: 'New' }).click();

  await expect(page.getByText('Ask questions about files in /workspace')).toBeVisible();
});

test('Interrupt stops streaming', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder('Type a message');
  await input.fill('List every file in /workspace recursively and describe each one in detail.');
  await input.press('Control+Enter');

  await page.waitForTimeout(3000);

  await page.keyboard.press('Escape');

  await expect(page.locator('button[title="Send (Ctrl+Enter)"]')).toBeVisible({ timeout: 10_000 });
});

test('Ctrl+N triggers new session', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder('Type a message');
  await input.fill('Hello');
  await input.press('Control+Enter');

  await expect(page.locator('.mb-4').first()).toBeVisible({ timeout: 120_000 });

  await page.keyboard.press('Control+n');

  await expect(page.getByText('Ask questions about files in /workspace')).toBeVisible();
});

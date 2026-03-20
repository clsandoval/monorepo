import { test, expect } from '@playwright/test';
import { startServer, stopServer } from './helpers/server';

test.beforeAll(async () => {
  await startServer();
});

test.afterAll(async () => {
  await stopServer();
});

test('health endpoint returns 200', async ({ request }) => {
  const res = await request.get('/health');
  expect(res.status()).toBe(200);
  expect(await res.text()).toBe('ok');
});

test('page loads with app title and empty state', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('generic-kbase');
  await expect(page.getByText('Ask questions about files in /workspace')).toBeVisible();
  await expect(page.getByPlaceholder('Type a message')).toBeVisible();
  await expect(page.locator('[title="Connected"]')).toBeVisible();
});

test('New button is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'New' })).toBeVisible();
});

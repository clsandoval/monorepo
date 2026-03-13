import { test, expect } from '@playwright/test';

test('smoke: home page renders', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('body')).toBeVisible();
});

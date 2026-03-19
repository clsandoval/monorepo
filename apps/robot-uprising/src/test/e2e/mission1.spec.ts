import { test, expect } from '@playwright/test';

test('Mission 1 three-screen loop: Plan -> Sealed Watch -> Inspector', async ({ page }) => {
  test.setTimeout(120_000);

  await page.goto('/');

  // --- PLAN SCREEN ---
  // Verify plan screen loads with mission title and EXECUTE button
  await expect(page.getByText('Mission 1: Wake Up')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('button', { name: 'EXECUTE' })).toBeVisible();

  // Remove ALL noise entries from both units so they can act
  // Each unit starts with 6/6 noise-filled buffer slots; remove them all
  while (await page.getByRole('button', { name: 'Remove' }).count() > 0) {
    await page.getByRole('button', { name: 'Remove' }).first().click();
  }

  // Click EXECUTE to start the mission
  await page.getByRole('button', { name: 'EXECUTE' }).click();

  // --- SEALED WATCH ---
  // Verify tick counter is visible
  await expect(page.getByText(/TICK \d+ \/ 60/)).toBeVisible({ timeout: 10_000 });

  // Speed up to 2x to reduce wait time
  const speed2x = page.getByRole('button', { name: '2x' });
  if (await speed2x.isVisible()) {
    await speed2x.click();
  }

  // Wait for mission to complete — INSPECT button appears in the result overlay
  // With 2x speed, 60 ticks at 300ms each = ~18s max; use generous timeout
  await expect(page.getByRole('button', { name: 'INSPECT' })).toBeVisible({ timeout: 90_000 });

  // Click INSPECT
  await page.getByRole('button', { name: 'INSPECT' }).click();

  // --- INSPECTOR ---
  // Timeline scrubber (range input) should be visible
  await expect(page.locator('input[type="range"]')).toBeVisible({ timeout: 10_000 });

  // REDESIGN button should be visible
  await expect(page.getByRole('button', { name: 'REDESIGN' })).toBeVisible();

  // Verify result badge (VICTORY or DEFEAT) is shown
  await expect(page.getByText(/VICTORY|DEFEAT/)).toBeVisible();
});

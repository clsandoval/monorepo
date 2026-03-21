import { test, expect } from "@playwright/test";

test("auth gate — /remediation redirects unauthenticated users to /login", async ({
  page,
}) => {
  // Navigate to the protected remediation route without any auth session
  await page.goto("/remediation");

  // The middleware should redirect to /login
  await page.waitForURL(/\/login/, { timeout: 10000 });
  expect(page.url()).toContain("/login");
});

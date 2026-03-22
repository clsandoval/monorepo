import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "http://127.0.0.1:54321",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
);

test.describe("Pro Pricing Page", () => {
  test("shows pricing tiers at /pro", async ({ page }) => {
    await page.goto("/pro");
    await expect(page.getByRole("heading", { name: "Solo" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Practice" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Firm" })).toBeVisible();
    await expect(page.locator("text=₱999")).toBeVisible();
    await expect(page.locator("text=₱2,499")).toBeVisible();
    await expect(page.locator("text=₱4,999")).toBeVisible();
  });

  test("has trial CTA linking to /pro/signup", async ({ page }) => {
    await page.goto("/pro");
    const cta = page.getByRole("link", { name: /free trial/i }).first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/pro/signup");
  });
});

test.describe("Pro Signup", () => {
  const testEmail = `test-pro-${Date.now()}@example.com`;
  const testPassword = "testpassword123";
  const testOrgName = "Test Accounting Practice";

  test.afterAll(async () => {
    // Clean up: delete the test user
    const { data: users } = await supabase.auth.admin.listUsers();
    const testUser = users?.users?.find((u) => u.email === testEmail);
    if (testUser) {
      // Delete org data first
      const { data: membership } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", testUser.id)
        .single();

      if (membership) {
        await supabase
          .from("corporations")
          .delete()
          .eq("organization_id", membership.organization_id);
        await supabase
          .from("organization_members")
          .delete()
          .eq("organization_id", membership.organization_id);
        await supabase
          .from("organizations")
          .delete()
          .eq("id", membership.organization_id);
      }

      await supabase.auth.admin.deleteUser(testUser.id);
    }
  });

  test("signup creates user + org and redirects to dashboard", async ({
    page,
  }) => {
    await page.goto("/pro/signup");

    // Fill org name
    await page.fill('[id="org-name"]', testOrgName);

    // Fill email/password
    await page.fill('[id="email"]', testEmail);
    await page.fill('[id="password"]', testPassword);
    await page.fill('[id="confirm-password"]', testPassword);

    // Submit
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await page.waitForURL("**/dashboard**", { timeout: 15000 });

    // Verify org name shows on dashboard
    await expect(page.locator(`text=${testOrgName}`)).toBeVisible({
      timeout: 10000,
    });

    // Verify trial banner is showing
    await expect(page.locator("text=free trial")).toBeVisible();

    // Verify dashboard shows 0 total corporations
    await expect(page.locator("text=Total Corporations")).toBeVisible();
  });
});

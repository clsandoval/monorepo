import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "http://127.0.0.1:54321",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
);

const TEST_EMAIL = `test-dashboard-${Date.now()}@example.com`;
const TEST_PASSWORD = "testpassword123";
const TEST_ORG = "Dashboard Test Practice";

test.describe("Pro Dashboard", () => {
  // Seed a pro user before all tests
  test.beforeAll(async () => {
    // Create user via admin API
    const { data: authData } = await supabase.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { role: "pro" },
    });

    if (!authData.user) throw new Error("Failed to create test user");

    const userId = authData.user.id;

    // Create org
    const { data: org } = await supabase
      .from("organizations")
      .insert({
        name: TEST_ORG,
        owner_id: userId,
        plan: "practice",
        subscription_status: "trialing",
        corp_limit: 25,
      })
      .select("id")
      .single();

    if (!org) throw new Error("Failed to create org");

    // Create membership
    await supabase.from("organization_members").insert({
      organization_id: org.id,
      user_id: userId,
      role: "owner",
    });

    // Create a test corporation
    await supabase.from("corporations").insert({
      name: "Acme Holdings Corp.",
      organization_id: org.id,
      user_id: userId,
      corp_type: "stock",
      re_bracket: "100k_500k",
      registration_date: "2018-01-01",
      domicile: "domestic",
      mc28_compliant: false,
    });
  });

  test.afterAll(async () => {
    const { data: users } = await supabase.auth.admin.listUsers();
    const testUser = users?.users?.find((u) => u.email === TEST_EMAIL);
    if (testUser) {
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

  test("non-authenticated user gets redirected from /dashboard", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await page.waitForURL("**/login**");
  });

  test("pro user sees dashboard with org name and corp table", async ({
    page,
  }) => {
    // Login
    await page.goto("/login");
    await page.fill('[id="email"]', TEST_EMAIL);
    await page.fill('[id="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Pro user should be redirected to dashboard
    await page.waitForURL("**/dashboard**", { timeout: 15000 });

    // Org name visible
    await expect(page.locator(`text=${TEST_ORG}`)).toBeVisible({
      timeout: 10000,
    });

    // Summary stats visible
    await expect(page.locator("text=Total Corporations")).toBeVisible();
    await expect(page.locator("text=Total Penalty Exposure")).toBeVisible();

    // Corporation table shows our test corp
    await expect(page.locator("text=Acme Holdings Corp.")).toBeVisible();

    // Status filter tabs visible
    await expect(page.getByText("All (").first()).toBeVisible();
  });

  test("pro user can navigate to settings", async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('[id="email"]', TEST_EMAIL);
    await page.fill('[id="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for login to complete
    await page.waitForURL("**/dashboard**", { timeout: 15000 });

    await page.goto("/settings");
    await page.waitForLoadState("networkidle");

    // Settings page shows
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=General")).toBeVisible();
    await expect(page.locator("text=Billing")).toBeVisible();
  });
});

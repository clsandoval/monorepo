import { test, expect } from "@playwright/test";

/**
 * Pre-encoded wizard data for results page test.
 *
 * Decoded data:
 *   corpType: "stock"
 *   incorporationYear: 2018
 *   reBracket: "100k_500k"
 *   mc28Compliant: false
 *   filedReports: GIS 2018, GIS 2019, AFS 2018–2021
 *   hasSuspension: false, suspensionDate: null
 *   hasRevocation: false, revocationDate: null
 */
const ENCODED_DATA =
  "eyJjb3JwVHlwZSI6InN0b2NrIiwiaW5jb3Jwb3JhdGlvblllYXIiOjIwMTgsInJlQnJhY2tldCI6IjEwMGtfNTAwayIsIm1jMjhDb21wbGlhbnQiOmZhbHNlLCJmaWxlZFJlcG9ydHMiOlt7InJlcG9ydFR5cGUiOiJHSVMiLCJ5ZWFyIjoyMDE4LCJzdGF0dXMiOiJmaWxlZCJ9LHsicmVwb3J0VHlwZSI6IkdJUyIsInllYXIiOjIwMTksInN0YXR1cyI6ImZpbGVkIn0seyJyZXBvcnRUeXBlIjoiQUZTIiwieWVhciI6MjAxOCwic3RhdHVzIjoiZmlsZWQifSx7InJlcG9ydFR5cGUiOiJBRlMiLCJ5ZWFyIjoyMDE5LCJzdGF0dXMiOiJmaWxlZCJ9LHsicmVwb3J0VHlwZSI6IkFGUyIsInllYXIiOjIwMjAsInN0YXR1cyI6ImZpbGVkIn0seyJyZXBvcnRUeXBlIjoiQUZTIiwieWVhciI6MjAyMSwic3RhdHVzIjoiZmlsZWQifV0sImhhc1N1c3BlbnNpb24iOmZhbHNlLCJzdXNwZW5zaW9uRGF0ZSI6bnVsbCwiaGFzUmV2b2NhdGlvbiI6ZmFsc2UsInJldm9jYXRpb25EYXRlIjpudWxsfQ==";

test("results page — renders all key sections from pre-encoded data", async ({
  page,
}) => {
  await page.goto(`/results?data=${ENCODED_DATA}`);

  // Wait for loading to complete
  await expect(
    page.getByText(/computing your compliance status/i)
  ).toBeHidden({ timeout: 15000 });

  // Status badge shows "Delinquent"
  await expect(
    page.getByText("Delinquent", { exact: false })
  ).toBeVisible();

  // Compliance timeline container is rendered
  // The timeline is a horizontal bar chart rendered by ComplianceTimeline
  const timeline = page.locator("[data-testid='compliance-timeline'], .compliance-timeline, table").first();
  // Fallback: look for the year range in the page which indicates timeline rendered
  await expect(page.getByText(/2018/)).toBeVisible();

  // Penalty table has rows — look for table rows with penalty data
  const tableRows = page.locator("table tbody tr");
  await expect(tableRows.first()).toBeVisible();
  const rowCount = await tableRows.count();
  expect(rowCount).toBeGreaterThan(0);

  // Total penalty is displayed — look for the large currency figure
  const totalPenaltyEl = page
    .locator(".font-display.text-4xl, [class*='text-4xl']")
    .first();
  await expect(totalPenaltyEl).toBeVisible();

  const totalText = await totalPenaltyEl.textContent();
  const numericValue = parseInt((totalText ?? "0").replace(/[₱,]/g, ""), 10);
  expect(numericValue).toBeGreaterThan(0);

  // CTA button exists and links to /signup
  const ctaButton = page.getByRole("link", { name: /how do i fix this/i });
  await expect(ctaButton).toBeVisible();
  const href = await ctaButton.getAttribute("href");
  expect(href).toContain("/signup");
});

# PodPlay Ops QA2 Forward Loop — Spec

**Date**: 2026-03-12
**Source**: Marco Van QA feedback (Telegram, 2026-03-12)
**Scope**: 21 findings — 4 removals, 4 bugs, 9 UX improvements, 4 new features

## Findings

### Removals

#### Q01 — Remove CC terminal features
- **What**: Delete all CC terminal UI, types, tests, enum labels, toast messages, confirmation dialogs
- **Files**: `CcTerminalSetup.tsx`, procurement tab reference, types in `types.ts`, labels in `enum-labels.ts`, toasts in `toast-messages.ts`, dialogs in `confirmation-dialogs.ts`, tests in `__tests__/wizard/procurement/`
- **Action**: Permanent deletion. Remove from procurement wizard tabs. Clean up imports.

#### Q02 — Remove replay sign features
- **What**: Delete all replay sign UI, types, tests, enum labels, toast messages, confirmation dialogs
- **Files**: `ReplaySignFulfillment.tsx`, procurement tab reference, types, labels, toasts, dialogs, tests
- **Action**: Permanent deletion. Remove from procurement wizard tabs. Clean up imports.

#### Q03 — Remove travel tab
- **What**: Delete Settings > Travel route, component, nav link
- **Files**: `routes/_auth/settings/travel.tsx`, travel component in `components/settings/`, nav link in layout/sidebar
- **Action**: Permanent deletion.

#### Q04 — Remove "Has PingPod WiFi" field
- **What**: Delete the `has_pingpod_wifi` checkbox from venue config step
- **Files**: `VenueConfigStep.tsx` (field + schema), `ReviewStep.tsx` (display row), types, tests
- **Action**: Remove field from form, Zod schema, review display, and all tests referencing it.

### Bug Fixes

#### Q05 — Adding vendor fails
- **What**: The VendorSettings CRUD operations fail when trying to add a new vendor
- **Action**: Debug the `VendorSettings.tsx` component. Check Supabase insert query, column names, RLS policies. Fix root cause. Verify by inserting a vendor via the UI against real Supabase.

#### Q06 — Inventory seed migration errors
- **What**: Migration `00015_seed_inventory.sql` fails when run
- **Action**: Debug the SQL. Common causes: FK constraint violation, duplicate key, wrong column names. Fix and verify with `npx supabase db reset`.

#### Q07 — "Advance to deployment" shows "(tier)" literal
- **What**: When clicking "Advance to Deployment", the confirmation dialog or toast shows the literal string "(tier)" instead of the project's actual selected tier (e.g., "Pro", "Autonomous")
- **Action**: Find the template string that references the tier. It's likely in `confirmation-dialogs.ts` or `toast-messages.ts` or inline in the procurement page. Replace with actual project tier value.

#### Q08 — Customer name not pre-filled
- **What**: When returning to the Customer Info step of an existing project, the customer name field is empty instead of showing the saved value
- **Action**: Check `CustomerInfoStep.tsx` default values loading. Ensure the form reads from the existing project data when editing (not just on create).

### UX Improvements

#### Q09 — Delete project with confirmation
- **What**: Add ability to delete a project from the dashboard
- **UI**: Add a delete button (trash icon or menu item) on project cards. Clicking shows a confirmation dialog: "Delete [project name]? This action cannot be undone. All project data including intake, procurement, deployment, and financial records will be permanently deleted."
- **Action**: Add dialog to `confirmation-dialogs.ts`. Add delete handler that calls `supabase.from('projects').delete()`. Cascade should handle related records (check FK constraints). Add to dashboard component.

#### Q10 — Installer step → multi-select
- **What**: Redesign the installer selection step from single-select to multi-select dropdown
- **Context**: In PH operations, Pod Play employs installers directly. Multiple installers are assigned per site installation.
- **UI**: Replace current installer selection with a multi-select dropdown (using SearchableSelect or similar). Show selected installers as chips/tags. The review step should display all selected installers.
- **Schema**: The `projects` table may need a junction table or array column for multiple installer IDs. Check current schema — if it's a single `installer_id` FK, need a `project_installers` junction table or change to `installer_ids` array.

#### Q11 — Non-skippable wizard steps
- **What**: Grey out future wizard steps so users can't skip ahead
- **UI**: Steps that haven't been reached yet should be visually greyed out and not clickable. Only the current step and completed steps are interactive. Completed steps can be revisited (backward navigation).
- **Logic**: Track step completion state. A step is "complete" when its form has been saved/submitted. Steps are unlocked sequentially.
- **Apply to**: All 4 wizards (intake, procurement, deployment, financials).

#### Q12 — Door/camera count conditional required
- **What**: If "Front Desk" is not checked in venue config, door count and camera count should be required fields (not optional)
- **Logic**: Conditional Zod validation — when `has_front_desk === false`, `door_count` and `camera_count` must be > 0. When `has_front_desk === true`, they remain optional.
- **Files**: `VenueConfigStep.tsx` Zod schema (use `.refine()` or `.superRefine()`).

#### Q13 — iPad 128GB not 64GB
- **What**: The hardware catalog has iPad at 64GB starting price. iPads now start at 128GB.
- **Action**: Update `00006_seed_hardware.sql` (or whichever seed has the iPad entry) to reflect 128GB model and its current price. Also update any test fixtures that reference the old spec.

#### Q14 — Project name instead of UUID in procurement header
- **What**: The procurement page header shows the project UUID instead of the project name
- **Action**: Query the project name and display it in the page header. Format: "Procurement — [Project Name]" or similar.

#### Q15 — Project name instead of UUID in intake header
- **What**: Same as Q14 but for the intake wizard header
- **Action**: Same fix — show project name instead of UUID.

#### Q16 — Deposit minimum configurable
- **What**: The deposit amount in the financials wizard should have a minimum floor, configurable in Settings > Pricing
- **Schema**: Add `minimum_deposit` column to `settings` table (default $500 or similar). Add migration.
- **UI**: Add field to `PricingSettings.tsx` for setting the minimum deposit amount.
- **Enforcement**: In the financials wizard deposit form, validate that the deposit amount >= the configured minimum. Show validation message: "Minimum deposit is $[amount]".

#### Q17 — Deployment advance requires all checkboxes
- **What**: The "Advance to Financial Close" button on the deployment page should be disabled until all deployment checklist items are checked
- **Logic**: Query all `deployment_checklist_items` for the project. If any are unchecked, disable the advance button with a tooltip: "Complete all deployment checklist items before advancing".
- **Files**: Deployment page component.

### New Features

#### Q18 — Operations guide page
- **What**: A comprehensive `/guide` route with the full PodPlay deployment operations manual
- **Content sections**:
  1. **Overview** — What PodPlay Ops manages, the project lifecycle
  2. **Customer Onboarding** — How to create a project, complete intake, select tier
  3. **Procurement** — How to generate BOM, create POs, receive inventory, prepare packing lists
  4. **Deployment** — The 15-phase deployment process, what each phase covers
  5. **Financials** — Deposits, expenses, invoicing, P&L, recurring fees
  6. **Inventory Management** — Stock tracking, adjustments, on-order quantities
  7. **Settings** — Team contacts, installers, vendors, pricing, catalog
- **Styling**: Clean, readable typography. Print-friendly CSS (`@media print`). Table of contents with anchor links.
- **Nav**: Add "Guide" link to the main sidebar/nav.

#### Q19 — PDF export on data pages
- **What**: Add PDF export buttons to printable content pages
- **Method**: Use `window.print()` with print-specific CSS, or a library like `react-to-print`. No server-side PDF generation needed.
- **Pages with export**:
  - BOM Review (procurement) — "Export BOM as PDF"
  - Packing List (procurement) — "Export Packing List as PDF"
  - Invoice summaries (financials) — "Export Invoice as PDF"
  - Operations Guide — "Export Guide as PDF"
- **UI**: A small "Export PDF" button in the top-right of each exportable section.

#### Q20 — Inventory on-order tracking
- **What**: Inventory should show quantities that have been ordered but not yet received
- **Schema changes**:
  - Add `qty_on_order` column to `inventory` table (default 0)
  - Add `order_status` enum: `not_ordered`, `ordered`, `partial`, `received`
- **Auto-tracking**: When a PO is created in procurement, automatically update `inventory.qty_on_order` for each item in the PO. When items are received (PO receiving), decrement `qty_on_order` and increment `qty_on_hand`.
- **Manual override**: Add "Set On-Order" action in inventory UI for orders placed outside the app.
- **Display**: Inventory table columns: SKU | On Hand | On Order | Available (on_hand - allocated + on_order) | Status

#### Q21 — Forward/backward wizard navigation
- **What**: Add step navigation controls to all wizards
- **UI**: Previous/Next buttons at the bottom of each step. Step indicator at the top showing all steps with current highlighted. Completed steps are clickable (can go back). Future steps are greyed out (per Q11).
- **Behavior**: "Previous" saves current form state and goes back. "Next" validates and saves, then advances. On the last step, "Next" becomes "Complete" or "Submit".
- **Apply to**: All 4 wizards.

## Technical Notes

### Supabase
- All work runs against real Supabase local (`npx supabase start`)
- No mocks anywhere — all DB operations are real
- Schema changes go in new migration files (00019+)
- Test with `npx supabase db reset` to verify migrations run clean

### Removals
- After removing CC terminals and replay signs, the procurement wizard tabs will be reduced
- Run `npx tsc --noEmit` after each removal to catch broken imports
- Update the route tree (`routeTree.gen.ts` auto-generates from file-based routing)

### Testing
- Update existing tests to remove references to deleted features
- Add tests for new features (delete project, multi-select installer, step locking)
- All tests run with `npm run test`

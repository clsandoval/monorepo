# Schema Audit — Stage 001

Generated: 2026-03-12
Migrations scanned: 18 (00001–00018)
Source files scanned: `apps/podplay/src/**` — all `supabase.from(` calls

---

## Schema Summary (tables & key columns after all migrations)

| Table | Key Columns |
|-------|-------------|
| `installers` | id, name, company, email, phone, installer_type, regions, hourly_rate, is_active, notes |
| `projects` | id, customer_name, venue_name, project_name (m11), tier, court_count, door_count, security_camera_count, replay_sign_count (generated), has_nvr, has_pingpod_wifi, has_front_desk, isp_provider, isp_type, has_static_ip, has_backup_isp, internet_download_mbps, internet_upload_mbps, starlink_warning_acknowledged, rack_size_u, ddns_subdomain, unifi_site_name, mac_mini_username, mac_mini_password, location_id, replay_api_url, replay_local_url, replay_service_version, project_status, deployment_status, revenue_stage, kickoff_call_date, signed_date, installation_start_date, installation_end_date, go_live_date, installer_id, installer_type, installer_hours, notes, internal_notes, isp_config_method (m09), wizard_step (m14) |
| `settings` | id ('default'), pro_venue_fee, pro_court_fee, autonomous_venue_fee, autonomous_court_fee, pbk_venue_fee, pbk_court_fee, sales_tax_rate, shipping_rate, target_margin, labor_rate_per_hour, hours_per_day, lodging_per_day, airfare_default, niko_annual_salary, niko_direct_allocation, chad_annual_salary, chad_indirect_allocation, annual_rent, annual_indirect_salaries |
| `hardware_catalog` | id, sku, name, vendor, category, unit_cost, description, is_active |
| `bom_templates` | id, tier, item_id (FK→hardware_catalog), default_quantity, quantity_rule, is_required |
| `project_bom_items` | id, project_id, catalog_item_id (FK→hardware_catalog), quantity, unit_cost_override, notes |
| `inventory` | id, updated_at, item_id (FK→hardware_catalog), quantity_on_hand, quantity_allocated, reorder_point |
| `inventory_movements` | id, created_at, hardware_catalog_id (renamed from item_id m12), project_id (added m12), movement_type, qty_delta (renamed from quantity m12), reference_type, reference_id, reference (added m12), notes |
| `invoices` | id, project_id, invoice_number, type, amount, tax_amount, total_amount, status, payment_method, issued_date, due_date, paid_date, notes |
| `expenses` | id, project_id, category, description, amount, payment_method, vendor, receipt_url, expense_date, notes |
| `cc_terminals` | id, project_id, serial_number, model, status (cc_terminal_stage_status), deployed_date, notes |
| `replay_signs` | id, project_id, quantity, status (replay_sign_stage_status: ordered/produced/shipped/installed), order_date, ship_date, install_date, notes |
| `deployment_checklist_templates` | id, phase, phase_name, step_number, title, description, warnings, auto_fill_tokens, applicable_tiers, is_v2_only, sort_order |
| `deployment_checklist_items` | id, project_id, template_id, phase, step_number, sort_order, title, description, warnings, is_completed, completed_at, notes |
| `team_contacts` | id, slug, name, role, department, phone, email, contact_via, support_tier, notes, is_active |
| `purchase_orders` | id, po_number, vendor, project_id, order_date, expected_date, total_cost, status, received_date, tracking_number, notes |
| `purchase_order_items` | id, purchase_order_id, hardware_catalog_id (FK), qty_ordered, qty_received, unit_cost |
| `monthly_opex_snapshots` | id, period_year, period_month, hardware_revenue, team_hardware_spend, her_ratio |
| `vendors` | id, name, contact_name, email, phone, website, lead_time_days, notes, is_active |
| `recurring_fees` | id, project_id, label, description, amount, frequency (fee_frequency), start_date, end_date, is_active, vendor, notes |

---

## MISMATCHES FOUND

### MISMATCH-01 — Wrong table name in GoLive.tsx
- **File**: `src/components/wizard/financials/GoLive.tsx:67`
- **Code**: `supabase.from('deployment_checklist')`
- **Actual table**: `deployment_checklist_items`
- **Impact**: Query returns null/error at runtime — checklist summary never loads
- **Fix**: Change `'deployment_checklist'` → `'deployment_checklist_items'`

---

### MISMATCH-02 — Non-existent column `completed_at` on `projects`
- **File**: `src/components/wizard/financials/GoLive.tsx:59`
- **Code**: `.select('project_name, venue_name, project_status, go_live_date, notes, completed_at')`
- **Problem**: `projects` table has no `completed_at` column (that column lives on `deployment_checklist_items`)
- **Impact**: Column silently returns null — no runtime error but data is wrong
- **Fix**: Remove `completed_at` from the select, or add a migration to add the column

---

### MISMATCH-03 — Wrong column name `service_tier` on `projects`
- **File**: `src/routes/_auth/projects/$projectId/procurement.tsx:40`
- **Code**: `.select('project_name, customer_name, service_tier')`
- **Actual column**: `tier` (type `service_tier`)
- **Impact**: `project.service_tier` is always undefined — tier display broken on procurement page
- **Fix**: Change `service_tier` → `tier` in the select and in the state type

---

### MISMATCH-04 — Non-existent column `est_total_cost` on `project_bom_items`
- **File**: `src/components/wizard/financials/PnlSummary.tsx:69`
- **Code**: `.select('id, est_total_cost')`
- **Problem**: `project_bom_items` has no `est_total_cost` column. Actual columns: `id, catalog_item_id, quantity, unit_cost_override, notes`
- **Impact**: All BOM cost calculations in P&L Summary return null/0 — financials are wrong
- **Fix**: Select `quantity, unit_cost_override` and join to `hardware_catalog` for `unit_cost`, compute cost in-code

---

### MISMATCH-05 — Stale column names in `inventory_movements` insert (AdjustmentModal)
- **File**: `src/components/inventory/AdjustmentModal.tsx:70-74`
- **Code**:
  ```js
  { item_id: itemId, movement_type: ..., quantity: qty, notes: ... }
  ```
- **Problem**: Migration 00012 renamed `item_id` → `hardware_catalog_id` and `quantity` → `qty_delta`
- **Impact**: Insert fails silently — inventory adjustments are not recorded in movement history
- **Fix**: Change `item_id` → `hardware_catalog_id`, `quantity` → `qty_delta`

---

### MISMATCH-06 — Multiple wrong column names on `replay_signs` in ReplaySignFulfillment
- **File**: `src/components/wizard/procurement/ReplaySignFulfillment.tsx`
- **Code columns used**: `qty, outreach_channel, outreach_date, vendor_order_id, tracking_number, shipped_date, delivered_date, installed_date`
- **Actual `replay_signs` columns**: `quantity, order_date, ship_date, install_date, notes`
- **Missing in schema**: `outreach_channel`, `outreach_date`, `vendor_order_id`, `tracking_number`, `delivered_date`
- **Name mismatches**: `qty` → `quantity`, `shipped_date` → `ship_date`, `installed_date` → `install_date`
- **Impact**: All select/insert operations on `replay_signs` fail — entire Replay Signs tab broken
- **Fix**: Add a migration to add missing columns to `replay_signs`, or align code to existing columns

---

### MISMATCH-07 — Invalid enum value `staged` inserted into `replay_signs.status`
- **File**: `src/components/wizard/procurement/ReplaySignFulfillment.tsx:84`
- **Code**: `insert({ ..., status: 'staged' })`
- **Actual enum** (`replay_sign_stage_status`): `ordered, produced, shipped, installed`
- **`staged` is NOT a valid value**
- **Impact**: Insert fails with constraint violation — replay signs record is never created
- **Fix**: Change initial `status: 'staged'` → `status: 'ordered'`, align all status transitions with the DB enum

---

## VERIFIED CORRECT

The following queries were cross-checked and are aligned with the schema:

| File | Table | Status |
|------|-------|--------|
| `bom.ts` | `projects, settings, bom_templates, hardware_catalog, project_bom_items` | ✓ |
| `PoReceiving.tsx` | `purchase_orders, purchase_order_items, inventory_movements` | ✓ (uses hardware_catalog_id, qty_delta) |
| `PoCreateForm.tsx` | `project_bom_items, inventory, purchase_orders, purchase_order_items, inventory_movements` | ✓ |
| `MovementHistory.tsx` | `inventory_movements` | ✓ (uses hardware_catalog_id, qty_delta) |
| `AdjustmentModal.tsx` (inventory update) | `inventory` | ✓ (quantity_on_hand correct) |
| `InventoryCheckPanel.tsx` | `project_bom_items, inventory` | ✓ |
| `BomReviewTable.tsx` | `project_bom_items, hardware_catalog` | ✓ |
| `PackingList.tsx` | `project_bom_items` | ✓ |
| `CcTerminalOrder.tsx` | `cc_terminals` | ✓ |
| `DepositInvoice.tsx` | `invoices` | ✓ |
| `FinalInvoice.tsx` | `invoices` | ✓ |
| `ExpenseTracker.tsx` | `expenses` | ✓ |
| `PnlSummary.tsx` (invoices, expenses) | `invoices, expenses` | ✓ |
| `RecurringFeesTab.tsx` | `recurring_fees` | ✓ |
| `HerCalculation.tsx` | `monthly_opex_snapshots` | ✓ |
| `deployment.tsx` | `projects, deployment_checklist_items` | ✓ |
| `intake.tsx` | `projects, invoices` | ✓ |
| `new.tsx` | `deployment_checklist_templates, deployment_checklist_items, projects` | ✓ |
| `financials/index.tsx` | `projects, invoices, expenses, project_bom_items, monthly_opex_snapshots, recurring_fees` | ✓ |
| `settingsService.ts` | `settings` | ✓ |
| `installersService.ts` | `installers` | ✓ |
| `catalogService.ts` | `hardware_catalog` | ✓ |
| `teamContactsService.ts` | `team_contacts` | ✓ |
| `vendorsService.ts` | `vendors` | ✓ |
| `vendors.tsx (route)` | `vendors` | ✓ |

---

## Summary

**7 mismatches found** across 4 files:

| # | File | Type | Severity |
|---|------|------|----------|
| 01 | GoLive.tsx | Wrong table name | HIGH — runtime error |
| 02 | GoLive.tsx | Missing column (completed_at on projects) | MEDIUM — silent null |
| 03 | procurement.tsx | Wrong column name (service_tier vs tier) | HIGH — display broken |
| 04 | PnlSummary.tsx | Missing column (est_total_cost on project_bom_items) | HIGH — P&L calculations wrong |
| 05 | AdjustmentModal.tsx | Stale column names (item_id, quantity in inventory_movements) | HIGH — insert fails |
| 06 | ReplaySignFulfillment.tsx | Multiple wrong/missing columns on replay_signs | HIGH — entire tab broken |
| 07 | ReplaySignFulfillment.tsx | Invalid enum value 'staged' | HIGH — insert fails |

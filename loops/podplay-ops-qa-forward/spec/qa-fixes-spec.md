# PodPlay Ops — QA Fixes Spec

Consolidated spec for 9 open findings from QA passes 1–2. The app is fully built and passing (971 tests, all routes verified). These are targeted fixes against the existing codebase.

Reference: `apps/podplay/QA-FINDINGS.md`

---

## F01 — Settings > Installers Page

### Problem
Intake wizard's InstallerSelectionStep queries the `installers` table, which exists but has no data and no management UI. Users cannot complete the intake wizard.

### Schema
Table already exists (`00002_core_tables.sql`):
```sql
installers (
  id UUID PK,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  installer_type installer_type NOT NULL,  -- 'podplay_vetted' | 'client_own'
  regions TEXT[],
  hourly_rate NUMERIC(10,2),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Seed Data
New migration — insert default installers:
```sql
INSERT INTO installers (name, company, email, phone, installer_type, regions, hourly_rate, is_active) VALUES
  ('PodPlay Install Team', 'PodPlay', 'installs@podplay.co', NULL, 'podplay_vetted', ARRAY['NCR', 'Calabarzon', 'Central Luzon'], 500.00, true),
  ('External Installer (TBD)', NULL, NULL, NULL, 'client_own', ARRAY[]::TEXT[], NULL, true);
```

### UI Changes
- New route: `src/routes/_auth/settings/installers.tsx`
- New component: `src/components/settings/InstallerSettings.tsx`
- Follow the exact pattern of `TeamSettings.tsx`: table with columns (Name, Company, Type, Regions, Rate, Active), add/edit modal, delete confirmation
- Add "Installers" link to settings sidebar navigation (in the layout that renders the settings nav)

### Acceptance Criteria
- `/settings/installers` renders with 2 seeded rows
- Can add, edit, and delete installers
- Intake wizard InstallerSelectionStep shows seeded installers in dropdown
- Full intake wizard can be completed end-to-end

---

## F03 — ISP Provider Dropdown

### Problem
`IspInfoStep.tsx` uses a freeform text input for ISP provider. Should be a curated dropdown of Philippine ISPs.

### UI Changes
- Replace the freeform `<Input>` for `isp_provider` in `IspInfoStep.tsx` with a `SearchableSelect` component (see F08)
- Options:
  ```
  PLDT Fiber
  Globe Fiber
  Converge Fiber
  Sky Broadband
  Globe LTE
  Smart LTE
  Other
  ```
- When "Other" is selected, reveal a text input for custom ISP name
- Store the selected value (or custom text) in `projects.isp_provider`
- Keep existing Starlink validation (block with warning message)

### Acceptance Criteria
- ISP step shows a searchable dropdown with 7 options
- Selecting "Other" reveals a text field
- Starlink validation still works
- Selected value persists to project record

---

## F04 — Project State Persistence

### Problem
Clicking an existing project in the dashboard always resets the intake wizard to step 1. Wizard uses `useState(0)` with no persistence.

### Schema Changes
New migration:
```sql
ALTER TABLE projects ADD COLUMN wizard_step INTEGER NOT NULL DEFAULT 0;
```

### Logic Changes
**Intake route** (`intake.tsx`):
1. On mount: load `project.wizard_step` from DB, initialize `useState` with that value
2. On step transition: update `projects.wizard_step` via Supabase
3. If `project.project_status` is NOT `'intake'`, redirect to the appropriate page (procurement/deployment/financials) instead of showing the wizard

**Dashboard** (`projects/index.tsx`):
- Clicking a project navigates to the correct page based on `project_status`:
  - `intake` → `/projects/$id/intake` (wizard resumes at saved step)
  - `procurement` → `/projects/$id/procurement`
  - `deployment` → `/projects/$id/deployment`
  - `financial_close` or `completed` → `/projects/$id/financials`

### Acceptance Criteria
- Creating a project → intake wizard starts at step 0
- Navigating away and back → wizard resumes at saved step
- Project in procurement status → clicking from dashboard goes to procurement page, not intake
- Refreshing the page preserves wizard position

---

## F06 — Inventory Seed Data

### Problem
`inventory` table is empty. The `/inventory` page shows an empty state even though 47 hardware catalog items exist.

### Schema Changes
New migration:
```sql
INSERT INTO inventory (item_id, quantity_on_hand, quantity_allocated, reorder_point)
SELECT id, 0, 0, 5
FROM hardware_catalog
WHERE is_active = true
ON CONFLICT (item_id) DO NOTHING;
```

### Acceptance Criteria
- After migration: `/inventory` shows 47 rows, all with qty_on_hand = 0
- Reorder point defaults to 5 for all items
- Procurement > Inventory Check tab also shows populated data

---

## F07 — Inventory Adjustment UI

### Problem
Inventory pages are read-only. No way to manually adjust stock levels (receiving shipments, corrections, etc.).

### Schema
Already exists: `inventory_movements` table with `adjustment_increase` / `adjustment_decrease` movement types.

### UI Changes
**New component**: `src/components/inventory/AdjustmentModal.tsx`
- Trigger: "Adjust" button per row in inventory table
- Modal fields:
  - Direction: Increase / Decrease (radio or toggle)
  - Quantity: number input (positive integer, required)
  - Reason: text input (required)
- On submit:
  1. Insert `inventory_movements` row (movement_type = `adjustment_increase` or `adjustment_decrease`, quantity, notes = reason)
  2. Update `inventory.quantity_on_hand` += or -= quantity
  3. Toast confirmation
  4. Refresh table data

**Apply to both**:
- `/inventory` page (global inventory view)
- Procurement > Inventory Check tab (`InventoryCheckPanel.tsx`)

### Acceptance Criteria
- Each inventory row has an "Adjust" button
- Modal opens with direction, quantity, reason fields
- Submitting creates a movement record and updates on-hand quantity
- Updated quantity reflects immediately in the table
- Works on both `/inventory` and procurement Inventory Check

---

## F08 — Searchable Dropdowns

### Problem
Plain `<select>` elements with no search. The SKU swap dropdown has 47 items, making selection painful.

### UI Changes
**New component**: `src/components/ui/SearchableSelect.tsx`
- Combobox pattern: text input that filters a dropdown list
- Props: `options: { value: string; label: string }[]`, `value`, `onChange`, `placeholder`, `disabled`
- Use Radix UI Popover + Command pattern (already have Radix in deps), or a simple filtered-list approach
- Keyboard accessible: arrow keys to navigate, enter to select, escape to close

**Apply to**:
1. SKU swap dropdown in `BomReviewTable.tsx` (procurement) — 47 items
2. Installer selection in `InstallerSelectionStep.tsx` (intake)
3. ISP provider in `IspInfoStep.tsx` (intake) — see F03
4. Any other `<select>` with more than 10 options

### Acceptance Criteria
- Typing filters the list in real-time
- Keyboard navigation works (up/down/enter/escape)
- Works as drop-in replacement for existing selects
- All 4 locations converted

---

## F09 — Team Contacts Seed Data

### Problem
Current seed has 7 contacts (andy, nico, chad, stan, agustin, cs-team, patrick). Should be exactly 6 core team members.

### Schema Changes
New migration — replace team contacts:
```sql
DELETE FROM team_contacts;

INSERT INTO team_contacts (name, role, department, email, phone, is_active) VALUES
  ('Niko', 'Operations Lead', 'Operations', 'niko@podplay.co', NULL, true),
  ('Chad', 'Technical Lead', 'Engineering', 'chad@podplay.co', NULL, true),
  ('Andy', 'Project Manager', 'Operations', 'andy@podplay.co', NULL, true),
  ('Ernesto', 'Field Installer', 'Operations', 'ernesto@podplay.co', NULL, true),
  ('Carlos', 'Field Installer', 'Operations', 'carlos@podplay.co', NULL, true),
  ('Marco', 'Field Installer', 'Operations', 'marco@podplay.co', NULL, true);
```

### Acceptance Criteria
- `/settings/team` shows exactly 6 contacts
- Old contacts (stan, agustin, cs-team, patrick) are removed
- Roles and departments are reasonable defaults (editable via UI)

---

## F11 — Settings > Vendors Page

### Problem
No vendor management UI. `hardware_catalog.vendor` is freeform TEXT with no reference directory.

### Schema Changes
New migration:
```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  lead_time_days INTEGER,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

Seed with vendors already referenced in hardware_catalog:
```sql
INSERT INTO vendors (name, notes, is_active) VALUES
  ('Ubiquiti', 'Network equipment — UDM, switches, APs, cameras', true),
  ('Apple', 'Mac Mini, Apple TV, iPad', true),
  ('Samsung', 'Displays and TVs', true),
  ('Kisi', 'Access control — controllers and readers', true),
  ('Replay', 'Replay system hardware kits and signs', true),
  ('APC', 'UPS and power protection', true),
  ('Generic', 'Cables, patch panels, mounts, misc hardware', true);
```

**Do NOT add FK from hardware_catalog.vendor → vendors.id.** Keep vendor as TEXT on catalog. The vendors page is a reference directory only.

### UI Changes
- New route: `src/routes/_auth/settings/vendors.tsx`
- New component: `src/components/settings/VendorSettings.tsx`
- Follow `TeamSettings.tsx` pattern: table with columns (Name, Contact, Email, Phone, Website, Lead Time, Active), add/edit modal, delete confirmation
- Add "Vendors" link to settings sidebar navigation

### Acceptance Criteria
- `/settings/vendors` renders with 7 seeded vendor rows
- Can add, edit, and delete vendors
- Settings nav includes Vendors link

---

## F12 — Recurring Fees Tracking

### Problem
No way to track recurring monthly costs per project (Replay license, Starlink, cloud hosting, support retainers). These affect P&L but aren't captured.

### Schema Changes
New migration:
```sql
CREATE TYPE fee_frequency AS ENUM ('monthly', 'quarterly', 'annually');

CREATE TABLE recurring_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(12,2) NOT NULL,
  frequency fee_frequency NOT NULL DEFAULT 'monthly',
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  vendor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_recurring_fees_project ON recurring_fees(project_id);
```

### UI Changes

**Project Financials — new "Recurring Fees" tab** (5th tab in financials wizard step):
- New component: `src/components/wizard/financials/RecurringFeesTab.tsx`
- Table columns: Label, Amount, Frequency, Start Date, End Date, Vendor, Active
- Add/edit modal with all fields
- Delete with confirmation
- Summary row: "Total Monthly Recurring: $X" (normalize quarterly/annually to monthly equivalent)

**Global Financials page** (`/financials`):
- Add a "Recurring Fees" summary section
- Show total monthly recurring across all active projects
- Breakdown by project (project name, fee count, total monthly)

### Acceptance Criteria
- Financials wizard step has 5 tabs (existing 4 + Recurring Fees)
- Can add, edit, delete recurring fees per project
- Monthly equivalent calculation: monthly=amount, quarterly=amount/3, annually=amount/12
- Global financials shows recurring summary across all projects
- Empty state when no recurring fees exist

---

## Dependency Order

Migrations should be applied in this order (each is a separate migration file):

1. `00013_seed_installers.sql` — F01 seed data
2. `00014_wizard_step.sql` — F04 wizard_step column
3. `00015_seed_inventory.sql` — F06 inventory rows
4. `00016_seed_team_contacts.sql` — F09 replace team contacts
5. `00017_vendors_table.sql` — F11 vendors table + seed
6. `00018_recurring_fees.sql` — F12 fee_frequency enum + recurring_fees table

UI work has this dependency chain:
1. F08 (SearchableSelect component) — needed by F03, F01
2. F01 (Installers page) — needed for F04 testing (complete intake flow)
3. F03 (ISP dropdown) — uses SearchableSelect
4. F06 (Inventory seed) — needed for F07 testing
5. F07 (Inventory adjustments) — needs populated inventory
6. F04 (Project state persistence) — needs installers seeded to test full flow
7. F09 (Team contacts seed) — independent
8. F11 (Vendors page) — independent
9. F12 (Recurring fees) — independent

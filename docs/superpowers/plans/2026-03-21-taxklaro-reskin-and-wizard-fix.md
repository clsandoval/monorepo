# TaxKlaro Reskin + Wizard Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dark zinc theme with a clean light Anthropic-docs aesthetic and fix the wizard by removing fake buttons and adding auto-save drafts.

**Architecture:** Swap CSS custom properties for the base theme, then surgically update ~60 files with hardcoded zinc Tailwind classes. Remove Back/Continue buttons from 17 wizard steps. Convert `new.tsx` to a thin redirect that creates a draft and sends the user to the detail page for editing.

**Tech Stack:** React 19, Tailwind CSS 4 (`@theme`), shadcn/ui, TanStack Router, Supabase

**Spec:** `docs/superpowers/specs/2026-03-21-taxklaro-reskin-and-wizard-fix.md`

---

### Task 1: Swap CSS Custom Properties

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace the `@theme` block**

Replace the entire `@theme { ... }` block in `src/index.css` with light-mode values:

```css
@theme {
  --font-sans: 'Inter Variable', 'Inter', system-ui, -apple-system, sans-serif;
  --color-background: #FFFFFF;
  --color-foreground: #1A1A1A;
  --color-surface: #F9FAFB;
  --color-border: #E5E7EB;
  --color-muted: #F3F4F6;
  --color-savings: #16A34A;
  --color-due: #DC2626;
  --color-amber: #D97706;
  --color-primary: #1A1A1A;
  --color-primary-foreground: #FFFFFF;
  --color-secondary: #F3F4F6;
  --color-secondary-foreground: #1A1A1A;
  --color-destructive: #DC2626;
  --color-destructive-foreground: #FFFFFF;
  --color-accent: #F3F4F6;
  --color-accent-foreground: #1A1A1A;
  --color-card: #FFFFFF;
  --color-card-foreground: #1A1A1A;
  --color-popover: #FFFFFF;
  --color-popover-foreground: #1A1A1A;
  --color-muted-foreground: #6B7280;
  --color-input: #E5E7EB;
  --color-ring: #6B7280;
  --radius: 6px;
}
```

- [ ] **Step 2: Run tests**

```bash
cd apps/taxklaro/frontend && npx vitest run
```

- [ ] **Step 3: Commit**

```bash
git add src/index.css && git commit -m "feat(taxklaro): swap theme to light Anthropic-docs aesthetic"
```

---

### Task 2: Update shadcn/ui Components

**Files:** All 20 files in `src/components/ui/`:
`accordion.tsx`, `alert.tsx`, `badge.tsx`, `button.tsx`, `card.tsx`, `checkbox.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `input.tsx`, `progress.tsx`, `radio-group.tsx`, `select.tsx`, `separator.tsx`, `sheet.tsx`, `skeleton.tsx`, `switch.tsx`, `tabs.tsx`, `textarea.tsx`, `tooltip.tsx`

These are the most-imported files in the app. They hardcode zinc classes in variant definitions that won't change from the CSS property swap.

- [ ] **Step 1: Update all shadcn/ui files**

For each file, replace hardcoded zinc classes with semantic equivalents. The general mapping:

| Dark zinc class | Light replacement |
|---|---|
| `bg-zinc-950`, `bg-zinc-900` | `bg-background` or `bg-white` |
| `bg-zinc-800` | `bg-gray-100` or `bg-accent` |
| `bg-zinc-800/50`, `bg-zinc-800/80` | `bg-gray-100/50`, `bg-gray-100/80` |
| `bg-zinc-50` | `bg-gray-900` or `bg-primary` (context-dependent — this was the light color in dark mode) |
| `text-zinc-50` | `text-foreground` or `text-white` (on dark buttons) |
| `text-zinc-400`, `text-zinc-500` | `text-muted-foreground` or `text-gray-500` |
| `text-zinc-200`, `text-zinc-300` | `text-gray-700` or `text-foreground` |
| `text-zinc-900` | `text-foreground` |
| `border-zinc-800`, `border-zinc-700` | `border-border` or `border-gray-200` |
| `ring-zinc-400`, `ring-zinc-300` | `ring-ring` or `ring-gray-400` |
| `hover:bg-zinc-800` | `hover:bg-gray-100` |
| `hover:bg-zinc-900` | `hover:bg-gray-200` |
| `hover:text-zinc-50` | `hover:text-foreground` |
| `focus-visible:ring-zinc-400` | `focus-visible:ring-ring` |
| `data-[state=checked]:bg-zinc-50` | `data-[state=checked]:bg-primary` |
| `placeholder:text-zinc-400` | `placeholder:text-muted-foreground` |

Read each file, understand the context of each zinc class (is it a background? text? border? hover state? active state?), and replace appropriately. The key insight: in dark mode, `zinc-50` was the "light" accent color — in light mode, that role is played by `gray-900` or `primary`.

**Critical files to pay extra attention to:**
- `button.tsx` — has multiple variants (default, secondary, outline, ghost, destructive) each with zinc hardcodes
- `input.tsx` — border and focus states
- `select.tsx` — dropdown styling
- `dialog.tsx` / `sheet.tsx` — overlay backgrounds
- `tabs.tsx` — active/inactive tab states
- `accordion.tsx` — section header styling

- [ ] **Step 2: Run tests**

```bash
cd apps/taxklaro/frontend && npx vitest run
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ && git commit -m "feat(taxklaro): update shadcn/ui components for light theme"
```

---

### Task 3: Update Sidebar for Light Theme

**Files:**
- Modify: `src/components/layout/Sidebar.tsx`

- [ ] **Step 1: Replace all dark classes in Sidebar**

Replace hardcoded dark zinc classes with light equivalents:

| Current | Replacement |
|---|---|
| `bg-zinc-950` | `bg-surface` (or `bg-gray-50`) |
| `border-zinc-800` | `border-border` |
| `text-zinc-50` | `text-foreground` |
| `text-zinc-400` | `text-muted-foreground` |
| `text-zinc-500` | `text-muted-foreground` |
| `text-zinc-200` | `text-foreground` |
| `bg-zinc-800` (active nav) | `bg-gray-200/60` |
| `hover:text-zinc-200` | `hover:text-foreground` |
| `hover:text-zinc-300` | `hover:text-gray-700` |
| `hover:bg-zinc-800/50` | `hover:bg-gray-100` |

Apply to both the desktop sidebar AND the mobile Sheet content.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd apps/taxklaro/frontend && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Sidebar.tsx && git commit -m "feat(taxklaro): update Sidebar for light theme"
```

---

### Task 4: Update Root Layout + Landing + Auth Pages

**Files:**
- Modify: `src/routes/__root.tsx`
- Modify: `src/routes/index.tsx`
- Modify: `src/components/landing/QuickCalculator.tsx`
- Modify: `src/routes/auth.tsx`
- Modify: `src/routes/auth/callback.tsx`
- Modify: `src/routes/auth/reset.tsx`
- Modify: `src/routes/auth/reset-confirm.tsx`
- Modify: `src/routes/onboarding.tsx`
- Modify: `src/components/onboarding/OnboardingForm.tsx`
- Modify: `src/components/layout/PublicHeader.tsx`

- [ ] **Step 1: Update root layout**

In `__root.tsx`, replace `bg-zinc-950 text-zinc-50` with `bg-background text-foreground`.

- [ ] **Step 2: Update landing page + QuickCalculator**

Replace all hardcoded dark classes. Landing page: `bg-zinc-950` → `bg-white`, `text-zinc-50` → `text-foreground`, etc. QuickCalculator: `bg-zinc-900/50` → `bg-gray-50`, `border-zinc-800` → `border-border`, `text-zinc-300` → `text-gray-600`, `text-zinc-500` → `text-muted-foreground`, `text-zinc-400` → `text-muted-foreground`, `text-zinc-200` → `text-foreground`, `bg-zinc-900` → `bg-white`, `border-zinc-700` → `border-gray-300`, `focus-visible:ring-zinc-600` → `focus-visible:ring-ring`.

- [ ] **Step 3: Update auth pages**

`auth.tsx`, `auth/reset.tsx`, `auth/reset-confirm.tsx`, `auth/callback.tsx` — replace dark backgrounds and text colors with light equivalents.

- [ ] **Step 4: Update onboarding page + form**

`onboarding.tsx` and `OnboardingForm.tsx` — replace `bg-zinc-950` with `bg-white`, flip all zinc text/border classes.

- [ ] **Step 5: Update PublicHeader**

Replace dark zinc classes with light equivalents.

- [ ] **Step 6: Run tests**

```bash
cd apps/taxklaro/frontend && npx vitest run
```

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(taxklaro): update public pages for light theme"
```

---

### Task 5: Update Computation Pages + Results Components

**Files:**
- Modify: `src/routes/computations/index.tsx`
- Modify: `src/routes/computations/$compId.tsx`
- Modify: `src/components/computation/ComputationCard.tsx`
- Modify: `src/components/computation/ComputationCardSkeleton.tsx`
- Modify: `src/components/computation/WizardSection.tsx`
- Modify: All files in `src/components/results/` (9 files): `BalancePayableSection.tsx`, `BirFormRecommendation.tsx`, `CollapsibleResultSection.tsx`, `InstallmentSection.tsx`, `PathDetailAccordion.tsx`, `PenaltySummary.tsx`, `PercentageTaxSummary.tsx`, `RegimeComparison.tsx`, `TaxBreakdownPanel.tsx`

- [ ] **Step 1: Update computation route pages**

`computations/index.tsx` and `$compId.tsx` — replace all hardcoded zinc classes.

- [ ] **Step 2: Update computation components**

`ComputationCard.tsx`, `ComputationCardSkeleton.tsx`, `WizardSection.tsx` — replace dark zinc classes.

- [ ] **Step 3: Update all results components**

For each of the 9 results files, replace `zinc-900/30` → `gray-100`, `zinc-800` → `border-border`, `zinc-50` → `text-foreground`, `zinc-400` → `text-muted-foreground`, `zinc-500` → `text-muted-foreground`, etc.

- [ ] **Step 4: Run tests**

```bash
cd apps/taxklaro/frontend && npx vitest run
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(taxklaro): update computation pages and results for light theme"
```

---

### Task 6: Update Remaining Pages + Shared Components

**Files:**
- Modify: `src/routes/deadlines.tsx`
- Modify: `src/routes/settings/index.tsx`
- Modify: `src/routes/settings/team.tsx`
- Modify: `src/routes/share/$token.tsx`
- Modify: `src/routes/invite/$token.tsx`
- Modify: `src/components/deadlines/DeadlineCard.tsx`
- Modify: `src/components/settings/BirInfoSection.tsx`
- Modify: `src/components/settings/FirmBrandingSection.tsx`
- Modify: `src/components/settings/InviteMemberForm.tsx`
- Modify: `src/components/settings/MembersTable.tsx`
- Modify: `src/components/settings/PendingInvitationsTable.tsx`
- Modify: `src/components/settings/PersonalInfoSection.tsx`
- Modify: `src/components/shared/ListRow.tsx`
- Modify: `src/components/shared/PesoInput.tsx`
- Modify: `src/components/shared/Spinner.tsx`

- [ ] **Step 1: Update deadlines page + card**

Replace dark zinc classes in `deadlines.tsx` and `DeadlineCard.tsx`.

- [ ] **Step 2: Update settings pages + components**

Replace dark zinc classes in all settings files (route pages + 5 component files).

- [ ] **Step 3: Update share + invite pages**

`share/$token.tsx`, `invite/$token.tsx` — replace dark backgrounds.

- [ ] **Step 4: Update shared components**

`ListRow.tsx`, `PesoInput.tsx`, `Spinner.tsx` — replace dark zinc classes.

- [ ] **Step 5: Run tests**

```bash
cd apps/taxklaro/frontend && npx vitest run
```

- [ ] **Step 6: Verify no remaining zinc-7/8/9 classes**

```bash
grep -r 'zinc-[789]' src/ --include='*.tsx' --include='*.ts' | grep -v __tests__ | grep -v node_modules
```

Expected: No output (all dark zinc classes replaced). Test files may still reference zinc for snapshot assertions — update those too if found.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(taxklaro): update remaining pages and shared components for light theme"
```

---

### Task 7: Update Wizard Steps with Light Theme + Fix Zinc in Step Files

**Files:** All 5 wizard step files that have hardcoded zinc classes:
- Modify: `src/components/wizard/WS00ModeSelection.tsx`
- Modify: `src/components/wizard/WS01TaxpayerProfile.tsx`
- Modify: `src/components/wizard/WS02BusinessType.tsx`
- Modify: `src/components/wizard/WS06ExpenseMethod.tsx`
- Modify: `src/components/wizard/WS11RegimeElection.tsx`

- [ ] **Step 1: Replace zinc classes in wizard steps**

These 5 files have hardcoded zinc classes for radio card styling, text, borders. Replace with light equivalents following the same mapping as other tasks.

- [ ] **Step 2: Run tests**

```bash
cd apps/taxklaro/frontend && npx vitest run
```

- [ ] **Step 3: Commit**

```bash
git add src/components/wizard/ && git commit -m "feat(taxklaro): update wizard step styles for light theme"
```

---

### Task 8: Remove Fake Back/Continue Buttons from Wizard Steps

**Files:** All 17 wizard step files in `src/components/wizard/WS*.tsx` + `AccordionWizard.tsx`

- [ ] **Step 1: Update AccordionWizard.tsx**

- Remove the `noop` handler
- Stop passing `onNext` and `onBack` props to step components
- Remove `onNext`/`onBack` from the step component type in `STEP_COMPONENTS`

- [ ] **Step 2: Remove button blocks from all 17 step files**

For each `WS*.tsx` file:
1. Remove the `onNext`/`onBack` props from the component signature
2. Remove any `handleNext` function that calls `onNext`
3. Remove the `<div className="flex justify-between">` block containing Back/Continue/Skip buttons
4. Keep all form fields, validation messages, and inline alerts

Standard pattern to remove:
```tsx
// Remove this block (and any handleNext/handleSkip functions that only call onNext):
<div className="flex justify-between">
  <Button variant="outline" onClick={onBack} className="h-11 px-5">Back</Button>
  <Button onClick={handleNext} className="h-11 px-6">Continue</Button>
</div>
```

Special cases:
- `WS07CDepreciation.tsx` — also has a "Skip" button, remove it too
- `WS07DNolco.tsx` — conditional Skip button, remove entire block
- `WS09PriorQuarterly.tsx` — has TWO button blocks (for different conditions), remove both

For steps where `handleNext` does validation AND calls `onNext`, keep the validation logic but remove the `onNext()` call and the button. Trigger validation on field change/blur instead.

- [ ] **Step 3: Delete dead wizard step files**

```bash
rm -rf src/components/wizard/steps/
```

- [ ] **Step 4: Run tests**

```bash
cd apps/taxklaro/frontend && npx vitest run
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(taxklaro): remove fake Back/Continue buttons from wizard steps"
```

---

### Task 9: Auto-Save Draft — Convert new.tsx to Thin Redirect

**Files:**
- Modify: `src/routes/computations/new.tsx`
- Modify: `src/lib/computations.ts` (if `createComputation` needs `status` param)

- [ ] **Step 1: Check DB default for computation status**

Read `src/lib/computations.ts` to see how `createComputation` works. Check if it passes `status` or relies on DB default. If needed, add explicit `status: 'draft'` to the insert.

- [ ] **Step 2: Rewrite new.tsx as thin redirect**

Replace the full wizard page with a simple component that:
1. Calls `createComputation(orgId, null, 'Untitled Computation', createDefaultTaxpayerInput())` with `status: 'draft'`
2. Navigates to `/computations/$compId` with the new record's ID
3. Shows a loading spinner while creating

Remove the inline `AccordionWizard`, `ResultsView`, `useCompute`, and all wizard state management from this file.

```tsx
function ComputationsNewPage() {
  const navigate = useNavigate();
  const { orgId } = useOrganization();
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!orgId || creating) return;
    setCreating(true);

    const input = createDefaultTaxpayerInput();
    createComputation(orgId, null, 'Untitled Computation', input).then((record) => {
      if (record) {
        navigate({ to: '/computations/$compId', params: { compId: record.id }, replace: true });
      }
    });
  }, [orgId, navigate, creating]);

  return (
    <CenteredColumn wide>
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    </CenteredColumn>
  );
}
```

- [ ] **Step 3: Run tests**

```bash
cd apps/taxklaro/frontend && npx vitest run
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(taxklaro): convert new.tsx to auto-save draft redirect"
```

---

### Task 10: Update Wiring Tests + Final Verification

**Files:**
- Modify: `src/__tests__/wiring.test.ts`
- Modify: `src/__tests__/ui-states.test.ts`

- [ ] **Step 1: Update test files**

If any test files reference deleted files (e.g., `wizard/steps/`) or have zinc-specific assertions, update them.

- [ ] **Step 2: Run full test suite**

```bash
cd apps/taxklaro/frontend && npx vitest run
```

- [ ] **Step 3: Run TypeScript check**

```bash
cd apps/taxklaro/frontend && npx tsc --noEmit
```

- [ ] **Step 4: Final grep for zinc stragglers**

```bash
grep -r 'zinc-[789]' src/ --include='*.tsx' --include='*.ts' | grep -v node_modules
```

Expected: No remaining dark zinc classes (except possibly in test snapshot strings, which should also be updated).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "test(taxklaro): update tests for light theme and wizard changes"
```

---

### Task 11: Browser Smoke Test

- [ ] **Step 1: Start dev server**

```bash
cd apps/taxklaro/frontend && npm run dev
```

- [ ] **Step 2: Verify landing page**

- Open localhost — should be white/light background
- Calculator form should have light card styling, subtle borders
- Sign In / Create Account buttons visible and styled
- Test calculator: enter 500000, click Calculate — results should render with light styling

- [ ] **Step 3: Verify auth pages**

- Sign In page — light background, clean form
- Create Account page — same
- Reset password page — same

- [ ] **Step 4: Verify authenticated layout**

- Sign in — sidebar should be light gray, dark text
- Computations list — clean light table/cards
- Click + New — should redirect to a new draft computation detail page (not the old wizard page)
- Accordion sections should have NO Back/Continue buttons
- Fill in some fields, navigate away, come back — data should persist (auto-save)

- [ ] **Step 5: Verify all other pages**

- Deadlines — light styling
- Settings — all sections light
- Computation detail (results tab) — regime comparison, tax breakdown all light
- Share page — light
- Mobile layout (resize to <768px) — hamburger menu, sheet, all light

- [ ] **Step 6: Commit any fixes found during smoke test**

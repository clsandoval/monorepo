# Landing Page Quick Calc Widget

## Problem

The inheritance calculator landing page has three issues:
1. The "try without an account" link goes to `/cases/new` which has an auth guard — it just redirects to sign in
2. There's no way for a visitor to experience the product before creating an account
3. The landing page hero CTAs (Create Account / Sign In) are passive — they tell users what the tool does but don't let them try it

## Solution

Replace the hero CTAs with an inline quick calc widget that lets visitors run one free inheritance calculation directly from the landing page. Show partial results (headline distribution numbers visible, detailed breakdown blurred behind a signup wall). This serves as the product hook — visitors experience the value before committing to an account.

## Design

### Landing Page Layout

The current hero section restructures to:
- **Top:** "Philippine Succession Law" badge + "Estate Distribution Made Simple" headline + subtitle (unchanged)
- **Middle:** Quick calc widget replaces the "Create Account" / "Sign In" / "try without an account" CTAs
- **Bottom:** Three feature cards (All Succession Types, Full Family Tree, Professional PDF) remain as-is

### Quick Calc Widget

A compact inline form in the hero area.

**Inputs:**
- **Estate amount** — currency input field (Philippine Peso)
- **Heir list** — starts empty. "Add Heir" button opens a dropdown with relationship types:
  - Surviving Spouse
  - Legitimate Child
  - Illegitimate Child
  - Father
  - Mother
  - Brother
  - Sister
- Each added heir appears as a removable pill/chip. Multiple children/siblings allowed.
- **"Calculate" button** — triggers WASM computation

**Engine defaults (not exposed to user):**
- Succession type: Intestate (no will input)
- Married: true if spouse is present
- Date of death: `new Date().toISOString().slice(0, 10)` (YYYY-MM-DD)
- Date of marriage: `"2000-01-01"` (arbitrary past date, required when `is_married: true`)
- No donations
- Decedent name: `"Decedent"` (placeholder — min 1 char required by schema)
- Heir names auto-generated (e.g., "Child 1", "Child 2")

**Per-relationship Person defaults (required by `PersonSchema` validation):**

| Relationship | `relationship_to_decedent` | `degree` | `line` | `filiation_proved` | `filiation_proof_type` | `blood_type` |
|---|---|---|---|---|---|---|
| Surviving Spouse | `SurvivingSpouse` | 1 | null | false | null | null |
| Legitimate Child | `LegitimateChild` | 1 | null | false | null | null |
| Illegitimate Child | `IllegitimateChild` | 1 | null | **true** | **`BirthCertificate`** | null |
| Father | `LegitimateParent` | 1 | **`Paternal`** | false | null | null |
| Mother | `LegitimateParent` | 1 | **`Maternal`** | false | null | null |
| Brother | `Sibling` | 2 | null | false | null | **`Full`** |
| Sister | `Sibling` | 2 | null | false | null | **`Full`** |

All persons also get: `is_alive_at_succession: true`, `children: []`, `is_guilty_party_in_legal_separation: false`, `adoption: null`, `is_unworthy: false`, `unworthiness_condoned: false`, `has_renounced: false`.

**Cardinality constraints:** max 1 Surviving Spouse, max 1 Father, max 1 Mother. Unlimited children and siblings. Enforce in the "Add Heir" dropdown by disabling options that are at max.

**Brother/Sister note:** Both map to `Sibling` — the distinction is cosmetic (display label only).

**Results (inline, below the form):**
- **Visible:** Succession type badge (Intestate), scenario code, summary table showing each heir's `heir_name`, category (via `EFFECTIVE_CATEGORY_LABELS`), `total` amount (via `formatPeso()`), and computed percentage (`total / estate * 100`)
- **Blurred:** Detailed narrative explanations, computation log, family tree visualization — frosted glass overlay with centered CTA: "Create an account to see the full breakdown" + signup button

### Input Validation

- **Estate amount:** must be > 0. Disable Calculate button when empty or zero. Convert pesos to centavos via `pesosToCentavos()` from `src/types/index.ts`.
- **Heirs:** require at least one heir before enabling Calculate button. Zero heirs produces an escheat scenario that would confuse visitors.
- **Pre-compute validation:** run `EngineInputSchema.safeParse()` before calling `computeWasm()`. Surface Zod validation errors as user-friendly messages rather than letting the Rust engine return opaque errors.

### One Free Calculation Per Session

- First **successful** "Calculate" sets the `sessionStorage` flag. Failed computations (validation errors, WASM failures) do not count.
- Subsequent calculation attempts show a signup prompt: "Create an account for unlimited calculations"
- Tracked via `sessionStorage` flag — lightweight, no backend needed
- Intentionally easy to bypass (clear storage) — this is a hook, not DRM

### WASM Loading

- WASM module lazy-loads on first "Calculate" click, not on page load
- Show a loading spinner while WASM initializes (first calc only)
- Reuses existing `computeWasm()` from `src/wasm/bridge.ts`
- On WASM load failure, show error: "Unable to load calculator. Please try again or create an account."

### "Try Without an Account" Link

Removed entirely. The quick calc widget replaces its purpose. The broken `/cases/new` link for unauthed users is eliminated.

### Auth Guard / Routing

No changes. `/cases/new` and all `/cases/*` routes keep their auth guards. The quick calc is entirely self-contained within the landing page index route (`/`).

## What's NOT Changing

- Full 6-step wizard flow (stays behind auth)
- Signup/signin forms and auth flow
- Auth guards on `/cases/*` routes
- `ResultsView` component for authenticated cases
- Any backend / Supabase configuration
- Feature cards section

## Key Files

| File | Change |
|------|--------|
| `src/routes/index.tsx` | Replace hero CTAs with quick calc widget, add results display with blur gate |
| `src/components/quick-calc/QuickCalcWidget.tsx` | New — input form (estate amount + heir chips + calculate button) |
| `src/components/quick-calc/QuickCalcResults.tsx` | New — partial results display with blur overlay |
| `src/wasm/bridge.ts` | No changes — reuse existing `computeWasm()` |
| `src/components/quick-calc/defaults.ts` | New — per-relationship Person defaults table, Decedent template, EngineInput builder |
| `src/types/index.ts` | No changes — reuse existing `EngineInput` / `EngineOutput` types |

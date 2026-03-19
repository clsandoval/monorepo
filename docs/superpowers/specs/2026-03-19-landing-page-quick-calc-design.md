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
- Date of death: today
- No donations
- No decedent name (or placeholder)
- Heir names auto-generated (e.g., "Child 1", "Child 2")

**Results (inline, below the form):**
- **Visible:** Succession type badge (Intestate), scenario code, summary table showing each heir and their percentage/amount share
- **Blurred:** Detailed narrative explanations, computation log, family tree visualization — frosted glass overlay with centered CTA: "Create an account to see the full breakdown" + signup button

### One Free Calculation Per Session

- First "Calculate" click runs the WASM engine and shows partial results
- Subsequent calculation attempts (modifying inputs + clicking Calculate again) show a signup prompt instead: "Create an account for unlimited calculations"
- Tracked via `sessionStorage` flag — lightweight, no backend needed
- Intentionally easy to bypass (clear storage) — this is a hook, not DRM

### WASM Loading

- WASM module lazy-loads on first "Calculate" click, not on page load
- Show a loading spinner while WASM initializes (first calc only)
- Reuses existing `computeWasm()` from `src/wasm/bridge.ts`

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
| `src/types/index.ts` | No changes — reuse existing `EngineInput` / `EngineOutput` types |

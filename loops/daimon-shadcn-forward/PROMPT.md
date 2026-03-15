# Forward Ralph Loop — Daimon SaaS: shadcn/ui Migration + Exhaustive QA

You are running in `--print` mode. You MUST output text describing what you are doing. If you only make tool calls without outputting text, your output is lost and the loop operator cannot see progress. Always:
1. Start by printing which stage you detected and what you're about to do
2. Print progress as you work
3. End with a summary of what you did and whether you committed

You are a development agent in a forward ralph loop. Each iteration, you do ONE stage of work, commit, and exit.

## Your Working Directories

- **Loop dir**: `loops/daimon-shadcn-forward/` (frontier, status)
- **App dir**: `apps/daimon-saas/` (the Next.js app you're migrating)
- **Supabase ref**: `tgeltzjcufdqmltuvbkd` (production Supabase project)

## App Context

Daimon SaaS is a multi-tenant Next.js 16 app with Supabase Auth + Stripe billing. It has:
- 55 custom UI components in `src/components/`
- 31 page routes in `src/app/`
- Brand colors: teal `#B4E7DD`, dark blue `#0C1F40`, lavender `#9FAAE2`
- Font stack: Archivo (headings), Inter (body)
- Currently zero shadcn/ui — all custom Tailwind + inline styles + one Radix dropdown

## What To Do This Iteration

1. **Read the frontier**: Open `loops/daimon-shadcn-forward/frontier/stages.md`
2. **Find the first unchecked stage** (line starting with `- [ ]`)
3. **Identify which priority applies** based on the stage's category tag
4. **Do the work for that ONE stage**
5. **Mark the stage as done**: Change `- [ ]` to `- [x]` and append the date
6. **Commit** all changes with message: `forward(daimon-shadcn): stage {N} — {description}`
7. **Check convergence**: If ALL stages are checked, write `loops/daimon-shadcn-forward/status/converged.txt` with the date

## Priority System

Pick the FIRST priority that matches the stage's category tag:

### Priority 1 — INSTALL `[scaffold]`
Bootstrap shadcn/ui into the project:
- Run `npx shadcn@latest init` with the Daimon theme
- Configure `components.json` with correct paths
- Set up CSS variables mapping Daimon brand colors to shadcn's variable system
- Install component batches via `npx shadcn@latest add <component>`
- Fix the signup bug in `src/app/actions/createTenant.ts` (remove tenant_subscriptions insert — free tier has no subscription row)

After scaffold stages: `npm run build` must pass.

Commit: `forward(daimon-shadcn): stage {N} — {description}`
Exit.

### Priority 2 — REPLACE `[replace-primitive]` / `[replace-layout]` / `[replace-domain]` / `[replace-page]`
Migrate one component or page from custom to shadcn:

**For `[replace-primitive]`:**
- Read the existing custom component in `src/components/ui/`
- Replace its implementation with the shadcn equivalent
- Preserve the exact same export name and props interface (or update all import sites)
- Delete any inline `style={}` — use shadcn's `className` + `cn()` utility
- Run `grep -r` to find all files importing this component, update if the API changed

**For `[replace-layout]`:**
- Rebuild the layout component using shadcn primitives (Sheet for mobile nav, Card for containers, etc.)
- Keep the same component name and export
- Ensure responsive behavior matches or improves on the original

**For `[replace-domain]`:**
- Swap internal primitives to shadcn (e.g., custom Button → shadcn Button)
- Keep business logic untouched
- Remove all inline `style={}` objects

**For `[replace-page]`:**
- Convert pages with heavy inline styles to use shadcn components
- Replace raw HTML `<input>`, `<button>`, `<select>` with shadcn equivalents
- Convert inline style objects to Tailwind classes using shadcn's design tokens

After each replacement: `npm run build` must pass. If build fails, fix before committing.

Commit: `forward(daimon-shadcn): stage {N} — {description}`
Exit.

### Priority 3 — VERIFY `[desktop-verify]` / `[mobile-verify]` / `[tablet-verify]`
Run Playwright to verify a route renders correctly:

**Setup (if not already done):**
```bash
cd apps/daimon-saas
npx playwright install chromium --with-deps 2>/dev/null || true
```

**For each route in the stage:**
1. Start the dev server: `npm run dev &` (if not running)
2. Use Playwright MCP or write a test in `e2e/` to:
   - Navigate to the URL
   - Wait for page load (networkidle or specific selector)
   - Assert no console errors (filter out known noise like React hydration warnings)
   - Assert page title or heading matches expected
   - Assert no 500/404 errors
   - Take a screenshot
3. For `[mobile-verify]`: set viewport to 375x812, additionally assert:
   - No horizontal scrollbar (`document.documentElement.scrollWidth <= document.documentElement.clientWidth`)
   - Body text >= 14px
4. For `[tablet-verify]`: set viewport to 768x1024

**For authenticated routes** (`/dashboard/*`, `/admin/*`):
- Sign in first via Supabase Auth API using test credentials:
  - Email: `cl@sandoval.dev`
  - Password: `daimon-admin-2026!`
- Set the auth cookie/session before navigating

If a page fails verification:
- Fix the issue (layout bug, missing import, broken component)
- Re-verify
- Note what was fixed in the commit message

Commit: `forward(daimon-shadcn): stage {N} — {description}`
Exit.

### Priority 4 — INTERACTIVE QA `[interactive-qa]`
Test specific interactive behaviors via Playwright:

1. Start dev server if needed
2. Navigate to the page containing the component
3. Perform the interaction (click, type, keyboard nav, etc.)
4. Assert the expected behavior (state change, DOM update, focus movement)
5. If something is broken, fix the component and re-test

For authenticated interactions, sign in first (same credentials as verify stages).

Commit: `forward(daimon-shadcn): stage {N} — {description}`
Exit.

### Priority 5 — FLOW QA `[flow-qa]`
Test end-to-end user journeys via Playwright:

1. Start dev server
2. Execute the full flow as described in the stage
3. Assert each step succeeds before proceeding to the next
4. If any step fails, fix the issue and restart the flow

These are the most complex stages — they may require fixing multiple components.

Commit: `forward(daimon-shadcn): stage {N} — {description}`
Exit.

### Priority 6 — ACCESSIBILITY QA `[a11y-qa]`
Test accessibility requirements via Playwright:

1. Navigate to the page(s)
2. Programmatically verify the requirements listed in the stage
3. Fix any violations found
4. Re-verify after fixes

Commit: `forward(daimon-shadcn): stage {N} — {description}`
Exit.

### Priority 7 — ERROR STATE QA `[error-qa]`
Test error states and edge cases:

1. Navigate to the page
2. Simulate the error condition described in the stage
3. Verify graceful handling (error message shown, no crash, no blank page)
4. Fix any issues

Commit: `forward(daimon-shadcn): stage {N} — {description}`
Exit.

### Priority 8 — CONSISTENCY QA `[consistency-qa]`
Verify cross-page consistency:

1. Grep/scan as described in the stage
2. Fix any violations found
3. Re-verify

Commit: `forward(daimon-shadcn): stage {N} — {description}`
Exit.

### Priority 9 — DISCOVERY `[discovery]`
Hunt for remaining issues:

1. Run the grep/scan described in the stage
2. If issues found: fix them, add new stages if needed (append to stages.md)
3. If no issues found: mark as complete

Commit: `forward(daimon-shadcn): stage {N} — {description}`
Exit.

## Daimon Brand → shadcn CSS Variables Mapping

When configuring shadcn, map these colors to CSS variables:

```css
:root {
  /* Daimon brand tokens */
  --background: 0 0% 97%;        /* #F7F7F7 — page background */
  --foreground: 213 54% 16%;     /* #0C1F40 — primary text */
  --card: 0 0% 100%;             /* #FFFFFF */
  --card-foreground: 213 54% 16%;
  --primary: 163 53% 81%;        /* #B4E7DD — teal accent */
  --primary-foreground: 213 54% 16%;
  --secondary: 231 52% 75%;      /* #9FAAE2 — lavender */
  --secondary-foreground: 213 54% 16%;
  --muted: 213 54% 16% / 0.06;
  --muted-foreground: 213 54% 16% / 0.55;
  --accent: 163 53% 81%;
  --accent-foreground: 213 54% 16%;
  --destructive: 0 84% 60%;      /* #DC2626 */
  --destructive-foreground: 0 0% 100%;
  --border: 213 54% 16% / 0.15;
  --input: 213 54% 16% / 0.2;
  --ring: 163 53% 81%;
  --radius: 0rem;                /* Daimon uses sharp corners */
}
```

Font configuration in `tailwind.config.ts` or `app/layout.tsx`:
- `--font-sans`: `'Inter', sans-serif`
- `--font-heading`: `'Archivo', sans-serif`

## Rules

- Do ONE stage per iteration, then commit and exit.
- Never skip the build check after implementation stages — `npm run build` must pass.
- For QA stages: if you can't start the dev server, try `npm run build && npm start` instead.
- Don't modify business logic — only swap UI primitives and styling.
- Preserve all existing functionality — this is a migration, not a rewrite.
- When replacing a component, update ALL import sites across the codebase.
- Don't delete the old component file until all imports are updated and build passes.
- For Playwright tests: use `page.waitForLoadState('networkidle')` or wait for a specific selector. Don't rely on arbitrary timeouts.
- If a stage is blocked (e.g., dependency not installed), fix the blocker as part of the stage.
- Auth cookie for Playwright: sign in via `supabase.auth.signInWithPassword()` and set the `sb-tgeltzjcufdqmltuvbkd-auth-token` cookie.

## Commit Convention

```
forward(daimon-shadcn): stage {N} — {description}
```

Always include what was done and any fixes applied.

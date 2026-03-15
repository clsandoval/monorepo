# Daimon SaaS — shadcn/ui Migration Stages

Total: 215 stages
Completed: 55
Remaining: 160

---

## Scaffold (stages 1–5) `[scaffold]`

- [x] **Stage 1**: Install shadcn/ui CLI, run `npx shadcn@latest init`, configure `components.json` with `src/components/ui` path alias, set up Daimon CSS variables in `globals.css`, add `cn()` utility to `src/lib/utils.ts` (2026-03-15)
- [x] **Stage 2**: Fix signup bug — remove `tenant_subscriptions` insert from `src/app/actions/createTenant.ts` (free tier has no subscription row; the NOT NULL constraint on `stripe_subscription_id` causes the insert to fail, breaking the entire signup flow) (2026-03-15)
- [x] **Stage 3**: Install shadcn primitives batch 1 — `npx shadcn@latest add button input label checkbox badge card` (2026-03-15)
- [x] **Stage 4**: Install shadcn primitives batch 2 — `npx shadcn@latest add dialog dropdown-menu select tabs table toggle toast skeleton separator` (2026-03-15)
- [x] **Stage 5**: Install shadcn primitives batch 3 — `npx shadcn@latest add alert tooltip avatar sheet command pagination switch textarea popover` (2026-03-15)

## Replace UI Primitives (stages 6–29) `[replace-primitive]`

- [x] **Stage 6**: Replace `src/components/ui/button.tsx` — swap custom button with shadcn Button, preserve all variant names (primary, secondary, ghost, danger → destructive), update all 40+ import sites (2026-03-15)
- [x] **Stage 7**: Replace `src/components/ui/form-input.tsx` — swap with shadcn Input + Label composition, preserve react-hook-form integration, update all import sites (2026-03-15)
- [x] **Stage 8**: Replace `src/components/ui/password-input.tsx` — rebuild with shadcn Input + eye toggle button, preserve show/hide functionality (2026-03-15)
- [x] **Stage 9**: Replace `src/components/ui/search-input.tsx` — rebuild with shadcn Input + search icon, preserve clear button (2026-03-15)
- [x] **Stage 10**: Replace `src/components/ui/api-key-input.tsx` — rebuild with shadcn Input + copy-to-clipboard, preserve masked display (2026-03-15)
- [x] **Stage 11**: Replace `src/components/ui/checkbox.tsx` — swap with shadcn Checkbox, update all import sites (2026-03-15)
- [x] **Stage 12**: Replace `src/components/ui/toggle.tsx` — swap with shadcn Switch, update all import sites (2026-03-15)
- [x] **Stage 13**: Replace `src/components/ui/select.tsx` — swap with shadcn Select, update all import sites (2026-03-15)
- [x] **Stage 14**: Replace `src/components/ui/dropdown-menu.tsx` — swap with shadcn DropdownMenu (already Radix-based, align API), update all import sites (2026-03-15)
- [x] **Stage 15**: Replace `src/components/ui/badge.tsx` — swap with shadcn Badge, preserve variant names, update all import sites (2026-03-15)
- [x] **Stage 16**: Replace `src/components/ui/modal.tsx` — swap with shadcn Dialog, update all import sites (2026-03-15)
- [x] **Stage 17**: Replace `src/components/ui/confirm-dialog.tsx` — rebuild with shadcn AlertDialog, preserve onConfirm/onCancel callbacks (2026-03-15)
- [x] **Stage 18**: Replace `src/components/ui/table.tsx` — swap with shadcn Table (Table, TableBody, TableCell, TableHead, TableHeader, TableRow), update all import sites (2026-03-15)
- [x] **Stage 19**: Replace `src/components/ui/tabs.tsx` — swap with shadcn Tabs, update all import sites (2026-03-15)
- [x] **Stage 20**: Replace `src/components/ui/pagination.tsx` — swap with shadcn Pagination, update all import sites (2026-03-15)
- [x] **Stage 21**: Replace `src/components/ui/toast.tsx` — swap with shadcn Toast + Toaster + useToast hook, update all import sites (2026-03-15)
- [x] **Stage 22**: Replace `src/components/ui/alert-banner.tsx` — swap with shadcn Alert, preserve variant names (info, warning, error, success), update all import sites (2026-03-15)
- [x] **Stage 23**: Replace `src/components/ui/skeleton-loader.tsx` — swap with shadcn Skeleton, update all import sites (2026-03-15)
- [x] **Stage 24**: Replace `src/components/ui/stat-card.tsx` — rebuild with shadcn Card, preserve metric display layout (2026-03-15)
- [x] **Stage 25**: Replace `src/components/ui/status-indicator.tsx` — rebuild with shadcn Badge + dot indicator pattern (2026-03-15)
- [x] **Stage 26**: Replace `src/components/ui/copy-to-clipboard.tsx` — rebuild with shadcn Button + Tooltip for feedback (2026-03-15)
- [x] **Stage 27**: Replace `src/components/ui/empty-state.tsx` — rebuild with shadcn Card + centered content pattern (2026-03-15)
- [x] **Stage 28**: Replace `src/components/ui/error-state.tsx` — rebuild with shadcn Alert (destructive) + Button for retry (2026-03-15)
- [x] **Stage 29**: Replace `src/components/ui/icon-button.tsx` — replace with shadcn Button variant="ghost" size="icon", update all import sites (2026-03-15)
- [x] **Stage 30**: Replace `src/components/ui/link.tsx` — simplify to thin wrapper or remove if trivial, update all import sites (2026-03-15)
- [x] **Stage 31**: Replace `src/components/ui/activity-feed.tsx` — rebuild with shadcn Card + list pattern (2026-03-15)

## Replace Layout Components (stages 32–42) `[replace-layout]`

- [x] **Stage 32**: Replace `src/components/layout/sidebar.tsx` — rebuild with shadcn Sheet (mobile) + nav pattern (desktop), preserve icon-only tablet collapse, preserve all nav links (2026-03-15)
- [x] **Stage 33**: Replace `src/components/layout/dashboard-layout.tsx` — rebuild wrapper using shadcn primitives, integrate new sidebar, preserve impersonation banner (2026-03-15)
- [x] **Stage 34**: Replace `src/components/layout/dashboard-topbar.tsx` — rebuild with shadcn primitives, preserve breadcrumbs/title (2026-03-15)
- [x] **Stage 35**: Replace `src/components/layout/public-navbar.tsx` — rebuild with shadcn NavigationMenu or custom nav using shadcn Button/Sheet (2026-03-15)
- [x] **Stage 36**: Replace `src/components/layout/public-footer.tsx` — rebuild with shadcn primitives, preserve link structure (2026-03-15)
- [x] **Stage 37**: Replace `src/components/layout/public-layout.tsx` — rebuild wrapper using new navbar + footer (2026-03-15)
- [x] **Stage 38**: Replace `src/components/layout/auth-layout.tsx` — rebuild with shadcn Card for auth card container (2026-03-15)
- [x] **Stage 39**: Replace `src/components/layout/auth-card.tsx` — rebuild with shadcn Card, preserve CI stripe accent (2026-03-15)
- [x] **Stage 40**: Replace `src/components/layout/admin-layout.tsx` — rebuild with shadcn primitives, preserve admin nav (2026-03-15)
- [x] **Stage 41**: Replace `src/components/layout/page-shell.tsx` — rebuild with shadcn container pattern (2026-03-15)
- [x] **Stage 42**: Replace `src/components/layout/progress-bar.tsx` — keep next-nprogress-bar but style with Daimon theme colors (2026-03-15)

## Replace Domain Components (stages 43–61) `[replace-domain]`

- [x] **Stage 43**: Replace `src/components/dashboard/dashboard-status-cards.tsx` — swap internals to shadcn Card + Badge (2026-03-15)
- [x] **Stage 44**: Replace `src/components/dashboard/onboarding-checklist.tsx` — rebuild with shadcn Card + Checkbox + progress pattern (2026-03-15)
- [x] **Stage 45**: Replace `src/components/dashboard/quick-stats-row.tsx` — swap internals to shadcn Card (2026-03-15)
- [x] **Stage 46**: Replace `src/components/billing/current-plan-card.tsx` — rebuild with shadcn Card + Badge + Button (2026-03-15)
- [x] **Stage 47**: Replace `src/components/billing/plan-comparison-grid.tsx` — rebuild with shadcn Card grid + Table for feature comparison (2026-03-15)
- [x] **Stage 48**: Replace `src/components/billing/api-key-section.tsx` — rebuild with shadcn Card + Input + Button + Dialog (2026-03-15)
- [x] **Stage 49**: Replace `src/components/billing/billing-alert-banners.tsx` — rebuild with shadcn Alert variants (2026-03-15)
- [x] **Stage 50**: Replace `src/components/billing/checkout-return-banner.tsx` — rebuild with shadcn Alert (success variant) (2026-03-15)
- [x] **Stage 51**: Replace `src/components/billing/subscription-lifecycle-watcher.tsx` — swap any UI elements to shadcn (this may be logic-only) (2026-03-15)
- [x] **Stage 52**: Replace `src/components/integrations/discord-connection-card.tsx` — rebuild with shadcn Card + Badge + Button (2026-03-15)
- [x] **Stage 53**: Replace `src/components/integrations/service-grid.tsx` — rebuild with shadcn Card grid (2026-03-15)
- [x] **Stage 54**: Replace `src/components/settings/account-section.tsx` — rebuild with shadcn Card + Input + Button + Label (2026-03-15)
- [x] **Stage 55**: Replace `src/components/settings/workspace-section.tsx` — rebuild with shadcn Card + Input + Button + Label (2026-03-15)
- [x] **Stage 56**: Replace `src/components/settings/discord-section.tsx` — rebuild with shadcn Card + Badge + Button (2026-03-15)
- [x] **Stage 57**: Replace `src/components/settings/danger-zone-section.tsx` — rebuild with shadcn Card (destructive border) + AlertDialog for confirmation (2026-03-15)
- [x] **Stage 58**: Replace `src/components/landing/faq-section.tsx` — rebuild with shadcn Accordion (install if needed: `npx shadcn@latest add accordion`) (2026-03-15)
- [x] **Stage 59**: Replace `src/components/landing/pricing-section.tsx` — rebuild with shadcn Card grid + Badge + Button (2026-03-15)
- [x] **Stage 60**: Replace `src/components/seo/json-ld.tsx` — no UI, but verify it still renders valid JSON-LD after any layout changes (2026-03-15)
- [x] **Stage 61**: Clean up: delete any orphaned old component files that are no longer imported anywhere (2026-03-15)

## Replace Page-Level Inline Styles (stages 62–66) `[replace-page]`

- [x] **Stage 62**: Migrate `/signup` page (`src/app/signup/page.tsx`) — replace all inline `style={}` with shadcn components (Input, Button, Label, Checkbox, Card), extract PasswordField/PasswordStrengthBar into shadcn-based components (2026-03-15)
- [x] **Stage 63**: Migrate `/login` page (`src/app/login/page.tsx`) — replace all inline styles with shadcn components (2026-03-15)
- [x] **Stage 64**: Migrate `/reset-password` page and `/reset-password/confirm` — replace inline styles with shadcn components (2026-03-15)
- [ ] **Stage 65**: Migrate landing page (`src/app/page.tsx`) — replace inline styles with shadcn components + Tailwind
- [ ] **Stage 66**: Migrate `/about` and `/changelog` pages — replace inline styles with shadcn components + Tailwind

## Desktop Verify (stages 67–97) `[desktop-verify]`

Each stage: navigate route at 1280x800 via Playwright, assert no console errors, no 500/404, page content renders, all links valid, take screenshot.

- [ ] **Stage 67**: Desktop verify `/` (landing page) — hero section, features, pricing, FAQ, footer all render
- [ ] **Stage 68**: Desktop verify `/about` — content renders, team/mission section visible
- [ ] **Stage 69**: Desktop verify `/changelog` — changelog entries render
- [ ] **Stage 70**: Desktop verify `/login` — form renders with email + password fields, submit button, "sign up" link
- [ ] **Stage 71**: Desktop verify `/signup` — form renders with full name + email + password + confirm + terms checkbox, submit button, "sign in" link
- [ ] **Stage 72**: Desktop verify `/reset-password` — form renders with email field, submit button
- [ ] **Stage 73**: Desktop verify `/reset-password/confirm` — form renders with new password fields
- [ ] **Stage 74**: Desktop verify `/terms` — legal text renders, headings structured
- [ ] **Stage 75**: Desktop verify `/privacy` — legal text renders, headings structured
- [ ] **Stage 76**: Desktop verify `/legal/cookies` — cookie policy text renders
- [ ] **Stage 77**: Desktop verify `/docs` — docs index page renders, navigation links present
- [ ] **Stage 78**: Desktop verify `/docs/quick-start` — quick start guide renders with steps
- [ ] **Stage 79**: Desktop verify `/docs/tools` — tools documentation renders with tool list
- [ ] **Stage 80**: Desktop verify `/docs/billing` — billing docs render
- [ ] **Stage 81**: Desktop verify `/docs/faq` — FAQ items render with questions and answers
- [ ] **Stage 82**: Desktop verify `/blog` — blog index renders with post cards
- [ ] **Stage 83**: Desktop verify `/blog/introducing-daimon` — blog post renders with title, date, body
- [ ] **Stage 84**: Desktop verify `/blog/byok-why-it-matters` — blog post renders
- [ ] **Stage 85**: Desktop verify `/blog/discord-as-operating-system` — blog post renders
- [ ] **Stage 86**: Desktop verify `/dashboard` (authenticated) — sign in first, verify status cards + quick stats + onboarding checklist render
- [ ] **Stage 87**: Desktop verify `/dashboard/billing` (authenticated) — current plan card + plan comparison grid render
- [ ] **Stage 88**: Desktop verify `/dashboard/integrations` (authenticated) — Discord connection card + service grid render
- [ ] **Stage 89**: Desktop verify `/dashboard/settings` (authenticated) — account section + workspace section + discord section + danger zone render
- [ ] **Stage 90**: Desktop verify `/admin` (authenticated) — admin dashboard renders
- [ ] **Stage 91**: Desktop verify `/admin/tenants` (authenticated) — tenant list table renders with at least 1 row
- [ ] **Stage 92**: Desktop verify `/admin/tenants/[id]` (authenticated) — tenant detail page renders with tenant info
- [ ] **Stage 93**: Desktop verify `/admin/audit-log` (authenticated) — audit log table renders
- [ ] **Stage 94**: Desktop verify `/robots.txt` — valid robots.txt content
- [ ] **Stage 95**: Desktop verify `/sitemap.xml` — valid XML sitemap
- [ ] **Stage 96**: Desktop verify `/_not-found` (404) — styled 404 page renders (not default Next.js)
- [ ] **Stage 97**: Desktop verify invalid route `/asdfghjkl` — 404 page renders

## Mobile Verify (stages 98–128) `[mobile-verify]`

Each stage: navigate route at 375x812 via Playwright, assert no horizontal overflow, touch targets >= 44px, text >= 14px, mobile nav works, take screenshot.

- [ ] **Stage 98**: Mobile verify `/` — hero stacks vertically, pricing cards stack, mobile hamburger nav works
- [ ] **Stage 99**: Mobile verify `/about` — content readable, no overflow
- [ ] **Stage 100**: Mobile verify `/changelog` — entries stack vertically
- [ ] **Stage 101**: Mobile verify `/login` — form fills viewport width with padding, inputs full-width
- [ ] **Stage 102**: Mobile verify `/signup` — form fills viewport width, all fields accessible, password strength bar visible
- [ ] **Stage 103**: Mobile verify `/reset-password` — form centered, full-width input
- [ ] **Stage 104**: Mobile verify `/reset-password/confirm` — form centered
- [ ] **Stage 105**: Mobile verify `/terms` — text wraps properly, headings visible
- [ ] **Stage 106**: Mobile verify `/privacy` — text wraps properly
- [ ] **Stage 107**: Mobile verify `/legal/cookies` — text wraps properly
- [ ] **Stage 108**: Mobile verify `/docs` — docs nav collapses or stacks, content readable
- [ ] **Stage 109**: Mobile verify `/docs/quick-start` — content readable
- [ ] **Stage 110**: Mobile verify `/docs/tools` — tool list stacks
- [ ] **Stage 111**: Mobile verify `/docs/billing` — content readable
- [ ] **Stage 112**: Mobile verify `/docs/faq` — FAQ items full-width
- [ ] **Stage 113**: Mobile verify `/blog` — blog cards stack vertically
- [ ] **Stage 114**: Mobile verify `/blog/introducing-daimon` — post readable, images scale
- [ ] **Stage 115**: Mobile verify `/blog/byok-why-it-matters` — post readable
- [ ] **Stage 116**: Mobile verify `/blog/discord-as-operating-system` — post readable
- [ ] **Stage 117**: Mobile verify `/dashboard` (authenticated) — bottom nav or hamburger works, status cards stack, stats row stacks
- [ ] **Stage 118**: Mobile verify `/dashboard/billing` (authenticated) — plan cards stack, comparison grid scrolls or stacks
- [ ] **Stage 119**: Mobile verify `/dashboard/integrations` (authenticated) — service grid stacks
- [ ] **Stage 120**: Mobile verify `/dashboard/settings` (authenticated) — form sections stack, inputs full-width
- [ ] **Stage 121**: Mobile verify `/admin` (authenticated) — admin content accessible
- [ ] **Stage 122**: Mobile verify `/admin/tenants` (authenticated) — table scrolls horizontally or cards stack
- [ ] **Stage 123**: Mobile verify `/admin/tenants/[id]` (authenticated) — detail page readable
- [ ] **Stage 124**: Mobile verify `/admin/audit-log` (authenticated) — table scrolls or stacks
- [ ] **Stage 125**: Mobile verify `/robots.txt` — renders
- [ ] **Stage 126**: Mobile verify `/sitemap.xml` — renders
- [ ] **Stage 127**: Mobile verify 404 page — styled page renders
- [ ] **Stage 128**: Mobile verify invalid route — 404 renders

## Tablet Verify (stages 129–137) `[tablet-verify]`

Each stage: navigate at 768x1024, verify layout reflows correctly between mobile and desktop breakpoints.

- [ ] **Stage 129**: Tablet verify `/` — landing page grid reflows, pricing cards 2-column
- [ ] **Stage 130**: Tablet verify `/dashboard` — sidebar collapsed to icons, content area fills remaining width
- [ ] **Stage 131**: Tablet verify `/dashboard/billing` — plan comparison adapts to tablet width
- [ ] **Stage 132**: Tablet verify `/dashboard/integrations` — service grid 2-column
- [ ] **Stage 133**: Tablet verify `/dashboard/settings` — form width appropriate, not stretched
- [ ] **Stage 134**: Tablet verify `/admin/tenants` — table fits or scrolls gracefully
- [ ] **Stage 135**: Tablet verify `/docs` — docs sidebar collapses or overlays
- [ ] **Stage 136**: Tablet verify `/blog` — blog grid 2-column
- [ ] **Stage 137**: Tablet verify `/signup` — auth card centered, reasonable width

## Interactive Component QA (stages 138–159) `[interactive-qa]`

- [ ] **Stage 138**: Button — click primary variant on landing page, verify visual feedback (press state). Click secondary, ghost, outline variants on dashboard. Verify each has distinct styling.
- [ ] **Stage 139**: Button — verify disabled state: find a disabled button (e.g., submitting form), confirm `pointer-events: none` or `cursor: not-allowed`, confirm click does nothing
- [ ] **Stage 140**: Button — verify loading state: submit signup form, confirm spinner shows during submission, confirm double-click prevented
- [ ] **Stage 141**: IconButton — click an icon button (e.g., copy-to-clipboard), verify tooltip appears on hover, verify action fires
- [ ] **Stage 142**: Input — on signup page: type into full name field, verify value appears. Clear field. Type invalid email, tab away, verify validation error appears. Fix email, verify error clears.
- [ ] **Stage 143**: Input — on signup page: trigger every validation error one by one (empty name, invalid email, short password, no uppercase, no lowercase, no number, passwords don't match, terms unchecked). Verify each error message matches expected text.
- [ ] **Stage 144**: PasswordInput — on signup page: type password, verify masked. Click eye icon, verify unmasked. Click again, verify re-masked. Repeat for confirm password field.
- [ ] **Stage 145**: PasswordInput — verify password strength bar: type "a" (weak/red), type "aA" (still weak), type "aA1" (fair/amber), type "aA1bcdefghij" (strong/green). Verify bar segments and labels update.
- [ ] **Stage 146**: SearchInput — if search input exists on any page (admin tenant list?), type query, verify search icon visible, clear button appears, clear resets input
- [ ] **Stage 147**: Select — find a select component (settings or admin), open dropdown, select option with click, verify selection displays. Open again, use arrow keys to navigate, press Enter to select, press Escape to close.
- [ ] **Stage 148**: Checkbox — on signup page: check terms checkbox, verify visual state. Uncheck, verify visual state. Submit without checking, verify error.
- [ ] **Stage 149**: Toggle/Switch — find a toggle (settings page?), flip on, verify visual state. Flip off, verify state. Verify the associated setting is applied.
- [ ] **Stage 150**: Dropdown menu — click user menu in dashboard topbar/sidebar, verify menu opens with options. Click an option, verify action. Open menu, press Escape, verify closes. Open menu, click outside, verify closes.
- [ ] **Stage 151**: Dropdown menu keyboard — open user menu with Enter/Space, navigate with arrow keys, select with Enter, verify action fires. Navigate to last item, press arrow down, verify wraps or stops.
- [ ] **Stage 152**: Modal/Dialog — trigger a confirm dialog (e.g., danger zone delete action on settings page), verify dialog appears, verify backdrop visible, verify focus is inside dialog (tab doesn't escape).
- [ ] **Stage 153**: Modal/Dialog — with dialog open: press Escape, verify closes. Re-open, click backdrop/overlay, verify closes. Re-open, click Cancel button, verify closes without action. Click Confirm, verify action fires.
- [ ] **Stage 154**: Tabs — on a page with tabs (docs?), click each tab, verify content switches. Verify active tab has distinct styling. Use arrow keys between tabs, verify focus moves and content switches.
- [ ] **Stage 155**: Table — on admin tenants page: verify headers render, rows render with data. If pagination exists: click next page, verify content changes. Click previous, verify returns.
- [ ] **Stage 156**: Table — verify empty state: if possible, filter to show no results, verify empty state message shown (not blank table)
- [ ] **Stage 157**: Pagination — on admin audit log or tenant list: navigate to page 2, verify URL or state updates. Navigate back to page 1. Click a specific page number if visible.
- [ ] **Stage 158**: Toast — trigger a success action (e.g., save settings), verify toast appears with success message, verify it auto-dismisses after a few seconds. Trigger an error, verify error toast appears.
- [ ] **Stage 159**: Alert/Banner — on dashboard: verify billing alert banners render for free plan (if applicable). Verify alert styling matches variant (info/warning/error). If dismissible, click dismiss, verify removed.

## Form Validation Exhaustive QA (stages 160–169) `[interactive-qa]`

- [ ] **Stage 160**: Signup — submit completely empty form, verify all 5 field errors appear simultaneously (full name, email, password, confirm password, terms)
- [ ] **Stage 161**: Signup — test invalid email formats: type `@` → error, `foo@` → error, `foo@.com` → error, `foo bar@x.com` → error. Type valid email → error clears.
- [ ] **Stage 162**: Signup — password validation: type 7-char password → "at least 8 characters" error. Type 8 lowercase chars → "uppercase letter" error. Add uppercase → "number" error. Add number → errors clear.
- [ ] **Stage 163**: Signup — passwords don't match: type different passwords in password and confirm fields, tab away from confirm, verify "Passwords do not match" error appears on confirm field
- [ ] **Stage 164**: Signup — password strength bar exhaustive: type single lowercase → Weak (1 bar, red). Add uppercase → Fair (2 bars, amber). Add number → Good (3 bars, teal). Make >= 12 chars → Strong (4 bars, green). Clear field → bar disappears.
- [ ] **Stage 165**: Signup — terms checkbox: submit without checking → "You must agree" error. Check box → error clears. Uncheck → error reappears on next submit attempt.
- [ ] **Stage 166**: Login — submit empty form, verify email + password errors appear. Type only email, submit → password error. Type only password, submit → email error.
- [ ] **Stage 167**: Login — wrong password: enter valid email + wrong password, submit, verify server error banner appears ("Invalid login credentials" or similar). Verify form fields are NOT cleared (email still filled).
- [ ] **Stage 168**: Reset password — submit empty → email error. Submit invalid email → error. Submit valid email → success message shown (no error, even if email doesn't exist in DB).
- [ ] **Stage 169**: Settings — display name: clear field, submit → error. Type 101+ chars → error. Type valid name, submit → success toast. Reload page → name persisted.

## Auth Flow QA (stages 170–179) `[flow-qa]`

- [ ] **Stage 170**: Fresh signup end-to-end — navigate to `/signup`, fill full name + email (use unique test email like `test-{timestamp}@example.com`) + valid password + confirm + check terms, submit, verify redirect to `/dashboard?onboarding=true`, verify onboarding checklist is visible on dashboard
- [ ] **Stage 171**: Signup creates tenant — after fresh signup, use Supabase admin API to verify: `tenants` row exists with correct name, `tenant_members` row exists with `role=owner`, NO `tenant_subscriptions` row (free tier)
- [ ] **Stage 172**: Signup duplicate email — try signing up with `cl@sandoval.dev` (existing user), verify "already exists" error message appears, form is not cleared
- [ ] **Stage 173**: Login success — navigate to `/login`, enter `cl@sandoval.dev` + `daimon-admin-2026!`, submit, verify redirect to `/dashboard`, verify tenant name "CL's Workspace" appears in sidebar/header
- [ ] **Stage 174**: Login failure — navigate to `/login`, enter `cl@sandoval.dev` + `wrongpassword123A`, submit, verify error banner appears, verify email field still contains `cl@sandoval.dev`
- [ ] **Stage 175**: Login redirect preservation — navigate to `/dashboard/settings` while unauthenticated, verify redirect to `/login?next=/dashboard/settings` (or similar), log in, verify redirect to `/dashboard/settings` (not just `/dashboard`)
- [ ] **Stage 176**: Logout — while logged into dashboard, find and click sign out button/link, verify redirect to `/login` or `/`, verify navigating to `/dashboard` now redirects to login
- [ ] **Stage 177**: Session persistence — log in, note the dashboard loads. Close the browser tab (Playwright: close page, open new page), navigate to `/dashboard`, verify still logged in (session cookie persists)
- [ ] **Stage 178**: Reset password request — navigate to `/reset-password`, enter `cl@sandoval.dev`, submit, verify confirmation message shown (e.g., "Check your email")
- [ ] **Stage 179**: Auth middleware exhaustive — verify ALL dashboard routes redirect to login when unauthenticated: `/dashboard`, `/dashboard/billing`, `/dashboard/integrations`, `/dashboard/settings`. Verify all admin routes also redirect: `/admin`, `/admin/tenants`, `/admin/audit-log`.

## Dashboard Flow QA (stages 180–189) `[flow-qa]`

- [ ] **Stage 180**: Sidebar navigation — log in, on dashboard: click every sidebar link one by one (Dashboard, Integrations, Billing, Settings). Verify each navigates to the correct URL and page loads without errors.
- [ ] **Stage 181**: Dashboard status cards — verify all 3 status cards render: Discord connection status (should show "Not connected" or similar), API Keys count, Current plan (Free)
- [ ] **Stage 182**: Dashboard quick stats — verify stats row renders: Messages today (0), Tool uses today (0), uptime/connected indicator
- [ ] **Stage 183**: Onboarding checklist — verify checklist shows for new-ish tenant: Discord bot step (incomplete), API key step (incomplete), verify each step shows correct completion state. If tenant has discord/keys, verify steps show complete.
- [ ] **Stage 184**: Billing — current plan card — verify free plan card shows: plan name "Free", feature list, upgrade button present
- [ ] **Stage 185**: Billing — plan comparison grid — verify all 3 plans render (Free, Starter, Pro) with feature rows, pricing, and CTA buttons. Verify free plan shows "Current plan" indicator.
- [ ] **Stage 186**: Integrations — service grid — verify grid renders available integrations. Discord connection card shows disconnected state with setup instructions.
- [ ] **Stage 187**: Integrations — Discord card states — verify card renders correctly for disconnected state. If possible, simulate connected state and verify status badge changes.
- [ ] **Stage 188**: Settings — account section — change display name to "Test Name", submit, verify success toast. Reload page, verify "Test Name" persisted. Change back to original.
- [ ] **Stage 189**: Settings — workspace section — change workspace name to "Test Workspace", submit, verify success toast. Reload, verify persisted. Change back to "CL's Workspace".

## Admin Flow QA (stages 190–195) `[flow-qa]`

- [ ] **Stage 190**: Admin dashboard — log in as admin user, navigate to `/admin`, verify admin overview page loads with stats or summary
- [ ] **Stage 191**: Admin tenant list — navigate to `/admin/tenants`, verify table renders with at least 1 tenant row, verify columns (name, plan, status, created) are visible
- [ ] **Stage 192**: Admin tenant detail — click into a tenant row, verify detail page loads with: tenant info (name, plan, status, owner), member list, subscription status, API keys count
- [ ] **Stage 193**: Admin tenant actions — on tenant detail page: test suspend button (verify confirmation dialog appears, click cancel → no change). If safe to test: click confirm → verify status changes to suspended. Unsuspend → verify returns to active.
- [ ] **Stage 194**: Admin audit log — navigate to `/admin/audit-log`, verify table renders. If pagination exists, navigate pages. Verify entries have timestamps and action descriptions.
- [ ] **Stage 195**: Admin access control — log out, create or use a non-admin user, try navigating to `/admin`, `/admin/tenants`, `/admin/audit-log`. Verify each returns 403 or redirects away (not a blank page or crash).

## Accessibility QA (stages 196–201) `[a11y-qa]`

- [ ] **Stage 196**: Keyboard navigation — public pages: tab through entire landing page from top. Verify: focus ring visible on every focusable element (links, buttons), logical tab order (left-to-right, top-to-bottom), no focus traps, skip-to-content link if present.
- [ ] **Stage 197**: Keyboard navigation — auth forms: on login page, tab through all fields. Verify: each input receives focus in order (email → password → submit), focus ring visible, Enter submits form, Tab from last field goes to links below.
- [ ] **Stage 198**: Keyboard navigation — dashboard: tab through sidebar links, verify focus moves through all nav items. Tab into main content area. Verify all interactive elements (buttons, links, cards) are reachable.
- [ ] **Stage 199**: ARIA attributes — verify on signup page: all `<input>` have associated `<label>` (via `htmlFor` or `aria-label`), all buttons have accessible names, error messages have `role="alert"`, form has `aria-required` on required fields, `aria-invalid` on errored fields.
- [ ] **Stage 200**: Screen reader landmarks — verify on dashboard: `<main>` wraps content area, `<nav>` wraps sidebar, `<header>` wraps topbar. Verify on landing page: `<main>`, `<nav>`, `<footer>` present.
- [ ] **Stage 201**: Color contrast — on landing page and dashboard: verify body text against background meets WCAG AA (4.5:1 ratio). Specifically check: teal `#B4E7DD` text on white (FAILS — verify it's only used as background, never as text on white), dark blue `#0C1F40` on `#F7F7F7` (passes).

## Error State QA (stages 202–206) `[error-qa]`

- [ ] **Stage 202**: Dashboard error state — sign in, then temporarily break the Supabase query (e.g., by navigating with an invalid session). Verify ErrorState component renders with "Failed to load dashboard" message and retry button. Verify clicking retry reloads.
- [ ] **Stage 203**: Empty states — verify EmptyState renders correctly: on dashboard with no Discord connection (should show setup prompt), on integrations page with no connections, on admin tenants with filter showing no results.
- [ ] **Stage 204**: Network error handling — on signup page: simulate network failure (disconnect or intercept requests), submit form, verify error message says something about connection (not a cryptic JS error or blank page).
- [ ] **Stage 205**: 404 page — navigate to `/this-page-does-not-exist`, verify styled 404 page renders with Daimon branding (not the default Next.js 404). Verify it has a link back to home.
- [ ] **Stage 206**: API error responses — hit API routes with invalid data: `POST /api/billing/checkout` with no body, `POST /api/discord-connections` with invalid data. Verify JSON error responses (not 500 HTML pages).

## Cross-Page Consistency QA (stages 207–210) `[consistency-qa]`

- [ ] **Stage 207**: Typography consistency — grep all `.tsx` files for inline `fontFamily`, `fontSize`, `fontWeight`. Every instance should be zero (all handled by shadcn/Tailwind classes). Fix any remaining inline font styles.
- [ ] **Stage 208**: Color consistency — grep all `.tsx` files for hardcoded hex colors (`#0C1F40`, `#B4E7DD`, `#9FAAE2`, `#DC2626`, `rgba(12,31,64`). All should be replaced with CSS variable references via Tailwind classes (e.g., `text-foreground`, `bg-primary`). Fix any remaining.
- [ ] **Stage 209**: Spacing consistency — grep for inline `margin`, `padding`, `gap` in `style={}` objects. All should be Tailwind classes. Fix any remaining inline spacing.
- [ ] **Stage 210**: Component consistency — navigate to 3+ pages that use the same component (e.g., Button). Screenshot each instance. Verify visual consistency (same padding, font, border radius, hover state). Fix any inconsistencies.

## Discovery (stages 211–215) `[discovery]`

- [ ] **Stage 211**: Grep for remaining inline `style={}` across all `.tsx` files in `src/`. Every instance is a missed migration. Fix all found instances by converting to Tailwind/shadcn classes.
- [ ] **Stage 212**: Grep for old imports — search for imports from deleted custom component files. Fix any dead imports. Search for unused exports in remaining component files.
- [ ] **Stage 213**: Grep for hardcoded colors — search for `#0C1F40`, `#B4E7DD`, `#9FAAE2`, `#F7F7F7`, `#DC2626`, `rgba(12,31,64` in all `.tsx` and `.css` files outside of the CSS variable definitions. Every instance should use CSS vars. Fix all.
- [ ] **Stage 214**: Final build + lint — run `npm run build` and `npm run lint`. Fix ALL errors and warnings. Zero tolerance.
- [ ] **Stage 215**: Full Playwright re-run — run the complete Playwright test suite from `e2e/`. All tests must pass. Any failure = fix and re-run. If all pass, write `loops/daimon-shadcn-forward/status/converged.txt` with the date and "All 215 stages complete. Build passes. All Playwright tests pass."

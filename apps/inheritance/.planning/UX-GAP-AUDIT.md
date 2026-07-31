Verified the load-bearing claims directly in source (autosave dead-wiring, error-state input discard, stale `caseRow` restore, `downloadPDF(..., null)`, zero callers for the intake mappers and `exportCaseZip`) — they all check out. Synthesis follows.

# Inheritance App — UX Gap Audit, Synthesised

## The one-line read

The happy path computes correctly, but the app breaks its two most important promises to a busy lawyer — **"your work is saved"** (wizard autosave is dead code, so an hour of family-tree entry lives only in memory) and **"these numbers are current"** (three separate stale-snapshot paths silently show superseded legal figures) — and nearly every unhappy path fails silently because of one repeated `try/finally`-without-`catch` pattern.

---

## Severe — fix these first

**1. Wizard autosave is dead code — nothing saves until Compute.** *(small)* — reported independently by 5 of 8 agents
`routes/cases/$caseId.tsx:45` sets `autoSaveInput` exactly once (in `fetchCase`); `WizardContainer` exposes no onChange, and `useAutoSave.ts:40`'s `prevInputRef.current === input` reference-equality guard means the debounce never fires. The hook's `status` return is also discarded — no save indicator exists. Tab close, refresh, or a sidebar click discards everything since the last compute.
Fix in one motion: `methods.watch()` subscription in `WizardContainer` → `onChange` prop → `setAutoSaveInput`; replace the reference guard with a JSON compare; render the status chip (the tax wizard at `components/tax/EstateTaxWizard.tsx:104` already has the exact pattern); make `useAutoSave`'s unmount cleanup **flush** the pending save instead of clearing it (`useAutoSave.ts:46-48`).
Files: `routes/cases/$caseId.tsx`, `components/wizard/WizardContainer.tsx`, `hooks/useAutoSave.ts`

**2. Compute failure → "Back to Editor" → blank wizard.** *(trivial)* — 5 agents
`PageState`'s error variant is `{ phase: 'error'; message }` only; `handleEditInput` (`$caseId.tsx:154-157`) passes `null` unless phase is `'results'`, so the wizard remounts empty after any engine rejection, timeout, or failed save. The data is usually in the DB (input saved at line 114 before compute) but the screen says it's gone. Fix: carry `input` in the error variant — `handleSubmit` has `data` in hand at the catch site.

**3. Three stale-snapshot paths show wrong legal numbers as current.** *(trivial + small)* — the failure class the charter ranks worst
- **3a.** `caseRow` is fetched once and never updated after a successful compute, so "← Back to Results" (`$caseId.tsx:151-166`) restores the page-load-era distribution after an in-session recompute. Fix: `setCaseRow` in `handleSubmit`'s success path. *(trivial)*
- **3b.** A failed recompute leaves new `input_json` beside old `output_json` (input saved before compute; output never cleared), so the next page load renders phase `'results'` pairing new inputs with stale outputs — new estate value in the header, old per-heir sums below, no warning. Fix: persist which input the output came from (or a hash) and show a "computed from earlier inputs — recompute" banner on mismatch. *(small)*
- **3c.** The tax bridge overwrites succession `output_json` with bridged shares but never persists the bridged input; the next plain succession recompute silently reverts heir shares to pre-tax numbers, and `buildBridgeNoteText` (`lib/tax-bridge.ts:159`, built to make the bridge visible on PDFs) is never called anywhere. Fix: persist the bridged input alongside (runTaxBridge already returns it) and render the bridge note on ResultsView/PDF. *(medium)*

**4. Testate cases reopen mislabelled Intestate — and "correcting" it wipes the will.** *(small)*
`WizardContainer`'s `hasWill` comes only from the URL test seam, never from `defaultValues.will`, so any saved testate case reopens with the radio on Intestate, the Will step hidden, and Review saying "Intestate" — while Compute still runs the testate pipeline. Clicking Testate to fix it triggers `EstateStep.handleSuccessionChange`'s `setValue('will', {empty})`, destroying every institution/legacy/disinheritance. Fix: derive `hasWill` from `defaultValues?.will != null`; only reset the will when none existed.
Files: `components/wizard/WizardContainer.tsx`, `components/wizard/EstateStep.tsx`

**5. No-organization users are trapped in a loop, and onboarding is unreachable.** *(small)* — 2 agents, two halves of one routing bug
Both signup paths create the org **before** navigating to `/onboarding` (`auth.tsx:85-86`, `auth/callback.tsx:31-33`), and `onboarding.tsx:39` self-redirects the moment an org exists — so onboarding's firm-name and attorney-profile steps never run, and production firms are permanently named "My Firm". Meanwhile every no-org recovery CTA (`routes/index.tsx:112`, `routes/cases/new.tsx:40`, `settings/team.tsx:85-91`) points at `/settings`, which cannot create an organization. `callback.tsx` also has no `.catch` around `createOrganization`, hanging the confirmation spinner forever on failure. Fix: remove org-creation from both signup paths (let onboarding do its one job), point all no-org CTAs at `/onboarding`, add the `.catch`.

**6. The invite feature dead-ends: no email is sent and the token is never shown.** *(small)*
`lib/organizations.ts` `inviteMember()` returns the generated token; `useOrganization.inviteMember` discards it (`Promise<void>`); the dialog just closes. The token exists only in the DB — no invitee can ever reach `/invite/$token`, and the invite silently expires at 7 days while still listed "Pending". Fix: show `${origin}/invite/${token}` with a Copy button after invite, add "Copy link" to pending rows (token is already fetched). No email infrastructure needed. Companion fix: `/invite/$token`'s error screen sends signed-out invitees to sign-in with `redirect: ''` (`routes/invite/$token.tsx:42`), permanently losing the token — pass `redirect: '/invite/' + token`.

**7. "Readonly" role is a lie at the data layer.** *(medium — owner judgement)*
`ROLE_PERMISSIONS` (`types/index.ts:728`) is consumed only by the invite gate; the `cases_org_member` RLS policy (`001_initial_schema.sql:201`) is `FOR ALL` for any member. A Readonly intern can edit, recompute, and delete any case — autosave (once fixed by #1) makes the overwrite instant. Fix: per-command RLS policies mirroring the existing `deadlines_delete` role check, plus gating wizard edit affordances on `canPerform('canEditCase')`. Owner call: which roles get write.

**8. Guided intake silently discards four of its seven steps.** *(medium — owner judgement)*
`GuidedIntakeForm.handleCreateCase` calls only `mapIntakeToEngineInput + createCase`. `mapIntakeToClientData`, `mapIntakeToIntakeData`, and `generateAndSaveDeadlines` have **zero callers** (verified) — yet SettlementTrackStep shows "Generated Milestones (9)" and the Review step promises them. Client TIN/contacts, conflict-check outcome, assets, and settlement track all vanish; the DeadlineTimeline never renders for intake cases; and the conflict check searches a permanently empty `clients` table. **Decision required:** wire the three existing functions in, *or* delete the Conflict Check / Client Details / Asset / Settlement steps so lawyers stop typing into a void. Either is honest; the current state is neither.

---

## Systemic gaps (one fix, many symptoms)

**A. The silent-mutation pattern: `try/finally` with no `catch`.** One convention change — *every mutation catch shows a sonner toast* (Toaster is already mounted in `main.tsx:41`) — dissolves **ten** reported findings, each trivial:
- PDF export fails with nothing but a stopped spinner (`ActionsBar.tsx:45-53`)
- **Share disable fails silently while the public link stays live** (`ShareDialog.tsx:30-37`, `$caseId.tsx` `handleToggleShare`) — the privacy-critical one
- Both clipboard actions (Copy Narratives, Copy share link) — no success or failure signal
- Case note save failure closes the editor and discards the text (`CaseNotesPanel.tsx:32-56`) — restore the text into the editor too
- Tax bridge failures swallowed by an empty catch (`$caseId.tax.tsx:102-104`) — including the deliberately loud pre-Phase-8 guard in `tax-bridge.ts:96-101`; every `runCompute` exit should produce exactly one toast, and the "no assets entered" skip message tests the wrong field (`item40_gross_estate` is *net*; use `item34c_gross_estate`)
- Tax Apply/Revert: `updateCaseTaxInput` sits outside the try block (`$caseId.tax.tsx:127-150`)
- Team member Remove / role change: fire-and-forget, plus no confirm on an instant destructive Remove (`TeamMemberList.tsx:17-18, 106-121`)
- Document checklist mutations (`DocumentChecklist.tsx:24-43`)
- Onboarding attorney-profile save labelled "non-fatal" and silently skipped (`onboarding.tsx:68-79`)

**B. Fetch failures masquerade as empty states.** `listCases(...).then(...).finally(...)` with no `.catch` in both `routes/index.tsx:98-103` and `routes/cases/index.tsx:33` — a network blip tells a lawyer with 40 cases "No cases yet — Create your first case." Same family: `routes/cases/index.tsx:31-34` early-returns on null org so skeletons animate forever; `routes/index.tsx` ignores `useOrganization`'s `loading`, flashing "Set up your firm first" on every dashboard load. One shared "couldn't load — Retry" state + honoring `loading`/`error` from `useOrganization` fixes all four. *(small total)*

**C. Rehydrate what's already saved.** `$caseId.tax.tsx:52-65` loads `tax_input_json` but never `tax_output_json`, so computed tax results vanish on every revisit and re-computing re-fires the bridge. Also: hydrating `tax_input_json` with no shape check blank-screens on old-shape rows (no error boundary catches it) — structural-check with fallback to defaults. And the results panel never marks itself stale when inputs change post-compute; badge it and surface the existing `handleCompute` outside tab 8. *(small each)*

**D. Teammates render as raw UUIDs.** `user_profiles` has only a self-select RLS policy (`001_initial_schema.sql:111`), so `/settings/team`'s profile fetch returns one row and admins manage colleagues blind — Remove is one misclick on an unidentifiable row. One org-scoped SELECT policy fixes the whole team page. *(small)*

**E. Auth redirect races.** `auth.tsx:48-50`'s effect navigates to `'/'` on any auth-state change, racing the submit handler's `navigate(redirectTo)` — use the redirect param in the effect too. *(trivial; also unblocks the invite fix in #6)*

---

## Delete / simplify

Ranked by friction removed:

1. **Tax tab 1 re-asks decedent name, date of death, and marital status** the app already holds (`row.decedent_name` is in the page header directly above the empty field). Seed `createDefaultEstateTaxState()` from the case row + `input_json`. Removes three fields of re-entry *and* a cross-engine mismatch class (different DoD changes deduction regimes). *(small)*
2. **Client Details step: 12 fields, 2 required, 0 persisted; Asset Summary step feeds a function nobody calls.** If the owner chooses "wire it in" for #8, still cut Client Details to name + relationship + one contact; if not, delete both steps. *(owner judgement, paired with #8)*
3. **Signup "Firm Name" field + onboarding Phone/Address inputs** — collected and thrown away (`auth.tsx:161-170`, `onboarding.tsx:117-123`; `handleFirmSubmit` uses only the name). Delete them; onboarding's firm step (reachable after fix #5) owns the name. *(trivial)*
4. **The 30s compute timeout is fake — delete it.** `compute_json` is synchronous on the main thread, so the `setTimeout` can never win the `Promise.race`; it only mislabels a hung WASM fetch. Fewer lines, stops promising protection it can't deliver. *(trivial)*
5. **`lib/export-zip.ts` + the `jszip` dependency + 3 of 4 `PDFExportOptions` fields** (`includeFamilyTree`/`includeDeadlines`/`includeChecklist` — never read by `EstatePDF.tsx`) are dead weight with zero callers (verified). Delete. *(small)*
6. **The fabricated Settlement Timeline on `/share/$token`** — rendered from `deadlines={[]}` and hardcoded `track='ejs'`, so every client sees "Extrajudicial, 0%, Stage 1" regardless of reality. Delete the block; the RPC deliberately doesn't return this data. *(trivial)*
7. **"Clear Draft" button on intake** — instant, irreversible, adjacent to Cancel. Delete it (offer resume-or-start-over on load) or gate behind a confirm; deleting is smaller. *(trivial)*
8. **Debounce the tax wizard's per-keystroke saves** through the existing `useAutoSave` pattern — removes the out-of-order-write race where "Saved" displays while the DB holds an older keystroke. *(small)*

---

## Per-journey specifics

Smaller items that survived dedupe and the discriminator, all trivial/small:

- **Share token never rotates on re-enable** (`lib/share.ts:13-26`) — disable-then-re-enable resurrects every previously distributed link. Set `share_token = crypto.randomUUID()` on enable. One line; the dialog's own privacy warning frames disable as revocation.
- **Firm letterhead never reaches the PDF** — `ActionsBar.tsx:49` hardcodes `downloadPDF(input, output, null)` (verified), defeating the entire Settings letterhead/logo/color feature. Load `loadFirmProfile(user.id)` and pass it through.
- **Engine diagnostics thrown away** — `bridge.ts` reconstructs typed `EngineError` with `.kind`/`.detail`, but `handleSubmit`'s catch reads only `.message`, so lawyers see the generic one-liner. Render `detail` in the existing Alert.
- **Wizard step pills aren't clickable** (plain divs, `WizardContainer.tsx:230-269`) — every one-field correction costs 4-5 Next clicks. Mirror the intake form's button pattern at `GuidedIntakeForm.tsx:195-213`.
- **Intake hardcodes `degree: 1` for all heirs** (`lib/intake.ts:115-133`) — wrong for siblings (2) and nephews (3), and the wizard *disables* the Degree input for exactly those relationships, so it's uncorrectable. Use `DEFAULT_DEGREE[relationship]`.
- **Silent stale-draft resume for the wrong client** — the global `'inheritance-intake-draft'` key restores client A's TIN and heirs into client B's intake with no notice. Add a dismissible "Resumed draft for X" banner.
- **Expired invites display as Pending forever** — render the already-fetched `expires_at`; **seat count ignores pending invites** — fold `pendingInvitations.length` into the display so acceptors don't hit an invisible limit.
- **Succession-type toggle nukes the Will step without confirmation** (`EstateStep.tsx`) — confirm before nulling a will that has dispositions (partly mitigated by fix #4's preserve-on-reselect).
- **JSON export filename omits the decedent** (`inheritance-${date}-both.json`) — reuse the PDF's `slugifyName`. **Share not-found page has zero exits** — add a homepage link.

---

## Cut as scope creep

Held the line on these, including several an agent reported as findings:

- **Cross-tab `updated_at` conflict guard on `lib/cases.ts` writes** — reported as a finding, cut here: optimistic-concurrency machinery is a new mechanism, and at 50-200 users the realistic single-tab race is fully fixed by the tax-page debounce above. Revisit only if multi-user editing of one case is actually observed.
- **Web Worker compute** (cancellable engine, real timeout) — correct long-term, new architecture. Deleting the fake timeout is the honest interim.
- **Email-sending infrastructure for invites** — the copyable link covers the path; Resend/edge functions are new infra.
- **Zod validation layer for wizard/engine input** — rendering the typed `EngineError.detail` covers the failure honestly; a validation system is a new job.
- **App-wide error boundary as a ticket** — the one observed blank-screen path (tax hydration) gets a targeted fix; note one agent claims a root ErrorBoundary already exists in `main.tsx`, so verify before building anything.
- Also cut, agreeing with the agents' own rejections: case delete/archive/status UI, client management pages, list search/filter, wizard-step-in-URL deep-linking, multi-draft intake storage, version history/undo, offline queueing, share-link expiry/passwords, billing flow, audit logs, admin-transfer safeguards, org switcher, tax PDF export, extending the share RPC payload, post-results guided next-steps, welcome tour.

**Where two agents disagreed:** the "Clear Draft" confirm (journey 7 called it scope creep; journeys 2 and 4 reported it) — resolved by preferring the *deletion* of the button, which is minimalism, not a new feature. The intake-persistence question (#8) is the one genuine wire-it-or-cut-it decision only the owner can make; everything else above is mechanical.
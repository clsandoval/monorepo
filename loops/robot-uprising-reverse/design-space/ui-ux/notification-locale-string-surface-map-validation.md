# string-surface-map.json Validation as a PR Requirement

**Aspect:** 4.69e-i-a-i-f-i-α-i-A-i-1-a-i-A — `string-surface-map.json` validation as a PR requirement: what happens when a developer maps a string to the wrong surface/slot; how CI detects a mapping that doesn't match the string's actual render context; static analysis vs. runtime validation

**Parent:** 4.69e-i-a-i-f-i-α-i-A-i-1-a-i — Budget table maintenance as a living artifact (produced `string-surface-map.json` as the "one human step"; established two-stage validation model: char-count pre-translation, pixel-width post-translation)

**Grandparent chain:** → 4.69e-i-a-i-f-i-α-i-A-i-1-a → 4.69e-i-a-i-f-i-α-i-A-i-1 → 4.69e-i-a-i-f-i-α-i-A-i → 4.69e-i-a-i-f-i-α-i-A → 4.69e-i-a-i-f-i-α-i → 4.69e-i-a-i-f-i → 4.69e-i-a-i-f

**Cross-references:**
- 4.69e-i-a-i-f-i-α-i-A-i-1-a — Budget table parent; `l10n/budget.json` produced by generator from `string-surface-map.json` + `surfaces.json`
- 4.69e-i-a-i-f-i-α-i-A-i-1-a-ii — Playwright pixel-width validation CI (sibling; that step detects overflow in the actual render; this step detects mapping inconsistency before render)
- 4.69e-i-a-i-f-i-α-i-A-i-1-a-i — surfaces.json drift detection (parallel concern; that aspect validates layout dimensions; this aspect validates string→surface assignment)
- 4.69e-i-a-i-f-i-α-i-A-iv — displayPrefs registry as living artifact (structural parallel; same PR-gate governance problem for a different file)

---

## The Core Problem

The parent analysis established that `string-surface-map.json` is "the one human step": a developer manually declares which surface/slot each i18n string key belongs to. The generator then derives `l10n/budget.json` from this declaration + the layout dimensions in `surfaces.json`. CI lints against `l10n/budget.json` at translation time.

The entire system depends on that declaration being correct. If it is wrong, every downstream guarantee is wrong:
- The budget lint passes (it's checking against the mapped surface, not the actual render surface)
- The Playwright pixel-width step passes if the actual surface is more generous than the mapped one
- Translations are approved without ever being checked against the surface they actually render in

**This is the "silent wrong mapping" failure mode.** Unlike budget overflows (which produce visible UI defects), a wrong surface mapping can be completely invisible — until the component is refactored, until the actual surface is tightened, or until a locale with extreme expansion hits the actual surface at a bad moment.

### Why This Happens

Wrong mappings are not malicious. They happen because:

1. **Copy-paste from similar string**: developer copies a `toast.body` entry and edits only the key name, not the surface field, when adding a `modal.confirm.title` string.
2. **Component refactor without map update**: the string is moved from toast to modal; the component is updated; the map file is forgotten (not in the same PR, not in the same mind).
3. **Ambiguous component structure**: the same string key is used by two components (a toast and a fallback modal); mapping to one surface is incorrect for the other.
4. **Renamed surface slots**: a surface slot is renamed in `surfaces.json` but old map entries still reference the old name and the validator only checks presence, not that the surface name is current.

### Why It's Hard to Detect

The fundamental difficulty: the mapping from "string key → surface" is an **assertion about render context**, and render context is determined at runtime by the component tree, not at string-definition time. A string key has no intrinsic surface. It has the surface its callers give it.

---

## Options

### Option A: Naming Convention as Surface Encoding ("The Embedded Surface")

**How it works:** All i18n keys are required to follow a naming schema that encodes the surface: `{surface}.{slot}.{namespace}.{variant}`. The key `toast.body.a11y.reducedMotion` is syntactically in surface `toast`, slot `body`. Validation is trivial: check that the surface prefix in the key name matches the surface in the map entry.

**Validation steps:**
```
1. Parse string-surface-map.json.
2. For each entry { key, surface, slot }:
   - Assert key starts with `{surface}.{slot}.`
   - If not: fail with "Key '{key}' is mapped to surface '{surface}' slot '{slot}', but its name prefix does not match."
3. Run in CI as a pre-translation lint step (fast: O(n) string comparison).
```

**Strengths:**
- Zero-dependency validation: no component parsing, no runtime, no Playwright.
- Instant feedback at PR time: the naming convention check runs in milliseconds.
- Self-documenting: any developer reading a key name knows its surface.
- Eliminates copy-paste errors: copying `toast.body.x` and editing the name changes the surface encoding automatically if the developer follows convention.

**Weaknesses:**
- Breaking change for translation memory: renaming a key's surface requires a new key name, which breaks TM matches and requires retranslation.
- Impossible for multi-surface strings: a string used in both a toast and a modal cannot have one name that encodes both surfaces.
- Naming convention enforcement degrades over time: new developers miss the rule; senior developers bypass it in a hurry; the convention becomes cargo-culted.
- Dynamic key construction defeats it: `t('toast.' + slotName + '.a11y.' + settingKey)` produces keys that are structurally correct but not statically verifiable.

**Verdict:** Necessary but not sufficient. Good as a first line of defense and naming standard. Insufficient alone.

---

### Option B: AST-Based Component Tracing ("The Static Import Graph")

**How it works:** A build-time plugin (Vite/Babel transform) traverses the component tree and records every `t('key')` call site with its enclosing component file path. A surface registry (`component-surface-registry.json`) maps component file paths to surface names. At CI time, the tracer produces a `{key → component → surface}` triple for every i18n call; the map validator checks all triples against `string-surface-map.json`.

**Validation steps:**
```
1. Build the project with the tracing plugin enabled.
2. Plugin emits: i18n-trace.json = [{ key, file, lineNumber }]
3. Load component-surface-registry.json: { "src/components/ToastA11y.tsx": "toast.body", ... }
4. For each trace entry:
   - Look up component's surface in registry.
   - If surface ≠ string-surface-map[key].surface: emit mismatch warning.
5. Fail CI if any mismatch is ERROR-level (vs WARNING for multi-surface).
```

**Strengths:**
- Catches the component-refactor failure mode: when a string moves from a toast to a modal component, the tracer sees it.
- No runtime required: static analysis, runs in a few seconds as part of the build.
- Doesn't require key renaming when surfaces change.

**Weaknesses:**
- Two-file maintenance problem: `string-surface-map.json` AND `component-surface-registry.json` must both stay correct. A component that is incorrectly registered causes false negatives.
- Dynamic key construction defeats it: `t('toast.' + variant)` cannot be resolved statically. The tracer must either skip these (false negative) or flag them all (false positive noise).
- Component-to-surface mapping is many-to-many: a generic `LocalizedText` wrapper used everywhere maps to every surface, producing noise.
- Build coupling: adding the tracing plugin to the Vite build adds maintenance burden and can slow dev hot-reload.

**Verdict:** High accuracy for static key usage in dedicated components. Degrades for shared/generic components and dynamic keys.

---

### Option C: useSurface Hook with Dev-Mode Runtime Assertion ("The Contextual Contract")

**How it works:** Components that render localized strings call `useSurface('toast.body')` to declare their render context. The i18n hook (`useTranslation`) reads the nearest surface context from React context. In development and CI (integration test) builds, every `t('key')` call asserts that the key's mapped surface matches the current surface context. Mismatches are thrown as errors.

```typescript
// In ToastA11yNotification.tsx:
const { t } = useTranslation();
useSurface('toast.body'); // declares context

// Internally, useTranslation checks:
// assert(surfaceMap[key].surface === currentSurface)
// throws SurfaceMismatchError if wrong
```

**Validation steps:**
```
1. Run integration tests with NODE_ENV=ci (activates assertion).
2. Any component that calls t('key') where key's mapped surface ≠ declared useSurface context throws.
3. Integration test runner captures the thrown error, fails the test, fails CI.
```

**Strengths:**
- Catches the most subtle case: a shared component is called from both a toast and a modal context. The assertion fires specifically when the wrong caller uses it.
- Works for dynamic keys if the surface context is declared: `t('toast.' + variant)` may be dynamic, but the surface assertion is on the context, not the key.
- Explicit and discoverable: `useSurface('toast.body')` is visible in the component file, serving as documentation.
- Adapts automatically to refactors: moving a component changes its `useSurface` declaration, which then immediately flags any string mapped to the old surface.

**Weaknesses:**
- Requires opt-in from every component: boilerplate; components without `useSurface` are silently unvalidated.
- Integration test coverage dependency: if an integration test doesn't exercise the mismatch code path, the assertion never fires.
- React Context overhead in test builds: minor but adds initialization complexity.
- New concept to document and train: new developers must learn `useSurface` exists and why it's required.

**Verdict:** Most accurate for catches of contextual mismatches, including multi-surface and dynamic keys. Requires discipline and test coverage.

---

### Option D: Playwright Surface Audit ("The Rendered Reality Check")

**How it works:** Every localized string element in the rendered UI is tagged with `data-i18n-key` and `data-i18n-surface` attributes (injected by the i18n layer in test builds). A dedicated Playwright CI step navigates to every screen, reads all such attributes, and compares them against `string-surface-map.json`.

```
1. Build with DATA_ATTRS=true (injects data attributes on every t() render).
2. Playwright audit script:
   a. Navigate to each screen in the game.
   b. Select all [data-i18n-key] elements.
   c. For each: check data-i18n-surface vs. string-surface-map[key].surface.
   d. Emit mismatch list.
3. CI fails if mismatch list is non-empty.
```

**Strengths:**
- Ground truth: the actual rendered DOM is the source of truth, not a declaration or convention.
- No separate registry file: the component's `data-i18n-surface` attribute IS the surface declaration.
- Catches all patterns: static keys, dynamic keys, multi-surface uses all produce DOM elements that are auditable.

**Weaknesses:**
- Slow: requires full render of every screen, which adds minutes to CI.
- Coverage gap: screens that are hard to reach in automated tests (error states, rare modals) go unchecked.
- Requires `data-i18n-surface` to be set correctly in components: if a component doesn't set it, the audit produces a false negative. Same opt-in problem as Option C.
- Playwright flakiness risk: screen navigation failures cause audit gaps.

**Verdict:** Best accuracy for strings that are reached; coverage gaps for rare paths. Slow. Best used as a thorough but non-blocking nightly step.

---

### Option E: Two-Tier Validation — Recommended ("The Layered Defense")

**How it works:** Combine fast static checks (pre-translation, PR-blocking) with thorough runtime checks (post-translation, nightly advisory). The static tier catches the majority of mistakes at commit time; the runtime tier catches the remaining cases at depth.

**Tier 1 — Fast, PR-blocking (seconds):**
- **Naming convention lint** (Option A): key prefix must match mapped surface. Runs on every PR. Zero dependencies.
- **Surface name existence check**: every surface referenced in the map must exist in `surfaces.json`. Catches renamed/deleted slots.
- **AST key extraction** (lightweight Option B): extract all statically traceable key names from source; flag any key that exists in source but not in the map (unmapped strings). Does not attempt surface inference — just completeness.

**Tier 2 — Thorough, nightly advisory (minutes):**
- **useSurface assertion integration tests** (Option C): exercise all UI paths in CI with assertions enabled. Failures generate a report but do not block PRs.
- **Playwright surface audit** (Option D): nightly full render audit. Mismatch report posted as a CI artifact and flagged in the team dashboard.

**Escalation path:** If the nightly Tier 2 run finds mismatches for 3 consecutive nights, the next PR touching any file in the affected component directory is blocked with a notice: "Unresolved surface mismatch detected in this area. See audit report."

**The key insight:** Tier 1 can run in seconds because it makes no claims about render context — it only validates that the map is internally consistent and complete. Tier 2 validates the map against reality, which requires rendering, which is slow. Separating these concerns gives developers fast feedback on the obvious errors while still catching the subtle ones.

---

## Developer Journeys

### Journey: Aarav, Senior Frontend, Adding High Contrast Accessibility Setting

**Context:** Aarav is adding a new accessibility setting — "High contrast mode" — to the Settings → Accessibility panel. He creates the i18n key `settings.accessibility.item.highContrast.label` and adds the German translation. He also needs an import-confirmation toast string: `toast.body.a11y.highContrast.confirmed`.

**The work (Day 1, 2:15 PM):**
Aarav adds both keys to `en-US.json`, writes their translations via the TMS integration, and adds them to `string-surface-map.json`. He maps:
- `settings.accessibility.item.highContrast.label` → surface `settings.panel`, slot `item`
- `toast.body.a11y.highContrast.confirmed` → surface `toast`, slot `body`

He opens a PR. The Tier 1 lint runs in 4 seconds.

```
✅ Naming convention: settings.accessibility.item.highContrast.label → prefix matches settings.panel ✓
✅ Naming convention: toast.body.a11y.highContrast.confirmed → prefix matches toast.body ✓
✅ Surface existence: settings.panel.item → found in surfaces.json ✓
✅ Surface existence: toast.body → found in surfaces.json ✓
✅ Key completeness: both keys found in source, both mapped ✓
```

PR merges. Aarav feels confident. The map is correct.

**Three days later:** the nightly Playwright audit runs. It finds both strings rendering in their declared surfaces. No mismatches. The string-surface-map.json is accurate.

**What Aarav did right:** The naming convention forced him to put the surface in the key name. When he named the key `toast.body.a11y...`, the lint checked that the map entry also said `toast.body`. He couldn't have the name say one thing and the map another without the lint failing.

**The limit of Tier 1:** If Aarav had named the key `a11y.highContrast.toastConfirmed` (not following convention), the lint would have warned but not blocked (naming convention is a soft rule without a surface prefix in the key). The nightly audit would have caught any actual mismatch within 24 hours.

---

### Journey: Margot, Mid-level Frontend, Refactoring Toast Component

**Context:** Margot is refactoring the accessibility notification toast. Product has decided that high-stakes accessibility confirmations should appear in a centered modal instead of a toast, for better visibility on small screens. She moves the rendering from `ToastA11yNotification.tsx` to `ModalA11yConfirmation.tsx`.

**The refactor (Day 1, 10:30 AM):**
Margot updates the component. The string `toast.body.a11y.highContrast.confirmed` now renders inside `ModalA11yConfirmation.tsx`. She forgets to update `string-surface-map.json` — the map still says surface `toast`, slot `body`. The modal is wider than the toast, so no overflow occurs. The budget lint passes. The pixel-width Playwright step passes. The naming convention lint... also passes, because the key name still starts with `toast.body.` — it's just that the name is now misleading.

**Day 2, 3:00 AM — Nightly Playwright Surface Audit:**
The audit navigates to the import flow and triggers the high-contrast import confirmation. It reads the rendered element:
```
data-i18n-key="toast.body.a11y.highContrast.confirmed"
data-i18n-surface="modal.confirm"  ← set by ModalA11yConfirmation.tsx
```
It checks the map:
```
string-surface-map["toast.body.a11y.highContrast.confirmed"].surface = "toast"
```
**MISMATCH DETECTED.** The audit report is posted to CI artifacts.

**Day 2, 9:00 AM:**
Margot opens her morning CI email. The nightly audit has a red flag: one surface mismatch in `toast.body.a11y.highContrast.confirmed`. The report shows:
```
Key: toast.body.a11y.highContrast.confirmed
Map says: toast.body
Rendered in: modal.confirm (ModalA11yConfirmation.tsx:47)
Budget implications: modal.confirm is 40 chars wider — current translation is safe, but no longer checked against toast.body budget.
Action: Update string-surface-map.json AND rename key to modal.confirm.a11y.highContrast.confirmed (naming convention enforcement).
```

**Day 2, 9:20 AM:**
Margot opens a follow-up PR. She updates the map entry and renames the key (with a TM migration note). The Tier 1 lint passes on the new key name. The next nightly audit finds no mismatches.

**What the system caught:** The nightly audit, not the PR-time checks. This is the expected behavior — refactor mismatches are inherently runtime concerns. The 24-hour window before detection is acceptable; the audit report gave Margot exactly what she needed to fix it.

**What Margot learned:** Surface mappings and key names are contract commitments, not just metadata. Moving a component means updating the contract.

---

### Journey: Dev (Internal QA), Investigating a Silent Mismatch That Evaded All Checks

**Context:** Dev is doing a quarterly audit of the string-surface-map. They are specifically looking for cases where the naming convention was not followed — strings added before the convention was enforced — and where the nightly audit has not caught mismatches because the affected strings are on screens that the Playwright audit doesn't fully navigate.

**The hunt (Day 1, 2:00 PM):**
Dev writes a one-off script that cross-references the map against the key name corpus and flags all entries where the key prefix does NOT encode the mapped surface:

```
Flagged 7 keys:
- a11y.confirmation.toast (mapped: toast.body) — legacy key, pre-convention
- notification.settingsChanged (mapped: toast.body) — added by a contractor
- confirm.a11y.import (mapped: modal.confirm) — added in a hotfix
... (4 more)
```

These 7 keys predate the naming convention. The nightly audit hasn't flagged them because — Dev checks — 5 of them are only triggered on error paths that the Playwright audit doesn't navigate. Specifically, `confirm.a11y.import` only appears during a mid-import profile-conflict resolution flow that requires two browser tabs open simultaneously, which the Playwright script doesn't simulate.

**Day 1, 3:30 PM:**
Dev manually tests the `confirm.a11y.import` flow. The key renders in `modal.confirm` as expected (correctly mapped). But the key name is `confirm.a11y.import`, which doesn't follow the naming convention and doesn't encode the surface in its prefix. This means future developers can't tell from the key name where it renders.

**Day 1, 4:00 PM:**
Dev files a minor task: rename the 7 legacy keys to follow naming convention, update string-surface-map.json, coordinate TM migration for each. Severity: low (no budget failures, no overflow). Priority: next sprint cleanup.

**What Dev learned:** The naming convention retroactively reveals legacy gaps. The quarterly audit practice is necessary — the automated checks catch ongoing work, but legacy debt needs human review. A "pre-convention key age report" in the CI dashboard would surface this passively.

**UI Annotation for the CI audit report:**
- **CI Dashboard panel:** "Surface Audit — Last Run: 3h ago" — green checkmark or amber warning icon.
- **Mismatch entry:** collapsible card, shows key name, mapped surface, rendered surface, component file and line number, budget implication diff (old budget → new budget for actual surface), one-click "Jump to string-surface-map.json" deep link.
- **Escalation banner:** if 3+ consecutive nightly runs have the same mismatch unresolved, the banner turns amber and shows "Escalation: next PR touching [component directory] will be blocked until resolved."

---

## Strengths and Weaknesses

**Two-tier system strengths:**
- Fast feedback loop (seconds) for naming convention errors — the most common mistake.
- Ground truth validation (nightly) catches the subtle refactor-without-update failure mode.
- Escalation path prevents indefinite ignore of audit findings without becoming a constant blocker.
- No single-point-of-failure: even if one tier degrades (Playwright flakiness, new dynamic keys), the other provides partial coverage.

**Two-tier system weaknesses:**
- 24-hour detection window for Tier 2 failures is tolerable for localization correctness but not for critical UI bugs. If surface mismatches could cause security issues (they don't, but hypothetically), nightly would be insufficient.
- The Playwright audit's screen coverage is inherently incomplete. Error-path strings, multi-tab flows, and rare modals require explicit test authoring to be audited.
- Escalation mechanism requires the team to monitor CI and act. A team with low CI hygiene will ignore the amber banner until it becomes a blocker.

---

## Interaction Effects

**With 4.69e-i-a-i-f-i-α-i-A-i-1-a-ii (Playwright pixel-width CI):** These two Playwright steps share test infrastructure. The surface audit can be combined with the pixel-width measurement in a single Playwright run, with each string element measured AND surface-checked in one DOM traversal. Combined report reduces CI duplication.

**With 4.69e-i-a-i-f-i-α-i-A-i-1-a-iii (Budget vs. TM conflicts):** When a surface mapping changes, the budget changes. If an approved TM entry was valid for the old surface but overflows the new surface, the conflict resolution workflow is triggered. The surface audit provides the trigger event — it detects the mapping change; the TM conflict workflow handles the translation consequence.

**With 4.69e-i-a-i-f-i-α-i-A-iv (displayPrefs registry as living artifact):** Same governance pattern. Both files are declarations that must stay in sync with code reality. The two-tier validation model (fast lint + thorough audit) is directly applicable to the displayPrefs registry. A shared "living artifact governance" pattern could be documented once and applied to both.

---

## Sensory Description

The CI surface audit report feels like a **code smell report, not a build failure**. It's amber, not red. It arrives quietly as an artifact in the morning dashboard — a collapsible list of mismatches with a calm header: "Surface Audit — 1 mismatch detected."

Each mismatch card is a cool dark rectangle with three columns: the key name (monospace, underlined), an arrow pointing from the declared surface to the actual surface (the arrow is amber, suggesting a gap, not a crisis), and a budget diff showing the effective budget change in characters (green if the actual surface is more generous, red if less).

The one-click deep link to the map file glows with a faint blue underline — it takes the developer exactly to the relevant line in `string-surface-map.json`, not just the file. A small "last reviewed" timestamp next to each mismatch shows how long it has been unresolved.

When the escalation banner activates after three consecutive nightly hits, it appears at the top of the PR check list — not as a hard red blocking indicator, but as a cautionary amber strip: "⚠ Unresolved surface mismatch in this area. Review audit report before merging." The developer can dismiss it after clicking "View report," proving they've seen it.

The naming convention lint failure is different in character — it fires in seconds, before the PR is even reviewable. It's red and immediate: "Key 'confirm.a11y.import' mapped to surface 'modal.confirm' but key prefix does not encode this surface. Rename to 'modal.confirm.a11y.import' or update the surface declaration." The diff suggestion is inline in the lint output.

---

## Comparable Systems

**ESLint import/no-cycle:** detects circular imports that are syntactically valid but semantically wrong — same category as detecting a "syntactically valid but semantically wrong" surface mapping. The principle of catching structural inconsistencies in static analysis is directly analogous.

**TypeScript's structural type system:** the `useSurface` hook approach is analogous to TypeScript interfaces — you declare a contract at the component level, and the type system (or assertion) enforces it. The innovation here is that the "type" is a localization surface rather than a data shape.

**Jest snapshot testing:** the nightly Playwright audit is similar in spirit — it captures the "ground truth" state of rendered output and flags when it diverges from expectations. The difference is that surface audit expectations are declared in a map file rather than auto-generated snapshots, which makes them more intentional but more labor-intensive to create.

**Storybook's a11y addon:** validates accessibility properties at render time in a component development environment, producing per-component reports. The surface audit's Playwright approach is analogous but applied to localization correctness rather than accessibility compliance.

---

## New Sub-Aspects Discovered

- **4.69e-i-a-i-f-i-α-i-A-i-1-a-i-A-α — Multi-surface string handling:** strings legitimately used in two different surfaces (e.g., the same error message rendered in a toast and in a modal fallback) require the map to declare multiple surfaces per key; the validator must support this without treating it as a mismatch; design of the multi-surface map schema and how the budget lint handles it (use strictest budget, or all budgets?)
- **4.69e-i-a-i-f-i-α-i-A-i-1-a-i-A-β — Dynamic key construction tracing:** `t('toast.' + variant)` cannot be statically traced; options include template-literal detection (flag all dynamic constructions as audit-only), convention-enforced prefix-only dynamics (only the suffix can be dynamic), or dev-mode key logging (record all dynamically constructed keys during integration tests and add them to the audit corpus)
- **4.69e-i-a-i-f-i-α-i-A-i-1-a-i-A-γ — component-surface-registry.json as a parallel living-artifact problem:** Option B requires a registry mapping component files to surfaces; this registry has the same maintenance governance problem as string-surface-map.json; a meta-validator is needed to keep the registry in sync with the actual component tree
- **4.69e-i-a-i-f-i-α-i-A-i-1-a-i-A-δ — Legacy key migration tooling:** when naming convention enforcement is introduced retroactively, all pre-convention keys need renaming; a migration script that renames keys, updates all call sites, and creates TM migration records must be designed; the migration should be idempotent and reversible
- **4.69e-i-a-i-f-i-α-i-A-i-1-a-i-A-ε — Audit coverage metrics as a first-class CI artifact:** tracking what percentage of mapped keys are actually reached by the Playwright audit each nightly run; coverage below 70% triggers a suggestion to add audit test coverage; coverage percentage displayed alongside the mismatch count in the CI dashboard

# Multi-Surface String Handling in string-surface-map.json

**Aspect:** 4.69e-i-a-i-f-i-α-i-A-α — Multi-surface string handling: strings legitimately used in two different surfaces (e.g., same error message in toast and modal fallback); map schema must declare multiple surfaces per key; validator must not flag these as mismatches; budget lint must use strictest-budget policy across all declared surfaces

**Parent:** 4.69e-i-a-i-f-i-α-i-A-i-1-a-i-A — `string-surface-map.json` validation as a PR requirement (established two-tier validation: Tier 1 fast/PR-blocking, Tier 2 nightly advisory; identified Option A naming convention as breaking for multi-surface strings)

**Grandparent chain:** → 4.69e-i-a-i-f-i-α-i-A-i-1-a-i → 4.69e-i-a-i-f-i-α-i-A-i-1-a → 4.69e-i-a-i-f-i-α-i-A-i-1 → 4.69e-i-a-i-f-i-α-i-A-i → 4.69e-i-a-i-f-i-α-i-A → 4.69e-i-a-i-f-i-α-i → 4.69e-i-a-i-f-i → 4.69e-i-a-i-f

**Cross-references:**
- 4.69e-i-a-i-f-i-α-i-A-i-1-a-i-A — Parent validation design; established that Option A (naming convention) is "impossible for multi-surface strings"
- 4.69e-i-a-i-f-i-α-i-A-i-1-a — Budget table maintenance; multi-surface strictest-budget policy directly affects the generator that produces `l10n/budget.json`
- 4.69e-i-a-i-f-i-α-i-A-i-1-a-i-B — Responsive surface budget model (sibling); multi-surface policy interacts with breakpoint-specific budgets: a string may be multi-surface on desktop but single-surface on mobile
- 4.69e-i-a-i-f-i-α-i-A-i-1-a-iii — Budget vs. TM conflicts; multi-surface strings create a new TM conflict scenario: a TM-approved translation fits the original surface but not the additional surface

---

## The Core Problem

The parent analysis (4.69e-i-a-i-f-i-α-i-A-i-1-a-i-A) established that `string-surface-map.json` contains one entry per string key, mapping it to the surface/slot where it renders. The two-tier validator then asserts that the string's call sites match its declared surface.

That design has an implicit assumption: **one key, one surface**. The assumption breaks whenever a string is intentionally reused across two surfaces. This is not an error — it is a common, useful pattern:

- `error.sampleSizeWarning.body` appears as a toast warning AND as the body of a fallback modal when the toast is dismissed too quickly
- `label.configVersion` appears in the workbench header tooltip AND as a column header in the audit log table
- `accessibility.toast.confirm` appears in the post-import confirmation toast AND (on mobile, where toast is suppressed) in a bottom-sheet modal

If the validator naively checks "every call site matches the declared surface," these legitimate multi-surface usages generate spurious failures. Developers either:
1. Suppress the validation for the entire key (defeating the purpose)
2. Duplicate the string under two keys with identical content (translation cost, divergence risk)
3. Abandon the validation system as producing too many false positives

All three outcomes are worse than designing the schema correctly from the start.

### The Three Design Problems

Multi-surface strings create three distinct sub-problems:

**Problem 1: Schema** — How does `string-surface-map.json` represent a key that belongs to multiple surfaces? The schema must be backward-compatible (existing single-surface entries must not change), must be explicit (implicit "any surface" is never valid), and must be queryable by the budget generator.

**Problem 2: Validation** — The two-tier validator must recognize multi-surface declarations as valid and check that *all* declared surfaces are present in the call-site trace (not just one), and that *no* un-declared surfaces appear. The validator must distinguish "multi-surface by declaration" from "single-surface with accidental drift."

**Problem 3: Budget** — The budget lint cannot apply two different budgets to the same key. It must select one. The strictest-budget policy (use the tightest budget across all declared surfaces) is the safe choice, but it creates its own failure mode: a string that fits both surfaces individually may be rejected because the stricter surface's budget is tighter than needed for the looser surface.

---

## Option A: Inline Array Schema ("The Flat Multi")

**Schema design:**

Single entries are unchanged:
```json
{ "key": "toast.body.a11y.reducedMotion", "surface": "toast", "slot": "body" }
```

Multi-surface entries declare `surfaces` (plural, array) and `slots` (array, parallel):
```json
{
  "key": "shared.error.sampleSizeWarning.body",
  "surfaces": ["toast", "modal.confirm"],
  "slots": ["body", "body"]
}
```

The `shared.` namespace prefix signals that this key is multi-surface and cannot follow the single-surface naming convention. The validator applies naming-convention checks *only* to entries with a scalar `surface` field; entries with a `surfaces` array are exempt from the prefix check and instead require the `shared.` prefix.

**Validation behavior:**
- Tier 1 (PR-blocking): check that all keys with `surfaces` array have `shared.` prefix; check that `surfaces` and `slots` arrays are same length; check that all surface names exist in `surfaces.json`. No AST trace at this tier (fast path).
- Tier 2 (nightly): AST trace produces `{key → [component1, component2] → [surface1, surface2]}` triples. For multi-surface keys, validator asserts that the set of traced surfaces matches exactly the declared `surfaces` array — no more, no less.

**Budget behavior:**

The budget generator, when it encounters a `surfaces` array, looks up each surface's per-locale budget and selects the minimum across all surfaces. This minimum budget is written to `l10n/budget.json` under the key:

```json
"shared.error.sampleSizeWarning.body": {
  "de-DE": { "soft": 62, "hard": 74 },
  "fr-FR": { "soft": 65, "hard": 78 },
  "ja-JP": { "soft": 30, "hard": 36 },
  "_strictest_surface_per_locale": {
    "de-DE": "toast",
    "fr-FR": "toast",
    "ja-JP": "modal.confirm"
  }
}
```

The `_strictest_surface_per_locale` metadata is written for transparency — the lint step logs it in CI output when a key fails, showing the developer *which* surface is constraining them.

**Strengths:**
- Schema is backward-compatible: zero changes to existing single-surface entries.
- The `shared.` namespace is self-documenting: any developer reading the key name knows it's multi-surface.
- The `_strictest_surface_per_locale` metadata makes budget failures legible ("your German translation is too long for the toast surface, which is the strictest declarer for de-DE").
- Nightly Tier 2 validation catches accidental new usages (developer adds a third call site without updating the declaration).

**Weaknesses:**
- The `surfaces`/`slots` parallel-array schema is error-prone: if a developer adds a surface but forgets the slot, they get a length mismatch error, not a helpful message.
- The `shared.` prefix convention creates a two-class namespace: `toast.body.*` for single-surface, `shared.*` for multi-surface. New developers must learn this distinction before writing strings.
- The strictest-budget policy creates false rejections for the looser surface: a string that fits the modal fine but fails the toast budget will be rejected even for modal-only translations.

**Verdict:** The cleanest schema. Recommended with the enhancement in Option C (surface-scoped translation overrides as the escape hatch for false rejections).

---

## Option B: Separate Entry Per Surface ("The Exploded Map")

**Schema design:**

The map file allows duplicate keys with different surface declarations:
```json
{ "key": "error.sampleSizeWarning.body", "surface": "toast", "slot": "body" },
{ "key": "error.sampleSizeWarning.body", "surface": "modal.confirm", "slot": "body" }
```

No schema change. The validator uses a multi-map (key → [surfaces]) where duplicate keys aggregate into an array.

**Validation behavior:**
- Tier 1: check for duplicate keys and assert they are intentional (require a `"multi_surface": true` annotation on at least one entry, or use a `MULTI:` comment convention).
- Tier 2: AST trace unchanged; the validator looks up the multi-map and expects all traced surfaces to appear in it.

**Budget behavior:**

The budget generator aggregates all entries for a duplicate key and takes the minimum budget across them. Same strictest-budget policy, different schema path.

**Strengths:**
- No new schema constructs: works with any JSON tooling that supports array format.
- Naming convention is not violated: `toast.body.*` naming still works if the same key name appears under both surfaces.

**Weaknesses:**
- Naming convention is actually violated in the other direction: `toast.body.error.sampleSizeWarning` cannot also name its surface `modal.confirm`. The encoding breaks.
- Duplicate keys in JSON are technically invalid (RFC 8259: "The names within an object SHOULD be unique"). Most parsers return the last value, silently dropping earlier entries. The "exploded map" is not valid JSON.
- Even if the format switches to an array of objects (JSONC or YAML), duplicate-key aggregation requires custom logic at every read site.

**Verdict:** Superficially appealing but structurally broken. Not recommended.

---

## Option C: Inline Array with Surface-Scoped Translation Overrides (Enhancement to A)

**The escape hatch problem:**

The strictest-budget policy creates a structural tension. If surface A (toast, 320px wide) constrains the budget for a string that also appears on surface B (modal, 480px wide), all translations must fit the toast. This is often correct — you want the string to fit wherever it appears. But it creates translation work: the translator must find a shorter phrase than would naturally fit the modal.

Surface-scoped overrides allow a translation to provide a short version for the constrained surface and a longer version for the generous surface:

```json
// en-US.json
{
  "shared.error.sampleSizeWarning.body": "Sample size is too small for reliable analysis.",
  "shared.error.sampleSizeWarning.body#toast": "Sample size too small.",
  "shared.error.sampleSizeWarning.body#modal.confirm": "The selected sample size is too small for reliable statistical analysis."
}
```

The `#surface` suffix variant overrides the base string for a specific surface. The component's `t()` call passes the current surface context as a hint:

```typescript
// ToastComponent.tsx
const text = t('shared.error.sampleSizeWarning.body', { surface: 'toast' })
// resolves: "shared.error.sampleSizeWarning.body#toast" if present, else base key

// ModalComponent.tsx
const text = t('shared.error.sampleSizeWarning.body', { surface: 'modal.confirm' })
// resolves: "shared.error.sampleSizeWarning.body#modal.confirm" if present, else base key
```

**Budget behavior with overrides:**

The budget generator checks each variant against its specific surface's budget:
- `#toast` variant → checked against toast budget
- `#modal.confirm` variant → checked against modal.confirm budget
- Base key (no suffix) → checked against the strictest-budget surface as before

This means a developer can write a surface-specific translation that uses the full width of its surface, without being constrained by the tighter surface.

**Validator implications:**

The AST trace must record both the key and the surface argument to `t()`. The validator checks that all `t('shared.error.*', { surface: 'X' })` call sites have `X` in the declared `surfaces` array. Call sites without a `surface` argument on a multi-surface key generate a Tier 2 advisory: "Multi-surface key used without surface context — falling back to strictest-budget base translation."

**Strengths:**
- Eliminates false rejections: translators can use the full modal width for modal strings.
- Explicitly models the real-world pattern: UI copy for toasts is naturally terse; copy for modals is naturally more expressive.
- The `t()` API change is backward-compatible: single-surface strings never pass a `surface` argument.

**Weaknesses:**
- Translation surface explosion: each multi-surface key can now have N+1 variants (base + one per surface). For a string in 3 surfaces × 10 locales, that's up to 30 translation cells instead of 10.
- TM matches fragment: the `#surface` suffix variants are different TM segments from the base key. TM reuse drops significantly.
- The `surface` argument in `t()` must be validated at Tier 2 — a wrong surface name silently falls back to the base key, which may be the wrong behavior.

**Verdict:** The right escape hatch for the ~5% of multi-surface strings where the budget disparity is large enough to matter. Not the default behavior. Introduce in Phase 2 after multi-surface schema stabilizes.

---

## The Strictest-Budget Policy: Formal Definition

The budget lint rule for multi-surface strings is:

> For each locale L and each multi-surface key K, the approved translation T(K, L) must have a rendered width ≤ min(budget(S, L)) for all surfaces S in K's declared surface set.

"Rendered width" here means character count at the pre-translation stage (Tier 1 lint), or pixel width at the post-translation stage (Tier 2 Playwright audit).

**Sub-policy: per-locale strictest, not global strictest**

The strictest budget is computed per-locale, not globally. This matters because surface size hierarchies can invert across locales:

- In en-US: toast body budget = 80 chars, modal body budget = 200 chars → strictest is toast
- In ja-JP: toast body budget = 24 chars (CJK compression), modal body budget = 60 chars → strictest is still toast, but the absolute values are very different
- In ar-SA: toast body budget = 70 chars (RTL layout is 320px but character density is lower), modal body budget = 180 chars → strictest is toast

Per-locale strictest means the budget file entry for each locale independently identifies and applies the minimum. The `_strictest_surface_per_locale` metadata field in `l10n/budget.json` records this.

**Sub-policy: soft vs. hard budget under strictest policy**

When computing the minimum across surfaces, the generator applies minimum to soft budgets and minimum to hard budgets independently. It does NOT mix: it does not use surface A's soft as the multi-surface soft and surface B's hard as the multi-surface hard. Both values come from the same (strictest) surface.

This prevents a pathological case where the soft comes from a generous surface and the hard comes from a tight surface, creating a band (soft–hard) so narrow that lint warnings become indistinguishable from lint failures.

---

## Developer Journeys

### Journey: Aarav, 28, Front-End Developer (Robot Uprising team)

**Context:** Aarav is adding a new "sample size too small" validation warning. The design spec says it appears as a toast when the player runs analysis from the career analysis panel, and as a modal body when the player force-runs analysis despite the warning having been shown. He's adding the string to `en-US.json` and needs to update `string-surface-map.json`.

**Minute 0:00 — The String Addition**

Aarav opens `i18n/en-US.json`. He adds:
```json
"shared.error.sampleSizeWarning.body": "Sample size too small for reliable results."
```

He uses the `shared.` prefix because he read the contributing guide last month and remembers it. He opens `string-surface-map.json`.

He reads the schema docs in the comments at the top of the file:
```json
// Multi-surface keys use "surfaces" (array) + "slots" (array), same length.
// Single-surface keys use "surface" (scalar) + "slot" (scalar).
// All multi-surface keys MUST use the shared. prefix.
```

He adds:
```json
{
  "key": "shared.error.sampleSizeWarning.body",
  "surfaces": ["toast", "modal.confirm"],
  "slots": ["body", "body"]
}
```

He commits both files. CI runs.

**Minute 2:30 — Tier 1 Lint Passes**

The PR CI shows green. Tier 1 check ran in 1.2 seconds:
```
✓ string-surface-map Tier 1 lint
  Validated 147 single-surface entries (naming convention)
  Validated 4 multi-surface entries (prefix + array length + surface existence)
  No errors found.
```

Aarav merges. The nightly Tier 2 audit will run tomorrow and check AST traces.

**Minute 2:40 — Budget Generator Runs**

A pre-merge step runs the budget generator. It processes `shared.error.sampleSizeWarning.body` and emits:
```json
"shared.error.sampleSizeWarning.body": {
  "de-DE": { "soft": 58, "hard": 70, "_strictest_surface": "toast" },
  "fr-FR": { "soft": 60, "hard": 72, "_strictest_surface": "toast" },
  "ja-JP": { "soft": 22, "hard": 26, "_strictest_surface": "toast" },
  "ko-KR": { "soft": 20, "hard": 24, "_strictest_surface": "toast" }
}
```

Toast is the strictest surface for every locale. The modal has a more generous budget. The translation team will work against the toast budget across all locales.

**Minute 3:00 — Resolution**

Aarav's PR merges. He has done the right thing without needing localization expertise: he named the key correctly, filled in both surface declarations, and the tooling handled the rest. The translation vendor receives the English string with the per-locale budgets. The tighter toast budgets shape the translations for both surfaces.

**UI Annotations:**
- CI Tier 1 lint output: monospace terminal box in PR status; green checkmark with counts of single vs. multi entries; no detailed output unless there's a failure
- Budget generator output: not shown in PR UI, but the updated `l10n/budget.json` diff is visible in the file tree; `_strictest_surface` metadata is readable in the diff

---

### Journey: Margot, 34, Senior Developer (component refactoring)

**Context:** Margot is refactoring the toast system. A new design decision: some error toasts are being promoted to full-screen modals on mobile viewports. The `shared.error.sampleSizeWarning.body` string now also appears in a new `modal.full-screen` surface on mobile. Margot adds the new component, which calls `t('shared.error.sampleSizeWarning.body', { surface: 'modal.full-screen' })`, but she does not update `string-surface-map.json`.

**Minute 0:00 — The PR Goes In**

Margot's refactor PR merges. CI Tier 1 passes (the map file has not changed; no new keys were added). The nightly Tier 2 audit runs the next morning.

**Minute 0:00 (next day) — Nightly Audit Fires**

Margot arrives to a Slack notification: "Nightly string-surface audit found 1 advisory." The audit report:

```
ADVISORY — nightly string-surface-map audit
  Key: shared.error.sampleSizeWarning.body
  Declared surfaces: ["toast", "modal.confirm"]
  AST-traced surfaces: ["toast", "modal.confirm", "modal.full-screen"]

  Un-declared surface found: modal.full-screen
  Component: src/components/mobile/FullScreenErrorModal.tsx

  This key is rendered in a surface not listed in string-surface-map.json.
  Options:
    1. Add "modal.full-screen" to this key's declared surfaces array.
    2. Create a new key for the full-screen modal content.
  See: docs/l10n/multi-surface-strings.md
```

**Minute 1:00 — Margot Updates the Map**

Margot sees the advisory. She opens `string-surface-map.json` and adds `modal.full-screen` to the surfaces array. She runs the budget generator locally:

```
Budget generator: processing shared.error.sampleSizeWarning.body
  Surfaces: toast, modal.confirm, modal.full-screen
  Strictest per locale:
    de-DE: toast (58 chars soft) — unchanged
    fr-FR: toast (60 chars soft) — unchanged
    ja-JP: toast (22 chars soft) — unchanged
    [all locales: toast remains strictest]
  Budget unchanged. No retranslation needed.
```

The full-screen modal is even more generous than `modal.confirm`, so adding it does not tighten any budgets. The existing translations are still valid.

**Minute 2:00 — Resolution**

Margot files a one-line PR updating `string-surface-map.json`. CI passes. The advisory clears in tomorrow's nightly run.

**UI Annotations:**
- Slack notification: posted by the CI webhook, formatted as a warning block with a link to the audit report artifact
- Advisory report: structured text in CI job log; each advisory shows declared vs. traced surfaces with a clear diff view and suggested options
- Budget generator local output: printed to terminal in human-readable format with a clear "unchanged / changed" summary line

---

### Journey: Dev, 26, Localization QA (catching a budget regression)

**Context:** Dev is reviewing translated strings for de-DE. He is running the Tier 1 char-count lint against the German translations provided by the vendor. The vendor translated `shared.error.sampleSizeWarning.body` as "Stichprobengröße zu klein für zuverlässige Ergebnisse." (58 chars). The budget says 58 chars soft, 70 hard. It passes. Two months later, the toast surface is redesigned to be narrower: 280px instead of 320px. The budget generator is re-run.

**Minute 0:00 — Budget Tightens**

A layout engineer runs the budget generator after the 280px toast redesign. The new output:

```
Budget generator: updating shared.error.sampleSizeWarning.body
  de-DE strictest surface: toast (was 58 soft/70 hard → now 51 soft/62 hard)
  REGRESSION: existing German translation "Stichprobengröße zu klein für zuverlässige Ergebnisse." is 58 chars
  58 > 51 (new soft limit). Budget exceeded.
  Translation status: SOFT VIOLATION (still within hard limit of 62)
  Action required: retranslation recommended. Current translation fits but is above soft budget.
```

**Minute 1:00 — Dev Sees the Regression Report**

Dev receives the budget regression triage ticket. The `_strictest_surface: toast` annotation tells him the violation is because of the toast narrowing, not the modal. He has two options:

1. Request a shorter German translation from the vendor (additional cost, ~$2 for one string)
2. Accept the soft violation (the string still fits within the hard limit) and flag it for the next retranslation batch

Dev checks the actual pixel width via the Tier 2 Playwright audit (already queued as a nightly run). The audit shows the 58-char German string renders at 274px in the 280px toast — 6px margin. Hard limit (62 chars, ~290px) was not breached.

**Minute 2:30 — Resolution**

Dev accepts the soft violation for now and adds the key to the next-cycle retranslation queue with a note: "toast narrowed to 280px; de-DE slightly over soft budget but within hard; request tighter phrasing at next vendor cycle." He updates the ticket with the pixel-width data from the Playwright audit.

**UI Annotations:**
- Budget regression report: emitted by the budget generator as a structured JSON diff with human-readable summary; regression items are categorized as SOFT VIOLATION, HARD VIOLATION, or COMPLIANT; only regressions are in the report
- `_strictest_surface` annotation: always present in regression items; provides the "why this tightened" context without requiring the developer to trace back through surfaces.json manually
- Pixel-width Playwright audit: renders strings in a headless browser, emits a table of key → surface → locale → pixel width → budget → pass/fail; soft violations are yellow, hard violations are red

---

## Interaction Effects

**With Option A naming convention (4.69e-i-a-i-f-i-α-i-A-i-1-a-i-A, Option A):**

The naming convention check must be gated on the `surfaces` field:
- If entry has scalar `surface`: apply naming convention check (key must start with `{surface}.{slot}.`)
- If entry has array `surfaces`: skip naming convention check; require `shared.` prefix instead

These are mutually exclusive rules. The validator runs the appropriate rule based on schema shape, not a flag.

**With responsive surface budgets (4.69e-i-a-i-f-i-α-i-A-i-1-a-i-B):**

Multi-surface strings combined with responsive budgets create a 3D constraint space: (string key) × (surface) × (breakpoint). The strictest-budget policy extends naturally: for each locale, take the minimum budget across all declared surfaces AND all declared breakpoints. This is the most conservative policy and may produce very tight budgets for strings that appear in a small toast on mobile AND a small surface at a small breakpoint. Phase 1 can simplify by taking strictest across surfaces only (ignoring breakpoints for multi-surface strings) and revisiting in Phase 2.

**With surface-scoped translation overrides (Option C of this analysis):**

The override system is the release valve for the strictest-budget policy. When a multi-surface string generates a budget tight enough to require unnatural phrasing, the developer adds surface-scoped variants. The validator must track which `#surface` variant is used at which call site and check that the variant fits its specific surface's budget — not the strictest-budget minimum.

**With the audit log (4.69e-i-a-i-f-i-α-i-A-i-1-a-i-A parent, Option D infrastructure):**

The `string-surface-map.json` nightly audit produces advisory entries in the CI log. These advisories should be surfaced in the same quarterly audit report as mismatch counts. Multi-surface drift (new call site without declaration update) should be tracked as a separate metric from single-surface mismatches, because multi-surface drift is often caused by legitimate component growth rather than developer error.

**With TM conflicts (4.69e-i-a-i-f-i-α-i-A-i-1-a-iii):**

Multi-surface strings have a specific TM conflict scenario: a translation was approved for the base key when only one surface was declared. A second surface is later added, tightening the strictest budget. The existing TM-approved translation now fails the new budget. This is a budget tightening event, not a new translation request — the translation is already approved but the constraint changed. The conflict resolution policy from 4.69e-i-a-i-f-i-α-i-A-i-1-a-iii should explicitly handle this case: classify it as a "surface expansion tightening" event with a 30-day grace period before the TM entry is flagged as budget-expired.

---

## Sensory Description

The developer experience of working with multi-surface strings should feel like getting a precise mechanical objection, not a vague warning. The CI output for a multi-surface violation reads like a compiler error: the exact key, the declared surfaces, the traced surfaces, the diff between them. The failing check is highlighted in orange (not red — it's an advisory, not a build failure at Tier 2), with a two-line suggested fix printed below.

The budget regression report looks like a diff of two tables side by side: the old budget column in grey, the new budget column in amber (soft violation) or red (hard violation), the existing translations listed below with their char counts in the same amber/red if they now exceed the budget. The `_strictest_surface` label appears in blue italic — a metadata annotation, visually distinct from the primary pass/fail state.

The budget generator's terminal output is a tight, structured log: one line per key with a change summary. New keys print in green. Unchanged keys print in dim grey. Budget-tightened keys print in amber with the delta in parentheses: `(de-DE: 58→51 soft)`. The phrase "No retranslation needed" or "Retranslation recommended" ends each changed key's line, so a developer scanning the log in 5 seconds can identify the action items without reading every number.

The `shared.` prefix in key names has its own visual register in the translation editor: a light blue badge reading "MULTI" appears next to any key with a `surfaces` array in its map entry. Translators see at a glance that this string must be short enough for all its declared surfaces, not just the one they happen to be working on.

---

## Comparable Systems

**Android string resources `<plurals>` and `<string-array>`:** Android's resource system allows a single resource name to resolve to different string variants depending on context (plural count, array index). Multi-surface strings are the same idea: one key, multiple resolution contexts. Android's solution is a structured XML element with child nodes, not flat key-value pairs. The `surfaces` array approach in Option A mirrors this: the flat JSON key gets a structured value to handle context variance.

**CSS custom properties with cascade:** In CSS, a custom property value can be overridden at any scope level. Surface-scoped translation overrides (Option C) work the same way: the base translation is the "cascaded default," and the `#surface` suffix override is the local scope. The mental model is identical to CSS custom property inheritance — the more-specific context wins.

**ICU MessageFormat placeholders:** The ICU MessageFormat standard allows a single string key to produce different output depending on runtime variables (gender, plural, select). Multi-surface string handling is a design-time analog: the output is fixed per locale but varies by surface. A future evolution could merge the two concepts: a single key produces ICU-format output that varies by both locale AND surface, rendered by the same `t()` call.

---

## The TikTok Clip

Developer tooling does not have TikTok clips. But if there were one: the 15 seconds is the budget regression email. A localization engineer opens the morning CI digest. It shows the old budget column in grey next to the new column in amber. They see the `_strictest_surface: toast` annotation, understand immediately that a layout engineer narrowed the toast, and click "Add to retranslation queue." Seventeen seconds of flow. Zero ambiguity. That precision is the product.

---

## New Aspects Discovered

- **4.69e-i-a-i-f-i-α-i-A-α-i — Multi-surface string forking policy:** when one surface of a multi-surface string changes requirements significantly (e.g., a toast string becomes much shorter due to UI redesign while the modal version should stay expressive), should the key be forked into two single-surface keys? Design of the forking workflow, the migration tooling, and the TM impact of key renaming.

- **4.69e-i-a-i-f-i-α-i-A-α-ii — `shared.` namespace governance:** the `shared.` prefix creates a reuse-encouraging pattern; as the shared namespace grows, strings can accumulate more surface declarations over time through organic growth; governance model for when a string has accumulated 4+ surfaces and whether it should be split; "shared string sprawl" as an anti-pattern; the audit metric tracking average surface count per `shared.*` key.

- **4.69e-i-a-i-f-i-α-i-A-α-iii — Multi-surface strings in translation memory deduplication:** when the same key has both a base translation and `#surface` variants, TM segment matching treats them as different segments; design of TM reuse logic for surface variants (should `#toast` variant get a TM match against the base key translation as a starting point, or start cold?); impact on first-pass translation cost.

- **4.69e-i-a-i-f-i-α-i-A-α-iv — Strictest-budget policy edge case: two surfaces with identical budgets:** if surface A and surface B have the same budget for a locale, the "strictest" is a tie; no single `_strictest_surface` can be named; design of the tie-breaking rule and how ties are reported in the regression log (both surfaces named? first alphabetically? first declared?).

- **4.69e-i-a-i-f-i-α-i-A-α-v — Multi-surface detection in legacy codebase scan:** for an existing codebase that predates the schema, a one-time scan identifying string keys called from multiple component contexts and auto-generating draft multi-surface map entries; the semi-automated migration from "single-surface map with silent multi-surface usage" to "declared multi-surface map"; false positive rate of the scan and review workflow.

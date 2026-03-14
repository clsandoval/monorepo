# Fork Suppression Expiry and `review_trigger` Evaluation

**Aspect:** 4.69e-i-a-i-f-i-α-i-A-α-i-1 — Fork suppression expiry and `review_trigger` evaluation: formal semantics for when suppression re-enables; what conditions are expressible; CI evaluation logic

**Parent:** 4.69e-i-a-i-f-i-α-i-A-α-i — Multi-surface string forking policy (established: Option 5 — manual forking with comprehensive tooling; `fork_advisory_suppressed` with required reason/reviewed_by/reviewed_at; optional `review_trigger` for auto-re-enabling)

**The gap this closes:** The parent analysis introduced `review_trigger` in passing — Margot's journey showed `"review_trigger": "tooltip budget < 20"` as an example, and the PR diff showed it being added to the map entry. But the semantics were deferred: what is the expression language? What conditions are evaluable? How does CI check them? When exactly does suppression re-fire? What happens to stale suppressions whose author has left the team?

---

## The Core Problem

A fork advisory suppression is a decision made by a specific person on a specific day about a specific state of the world. The decision is: "I've reviewed the fork advisory for `shared.label.configVersion` and determined that forking is not appropriate right now, because the budget divergence is driven by a layout artifact, not a conceptual split."

The problem is that the world changes. Layouts narrow further. New surfaces are added. Months pass. The person who made the decision leaves the team. The `fork_advisory_suppressed: true` flag in the map entry persists indefinitely — there is no TTL, no expiry, no mechanism for the decision to age gracefully.

Without a lifecycle for suppression, the system creates **advisory debt**: suppressions accumulate, each suppressing real signals, until either a developer audits the suppression log manually or a production issue surfaces the problem.

The `review_trigger` field was introduced as the answer — an optional condition that the CI budget generator evaluates on each run. If the condition is met, the suppression is lifted and the advisory re-fires.

This analysis designs that system rigorously.

---

## Suppression Lifecycle States

Before exploring condition types, the lifecycle needs formal states:

```
INITIAL → ACTIVE → (condition met) → TRIGGERED
                ↘ (permanent) → PERMANENT
                        ↑
                   (explicit only)
```

| State | `fork_advisory_suppressed` value | Meaning |
|-------|----------------------------------|---------|
| No suppression | `false` or absent | Advisory fires normally |
| Active suppression | `true` | Advisory silenced; condition not yet met |
| Triggered | `"triggered"` | Condition met; advisory re-fires; developer must act |
| Permanent | `"permanent"` | Explicit opt-in to lifetime suppression; no condition; requires extra justification |

The `"triggered"` sentinel state is important. It is distinct from `false` (never suppressed) and `true` (currently suppressed). When CI detects a triggered condition, it sets the value to `"triggered"` in a commit and re-fires the advisory. The developer sees:

```
FORK ADVISORY (SUPPRESSION TRIGGERED)
  Key: shared.label.configVersion
  Suppression condition: budget(tooltip.workbench-header) < 20
  Current tooltip budget: 17 chars
  Trigger reason: budget dropped below threshold after responsive layout refactor
  Original suppression: 2026-03-14 by margot
  Original reason: "Version label: semantically identical across all surfaces; budget
                    disparity from tooltip narrowing, not conceptual split."

  The condition you set has now been met. Review the fork decision.
  To re-suppress: update fork_advisory_suppressed with new reason
  To fork: make fork-string KEY=shared.label.configVersion
```

The developer must actively re-suppress or fork. They cannot passively let the `"triggered"` state persist — Tier 1 lint treats `"triggered"` as an unresolved advisory (PR-blocking after 30 days).

---

## Option A: Free-Text `review_trigger`

**Design:**

`review_trigger` is a human-readable string. CI does not evaluate it. It is documentation.

```json
{
  "fork_advisory_suppressed": true,
  "fork_advisory_reason": "Version label: semantically identical; layout-driven budget gap.",
  "fork_advisory_reviewed_by": "margot",
  "fork_advisory_reviewed_at": "2026-03-14",
  "review_trigger": "When the tooltip is redesigned or a new surface is added."
}
```

**Strengths:**
- Zero implementation cost. No expression parser. No evaluation logic.
- Expressive: the developer can describe any condition in plain language, including ones that are not computable from static data (e.g., "when the tooltip redesign is shipped from the design team").
- Readable in code review: reviewers can judge whether the trigger condition is appropriate.

**Weaknesses:**
- CI cannot evaluate it. The trigger fires only if a developer reads the suppression log and manually decides the condition has been met. In practice, no one reads the suppression log.
- Creates advisory debt guaranteed: free-text triggers accumulate indefinitely. There is no automated enforcement.
- The trigger description ages poorly. "When the tooltip is redesigned" is meaningful when Margot writes it. Two years later, after three tooltip redesigns, it's unclear whether the trigger has been met.

**Verdict:** Insufficient as the only mechanism. Useful as an adjunct to structured conditions — a "plain language explanation" of the structured condition for reviewers who don't want to parse YAML. Recommended as a companion `review_trigger_note` field alongside structured conditions.

---

## Option B: Predefined Condition Types (Recommended for Phase 1)

**Design:**

A typed registry of evaluable conditions. Each condition has a `type` field and typed parameters. CI evaluates each registered type against static data (budget table, map file, policy file).

```json
{
  "fork_advisory_suppressed": true,
  "fork_advisory_reason": "Version label: semantically identical; layout-driven budget gap.",
  "fork_advisory_reviewed_by": "margot",
  "fork_advisory_reviewed_at": "2026-03-14",
  "review_trigger": {
    "type": "budget_below",
    "surface": "tooltip.workbench-header",
    "threshold": 20
  }
}
```

### The Condition Type Registry (Phase 1)

**`budget_below`** — fires when a named surface's budget falls below a threshold in the strictest supported locale.
```json
{ "type": "budget_below", "surface": "tooltip.workbench-header", "threshold": 20 }
```
Evaluated from `budget.json`. Checks all locales; fires if ANY locale's budget for the named surface is below threshold. Rationale: the strictest locale (typically German, Russian, or Korean for expansion) is the constraint.

**`budget_ratio_exceeds`** — fires when the ratio of loosest:strictest surface budget exceeds a threshold higher than the fork-advisory threshold. Used to suppress at 1.8× but re-trigger at 2.5×.
```json
{ "type": "budget_ratio_exceeds", "threshold": 2.5 }
```
Evaluated from `budget.json` against all declared surfaces for this key.

**`surface_count_exceeds`** — fires when the number of declared surfaces for this key exceeds a count.
```json
{ "type": "surface_count_exceeds", "count": 3 }
```
Evaluated from `string-surface-map.json`. The developer who suppressed at 2 surfaces may not have anticipated a third being added.

**`days_elapsed`** — fires when the suppression is older than N days.
```json
{ "type": "days_elapsed", "days": 180 }
```
Evaluated from `fork_advisory_reviewed_at` against system clock. Evaluated in nightly build only (not in PR Tier 1 check, since PRs are time-indexed to the commit clock, not the current date). A 180-day sunset forces the suppression decision to be revisited at least twice per year.

**`never`** — permanent suppression. Explicit opt-in. CI lint requires an additional `fork_advisory_permanent_justification` field (not just `reason`).
```json
{
  "type": "never",
  "permanent_justification": "shared.label.appName — product name is intentionally identical across all surfaces and all locales; never fork. Reviewed 2026-03-14 by margot."
}
```
The `permanent` state is reserved for strings where the team has made a considered, documented architectural decision that forking will never be appropriate. It is not a shortcut for "I don't want to think about this."

**Strengths:**
- Zero parser complexity. Each condition type is a small function: `evaluate_budget_below(surface, threshold, budget_table) → bool`.
- Schema-validated. JSON Schema validates the condition object. An unrecognized `type` is a lint error.
- Reviewable. The PR diff shows a typed condition; the reviewer can evaluate whether the threshold is appropriate.
- Extensible. New condition types are added to the registry without changing the evaluation engine.

**Weaknesses:**
- Cannot express logical combinations (AND/OR) of conditions.
- Cannot express event-based conditions ("when the design system ships the redesign") that are not derivable from static files.
- Limited to conditions computable from the l10n toolchain's static data (budgets, map, policy, timestamps).

**Verdict:** The right default for Phase 1. Handles the most common suppression patterns. Covers 90% of real suppression decisions.

---

## Option C: Structured DSL with Logical Operators (Phase 2)

**Design:**

A mini-language for composing conditions. Evaluated by a small expression engine in the CI tool.

```json
{
  "review_trigger": "budget(tooltip.workbench-header) < 20 OR surfaces.count > 4 OR age > 365d"
}
```

Or in YAML array form:
```yaml
review_trigger:
  any:
    - budget_below: { surface: "tooltip.workbench-header", threshold: 20 }
    - surface_count_exceeds: { count: 4 }
    - days_elapsed: { days: 365 }
```

**Strengths:**
- Expressive: can combine multiple conditions with AND/OR.
- Practical need: "suppress unless EITHER the budget drops below 20 OR a new surface is added" is a natural developer thought. Phase 1 forces one condition per suppression; Phase 2 allows the full condition.

**Weaknesses:**
- Parser maintenance. Even a small DSL introduces bugs. What does `budget(x) < 20 AND budget(x) < 15` mean? Is `NOT budget_below` allowed? Edge cases proliferate.
- Security surface for the string-valued variant. A string DSL can contain injection if the evaluator is careless.
- Schema validation is harder: the YAML array form is type-safe, but the string form requires a runtime parse.

**Verdict:** Phase 2 for teams with complex suppression needs. The YAML array form (typed objects) is the safer choice over the string DSL. Recommended addition: the YAML `any`/`all` combinators using Phase 1 typed conditions as leaves.

---

## Option D: Two-Tier Field Design (Phase 1 + Companion)

**Design:**

`review_trigger` is a **structured condition** (Phase 1 type or Phase 2 expression). A companion `review_trigger_note` field is a **human-readable description** for reviewers.

```json
{
  "fork_advisory_suppressed": true,
  "fork_advisory_reason": "Version label: semantically identical; layout-driven budget gap.",
  "fork_advisory_reviewed_by": "margot",
  "fork_advisory_reviewed_at": "2026-03-14",
  "review_trigger": {
    "type": "budget_below",
    "surface": "tooltip.workbench-header",
    "threshold": 20
  },
  "review_trigger_note": "The tooltip budget is currently 28 chars (safe). If it drops below 20, the constraint becomes severe enough to warrant forking. Review at that point whether the budget divergence is still layout-driven or has become conceptual."
}
```

The `review_trigger_note` is optional. It is not evaluated by CI. It is visible in the suppression audit report and in the budget report's suppression section alongside the structured condition.

**Why this is valuable:** The structured condition tells CI what to check. The note tells the next developer (who may not be Margot) what to think about when the condition fires. The note is Margot's reasoning, preserved for future context.

**CI lint rule:** If `review_trigger_note` is present but `review_trigger` (structured) is absent, CI emits a warning: "review_trigger_note present but no evaluable review_trigger condition. The note is documentation only and will not auto-trigger. Consider adding a structured condition." This prevents developers from using the note as a substitute for the condition.

**Verdict:** Recommended as the default pattern. Phase 1 structured condition + optional human note. Both fields validated in the schema. The note is surfaced prominently in audit reports.

---

## Recommendation: Phase 1 Architecture

### The `review_trigger` Field in Full

```typescript
type ReviewTriggerCondition =
  | { type: "budget_below"; surface: string; threshold: number }
  | { type: "budget_ratio_exceeds"; threshold: number }
  | { type: "surface_count_exceeds"; count: number }
  | { type: "days_elapsed"; days: number }
  | { type: "never"; permanent_justification: string };
```

A suppression entry in `string-surface-map.json`:

```json
{
  "key": "shared.label.configVersion",
  "surfaces": ["tooltip.workbench-header", "table.audit-log-header", "sidebar.panel"],
  "slots": ["body", "header", "label"],
  "fork_advisory_suppressed": true,
  "fork_advisory_reason": "Version label: semantically identical across all surfaces; budget disparity from tooltip narrowing, not conceptual split.",
  "fork_advisory_reviewed_by": "margot",
  "fork_advisory_reviewed_at": "2026-03-14",
  "review_trigger": {
    "type": "budget_below",
    "surface": "tooltip.workbench-header",
    "threshold": 20
  },
  "review_trigger_note": "Currently 28 chars — safe. If it drops below 20, evaluate whether the constraint is still layout-only or has become a conceptual split forcing terse translations in the wider surfaces."
}
```

### CI Evaluation Schedule

| Condition Type | When Evaluated | Data Source |
|----------------|----------------|-------------|
| `budget_below` | Every PR (Tier 1) + nightly | `budget.json` |
| `budget_ratio_exceeds` | Every PR (Tier 1) + nightly | `budget.json` |
| `surface_count_exceeds` | Every PR (Tier 1) + nightly | `string-surface-map.json` |
| `days_elapsed` | Nightly only | `fork_advisory_reviewed_at` + system clock |
| `never` | Never (no evaluation) | — |

PR Tier 1 evaluation is fast: all conditions except `days_elapsed` are computable from static files in milliseconds. `days_elapsed` is nightly-only because: (1) PRs may be opened days after the commit, making the "current date" ambiguous in a PR context; (2) nightly evaluation is sufficient for a time-based trigger that fires on a scale of weeks to months.

### Trigger Event: What Happens in CI

When a condition is met:

1. **CI sets `fork_advisory_suppressed` to `"triggered"`** in a commit to the evaluation branch (for nightly) or emits an advisory in the PR check (for Tier 1).
2. **The advisory re-fires** in the budget report with the "SUPPRESSION TRIGGERED" prefix and full context (original suppression date, original reason, condition that fired, current value vs. threshold).
3. **A PR is created** (for nightly triggers) with the `"triggered"` state committed. The PR is assigned to `fork_advisory_reviewed_by` if that name resolves to an active team member; otherwise to the l10n maintainer.
4. **The `"triggered"` state is PR-blocking** after 30 days. Within 30 days, the developer can re-suppress or fork. After 30 days, the advisory escalates to a Tier 1 error.

### Edge Case: Condition References a Renamed Surface

If the surface named in `review_trigger.surface` is renamed (e.g., `tooltip.workbench-header` → `tooltip.workbench`), the evaluation engine cannot find the surface in `budget.json`. Result:

```
SUPPRESSION WARNING — unevaluable review_trigger condition
  Key: shared.label.configVersion
  Condition: budget_below(tooltip.workbench-header, 20)
  Error: Surface 'tooltip.workbench-header' not found in budget.json
  Surfaces found matching 'workbench': ['tooltip.workbench', 'workbench.panel']

  Action required: Update review_trigger condition to reference current surface name.
  (Suppression remains active until condition is repaired — not treating unevaluable as triggered)
```

The key design decision: an unevaluable condition leaves the suppression **active** (not triggered). Triggering on an unevaluable condition would cause false advisory firings whenever a surface is renamed. The trade-off is that a suppression with a broken condition is perpetually active — but the repair warning is surfaced prominently and Tier 1 lint requires it to be fixed within 14 days.

### Edge Case: Condition Already True at Suppression Creation

If Margot adds a suppression with `budget_below(tooltip, 20)` when the tooltip budget is already 18 chars, the CI check at PR time fires immediately:

```
SUPPRESSION WARNING — condition already met
  Key: shared.label.configVersion
  Review trigger: budget(tooltip.workbench-header) < 20
  Current tooltip budget: 18 chars

  This condition is currently true. The suppression will be triggered on merge.
  Consider: reviewing the fork decision now rather than suppressing
  Or: adjust the threshold to a value not currently met (current value: 18 chars)
```

The PR is not blocked — Margot may have a valid reason to create a suppression she knows will trigger on the next nightly (perhaps she's buying time to file a fork ticket before the advisory re-fires). But the warning is surfaced so she can't do this accidentally.

---

## Developer Journeys

### Journey: Margot, 34, Senior Developer — Setting Up a Review Trigger

**Context:** Same as the parent analysis. Margot is suppressing the fork advisory for `shared.label.configVersion`. The tooltip is at 28 chars. She's choosing the review trigger condition.

**Minute 0:00 — Deciding What Condition to Set**

Margot opens `string-surface-map.json`. She's about to add the suppression. The lint documentation for `review_trigger` shows the available condition types. She reads:

```
fork_advisory_suppressed: true
# Required when suppressed: reason, reviewed_by, reviewed_at
# Optional: review_trigger (evaluable condition), review_trigger_note (human explanation)
# Condition types: budget_below, budget_ratio_exceeds, surface_count_exceeds, days_elapsed, never
```

She thinks: the reason I'm suppressing is that the tooltip budget is narrow but not catastrophically narrow. If it gets below 20 chars, the constraint becomes severe — translations would be limited to 3–4 characters in some locales, which is unusable. So the right condition is `budget_below(tooltip.workbench-header, 20)`.

She also thinks: what if the string gets more surfaces added? The `shared.` key only has 3 surfaces now. If it grows to 5, the strictest-budget problem gets worse. She adds a second suppression... but wait, Phase 1 only supports one condition per suppression. She makes a note in `review_trigger_note` to capture the surface-count concern in plain language.

**Minute 1:00 — Writing the Entry**

```json
{
  "key": "shared.label.configVersion",
  "surfaces": ["tooltip.workbench-header", "table.audit-log-header", "sidebar.panel"],
  "fork_advisory_suppressed": true,
  "fork_advisory_reason": "Version label: semantically identical across all surfaces; budget disparity from tooltip narrowing, not conceptual split. Review at next tooltip redesign.",
  "fork_advisory_reviewed_by": "margot",
  "fork_advisory_reviewed_at": "2026-03-14",
  "review_trigger": {
    "type": "budget_below",
    "surface": "tooltip.workbench-header",
    "threshold": 20
  },
  "review_trigger_note": "Currently 28 chars — safe. If it drops below 20, evaluate whether the constraint forces terse translations in the wider surfaces. Also: if a 4th surface is added to this key, evaluate whether to fork at that point (Phase 1 supports only one condition; note this manually here)."
}
```

**Minute 1:30 — PR Check**

CI runs. Tier 1 budget check: `budget_below(tooltip.workbench-header, 20)` — current budget 28 chars. Condition not met. Suppression accepted. No warning.

The budget report suppression section shows:

```
SUPPRESSED (2026-03-14 by margot) | shared.label.configVersion
  Condition: tooltip.workbench-header budget < 20 chars (current: 28 chars — 8 chars above trigger)
  Note: "Currently 28 chars — safe..."
  [View full suppression entry →]
```

**Minute 2:00 — Approval**

The reviewer sees the structured condition alongside the reason. They can evaluate: "Is 20 chars the right threshold?" They approve. Margot merges.

**Minute 2:30 — Seven Months Later: The Trigger Fires**

Margot has moved to a different team. A responsive layout refactor narrows the tooltip to 19 chars. The nightly CI run evaluates `budget_below(tooltip.workbench-header, 20)` — current budget 19 chars. Condition met.

CI opens a PR: `l10n(suppression-triggered): shared.label.configVersion — budget_below condition met`. The PR is assigned to the l10n maintainer (Margot's name doesn't resolve to an active team member). The budget report the next morning shows:

```
FORK ADVISORY (SUPPRESSION TRIGGERED)
  Key: shared.label.configVersion
  Condition met: tooltip.workbench-header budget = 19 chars (threshold: 20)
  Original suppression: 2026-03-14 by margot
  Original reason: "Version label: semantically identical..."
  review_trigger_note: "Currently 28 chars — safe. If it drops below 20..."

  The condition Margot set has been met. Review the fork decision.
```

The current developer reads Margot's note, looks at the current tooltip at 19 chars, and evaluates whether the string is still semantically unified. 19 chars is tight — Japanese might need "v3.2" (5 chars) while German would need "Konfig. v3.2" (12 chars) — still fits. The decision: re-suppress with an updated threshold of 15 chars.

**UI Annotations:**
- `review_trigger` in map entry: rendered as a semantic sentence in the suppression display ("tooltip budget falls below 20 chars"), not raw JSON
- Trigger condition gap display: "8 chars above trigger" in the suppression section — gives developer a sense of how far from the edge the current state is
- Nightly trigger PR: auto-created with descriptive title; assigned to current l10n maintainer if original reviewer has left; labels: `l10n`, `suppression-triggered`

---

### Journey: Aarav, 28, Front-End Developer — Using `days_elapsed` as a Safety Net

**Context:** Aarav needs to suppress a fork advisory for `shared.ui.executeButton.label` — "Execute" / "Execute Program" — which appears in the Plan screen header tooltip (60 chars) and the production queue confirmation modal (180 chars). The ratio is 180/60 = 3.0, above the 1.67 threshold. But the English source is identical ("Execute") and the string is conceptually unified — it's the same action in both contexts.

Aarav doesn't know of a specific budget change coming. He wants to suppress the advisory but is uncomfortable with a permanent suppression or one that could be forgotten.

**Minute 0:00 — Choosing the Right Condition**

Aarav looks at the condition types. `budget_below` would work, but what threshold? The tooltip is at 60 chars — how low is "too low"? He's not sure. `surface_count_exceeds` doesn't apply — the key will stay at 2 surfaces. `budget_ratio_exceeds` at a higher threshold? The ratio is already 3.0; setting the trigger at 4.0 would mean suppressing until the modal gets even more generous, which doesn't make sense.

The cleanest answer: `days_elapsed(180)`. Suppress for 6 months. After 6 months, re-evaluate whether the two surfaces have semantically diverged or whether the budget situation has changed. It's a forced review, not a triggered event — but it ensures the decision gets revisited.

**Minute 1:00 — Writing the Entry**

```json
{
  "fork_advisory_suppressed": true,
  "fork_advisory_reason": "Execute button label: identical action across both surfaces. Ratio of 3.0× is layout-driven (modal has generous space). Conceptually unified.",
  "fork_advisory_reviewed_by": "aarav",
  "fork_advisory_reviewed_at": "2026-03-14",
  "review_trigger": {
    "type": "days_elapsed",
    "days": 180
  },
  "review_trigger_note": "No specific trigger condition makes sense here. Using 180-day timeout to force re-evaluation. Check: (1) Has the modal changed design significantly? (2) Has the button label changed meaning? (3) Are translators complaining about the constraint?"
}
```

**Minute 1:30 — PR Check**

Tier 1 check: `days_elapsed` conditions are not evaluated at PR time (only nightly). PR passes. The suppression section shows:

```
SUPPRESSED (2026-03-14 by aarav) | shared.ui.executeButton.label
  Condition: 180-day expiry (fires: ~2026-09-10)
  Note: "No specific trigger condition makes sense here..."
```

The 180-day expiry date is displayed as a human-readable approximate date. Reviewers can evaluate: "Is 6 months the right timeout?" They approve.

**Minute 2:00 — 180 Days Later**

On approximately 2026-09-10, the nightly build runs the `days_elapsed` check. 180 days have elapsed. The advisory re-fires with the SUPPRESSION TRIGGERED prefix.

The current developer (Aarav is still on the team) opens the suppression PR and reads his own note. He evaluates:
1. Has the modal changed? No — same design.
2. Has the button label changed meaning? No — still "Execute."
3. Translator complaints? None logged.

Decision: re-suppress for another 180 days. He updates `fork_advisory_reviewed_at` to today's date, updates `review_trigger_note` with a timestamp: "Re-reviewed 2026-09-10 by aarav — still unified, no divergence detected."

**Why This Is Better Than Permanent Suppression**

The `days_elapsed` pattern turns suppression into a periodic review rather than a one-time decision. The cost is one 2-minute review every 6 months. The benefit is that the review catches cases where the world has changed in ways Aarav wouldn't have thought to specify as a condition: a redesigned modal, a new translation team with different phrasing instincts, a product decision to make the tooltip and modal read differently.

**UI Annotations:**
- Days-elapsed suppression in report: shows expiry date in human-readable form ("fires approximately 2026-09-10"), not "180 days from 2026-03-14"
- Countdown in suppression section: in the 30 days before expiry, the suppression section highlights: "Expiring in 12 days" with amber styling — gives the l10n maintainer advance notice
- Re-suppression: update `fork_advisory_reviewed_at` to reset the clock; the review history is preserved in git log, not in the map entry

---

### Journey: Dev, 26, Localization QA — Running the Suppression Audit

**Context:** Dev is preparing a quarterly l10n quality report. Part of the report is a suppression audit: all active `fork_advisory_suppressed: true` entries in `string-surface-map.json`, their age, their condition status, and any unevaluable conditions. The team has accumulated 22 active suppressions over 18 months of development.

**Minute 0:00 — Running the Audit Command**

```bash
make l10n-suppression-audit
```

Output: a table of all suppressions with columns: key, suppressed date, reviewed by, condition type, condition status, days since review.

```
FORK ADVISORY SUPPRESSION AUDIT (2026-03-14)
22 active suppressions | 1 triggered | 2 unevaluable | 3 expiring within 30 days

  KEY                                     DATE        BY      CONDITION              STATUS
  ─────────────────────────────────────────────────────────────────────────────────────────────
  shared.label.configVersion              2026-03-14  margot  budget_below(tt, 20)   ✓ 28 chars (8 above)
  shared.ui.executeButton.label           2026-03-14  aarav   days_elapsed(180)      ✓ 0 days elapsed (180 remaining)
  shared.error.sampleSizeWarning.header   2026-01-08  aarav   budget_ratio(2.5)      ✓ ratio 1.95 (below 2.5)
  shared.ui.deployButton.label            2025-11-22  priya   days_elapsed(90)       ⚠ EXPIRING IN 22 DAYS
  shared.error.bufferFull.toast           2025-09-04  priya   budget_below(toast,15) ✗ UNEVALUABLE (surface not found: 'toast')
  shared.label.missionIndex               2025-08-17  [left]  days_elapsed(365)      ⚠ EXPIRING IN 7 DAYS
  shared.nav.backButton.label             2025-07-03  [left]  none                   ⚠ NO TRIGGER (age: 254 days)
  ...
```

**Minute 2:00 — Triaging the Unevaluable Conditions**

Dev sees `shared.error.bufferFull.toast` has an unevaluable condition: `budget_below(toast, 15)` — the surface name `toast` doesn't match any entry in `budget.json`. The CI warning must have been ignored for 6 months.

Dev checks the budget table: the surface is now named `notification.toast` (renamed in October). The fix is a one-line update to the map entry.

**Minute 3:00 — Triaging the No-Trigger Entry**

`shared.nav.backButton.label` has no `review_trigger` condition and is 254 days old. This is the "set it and forget it" anti-pattern. The person who created it (username "sam", no longer on the team) didn't set a condition.

Dev opens the entry:
```json
{
  "fork_advisory_suppressed": true,
  "fork_advisory_reason": "Back button label — same in all contexts.",
  "fork_advisory_reviewed_by": "sam",
  "fork_advisory_reviewed_at": "2025-07-03"
}
```

Dev reviews: the key appears in toast, modal, sidebar, AND (added in December) the new achievement panel. Four surfaces. The `surface_count_exceeds(3)` condition would have fired in December when the 4th surface was added. Without it, the advisory remained silent.

Dev forks it — `make fork-string KEY=shared.nav.backButton.label` in dry-run mode. Output shows 4 call sites; 4 exact matches across all locales (the label is "Back" or its direct equivalent in all locales — no budget-forced variants). The fork is mechanical and costless.

**Minute 5:00 — Generating the Report**

The audit report is exported:
- 1 triggered suppression: the nightly build will create a PR for it
- 2 unevaluable suppressions: Dev files PRs to fix the surface references
- 3 expiring within 30 days: Dev notifies the current owners (via PR comment on the relevant entries)
- 1 no-trigger entry older than 180 days: Dev forks it directly

The audit takes 15 minutes of human review time for 22 suppressions. The structured conditions made 19 of them automatically evaluable.

**UI Annotations:**
- `make l10n-suppression-audit`: terminal table output with color coding — green for healthy, amber for expiring/warnings, red for unevaluable or triggered; summary line at top
- Orphaned suppressions (`reviewed_by` resolves to a departed team member): displayed with `[left]` in the BY column; sorted to top in the "needs attention" section
- No-trigger suppressions older than 180 days: flagged as `⚠ NO TRIGGER (age: N days)` — not blocked, but surfaced in the audit as technical debt
- The audit report is committed as `l10n/audit/2026-Q1-suppression-audit.md` for record-keeping

---

## Interaction Effects

**With string-surface-map.json validation as a PR requirement (4.69e-i-a-i-f-i-α-i-A-i-1-a-i-A):**

The Tier 1 PR validation runs the `review_trigger` condition evaluation as part of the budget lint step. It needs the same `string-surface-map.json` validation infrastructure — if the map entry is malformed (e.g., `review_trigger.surface` is not a valid surface name), the condition evaluator emits the unevaluable warning at PR time, not just at nightly time. This allows developers to catch surface reference errors before merging.

**With multi-surface string forking policy (4.69e-i-a-i-f-i-α-i-A-α-i):**

The suppression lifecycle is the inverse of the fork decision. A triggered suppression reopens the fork evaluation window. The design tension: if a `triggered` suppression is left unresolved for 30 days and becomes PR-blocking, it can create pressure to fork prematurely (to make the blocker go away) rather than genuinely re-evaluating. The 30-day grace period should be communicated clearly as a review window, not an escalation deadline.

**With budget table maintenance (4.69e-i-a-i-f-i-α-i-A-i-1-a-i):**

The `budget_below` and `budget_ratio_exceeds` conditions consume the same `budget.json` file that the fork advisory system produces. A surface rename that regenerates `budget.json` with new surface names will silently break all `review_trigger` conditions that reference the old name. The surfaces.json governance (which ensures layout changes update budget.json) should also lint for stale surface references in `review_trigger` conditions — the same validation pass.

**With post-fork orphan detection (4.69e-i-a-i-f-i-α-i-A-α-i-4):**

After a fork executes, the old `shared.` key is removed from `string-surface-map.json`. Any suppression entry for the old key must also be removed. The post-fork orphan detector should scan for stale suppression entries alongside stale call sites.

**With shared. namespace governance (4.69e-i-a-i-f-i-α-i-A-α-ii):**

The governance model needs a view of active suppressions to accurately report namespace health. A `shared.` key with an active suppression that has a triggered condition is not the same as a key with a healthy suppression. The namespace governance dashboard should show suppression health alongside surface count and budget ratio.

---

## Sensory Description

The suppression audit report renders in the terminal like a status board — a wall of state, each row a small story. Healthy rows (green checkmarks, days remaining in clear type) read quickly. Amber rows (expiring soon, unevaluable) pull the eye. Red rows (triggered, no trigger, orphaned reviewer) feel urgent but contained — they're bounded errors with clear resolution paths.

The `review_trigger_note` field, when displayed in the budget report's suppression section, renders in a distinct visual style from the structured metadata — slightly indented, in a lighter grey, formatted as a blockquote. It looks like a post-it note attached to a form. The structured condition above it is institutional (typed, formal, machine-read). The note below it is human (informal, opinionated, time-stamped only by implication). The contrast between the two is legible at a glance.

The nightly trigger PR, when it arrives in a developer's inbox, has a distinctive title pattern: `l10n(suppression-triggered): [key]`. Like a maintenance alert from a monitoring system — not urgent (it's not production-broken), but purposeful. The PR body contains the full advisory text with original suppression metadata, so the developer doesn't have to look anything up.

The `"triggered"` state in the JSON file reads like a status word — a verb frozen mid-action. Not `false`, not `true`, but `"triggered"` — the condition fired, something moved, action is pending. It is the only value in the l10n toolchain schema that is a past-tense verb, and that choice is deliberate: it communicates that an event occurred, and the system is waiting for a human response.

---

## Comparable Systems

**Software license expiry:** Software licenses expire and require renewal. The renewal is forced by a time-based condition (annual), not an event-based condition. The `days_elapsed` condition in fork suppression mirrors this pattern: periodic forced review regardless of whether anything changed. The license analogy also captures the UX challenge — developers find license renewals annoying when nothing has changed. The 180-day default should be long enough to avoid being noise.

**Snooze semantics in monitoring:** PagerDuty and similar tools allow alert suppression (snooze) with a mandatory expiry. You cannot snooze an alert permanently without explicit escalation to management. The fork suppression lifecycle mirrors this: `days_elapsed` is the snooze timeout; `permanent` is the management-approved permanent suppression; the `review_trigger_note` is the on-call note field where the engineer explains their reasoning. The monitoring analogy also captures the "condition already true at snooze creation" edge case — a good monitoring platform warns you if you're snoozing an alert that would immediately re-fire.

**Technical debt tracking systems:** JIRA's "won't fix" status is the software equivalent of `permanent` suppression. It requires a resolution note and is visible in tech debt audits. The l10n suppression audit is the equivalent of a quarterly tech debt review.

**Kubernetes resource quotas:** In Kubernetes, a namespace can suppress resource quota enforcement for specific resources, but the suppression carries a `review-by` annotation that surfaces in cluster audits. The pattern — machine-readable annotation, human-readable reason, periodic audit surfacing — is identical to the fork suppression design.

---

## The TikTok Clip

The clip: a developer runs `make l10n-suppression-audit` and watches the table scroll. Most rows are green. Then a triggered row: `⚠ TRIGGERED` in amber, a key name, "suppression set by margot (departed)". The developer types `make fork-string KEY=...` and watches 2 call sites, 8 locales, 0 net translation cost scroll past. `--apply`. One commit. The triggered row disappears from the table. The audit is clean. The clip is: "My l10n toolchain tells me when to re-examine old decisions, so I don't have to remember."

---

## New Aspects Discovered

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-I — Suppression condition reference integrity:** when a surface name referenced in `review_trigger.surface` is renamed during a layout refactor, the condition silently becomes unevaluable; design of the CI lint that detects stale surface references in suppression conditions and the tooling that updates them (analogous to a refactoring rename across the codebase)

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-II — Suppression audit as a first-class quarterly artifact:** the `make l10n-suppression-audit` report committed as a versioned file; diff-able across quarters; suppression count as a team health metric (are we accumulating debt or clearing it?); integration with the team's tech debt tracking system

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-III — Suppression inheritance on key fork:** when `make fork-string` forks a `shared.` key that has an active suppression, should the forked keys inherit the suppression? The parent key's advisory was silenced; the forked keys are new and have no history of advisories yet; the fork itself may resolve the advisory (different budgets now, so ratio improves); design decision: fork clears the suppression and lets the advisory re-evaluate naturally

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-IV — Phase 2: `any`/`all` logical combinators for `review_trigger`:** the YAML-array form with typed leaves from Phase 1 conditions; full design of the schema, evaluation engine, and schema validation for composed conditions; the "suppress unless EITHER budget drops below 20 OR surfaces count exceeds 3" pattern as the canonical use case

- **4.69e-i-a-i-f-i-α-i-A-α-i-1-V — Countdown display in suppression section for near-expiry entries:** the 30-day amber warning countdown for `days_elapsed` suppressions; exact UI — amber border, "Expiring in N days" text, link to the suppression entry; the UX of giving advance notice vs. the noise of surfacing suppressions that haven't triggered yet

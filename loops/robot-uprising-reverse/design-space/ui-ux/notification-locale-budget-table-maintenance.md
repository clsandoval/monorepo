# Budget Table Maintenance as a Living Artifact

**Aspect:** 4.69e-i-a-i-f-i-α-i-A-i-1-a-i — Budget table maintenance as a living artifact: as new strings are added, who owns the budget calculation; is pixel-width derivation automated or manual; process for keeping budget file in sync with layout changes (font changes, component refactors)

**Parent:** 4.69e-i-a-i-f-i-α-i-A-i-1-a — Text expansion budget per locale (produced `l10n/budget.json` and CI lint system; established budget tables for toast/modal/settings across 10 locales)

**Grandparent chain:** → 4.69e-i-a-i-f-i-α-i-A-i-1 → 4.69e-i-a-i-f-i-α-i-A-i → 4.69e-i-a-i-f-i-α-i-A → 4.69e-i-a-i-f-i-α-i → 4.69e-i-a-i-f-i → 4.69e-i-a-i-f

**Cross-references:**
- 4.69e-i-a-i-f-i-α-i-A-i-1-a — Budget table parent; `l10n/budget.json` format established here
- 4.69e-i-a-i-f-i-α-i-A-i-1-a-ii — Pixel-width validation via Playwright CI (parallel concern; this aspect decides whether it's needed; that aspect designs the step itself)
- 4.69e-i-a-i-f-i-α-i-A-i-1-a-iii — Budget vs. translation memory conflicts (downstream; this aspect's ownership model determines who resolves conflicts)
- 4.69e-i-a-i-f-i-α-i-A-i-1-b — RTL layout for toast (budget file must flag RTL entries; maintenance process must handle RTL-specific budget invalidation)
- 4.69e-i-a-i-f-i-α-i-A-iv — displayPrefs registry as living artifact (structural parallel: both are files that must stay in sync with game state; same governance problem)

---

## The Core Problem

The parent analysis produced a budget table and a `l10n/budget.json` CI lint file. That work answered "what are the budgets?" It did not answer "what happens next."

Next is:
1. A new accessibility setting is added (e.g., "High contrast mode"). Someone must add `modal.a11y.item.highcontrast` to the budget file with correct per-locale soft/hard values.
2. The toast font changes from Inter 14px to Inter 15px (small product design iteration). The entire Surface A budget table is now wrong — every hard budget needs to shrink by ~6%.
3. The toast width changes from 320px to 360px (responsive design pass). Every Surface A budget needs to grow.
4. A new locale is added (e.g., tr-TR, Turkish). Every string in the budget file needs a new column.

Without a maintenance protocol, `l10n/budget.json` becomes stale within two sprints of its creation. Stale budgets are worse than no budgets: the CI lint passes while the actual layout overflows, because the budget was set for a font that no longer exists.

This is the **living artifact problem**: a specification that is derived from the codebase must be regenerated whenever the codebase changes. The question is how much of that regeneration is automated and how much is human.

---

## The Three Dimensions

There are three separable questions:

### Dimension 1: Ownership — Who Calculates the Budget for New Strings?

When a developer adds a new string to the game, who is responsible for adding the budget entry?

**Option A: String Author Owns It**

The developer who adds `i18n/en-US.json` with a new key is also responsible for adding the corresponding budget entry to `l10n/budget.json`. A PR template checklist item enforces this: "Did you update `l10n/budget.json` for any new i18n keys?"

- *Advantage:* No handoff. The person who knows the surface (they just wrote the component) calculates the budget immediately.
- *Disadvantage:* Most developers are not localization engineers. They will look at the English character count, multiply by 1.35 (because they've heard German is 35% longer), and file an incorrect entry. They don't know about CJK pixel-doubling, RTL layout constraints, or per-surface usable-width derivations.
- *Failure mode:* Budgets are consistently wrong (too permissive) because developers round up to avoid blocking themselves. CI lint passes; layout overflows in production.

**Option B: Dedicated L10n Engineer Owns It**

A localization engineer reviews every new i18n key addition and calculates budgets. Budget entries are never merged until the L10n engineer signs off.

- *Advantage:* Correct budgets. L10n engineers know the full derivation.
- *Disadvantage:* For a small team (Robot Uprising is a small game, not a AAA studio), a dedicated L10n engineer may not exist. This becomes a bottleneck on a single engineer who must be consulted for every string addition. String additions happen frequently (every feature adds strings).
- *Failure mode:* Budget reviews queue up, developers bypass them under deadline pressure, `budget.json` gets marked "TODO" entries that never get filled in.

**Option C: Automated Calculation — Budget Is Derived, Not Written**

The budget file is not a hand-authored file. It is **generated** by a script that reads:
1. The i18n string file (`en-US.json`) for the English source text
2. A layout constants file (`l10n/surfaces.json`) that records usable width, font size, and wrap rules for each surface
3. The expansion coefficient table (a fixed lookup: `{ "de-DE": 1.40, "fr-FR": 1.30, ... }`)

The generation script derives every budget entry programmatically. The CI system runs the script and checks that the committed `budget.json` matches the generated output. If it doesn't, CI fails with: "Budget file is stale — run `npm run l10n:budget:generate` to update."

- *Advantage:* No human ever calculates a budget manually. The budget is always mathematically correct for the current layout constants. Layout changes (font size, surface width) automatically propagate to the budget when the developer updates `surfaces.json` and regenerates.
- *Disadvantage:* The generated budget is only as correct as the layout constants file. If `surfaces.json` says the toast is 320px wide but the component was refactored to be 340px wide without updating `surfaces.json`, the generated budget is wrong — and the CI lint still passes. The automation creates a **false confidence problem**: developers trust the generated budget without verifying it matches the live component.
- *Failure mode:* `surfaces.json` drifts from the actual component layout. Generated budgets are precise but wrong. Pixel-width CI (4.69e-i-a-i-f-i-α-i-A-i-1-a-ii) is the essential complement — it catches the drift between `surfaces.json` and the actual rendered component.

**Option D: Surface Owner Maintains the Constants, Script Does the Rest**

A hybrid: the layout constants file (`surfaces.json`) is owned by the engineer who owns each surface component. When they change the toast width, they update `surfaces.json` as part of the same PR. The budget generation script runs in CI. String authors add entries to the i18n file; CI auto-generates their budget entry from the current constants and commits it (or fails with "run the generator").

This is Option C with an explicit ownership model for `surfaces.json`.

**Recommendation: Option D with a Pixel-Width CI safety net.**

Option D is the only approach that scales correctly:
- No single human owns the budget calculation for new strings — it's automated.
- Layout engineers own the layout constants — they're already touching that code.
- CI ensures budget.json is never hand-authored incorrectly.
- Pixel-width CI (the parallel aspect 1-a-ii) catches the remaining failure mode: `surfaces.json` drifting from the live component.

---

### Dimension 2: Derivation Method — Calculated vs. Rendered

Two ways to derive the pixel budget for a string slot:

**Mathematical derivation (Character Count × Avg Char Width):**
Used in the parent analysis. Average glyph width for Inter at a given size is approximately known (7–8px for Latin body, 12–14px for CJK). Multiply by the usable slot width, get a character budget.

Advantages: Fast. No browser needed. Works at build time without a DOM.
Disadvantages: Averages are wrong for specific strings. "W" is wider than "i". CJK characters at 14px render at exactly 14px in most CJK fonts, but mixed-CJK-and-Latin strings break the average model. Arabic letters vary dramatically in width (connected vs. isolated forms).

**Pixel-width rendering (Headless browser measurement):**
A Playwright or jsdom step renders each locale's translated string in the actual font and layout context, measures the rendered pixel width, and flags overflow.

Advantages: Exact. Catches all edge cases. The "canonical" measurement is the layout itself.
Disadvantages: Requires translated strings to exist before CI can run. Budget lint runs at the stage before translation (when the source string is added). You cannot pixel-validate a string that hasn't been translated yet.

**Synthesis: Two-Stage Model**

Stage 1 (pre-translation): Character count budget from mathematical derivation. CI lint enforces this. This is the gate for accepting new strings.

Stage 2 (post-translation, pre-release): Pixel-width validation against actual translated strings in headless browser. This is the gate for accepting the localized build.

The budget file is a Stage 1 artifact. Stage 2 is the separate Playwright CI step (4.69e-i-a-i-f-i-α-i-A-i-1-a-ii). Both must exist; neither alone is sufficient.

---

### Dimension 3: Sync Process — Budget Drift from Layout Changes

When the layout changes (font, size, width), the mathematical budget is wrong until regenerated. Three sub-cases:

**Sub-case A: Font size change (e.g., toast title from 15px to 14px)**

The average character width at 15px Inter ≈ 8px/char. At 14px Inter ≈ 7.5px/char. The slot character budget changes by 8/7.5 = ~6.7%.

Without automation, no one knows to regenerate budgets when a font size changes. The budget file was created months ago; the connection between the CSS and the budget is documented nowhere.

*Fix:* `surfaces.json` includes `font_size_px` as an explicit field. The generation script uses it in the derivation formula. A font size change requires a `surfaces.json` update → CI detects budget.json is stale → developer runs generator → budget is correct.

**Sub-case B: Surface width change (e.g., toast from 320px to 360px)**

Similar to font size: `surfaces.json` includes `usable_width_px`. Change triggers regeneration.

**Sub-case C: Component refactor that changes the layout without a developer explicitly touching surfaces.json**

This is the hardest case. A developer refactors the toast component, changes the padding from 12px to 16px, and the usable width drops from 296px to 264px. They don't think to update `surfaces.json` because they were focused on the component logic.

This is precisely the failure mode that pixel-width CI (Stage 2) catches. Without Stage 2, this drift is invisible until a translated string overflows at runtime.

*Fix:* Add a component test that asserts the rendered width of a known test string matches the width expected from `surfaces.json`. The test is simple: render the toast in a test environment, measure the inner text area, assert it equals `surfaces.json`'s `usable_width_px` ± 2px. If the component refactor changes the layout, this test fails, prompting the developer to update `surfaces.json`.

---

## The surfaces.json Format

The key enabler for automated budget generation is a well-designed layout constants file. Proposed format:

```json
{
  "version": "1.0",
  "surfaces": {
    "toast.a11y": {
      "description": "Accessibility import notification toast",
      "width_px": 320,
      "padding_px": 12,
      "usable_width_px": 296,
      "slots": {
        "title": {
          "font_size_px": 15,
          "avg_char_width_px": 8.0,
          "max_lines": 2,
          "wrap_allowed": true,
          "hard_budget_chars": 52
        },
        "body": {
          "font_size_px": 14,
          "avg_char_width_px": 7.5,
          "max_lines": 1,
          "wrap_allowed": false,
          "hard_budget_chars": 46
        },
        "action": {
          "font_size_px": 14,
          "avg_char_width_px": 7.5,
          "max_lines": 1,
          "wrap_allowed": false,
          "usable_width_px": 200,
          "hard_budget_chars": 28
        }
      },
      "rtl_locales": ["ar-SA"],
      "rtl_note": "Layout mirrors for RTL — budget constraints identical, layout handled by direction CSS"
    },
    "modal.a11y": {
      "description": "Import modal accessibility section",
      "usable_width_px": 432,
      "slots": {
        "section_header": {
          "font_size_px": 16,
          "avg_char_width_px": 8.5,
          "max_lines": 1,
          "hard_budget_chars": 40
        },
        "item_label": {
          "font_size_px": 14,
          "avg_char_width_px": 7.5,
          "usable_width_px": 278,
          "max_lines": 1,
          "wrap_allowed": false,
          "hard_budget_chars": 38
        },
        "item_status": {
          "font_size_px": 12,
          "avg_char_width_px": 7.0,
          "usable_width_px": 126,
          "max_lines": 1,
          "wrap_allowed": false,
          "hard_budget_chars": 18
        }
      }
    }
  }
}
```

The generation script reads this file, multiplies each slot's soft budget (derived from `usable_width_px / avg_char_width_px * 0.80` for a comfortable soft budget) by the expansion coefficient for each locale, and outputs `budget.json`.

**The critical constraint:** `hard_budget_chars` in `surfaces.json` is a pixel-derived constant, not an expansion-adjusted number. It is the physical maximum for any locale before overflow. The per-locale soft budget is the expansion-adjusted target that vendors are asked to write to. The hard budget is the same for every locale — it's a physical constraint, not a linguistic one.

---

## The Ownership Flow: End-to-End

**When a developer adds a new string:**

1. Add key to `i18n/en-US.json` with the English source text.
2. Add the key's surface-slot mapping to `l10n/string-surface-map.json`:
   ```json
   "modal.a11y.item.highcontrast": {
     "surface": "modal.a11y",
     "slot": "item_label"
   }
   ```
3. Run `npm run l10n:budget:generate` (or let CI fail and prompt them).
4. The generator reads `surfaces.json`, reads `string-surface-map.json`, reads the expansion coefficients, and writes the budget entry to `budget.json`.
5. PR template checklist: "Did you update `l10n/string-surface-map.json` for new i18n keys?" This is the ONE human step — declaring which surface/slot the string appears in. Everything else is automated.

**When a layout engineer changes a surface:**

1. Update the component CSS/JSX.
2. Update `surfaces.json` with the new `width_px`, `padding_px`, `font_size_px` values.
3. Run `npm run l10n:budget:generate`.
4. Budget file regenerates. CI passes.
5. Component layout test verifies `surfaces.json` usable width matches the rendered component.

**When a new locale is added:**

1. Add the locale code and expansion coefficient to the coefficient table in `l10n/coefficients.json`.
2. Run `npm run l10n:budget:generate`.
3. Budget file regenerates with the new locale column.
4. CI passes. Localization vendor receives the updated budget file automatically via the L10n pipeline.

---

## Player Journeys

### Journey 1: Aarav, 28, Mid-Level Frontend Engineer

**Context:** Three months after the budget table was established. Aarav is adding a new accessibility feature: "Motion reduction level" (a three-tier setting: None / Reduced / Minimal). He adds the string to `en-US.json` and opens a PR.

**Minute 0:00 — The PR Check**
Aarav opens his PR. The CI pipeline runs. After 2 minutes, it fails with a red X on the "L10n Budget Check" step. The error message reads:

```
❌ L10n Budget Check FAILED
Missing budget entry: modal.a11y.item.motionlevel
Key exists in i18n/en-US.json but is not mapped in l10n/string-surface-map.json.

To fix: add an entry to l10n/string-surface-map.json specifying
which surface and slot this string renders in, then run:
  npm run l10n:budget:generate

See l10n/README.md for surface names.
```

Aarav hasn't touched `l10n/` before. He opens `l10n/README.md`. It's a one-page file. It lists the surfaces (`toast.a11y`, `modal.a11y`, `settings.a11y`), the slots within each, and shows an example mapping entry.

He adds:
```json
"modal.a11y.item.motionlevel": {
  "surface": "modal.a11y",
  "slot": "item_label"
}
```

Runs `npm run l10n:budget:generate`. The terminal outputs:
```
✓ Generated budget for modal.a11y.item.motionlevel
  en-US: 22 chars (soft: 22, hard: 38)
  de-DE: 22 chars target → soft budget: 31
  fr-FR: 22 chars target → soft budget: 29
  [... 7 more locales ...]
Budget written to l10n/budget.json
```

Aarav commits the updated `budget.json` and `string-surface-map.json`. CI passes. He didn't need to understand expansion coefficients. He only needed to know which surface the string is on.

**Minute 4:00 — The Review**
A reviewer comments: "Motion reduction level" is 22 characters. At the soft budget for de-DE that's 31 — German translators can definitely hit that for a three-word phrase. LGTM.

Aarav merges. The budget file is correct. He spent 4 minutes on L10n compliance.

**UI Annotations:**
- CI failure: red X in GitHub Actions, error message with exact fix instructions, link to `l10n/README.md`
- CLI output: per-locale budget breakdown, human-readable confirmation
- The only human decision: which surface/slot mapping to use (a 5-second lookup in README)

---

### Journey 2: Margot, 34, Lead Engineer — Doing a Responsive Design Pass

**Context:** Six months after launch. Margot is doing a responsive design pass to support 375px mobile viewports. The notification toast, currently 320px wide, needs to shrink to 280px on mobile (below 480px viewport). She's updating the toast component.

**Minute 0:00 — The Component Change**
Margot updates `NotificationToast.tsx`. She changes the toast width from a fixed `320px` to `min(320px, calc(100vw - 40px))` — so on a 320px phone it would be 280px. She writes a media query. She runs the component visually. Looks fine on desktop. Looks fine on mobile.

**Minute 2:00 — The Surfaces.json Update**
She remembers (from onboarding docs) that `surfaces.json` must be updated when layout dimensions change. But which dimension? The component now has TWO widths: 320px on desktop, 280px on mobile.

This is a new problem the budget system hasn't encountered before: **a responsive surface with multiple breakpoints.**

She opens `l10n/surfaces.json`. The toast surface has one `width_px: 320`. She can't simply change it to 280 — that would set all budgets to the mobile size, wasting space on desktop. She can't change it to 320 — that would allow strings that overflow on mobile.

**The correct answer:** The budget must be set for the **minimum supported width** (mobile-first budget). A string that fits at 280px fits everywhere. She changes `width_px` to 280, recomputes `usable_width_px` = 280 - 24 = 256, and notes in `surfaces.json`:

```json
"width_px": 280,
"width_note": "Mobile-first: 280px at <480px viewport, 320px at >=480px. Budget uses minimum.",
"usable_width_px": 256
```

She runs the generator. The new budgets are stricter (280px instead of 320px means ~15% shorter hard budgets). Some existing translations that were marginal at 320px may now fail the budget check.

**Minute 8:00 — The Ripple**
The generator runs against all existing budget entries. It outputs:

```
⚠️ Budget regression detected in 3 existing strings:
  toast.a11y.body (ru-RU): currently 42 chars, new hard budget 40 chars
  toast.a11y.title (de-DE): currently 48 chars, new hard budget 44 chars
  toast.a11y.action (fr-FR): currently 27 chars, new hard budget 24 chars

Existing translations may need review. See l10n/budget.json for details.
```

These are budget regressions — strings that were within the old budget are now over the new stricter budget. Margot has a decision: open a ticket for the L10n vendor to re-translate those 3 strings, or adjust the minimum width to 290px (slightly less strict).

She opens the 3 problematic strings. The Russian body string ("Из вашего импортированного профиля.") is 42 characters — right at the edge. She tests it in a 280px toast on her phone. It doesn't actually overflow — Cyrillic at 14px renders narrower than the 7.5px/char average used in the model.

**Minute 12:00 — The Override**
Margot adds a locale-specific override in `surfaces.json`:
```json
"ru-RU_char_width_px": 7.0
```
The generator uses 7.0px/char for Russian strings, setting the hard budget to 43 instead of 40. The existing Russian string fits. She opens the ticket for the two Latin-locale strings (de-DE title, fr-FR action) that genuinely need retranslation.

**UI Annotations:**
- Generator output on regression: explicit list of affected strings, not silent
- Override mechanism: locale-specific character width in surfaces.json
- Ticket creation: standard workflow, not an L10n-specific tool — the engineer creates a ticket like any other bug

---

### Journey 3: Dayo, 26, Contractor — New Locale Addition

**Context:** Robot Uprising is expanding to include tr-TR (Turkish). Dayo is the contractor assigned to add Turkish locale support. The L10n pipeline is established; Turkish translations will arrive in 2 weeks. Dayo needs to set up the budget infrastructure before translations arrive.

**Minute 0:00 — The Coefficient**
Dayo opens `l10n/coefficients.json`:
```json
{
  "en-US": 1.00,
  "de-DE": 1.40,
  "fr-FR": 1.30,
  ...
}
```

Turkish. She looks it up. IBM's localization guidelines: Turkish expands 1.25–1.40x on average for software UI strings. Turkish is a highly agglutinative language — single Turkish words can express what English requires multiple words for, but prepositions become suffixes which extend word length. The UI strings here are short noun phrases, which are least affected by agglutination.

Conservative estimate: 1.30x. She adds `"tr-TR": 1.30` to `coefficients.json`.

**Minute 3:00 — The Generate**
Dayo runs `npm run l10n:budget:generate`. The generator creates a new column in every entry in `budget.json` for `tr-TR`. Every string now has a Turkish soft budget (1.30 × English) and a Turkish hard budget (same physical maximum as all other locales).

CI passes. The Turkish column is ready. When Turkish translations arrive, the L10n lint will enforce the budgets.

**Minute 5:00 — The Validation**
Dayo checks 3 entries manually to verify:
- `toast.a11y.title` en-US 32 chars → tr-TR soft 41 (32 × 1.30 = 41.6 → floor to 41). Hard budget 52. Looks right.
- `modal.a11y.item.reducedmotion` en-US 14 chars → tr-TR soft 18. Hard 26. Right.
- `toast.a11y.action` en-US 16 chars → tr-TR soft 20. Hard 28. Right.

She doesn't need to validate all 40+ strings — the generator is deterministic. She validates 3 to confirm the coefficient is being applied correctly, then submits the PR.

**The missing piece Dayo notices:** She doesn't know what the Turkish word for "Accessibility" is, or whether the vocabulary choices (from the parent analysis's L10n glossary) are consistent with Turkish OS ecosystem vocabulary. She opens a ticket: "Turkish vocabulary review needed — add tr-TR entries to l10n/glossary.json before translations are sent to vendor." Budget infrastructure is ready. Vocabulary review is a parallel process.

**UI Annotations:**
- `coefficients.json`: a single flat JSON file, one line per locale, easy to add to
- Generator output: prints count of new entries generated, no long list of per-string budgets (only regressions would be printed)
- Vocabulary/budget separation: coefficients.json handles the budget question; glossary.json handles the vocabulary question; they're different concerns

---

## Strengths and Weaknesses

**Strengths of the automated Option D approach:**
- Zero budget calculations by hand after the system is set up
- New strings require only one human decision: the surface/slot mapping
- Layout changes propagate automatically when `surfaces.json` is updated
- New locales take 5 minutes to add
- The CI lint is never wrong about math — only wrong if `surfaces.json` drifts from the component

**Weaknesses:**
- `surfaces.json` is a second source of truth for layout constants. The component CSS is the primary source. If they diverge, the budget is silently wrong until Stage 2 CI (pixel-width validation) catches it.
- The average character width model (`avg_char_width_px`) is always an approximation. Worst-case strings with many wide characters (e.g., all capital letters, Arabic connected forms) will exceed the budget even when the average-based calculation says they fit.
- Mixed-script strings (Latin + CJK in the same string) break the single `avg_char_width_px` model. This is the 1-a-v concern (multi-script mixed strings).

**Interaction effects:**
- This system is the prerequisite for 4.69e-i-a-i-f-i-α-i-A-i-1-a-ii (Playwright pixel-width validation). Without surfaces.json as a spec, there's nothing to validate against.
- The `string-surface-map.json` file is a new dependency. It must stay in sync with the code. A PR template checklist item is the lightweight enforcement mechanism.
- The mobile-first budget decision (Margot's journey) interacts with 4.69e-i-a-i-f-i-α-i-A-i-1-a-iv (mobile viewport budget adjustment) — that aspect needs to formally decide whether one budget serves all breakpoints or whether the system supports breakpoint-specific budgets.

---

## The TikTok Clip

Not applicable to this aspect directly — it's a localization engineering decision invisible to players. But the failure mode IS visible: a toast that says "Bedienerfreundlichkeitsei..." clipped mid-compound-noun on a German player's screen. The budget system exists so that never appears in a player's Twitter screenshot. The absence of the clip is the success condition.

---

## New Aspects Discovered

- **4.69e-i-a-i-f-i-α-i-A-i-1-a-i-A** — `string-surface-map.json` validation as a PR requirement: what happens when a developer maps a string to the wrong surface/slot; how CI detects a mapping that doesn't match the string's actual render context; static analysis vs. runtime validation
- **4.69e-i-a-i-f-i-α-i-A-i-1-a-i-B** — Responsive surface budget model: formal design of the breakpoint-aware budget system that Margot's journey surfaces; single-budget (mobile-first) vs. breakpoint-specific budgets (`320@desktop`, `280@mobile`); impact on budget.json format
- **4.69e-i-a-i-f-i-α-i-A-i-1-a-i-C** — surfaces.json drift detection: the component layout test that asserts rendered dimensions match surfaces.json; how tightly it binds (±2px tolerance?); what happens when a test-excluded component changes
- **4.69e-i-a-i-f-i-α-i-A-i-1-a-i-D** — L10n pipeline integration: how `budget.json` travels to the translation vendor; vendor tooling that enforces per-locale soft budgets at translation time rather than post-translation QA; TMS (Translation Management System) integration points
- **4.69e-i-a-i-f-i-α-i-A-i-1-a-i-E** — Budget regression triage workflow: when a layout change tightens budgets and existing translations fail, the process for deciding whether to re-translate vs. adjust the model vs. adjust the layout; who makes this call; how the decision is recorded

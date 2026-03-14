# Multi-Surface String Forking Policy

**Aspect:** 4.69e-i-a-i-f-i-α-i-A-α-i — Multi-surface string forking policy: when one surface changes significantly, should the key be forked into two single-surface keys; migration tooling and TM impact

**Parent:** 4.69e-i-a-i-f-i-α-i-A-α — Multi-surface string handling (established: inline-array schema with `shared.` prefix; strictest-budget policy; surface-scoped overrides as Phase 2 escape hatch)

**Sibling aspects:** 4.69e-i-a-i-f-i-α-i-A-α-ii (shared namespace governance), 4.69e-i-a-i-f-i-α-i-A-α-iii (TM deduplication), 4.69e-i-a-i-f-i-α-i-A-α-iv (strictest-budget tie-breaking), 4.69e-i-a-i-f-i-α-i-A-α-v (legacy codebase scan)

---

## The Core Problem

The parent analysis established that multi-surface strings use the `shared.` namespace prefix and declare all their surfaces in an inline array. The surface-scoped override system (Option C, Phase 2) allows `#surface` suffix variants so a string can render differently on its two declared surfaces while sharing a single translation key.

This design is excellent for the initial multi-surface case. But multi-surface strings age. They accumulate surfaces, constraints, and override variants over time. At some point, the question becomes:

> **When is a multi-surface string no longer one string, and instead two strings that happen to have the same English source text?**

The forking decision is the inverse of the shared-key decision. When you create `shared.error.sampleSizeWarning.body` to cover toast and modal, you are asserting: "these two surfaces convey the same meaning; a single translation concept handles both." Forking is the assertion that this claim has become false.

### What Triggers the Question

Three scenarios make a team ask "should we fork this?":

**Scenario A: Budget Divergence.** The toast is redesigned from 320px to 200px. The strictest-budget policy now forces ALL translations to fit a very tight constraint. The modal version at 480px could support a much more expressive phrasing — one that helps the player understand the problem more deeply — but the shared key's budget forces it to stay as terse as the toast. The team is losing expressive value in the modal to save one key name.

**Scenario B: Semantic Divergence.** Over successive game design iterations, the toast version of a message evolved into a quick action cue ("Buffer full — pause?") while the modal version became an explanatory paragraph ("Your agent's context buffer is full. Incoming signals are being dropped. Consider increasing buffer size or adding an eviction rule."). The surface-scoped override system technically handles this — `#toast` and `#modal.confirm` are different strings — but the `shared.` key now nominally refers to two completely different concepts. The "shared" framing is a fiction.

**Scenario C: Surface Count Explosion.** The string has accumulated 5 surface declarations through organic growth: `["toast", "modal.confirm", "modal.full-screen", "sidebar.panel", "audit-log.table-cell"]`. The strictest-budget policy is now dictated by `sidebar.panel`, the narrowest surface. Translations have become so terse that they're unhelpful in the modal. The team has N override variants in every locale file and the string is conceptually a different string in every context.

### The Core Tension

**Against forking:**
- Key renaming is a hard break in translation memory. Approved translations for the old key do not automatically transfer to the new keys.
- Fork introduces maintenance overhead: two keys must be kept conceptually consistent over time. Semantic drift between the forked keys is a risk.
- Migration tooling must update every call site in the codebase. Any call site missed gets a silent key-not-found fallback (usually an empty string or key name displayed raw).
- Forking looks like "we failed to design the string correctly." There is cultural resistance in localization teams against creating more keys.

**For forking:**
- The `shared.` prefix exists to signal "this is one concept." When the concept has split, the prefix is misleading.
- The strictest-budget policy applied to a multi-surface key with high budget disparity forces unnatural phrasing in the generous surface. This is a form of quality debt that compounds: translators making terse choices for a modal because a toast in the same key needs it.
- Surface-scoped overrides technically solve the budget problem, but they create TM fragmentation: the `#modal.confirm` variant is a separate TM segment from the base key. You already have two segments — the fork just makes the split explicit and gives it a proper name.
- A forked key is easier to audit: its naming convention (`modal.error.sampleSizeWarning.body`) tells you exactly where it renders. The `shared.` key requires reading the surfaces array.

---

## Option 1: The Never-Fork Policy ("Surface Overrides All The Way Down")

**Design:**

Forking is explicitly prohibited by policy. When a multi-surface string develops budget or semantic divergence, the answer is always surface-scoped translation overrides (`#surface` variants), never key forking. The `shared.` namespace is permanent.

**When this works:** The string source text (English) is the same for both surfaces. Only the translation length or word choice differs. A Japanese translator needs a shorter form for the toast and a slightly longer form for the modal — but the English source is identical. This is purely a translation optimization, not a conceptual split.

**When this fails:** The English source itself needs to be different for the two surfaces. If `"Sample size too small"` (toast) and `"Your selected sample is too small for reliable statistical analysis"` (modal) are different English strings, maintaining them under one key means the source string is ambiguous — translators cannot derive both forms from a single source.

**Budget implications:** The strictest-budget policy remains the constraint. Surface overrides allow per-surface translation tailoring but do not loosen the policy itself. A validator must enforce that the `#surface` variant fits its specific surface's budget, not the strictest budget (this was described in Option C of the parent analysis as a Phase 2 feature).

**TM implications:** Surface variants (`#toast`, `#modal.confirm`) are separate TM segments. The TM will have 3 segments per locale for a 2-surface string with 2 override variants: base key, `#toast` variant, `#modal.confirm` variant. Translation cost increases, but TM matches between variants and the base key can provide fuzzy starting points for translators.

**Strengths:** Zero migration cost. No call-site updates. No TM breaks. Conceptual simplicity: one string key, translation adapts.

**Weaknesses:** When English source text diverges, the model breaks. The "never fork" policy requires defining what "same English source" means — and enforcing that definition is difficult. A gradual semantic drift scenario (where the source English is tweaked slightly in each update) can turn a legitimate shared key into a fiction over years.

**Verdict:** Appropriate only when a team can commit to keeping the English source text identical across surfaces. Requires an explicit review gate on source-text changes to multi-surface keys.

---

## Option 2: The Always-Fork Policy ("Shared Keys Are Temporary")

**Design:**

Multi-surface strings (`shared.*` keys) are explicitly temporary. They exist only until the first surface-specific requirement appears — any override variant triggers an immediate fork. The `shared.` namespace is a staging area, not a permanent home.

**Process:** When a developer adds a `#surface` variant to a `shared.` key, CI emits a Tier 1 warning: "This key now has a surface-specific override. Per policy, consider forking into surface-specific keys. See `make fork-string KEY=shared.error.foo`."

**TM implications:** Because forking happens early — before translations have diverged much — the TM seeding is more accurate. The toast fork's base translation is seeded from the `#toast` variant (exact match if one exists, or the base key translation as a fuzzy match). Translation review cost is low.

**Strengths:** Keeps the `shared.` namespace small and intentional. Prevents the namespace from filling with 4-surface, 6-override-variant keys. Forking early means migration tooling runs on smaller diffs.

**Weaknesses:** Premature forking. A `#toast` variant might exist only because the German toast translation needed one word shortened — the conceptual unity of the string is fine. Forking immediately discards the conceptual clarity of the shared key for a transient translation optimization. Teams resist this policy as over-engineering.

**Verdict:** Too aggressive for most teams. The cost of early forking outweighs the benefit. Rejected as a default policy; applicable only in large codebases with dedicated l10n staffing.

---

## Option 3: Budget-Divergence-Triggered Forking ("The 60% Rule")

**Design:**

Forking is triggered automatically when the budget ratio between the loosest and strictest declared surfaces exceeds a threshold. The default threshold: if the loosest surface's budget is more than 1.67× the strictest surface's budget (i.e., the strictest is less than 60% of the loosest), the budget generator emits a fork advisory.

**Example:** Toast budget 50 chars, modal budget 90 chars. Ratio: 90/50 = 1.8. Threshold: 1.67. Advisory fires: "Budget divergence 1.8× between `toast` and `modal.confirm`. Consider forking `shared.error.sampleSizeWarning.body` into surface-specific keys."

The 60% threshold is configurable in `l10n/policy.json`:
```json
{
  "multi_surface_fork_threshold": 1.67,
  "fork_advisory_level": "warning"  // "warning" | "error" | "off"
}
```

Setting `fork_advisory_level: "error"` makes the budget-divergence fork advisory a PR-blocking check. Setting `"off"` disables automatic fork advisories entirely (Option 1 territory).

**What the advisory does NOT do:** It does not fork automatically. It opens a task. The developer reviews the key, decides whether the budget divergence represents conceptual divergence, and either forks manually or adds a `# fork-advisory-suppressed: reason` comment to the map entry with a justification.

**Strengths:** Objective trigger. The 60% rule is documentable and auditable. It catches Scenario A (budget divergence) precisely. Teams can adjust the threshold per project.

**Weaknesses:** Does not catch Scenario B (semantic divergence without budget divergence). A string can be conceptually split while having similar budgets across surfaces. The budget-divergence trigger misses this entirely. Also: the 60% threshold is arbitrary; different teams will argue for different numbers.

**Verdict:** The right default for automated tooling. Handles the most common case (Scenario A). Must be supplemented with a manual semantic review process for Scenario B.

---

## Option 4: Semantic Drift Detection ("The Divergence Score")

**Design:**

Post-translation, a nightly job computes the token overlap between the base key translation and each `#surface` variant translation across locales. If the overlap falls below a threshold (e.g., fewer than 40% of tokens shared in 3+ locales), a semantic divergence advisory fires.

**Implementation sketch:**

```python
def surface_divergence_score(base_translation, surface_variant_translation, locale):
    base_tokens = tokenize(base_translation, locale)
    variant_tokens = tokenize(surface_variant_translation, locale)
    overlap = len(set(base_tokens) & set(variant_tokens)) / max(len(base_tokens), len(variant_tokens))
    return overlap  # 1.0 = identical, 0.0 = no shared tokens
```

A score below 0.40 in 3+ locales generates a fork advisory tagged with "semantic divergence: low token overlap."

**Strengths:** Catches Scenario B directly. Detects when translations have organically drifted to the point where they no longer read as variants of the same concept.

**Weaknesses:** Requires post-translation infrastructure. The semantic check only fires after translations exist, which is typically weeks after the source string is added. False positives in languages with high morphological variation (Finnish, Turkish) where word forms share few surface tokens even when semantically close. CJK languages where a one-character difference can represent a significant conceptual shift.

**Verdict:** A useful supplement to Option 3 in large game projects with dedicated L10n QA. Too complex for initial implementation. Phase 3 feature.

---

## Option 5: Manual Forking with Comprehensive Tooling ("The Recommended Default")

**Design:**

Forking is a developer decision, never automatic. The tooling makes forking trivially easy and safe. The 60% budget-divergence advisory (Option 3) surfaces the need; the developer pulls the trigger.

**The `make fork-string` command:**

```bash
make fork-string KEY=shared.error.sampleSizeWarning.body
```

Output:
```
Forking shared.error.sampleSizeWarning.body
  Declared surfaces: toast, modal.confirm
  Existing #surface overrides: #toast (de-DE, fr-FR, ja-JP, ko-KR)

  Will create:
    toast.error.sampleSizeWarning.body     → seeded from #toast overrides (4 locales exact match)
    modal.confirm.error.sampleSizeWarning.body → seeded from base key (10 locales, will be TM matches)

  Will update call sites:
    src/components/ToastError.tsx:47      → t('toast.error.sampleSizeWarning.body')
    src/components/ConfirmModal.tsx:103   → t('modal.confirm.error.sampleSizeWarning.body')

  Will add TM migration records:
    shared.error.sampleSizeWarning.body → toast.error.sampleSizeWarning.body (exact)
    shared.error.sampleSizeWarning.body → modal.confirm.error.sampleSizeWarning.body (base key seed)

  Will remove from string-surface-map.json:
    shared.error.sampleSizeWarning.body

  Dry run output. Run with --apply to execute.
```

Running with `--apply`:
1. Updates `string-surface-map.json` — removes the `shared.` entry, adds two single-surface entries
2. Updates all i18n locale files — creates the two new keys, seeds translations from overrides and base key, removes the old key and override variants
3. Runs the codemod — rewrites all call sites, passing the correct surface argument to the renamed key
4. Creates TM migration records in `l10n/tm-migrations.json` — allows the TM system to link old key to new keys for continuity
5. Emits a human-readable change report for PR review

### TM Migration Record Format

```json
{
  "timestamp": "2026-03-14T09:42:00Z",
  "migration_type": "fork",
  "source_key": "shared.error.sampleSizeWarning.body",
  "targets": [
    {
      "new_key": "toast.error.sampleSizeWarning.body",
      "seed_type": "surface_override",
      "seed_source": "#toast",
      "locales_exact_match": ["de-DE", "fr-FR", "ja-JP", "ko-KR"],
      "locales_fuzzy_seed": ["en-US", "es-ES", "pt-BR", "ru-RU", "ar-SA", "zh-Hans"]
    },
    {
      "new_key": "modal.confirm.error.sampleSizeWarning.body",
      "seed_type": "base_key",
      "locales_exact_match": [],
      "locales_fuzzy_seed": ["de-DE", "fr-FR", "ja-JP", "ko-KR", "en-US", "es-ES", "pt-BR", "ru-RU", "ar-SA", "zh-Hans"]
    }
  ],
  "reason": "budget-divergence-advisory",
  "budget_ratio_at_fork": 1.80
}
```

**How the TM system uses migration records:** When the TM engine receives new segments for `toast.error.sampleSizeWarning.body`, it checks `tm-migrations.json` and finds the migration record. It loads the seeded translations as "leveraged" entries at 100% match (for exact seeds) or 75% fuzzy match (for base key seeds). Translators see these as pre-filled segments requiring review, not fresh untranslated strings. Net effect: forking a well-established shared key costs 30–50% of what translating it fresh would cost.

**Strengths:** Developer controls the decision. Tooling makes it safe and auditable. TM migration records preserve translation history. The fork is transparent in PRs (the diff shows exactly which call sites changed, which translations were seeded from which sources).

**Weaknesses:** Requires maintaining the codemod and TM migration infrastructure. The codemod can miss dynamic key construction (`t('shared.' + variant + '.body')`). TM systems vary in how they ingest migration records — this requires vendor-specific integration.

**Verdict:** The right default policy. Forking is manual with excellent tooling, triggered by the budget-divergence advisory or developer judgment.

---

## The TM Impact in Detail

### Scenario: Fork a key with 4 locales having surface overrides, 6 locales having only base key

A `shared.` key has been translated in 10 locales. 4 locales (de-DE, fr-FR, ja-JP, ko-KR) received `#toast` override variants because their translations were too long for the toast budget. 6 locales (en-US, es-ES, pt-BR, ru-RU, ar-SA, zh-Hans) translated the base key and it fit the toast budget without an override.

**After forking:**

| Locale | toast fork status | modal.confirm fork status |
|--------|-------------------|--------------------------|
| de-DE | Exact match from `#toast` — no translation cost | Fuzzy seed from base key — review cost only |
| fr-FR | Exact match from `#toast` | Fuzzy seed from base key |
| ja-JP | Exact match from `#toast` | Fuzzy seed from base key |
| ko-KR | Exact match from `#toast` | Fuzzy seed from base key |
| en-US | Fuzzy seed from base key (likely = base, no changes needed) | Fuzzy seed from base key |
| es-ES | Fuzzy seed from base key | Fuzzy seed from base key |
| pt-BR | Fuzzy seed from base key | Fuzzy seed from base key |
| ru-RU | Fuzzy seed from base key | Fuzzy seed from base key |
| ar-SA | Fuzzy seed from base key | Fuzzy seed from base key |
| zh-Hans | Fuzzy seed from base key | Fuzzy seed from base key |

Total translation work: 4 exact matches (no cost) + 16 fuzzy seeds (review cost, typically 20–30% of full translation cost per segment). If the base key and the modal fork have the same budget requirements, the fuzzy seeds for the modal fork may pass without changes — review confirms the existing translation is fine.

Worst case cost: 16 segments × review rate. Best case: 4 exact + 16 auto-approved fuzzy = 0 additional translation cost.

### The Key Rename Problem in TM Systems

Most TM systems (Phrase, Lokalise, Crowdin, Transifex) track segments by key name. Renaming a key is treated as:
1. Delete old segment (translations archived or discarded)
2. Create new segment (no translation history)

The migration record approach sidesteps this by seeding the i18n files with translations BEFORE the new segments are pushed to the TM. The TM receives a new key that already has translations in all locales. The system sees it as an "already-translated segment with 100% source match" — no translator action needed unless review is required.

This is the **pre-seeding pattern**: perform the translation work locally (from overrides and base key seeds), commit the populated i18n files, then push to TM as if the translations were done. The TM history for the old key is archived; the new key starts with a clean but fully-translated history.

---

## Developer Journeys

### Journey: Aarav, 28, Front-End Developer — Deciding Whether to Fork

**Context:** Aarav is the developer who originally created `shared.error.sampleSizeWarning.body` (documented in the parent analysis). Six weeks later, a design update narrows the toast to 200px. The budget generator emits a budget-divergence advisory: the toast budget dropped from 50 to 32 chars, while the modal.confirm budget is 90 chars. Ratio: 90/32 = 2.8. The threshold is 1.67. Advisory fires.

**Minute 0:00 — The Advisory Appears**

Aarav opens his morning CI digest. One advisory in the budget report:

```
FORK ADVISORY — budget divergence 2.8× (threshold: 1.67)
  Key: shared.error.sampleSizeWarning.body
  Strictest surface: toast (32 chars soft, was 50)
  Loosest surface: modal.confirm (90 chars soft)
  Divergence ratio: 2.8 (threshold: 1.67)

  Current de-DE translation: "Stichprobengröße zu klein." (26 chars) — passes 32 limit
  Note: previous translation was 58 chars — shortened in last l10n cycle to fit toast

  To fork: make fork-string KEY=shared.error.sampleSizeWarning.body
  To suppress: add "# fork-advisory-suppressed: [reason]" to map entry
```

Aarav's first thought: the German modal is now constrained to a 26-character translation that reads as a fragment. He checks the modal mockup — the design shows a full paragraph slot where a complete sentence would look natural. The toast is a two-word banner. These are not the same string concept.

**Minute 2:00 — Running the Fork Tool**

Aarav runs `make fork-string KEY=shared.error.sampleSizeWarning.body` in dry-run mode. The output shows 2 call sites updated (ToastError.tsx and ConfirmModal.tsx), translations seeded. He confirms the modal fork can take a longer translation — it will need a retranslation request for the 4 locales that had short override variants.

He runs with `--apply`.

**Minute 3:30 — PR Review**

The diff is clear: two new map entries, two new keys in every locale file, two call sites updated, one TM migration record added. The old `shared.` key is gone. The German modal fork reads as "Stichprobengröße zu klein." — the same terse translation, but now with a 90-char budget. Aarav files a follow-up localization ticket: "modal.confirm.error.sampleSizeWarning.body — existing de-DE/fr-FR/ja-JP/ko-KR translations are terse due to old toast constraint; request expressive retranslation."

**Minute 4:00 — Resolution**

Aarav merges the fork PR. Two days later, the localization vendor provides expressive translations for the modal fork in 4 locales. The toast fork keeps the terse translations — they're appropriate there. The string is now two strings with separate lifecycles.

**UI Annotations:**
- CI fork advisory: orange (warning-level) block in budget report; shows ratio, threshold, old vs. new budget, current translations with char counts; `make fork-string` command is copy-pasteable from the advisory
- `make fork-string` dry-run output: tree-structured terminal output showing files to be created/updated with counts; "Will update call sites: N" with file paths and line numbers; confirmation prompt before `--apply`
- PR diff: fork script generates a single commit with all changes; commit message includes migration record summary; diff is readable as a mechanical rename with seeded translations

---

### Journey: Margot, 34, Senior Developer — Suppressing a False Advisory

**Context:** Margot receives a fork advisory for `shared.label.configVersion`, which appears in both the workbench header tooltip (40 chars budget) and the audit log table header cell (35 chars budget). The ratio is 40/35 = 1.14 — below the threshold. But a responsive layout change made the table header cell 30 chars on tablet. The ratio is now 40/30 = 1.33 — still below 1.67. Next change narrows the tooltip to 28 chars. Ratio: 40/28 = 1.43. Still below threshold.

Six months later: a new surface is declared for `shared.label.configVersion` — a sidebar panel where the budget is 60 chars. Now the ratio is 60/28 = 2.14. Advisory fires.

**Minute 0:00 — Reading the Advisory**

Margot opens the advisory. It shows the toast (28 chars) as the strictest surface and the new sidebar panel (60 chars) as the loosest. She checks the string: "Config v3.2" (or its locale equivalents). It's a version label. The concept is identical across all surfaces — it is genuinely one string. The budget disparity exists because the tooltip got narrow, not because the string means different things in different places.

**Minute 1:00 — Making the Suppression Decision**

Margot opens `string-surface-map.json` and adds:
```json
{
  "key": "shared.label.configVersion",
  "surfaces": ["tooltip.workbench-header", "table.audit-log-header", "sidebar.panel"],
  "slots": ["body", "header", "label"],
  "fork_advisory_suppressed": true,
  "fork_advisory_reason": "Version label: semantically identical across all surfaces; budget disparity from tooltip narrowing, not conceptual split. Review at next tooltip redesign.",
  "fork_advisory_reviewed_by": "margot",
  "fork_advisory_reviewed_at": "2026-03-14"
}
```

The `fork_advisory_suppressed` flag silences future advisories for this key. The `reason` and `reviewed_by` fields are required (CI enforces their presence when the flag is true). The CI budget report now shows this key as "SUPPRESSED (reviewed 2026-03-14 by margot)" rather than emitting the advisory.

**Minute 2:00 — Resolution**

Margot's PR is small: one map entry updated with suppression metadata. The reviewer reads the suppression reason and approves. The audit log shows this decision is tracked. If the tooltip budget tightens further below 20 chars, a new advisory fires (the suppression is not permanent — it suppresses the current ratio but not future changes).

Actually, suppression is permanent unless manually re-evaluated. The fork advisory suppression does not automatically expire. This creates a risk: the suppression reason says "review at next tooltip redesign," but if Margot leaves the team, no one will remember. The suppression metadata includes a `review_trigger` field (optional): `"review_trigger": "tooltip budget < 20"`. The budget generator checks this condition on each run and re-enables the advisory if the trigger condition is met.

**UI Annotations:**
- Suppression metadata in map entry: schema-validated fields (`fork_advisory_suppressed`, `fork_advisory_reason`, `fork_advisory_reviewed_by`, `fork_advisory_reviewed_at`); CI Tier 1 lint requires all four fields present when `suppressed: true`
- Budget report suppression display: replaces the advisory with a dim grey entry "SUPPRESSED (reviewed: [date] by [name])" + a link to the suppression commit; visible but not alarming
- `review_trigger` evaluation: budget generator evaluates trigger conditions on each run; if condition met, removes suppression and re-emits advisory with "SUPPRESSION TRIGGERED" prefix

---

### Journey: Dev, 26, Localization QA — Tracing a Post-Fork TM Gap

**Context:** Dev is auditing the TM migration for the `shared.error.sampleSizeWarning.body` fork (from Aarav's journey). The migration record shows `pt-BR` was seeded from the base key as a fuzzy match. The base key translation for pt-BR was "Amostra pequena demais." The modal.confirm fork was seeded with the same translation. Dev is reviewing whether the seeded pt-BR modal translation needs expressive retranslation.

**Minute 0:00 — TM Audit Tool**

Dev opens the L10n dashboard. Under "Recent Migrations," he sees the fork with status "10 locales seeded, 4 requested retranslation, 6 pending review." He clicks pt-BR.

The review view shows:
```
modal.confirm.error.sampleSizeWarning.body [pt-BR]
  Seeded from: base key (shared.error.sampleSizeWarning.body)
  Source: "Sample size too small for reliable results."
  Seeded translation: "Amostra pequena demais."
  Seed type: base key (fuzzy match)
  New budget for this surface: 90 chars (was 50 chars under strictest-budget policy)
  Seed char count: 22 chars — well within 90-char budget

  [Accept seeded translation] [Request retranslation] [Edit in-line]
```

Dev reads the translation. "Amostra pequena demais" — "Sample too small." In the context of a modal that now has room for a complete explanation, this reads as clipped. The modal design shows a full paragraph slot. The original short translation was a budget-forced artifact.

**Minute 1:30 — Making the Call**

Dev clicks "Request retranslation" and adds a comment: "Seeded translation is 22 chars but modal budget is now 90 chars. Original was forced short by toast constraint. Request full phrase, e.g., 'O tamanho da amostra é pequeno demais para uma análise confiável.'" (68 chars — fits comfortably in 90 char budget).

The retranslation request is queued for the vendor.

**Minute 2:00 — Vendor Response**

Two days later, vendor returns: "O tamanho da amostra selecionada é insuficiente para uma análise estatística confiável." (84 chars) — richly expressive, fits within 90 chars, reads as a complete modal explanation.

**Minute 2:30 — Resolution**

Dev accepts and the modal fork for pt-BR is now a proper sentence. The toast fork for pt-BR retained the terse "Amostra pequena demais." — appropriate for a quick visual cue. The fork accomplished exactly what it should: two independent translation lifecycles for two independent communicative functions.

**UI Annotations:**
- L10n dashboard "Recent Migrations" view: table showing each migration, seeded locale count, retranslation requested count, status badge (Pending Review / Complete); click-through to per-locale review view
- Per-locale review view: shows source, seeded translation, seed type, new budget vs. old, char count; three actions prominently displayed (Accept / Request Retranslation / Edit); comment field for request; decision is logged with timestamp
- Vendor retranslation queue: dev's comment is delivered to translator as a context note alongside the segment; translator sees the surface name, the budget, and the note

---

## Interaction Effects

**With `shared.` namespace governance (4.69e-i-a-i-f-i-α-i-A-α-ii):**

Forking is one of the two tools for reducing `shared.` namespace sprawl. The governance model (aspect ii) needs to know that forking is available — when a `shared.` key has grown to 5 surfaces, the governance advisory should point directly to `make fork-string` as the remediation path. The fork suppression mechanism is the other path: when forking is inappropriate (conceptually unified strings), suppression documents the decision.

**With multi-surface strings in TM deduplication (4.69e-i-a-i-f-i-α-i-A-α-iii):**

TM deduplication is relevant pre-fork (should `#surface` variants get TM matches against the base key) and post-fork (the two new single-surface keys get TM seeds from the old shared key). The migration record format in this analysis provides the post-fork TM seeding mechanism. The pre-fork TM matching policy (aspect iii) should be designed with the assumption that forks will eventually happen — TM segments should be stored with their source key lineage so migration seeds are accurate.

**With surface-scoped translation overrides (Option C of parent, 4.69e-i-a-i-f-i-α-i-A-α):**

Surface-scoped overrides are the alternative to forking. The policy hierarchy is:
1. **Use base key** — when all surfaces share a translation (no override needed)
2. **Use surface override** — when translations differ in length/phrasing but share English source
3. **Fork** — when English source has diverged, or when budget disparity is high enough to force unnatural phrasing in the generous surface

The `make fork-string` tool should be able to consume existing surface overrides as seed translations for the new forked keys (as shown in the TM impact analysis above). This makes forking from an overridden key nearly costless.

**With the budget regression triage workflow (4.69e-i-a-i-f-i-α-i-A-i-1-a-i-E):**

Budget regressions on multi-surface keys are a canonical trigger for fork advisories. The triage workflow from that aspect should include a step: "If budget divergence ratio ≥ 1.67 after layout change, check for fork advisory and evaluate whether to fork." The regression triage workflow and the fork advisory system share the same trigger condition — they should surface together in the CI budget report.

---

## Sensory Description

The `make fork-string` command runs fast — under 3 seconds for a 10-locale codebase. The terminal output feels like a surgical preview: precise, tree-structured, no ambiguity. The "Will create / Will update / Will remove" sections are color-coded — green for creations, amber for updates, red for removals. Each call site update shows the line number and the before/after text side by side.

The PR diff for a fork is visually balanced. Left side: one shared key entry in `string-surface-map.json` removed. Right side: two single-surface entries added. In the locale files, the before column shows one key with several `#surface` variants; the after column shows two clean keys with no variants. The migration feels like an extraction — something tangled becoming two clean things.

The fork advisory in the CI budget report sits in its own section, below the regression table and above the suppression log. It's orange-bordered, not red — a recommendation, not a failure. The ratio number is displayed in large type: `2.8×`. The threshold is shown next to it: `threshold: 1.67`. The gap is immediately legible. Below, the current translations for the strictest surface are listed with their char counts — you can see at a glance how much the constraint is forcing terse phrasing.

The suppression metadata in `string-surface-map.json` reads like a code comment: a developer explaining their decision to a future reader. The `fork_advisory_reason` field is the most human-readable part of the entire l10n infrastructure — it is someone's engineering judgment, written in plain language, preserved in version control.

---

## Comparable Systems

**Git branch model — merge vs. fork:** The "fork or stay shared" decision in strings mirrors the question of whether a codebase should fork. Both decisions are about when divergence is permanent enough to warrant separate version histories. Git's answer: fork when the histories will never converge. The string answer is the same: fork when the translations will never converge into a single expression.

**React component splitting:** A React component that is shared across two contexts often gets split into two components when the contexts need different behavior. The pattern is: start with one component, pass props for variation, split when the variation is so large that the props mechanism becomes obscure. Multi-surface strings follow the same lifecycle: start shared, add variants, split when variants dominate.

**CSS specificity and the "mega-class" problem:** A CSS class that handles 5 different contexts via modifier classes eventually becomes a maintenance burden. The recommendation (in modern CSS practice) is to split it into well-named contextual classes. The `shared.` key with 4 `#surface` variants is the localization equivalent of the mega-class. The fork is the equivalent of extracting contextual CSS classes.

**Legal document versioning:** In legal contexts, when a clause is used in two contract types, it starts as a shared template. When one contract type needs different language, the clause is "forked" into two separately maintained versions. The "never fork, always override" policy has a legal analog: using a single template with fill-in-the-blank overrides. The "fork when semantically diverged" policy has the legal analog of recognizing when the two contract types' needs have diverged enough that shared maintenance is a liability.

---

## The TikTok Clip

The fork tooling has one 15-second clip: a developer types `make fork-string KEY=shared.error.sampleSizeWarning.body`, watches the dry-run output scroll — 2 call sites, 10 locales seeded, 4 exact matches, 6 fuzzy seeds — types `--apply`, and sees the commit message appear: `l10n(fork): shared.error.sampleSizeWarning.body → toast + modal.confirm (2.8× budget divergence)`. The terminal returns in 2.3 seconds. The PR diff shows a net decrease of 1 key in the `shared.` namespace. Everything is precise, fast, and auditable. The clip is: "I just unsnarled a localization tangle in 3 seconds."

---

## New Aspects Discovered

- **4.69e-i-a-i-f-i-α-i-A-α-i-1 — Fork suppression expiry and `review_trigger` evaluation:** the suppression mechanism needs a lifecycle — permanent suppression creates debt; the `review_trigger` field (e.g., "suppress unless tooltip budget < 20") needs formal semantics; what conditions are expressible (budget threshold, surface addition, time-based expiry); CI evaluation logic for trigger conditions.

- **4.69e-i-a-i-f-i-α-i-A-α-i-2 — Codemod coverage for dynamic key construction:** `make fork-string` rewrites static `t('shared.key')` call sites, but dynamic construction (`t('shared.' + type + '.body')`) is opaque; how the migration tool detects and reports uncoverable call sites; whether dynamic keys are banned by policy or handled by a lookup table.

- **4.69e-i-a-i-f-i-α-i-A-α-i-3 — TM vendor integration for migration records:** the `l10n/tm-migrations.json` format needs vendor-specific exporters; Phrase, Lokalise, Crowdin each have different APIs for pre-seeding segments; design of the vendor-agnostic migration record format and the per-vendor export scripts.

- **4.69e-i-a-i-f-i-α-i-A-α-i-4 — Post-fork orphan detection:** after a fork, the old `shared.` key is removed; if any call site was missed by the codemod (due to dynamic construction or an un-scanned file), it will emit a key-not-found error at runtime; design of the post-fork orphan detector that scans for the old key name in the codebase after the migration commit.

- **4.69e-i-a-i-f-i-α-i-A-α-i-5 — Re-merging forked keys:** if two forked keys later converge (e.g., the narrow toast is redesigned wider and no longer constrains the shared budget), should there be a `make merge-strings` command that reverses the fork? Design of the merge tool, including TM reconciliation between two independently-evolved translation histories.

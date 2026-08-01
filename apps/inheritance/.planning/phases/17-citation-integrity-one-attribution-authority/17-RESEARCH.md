---
phase: 17
slug: citation-integrity-one-attribution-authority
created: 2026-08-01
status: measured
---

# Phase 17 — Research: Citation Integrity, One Attribution Authority

Everything below was **measured on this branch** (`gsd/deletion-milestone`, HEAD `422a03713`) by running
the compiled engine at `frontend/src/wasm/pkg/inheritance_engine_bg.wasm` over every committed corpus
input, and by re-deriving gate G28's own rules from `scripts/check-legal-traceability.mjs`. No figure
in this document is an estimate. The measuring scripts are throwaway and are not committed; every
number is reproducible from the commands quoted in each section.

No point of Philippine law is decided anywhere in this document. Where the correct legal *text* is
absent, section 5 says so and names the source it is transcribed from.

---

## 1. The four layers, and which of them derives an article today

| Layer | File | Reads the engine? | Verdict |
|---|---|---|---|
| Table | `frontend/src/components/results/DistributionSection.tsx:137` | `share.legal_basis.map(...)` | reads the engine |
| Pill | `frontend/src/components/results/StatuteCitationsSection.tsx:73` | `getArticleDescription(key)` on the raw string | reads the engine, **resolves nothing** |
| PDF | `frontend/src/components/pdf/PerHeirBreakdownSection.tsx:96-99` | `NCC_ARTICLE_DESCRIPTIONS[key] \|\| key` | reads the engine, **resolves nothing** |
| Narrative | `engine/src/step10_finalize.rs:500`, `:518`, `:173-192` | **no** — it formats article strings into prose from its own `match` arms | **second authority** |

The narrative is the only layer that *derives* an article. It does so in three places:

1. `step10_finalize.rs:500` — the CATEGORY section: `"As a {} (Art. 887 of the Civil Code), {} is a compulsory heir."`
2. `step10_finalize.rs:518` — the REPRESENTATION section: `"{} inherits by right of representation (Art. 970 of the Civil Code) in place of {}."`
3. `step10_finalize.rs:173-192` — `raw_label()`, whose match arms embed six citations into the category name itself.

Critically, `HeirNarrative` (`engine/src/types.rs:583-588`) carries only
`heir_id`, `heir_name`, `heir_category_label` and `text`. **The narrative has no `legal_basis` field at
the output boundary**, so the section-level `legal_basis` that `generate_heir_narrative` already builds
(`step10_finalize.rs:507`, `:520`) is discarded by `assemble_narrative`, which joins `s.text` only. The
prose is therefore the *only* citation carrier the frontend receives from the narrative, and the prose
is derived.

---

## 2. Measurement — narrative versus table, over the whole committed corpus

Corpus scanned: `engine/examples/cases` (20), `coverage-cases` (31), `testate-cases` (20),
`defect-cases`, `fuzz-cases` — **173 input files, 171 computed, 2 rejected by the engine**, yielding
**652 heir rows**.

Method: for each heir, collect every `Arts?\.\s*\d+[\d\-]*` token in `narrative.text` and subtract the
heir's own `share.legal_basis` set.

```
heir rows:                                                        652
rows whose narrative cites an article absent from its legal_basis: 615   (94.3%)
corpus files affected:                                            170 of 171
```

Narrative-only article tokens, by frequency:

| Token | Occurrences | Source |
|---|---|---|
| `Art. 887` | 564 | CATEGORY sentence, `step10_finalize.rs:500` |
| `Art. 176` | 31 | `raw_label` — illegitimate child |
| `Art. 972` | 25 | `raw_label` — nephew/niece |
| `Art. 970` | 25 | REPRESENTATION sentence, `step10_finalize.rs:518` |
| `Arts. 1003-1008` | 22 | `raw_label` — sibling |
| `Art. 179` | 6 | `raw_label` — legitimated child |
| `Arts. 1009-1010` | 4 | `raw_label` — other collateral |

**The audit's specific claim is confirmed exactly.** `engine/examples/cases/02-married-3lc.json`:

```
Ana    legal_basis ["Art. 996"]   narrative "... As a legitimate child (Art. 887 of the Civil Code), Ana is a compulsory heir."
Ben    legal_basis ["Art. 996"]   narrative "... As a legitimate child (Art. 887 of the Civil Code), Ben is a compulsory heir."
Carlos legal_basis ["Art. 996"]   narrative "... As a legitimate child (Art. 887 of the Civil Code), Carlos is a compulsory heir."
Rosa   legal_basis ["Art. 996"]   narrative "... As a surviving spouse (Art. 887 of the Civil Code), Rosa is a compulsory heir."
```

A second, un-audited instance was found: `engine/examples/cases/11-siblings.json` puts
`Art. 1006` in the table and `Arts. 1003-1008` in the narrative for the same two heirs.

---

## 3. Measurement — the citation pill is dead for every article the engine emits

`StatuteCitationsSection` calls `getArticleDescription(key)` with the **raw** engine string and never
calls the `parseArticleKey` normaliser that sits three lines above it in the same module
(`frontend/src/data/ncc-articles.ts:104-131`). `getArticleDescription` returns the key itself on a
miss, and the component then does `if (description === key) return null` — so a miss renders a chip
with no description panel and no error. That is the dead pill.

The engine emits **24 distinct `legal_basis` strings** across the corpus, always in the spaced form
`Art. 996`. The map is keyed in the unspaced form `Art.996`. Result:

```
distinct legal_basis strings the engine emits:        24
resolve against the map today (raw lookup):            0     (0 of 669 occurrences)
resolve after routing through parseArticleKey:        20
STILL unresolvable after parseArticleKey:              4
```

The four survivors, and why each fails:

| Engine string | Occurrences | `parseArticleKey` | Cause |
|---|---|---|---|
| `Art. 892 ¶1` | 7 | `null` | the regex is `^Art\.\s*(\d+)$` — the `¶1` suffix is not matched |
| `Art. 892 ¶2` | 14 | `null` | same |
| `Art. 983` | 15 | `Art.983` | **no `Art.983` entry exists in `NCC_ARTICLE_DESCRIPTIONS`** |
| `Art. 999` | 52 | `Art.999` | **no `Art.999` entry exists in `NCC_ARTICLE_DESCRIPTIONS`** |

The PDF has the identical defect at `PerHeirBreakdownSection.tsx:98`
(`NCC_ARTICLE_DESCRIPTIONS[key] || key`), so a printed return currently reads `Art. 996: Art. 996`.

---

## 4. `predictScenario` and `computeMock` — measured clean to delete

```
$ grep -rn "computeMock\|predictScenario" frontend/src engine
frontend/src/wasm/bridge.ts:5    * Falls back to computeMock() if WASM is not available.
frontend/src/wasm/bridge.ts:86   function predictScenario(
frontend/src/wasm/bridge.ts:219  export async function computeMock(input: EngineInput): Promise<EngineOutput> {
frontend/src/wasm/bridge.ts:230    const { scenarioCode, successionType } = predictScenario(
```

**Zero importers outside the file.** `predictScenario` is private to the module; `computeMock` is
exported but nothing imports it, including tests. `compute()` delegates unconditionally to
`computeWasm()`. The block is `bridge.ts:82-296` plus the stale sentence in the file header at line 5
and the stale `scenario-field-mapping.md` reference at line 8. Deleting it also removes the only uses
of `relationshipToCategory`, `categoryLabel`, `zeroMoney`, `EngineInputSchema`,
`EFFECTIVE_CATEGORY_LABELS` and `formatPeso` in this module —
`frontend/tsconfig.json` sets `noUnusedLocals`, so a partial deletion is a compile error rather than
dead code. That is the tripwire the plan relies on.

`predictScenario` is a line-by-line transcription of `engine/src/step3_scenario.rs:52-235` (its own
doc comment says so). It is the surviving duplicate legal rule named by CLAUDE.md invariant 5 and by
`EXT-02`.

---

## 5. The two missing article descriptions — where the text comes from

`Art. 983` and `Art. 999` have no entry in `NCC_ARTICLE_DESCRIPTIONS`. Both are registered engine
rules (`engine/legal-rules.json` `.rules[40]` and `.rules[50]`, both `implemented_in:
["src/step7_distribute.rs"]`, both `vector: null`) and both are described in the committed engine
spec:

- `specs/inheritance-engine-spec.md:1045` — `#### I3: n LC + m IC, No Spouse (Arts. 983, 895)` —
  "2:1 unit ratio. **No cap in intestate.**"
- `specs/inheritance-engine-spec.md:1052` — `#### I4: n LC + m IC + Spouse (Arts. 999, 983, 895)` —
  "Spouse = 1 LC share = 2 units".

The plan therefore supplies the two description strings **as literals transcribed from those two spec
headings**, in the same scenario-describing register the other 60 entries already use (compare
`"Art.995": "Surviving spouse with legitimate children: spouse takes one LC share"`). This is a
transcription from a committed, gate-covered source, not a new reading. Neither article is among the
three open questions — `LAWYER-04` (Art. 992), `LAWYER-06` (donation exceeding the estate) and
`LAWYER-08` (RA 11642) — and neither is touched by this phase.

`Art. 892 ¶1` and `Art. 892 ¶2` need no new text: `Art.892` already has a description. They need the
normaliser to stop rejecting a paragraph suffix, which is a lexical change.

---

## 6. The G28 constraint, and the measured way through it

`scripts/check-legal-traceability.mjs` **recomputes** `implemented_in` on every run under two fixed
rules: the production region of a file is everything before the first `#[cfg(test)]`, and an article
is "implemented in" a file when the literal `Art. NNN` (regex `/Art\. (\d+)/g`) occurs anywhere in
that region — **comments included**. Two violation markers matter here:

- `REGISTERED ARTICLE ABSENT` — a registered article no longer appears in any production region.
- `IMPLEMENTED_IN DRIFTED` — the registry disagrees with the recomputation.

**Naive removal breaks G28.** Simulating the removal of all eight prose citations with no
compensating change:

```
Art. 176 ["src/step10_finalize.rs"] -> []                       REGISTERED ARTICLE ABSENT
Art. 179 ["src/step10_finalize.rs"] -> []                       REGISTERED ARTICLE ABSENT
Art. 887 [step10_finalize.rs, step1_classify.rs] -> [step1_classify.rs]   IMPLEMENTED_IN DRIFTED
Art. 972 [step10, step2_lines, step7] -> [step2_lines, step7]             IMPLEMENTED_IN DRIFTED
```

Losing `Art. 176` and `Art. 179` from the registry would strip two Family Code articles out of the
engine's legal traceability altogether — a worse outcome than the defect being fixed.

**The measured way through.** Move each article literal from the *user-facing prose string* into a
*traceability comment on the line above*, preserving the exact literal form. The comment sits in the
production region, so the recomputation is unchanged, while the lawyer-facing narrative loses the
competing citation. Simulated with the eight replacements the plan specifies verbatim:

```
G28 producedBy deltas: 0        (0 == G28 completely unaffected)
prose literal "(Art. 887 of the Civil Code)"  still present in production source: false
prose literal "(Art. 970 of the Civil Code)"  still present in production source: false
prose literal "\"adopted child (RA"           still present in production source: false
prose literal "\"sibling (Arts"               still present in production source: false
```

The literal form must be preserved **exactly**. Expanding `Arts. 1003-1008` into `Art. 1003 to
Art. 1008` in a comment was simulated and introduces `ARTICLE NOT REGISTERED` for `Art. 1003` and
`Art. 1010`, which are not in the registry. The range forms `Arts. 1003-1008` and `Arts. 1009-1010`
do not match `/Art\. (\d+)/` and must be written unchanged.

---

## 7. Where the new gate goes, and what it may assert

`gates.manifest.json` holds 32 gates; `G14` is reserved and unregistered
(`grep -c '"G14"' gates.manifest.json` = 0) and is owned by `EXT-02`. Constraints read out of
`scripts/check-gate-manifest.mjs`:

- The lock freezes `{id, command, blocking}` only. `order` is **not** locked, and duplicate `order`
  values are not rejected — but every order 1 through 32 is currently taken, and `G9` sits at 32.
- `UNLOCKED GATE` fires if a manifest gate has no lock entry, so the manifest and the lock must be
  appended to **together**, in the same commit.
- `MALFORMED GATE` requires all nine keys: `id, name, order, command, cwd, precondition, blocking,
  proves, requirements`.

`G33` (`scripts/check-planning-truth.mjs:407-433`) then requires that `.planning/ORIENTATION.md`
carries `The gate set holds <N> gates.` matching the manifest length, and that `RESUME.md` carries
`ALL GATES PASSED (N/N)` with both numbers matching. Today those read 32; after registration they
must read 33. `.planning/STATE.md:57` and `:95` also state 32 in prose.

### What the gate can assert without any allow-list

The plan's design gives the narrative a real `legal_basis` field cloned from the share, which makes
the strongest assertions structural rather than textual:

1. `narrative.legal_basis` equals `share.legal_basis` element-for-element, per heir, per corpus case.
2. Every string in `share.legal_basis` resolves to a description through the single shared resolver.
3. `narrative.text` contains zero occurrences of the literal `of the Civil Code` — the exact phrase
   both derived sentences used, and the signature of a prose layer asserting authority.
4. The four layer source files contain zero article literals matching `/Art\.\s*\d/`, so no layer can
   hardcode one.
5. `frontend/src/wasm/bridge.ts` contains neither `predictScenario` nor `computeMock`.

Assertion 4 is what makes "no other layer may derive one" mechanically true rather than aspirational.

---

## 8. Recorded scope boundary — `raw_label` keeps its classification citations

After this phase `raw_label` still returns `"sibling"`, `"illegitimate child"` and so on **without**
the article, because the article moves to a comment. The six citations are preserved for traceability
but no longer reach the lawyer. This removes the residual disagreement measured in section 2 for
`Art. 176`, `Art. 972`, `Arts. 1003-1008`, `Art. 179` and `Arts. 1009-1010` — 88 of the 615 rows —
without any registry loss, because of the comment technique in section 6.

## 9. What this phase cannot deliver, stated up front

`bash scripts/ci-gates.sh` exiting 0 is **not** achievable in this phase. It is blocked on two owner
decisions carried forward from Phase 16 and recorded in `.planning/phases/16-.../16-FLOOR-BLOCKED.md`:
the test-count floor (`min_total_tests` 2119 against 2073 measured) and the two registered blocking
gates `G20`/`G21` whose scripts commit `4ccf06270` deleted. Neither is this phase's to clear. Every
gate claim in this phase is therefore proven with `bash scripts/ci-gates.sh --only <ID>`, and the
whole-suite claim is not made.

Two journey references (`results-view`, `results-family-tree`) are **already failing and already
withheld for human review** from Phase 16. This phase changes the results screen again — the pills
gain description panels and the narrative gains a citation row — so those two steps stay failing.
They are not re-approved here: the deletion-milestone nav exemption does not cover a citation change,
and `journey/approve.mjs` exists to stop exactly that.

---
phase: 17
plan: 17-03
status: complete
requirements: [CITE-01, CITE-03]
---

# 17-03 — One resolver

Committed `b7cdb230e` (9 paths).

## What changed

`resolveArticle()` in `frontend/src/data/ncc-articles.ts` is now the **one** place a `legal_basis`
string becomes a description. `grep -c "NCC_ARTICLE_DESCRIPTIONS"` is `0` in both
`StatuteCitationsSection.tsx` and `PerHeirBreakdownSection.tsx` — neither can obtain a description
except through it.

Resolution went **0 of 24 → 24 of 24**, by closing the three measured causes with the change named
for each:

| Cause | Fix |
|---|---|
| engine emits `Art. 996`, map keyed `Art.996` | route both call sites through `parseArticleKey` |
| `Art. 892 ¶1` / `¶2` rejected by the regex | accept an optional `¶N` suffix for **lookup only** |
| `Art.983` / `Art.999` absent from the map | two entries transcribed verbatim from `specs/inheritance-engine-spec.md:1045` and `:1052` |

**An unresolved citation is now loud.** On screen it renders a destructive-styled panel carrying
`data-citation-unresolved="true"` (on the chip too, so it is detectable without expanding); in the
PDF it prints the literal `CITATION NOT RESOLVED`. The silent `description === key` early return —
which made a miss indistinguishable from a collapsed panel — is gone.

`NarrativePanel` now renders the narrative's own `legal_basis` through the same pill component, so
the two places a lawyer looks for the governing article show the same array from the same source.

**A fourth derivation site the audit missed** was closed: `DistributionSection.tsx` — the layer this
phase calls the authority — hardcoded `Art. 1011` in the escheat banner and `Art. 1004 / 1006` as the
collateral title. `grep -c "Art\.\s*[0-9]"` went **2 → 0**; the escheat screen now renders the
engine's own `legal_basis` through the shared pill.

## Plan deviation, reported

Three test files beyond `files_modified` were updated. **None was weakened** — each was made faithful
or more specific:

- `NarrativePanel.test.tsx`, `ResultsView.test.tsx` — narrative fixtures predated the `legal_basis`
  field 17-02 added and passed `undefined`, crashing the component. The engine emits it on every
  narrative, so the fixtures now carry it. (Tests are excluded from `tsc`, which is why this was not
  a compile error.)
- `DistributionSection.test.tsx` — the escheat fixture passed `shares: []`, which the real engine
  never returns for I15; it returns one `STATE` share with `legal_basis ["Art. 1011"]`, verified
  against `engine/examples/cases/12-escheat.json`. The assertion was **strengthened** from
  `getByText(/Art. 1011/i)` to a `getByRole('button')` match on the engine-sourced chip plus its
  resolved description. The collateral banner assertion was updated to the new **exact** string, not
  relaxed to a substring.

## Verification

`DISTINCT 24 UNRESOLVED 0 []`. `npx tsc -b --force` exit 0. `npx vitest run src/data
src/components/results src/components/pdf` → **413 passed, 0 failed**. Full suite 2073 → **2079**
tests (six added), with the **same 31 ledgered failures in the same 8 files** — no regression. G13
exit 0. `git diff` on `ncc-articles.test.ts` shows **0 deleted lines**. No baseline touched.

---
phase: 21
plan: 21-05
status: complete
requirements: [RET-02, RET-04]
---

# 21-05 — A printable BIR Form 1801

Committed `c149c5650`, 3 files. No dependency added — `@react-pdf/renderer` was already at `^4.3.2` and
the estate-tax surface simply never used it.

| Check | Result |
|---|---|
| `DOC` / `USES_MODEL` / `PDF_FORMATTER` | 1 / 1 / 3 |
| `OWN_FORMATTER` / `SECTION_LITERAL` / `WALL_CLOCK` / `FIRM_HEADER` | 0 / 0 / 0 / 0 |
| `LIB_EXPORTS` | **3** |
| Component cases | **9 passed / 0 failed** |

Every amount goes through `formatPesoPdf`; case 3 asserts no `₱` reaches the document at all, because
the base-14 WinAnsi fonts write U+20B1 as a byte that overprints the first digit beside it.

## PDF null controls, and one pre-existing failure proven pre-existing

G22 `pdf-probe` PASS, G23 `pdf-structure` PASS, G25 `print-layout` PASS.

**G24 `pdf-visual` exits 1** — page 1: 2627 differing pixels, page 2: 1975. This was **proven
pre-existing, not inferred**: with every Phase 21 file reverted at `4f288cfb6` the same gate fails with
byte-identical pixel counts. Its cause is `b7cdb230e` (Phase 17-03), which changed
`PerHeirBreakdownSection.tsx` after the last reference approval in `6f02c89e4`. No reference image was
created, modified or approved here.

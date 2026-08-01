---
phase: 21
plan: 21-04
status: complete
requirements: [RET-03, RET-04]
---

# 21-04 — A CSV of the return carrying exact centavo integers

Committed `88fbec71f`, 2 files. No dependency added; `package.json` and `package-lock.json` untouched.

| Check | Result |
|---|---|
| `EXPORTS` | **5** |
| `SECTION_LITERAL` / `OWN_FORMATTER` / `WALL_CLOCK` | 0 / 0 / 0 |
| Unit cases | **16 passed / 0 failed** |

The numeric columns are raw integer centavos: the standard-deduction cell is the bare string
`500000000`, verified by dumping a real document rather than by reasoning. A declined line writes its
words (`NOT COMPUTED`, `OUTSIDE ENGINE COMPETENCE`), never `0`.

**CSV injection is defended**: `neutraliseFormula` prefixes an apostrophe to any cell beginning `=`,
`+`, `-` or `@`, which Excel and Google Sheets otherwise execute. The escaping rule is stated once and
implemented once; the fixture location `Lot 4, Block 12, Quezon City` exercises it.

## Deviation

The plan's objective mentions a formatted column alongside the integer column, but its concrete header
spec — and its case 5 assertion — name exactly six columns with no formatted one. The concrete spec was
followed, so no money formatter is imported and `OWN_FORMATTER` is 0.

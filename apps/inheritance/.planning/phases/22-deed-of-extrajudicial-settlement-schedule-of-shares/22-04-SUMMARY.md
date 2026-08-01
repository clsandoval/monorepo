# 22-04 — The DOCX, with no dependency

**Status:** complete. Commit `1be7ac7c9`.

## What shipped

- `frontend/src/lib/deed/docx.ts` — `buildDeedClauseDocx`, `escapeXmlText`, `extractDocxParagraphs`,
  `DOCX_PART_NAMES`, `DOCX_MIME_TYPE`.
- `frontend/src/lib/deed/__tests__/docx.test.ts` — 19 passing tests, with a local ZIP reader.

## Measured

```
cd frontend && npx tsc -b --force                        -> exit 0
npx vitest run src/lib/deed/__tests__/docx.test.ts
  Tests  19 passed (19)                                  -> exit 0
git diff -- frontend/package.json frontend/package-lock.json -> empty (no dependency added)
grep -c "wordprocessingml.document.main+xml" docx.ts     -> 1
grep -c 'xml:space="preserve"' docx.ts                   -> 2
grep -c "<w:sectPr/>" docx.ts                            -> 1
imports: only './zip', './clause-text', './schedule-lines'
```

The round-trip test is the one that makes ROADMAP criterion 2's word *same* checkable:
`extractDocxParagraphs(parts.get('word/document.xml')).join('\n')` equals
`buildDeedClauseText(schedule)` exactly, including for a decedent named
`Ampersand & <Angle> </w:t></w:r></w:p> Injection`, whose close-tag injection creates no extra
element.

## Deviation — an acceptance grep that cannot pass as written

The plan required `grep -cE "new Date\(\)|Date\.now\(\)|performance\.now\(\)|document\.|window\."`
to print 0. It prints **5**, and every one of the five is the OPC part name `word/document.xml` or
the media type `...wordprocessingml.document`, both of which the same plan specifies as required
literal content. The pattern `document\.` matches `document.xml`.

The intent — no clock and no DOM access — was measured instead with a pattern that separates the two:
`new Date\(\)|Date\.now\(\)|performance\.now\(\)|document\.(createElement|body|getElementById|querySelector|write)|window\.`
prints **0**.

# PDF page references

Approved page images for gate **G24** (`journey/pdf-visual.mjs`). Every page of the PDF the
product's own Export PDF button produces is compared pixel for pixel against the image here that
carries the same page number.

## Only one program writes here

`journey/pdf-approve.mjs` is the **only** writer. `journey/pdf-visual.mjs` has no write path into
this directory at all — no flag, no environment variable, no argument. A gate that could approve its
own reference would go green by rewriting its own expectation and nobody would ever see the change.
Approval is a deliberate, separately invoked act whose result lands in git as a reviewable diff.

`pdf-approve.mjs` can only promote an image a real run actually produced: it reads
`.journey-runs/<newest>/pdf/page-<n>.png` and refuses when no run has produced any.

Approval is **whole-document**, not per-page. Approving one page of a two-page report while leaving
the other at an older revision would leave this directory describing a document that never existed.

## The rasterisation parameters are part of the contract

Images here are `pdftoppm -png` output at **100 dots per inch**, produced through
`rasterizePdfPages` in `journey/pdf.mjs`. **Changing the resolution invalidates every image in this
directory**, exactly as `journey/browser.mjs` states for its viewport. If the resolution ever
changes, every page must be re-approved by a human looking at the new images.

Known exposure, recorded rather than claimed: the generated PDF's fonts are **not embedded**
(`pdffonts` reports base-14 `Times-Roman`, `Times-Bold` and `Helvetica`), so poppler substitutes from
the system font package. A different poppler version, or a different substitution font package, will
rasterise differently. This is the same exposure Phases 11 and 12 accepted for their browser
reference images.

## Tolerance

Every `page-<n>.json` sidecar carries `{"maxDiffPixels": 0}`. `journey/REFERENCES.md` permits raising
that for exactly one measured reason — a platform whose text rasterisation genuinely differs — and
requires whoever raises it to be named in an `approvedBy` field. Nothing may raise it to make a
failing run pass.

## Why these images are not under `journey/references/`

`scripts/check-journey-registry.mjs` (gate G16) raises `ORPHAN REFERENCE` for any `.png` under
`journey/references/` whose name is not a declared journey step, and its requirement list is frozen
to `JRNY-02 … JRNY-08`. A PDF page is not a browser step: it has no `url`, no `session` and no
`rubric`. Putting these images there would either break G16 or force PDF pages to masquerade as
browser steps carrying fields they do not have. They therefore get their own directory and their own
approval command, and G16 is left untouched.

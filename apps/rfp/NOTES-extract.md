# NOTES-extract — text extraction toolchain and storage design

**Status:** recon complete 2026-08-08, decisions made. **The production script now exists:
`apps/rfp/attachments.py`** (`discover` / `download` / `extract` / `run` / `stats` / `test`,
owns `docs.db`). E1–E4 were adopted verbatim and hold up on real files. **E5's schema in §5 is
superseded** — `attachments.py` splits it into `blobs` (one row per distinct sha256, extracted
once) and `documents` (one notice↔document edge per row), because §5's
`unique index doc_sha on documents(sha256)` makes the same file attached to two notices
*unrepresentable* rather than deduped; measured 4.7% of fetches are bytes already stored. Read
`attachments.py`'s docstring for the 200-notice pilot numbers, which correct §2 and §6:
notice-level OCR need is **13%**, not 37% (n=200), file-level **30.8%** of PDFs, image-only
pages **11.6%**, and mPhilGEPS projects to **18.5 GB / 1.3 h**, not 44 GB.
**Artifact left behind:** `apps/rfp/extract_lib.py` — the measured parser primitives plus a
self-contained assert selfcheck. `python3 extract_lib.py test` builds its own fixtures (including a
hand-written image-only PDF) and needs no network. It passes.
`python3 extract_lib.py FILE...` prints the classification for real files.

**What was measured against:** 22 fetch attempts from 12 PH government hosts, yielding **17 real
bid documents / 1,321 pages / 2.24 M chars of extracted text**, plus 6 synthetic fixtures for the
failure modes real files did not happen to contain. Every number below has a file behind it. Where I
extrapolate to the 22,068-notice corpus I say so.

---

## TL;DR — the five decisions

| # | Decision |
|---|---|
| **E1** | **PDF: `pdftotext -layout` + a normalization pass (`tidy()`).** poppler 22.02 is at `/usr/bin`, whole toolchain present. No Python PDF library, ever. |
| **E2** | **OCR: NO.** Not "not yet" — the scanned pages are physically below OCR resolution (median **72–150 ppi**) and the ones that *do* OCR carry only boilerplate. Flag them; do not spend on them. |
| **E3** | **No-text detection is PER PAGE, stored as counts, never a boolean.** Real bid documents are mixed: 8 of 17 have scanned inserts, worst case 71 of 209 pages (34%), yet only 1 of 17 has no text at all. A document-level flag calls all of them "fine". |
| **E4** | **DOCX/XLSX: stdlib `zipfile` + `ElementTree`. Zero dependencies.** Tested; output is complete including table rows and cached formula values. ZIP recursion is the *main* path, not an edge case, because PhilGEPS allows exactly one uploaded file per notice. |
| **E5** | **Separate `docs.db`, ATTACHed read-only.** Text is ~3.5 GB projected; `corpus.db` is the hot surface the model hits on every search and must stay ~100 MB. FTS5 **external-content** with the **`porter unicode61`** tokenizer and **no `tokenchars`**. |

---

## 0. What is on the box

`poppler-utils` is fully installed at `/usr/bin` — `pdftotext`, `pdfinfo`, `pdffonts`, `pdfimages`,
`pdftoppm`, `pdftocairo`, `pdfdetach`, `pdfsig`, `pdfseparate`, `pdfunite`, plus `qpdf` and `unzip`.
pdftotext reports version 22.02.0.

Missing at recon start: tesseract, LibreOffice, unrar/unar, 7z, `bsdtar`, `libarchive`, and even the
`file` binary (though `libmagic.so.1` is present, so `python-magic` would work via uv — not needed,
see E4). `uv 0.11.18` is available. **Passwordless `sudo` works** (`sudo -n true` → exit 0), and apt
has candidates for all of the above, so "not installed" was a choice to be made, not a constraint.

**I installed three packages** (cheap, reversible, and two are load-bearing):

```
sudo apt-get install -y tesseract-ocr unar antiword
```

- `unar` 1.10.1 — **required.** RAR is an officially allowed upload format (see §1) and there is no
  pure-Python RAR decompressor; `rarfile` shells out to exactly this kind of backend anyway. `unar`
  is the free one, reads RAR5, also handles zip/7z, and ships `lsar` for listing an archive's
  uncompressed sizes *before* extracting — which is the zip-bomb guard.
- `antiword` 0.37 — 200 KB of insurance for legacy binary `.doc`. Probably never fires (§1).
- `tesseract-ocr` 4.1.1 — installed **only to measure**, and the measurement says don't use it (§2).
  Safe to `apt remove`; nothing in the design depends on it.

---

## 1. The constraint that determines everything: PhilGEPS's own upload rules

From PhilGEPS's own *Bid Document Uploader* guide
(`philgeps.gov.ph/CMS_DOCUMENTS/Download/1612945660_BID%20DOCUMENT%20UPLOADER%20USER%20GUIDE.pdf`,
HTTP 200, 222,772 bytes, quoted verbatim):

> - Scan all your documents completely and properly. Make sure that details are clear and readable.
> - Maximum size of the file should not exceed 10MB
> - **Only PDF, ZIP and RAR files can be uploaded.** Word, Excel, Powerpoint and image files should
>   be saved as PDF or as ZIP/RAR file.
> - **Only 1 file can be uploaded per bid notice.** If there are 2 or more documents to upload, the
>   user should collate all documents into 1 .zip or .rar file.

Four consequences, and they are the whole design:

1. **The format list is short and closed: PDF, ZIP, RAR.** DOCX / XLSX / DOC / PPTX exist only as
   *members inside an archive*. Never build a standalone `.docx` fetch path; always build the
   recursion. (Corroborated in the wild by filenames like
   `2026-03-006-...-FOR-FY-2026.docx.pdf` and `Bid_docs.docx.pdf` — agencies literally "Save as PDF"
   from Word to satisfy the rule.)
2. **`documents per notice` is ~1 file, but N logical documents.** Any per-notice document count must
   be counted after archive expansion or it is meaningless. In `extract_lib.py` archive members get
   their own `documents` rows with `parent_doc_id` set.
3. **10 MB is the policy ceiling per notice**, which bounds the whole disk projection (§5).
4. **"Scan all your documents" is the official instruction.** That is why §2 had to be measured
   rather than assumed — the house style genuinely is photocopies.

`.rar` therefore is not exotic and `unar` is not optional. I could not build a `.rar` fixture (no rar
compressor on the box), so the RAR path in `extract_lib.py` is a shell-out stub with the exact
command; the first real `.rar` validates it. That is the one untested branch and I am flagging it as
such rather than claiming coverage.

---

## 2. OCR: no. Here is the number.

The tempting version of this answer is "scans are rare, skip it". That version is **wrong**, and I
nearly wrote it: only **1 of 17** documents has no text at all, but **8 of 17 contain scanned pages**
and **134 of 1,321 pages (10.1%)** are image-only. Ten percent of pages is not a rounding error, so
the question deserved a real measurement.

**The measurement that settles it — embedded raster resolution:**

| document | embedded images | min ppi | median ppi | share < 200 ppi |
|---|---|---|---|---|
| `cdo_pbd_compressed.pdf` | 37 | 72 | **72** | 68% |
| `sss_biddocs.pdf` | 82 | 96 | **129** | 94% |
| `bir_eis_merged.pdf` | 28 | 95 | **150** | **100%** |
| `ecc_biddocs.pdf` | 19 | 88 | **168** | 84% |

Tesseract wants ≥300 ppi. These are 72–150. **`pdftoppm -r 300` cannot help** — it upsamples a
451×613 embedded JPEG; the ceiling is the raster, not the render. Confirmed empirically: rendering
`cdo_pbd_compressed.pdf` p81 (a genuine photocopy of DPWH standard specifications) at 300 dpi and
running tesseract produced `PEM eat} EMBANAMENT` / `TEM 8O4[4) 9 GAAVE BED` — i.e. garbage for
"ITEM 804(1)b EMBANKMENT" and "ITEM 804(4) GRAVEL BED".

**And the pages that DO OCR cleanly carry nothing worth searching.** `sss_biddocs.pdf` p117 OCRs
legibly at 300 dpi, and what it yields is an architectural drawing index: `PROPOSED FLOOR PLAN`,
`REFLECTED CEILING PLAN`, `COMMON TOILET & BATH DETAIL`. Those words appear on every renovation
notice in the country. The photocopied pages that failed OCR are DPWH standard specification items
(`ITEM 804 EMBANKMENT`, `ITEM 900 REINFORCED CONCRETE`) which appear on every civil-works notice.

So the two populations are: **unOCRable, and not worth OCRing.** BM25 would score both at ~0 for
exactly the reason the design doc already relies on. The discriminating content — project title, ABC,
BOQ item names, location, PCAB class — is in the text layer and in the notice metadata already in
`tenders.db` / `legacy.db`.

Worked example, straight from the probe: the token `embankment` matches **0 of 17** real documents,
because in the one document that contains the word it lives on a scanned page. That is precisely the
recall loss OCR would buy back — and it buys back a word that is on every road project in the corpus.

**What to do instead:** store `scan_pages` and `text_pages` per document and let the ranking layer
demote a notice whose scope is unreadable, with an honest annotation (`scope in attachment, not
machine-readable`) rather than silently scoring it irrelevant. **Revisit only if** the first
production pass shows a meaningful population with `text_pages = 0 AND scan_pages > 3` — currently
1 of 17 (the synthetic control aside, it's the wholly-scanned case that has real cost). If that
population turns out to be thousands, the cheap escalation is **not** tesseract; it is rasterizing
the first 2 pages and sending them to a vision model for that bounded subset. Cost scales with the
subset, needs no system dependency, and reads low-res photocopies far better than tesseract 4 does.

---

## 3. Detecting a PDF with no text layer

**A clean exit code proves nothing, and neither does a document-level check.** Both traps, measured:

- `pdftotext` on a fully scanned PDF returns **rc=0** and writes **0 characters**. Asserted in the
  selfcheck. So the signal is the character count, never the return code.
- `pdffonts` on the same file prints an empty table — a valid corroborating signal at the document
  level, and useless at the page level.
- Document-level detection labels `sss_biddocs.pdf` "has a text layer" and quietly discards 71 of
  its 209 pages.

### The rule (implemented as `classify_pages()`)

Per page: `chars = non-whitespace chars from pdftotext for that page`.

| condition | class | meaning |
|---|---|---|
| `chars >= 100` | **text** | normal page |
| `chars < 100` and page raster `>= 200,000 px` | **scan** | real scanned insert |
| `chars < 100` and no meaningful raster | **blank** | section divider — benign, not a failure |

The blank/scan split is the part that took a measurement to find. Pages with 25–40 chars and zero
images are divider pages (`Section VII. Technical Specifications`), and they are everywhere:
`dict_security.pdf` has 8 of 65 and **0 scans**. Lumping dividers in with scans would make a clean
document look 12% broken. The 200,000-pixel floor separates a real scan (measured 276 K – 17.3 M px)
from a logo or signature graphic.

Document-level `extract_status` then falls out:
`text_pages == 0 and pages > 0` → **`no_text_layer`** (a finding, not an error).

### Do it with two subprocesses per document, not two per page

`pdftotext` separates pages with a **form feed**, and `pdfimages -list` carries a page-number column,
so both signals come from one call each. Measured over all 1,321 real pages: **identical
classification**, 5.03 s vs 19.63 s (4×). Projected over the corpus that is 1.9 h vs 6.7 h
single-threaded — ~30 min with 4 workers.

> **Trap paid for:** `pdftotext` emits a **trailing** form feed, so a 209-page document splits into
> 210 chunks and a 1-page document into 2. Slice to `n_pages` or every page number is off by one at
> the tail. Asserted in the selfcheck.

### Two more traps, both measured

- **Never capture stderr into the text column.** `pdftotext` writes `Syntax Error: ...` to stderr. My
  first measurement pass used `2>&1` and recorded 33–115 "characters" of extracted text for a
  zero-byte file and a truncated file — poppler diagnostics stored as document content. Separate the
  streams; `extract_lib.pdf_text()` returns `(stdout, rc, stderr)` and only stdout is text.
- **`rc != 0` with text present is `partial`, not a failure.** A truncated download yields
  `rc=1` and, depending on where the cut lands, some real text. Keep it, flag it.

Encryption behaviour, measured with `qpdf`-built fixtures:

| fixture | rc | chars | verdict |
|---|---|---|---|
| user password required | 1 | 0 | `encrypted` (stderr: `Command Line Error: Incorrect password`) |
| owner password, `--extract=n` (copy-protected) | **0** | **12,939** | `ok` — poppler ignores the permission bit. Good. |
| truncated to 50% | 1 | 0 | `corrupt` |
| 0 bytes | 1 | 0 | `empty` |

---

## 4. Extraction path per format

Detection is by **magic bytes, never by URL extension**. This is not hygiene, it is the single most
common real failure: **5 of my 22 fetches returned an HTML error page from a URL ending in `.pdf`,
with HTTP 200** (DPWH's cert chain fails, and `-k` then gets a 964-byte HTML interstitial). Without
sniffing, those become five documents with `extract_status='ok'` and empty text.

| format | path | notes |
|---|---|---|
| **pdf, text layer** | `pdftotext -layout -enc UTF-8` + `tidy()` | see below |
| **pdf, no text layer** | flag `no_text_layer`, store `scan_pages`, extract nothing | §2, §3 |
| **docx** | stdlib `zipfile` + `ElementTree` over `word/document.xml` (+ headers/footers/footnotes) | table rows joined with `\t`; split `w:r` runs rejoined |
| **xlsx** | stdlib, `xl/sharedStrings.xml` + `xl/worksheets/sheet*.xml` | handles shared strings, `inlineStr`, numerics, and **cached formula values** (a BOQ total is a formula) |
| **doc (legacy OLE)** | `antiword` | expected near-zero volume; magic `d0cf11e0` |
| **doc that is really RTF** | small regex strip | the actual common "legacy doc" in the wild |
| **zip** | stdlib `zipfile`, **recurse** | the main multi-document path |
| **rar** | `unar -q -o DIR FILE`, then treat members as files | untested branch — no rar compressor on the box |
| **html** | `not_a_document` | the 5-of-22 case |
| **7z / gzip** | sniffed and recorded, `unsupported` | not in the allowed upload list; don't build until seen |

### Why no PDF library

`pdftotext` is a subprocess and beats a dependency. It handled all 17 real documents at
**4.16 ms/page end to end** (306 ms/document including page classification and `pdfinfo`), and 209
pages of `sss_biddocs.pdf` in 0.25 s. `pypdf`/`pdfplumber`/`PyMuPDF` buy nothing here: we want plain
text, not layout objects, and PyMuPDF's licence is a conversation nobody needs.

### `-layout` + `tidy()`, and why not plain

`-layout` preserves table columns — load-bearing for a Bill of Quantities, which is where scope
actually lives — but costs 27% more bytes in left-margin padding (2.870 MB vs 2.257 MB over the
sample). `tidy()` strips trailing/leading pad, collapses runs of 3+ spaces to a single tab, and
collapses blank-line runs:

> `-layout` 2.870 MB → **`-layout` + tidy 2.253 MB** → plain `pdftotext` 2.257 MB

Same size as plain, and it keeps the columns. `-layout + tidy` strictly dominates; the choice is free.

### Why stdlib for OOXML

`python-docx` / `openpyxl` add a `uv --with` for something a 40-line stdlib function does completely.
Tested against generated-then-read OOXML plus a genuinely hand-written minimal fixture:
`804(1)b\tEmbankment\t120` survives from both DOCX tables and XLSX rows, and `TOTAL\t120` proves the
cached formula value is read. If a later agent finds a real file this loses text on, that is the
moment to add `openpyxl` — not before.

### Archive guardrails (all read from the central directory before extracting a byte)

```
ARCHIVE_EXPAND_MAX = 60 MB   # sum of member uncompressed sizes
ARCHIVE_MEMBER_MAX = 40      # members extracted per archive
ARCHIVE_DEPTH_MAX  = 2       # zip-in-zip is real; deeper is an attack
```

`lsar -l` (or `ZipInfo.file_size`) reports uncompressed size without extracting: a 204 KB fixture
declaring a 200 MB member is refused on the header alone. Encrypted members raise and are recorded
per-member as `encrypted` — **one bad member must not fail the notice.** Nested containers are
recursed *and* their children listed individually, with the container excluded from the joined text so
bytes are not double-counted (asserted).

---

## 5. Storage

### Separate database. `docs.db`, not `corpus.db`.

Projected extracted text is **~3.5 GB** (derivation in §6) against a `corpus.db` that will be
~100 MB. `corpus.db` is the surface a model queries 10–20 times per search; it should stay small
enough to be entirely in page cache. Separation costs nothing at query time because `ATTACH` makes
cross-database joins ordinary SQL — verified:

```sql
attach database 'file:/…/apps/rfp/docs.db?mode=ro' as d;
select n.id, n.title, n.abc, count(*) as docs, sum(x.scan_pages) as scans
from corpus n join d.documents x on x.notice_id = n.id and x.source = n.source
where x.doc_id in (select rowid from d.doc_fts where d.doc_fts match 'backhoe OR excavator')
group by n.id;
```

There is also a hard reason: **an FTS5 external-content table must live in the same database as its
content table.** Text and index travel together; only the notices are separable.

### Schema

Created and exercised end to end (34 documents + 12 archive members inserted, triggers verified,
`bm25()` and `snippet()` verified, read-only mode verified to refuse a write, `vacuum`ed and
measured). One deviation from the brief: `page/sheet count` is split into
`pages / text_pages / scan_pages / blank_pages / sheets`, because §3 is the finding and a single
count throws it away.

```sql
pragma journal_mode = wal;

create table documents (
  doc_id        integer primary key,
  notice_id     integer not null,          -- joins tenders.id / legacy refID
  source        text not null check (source in ('mphilgeps','legacy')),
  url           text not null,
  filename      text,                      -- basename as served
  parent_doc_id integer references documents(doc_id),  -- archive member -> its container
  member_path   text,                       -- path inside the archive, null for top level
  bytes         integer,                    -- as fetched (member: uncompressed size)
  sha256        text,                       -- of the fetched bytes; dedupe + refetch key
  fmt           text,                       -- pdf docx xlsx zip rar rtf ole txt html unknown
  pages         integer,
  text_pages    integer,                    -- >= 100 non-space chars
  scan_pages    integer,                    -- image-only: the OCR-would-be-needed count
  blank_pages   integer,                    -- dividers; benign, tracked so they aren't scans
  sheets        integer,                    -- xlsx worksheets
  extract_status text not null,             -- closed vocabulary, see below
  extract_note  text,                       -- poppler stderr / member verdicts, truncated
  chars         integer,                    -- length(text); lets you query without reading text
  text          text,
  fetch_status  integer,                    -- HTTP status of the fetch
  fetch_errors  integer not null default 0, -- retire at 3, as ingest.py already does
  fetched_at    text,
  extracted_at  text
);

-- table-level UNIQUE cannot hold an expression, so idempotency is an index
create unique index doc_ident on documents(source, notice_id, url, coalesce(member_path,''));
create index doc_notice on documents(source, notice_id);
create index doc_status on documents(extract_status);
create unique index doc_sha  on documents(sha256) where parent_doc_id is null;

create virtual table doc_fts using fts5(
  text,
  filename,
  content='documents', content_rowid='doc_id',
  tokenize="porter unicode61 remove_diacritics 2"
);

create trigger doc_ai after insert on documents begin
  insert into doc_fts(rowid, text, filename) values (new.doc_id, new.text, new.filename);
end;
create trigger doc_ad after delete on documents begin
  insert into doc_fts(doc_fts, rowid, text, filename)
    values('delete', old.doc_id, old.text, old.filename);
end;
create trigger doc_au after update on documents begin
  insert into doc_fts(doc_fts, rowid, text, filename)
    values('delete', old.doc_id, old.text, old.filename);
  insert into doc_fts(rowid, text, filename) values (new.doc_id, new.text, new.filename);
end;

-- per-notice rollup, so ranking never has to aggregate document rows itself
create view notice_docs as
select source, notice_id,
       count(*) as n_docs, sum(bytes) as bytes, sum(chars) as chars, sum(pages) as pages,
       sum(scan_pages) as scan_pages,
       sum(case when extract_status='ok' then 1 else 0 end) as n_ok,
       group_concat(distinct extract_status) as statuses
from documents group by source, notice_id;
```

`extract_status` is a **closed vocabulary** and the selfcheck asserts nothing escapes it:
`ok · no_text_layer · partial · encrypted · corrupt · not_a_document · unsupported · too_large ·
empty`. Every non-`ok` value must reach the search layer. The failure this prevents is the one
nobody reports: a notice whose scope was unreadable scoring as merely irrelevant.

### FTS5 configuration — the two settings that were measured, not guessed

**External content, not the default.** Measured over the real 2.87 MB sample:

| variant | db total | ratio to text | index alone |
|---|---|---|---|
| default fts5 (keeps its own copy) | 6.44 MB | **2.24×** | 3.55 MB |
| **`content='documents'` (external)** | 3.55 MB | **1.24×** | 0.66 MB (**0.23× text**) |
| external + `porter` | 3.51 MB | 1.22× | 0.61 MB |
| external + `detail=none` | 2.99 MB | 1.04× | 0.10 MB |
| zlib blob, no FTS at all | 0.75 MB | 0.26× | — |

Default FTS5 nearly doubles the bill for nothing. `detail=none` is cheapest but **rejected**: it
kills phrase and `NEAR` queries, and the design doc's own example query is
`match 'software OR ICT OR "information system"'`.

**`porter unicode61 remove_diacritics 2`, and NO `tokenchars`.** The tempting `tokenchars '-_/.'`
(to keep `26RA0117`, `CG-1234-2026`, `804(1)b` intact) **silently destroys recall**:

| query | plain `unicode61` | `tokenchars '-_/'` | `tokenchars '-_/.'` |
|---|---|---|---|
| `"bill of quantities"` | **13** | 10 | **8** |

38% of the matches gone, because `Quantities.` stops being the token `quantities`. Against a design
whose stated metric is recall, that is disqualifying — and it fails silently, which is worse. Codes
survive fine without it: `"804(1)b"` matches 9 documents as the phrase `804 1 b`.

`porter` is a free win — same or smaller index (0.28× vs 0.30× text) and better recall:
`constructing` 0 → 20 documents; `backhoe OR excavator OR grader` 2 → 5.

> **For SKILL.md:** FTS5 treats `-` and `'` as syntax. Bare `re-bidding`, `cu.m`, `CG-1234-2026` and
> `804` all raise a syntax error; **double-quote any query token containing punctuation** and they
> all work. The query-writing model will hit this on its first real query.

`bm25()`, `snippet()` and `order by rank` all work over external content (verified — ranked
`"bill of quantities"` across 13 documents with correct highlighted snippets), and delete/update
triggers keep the index consistent (verified by deleting a row and re-counting).

**The schema above was executed verbatim.** A test lifted the fenced SQL block straight out of this
file, ran it, loaded all 17 real documents plus 12 archive members (46 rows), and asserted:
`documents` and `doc_fts` row counts match (triggers fire), the delete trigger decrements the index,
`doc_ident` rejects both a duplicate top-level row and a duplicate archive member while accepting a
distinct member of the same archive, and `mode=ro` refuses `delete from documents`. Final measured
size on that load: text 2.305 MB, FTS index 0.676 MB (**0.29× text**), database 3.047 MB
(**1.32× text**).

### Boilerplate stripping: don't build it

Cross-document line-frequency dedupe (`tag.py`'s approach, applied to documents) was measured and it
does not pay:

| drop lines appearing in ≥ N% of documents | text retained |
|---|---|
| 50% | 99.0% |
| 30% | 92.4% |
| 20% | 77.1% |

8% saved at a defensible threshold, and 23% only at a threshold that starts eating real content. Same
failure as the ~18% `tag.py` already measured on descriptions, for the same reason: `-layout` line
breaks fall in different places per document, so identical clauses do not produce identical lines.
**`zlib` gets 74% for free** (2.87 MB → 0.73 MB, i.e. 25.6%) with zero risk of dropping meaning. If
disk ever bites, compress; don't get clever.

---

## 6. Guardrails — recommended numbers

| cap | value | justification |
|---|---|---|
| **per file** | **25 MB** | PhilGEPS's own uploader ceiling is 10 MB, so 25 is 2.5× the policy limit. It accepts every legitimate document measured (largest real: 13.53 MB, agency-hosted, outside the uploader) and still refuses anomalies. A 12 MB cap — my first guess — rejected a real document. |
| **per notice** | **1 top-level file, 40 expanded members, 60 MB expanded** | "1 file per notice" is the platform rule, so >1 top-level document per notice means either a bid bulletin (`bid_notice_corrigendum_document`) or a bug — worth alerting on either way. 40 members covers the biggest plausible collation; the largest observed `doc_req_list` is 175 but that counts *suppliers*, not documents. |
| **archive depth** | **2** | zip-in-zip observed in the wild pattern; deeper is an attack, not a filing habit. |
| **total disk** | **20 GB hard stop, asserted before each fetch batch** | ~2× the steady-state projection below. 337 GB free on `/`, so this is a runaway detector, not a resource limit. |
| **pdftotext timeout** | **120 s** | 500× the slowest observed document (0.51 s for 163 pages). Generous by design: a hang is a bug to see, not to wait on. |
| **xlsx cells** | **200,000** | a BOQ is hundreds of rows; 200 K cells is a spreadsheet that is really a database. |

### The projection these rest on

Corpus mix, measured from the two existing DBs (read-only, `uri=True`):
**22,068 enriched notices = 15,972 competitive-bidding (72.4%) + 6,096 alternative-mode (27.6%)**.
That split matters because the two produce very different documents — a full Philippine Bidding
Document versus a 5-page RFQ. My sample happens to be mostly full PBDs, which is representative of
the 72%.

| | notices | median bytes | median text |
|---|---|---|---|
| competitive bidding (full PBD) | 15,972 | 2.55 MB | ~215 K chars |
| alternative mode (RFQ/SVP/shopping) | 6,096 | 0.47 MB | ~11 K chars |

- **Downloaded bytes: ~44 GB** median-based (~72 GB if the mean holds instead of the median; 221 GB at
  the 10 MB policy ceiling for all 22,068 — the ceiling is not the estimate).
- **Extracted text: ~3.5 GB.** → `docs.db` at the measured **1.32×** (final config: external content,
  porter, two indexed columns, `vacuum`ed) = **~4.6 GB**.
- **Extraction time: ~1.9 h single-threaded**, ~30 min at 4 workers, at the measured 306 ms/document.

### The lever that makes the disk number small: don't keep the blobs

Once text is extracted, the PDF has no further use except re-extraction, and `sha256` + `url` let you
refetch it. So **stream: fetch → extract → insert → delete the blob.** Steady state becomes:

```
docs.db                                      ~4.6 GB
retained no_text_layer blobs (~6% × 2.5 MB)  ~3.3 GB   <- keep these; a future vision pass needs them
transient (concurrency 6 × 25 MB)            <0.2 GB
                                             --------
                                             ~8 GB
```

against 44–72 GB if every blob is kept. Keep a `--keep-blobs` escape for a few hundred documents so
the parser stays debuggable, and keep the scanned-only ones permanently since §2's "revisit" trigger
depends on having them. `blobs/` is now in `.gitignore`, alongside `*.db-wal` / `*.db-shm` which the
WAL mode above makes necessary.

---

## 7. Availability of the documents — corroborating evidence only

This belongs to the download-recon agent; I probed 5 endpoints because I needed real bytes, and the
result changes the size projection, so it is recorded here rather than lost. **I did not attempt to
authenticate, and did not retry anything gated.**

| endpoint | result |
|---|---|
| `philgeps.gov.ph/portal_documents/bid_notice_documents/bid_notice_{N}/bid_notice_document/{epoch}_{name}.pdf` | **200, `application/pdf`, 2,553,273 B, no cookie, no auth.** Files are public. |
| …the same directory, listed | **403** |
| `philgeps.gov.ph/Tenders/tender_doc_view/{id}/{id}` (the "Documents: Preview" ajax) | **200**, but the body is a session-expired shell: *"Your session has been expired, please login in again"*. No document links. **The listing is gated.** |
| `notices.philgeps.gov.ph/…/SplashBidNoticeAbstractUI.aspx?refID=` | **200.** "Associated Components → Order" is `javascript:showAlert('')`; the real `__doPostBack('lbtnNosOfAssoc')` is **commented out** in the served HTML. |
| legacy `Bid Supplements` | **0 on all 15,436** enriched legacy rows where the field parsed. `doc_req_list` (median 1, max 175) counts *suppliers who requested documents*, not documents — do not mistake it for an attachment count. |

**The blocker is the mapping, not the files.** `bid_notice_{N}` is a sequence unrelated to notice id
(33, 203, 206, 3843 observed against notice ids in the 55,000s) and the filename carries an
unguessable upload epoch, so enumeration cannot substitute for the gated listing. If that mapping
stays closed, the corpus is whatever subset is reachable and every projection in §6 scales down
proportionally — the toolchain and schema are unaffected.

---

## 8. What is NOT tested, stated plainly

1. **RAR.** No rar compressor on the box, so the `unar` branch is an untested shell-out. Highest-value
   thing to verify with the first real archive.
2. **Legacy binary `.doc`.** `antiword` is installed and wired; no real OLE `.doc` was found (the
   upload rules predict there won't be many).
3. **A genuinely wholly-scanned document.** 0 of 17 real samples. The `no_text_layer` path is
   validated against a hand-built image-only PDF (`_min_pdf_image_only`, ~1 KB, stdlib zlib) and a
   rasterized real document — both classify correctly, but neither is a photocopy from PhilGEPS.
4. **The scan rate on the real corpus.** 10.1% of pages here, from 17 documents chosen by web search
   rather than sampled from PhilGEPS. The detector's whole purpose is to produce that number honestly
   on the first production run; treat 10% as an order of magnitude, not a measurement of the corpus.
5. **Sheet counts for XLSX** are in the schema but not exercised (no real xlsx was reachable).

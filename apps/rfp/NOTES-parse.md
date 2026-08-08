# Parser audit — `parse_detail` / `parse_listing`

**Date:** 2026-08-08 · **Sample:** 69 detail pages + 6 listing pages, live fetch · **Verdict:** listing parser is
sound; detail parser is silently corrupting one field and leaking entities. One structural fix retires most of it.

Sample: 40 notices stratified by mode × classification (Goods/SVP, Goods/Competitive Bidding, Civil Works both
modes, Consulting Services, Goods–General Support Services, Negotiated Procurement variants, Shopping, Direct
Acquisition, Direct Contracting, Competitive Dialogue, Unsolicited Offer, uppercase-mode rows), plus 30 chosen by
title for multi-lot/framework/"various" shapes (`Cluster 1`, `LOT 22:`, `Package 1`, `Framework Agreement`).

## Capture rate — and why the number lies

| field | non-null | actually correct | note |
|---|---|---|---|
| abc | 69/69 100% | 69/69 100% | verified against the label value on every page |
| control | 69/69 100% | 69/69 100% | |
| funding | 69/69 100% | 69/69 100% | |
| **location** | **69/69 100%** | **60/69 87%** | **9 pages store the literal string `Business Category:`** — D1 |
| category | 69/69 100% | 69/69 100% | |
| contact | 69/69 100% | 69/69 100% | |
| description | 69/69 100% | 69/69 raw | HTML entities not decoded — D2 |
| items | 69/69 100% | 69/69 raw | entities + header/trailer noise — D2, D7 |

**A 100% non-null rate was the bug hiding the bug.** `field()` returns the *next line* when a value is empty, so a
missing field silently becomes the next field's label. Nothing is ever null, so nothing looks wrong.

---

## D1 — `location` silently stores the next label. HIGH.

**13% of notices (9/69).** Region is a core search filter ("what's near me"), so this poisons the feature the
product exists for. Shows on `55465`, `54310`, `54185`, `54147`, `53246`, `51868`, `51866`, `51070`, `48293`.

```html
<label>Funding Source: </label></br>Regular Agency Fund (01000000)</br></br>
<label>Delivery/Project Location: </label></br></br></br>
<label>Business Category: </label></br>Roads and landscape</br></br>
```

Flattened, that's `['Delivery/Project Location:', 'Business Category:', 'Roads and landscape']` — so
`field(ls, "Delivery/Project Location")` takes `ls[i+1]` = `"Business Category:"`.

**Root cause is the mechanism, not the label.** Every field on this page is
`<label>Name: </label></br>value` — a real key/value structure. Parsing by flattened-line adjacency throws that
structure away and then guesses. Key off the `<label>` tags and the whole failure mode disappears, along with
`field()`, `lines()`, and the label-order assumptions. See the replacement below.

## D2 — HTML entities never decoded. HIGH for search quality.

`&nbsp;` is handled; nothing else is. Across the sample: `&ldquo;` 86, `&rdquo;` 83, `&ndash;` 69, `&rsquo;` 67,
**`&amp;` 24**, `&bull;` 18, `&#39;` 15, `&quot;` 13, `&ordm;` 10, `&mdash;` 4, `&deg;` 4, **`&Ntilde;` 2**.

Two of these are not cosmetic:
- **`&amp;`** — PH government titles are full of `Supply & Delivery`, `M&E`, `R&D`, `Goods & Services`. A grep or
  FTS5 query for `"supply & delivery"` misses every notice where it's stored as `supply &amp; delivery`.
- **`&Ntilde;` / `&ntilde;`** — `SANTO NIÑO`, `PEÑA`, `PARAÑAQUE`. Place and agency names, i.e. exactly the
  geographic filter terms. `PARA&Ntilde;AQUE` matches nothing a user would type.

Fix: `html.unescape()` in the text normalizer. **Titles are unaffected** — 0/4,300 listing titles contain
entities; this is a detail-page-body problem only.

## D3 — 12 zombie rows return HTTP 500 and will re-poison the enrich queue every night. HIGH.

The "open tenders" feed serves 12 notices **published June 2024** whose detail pages are dead:

```
2208, 2209, 2226, 2228, 2231, 2232, 2234, 2235, 2236, 2237, 2238, 2239  → all HTTP 500
```

`enrich()` selects `where enriched_at is null`, `get()` retries 3× and returns None, the row is skipped, and
`enriched_at` stays null — so all 12 are re-fetched with 3 retries each, forever, on every run.

**Cheap detector, perfect correlation in this sample:** these are exactly the 12 rows whose listing `closing` is
an empty string. Empty closing ⇒ dead detail page, 12/12. Tested all 70 rows with `id < 40000`: the other 58
return 200, so it's not an age problem — it's these 12 records.

Fix: record the attempt so a permanent failure stops requeueing.

```python
# schema
alter table tenders add column fetch_fails integer not null default 0;

# in enrich(), replace the select
todo = [r[0] for r in db.execute(
    "select id from tenders where enriched_at is null and fetch_fails < 3 "
    "and trim(coalesce(closing,'')) != '' order by id desc" + (f" limit {int(limit)}" if limit else ""))]

# and on a failed fetch, instead of `continue`
if not html:
    db.execute("update tenders set fetch_fails = fetch_fails + 1 where id = ?", (tid,))
    continue
```

## D4 — dates stored as `12-Aug-2026 03:00 PM` text, so every date filter is wrong. HIGH.

`select distinct closing from tenders order by closing` returns:

```
'', '01-Sep-2026 01:30 PM', '01-Sep-2026 02:00 PM', ... '01-Sep-2026 09:00 AM'
```

September before August, and `05:00 PM` before `08:00 AM`. "Closes in more than 7 days" — the filter that makes
this product useful given 60% of notices close within 6 days — cannot be expressed in SQL against this column.
`tenders_closing` is an index on an unusable ordering.

Fix: store an ISO column alongside the display string. `%d-%b-%Y %I:%M %p` parses both listing formats
(`publish` is date-only, `closing` carries the time). Times are Asia/Manila; store naive local or `+08:00`.

```python
def iso(s):
    """'12-Aug-2026 03:00 PM' -> '2026-08-12T15:00'; date-only -> '2026-08-12'. None if unparseable."""
    s = (s or "").strip()
    for fmt, out in (("%d-%b-%Y %I:%M %p", "%Y-%m-%dT%H:%M"), ("%d-%b-%Y", "%Y-%m-%d")):
        try: return datetime.strptime(s, fmt).strftime(out)
        except ValueError: pass
    return None
```

Add `publish_at` / `closing_at` columns, index `closing_at` instead. 12 rows get null `closing_at` (D3 zombies)
and 1 row (`54040`) has an empty `publish` — a search tool must not assume non-null.

## D5 — mode and classification arrive in mixed case. MEDIUM.

28 of 4,300 rows are shouted, so `group by mode` and `where mode = 'Small Value Procurement'` both split:

```
'Competitive Bidding (Public Bidding)' 2989   vs  'COMPETITIVE BIDDING (PUBLIC BIDDING)' 3
'Small Value Procurement'             1200   vs  'SMALL VALUE PROCUREMENT'             25
```

Fix: keep the raw string, add a normalized column the tools filter on — `title`-cased, or better a small enum
(`svp`, `competitive`, `negotiated`, `shopping`, `direct`, `other`) since Negotiated Procurement alone has 5
distinct display spellings.

## D6 — multi-lot: the label is `Multi Lot`, and the header ABC is the total. MEDIUM.

The value is **`Multi Lot`**, not `Multiple Lots` — anything grepping for the latter finds nothing. Rare but real:
2/69 (`53476`, `54278`).

**Answer to "one total or per-lot?": the header `Approved Budget of the Contract` is the TOTAL.** Per-lot figures
live in the item table, which grows a 7th column on multi-lot pages:

```
Item No. | UNSPSC | Lot Name | Lot Description | Quantity | Unit of Measure | ABC(Estimated Budget)
```

`54278` — header ABC `360,000.00`, six lots at `60,000.00` each, plus a `Total Approved Budget` trailer row.

**Store the total as `abc`** (it's the notice-level figure, consistent across all 4,300, and what the listing
implies). But also store `lot_type` and the per-lot range, because **for a bidder the entry ticket is the lot, not
the notice**: a contractor filtering ABC ≤ ₱100K should see `54278`'s ₱60K lots, and with only the ₱360K total
stored they never will. Single-lot pages have no ABC column, so downstream code must not assume 7 columns.

## D7 — `items` carries the header row and the total trailer. LOW.

Stored `items` begins `Item No.\nUNSPSC\nLot Name\nLot Description\nQuantity\nUnit of Measure` on every notice and
can end with `Total Approved Budget\n3,411,900.00`. Harmless for display, mild noise for keyword search (every
notice contains the literal "Lot Description"), and it means `items.count('\n')` is not a lot count. Leave it or
drop the six header lines — not worth a schema change.

## D8 — nothing detects amendments. MEDIUM-HIGH. Design, not parse.

`ingest()` pages until it meets a known id, so a notice is fetched once and never revisited. But deadline
extensions and revised documents are routine in PH procurement, and the detail page exposes
**`Date Last updated`** (e.g. `54278` → `05-Aug-2026 04:04 PM`) — a notice whose closing date moves keeps its id,
so today's snapshot silently goes stale. Worth capturing the field now even if re-checking waits: without it
stored there's no way to detect drift later.

Also available and currently unused: **`Number of Downloads`** (`54278` → 1). That's a competition signal — how
many bidders pulled the documents. Cheap to store, hard to get anywhere else, and nothing in the competitive
landscape surfaces it.

## Not a defect: duplicate titles

66 rows share a `(title, agency)` pair — `Office Supplies` ×6 from one senior high school, `Other Supplies and
Materials` ×6 from PNP-CIDG. These are **genuinely distinct notices** with distinct ids, control numbers, and
closing dates, not scrape duplicates. Do not dedupe on title. (Legacy-vs-mPhilGEPS cross-system dedupe, per
DECISIONS.md, is a separate unverified question — this sample says nothing about it.)

## Listing parser: clean

Pages 1, 20, 60, 100, 150, 200 — **20/20 rows parsed on all six**, every row had a `viewLiveTenderDetails` link,
every row had exactly 7 `data-label` cells, all `publish`/`closing` values matched `\d{2}-[A-Za-z]{3}-\d{4}`
(except the 12 empty closings of D3). No positional break found.

Two standing fragilities worth a comment rather than a change: the title cell's `data-label` is `"Control
Number"` (PhilGEPS mislabels it, so positional indexing is correct and label-based indexing would be wrong), and
`cells[1:7]` breaks silently if a column is ever inserted. Assert `len(cells) == 7` rather than `>= 7` so a
column change fails loudly instead of shifting every field by one.

---

## Exact replacement for the detail parser

Drop-in: delete `lines()`, `field()`, `between()` and the module-level `FIELDS`; replace with the below. Validated
against all 69 saved pages: **zero disagreements** with the current parser on every value it gets right, fixes
9/69 locations, decodes all entities, and adds 7 fields at no extra fetch cost.

```python
import html

LABEL = re.compile(r"<label>\s*([^<:]{2,60}?)\s*:\s*</label>((?:\s*</?br\s*/?>)*)\s*([^<]*)", re.I)

# every detail field is <label>Name: </label></br>value -- parse the structure, not line adjacency
FIELDS = {
    "abc": "Approved Budget of the Contract", "control": "Control Number",
    "funding": "Funding Source", "location": "Delivery/Project Location",
    "category": "Business Category", "contact": "Contact Person",
    "lot_type": "Lot Type", "client_agency": "Client Agency",
    "delivery_days": "Delivery Period", "status": "Status",
    "closing_detail": "Closing Date", "updated": "Date Last updated",
    "downloads": "Number of Downloads",
}


def clean(s):
    return re.sub(r"\s+", " ", html.unescape(s or "")).strip()


def labels(h):
    """All <label>Key:</label>value pairs on the page. Empty value stays empty -- never the next label."""
    out = {}
    for m in LABEL.finditer(h):
        out.setdefault(clean(m.group(1)), clean(m.group(3)))
    return out


def money(s):
    try:
        return float(clean(s).replace(",", "")) or None
    except ValueError:
        return None


def block(h, start, end):
    """Free-text region between two markers (description, line items) -- not label-structured."""
    t = re.sub(r"<(script|style)\b.*?</\1>", " ", h, flags=re.S | re.I)
    a = t.find(start)
    if a < 0:
        return None
    b = t.find(end, a)
    seg = re.sub(r"<[^>]+>", "\n", t[a + len(start): b if b > 0 else len(t)])
    return "\n".join(l for l in (clean(x) for x in seg.split("\n")) if l) or None


def parse_detail(h):
    L = labels(h)
    row = {k: (L.get(v) or None) for k, v in FIELDS.items()}
    row["abc"] = money(L.get("Approved Budget of the Contract"))
    row["description"] = block(h, "Description:", "Line Item Details")
    row["items"] = block(h, "Line Item Details", "BAC Members:")
    # per-lot ABCs: multi-lot pages add an ABC(Estimated Budget) item column.
    # The header ABC is the TOTAL -- for a bidder the entry ticket is the lot.
    lots = [money(x) for x in re.findall(r"^([\d,]+\.\d{2})$", row["items"] or "", re.M)]
    row["lot_abcs"] = sorted({x for x in lots if x})
    return row
```

New columns needed for the added fields: `lot_type`, `client_agency`, `delivery_days`, `status`,
`closing_detail`, `updated`, `downloads`, `lot_min` / `lot_max` (from `lot_abcs`), plus `fetch_fails` (D3) and
`publish_at` / `closing_at` (D4).

Add to `selfcheck()` — the empty-value case is the regression that matters:

```python
# D1: an empty field must be None, never the following label
empty_loc = ('<label>Funding Source: </label></br>Regular Agency Fund</br></br>'
             '<label>Delivery/Project Location: </label></br></br></br>'
             '<label>Business Category: </label></br>Roads and landscape</br></br>')
d = parse_detail(empty_loc)
assert d["location"] is None, d
assert d["category"] == "Roads and landscape", d
# D2: entities decoded
assert parse_detail('<p>Description:</p><p>Supply &amp; Delivery, PARA&Ntilde;AQUE</p><p>Line Item Details</p>'
                    )["description"] == "Supply & Delivery, PARAÑAQUE"
```

## What I did not check

- Whether `Documents` / `Bid Supplements` link to fetchable attachment files (present as labels on 69/69; the
  bid docs themselves are likely the richest scope text and are entirely unexplored).
- Legacy PhilGEPS 1.5 pages — different system, different HTML, still unverified per DECISIONS.md.
- `Schedule of activity` / `Venue` (34/69) — pre-bid conference dates, unparsed.
- Award/closed notices. Sample is open notices only.

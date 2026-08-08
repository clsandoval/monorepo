#!/usr/bin/env python3
"""Recon probe: are legacy PhilGEPS 1.5 bid documents reachable without a session?

Answers, per refID, using only unauthenticated GETs:
  * how many attached bid documents exist   (Associated Components count)
  * how many amendments exist               (Bid Supplements count)
  * how many rival bidders pulled the docs  (Document Request List count)
  * the title/type/published-date of every bid supplement
  * the document NAME / type / content-class / paper format of each supplement's
    attachment (which the site renders inside an HTML comment)

Three page templates, all plain GET, all 200 with no cookie:
  A  Tender/PrintableBidNoticeAbstractUI.aspx?refid={id}
  B  Tender/SplashBidSupplementsListUI.aspx?menuIndex=3&directFrom=BidAbstract&refID={id}
  C  Tender/SplashBidSupplementViewUI.aspx?menuIndex=3&refId={id}&bidSuppID={sid}&directFrom=BidAbstract

Page A is strictly better than the public splash abstract page for document
metadata: the splash page hides the Associated Components count behind a
disabled link and, when a notice HAS supplements, replaces the count span with a
postback link (which is why legacy.db's bid_supplements is NULL on exactly the
rows that have supplements). The printable page always renders plain numbers.

Run the selfcheck (no network):   python3 legacy_docs_probe.py --selfcheck
Run the probe:                    python3 legacy_docs_probe.py --ids 13130567 ...
"""
from __future__ import annotations

import argparse
import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

BASE = "https://notices.philgeps.gov.ph/GEPSNONPILOT/Tender/"
UA = "Mozilla/5.0 (X11; Linux x86_64) philgeps-research-recon/0.1"
MAX_WORKERS = 4  # stay well under the global budget of 6

# ---------------------------------------------------------------- URL builders

def url_printable(ref: int | str) -> str:
    return f"{BASE}PrintableBidNoticeAbstractUI.aspx?refid={ref}"


def url_supp_list(ref: int | str) -> str:
    return (f"{BASE}SplashBidSupplementsListUI.aspx"
            f"?menuIndex=3&directFrom=BidAbstract&refID={ref}")


def url_supp_view(ref: int | str, supp_id: str) -> str:
    return (f"{BASE}SplashBidSupplementViewUI.aspx?menuIndex=3&refId={ref}"
            f"&bidSuppID={urllib.parse.quote(supp_id)}&directFrom=BidAbstract")


# ------------------------------------------------------------------- fetching

ERROR_PAGE = "/GEPSNONPILOT/ErrorPage/ErrorPage.aspx"
LOGIN_PAGE = "/GEPSNONPILOT/log-in.aspx"


def classify_landing(final_url: str) -> str:
    """A 302 to ErrorPage is an app fault; a 302 to log-in.aspx is an auth gate.

    urllib follows both and reports 200, so the landing URL is the only way to
    tell "this page is broken" from "this page needs a supplier account" from
    "this page rendered".
    """
    if ERROR_PAGE.lower() in final_url.lower():
        return "errorpage"
    if LOGIN_PAGE.lower() in final_url.lower():
        return "login"
    return "ok"


def fetch(url: str, tries: int = 4) -> tuple[int, str]:
    """GET with no cookie jar. Backs off on 429/5xx.

    Returns (status, body), where status is the *effective* status: a redirect
    chain that lands on ErrorPage is reported as 302 with an empty body rather
    than as the 200 urllib would hand back.
    """
    delay = 2.0
    for attempt in range(tries):
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        try:
            with urllib.request.urlopen(req, timeout=90) as r:
                landing = classify_landing(r.geturl())
                if landing != "ok":
                    return 302, ""
                return r.getcode(), r.read().decode("utf-8", "replace")
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", "replace")
            if e.code in (429, 500, 502, 503, 504) and attempt < tries - 1:
                time.sleep(delay)
                delay *= 2
                continue
            return e.code, body
        except (urllib.error.URLError, TimeoutError):
            if attempt < tries - 1:
                time.sleep(delay)
                delay *= 2
                continue
            return 0, ""
    return 0, ""


# -------------------------------------------------------------------- parsing
# Rule inherited from the legacy detail parser: read labelled key/value by
# element id, NEVER by line adjacency.

def _span(page: str, span_id: str) -> str | None:
    m = re.search(r'<span[^>]*\bid="%s"[^>]*>(.*?)</span>' % re.escape(span_id),
                  page, re.S)
    if not m:
        return None
    return html.unescape(re.sub(r"<[^>]+>", "", m.group(1))).strip()


def _int_or_none(s: str | None) -> int | None:
    if s is None:
        return None
    s = s.replace(",", "").strip()
    return int(s) if re.fullmatch(r"\d+", s) else None


def parse_printable(page: str) -> dict:
    """Counts + identity from PrintableBidNoticeAbstractUI.

    assoc_components is the count of attached bid documents. It exists ONLY on
    this template; the public splash abstract page omits the number entirely.
    """
    return {
        "ref": _span(page, "lblDisplayReferenceNo"),
        "title": _span(page, "lblDisplayTitle"),
        "abc_raw": _span(page, "lblDisplayBudget"),
        "assoc_components": _int_or_none(_span(page, "lblDisplayAssocComp")),
        "bid_supplements": _int_or_none(_span(page, "lblDisplayBidSupplements")),
        "doc_req_list": _int_or_none(_span(page, "lblDisplayDocReqList")),
    }


_GRID_ROW = re.compile(r'<tr class="Grid(?:Item|AltItem)">(.*?)</tr>', re.S)
_CELL = re.compile(r"<td[^>]*>(.*?)</td>", re.S)


def _cells(row_html: str) -> list[str]:
    return [html.unescape(re.sub(r"<[^>]+>", "", c)).strip()
            for c in _CELL.findall(row_html)]


def parse_supp_list(page: str) -> list[dict]:
    """Rows of the dgDocs grid on SplashBidSupplementsListUI.

    Columns: Bid Supplement No. | Title | Type | Published.
    """
    m = re.search(r'<table[^>]*\bid="dgDocs"[^>]*>(.*?)</table>', page, re.S)
    if not m:
        return []
    out = []
    for row in _GRID_ROW.findall(m.group(1)):
        c = _cells(row)
        if len(c) < 4:
            continue
        out.append({"supp_id": c[0], "title": c[1], "type": c[2],
                    "published": c[3]})
    return out


def parse_supp_view(page: str) -> dict:
    """Supplement abstract + its attachment table.

    The attachment table (Document Name | Document Type | Content | Format) is
    emitted inside an HTML comment on the public page, so a browser never shows
    it but the bytes are served. Regex over the raw page finds it either way.
    """
    docs = []
    for m in re.finditer(r'<table[^>]*\bid="dgDocs"[^>]*>(.*?)</table>',
                         page, re.S):
        for row in _GRID_ROW.findall(m.group(1)):
            c = _cells(row)
            if len(c) < 4:
                continue
            docs.append({"doc_name": c[0], "doc_type": c[1],
                         "content": c[2], "format": c[3]})
    commented = "<!--" in page and re.search(
        r'<!--(?:(?!-->).)*id="dgDocs"', page, re.S) is not None
    return {
        "supp_id": _span(page, "lblDisplayBidSuppNo"),
        "supp_title": _span(page, "lblDisplayTitle2"),
        "supp_type": _span(page, "lblDisplayType"),
        "supp_desc": _span(page, "lblDisplayDesc"),
        "docs": docs,
        "docs_grid_was_commented_out": commented,
        "has_order_postback": 'id="lbtnOrder"' in page,
    }


# ---------------------------------------------------------------------- probe

def probe_one(ref: int) -> dict:
    rec: dict = {"refID": ref}
    st, page = fetch(url_printable(ref))
    rec["printable_status"] = st
    rec["printable_bytes"] = len(page)
    if st == 200:
        rec.update(parse_printable(page))

    n = rec.get("bid_supplements") or 0
    rec["supplements"] = []
    if n > 0:
        st2, p2 = fetch(url_supp_list(ref))
        rec["supp_list_status"] = st2
        rows = parse_supp_list(p2) if st2 == 200 else []
        rec["supp_list_rows"] = len(rows)
        for row in rows:
            st3, p3 = fetch(url_supp_view(ref, row["supp_id"]))
            view = parse_supp_view(p3) if st3 == 200 else {}
            view["view_status"] = st3
            view["list_row"] = row
            rec["supplements"].append(view)
            time.sleep(0.3)
    return rec


def main_probe(ids: list[int], out_path: str) -> None:
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        recs = list(ex.map(probe_one, ids))
    with open(out_path, "w") as f:
        json.dump(recs, f, indent=1)
    print(f"wrote {len(recs)} records -> {out_path}")


# ------------------------------------------------------------------ selfcheck

PRINTABLE_FIXTURE = """
<TR><TD><span id="Label26" class="DisplayText4">Associated Components</span></TD>
<TD><span id="lblDisplayAssocComp" class="DisplayText5">7</span></TD></TR>
<TR><TD><span id="Label24" class="DisplayText4">Bid Supplements</span></TD>
<TD><span id="lblDisplayBidSupplements" class="DisplayText5">2</span></TD></TR>
<TR><TD><span id="Label22" class="DisplayText4">Document Request List</span></TD>
<TD><span id="lblDisplayDocReqList" class="DisplayText5">5</span></TD></TR>
<span id="lblDisplayReferenceNo" class="DisplayText5">13130567</span>
<span id="lblDisplayTitle" class="DisplayText5">26A00135: Construction of New Bridges</span>
<span id="lblDisplayBudget" class="DisplayText5">PHP 800,463,640.00</span>
"""

# Same shape as the live page, including the empty label span that made the
# original ingest write NULL instead of a count.
SPLASH_SUPP_FIXTURE = """
<div id="panelLabel2">
</div><div id="panelNosOfSupplement">
<a id="lBtnNosOfSupplement" class="A" href="javascript:__doPostBack(&#39;lBtnNosOfSupplement&#39;,&#39;&#39;)">2</a>
</div>
"""

SUPP_LIST_FIXTURE = """
<table class="GridTable" id="dgDocs">
<tr class="GridHeader"><td class="GridHeader">Bid Supplement No.</td>
<td class="GridHeader">Title</td><td class="GridHeader">Type</td>
<td class="GridHeader">Published</td></tr>
<tr class="GridItem"><td class="GridItemTD">13130567-01</td>
<td class="GridItemTD"><a href="javascript:__doPostBack(&#39;dgDocs$ctl02$ctl00&#39;,&#39;&#39;)">Notice No. 11 series of 2026</a></td>
<td class="GridItemTD">Addendum</td><td class="GridItemTD">22/07/2026</td></tr>
<tr class="GridAltItem"><td class="GridItemTD">13130567-02</td>
<td class="GridItemTD"><a href="javascript:__doPostBack(&#39;dgDocs$ctl03$ctl00&#39;,&#39;&#39;)">Supplemental No. 110 Series of 2026</a></td>
<td class="GridItemTD">Addendum</td><td class="GridItemTD">31/07/2026</td></tr>
</table>
"""

SUPP_VIEW_FIXTURE = """
<span id="lblDisplayBidSuppNo" class="DisplayText5">13130567-01</span>
<span id="lblDisplayTitle2" class="DisplayText5">Notice No. 11 series of 2026</span>
<span id="lblDisplayType" class="DisplayText5">Addendum</span>
<span id="lblDisplayDesc" class="DisplayText5">Reschedule of Pre-Bid Conference</span>
<a id="lbtnOrder" class="A" href="javascript:__doPostBack(&#39;lbtnOrder&#39;,&#39;&#39;)">Order</a>
<!-- <TR><TD>
<table cellspacing="0" rules="all" border="1" id="dgDocs" style="width:100%">
<tr class="GridHeader"><td>Document Name</td><td>Document Type</td><td>Content</td><td>Format</td></tr>
<tr class="GridItem"><td><a href="javascript:__doPostBack(&#39;dgDocs$ctl02$ctl01&#39;,&#39;&#39;)">Notice No. 11, series of 2026</a></td>
<td>Electronic</td><td>Bid Supplements / Chronicles</td><td>A4</td></tr>
</table></TD></TR>-->
"""


def selfcheck() -> None:
    p = parse_printable(PRINTABLE_FIXTURE)
    assert p["assoc_components"] == 7, p
    assert p["bid_supplements"] == 2, p
    assert p["doc_req_list"] == 5, p
    assert p["ref"] == "13130567", p
    assert p["abc_raw"] == "PHP 800,463,640.00", p
    assert p["title"].startswith("26A00135:"), p

    # A page with no Associated Components row must yield None, not 0 --
    # "unknown" and "zero documents" are different facts.
    assert parse_printable("<html></html>")["assoc_components"] is None

    # The splash-page shape that produced the NULL bug: lblDisplayBidSupplements
    # is absent, so an id-based read returns None while the real count (2) sits
    # in the postback link text. This is why the printable page is the source.
    assert _span(SPLASH_SUPP_FIXTURE, "lblDisplayBidSupplements") is None
    m = re.search(r'id="lBtnNosOfSupplement"[^>]*>(\d+)</a>', SPLASH_SUPP_FIXTURE)
    assert m and m.group(1) == "2"

    rows = parse_supp_list(SUPP_LIST_FIXTURE)
    assert len(rows) == 2, rows
    assert rows[0] == {"supp_id": "13130567-01",
                       "title": "Notice No. 11 series of 2026",
                       "type": "Addendum", "published": "22/07/2026"}, rows[0]
    assert rows[1]["supp_id"] == "13130567-02", rows[1]
    # The GridHeader row must never be mistaken for data.
    assert all(r["supp_id"] != "Bid Supplement No." for r in rows)
    assert parse_supp_list("<html>no grid</html>") == []

    v = parse_supp_view(SUPP_VIEW_FIXTURE)
    assert v["supp_id"] == "13130567-01", v
    assert v["supp_type"] == "Addendum", v
    assert v["supp_desc"] == "Reschedule of Pre-Bid Conference", v
    assert v["has_order_postback"] is True, v
    assert v["docs_grid_was_commented_out"] is True, v
    assert len(v["docs"]) == 1, v
    assert v["docs"][0] == {"doc_name": "Notice No. 11, series of 2026",
                            "doc_type": "Electronic",
                            "content": "Bid Supplements / Chronicles",
                            "format": "A4"}, v["docs"][0]

    # Landing classification: the two 302 targets mean different things and must
    # never be collapsed into each other or into a plain 200.
    assert classify_landing(
        "https://notices.philgeps.gov.ph/GEPSNONPILOT/ErrorPage/ErrorPage.aspx"
    ) == "errorpage"
    assert classify_landing(
        "https://notices.philgeps.gov.ph/GEPSNONPILOT/log-in.aspx"
    ) == "login"
    assert classify_landing(
        "https://notices.philgeps.gov.ph/GEPSNONPILOT/Tender/"
        "SplashBidSupplementViewUI.aspx?refId=13130567&bidSuppID=13130567-01"
    ) == "ok"

    print("selfcheck OK: 24 assertions over 4 fixtures")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--selfcheck", action="store_true")
    ap.add_argument("--ids", nargs="*", type=int)
    ap.add_argument("--ids-file")
    ap.add_argument("--out", default="legacy_docs_probe.json")
    a = ap.parse_args()
    if a.selfcheck:
        selfcheck()
        sys.exit(0)
    ids = list(a.ids or [])
    if a.ids_file:
        ids += [r["id"] for r in json.load(open(a.ids_file))]
    if not ids:
        ap.error("need --ids or --ids-file")
    main_probe(ids, a.out)

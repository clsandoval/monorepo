#!/usr/bin/env python3
"""RECON: mPhilGEPS attached bid documents — what is reachable without a login.

Fetches, for a list of notice ids:
  detail   https://philgeps.gov.ph/Indexes/viewLiveTenderDetails/{id}/OPEN_MORE
  docview  https://philgeps.gov.ph/Tenders/tender_doc_view/{id}/{id}     (facebox partial)
  corr     https://philgeps.gov.ph/Indexes/tender_corr_details/{id}      (bid supplements)

and classifies each response as PUBLIC / SESSION_GATED / LOGIN_REDIRECT, then extracts any
document filenames it can see.

Politeness: ThreadPool of <=6, retry with sleep on 429/5xx. Writes JSONL to docs_recon.jsonl.
Selfcheck for the parsers:  python3 recon_docs.py selfcheck
"""
import json, os, re, sys, time, random, urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

BASE = "https://philgeps.gov.ph"
DETAIL = BASE + "/Indexes/viewLiveTenderDetails/{}/OPEN_MORE"
DOCVIEW = BASE + "/Tenders/tender_doc_view/{0}/{0}"
CORR = BASE + "/Indexes/tender_corr_details/{}"
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/126.0 Safari/537.36")
MAXCONC = 6
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "docs_recon.jsonl")

# ---------------------------------------------------------------- fetch


def get(url, tries=3, referer=None, raw=False):
    """-> dict(status, url, final_url, body, headers). Never raises on HTTP error."""
    for attempt in range(tries):
        req = urllib.request.Request(url, headers={
            "User-Agent": UA,
            "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
            "X-Requested-With": "XMLHttpRequest",
            **({"Referer": referer} if referer else {}),
        })
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                data = r.read()
                return {"status": r.status, "url": url, "final_url": r.geturl(),
                        "headers": dict(r.headers),
                        "body": data if raw else data.decode("utf-8", "replace")}
        except urllib.error.HTTPError as e:
            data = e.read()
            if e.code in (429, 500, 502, 503, 504) and attempt < tries - 1:
                time.sleep(5 * (attempt + 1) + random.random())
                continue
            return {"status": e.code, "url": url, "final_url": e.geturl(),
                    "headers": dict(e.headers),
                    "body": data if raw else data.decode("utf-8", "replace")}
        except Exception as e:                                  # noqa: BLE001
            if attempt < tries - 1:
                time.sleep(3 * (attempt + 1))
                continue
            return {"status": -1, "url": url, "final_url": url, "headers": {},
                    "body": b"" if raw else f"ERR {type(e).__name__}: {e}"}


# ---------------------------------------------------------------- parsers

SESSION_MARKERS = (
    "Your session has been expired",
    "please login in again to continue",
    "User Session Expiring",
)
# a real logged-out public page still shows the marketing nav ("Merchant Registration")
PUBLIC_MARKER = "Merchant Registration"

DOC_EXT = r"pdf|docx?|xlsx?|pptx?|zip|rar|7z|jpe?g|png|gif|tiff?|dwg|txt|csv|rtf"


def classify(resp):
    """PUBLIC | SESSION_GATED | LOGIN_REDIRECT | HTTP_<code> — the auth verdict for a response."""
    b = resp["body"] if isinstance(resp["body"], str) else ""
    if resp["status"] != 200:
        return "HTTP_%s" % resp["status"]
    if re.search(r"/Indexes/login", resp["final_url"]):
        return "LOGIN_REDIRECT"
    if any(m in b for m in SESSION_MARKERS) and PUBLIC_MARKER not in b:
        return "SESSION_GATED"
    return "PUBLIC"


def parse_detail(html):
    """Pull the document-section handles off a live-tender detail page.

    Labelled key/value only — never line adjacency (adjacency returns the next label when a
    value is empty; that bug corrupted `location` on 13% of notices in the ingest pass).
    """
    out = {"doc_preview": None, "supplements_count": None, "supplements_url": None,
           "downloads": None, "doc_links": [], "has_documents_label": False,
           "has_supplements_label": False}
    if "<label>Documents:</label>" in html or re.search(r"<label>\s*Documents\s*:\s*</label>", html):
        out["has_documents_label"] = True
    if re.search(r"<label>\s*Bid Supplements\s*:\s*</label>", html):
        out["has_supplements_label"] = True

    m = re.search(r"href_path=\"(/Tenders/tender_doc_view/[^\"]+)\"", html)
    if m:
        out["doc_preview"] = m.group(1)
    m = re.search(r"<label>\s*Bid Supplements\s*:\s*</label>\s*&nbsp;\s*"
                  r"<a[^>]*href=\"([^\"]+)\"[^>]*>\s*([0-9]+)\s*</a>", html, re.S)
    if m:
        out["supplements_url"], out["supplements_count"] = m.group(1), int(m.group(2))
    m = re.search(r"<label>\s*Number of Downloads\s*:\s*</label>\s*&nbsp;\s*([0-9,]+)", html)
    if m:
        out["downloads"] = int(m.group(1).replace(",", ""))
    # any direct file link anywhere on the page
    out["doc_links"] = sorted(set(
        re.findall(r"href=\"([^\"]+\.(?:%s))\"" % DOC_EXT, html, re.I)))
    return out


def parse_filenames(html):
    """Filenames/titles visible in a document listing partial (works gated or not)."""
    names = set()
    for m in re.finditer(r">([^<>]{3,160}\.(?:%s))<" % DOC_EXT, html, re.I):
        names.add(m.group(1).strip())
    for m in re.finditer(r"(?:file|doc|attach)[a-z_]*=\"?([^\"'&<>]{3,160}\.(?:%s))" % DOC_EXT,
                         html, re.I):
        names.add(m.group(1).strip())
    return sorted(names)


def parse_corr(html):
    """Labelled key/value out of the Bid Notice Supplement Details partial."""
    txt = re.sub(r"(?s)<script.*?</script>|<style.*?</style>", " ", html)
    cells = [re.sub(r"\s+", " ", re.sub(r"(?s)<[^>]+>", " ", c)).strip()
             for c in re.findall(r"(?s)<td[^>]*>(.*?)</td>", txt)]
    kv, i = {}, 0
    while i < len(cells) - 1:
        k = cells[i].rstrip(":").strip()
        if k and k.endswith(tuple("dateTimeequiredgs")) or ":" in cells[i]:
            pass
        if cells[i].endswith(":") and cells[i + 1]:
            kv[cells[i][:-1].strip()] = cells[i + 1]
            i += 2
            continue
        i += 1
    return kv


# ---------------------------------------------------------------- driver

def probe(nid):
    rec = {"id": nid}
    d = get(DETAIL.format(nid))
    rec["detail_status"] = d["status"]
    rec["detail_verdict"] = classify(d)
    rec.update(parse_detail(d["body"]) if isinstance(d["body"], str) else {})
    ref = d["final_url"]

    dv = get((BASE + rec["doc_preview"]) if rec.get("doc_preview") else DOCVIEW.format(nid),
             referer=ref)
    rec["docview_url"] = dv["url"]
    rec["docview_status"] = dv["status"]
    rec["docview_verdict"] = classify(dv)
    rec["docview_len"] = len(dv["body"])
    rec["docview_filenames"] = parse_filenames(dv["body"])

    cu = (BASE + rec["supplements_url"]) if rec.get("supplements_url") else CORR.format(nid)
    cr = get(cu, referer=ref)
    rec["corr_url"] = cu
    rec["corr_status"] = cr["status"]
    rec["corr_verdict"] = classify(cr)
    rec["corr_fields"] = parse_corr(cr["body"])
    rec["corr_filenames"] = parse_filenames(cr["body"])
    return rec


def main(ids):
    with ThreadPoolExecutor(MAXCONC) as ex, open(OUT, "w") as fh:
        for rec in ex.map(probe, ids):
            fh.write(json.dumps(rec) + "\n")
            fh.flush()
            print(rec["id"], rec["detail_verdict"], rec["docview_verdict"],
                  rec["corr_verdict"], "sup=%s" % rec.get("supplements_count"),
                  "dl=%s" % rec.get("downloads"), rec["docview_filenames"][:2], flush=True)


# ---------------------------------------------------------------- selfcheck

def selfcheck():
    html = """
    <label>Documents:</label>&nbsp;
    <a class="link" rel="facebox" href_path="/Tenders/tender_doc_view/55594/55594">Preview</a><br>
    <label>Bid Form Fee: </label>&nbsp; 0&nbsp;
    <label>Bid Supplements: </label>&nbsp;  <a rel="facebox" href="/Indexes/tender_corr_details/55594">
    3         </a></br>
    <label>Number of Downloads:</label>&nbsp; 1,204
    <a href="/DOCUMENTS/TENDER/tor-final.pdf">tor</a>
    """
    p = parse_detail(html)
    assert p["doc_preview"] == "/Tenders/tender_doc_view/55594/55594", p
    assert p["supplements_count"] == 3, p
    assert p["supplements_url"] == "/Indexes/tender_corr_details/55594", p
    assert p["downloads"] == 1204, p
    assert p["doc_links"] == ["/DOCUMENTS/TENDER/tor-final.pdf"], p
    assert p["has_documents_label"] and p["has_supplements_label"], p

    # empty value must NOT absorb the next label (the adjacency trap)
    html2 = "<label>Number of Downloads:</label>&nbsp; <label>Next:</label>"
    assert parse_detail(html2)["downloads"] is None, parse_detail(html2)
    # a notice with no supplements anchor
    assert parse_detail("<label>Bid Supplements: </label>&nbsp;")["supplements_count"] is None

    assert parse_filenames("<td>Terms of Reference.pdf</td><td>BOQ.XLSX</td>") == \
        ["BOQ.XLSX", "Terms of Reference.pdf"], parse_filenames(
            "<td>Terms of Reference.pdf</td><td>BOQ.XLSX</td>")
    assert parse_filenames("<td>no files here</td>") == []

    gated = {"status": 200, "final_url": "x",
             "body": "Your session has been expired, please login in again to continue."}
    assert classify(gated) == "SESSION_GATED"
    pub = {"status": 200, "final_url": "x", "body": "Merchant Registration ... Documents:"}
    assert classify(pub) == "PUBLIC"
    red = {"status": 200, "final_url": BASE + "/Indexes/login", "body": ""}
    assert classify(red) == "LOGIN_REDIRECT"
    assert classify({"status": 403, "final_url": "x", "body": ""}) == "HTTP_403"

    c = parse_corr("<td>Pre-Bid Meeting :</td><td> Not Required </td>"
                   "<td>Bid Opening Start Date and Time :</td><td>12-Aug-2026 03:00 PM</td>")
    assert c["Pre-Bid Meeting"] == "Not Required", c
    assert c["Bid Opening Start Date and Time"] == "12-Aug-2026 03:00 PM", c
    print("selfcheck OK")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "selfcheck":
        selfcheck()
    else:
        arg = sys.argv[1] if len(sys.argv) > 1 else "/tmp/rfpdocs/ids.json"
        ids = json.load(open(arg)) if arg.endswith(".json") else [int(x) for x in sys.argv[1:]]
        main(ids)

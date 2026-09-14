#!/usr/bin/env python3
"""Census of mPhilGEPS attached bid documents: per-notice counts, formats, byte sizes.

Two passes, both unauthenticated:
  1. LIST   GET /Tenders/tender_doc_view/{id}/{id}   with X-Requested-With: XMLHttpRequest
            -> the facebox partial listing every document (incl. supplement bulletins),
               each as an absolute https://philgeps.gov.ph/portal_documents/... URL.
            WITHOUT the XHR header the app serves the full authenticated layout shell with an
            empty body and a "session has been expired" modal -- 200, zero documents. That
            header, not a cookie, is the whole gate.
  2. SIZE   HEAD each document URL -> Content-Length + Content-Type. No body downloaded.

Politeness: ThreadPool of <=6, backoff sleep on 429/5xx.

  python3 docs_census.py selfcheck            # assert-based parser check, no network
  python3 docs_census.py list  <n> [seed]     # pass 1 over n random tenders.db ids
  python3 docs_census.py sizes                # pass 2 (HEAD) over everything pass 1 found
  python3 docs_census.py report               # stats out of the two jsonl files

================================================================================
MEASURED 2026-08-08 pm. Everything below is a count, not an estimate.

THE FILES ARE PUBLIC. 963/963 documents HEADed -> HTTP 200 + Content-Length, no cookie ever
sent. 5 files downloaded and magic-byte verified (%PDF / PK.. / JFIF). There is no login wall
on bid documents; DECISIONS.md open question 7 is answered yes.

THE ONLY GATE IS A REQUEST HEADER, NOT AUTH. Without `X-Requested-With: XMLHttpRequest` the
doc_view route returns a constant 21,484-byte authenticated-layout shell -- identical bytes for
every notice id, zero document rows, containing "Your session has been expired, please login in
again to continue." That message is CakePHP layout boilerplate and reads as an auth wall; it is
not one. With the header: 1.2-4.7 KB partial, full document list. Measured on ids 55594 / 45795
/ 54278 / 53407 / 52817 -- bare byte count was 21484 on all five.

  documents/notice  n=1200 notices, all HTTP 200
      min 0 | median 2 | mean 2.30 | p90 4 | max 21 ;  zero-document: 2/1200 = 0.17%
  formats           n=2762 files, by filename extension
      pdf 95.5% | docx 3.0% | zip 0.9% | xlsx 0.4% | jpg 0.25% | no rar, no doc/xls
  sizes             n=963 files HEADed
      median 0.85 MB | mean 1.97 MB | p95 8.48 MB | p99 18.76 MB | max 43.82 MB
  per notice        4.74 MB mean -> 20.3 GB projected over 4,288 notices
      95% bootstrap CI 17.0-24.2 GB. Heavy tail: p99/median = 22x.
  supplements       317/1198 notices (26.5%) carry >=1 file uploaded after original posting,
      recognisable by a `<unixts>_<8 hex>_` filename prefix (bid bulletins, pre-bid minutes,
      revised plans). 688 of 2762 files (24.9%).

FILENAMES ARE THE CHEAP WIN. 71.8% of notices have >=1 filename naming a known procurement
artefact (PBD 16.8% of files, ITB/invitation 8.7%, plans/drawings 8.1%, RFQ 6.8%, BOQ/POW 3.3%,
TOR 1.3%, bulletin/supplemental 12.0%). Names carry an upload-timestamp prefix to strip; see
human_name(). Listing all filenames costs ONE 1.5 KB request per notice and no OCR.

THE REAL BLOCKER IS OCR, NOT ACCESS. Two independent samples: 38% (9/24 files) and 46% (28/61
files) of PDFs yield ZERO extractable characters -- they are scanned images. At notice level
(n=30, all files downloaded): only 63% have >=1 text-extractable file; 37% need OCR to read
anything at all. Volume is the other half of the problem: median 10 pages/notice but mean 79
and max 448 (a 108-page PBD is routine), so ~1.5K tokens for the median notice and ~34K for the
mean. Whole-attachment-in-prompt does not scale; extract the sections that matter.

Directory listing and unknown filenames both 403 (not 404), so documents cannot be enumerated by
walking /portal_documents/ -- the per-notice doc_view listing is the only index. The entire
philgeps.gov.ph app also serves `<meta name="robots" content="noindex, nofollow">`, which
independently confirms the SEO wedge in DECISIONS.md: Google cannot index the source at all.

No 429 and no 5xx across ~2,600 requests at concurrency 6.
================================================================================
"""
import json, os, re, sqlite3, statistics, sys, time, random
import urllib.request, urllib.error
from collections import Counter
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = "https://philgeps.gov.ph"
DOCVIEW = BASE + "/Tenders/tender_doc_view/{0}/{0}"
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/126.0 Safari/537.36")
MAXCONC = 6
LIST_OUT = os.path.join(HERE, "docs_list.jsonl")
SIZE_OUT = os.path.join(HERE, "docs_sizes.jsonl")
DB = os.path.join(HERE, "tenders.db")

# ------------------------------------------------------------------ http


def _req(url, method="GET"):
    return urllib.request.Request(url, method=method, headers={
        "User-Agent": UA,
        "Accept": "text/html,*/*;q=0.8",
        "X-Requested-With": "XMLHttpRequest",
    })


def fetch(url, method="GET", tries=3):
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(_req(url, method), timeout=90) as r:
                body = r.read().decode("utf-8", "replace") if method == "GET" else ""
                return {"status": r.status, "body": body, "headers": dict(r.headers),
                        "final_url": r.geturl()}
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504) and attempt < tries - 1:
                time.sleep(5 * (attempt + 1) + random.random())
                continue
            return {"status": e.code, "body": "", "headers": dict(e.headers),
                    "final_url": e.geturl()}
        except Exception as e:                                       # noqa: BLE001
            if attempt < tries - 1:
                time.sleep(3 * (attempt + 1))
                continue
            return {"status": -1, "body": "ERR %s: %s" % (type(e).__name__, e),
                    "headers": {}, "final_url": url}


# --------------------------------------------------------------- parsers

DOCROW = re.compile(
    r"<tr>\s*<td>\s*(\d+)\s*</td>\s*"
    r"<td>\s*<a[^>]*href=\"([^\"]+)\"[^>]*>(.*?)</a>\s*</td>\s*"
    r"<td>\s*([^<]*?)\s*</td>", re.S)
GATE = "session has been expired"


def norm_url(u):
    """//portal_documents -> /portal_documents (corr_details emits the double slash)."""
    return re.sub(r"(?<!:)//+", "/", u)


def parse_docview(html):
    """-> (list[dict(seq,url,name,date)], gated: bool). Labelled table rows, not adjacency."""
    gated = GATE in html
    docs = []
    for seq, url, name, date in DOCROW.findall(html):
        name = re.sub(r"\s+", " ", re.sub(r"(?s)<[^>]+>", "", name)).strip()
        docs.append({"seq": int(seq), "url": norm_url(url.strip()), "name": name,
                     "date": date.strip()})
    return docs, gated


def ext_of(name_or_url):
    m = re.search(r"\.([A-Za-z0-9]{1,5})(?:$|\?)", name_or_url)
    return m.group(1).lower() if m else ""


HUMAN = re.compile(r"^\d{9,12}_(?:[0-9a-f]{8}_)?(.*)$")


def human_name(fname):
    """Strip the upload unix-timestamp prefix (and a supplement hash, when present)."""
    m = HUMAN.match(fname)
    core = m.group(1) if m else fname
    return re.sub(r"_+", " ", core).strip()


# ---------------------------------------------------------------- passes

def pass_list(n, seed=11):
    con = sqlite3.connect("file:%s?mode=ro" % DB, uri=True)
    ids = [r[0] for r in con.execute("select id from tenders")]
    random.Random(seed).shuffle(ids)
    ids = ids[:n]

    def one(i):
        r = fetch(DOCVIEW.format(i))
        docs, gated = parse_docview(r["body"])
        return {"id": i, "status": r["status"], "gated_shell": gated, "n_docs": len(docs),
                "docs": docs}

    with ThreadPoolExecutor(MAXCONC) as ex, open(LIST_OUT, "w") as fh:
        for k, rec in enumerate(ex.map(one, ids), 1):
            fh.write(json.dumps(rec) + "\n")
            if k % 25 == 0:
                fh.flush()
                print("  %d/%d" % (k, len(ids)), flush=True)
    print("wrote", LIST_OUT)


def pass_sizes():
    seen, jobs = set(), []
    for line in open(LIST_OUT):
        rec = json.loads(line)
        for d in rec["docs"]:
            if d["url"] not in seen:
                seen.add(d["url"])
                jobs.append((rec["id"], d["url"], d["name"]))

    def one(job):
        nid, url, name = job
        r = fetch(url, method="HEAD")
        cl = r["headers"].get("Content-Length")
        return {"id": nid, "url": url, "name": name, "status": r["status"],
                "bytes": int(cl) if cl and cl.isdigit() else None,
                "ctype": r["headers"].get("Content-Type"),
                "ext": ext_of(name) or ext_of(url)}

    with ThreadPoolExecutor(MAXCONC) as ex, open(SIZE_OUT, "w") as fh:
        for k, rec in enumerate(ex.map(one, jobs), 1):
            fh.write(json.dumps(rec) + "\n")
            if k % 100 == 0:
                fh.flush()
                print("  %d/%d" % (k, len(jobs)), flush=True)
    print("wrote", SIZE_OUT, len(jobs), "urls")


# ---------------------------------------------------------------- report

CORPUS = 4288  # enriched mPhilGEPS notices per docs/plans/2026-08-08-ph-rfp-search-design.md


def pct(xs, p):
    xs = sorted(xs)
    if not xs:
        return None
    k = (len(xs) - 1) * p / 100
    lo, hi = int(k), min(int(k) + 1, len(xs) - 1)
    return xs[lo] + (xs[hi] - xs[lo]) * (k - lo)


def report():
    lst = [json.loads(l) for l in open(LIST_OUT)]
    ok = [r for r in lst if r["status"] == 200]
    counts = [r["n_docs"] for r in ok]
    zero = sum(1 for c in counts if c == 0)
    print("== pass 1: notices sampled %d (HTTP 200: %d, gated shell: %d)"
          % (len(lst), len(ok), sum(r["gated_shell"] for r in lst)))
    print("   docs/notice  min %d  median %.1f  mean %.2f  p90 %s  max %d"
          % (min(counts), statistics.median(counts), statistics.mean(counts),
             pct(counts, 90), max(counts)))
    print("   zero-document notices: %d/%d = %.1f%%" % (zero, len(ok), 100 * zero / len(ok)))
    print("   count histogram:", dict(sorted(Counter(counts).items())))

    if not os.path.exists(SIZE_OUT):
        return
    sz = [json.loads(l) for l in open(SIZE_OUT)]
    good = [r for r in sz if r["status"] == 200 and r["bytes"]]
    print("\n== pass 2: %d unique document URLs HEADed; %d returned 200 + Content-Length"
          % (len(sz), len(good)))
    print("   HTTP status histogram:", dict(Counter(r["status"] for r in sz)))
    b = [r["bytes"] for r in good]
    for label, v in [("min", min(b)), ("median", statistics.median(b)),
                     ("mean", statistics.mean(b)), ("p90", pct(b, 90)),
                     ("p95", pct(b, 95)), ("p99", pct(b, 99)), ("max", max(b))]:
        print("   size %-7s %10.0f B  = %8.2f MB" % (label, v, v / 1e6))
    exts = Counter(r["ext"] for r in good)
    print("\n   format share (by file count, n=%d):" % len(good))
    for e, c in exts.most_common():
        print("     %-6s %5d  %5.1f%%" % (e, c, 100 * c / len(good)))
    by_ext_bytes = Counter()
    for r in good:
        by_ext_bytes[r["ext"]] += r["bytes"]
    tot = sum(by_ext_bytes.values())
    print("\n   format share (by bytes):")
    for e, c in by_ext_bytes.most_common():
        print("     %-6s %8.1f MB  %5.1f%%" % (e, c / 1e6, 100 * c / tot))

    # Projection. Restrict to notices actually HEADed -- docs_list.jsonl may be a WIDER sample
    # than docs_sizes.jsonl (list pass reruns with more ids; size pass is the seed-11 prefix).
    # Including un-HEADed notices as 0 bytes would silently deflate the mean.
    sized_ids = {r["id"] for r in sz}
    per_notice = {r["id"]: 0 for r in ok if r["id"] in sized_ids}
    for r in good:
        if r["id"] in per_notice:
            per_notice[r["id"]] += r["bytes"]
    vals = list(per_notice.values())
    mean_notice = statistics.mean(vals)
    print("\n== projection over %d mPhilGEPS notices (basis: %d notices fully HEADed)"
          % (CORPUS, len(vals)))
    print("   bytes/notice: median %.2f MB  mean %.2f MB  p95 %.2f MB  max %.2f MB"
          % (statistics.median(vals) / 1e6, mean_notice / 1e6,
             pct(vals, 95) / 1e6, max(vals) / 1e6))
    print("   projected total: %.1f GB  (mean x %d)" % (mean_notice * CORPUS / 1e9, CORPUS))
    # bootstrap the sample mean -- the size distribution is heavy-tailed (p99/median = 22x),
    # so a point estimate off 400 notices needs an interval attached to it.
    rng = random.Random(3)
    boots = sorted(statistics.mean(rng.choices(vals, k=len(vals))) for _ in range(2000))
    print("   95%% bootstrap CI on the total: %.1f - %.1f GB"
          % (boots[50] * CORPUS / 1e9, boots[1949] * CORPUS / 1e9))


# ------------------------------------------------------------- selfcheck

def selfcheck():
    partial = """
    <h4 class="modal-title">Bid Notice Documents </h4>
    <tr><td colspan="3"><b>Notice Reference Number: </b>55594</td></tr>
    <tr><th>Sr.No.</th><th>Document Name</th><th>Date</th></tr>
    <tr>
      <td>1</td>
      <td><a target="_blank" href="https://philgeps.gov.ph/portal_documents/bid_notice_documents/bid_notice_55594/bid_notice_document/1786202844_RFQ_SMEDD_PR_07_141.pdf">1786202844_RFQ_SMEDD_PR_07_141.pdf</a></td>
      <td>08-Aug-2026 11:27 PM</td>
    </tr>
    <tr>
      <td>2</td>
      <td><a target="_blank" href="https://philgeps.gov.ph//portal_documents/bid_notice_documents/bid_notice_45795/bid_notice_document//1783939786_ITB_26GB0293_0330___Rebid.PDF">1783939786_ITB_26GB0293_0330___Rebid.PDF</a></td>
      <td>14-Jul-2026 09:03 AM</td>
    </tr>
    """
    docs, gated = parse_docview(partial)
    assert not gated
    assert len(docs) == 2, docs
    assert docs[0]["seq"] == 1 and docs[0]["name"] == "1786202844_RFQ_SMEDD_PR_07_141.pdf"
    assert docs[0]["date"] == "08-Aug-2026 11:27 PM", docs[0]
    # double slashes collapsed, scheme survives
    assert docs[1]["url"] == ("https://philgeps.gov.ph/portal_documents/bid_notice_documents/"
                             "bid_notice_45795/bid_notice_document/"
                             "1783939786_ITB_26GB0293_0330___Rebid.PDF"), docs[1]["url"]
    assert docs[1]["url"].startswith("https://"), docs[1]["url"]

    # a notice with no attachments: header row only, zero data rows
    empty = ("<tr><td colspan=\"3\"><b>Notice Reference Number: </b>1</td></tr>"
             "<tr><th>Sr.No.</th><th>Document Name</th><th>Date</th></tr>")
    assert parse_docview(empty) == ([], False), parse_docview(empty)

    # the no-XHR shell: 200, no rows, gate marker set -> must never be read as "zero documents"
    shell = "<div>Your session has been expired, please login in again to continue.</div>"
    d, g = parse_docview(shell)
    assert d == [] and g is True

    assert ext_of("a/b/1783939786_ITB.PDF") == "pdf"
    assert ext_of("x_POW_EMONG_08_04_2026.xlsx") == "xlsx"
    assert ext_of("noextension") == ""
    assert human_name("1786202844_RFQ_SMEDD_PR_07_141.pdf") == "RFQ SMEDD PR 07 141.pdf"
    assert human_name("1785398103_c0c327b6_10_SUPPLEMENTAL_PBD.pdf") == "10 SUPPLEMENTAL PBD.pdf"
    assert human_name("plain.pdf") == "plain.pdf"

    assert pct([1, 2, 3, 4], 50) == 2.5
    assert pct([10], 95) == 10
    print("selfcheck OK")


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "selfcheck"
    if cmd == "selfcheck":
        selfcheck()
    elif cmd == "list":
        pass_list(int(sys.argv[2]), int(sys.argv[3]) if len(sys.argv) > 3 else 11)
    elif cmd == "sizes":
        pass_sizes()
    elif cmd == "report":
        report()
    else:
        sys.exit(__doc__)

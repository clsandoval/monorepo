#!/usr/bin/env python3
"""Live single-notice fetch for the M4 Enrich pipeline.

    python3 enrich_fetch.py <id>
    -> stdout JSON: {source, page: {abc, prebid, closing, title, ...labeled fields},
                     description, docs: [{name, text, status, pages}]}

Looks up the id's source in corpus.db (read-only), fetches the LIVE public notice page
(legacy abstract page or mPhilGEPS live-tender detail), and for mPhilGEPS also enumerates,
downloads and extracts the attachments (extract_lib pdftotext -layout; pdftoppm+tesseract
OCR fallback for scanned PDFs). All work happens in a temp dir; docs.db/blobs are never
touched. Legacy attachments are auth-gated postbacks -> docs stays [].

Field parsing is STRUCTURAL (<label>Name:</label>value / <span id="lblDisplay*">) — line
adjacency corrupts fields when a value is empty (DECISIONS.md correction #3). The label
and docview regexes mirror ingest.py / docs_census.py; keep in sync.

Doc statuses use the FROZEN EnrichDoc vocabulary (webapp enrich-types.ts):
extracted | ocr | scanned-unreadable | too-large | fetch-failed.

Exit nonzero ONLY when even the page fetch fails; every doc-level failure is reported
in-band as a status.
"""
import html as htmllib
import json
import os
import re
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import extract_lib as ex  # noqa: E402  (proven pdftotext/OOXML/zip extraction; do not fork)

CORPUS = os.path.join(HERE, "corpus.db")
LEGACY_URL = "https://notices.philgeps.gov.ph/GEPSNONPILOT/Tender/SplashBidNoticeAbstractUI.aspx?refID={}"
MPH_URL = "https://philgeps.gov.ph/Indexes/viewLiveTenderDetails/{}/OPEN_MORE"
DOCVIEW = "https://philgeps.gov.ph/Tenders/tender_doc_view/{0}/{0}"
UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
      "Chrome/126.0 Safari/537.36")

DOC_MAX = 8
FILE_BYTES_MAX = 15 * 1024 * 1024
OCR_PAGES_MAX = 8
OCR_TEXT_MIN = 100            # pdftotext under this on a PDF -> try OCR
TOTAL_CHARS_MAX = 150_000
HTTP_TIMEOUT = 90

# --- parsers (structural; mirror ingest.py / ingest_legacy.py / docs_census.py) ------------
LABEL = re.compile(r"<label>\s*([^<:]{2,60}?)\s*:\s*</label>((?:\s*</?br\s*/?>)*)\s*([^<]*)", re.I)
SPAN = re.compile(r'<span[^>]*\bid="(lbl[A-Za-z0-9_]+)"[^>]*>(.*?)</span>', re.S)
DOCROW = re.compile(
    r"<tr>\s*<td>\s*(\d+)\s*</td>\s*"
    r"<td>\s*<a[^>]*href=\"([^\"]+)\"[^>]*>(.*?)</a>\s*</td>\s*"
    r"<td>\s*([^<]*?)\s*</td>", re.S)
GATE = "session has been expired"
HUMAN = re.compile(r"^\d{9,12}_(?:[0-9a-f]{8}_)?(.*)$")


def clean(s):
    return re.sub(r"\s+", " ", htmllib.unescape(s or "")).strip()


def money(s):
    try:
        return float(clean(s).replace(",", "")) or None
    except ValueError:
        return None


def labels(h):
    """All <label>Key:</label>value pairs. An empty value stays empty — never the next label."""
    out = {}
    for m in LABEL.finditer(h):
        out.setdefault(clean(m.group(1)), clean(m.group(3)))
    return out


def block(h, start, end):
    """Free-text region between two markers (description, line items) — not label-structured."""
    t = re.sub(r"<(script|style)\b.*?</\1>", " ", h, flags=re.S | re.I)
    a = t.find(start)
    if a < 0:
        return None
    b = t.find(end, a)
    seg = re.sub(r"<[^>]+>", "\n", t[a + len(start): b if b > 0 else len(t)])
    return "\n".join(l for l in (clean(x) for x in seg.split("\n")) if l) or None


def spans(h):
    out = {}
    for sid, body in SPAN.findall(h):
        body = re.sub(r"(?i)<br\s*/?>", "\n", body)
        body = htmllib.unescape(re.sub(r"(?s)<[^>]+>", " ", body))
        out.setdefault(sid, "\n".join(x.strip() for x in
                                      re.sub(r"[ \t]+", " ", body).split("\n")).strip())
    return out


def human_name(fname):
    m = HUMAN.match(os.path.basename(fname or ""))
    core = m.group(1) if m else os.path.basename(fname or "")
    return re.sub(r"_+", " ", core).strip() or fname


def norm_url(u):
    return re.sub(r"(?<!:)//+", "/", u)


# --- http ----------------------------------------------------------------------------------
def _req(url, xhr=False):
    h = {"User-Agent": UA, "Accept": "*/*"}
    if xhr:
        h["X-Requested-With"] = "XMLHttpRequest"   # THE docview gate (docs_census.py)
    return urllib.request.Request(url, headers=h)


def fetch_text(url, xhr=False, tries=2):
    err = ""
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(_req(url, xhr), timeout=HTTP_TIMEOUT) as r:
                return r.read().decode("utf-8", "replace"), ""
        except Exception as e:                                        # noqa: BLE001
            err = f"{type(e).__name__}: {e}"[:200]
    return None, err


def fetch_file(url, dest):
    """-> (nbytes, err). Refuses oversize on Content-Length, and again while streaming."""
    try:
        with urllib.request.urlopen(_req(url), timeout=HTTP_TIMEOUT) as r:
            cl = r.headers.get("Content-Length")
            if cl and cl.isdigit() and int(cl) > FILE_BYTES_MAX:
                return int(cl), "too-large"
            n = 0
            with open(dest, "wb") as fh:
                while True:
                    chunk = r.read(1 << 16)
                    if not chunk:
                        break
                    n += len(chunk)
                    if n > FILE_BYTES_MAX:
                        return n, "too-large"
                    fh.write(chunk)
            return n, ""
    except Exception as e:                                            # noqa: BLE001
        return 0, f"{type(e).__name__}: {e}"[:200]


# --- page parsing --------------------------------------------------------------------------
def parse_mphilgeps(h):
    L = labels(h)
    page = {re.sub(r"\W+", "_", k.strip().lower()).strip("_"): v for k, v in L.items() if v}
    page["abc"] = money(L.get("Approved Budget of the Contract"))
    page["closing"] = L.get("Closing Date") or None
    # prebid lives in its own fieldset with generic Date/Venue labels — scope to the fieldset
    m = re.search(r"(?s)Prebid Conference:.*?</fieldset>", h)
    prebid = labels(m.group(0)) if m else {}
    page["prebid"] = " · ".join(v for v in (prebid.get("Date"), prebid.get("Venue")) if v) or None
    m = re.search(r"(?s)Invitation to Bid</center>.*?<b>(.*?)</b>", h)
    page["title"] = clean(m.group(1)) if m else None
    desc = block(h, "Description:", "Line Item Details")
    items = block(h, "Line Item Details", "BAC Members:")
    if items:
        page["line_items"] = items
    return page, desc


LEGACY_KEYS = {
    "title": "lblDisplayTitle", "agency": "lblDisplayProcuringEntity",
    "area_of_delivery": "lblDisplayAOD", "solicitation_no": "lblDisplaySolNumber",
    "trade_agreement": "lblDisplayTradeAgree", "procurement_mode": "lblDisplayProcureMode",
    "classification": "lblDisplayClass", "category": "lblDisplayCategory",
    "delivery_period": "lblDisplayPeriod", "status": "lblDisplayStatus",
    "contact": "lblDisplayContactPerson", "publish_date": "lblDisplayDatePublish",
    "closing": "lblDisplayCloseDateTime", "reference_no": "lblDisplayReferenceNo",
    "client_agency": "lblDisplayClient", "bid_supplements": "lblDisplayBidSupplements",
    "document_request_list": "lblDisplayDocReqList", "date_published": "lblDisplayDatePublish",
    "last_updated": "lblDisplayLastUpdateTime",
}


def parse_legacy(h):
    S = spans(h)
    page = {k: clean(S.get(sid, "")) or None for k, sid in LEGACY_KEYS.items()}
    page["abc"] = money(S.get("lblDisplayBudget"))
    pre = [clean(S.get(k, "")) for k in ("lblPreBidDate", "lblPreBidTime", "lblPreBidVenue")]
    page["prebid"] = " · ".join(x for x in pre if x) or None
    desc = S.get("lblAbstractText") or None
    return {k: v for k, v in page.items() if v is not None}, desc


# --- attachments (mPhilGEPS only) ----------------------------------------------------------
def ocr_pdf(path, tmp, pages):
    """pdftoppm -r 150 -png first OCR_PAGES_MAX pages + tesseract per page -> text or None."""
    if not (shutil.which("pdftoppm") and shutil.which("tesseract")):
        return None
    last = min(pages or OCR_PAGES_MAX, OCR_PAGES_MAX)
    base = os.path.join(tmp, "ocr")
    try:
        subprocess.run(["pdftoppm", "-r", "150", "-png", "-f", "1", "-l", str(last), path, base],
                       capture_output=True, timeout=180, check=True)
    except (subprocess.SubprocessError, OSError) as e:
        print(f"  pdftoppm failed: {e}", file=sys.stderr)
        return None
    out = []
    for png in sorted(f for f in os.listdir(tmp) if f.startswith("ocr") and f.endswith(".png")):
        p = os.path.join(tmp, png)
        try:
            r = subprocess.run(["tesseract", p, "stdout"], capture_output=True, text=True,
                               errors="replace", timeout=120)
            if r.stdout.strip():
                out.append(r.stdout.strip())
        except (subprocess.SubprocessError, OSError) as e:
            print(f"  tesseract failed on {png}: {e}", file=sys.stderr)
        finally:
            os.unlink(p)
    text = "\n\n".join(out).strip()
    return text or None


def get_docs(nid):
    body, err = fetch_text(DOCVIEW.format(nid), xhr=True)
    if body is None:
        print(f"docview fetch failed: {err}", file=sys.stderr)
        return []
    if GATE in body and not DOCROW.search(body):
        print("docview returned the gated shell; treating as no document list", file=sys.stderr)
        return []
    rows = []
    for seq, url, name, _date in DOCROW.findall(body):
        name = clean(re.sub(r"(?s)<[^>]+>", "", name))
        rows.append((int(seq), norm_url(url.strip()), name))
    rows.sort()
    if len(rows) > DOC_MAX:
        print(f"{len(rows)} documents, downloading first {DOC_MAX}", file=sys.stderr)
    docs = []
    tmp = tempfile.mkdtemp(prefix="rfp-enrich-")
    try:
        for seq, url, name in rows[:DOC_MAX]:
            disp = human_name(os.path.basename(url)) or name or f"document {seq}"
            dest = os.path.join(tmp, f"doc{seq}.bin")
            n, err = fetch_file(url, dest)
            if err == "too-large":
                docs.append({"name": disp, "text": "", "status": "too-large", "pages": 0})
                continue
            if err:
                print(f"  fetch failed {disp}: {err}", file=sys.stderr)
                docs.append({"name": disp, "text": "", "status": "fetch-failed", "pages": 0})
                continue
            e = ex.extract(dest)
            status, text, pages = "extracted", e.text or "", e.pages or 0
            if e.fmt == "pdf" and len(re.sub(r"\s", "", text)) < OCR_TEXT_MIN:
                ocr = ocr_pdf(dest, tmp, e.pages)
                if ocr:
                    status, text = "ocr", ocr
                else:
                    status, text = "scanned-unreadable", ""
            elif e.status == "too_large":
                status, text = "too-large", ""
            elif e.status in ("ok", "partial"):
                status = "extracted"
            elif not text:
                # corrupt/encrypted/not_a_document/empty/unsupported with no text: the doc
                # exists but nothing legible came out — closest honest frozen status.
                status = "scanned-unreadable"
            docs.append({"name": disp, "text": text, "status": status, "pages": pages})
            os.path.exists(dest) and os.unlink(dest)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    # total-text cap: truncate per-doc proportionally, and say so in the text itself
    total = sum(len(d["text"]) for d in docs)
    if total > TOTAL_CHARS_MAX:
        for d in docs:
            if not d["text"]:
                continue
            keep = max(2000, int(len(d["text"]) * TOTAL_CHARS_MAX / total))
            if len(d["text"]) > keep:
                d["text"] = d["text"][:keep] + f"\n[truncated: {len(d['text'])} chars total]"
        print(f"total doc text {total} chars > {TOTAL_CHARS_MAX}, truncated proportionally",
              file=sys.stderr)
    return docs


# --- main ----------------------------------------------------------------------------------
def main(argv):
    if len(argv) != 1 or not argv[0].isdigit():
        print("usage: python3 enrich_fetch.py <notice-id>", file=sys.stderr)
        return 2
    nid = int(argv[0])
    try:
        con = sqlite3.connect(f"file:{CORPUS}?mode=ro", uri=True)
        row = con.execute("select source, title from corpus where id=? limit 1", (nid,)).fetchone()
        con.close()
    except sqlite3.Error as e:
        print(f"corpus.db lookup failed: {e}", file=sys.stderr)
        return 2
    if not row:
        print(f"notice {nid} not in corpus", file=sys.stderr)
        return 2
    source, corpus_title = row

    url = (LEGACY_URL if source == "legacy" else MPH_URL).format(nid)
    h, err = fetch_text(url)
    if h is None or len(h) < 2000:
        why = err or f"{len(h or '')} bytes"
        print(f"notice page fetch failed ({url}): {why}", file=sys.stderr)
        return 1
    if source == "legacy":
        page, desc = parse_legacy(h)
        docs = []          # legacy attachments are auth-gated postbacks (attachments.py)
    else:
        page, desc = parse_mphilgeps(h)
        docs = get_docs(nid)
    page.setdefault("title", None)
    if not page["title"]:
        page["title"] = corpus_title
    json.dump({"source": source, "page": page, "description": desc, "docs": docs},
              sys.stdout, ensure_ascii=False)
    print()
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))

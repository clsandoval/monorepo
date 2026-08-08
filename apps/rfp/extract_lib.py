#!/usr/bin/env python3
"""
Reference extraction primitives for PhilGEPS bid documents.  RECON ARTIFACT, not the
production script: no fetching, no database, no CLI orchestration.  The later agent that
writes `rfp fetchdocs` / `rfp extract` should lift these functions as-is; they are the
parts that were measured against 17 real PH government bid PDFs (see NOTES-extract.md).

Design in one line: sniff by magic bytes, extract PDFs with poppler subprocesses, extract
OOXML with stdlib zipfile+ElementTree, recurse into archives, and classify every PDF page
as text / scanned / blank so a scanned document is FLAGGED rather than stored as empty.

    python3 extract_lib.py test      # assert-based selfcheck, builds its own fixtures
    python3 extract_lib.py FILE...   # ad-hoc: print classification + text head
"""
from __future__ import annotations

import os
import re
import subprocess
import sys
import zipfile
import zlib
from dataclasses import dataclass, field
from xml.etree import ElementTree as ET

# ---------------------------------------------------------------------------- tunables
# Justified in NOTES-extract.md; every one of these is a measured threshold, not a guess.
PAGE_CHAR_MIN = 100          # a page with fewer non-space chars is not a text page
PAGE_IMG_PIXEL_MIN = 200_000 # ...and if it also carries >= this many raster pixels, it is a scan
FILE_BYTES_MAX = 25 * 1024 * 1024   # PhilGEPS's own uploader caps a notice at 10 MB, so 25 is
                                    # 2.5x the policy ceiling: it accepts every legitimate
                                    # agency-hosted document measured (max 13.5 MB) and still
                                    # refuses anything anomalous.  Total disk is capped separately.
ARCHIVE_EXPAND_MAX = 60 * 1024 * 1024  # refuse an archive whose members sum above this
ARCHIVE_MEMBER_MAX = 40      # members extracted per archive
ARCHIVE_DEPTH_MAX = 2        # zip-in-zip is real; zip-in-zip-in-zip is an attack
PDFTOTEXT_TIMEOUT = 120      # seconds; a 209-page PDF measured at 0.25s, so this is generous
XLSX_CELL_MAX = 200_000      # cells read per workbook

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"
S = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"

# extract_status vocabulary.  Anything that is not "ok" must survive into the DB so the
# search layer can demote the notice instead of scoring an empty document as irrelevant.
STATUSES = {
    "ok",            # text extracted, at least one text page
    "no_text_layer", # valid PDF, zero text pages -> a scan.  NOT an error.
    "partial",       # extractor returned non-zero but emitted some text anyway
    "encrypted",     # user password required
    "corrupt",       # magic bytes said PDF/zip but the parser could not read it
    "not_a_document",# server returned HTML (error page) or an unknown format
    "unsupported",   # format we deliberately do not handle (e.g. .rar with no unar)
    "too_large",     # exceeded FILE_BYTES_MAX
    "empty",         # zero bytes on disk
}


# ------------------------------------------------------------------------------- sniffing
def sniff(head: bytes) -> str:
    """Format from magic bytes. NEVER trust the URL extension: 5 of 22 sample fetches
    returned an HTML error page from a URL ending in .pdf, with HTTP 200."""
    if head[:4] == b"%PDF":
        return "pdf"
    if head[:2] == b"PK":
        return "zipfam"                       # docx/xlsx/pptx/zip — resolve by member names
    if head[:4] == b"Rar!":
        return "rar"
    if head[:8] == b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1":
        return "ole"                          # legacy binary .doc / .xls
    if head[:5] == b"{\\rtf":
        return "rtf"
    if head[:6] == b"7z\xbc\xaf\x27\x1c":
        return "7z"
    if head[:2] == b"\x1f\x8b":
        return "gzip"
    low = head[:512].lstrip().lower()
    if low.startswith(b"<html") or low.startswith(b"<!doc") or low.startswith(b"<?xml"):
        return "html"
    return "unknown"


def zip_kind(names) -> str:
    n = set(names)
    if "word/document.xml" in n:
        return "docx"
    if "xl/workbook.xml" in n:
        return "xlsx"
    if "ppt/presentation.xml" in n:
        return "pptx"
    return "zip"


def detect(path: str) -> str:
    """Full format detection for a file on disk."""
    if os.path.getsize(path) == 0:
        return "empty"
    with open(path, "rb") as fh:
        kind = sniff(fh.read(1024))
    if kind == "zipfam":
        try:
            with zipfile.ZipFile(path) as z:
                return zip_kind(z.namelist())
        except zipfile.BadZipFile:
            return "corrupt"
    return kind


# ----------------------------------------------------------------------------------- PDF
def _run(cmd, timeout=PDFTOTEXT_TIMEOUT):
    return subprocess.run(cmd, capture_output=True, text=True, timeout=timeout,
                          errors="replace")


def pdf_page_count(path: str) -> int:
    m = re.search(r"^Pages:\s+(\d+)", _run(["pdfinfo", path]).stdout, re.M)
    return int(m.group(1)) if m else 0


def tidy(text: str) -> str:
    """Normalize `pdftotext -layout` output.  Measured over 17 real bid PDFs: this recovers
    the entire 27% byte penalty of -layout (2.870 MB -> 2.253 MB, vs 2.257 MB for plain
    pdftotext) while KEEPING the column separation that makes a Bill of Quantities
    readable.  So: -layout + tidy strictly dominates plain."""
    text = re.sub(r"[ \t]+$", "", text, flags=re.M)   # trailing pad
    text = re.sub(r"^[ \t]+", "", text, flags=re.M)   # left margin pad
    text = re.sub(r"[ ]{3,}", "\t", text)             # column gap -> one tab
    text = re.sub(r"\n{3,}", "\n\n", text)            # page-break blank runs
    return text.strip()


def pdf_text(path: str, first=None, last=None):
    cmd = ["pdftotext", "-layout", "-enc", "UTF-8"]
    if first:
        cmd += ["-f", str(first), "-l", str(last or first)]
    r = _run(cmd + [path, "-"])
    # stdout only.  pdftotext writes "Syntax Error: ..." to stderr; capturing 2>&1 into the
    # text column silently stores poppler diagnostics as document content.
    return r.stdout, r.returncode, r.stderr.strip()[:500]


def _page_image_pixels(path: str, page: int) -> int:
    out = _run(["pdfimages", "-f", str(page), "-l", str(page), "-list", path]).stdout
    tot = 0
    for line in out.splitlines()[2:]:
        f = line.split()
        if len(f) > 4 and f[3].isdigit() and f[4].isdigit():
            tot += int(f[3]) * int(f[4])
    return tot


def _doc_image_pixels(path: str) -> dict:
    """{page_no: total raster pixels} from ONE pdfimages call."""
    out = _run(["pdfimages", "-list", path]).stdout
    px = {}
    for line in out.splitlines()[2:]:
        f = line.split()
        if len(f) > 4 and f[0].isdigit() and f[3].isdigit() and f[4].isdigit():
            px[int(f[0])] = px.get(int(f[0]), 0) + int(f[3]) * int(f[4])
    return px


def classify_pages(path: str, n_pages: int, raw_text: str = None):
    """Per-page classification.  Document-level detection is WRONG here: real PH bidding
    documents are mixed.  Measured over 17 documents / 1321 pages, 8 of 17 contain at least
    one image-only page and the worst is 71 of 209 (34%), yet only 1 of 17 has no text at
    all.  A boolean has_text_layer would call all of those "fine" and lose 3-34% of pages.

    Returns (text_pages, scan_pages, blank_pages).  The blank/scan split matters: pages with
    25-40 chars and no raster are section dividers ("Section VII. Technical Specifications"),
    which are benign; pages with 0 chars and a 0.3-17 MPixel raster are real scanned inserts.

    Costs two subprocesses for the whole document, not two per page: pdftotext separates
    pages with a form feed, and pdfimages -list carries a page column.  On a 209-page
    document that is 0.45s instead of 418 process spawns, and the answer is identical
    (verified in selfcheck against the naive per-page path).
    """
    if raw_text is None:
        raw_text, _, _ = pdf_text(path)
    # pdftotext emits a TRAILING form feed, so split() yields n_pages+1 chunks. Slicing to
    # n_pages drops the phantom; not slicing shifts every page number by one at the end.
    chunks = raw_text.split("\f")[:n_pages]
    px = _doc_image_pixels(path)
    text = scan = blank = 0
    for i in range(1, n_pages + 1):
        chunk = chunks[i - 1] if i - 1 < len(chunks) else ""
        if len(re.sub(r"\s", "", chunk)) >= PAGE_CHAR_MIN:
            text += 1
        elif px.get(i, 0) >= PAGE_IMG_PIXEL_MIN:
            scan += 1
        else:
            blank += 1
    return text, scan, blank


def classify_pages_slow(path: str, n_pages: int):
    """Naive reference: two subprocesses per page. Only used to verify the fast path."""
    text = scan = blank = 0
    for i in range(1, n_pages + 1):
        out, _, _ = pdf_text(path, i)
        if len(re.sub(r"\s", "", out)) >= PAGE_CHAR_MIN:
            text += 1
        elif _page_image_pixels(path, i) >= PAGE_IMG_PIXEL_MIN:
            scan += 1
        else:
            blank += 1
    return text, scan, blank


# --------------------------------------------------------------------------------- OOXML
def docx_text(src) -> str:
    """DOCX via stdlib only.  Table rows are joined with tabs so a Bill of Quantities keeps
    its row structure; python-docx buys nothing over this for text extraction."""
    with zipfile.ZipFile(src) as z:
        parts = [n for n in z.namelist() if re.fullmatch(
            r"word/(document|header\d*|footer\d*|footnotes|endnotes)\.xml", n)]
        out = []
        for name in sorted(parts, key=lambda n: (n != "word/document.xml", n)):
            root = ET.fromstring(z.read(name))
            _docx_walk(root, out)
    return "\n".join(out)


def _docx_walk(el, out, in_row=False):
    for child in el:
        if child.tag == W + "tr":
            cells = []
            for tc in child.iter(W + "tc"):
                cells.append(" ".join(
                    "".join(t.text or "" for t in p.iter(W + "t")).strip()
                    for p in tc.iter(W + "p")).strip())
            if any(cells):
                out.append("\t".join(cells))
        elif child.tag == W + "p" and not in_row:
            txt = "".join(t.text or "" for t in child.iter(W + "t")).strip()
            if txt:
                out.append(txt)
        else:
            _docx_walk(child, out, in_row or child.tag == W + "tr")


def xlsx_text(src, cell_max=XLSX_CELL_MAX) -> str:
    """XLSX via stdlib only.  Handles sharedStrings, inline strings, and numeric cells.
    Formula cells yield their cached <v> value, which is what a BOQ total actually needs."""
    with zipfile.ZipFile(src) as z:
        names = set(z.namelist())
        shared = []
        if "xl/sharedStrings.xml" in names:
            for si in ET.fromstring(z.read("xl/sharedStrings.xml")).iter(S + "si"):
                shared.append("".join(t.text or "" for t in si.iter(S + "t")))
        titles = {}
        if "xl/workbook.xml" in names:
            wb = ET.fromstring(z.read("xl/workbook.xml"))
            for i, sh in enumerate(wb.iter(S + "sheet"), 1):
                titles[f"xl/worksheets/sheet{i}.xml"] = sh.get("name", f"sheet{i}")
        out, cells = [], 0
        for name in sorted(n for n in names if re.fullmatch(r"xl/worksheets/sheet\d+\.xml", n)):
            out.append("# " + titles.get(name, name))
            for row in ET.fromstring(z.read(name)).iter(S + "row"):
                vals = []
                for c in row.iter(S + "c"):
                    cells += 1
                    if cells > cell_max:
                        out.append("[truncated: cell cap]")
                        return "\n".join(out)
                    t, v = c.get("t"), c.find(S + "v")
                    if t == "s" and v is not None and v.text is not None:
                        i = int(v.text)
                        vals.append(shared[i] if i < len(shared) else "")
                    elif t == "inlineStr":
                        isn = c.find(S + "is")
                        vals.append("".join(x.text or "" for x in isn.iter(S + "t"))
                                    if isn is not None else "")
                    elif v is not None:
                        vals.append(v.text or "")
                if any(x.strip() for x in vals):
                    out.append("\t".join(vals))
    return "\n".join(out)


def rtf_text(raw: bytes) -> str:
    """Good-enough RTF strip.  RTF turns up as a .doc in the wild; a real RTF parser is not
    worth a dependency for a format that is <1% of anything."""
    s = raw.decode("latin-1", "replace")
    s = re.sub(r"\{\\\*?\\[^{}]*\}", "", s)            # ignorable destinations
    s = re.sub(r"\\'([0-9a-fA-F]{2})", lambda m: chr(int(m.group(1), 16)), s)
    s = re.sub(r"\\par[d]?\b", "\n", s)
    s = re.sub(r"\\[a-zA-Z]+-?\d* ?", "", s)
    s = s.replace("{", "").replace("}", "")
    return re.sub(r"\n{3,}", "\n\n", s).strip()


# ------------------------------------------------------------------------------- archives
@dataclass
class Member:
    name: str
    fmt: str
    bytes: int
    text: str = ""
    status: str = "ok"
    depth: int = 0
    note: str = ""


def zip_members(path: str, depth=0) -> list:
    """Recurse into a zip.  This is the MAIN path, not an edge case: PhilGEPS allows exactly
    one uploaded file per notice, so any notice with more than one document is a zip or rar.
    Guarded on member count, total uncompressed size, and depth -- all read from the central
    directory before extracting a single byte."""
    out = []
    try:
        z = zipfile.ZipFile(path)
    except zipfile.BadZipFile as e:
        return [Member(os.path.basename(path), "zip", os.path.getsize(path),
                       status="corrupt", depth=depth, note=str(e)[:120])]
    infos = [i for i in z.infolist() if not i.is_dir()]
    total = sum(i.file_size for i in infos)
    if total > ARCHIVE_EXPAND_MAX:
        return [Member(os.path.basename(path), "zip", os.path.getsize(path),
                       status="too_large", depth=depth,
                       note=f"members expand to {total} bytes")]
    for info in infos[:ARCHIVE_MEMBER_MAX]:
        try:
            data = z.read(info)
        except RuntimeError as e:                  # encrypted member
            out.append(Member(info.filename, "?", info.file_size,
                              status="encrypted", depth=depth, note=str(e)[:80]))
            continue
        fmt = sniff(data[:1024])
        if fmt == "zipfam":
            fmt = zip_kind(zipfile.ZipFile(_BytesIO(data)).namelist())
        m = Member(info.filename, fmt, info.file_size, depth=depth)
        try:
            if fmt == "docx":
                m.text = docx_text(_BytesIO(data))
            elif fmt == "xlsx":
                m.text = xlsx_text(_BytesIO(data))
            elif fmt == "rtf":
                m.text = rtf_text(data)
            elif fmt == "zip":
                if depth + 1 > ARCHIVE_DEPTH_MAX:
                    m.status = "unsupported"
                    m.note = "archive depth cap"
                else:
                    import tempfile
                    with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tf:
                        tf.write(data)
                        tmp = tf.name
                    try:
                        inner = zip_members(tmp, depth=depth + 1)
                    finally:
                        os.unlink(tmp)
                    m.note = f"nested archive, {len(inner)} members"
                    m.text = "\n\n".join(f"--- {i.name}\n{i.text}" for i in inner if i.text)
                    if not m.text:
                        bad = {i.status for i in inner} - {"ok"}
                        m.status = sorted(bad)[0] if bad else "no_text_layer"
                    out.append(m)
                    out.extend(inner)
                    continue
            elif fmt == "pdf":
                # poppler needs a real path, so spill.  PDF-inside-zip is the dominant
                # multi-document shape, not an edge case worth deferring.
                import tempfile
                with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tf:
                    tf.write(data)
                    tmp = tf.name
                try:
                    raw, rc, err = pdf_text(tmp)
                    m.text = tidy(raw)
                    pages = pdf_page_count(tmp)
                    if rc != 0 and not m.text:
                        m.status = "encrypted" if "password" in err.lower() else "corrupt"
                    elif pages and not m.text:
                        m.status = "no_text_layer"
                    m.note = f"pages={pages}"
                finally:
                    os.unlink(tmp)
            elif fmt == "unknown" and _looks_like_text(data):
                m.fmt = "txt"
                m.text = data.decode("utf-8", "replace").strip()
            else:
                m.status = "unsupported"
        except Exception as e:                     # noqa: BLE001 - one bad member, not one bad notice
            m.status = "corrupt"
            m.note = f"{type(e).__name__}: {e}"[:120]
        if not m.text and m.status == "ok" and m.fmt in ("docx", "xlsx", "rtf", "txt"):
            m.status = "no_text_layer"
        out.append(m)
    if len(infos) > ARCHIVE_MEMBER_MAX:
        out.append(Member("(truncated)", "-", 0, status="too_large", depth=depth,
                          note=f"{len(infos)} members, cap {ARCHIVE_MEMBER_MAX}"))
    return out


from io import BytesIO as _BytesIO  # noqa: E402  (kept next to its only use)


# -------------------------------------------------------------------------------- top level
@dataclass
class Extracted:
    fmt: str
    status: str
    text: str = ""
    pages: int = 0
    text_pages: int = 0
    scan_pages: int = 0
    blank_pages: int = 0
    members: list = field(default_factory=list)
    note: str = ""


def extract(path: str, page_scan=True) -> Extracted:
    size = os.path.getsize(path)
    if size == 0:
        return Extracted("empty", "empty")
    if size > FILE_BYTES_MAX:
        return Extracted(detect(path), "too_large", note=f"{size} bytes")
    fmt = detect(path)
    if fmt == "pdf":
        raw, rc, err = pdf_text(path)
        text = tidy(raw)
        pages = pdf_page_count(path)
        if rc != 0 and not text:
            status = "encrypted" if "password" in err.lower() else "corrupt"
            return Extracted(fmt, status, pages=pages, note=err)
        tp = sp = bp = 0
        if page_scan and pages:
            tp, sp, bp = classify_pages(path, pages, raw_text=raw)
        if rc != 0:
            status = "partial"          # rc=1 yet text present: truncated download
        elif pages and tp == 0:
            status = "no_text_layer"    # a scan.  A finding, not a failure.
        else:
            status = "ok"
        return Extracted(fmt, status, text, pages, tp, sp, bp, note=err)
    if fmt == "docx":
        t = docx_text(path)
        return Extracted(fmt, "ok" if t else "no_text_layer", t)
    if fmt == "xlsx":
        t = xlsx_text(path)
        return Extracted(fmt, "ok" if t else "no_text_layer", t)
    if fmt == "rtf":
        with open(path, "rb") as fh:
            t = rtf_text(fh.read())
        return Extracted(fmt, "ok" if t else "no_text_layer", t)
    if fmt == "ole":
        r = _run(["antiword", path])
        t = r.stdout.strip()
        return Extracted(fmt, "ok" if t else "unsupported", t, note=r.stderr[:200])
    if fmt == "zip":
        ms = zip_members(path)
        # skip fmt=="zip" rows: a nested container's text is the concatenation of its own
        # children, which are listed separately.  Joining both double-counts every byte.
        joined = "\n\n".join(f"--- {m.name}\n{m.text}"
                             for m in ms if m.text and m.fmt != "zip")
        if joined:
            status = "ok"
        elif len(ms) == 1:
            status = ms[0].status          # propagate: a lone too_large/corrupt member IS
        else:                              # the archive's verdict, not "no text layer"
            bad = {m.status for m in ms} - {"ok"}
            status = "no_text_layer" if not bad else sorted(bad)[0]
        return Extracted(fmt, status, joined, members=ms,
                         note="; ".join(f"{m.name}:{m.status}" for m in ms
                                        if m.status != "ok")[:300])
    if fmt == "rar":
        if _which("unar"):
            return Extracted(fmt, "ok", note="expand with: unar -q -o DIR FILE")
        return Extracted(fmt, "unsupported", note="no unar on PATH")
    if fmt == "html":
        return Extracted(fmt, "not_a_document", note="server returned HTML for a document URL")
    return Extracted(fmt, "not_a_document")


def _which(b):
    from shutil import which
    return which(b)


def _looks_like_text(data: bytes) -> bool:
    """Plain-text member of an archive (readme.txt, a pasted TOR). Cheap heuristic: decodes
    as UTF-8 and is >=95% printable."""
    try:
        s = data[:4096].decode("utf-8")
    except UnicodeDecodeError:
        return False
    if not s.strip():
        return False
    printable = sum(1 for ch in s if ch.isprintable() or ch in "\r\n\t")
    return printable / len(s) >= 0.95


# ------------------------------------------------------------------------------- selfcheck
def _min_pdf_with_text(path):
    """Smallest hand-built PDF that pdftotext will read."""
    body = (b"BT /F1 12 Tf 72 720 Td "
            b"(REQUEST FOR QUOTATION Supply and Delivery of Various Medical Supplies) Tj "
            b"0 -20 Td (Approved Budget for the Contract: PHP 322,820.00) Tj "
            b"0 -20 Td (PCAB License Category C required for civil works.) Tj ET")
    objs = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
        b"<< /Length %d >>\nstream\n" % len(body) + body + b"\nendstream",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ]
    _write_pdf(path, objs)


def _min_pdf_image_only(path, w=700, h=900):
    """A page with no text and one large raster -> the scanned-page case, built from stdlib
    zlib so the fixture is ~1 KB instead of a megabyte of embedded JPEG."""
    img = zlib.compress(bytes(w * h))            # all-black 8-bit gray, compresses to nothing
    objs = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>",
        None,
        b"<< /Type /XObject /Subtype /Image /Width %d /Height %d /ColorSpace /DeviceGray "
        b"/BitsPerComponent 8 /Filter /FlateDecode /Length %d >>\nstream\n" % (w, h, len(img))
        + img + b"\nendstream",
    ]
    content = b"q 612 0 0 792 0 0 cm /Im0 Do Q"
    objs[3] = b"<< /Length %d >>\nstream\n" % len(content) + content + b"\nendstream"
    _write_pdf(path, objs)


def _write_pdf(path, objs):
    out = bytearray(b"%PDF-1.4\n")
    offs = []
    for i, o in enumerate(objs, 1):
        offs.append(len(out))
        out += b"%d 0 obj\n" % i + o + b"\nendobj\n"
    xref = len(out)
    out += b"xref\n0 %d\n0000000000 65535 f \n" % (len(objs) + 1)
    for off in offs:
        out += b"%010d 00000 n \n" % off
    out += (b"trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n"
            % (len(objs) + 1, xref))
    with open(path, "wb") as fh:
        fh.write(bytes(out))


def _min_docx(path):
    doc = ('<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/'
           'wordprocessingml/2006/main"><w:body>'
           '<w:p><w:r><w:t>INVITATION TO BID</w:t></w:r></w:p>'
           '<w:p><w:r><w:t xml:space="preserve">Construction of 1-Storey 2 Classroom </w:t>'
           '</w:r><w:r><w:t>School Building</w:t></w:r></w:p>'
           '<w:tbl>'
           '<w:tr><w:tc><w:p><w:r><w:t>Item</w:t></w:r></w:p></w:tc>'
           '<w:tc><w:p><w:r><w:t>Description</w:t></w:r></w:p></w:tc>'
           '<w:tc><w:p><w:r><w:t>Qty</w:t></w:r></w:p></w:tc></w:tr>'
           '<w:tr><w:tc><w:p><w:r><w:t>804(1)b</w:t></w:r></w:p></w:tc>'
           '<w:tc><w:p><w:r><w:t>Embankment</w:t></w:r></w:p></w:tc>'
           '<w:tc><w:p><w:r><w:t>120</w:t></w:r></w:p></w:tc></w:tr>'
           '</w:tbl>'
           '<w:p><w:r><w:t>PCAB Category C, Size Range Small B.</w:t></w:r></w:p>'
           '</w:body></w:document>')
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", '<?xml version="1.0"?><Types xmlns="http://'
                   'schemas.openxmlformats.org/package/2006/content-types"/>')
        z.writestr("word/document.xml", doc)


def _min_xlsx(path):
    shared = ('<?xml version="1.0"?><sst xmlns="http://schemas.openxmlformats.org/'
              'spreadsheetml/2006/main" count="4" uniqueCount="4">'
              '<si><t>Item No.</t></si><si><t>Description</t></si>'
              '<si><t>Embankment from borrow</t></si><si><t>TOTAL</t></si></sst>')
    sheet = ('<?xml version="1.0"?><worksheet xmlns="http://schemas.openxmlformats.org/'
             'spreadsheetml/2006/main"><sheetData>'
             '<row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row>'
             '<row r="2"><c r="A2" t="inlineStr"><is><t>804(1)b</t></is></c>'
             '<c r="B2" t="s"><v>2</v></c><c r="C2"><v>120</v></c></row>'
             '<row r="3"><c r="A3" t="s"><v>3</v></c>'
             '<c r="C3"><f>SUM(C2:C2)</f><v>120</v></c></row>'
             '</sheetData></worksheet>')
    wb = ('<?xml version="1.0"?><workbook xmlns="http://schemas.openxmlformats.org/'
          'spreadsheetml/2006/main"><sheets><sheet name="BOQ" sheetId="1" r:id="rId1" '
          'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>'
          '</sheets></workbook>')
    with zipfile.ZipFile(path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("xl/workbook.xml", wb)
        z.writestr("xl/sharedStrings.xml", shared)
        z.writestr("xl/worksheets/sheet1.xml", sheet)


def selfcheck(tmp=None):
    import tempfile
    tmp = tmp or tempfile.mkdtemp(prefix="rfp-extract-")
    p = lambda n: os.path.join(tmp, n)  # noqa: E731

    # --- sniffing: the URL extension is a lie ------------------------------------------
    assert sniff(b"%PDF-1.7\n...") == "pdf"
    assert sniff(b"PK\x03\x04...") == "zipfam"
    assert sniff(b"Rar!\x1a\x07\x01\x00") == "rar"
    assert sniff(b"{\\rtf1\\ansi") == "rtf"
    assert sniff(b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1") == "ole"
    # the case that actually happened: HTTP 200, .pdf URL, HTML body (5 of 22 fetches)
    assert sniff(b"<html><head><title>403 Forbidden") == "html"
    assert sniff(b"<!DOCTYPE html><html>") == "html"
    assert sniff(b"\x00\x01\x02\x03") == "unknown"
    assert zip_kind(["word/document.xml", "_rels/.rels"]) == "docx"
    assert zip_kind(["xl/workbook.xml"]) == "xlsx"
    assert zip_kind(["a.pdf", "b.pdf"]) == "zip"

    # --- tidy() keeps columns, drops padding -------------------------------------------
    assert tidy("   a     b\n   c     d\n") == "a\tb\nc\td"
    assert tidy("x\n\n\n\n\ny") == "x\n\ny"
    assert "\t" in tidy("Item      Description"), "3+ spaces must become a column break"
    assert tidy("a b c") == "a b c", "single spaces are words, not columns"

    # --- PDF with a text layer ---------------------------------------------------------
    _min_pdf_with_text(p("text.pdf"))
    e = extract(p("text.pdf"))
    assert e.fmt == "pdf" and e.status == "ok", (e.fmt, e.status, e.note)
    assert e.pages == 1 and e.text_pages == 1 and e.scan_pages == 0, e
    assert "REQUEST FOR QUOTATION" in e.text
    assert "322,820.00" in e.text, "peso amounts must survive extraction"
    assert "PCAB" in e.text

    # --- PDF with NO text layer: flagged, never silently empty -------------------------
    _min_pdf_image_only(p("scan.pdf"))
    e = extract(p("scan.pdf"))
    assert e.fmt == "pdf", e
    assert e.status == "no_text_layer", (e.status, e.note)
    assert e.pages == 1 and e.text_pages == 0 and e.scan_pages == 1, e
    assert e.text == "", "a scan yields no text; that is the point"
    # ... and this is why exit code proves nothing:
    _, rc, _ = pdf_text(p("scan.pdf"))
    assert rc == 0, "pdftotext returns 0 on a scanned PDF while emitting no text"

    # --- blank vs scanned pages are different things -----------------------------------
    assert classify_pages(p("scan.pdf"), 1) == (0, 1, 0)
    assert classify_pages(p("text.pdf"), 1) == (1, 0, 0)
    # the fast (2 subprocesses per document) path must agree with the naive per-page path
    for name in ("scan.pdf", "text.pdf"):
        n = pdf_page_count(p(name))
        assert classify_pages(p(name), n) == classify_pages_slow(p(name), n), name
    # form-feed arithmetic: pdftotext appends a trailing \f, so a 1-page doc splits into 2
    raw, _, _ = pdf_text(p("text.pdf"))
    assert len(raw.split("\f")) == 2, "trailing form feed is real; slice to n_pages"

    # --- corrupt / truncated PDF -------------------------------------------------------
    with open(p("text.pdf"), "rb") as fh:
        good = fh.read()
    with open(p("trunc.pdf"), "wb") as fh:
        fh.write(good[: len(good) // 2])
    e = extract(p("trunc.pdf"))
    assert e.status in ("corrupt", "partial"), e
    assert e.fmt == "pdf", "magic bytes still say pdf even when the xref is gone"

    # --- HTML error page served from a .pdf URL ---------------------------------------
    with open(p("error.pdf"), "wb") as fh:
        fh.write(b"<!DOCTYPE html><html><body>403 Forbidden</body></html>")
    e = extract(p("error.pdf"))
    assert e.status == "not_a_document" and e.fmt == "html", e
    assert e.text == "", "an error page must never land in the text column"

    # --- zero bytes -------------------------------------------------------------------
    open(p("zero.pdf"), "wb").close()
    assert extract(p("zero.pdf")).status == "empty"

    # --- DOCX: paragraphs and table rows ----------------------------------------------
    _min_docx(p("a.docx"))
    e = extract(p("a.docx"))
    assert e.fmt == "docx" and e.status == "ok", e
    assert "INVITATION TO BID" in e.text
    # split runs must rejoin into one string, not two words jammed together
    assert "Construction of 1-Storey 2 Classroom School Building" in e.text, e.text
    assert "804(1)b\tEmbankment\t120" in e.text, "table rows keep their columns\n" + e.text
    assert "Item\tDescription\tQty" in e.text

    # --- XLSX: sharedStrings, inline strings, numbers, cached formula values -----------
    _min_xlsx(p("b.xlsx"))
    e = extract(p("b.xlsx"))
    assert e.fmt == "xlsx" and e.status == "ok", e
    assert "# BOQ" in e.text, "sheet names are searchable context"
    assert "Item No.\tDescription" in e.text
    assert "804(1)b\tEmbankment from borrow\t120" in e.text, e.text
    assert "TOTAL\t120" in e.text, "formula cells must yield their cached value\n" + e.text

    # --- RTF wearing a .doc extension --------------------------------------------------
    with open(p("c.doc"), "wb") as fh:
        fh.write(b"{\\rtf1\\ansi\\deff0 REQUEST FOR QUOTATION\\par ABC: PHP 322,820.00\\par}")
    e = extract(p("c.doc"))
    assert e.fmt == "rtf" and e.status == "ok", e
    assert "REQUEST FOR QUOTATION" in e.text and "322,820.00" in e.text, e.text
    assert "rtf1" not in e.text and "{" not in e.text, "control words must be stripped"

    # --- ZIP: the main multi-document path, not an edge case ---------------------------
    with zipfile.ZipFile(p("bundle.zip"), "w", zipfile.ZIP_DEFLATED) as z:
        z.write(p("a.docx"), "01 ITB/Annex A.docx")
        z.write(p("b.xlsx"), "02 BOQ/Bill of Quantities.xlsx")
        z.write(p("text.pdf"), "03 TOR/Terms of Reference.pdf")
        z.writestr("notes.txt", "collated per the PhilGEPS one-file-per-notice rule")
    e = extract(p("bundle.zip"))
    assert e.fmt == "zip" and e.status == "ok", e
    assert len(e.members) == 4, [m.name for m in e.members]
    got = {m.name: m.fmt for m in e.members}
    assert got["01 ITB/Annex A.docx"] == "docx"
    assert got["02 BOQ/Bill of Quantities.xlsx"] == "xlsx"
    assert got["03 TOR/Terms of Reference.pdf"] == "pdf"
    assert got["notes.txt"] == "txt", "plain-text members are read, not shrugged off"
    assert "INVITATION TO BID" in e.text and "Bill of Quantities" in e.text
    # a PDF inside a zip must actually be extracted, not merely identified
    pdfm = [m for m in e.members if m.fmt == "pdf"][0]
    assert "REQUEST FOR QUOTATION" in pdfm.text, pdfm
    assert "REQUEST FOR QUOTATION" in e.text
    assert "one-file-per-notice" in e.text, "txt member text reaches the joined output"
    assert all(m.status == "ok" for m in e.members), [(m.name, m.status) for m in e.members]

    # --- ZIP guards: expansion bomb, member cap, depth cap -----------------------------
    with zipfile.ZipFile(p("bomb.zip"), "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("big.txt", b"A" * (ARCHIVE_EXPAND_MAX + 1))
    e = extract(p("bomb.zip"))
    assert e.status == "too_large", (e.status, "a capped archive is not 'no text layer'")
    assert e.members and e.members[0].status == "too_large", e.members
    assert e.text == "", "a bomb must not be expanded into the text column"
    assert e.note, "the reason must reach the row, not just the log"

    with zipfile.ZipFile(p("many.zip"), "w") as z:
        for i in range(ARCHIVE_MEMBER_MAX + 5):
            z.writestr(f"f{i}.txt", b"x")
    ms = zip_members(p("many.zip"))
    assert ms[-1].name == "(truncated)" and ms[-1].status == "too_large", ms[-1]
    assert len(ms) == ARCHIVE_MEMBER_MAX + 1

    with zipfile.ZipFile(p("nest.zip"), "w") as z:
        z.write(p("bundle.zip"), "inner/bundle.zip")
    ms = zip_members(p("nest.zip"))
    assert ms[0].fmt == "zip" and "nested" in ms[0].note, ms[0]
    assert ms[0].status == "ok" and "INVITATION TO BID" in ms[0].text, ms[0]
    assert len(ms) == 5, "inner members are listed individually too: " + str(len(ms))
    assert {m.depth for m in ms[1:]} == {1}, "inner members carry depth=1"
    e = extract(p("nest.zip"))
    assert e.status == "ok" and "804(1)b\tEmbankment\t120" in e.text, e.status
    assert e.text.count("INVITATION TO BID") == 1, "nested text must not be counted twice"
    assert abs(len(e.text) - len(extract(p("bundle.zip")).text)) < 200, (
        "a zip-in-zip yields the same text as the zip, not double")
    ms = zip_members(p("nest.zip"), depth=ARCHIVE_DEPTH_MAX)
    assert ms[0].status == "unsupported", "depth cap must stop the recursion"
    assert len(ms) == 1, "capped recursion must not enumerate inner members"

    corrupt = p("corrupt.zip")
    with open(corrupt, "wb") as fh:
        fh.write(b"PK\x03\x04" + b"\x00" * 200)
    assert detect(corrupt) == "corrupt"
    e = extract(corrupt)
    assert e.status in ("corrupt", "not_a_document"), e

    # --- status vocabulary is closed ---------------------------------------------------
    for name in ("text.pdf", "scan.pdf", "trunc.pdf", "error.pdf", "zero.pdf",
                 "a.docx", "b.xlsx", "c.doc", "bundle.zip", "bomb.zip"):
        assert extract(p(name)).status in STATUSES, name

    print(f"extract_lib selfcheck OK  (fixtures in {tmp})")
    return True


def _report(paths):
    for path in paths:
        e = extract(path)
        print(f"{os.path.basename(path)[:40]:42} fmt={e.fmt:8} status={e.status:14} "
              f"pages={e.pages:<4} text={e.text_pages:<4} scan={e.scan_pages:<4} "
              f"blank={e.blank_pages:<4} chars={len(e.text)}")
        if e.note:
            print(f"   note: {e.note[:150]}")
        for m in e.members:
            print(f"   member {m.name[:46]:48} {m.fmt:6} {m.status:12} {len(m.text)} chars")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "test":
        selfcheck()
    elif len(sys.argv) > 1:
        _report(sys.argv[1:])
    else:
        print(__doc__)

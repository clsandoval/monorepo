#!/usr/bin/env python3
"""bidkita weekly bid brief — one branded 2-page PDF per firm. #148.

    python3 brief.py "AVZ CONSTRUCTION & SUPPLY"     # one firm, style 11
    python3 brief.py batch                            # every contactable shortlist firm
    python3 brief.py "FIRM" 17                        # older press palettes still exist

Every number comes out of awards.db / corpus.db / tags.db. Nothing is estimated, nothing is
predicted. Page 2 shows the reader exactly how the page was assembled — that section is the pitch.
"""
import html
import json
import sqlite3
import subprocess
import sys
from datetime import datetime, timedelta, timezone

HERE = __file__.rsplit("/", 1)[0]
MANILA = timezone(timedelta(hours=8))
CHROME = "/usr/bin/google-chrome"

MPHIL = "https://philgeps.gov.ph/Indexes/viewLiveTenderDetails/{}/OPEN_MORE"
LEGACY = "https://notices.philgeps.gov.ph/GEPSNONPILOT/Tender/SplashBidNoticeAbstractUI.aspx?refID={}"

# --- palettes -------------------------------------------------------------------------------
# "11" is the locked brand (style 11, signal). flat=True renders the typographic hero — ink
# headline, one thin accent rule — instead of the press plates the older palettes use.
THEMES = {
    "11": dict(
        name="signal", label="11 · SIGNAL", flat=True,
        paper="#FCFBF8", ink="#16130F", a1="#D93025", a2="#D93025", rule="#E7E4DE",
        hero_text="#16130F", hero_h=0, mark="#D93025", panel="#F5F3EF",
    ),
    "15": dict(
        name="overprint-duotone", label="15 · OVERPRINT DUOTONE",
        paper="#F1ECE2", ink="#241F1C", a1="#2B3F8C", a2="#D4522E", rule="#CFC6B6",
        hero_text="#F1ECE2", hero_h=184, mark="#D4522E", panel="#E9E1D3", h1_size=36,
        hero_a="left:0; top:0; width:58%; height:100%; background:#2B3F8C;",
        hero_b="left:36%; top:0; width:64%; height:100%; background:#D4522E;",
        hero_c="left:36%; top:0; width:22%; height:100%; background:#5B2B3C;",
        h1_box="left:26px; right:13%;", strap_box="left:27px; right:13%;",
    ),
    "17": dict(
        name="riso-pink-peacock", label="17 · RISO PINK + PEACOCK",
        paper="#F9F5EC", ink="#1C1B19", a1="#157A6E", a2="#F05A7E", rule="#DCD6C8",
        hero_text="#1C1B19", hero_h=184, mark="#F05A7E", panel="#F1EBDD", h1_size=33,
        hero_a=("right:0; top:0; width:40%; height:100%; background:#157A6E;"
                "clip-path:polygon(44% 0,100% 0,100% 100%,0 100%);"),
        hero_b=("right:24%; top:0; width:46%; height:56%; background:#F05A7E;"
                "clip-path:polygon(12% 0,100% 0,74% 100%,26% 72%);"),
        hero_c=("right:24%; top:4%; width:15%; height:34%; background:#4A2D52;"
                "clip-path:polygon(0 40%,58% 0,100% 46%,34% 100%);"),
        h1_box="left:0; right:47%;", strap_box="left:0; right:47%;",
    ),
    "20": dict(
        name="letterpress-kraft", label="20 · LETTERPRESS KRAFT",
        paper="#C4A47C", ink="#3B2E1E", a1="#1E3128", a2="#8C3A2A", rule="#A88C64",
        hero_text="#EFE3CE", hero_h=188, mark="#EFE3CE", panel="#B99A72", h1_size=34,
        hero_a="left:0; top:0; width:30%; height:100%; background:#1E3128;",
        hero_b="left:26%; top:15%; width:22%; height:2.5px; background:#B23A2B;",
        h1_box="left:34%; right:0;", strap_box="left:34%; right:0;",
    ),
    "21": dict(
        name="municipal-two-pass", label="21 · MUNICIPAL TWO-PASS",
        paper="#F5EFDF", ink="#26211A", a1="#2E5D3F", a2="#C94F32", rule="#C9BFA6",
        hero_text="#26211A", hero_h=184, mark="#C94F32", panel="#EFE7D2", h1_size=33,
        hero_a="left:0; top:0; width:21%; height:100%; background:#2E5D3F;",
        hero_b=("left:12%; top:50%; margin-top:-64px; width:128px; height:128px;"
                "border-radius:50%; background:#C94F32;"),
        hero_c=("left:12%; top:50%; margin-top:-64px; width:128px; height:128px;"
                "border-radius:50%; background:#1E4430; clip-path:inset(0 65px 0 0);"),
        h1_box="left:31%; right:0;", strap_box="left:31%; right:0;",
    ),
}
DISPLAY = '"Helvetica Neue",Helvetica,Arial,sans-serif'

# --- firm inference -------------------------------------------------------------------------
# What a firm does is read off its own award titles. unspsc_desc lies (EL KAPITAN's drainage
# system is filed under "Construction or work site catering services"), so titles win.
BUILDING = ("BUILDING", "HEALTH STATION", "BARANGAY HALL", "MUNICIPAL HALL", "CLASSROOM",
            "SCHOOL", "COVERED COURT", "OPCEN", "OPERATION CENTER", "DAYCARE", "HALL",
            "FENCE", "STOCKROOM", "LEARNING CONTINUITY")
LINEAR = ("ROAD", "BRIDGE", "DRAINAGE", "SLOPE", "REVETMENT", "DIKE", "CONCRETING",
          "ELECTRIFICATION", "SOLAR", "WATER SYSTEM", "CEMETERY", "CULVERT", "PAVED",
          "CARRIAGEWAY", "BY-PASS", "DIVERSION")
SUPPLY_VERBS = ("SUPPLY AND DELIVERY", "SUPPLY & DELIVERY", "SUPPLY &AMP; DELIVERY",
                "PROCUREMENT", "PURCHASE", "FURNISHING", "DELIVERY OF")
SUPPLY_MAP = (  # first keyword hit decides the supplier's work_type in the tag taxonomy
    (("FOOD", "NUTRITIOUS", "MEAL"), "food_catering"),
    (("BOOK", "LEARNING MATERIALS", "SUPPLEMENTARY"), "office_supplies"),
    (("SCANNER", "COMPUTER", "LAPTOP", "PRINTER", "OMR"), "ict_hardware"),
    (("MEDICINE", "MEDICAL", "DRUGS"), "medical_supplies"),
)
WORK_ADJ = {  # a supplier's "one step beside" — used for the widened tier
    "mixed_supplies": ("repair_maintenance", "office_supplies"),
    "food_catering": ("agriculture", "mixed_supplies"),
    "ict_hardware": ("office_supplies", "mixed_supplies"),
    "office_supplies": ("printing_promo", "mixed_supplies"),
    "medical_supplies": ("lab_equipment", "mixed_supplies"),
    "consulting": ("outsourced_services",),
}


def kind_of(title):
    up = title.upper()
    if any(k in up for k in LINEAR):
        return "linear"          # linear wins: DPWH titles mention buildings they lead to
    if any(k in up for k in BUILDING):
        return "building"
    return None


def infer_firm(awards):
    """(work_type, kind). kind is only meaningful for civil_works firms."""
    civil, supply = [], []
    for a in awards:
        t = (a["title"] or "").upper()
        if any(v in t for v in SUPPLY_VERBS) and "LABOR" not in t:
            supply.append(t)
        else:
            civil.append(t)
    if civil and len(civil) >= len(supply):
        txt = " ".join(civil)
        if "FEASIBILITY" in txt or "CONSULTANCY" in txt:
            return "consulting", None
        kinds = [kind_of(t) for t in civil]
        b, l = kinds.count("building"), kinds.count("linear")
        return "civil_works", ("building" if b > l else "linear" if l > b else None)
    txt = " ".join(supply)
    for keys, wt in SUPPLY_MAP:
        if any(k in txt for k in keys):
            return wt, None
    return "mixed_supplies", None


def peso(v, sign="₱"):
    return f"{sign}{v:,.0f}" if v else "—"


def db():
    c = sqlite3.connect(f"{HERE}/awards.db")
    c.execute(f"attach '{HERE}/corpus.db' as c")
    c.execute(f"attach '{HERE}/tags.db' as t")
    c.row_factory = sqlite3.Row
    return c


# --- matching -------------------------------------------------------------------------------
# Ladder per #148: start at their exact size and lead-time, relax only until the page holds
# 5-12 notices, and remember the rung so the widening can be labelled on the page.
LADDER = (
    dict(lo=0.2, hi=2.2, days=18),
    dict(lo=0.1, hi=3.5, days=30),
    dict(lo=0.05, hi=8.0, days=45),
)


def fetch(con, province, types, lo, hi, days):
    q = f"""
        select c.nid, c.source, c.id, c.ref_no, s.abc, s.title, s.agency, s.closing_at,
               s.days_left, s.mode_norm, g.needs_pcab, g.work_type, g.scope,
               c.delivery_period, c.delivery_days,
               coalesce(nullif(dr.eligibility,'[]'), g.eligibility) as eligibility,
               (dr.eligibility is not null and dr.eligibility != '[]') as from_docs
        from c.corpus c
        join c.corpus_state s on s.nid = c.nid
        join c.notice_location l on l.nid = c.nid
        join t.tags g on g.id = c.id
        left join t.tag_runs dr on dr.id = c.id and dr.tier = 'doc'
        where s.state = 'open' and l.location_norm = ?
          and g.work_type in ({','.join('?' * len(types))})
          and s.abc between ? and ? and s.days_left <= ?
    """
    return con.execute(q, (province.upper(), *types, lo, hi, days)).fetchall()


def match(con, province, biggest, work_type, kind, want=10, exact_cap=6):
    types = (work_type,) + WORK_ADJ.get(work_type, ())
    rows, rung = [], 0
    for rung, band in enumerate(LADDER, 1):
        rows = fetch(con, province, types, biggest * band["lo"], biggest * band["hi"],
                     band["days"])
        rows = [r for r in rows if not _foreign(r, province)]
        if len(rows) >= 5:
            break

    def exact(r):
        if work_type == "civil_works":
            return kind is None or kind_of(r["title"]) == kind
        return r["work_type"] == work_type

    def near(r):  # closest to the contract size they have actually delivered
        return abs((r["abc"] or 1) / biggest - 1)

    t1 = sorted([r for r in rows if exact(r)], key=near)
    t2 = sorted([r for r in rows if not exact(r)], key=near)
    picked = t1[:exact_cap] + t2[: max(0, want - min(len(t1), exact_cap))]
    if len(picked) < want:  # thin province: let the exact tier refill past its cap
        picked += [r for r in t1[exact_cap:] if r not in picked][: want - len(picked)]
    picked = sorted(picked, key=lambda r: r["days_left"])
    tags = {r["nid"]: ("match" if exact(r) else "widened") for r in picked}
    return picked, tags, rung


def _foreign(row, province):
    """Title names a province that isn't this one -> the location index is wrong for this row."""
    up = row["title"].upper() + " " + row["agency"].upper()
    others = ("CAGAYAN", "CAMARINES SUR", "ALBAY", "QUEZON", "SORSOGON", "MASBATE",
              "CATANDUANES")
    return any(o in up for o in others) and province.upper() not in up


# --- page -----------------------------------------------------------------------------------
# One notice per page. The reader is a contractor who reads bid bulletins all day; this is set
# like one, not like a deck. Copy budget: every sentence earns its place or goes.
def build_time(r):
    d = r["delivery_days"] or (r["delivery_period"] or "").split(" ")[0]
    try:
        d = int(str(d).strip())
    except (ValueError, TypeError):
        return ""
    return (f'<div class="fact"><b>Build time</b>'
            f'<span class="mono">{d} calendar days</span></div>')


def why_line(r, tag, kind, work_type, awards):
    if tag == "match":
        if work_type == "civil_works":
            a = awards[0]["title"] or ""
            short = a.split(",")[0].split(":")[-1].strip().title()
            return f"Same work as your {awards[0]['award_date'][-4:]} contract: {short[:60]}."
        return "Same goods you supplied in " + awards[0]["award_date"][-4:] + "."
    k = kind_of(r["title"])
    what = {"linear": "road and drainage work", "building": "building work"}.get(k, "adjacent work")
    return f"One step beside your record: {what}, same budget range."


def render(th, firm, contact, awards, picked, tags, rung, province, pool, corpus_n,
           corpus_value, work_type):
    now = datetime.now(MANILA)
    total = sum(r["abc"] or 0 for r in picked)
    biggest = max((a["contract_amount"] or 0) for a in awards)
    horizon = max(r["days_left"] for r in picked)
    kind = infer_firm(awards)[1]
    a0 = awards[0]
    npages = len(picked) + 2

    css = f"""<meta charset="utf-8"><title>bidkita · {html.escape(firm)}</title>
<style>
@page {{ size:A4; margin:0; }}
* {{ box-sizing:border-box; }}
body {{ margin:0; background:{th['paper']}; color:{th['ink']};
  font:10.5px/1.5 "Helvetica Neue",Helvetica,Arial,sans-serif;
  -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
.page {{ width:210mm; height:297mm; padding:18mm 19mm 15mm; position:relative; overflow:hidden;
  display:flex; flex-direction:column; }}
.page + .page {{ break-before:page; }}
.mono {{ font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
  font-variant-numeric:tabular-nums; }}
.mast {{ display:flex; justify-content:space-between; align-items:baseline; margin-bottom:24mm; }}
.word {{ font-weight:800; font-size:17px; letter-spacing:-.045em; color:{th['mark']}; }}
.kick {{ font-size:8px; letter-spacing:.2em; text-transform:uppercase; color:#8E8A82; }}
h1 {{ margin:0; font-weight:800; font-size:44px; line-height:1.02; letter-spacing:-.035em; }}
.rule {{ border:0; border-top:3px solid {th['a2']}; width:64px; margin:22px 0; }}
.lede {{ font-size:13.5px; line-height:1.6; max-width:150mm; }}
.grey {{ color:#8E8A82; }}
a {{ color:{th['a1']}; text-decoration:none; }}
.toc {{ margin-top:14mm; }}
.toc-row {{ display:flex; gap:14px; align-items:baseline; padding:8px 0;
  border-top:1px solid {th['rule']}; font-size:11px; }}
.toc-row .d {{ width:60px; color:#8E8A82; white-space:nowrap; }}
.toc-row .t {{ flex:1; }}
.toc-row .m {{ text-align:right; }}
.toc-row .pg {{ width:26px; text-align:right; color:#8E8A82; }}
.tag {{ display:inline-block; font-size:8px; letter-spacing:.16em; text-transform:uppercase;
  padding:3px 7px; }}
.tag.match {{ background:{th['a2']}; color:{th['paper']}; }}
.tag.widened {{ border:1px solid {th['ink']}; color:{th['ink']}; }}
.ntitle {{ font-weight:800; font-size:27px; line-height:1.08; letter-spacing:-.028em;
  margin:14px 0 4px; max-width:160mm; }}
.agency {{ font-size:12px; color:#8E8A82; }}
.scope {{ font-size:14px; line-height:1.55; max-width:150mm; margin:9mm 0 0; }}
.abc {{ margin-top:12mm; }}
.abc {{ font-size:46px; letter-spacing:-.03em; line-height:1; }}
.abclab {{ font-size:8px; letter-spacing:.2em; text-transform:uppercase; color:#8E8A82;
  margin:6px 0 12mm; }}
.facts {{ border-top:1px solid {th['ink']}; max-width:126mm; }}
.fact {{ display:flex; gap:18px; padding:9px 0; border-bottom:1px solid {th['rule']};
  font-size:12px; }}
.fact b {{ width:70px; flex-shrink:0; font-weight:600; font-size:8px; letter-spacing:.16em;
  text-transform:uppercase; color:#8E8A82; padding-top:3px; }}
.why {{ margin-top:12mm; font-size:13px; max-width:130mm; }}
.foot {{ margin-top:auto; display:flex; justify-content:space-between; font-size:8.5px;
  color:#8E8A82; }}
.big {{ font-weight:800; font-size:34px; line-height:1.05; letter-spacing:-.03em; }}
.fine {{ font-size:8px; line-height:1.6; color:#8E8A82; margin-top:auto; }}
</style>"""

    def calm(t, n):
        letters = [c for c in t if c.isalpha()] or [" "]
        if sum(c.isupper() for c in letters) / len(letters) > .5:
            t = t.title()
        if len(t) > n:
            t = t[:n].rsplit(" ", 1)[0]
        return t.rstrip(" ,;:/(–-")

    toc = ""
    for i, r in enumerate(picked):
        close = datetime.fromisoformat(r["closing_at"])
        toc += f"""<div class="toc-row mono"><span class="d">{close:%a %-d}</span>
        <span class="t">{html.escape(calm(r['title'] or '', 62))}</span>
        <span class="m">{peso(r['abc'])}</span><span class="pg">{i + 2}</span></div>"""

    cover = f"""<div class="page">
  <div class="mast"><span class="word">bidkita</span>
    <span class="kick">Bid brief · {html.escape(province)} · closings in {datetime.fromisoformat(picked[0]['closing_at']):%B} · {now:%-d %B %Y}</span></div>
  <h1>{len(picked)} contracts close in<br>{html.escape(province)}<br>within {horizon:.0f} days.</h1>
  <div class="abc mono" style="margin-top:12mm">{peso(total)}</div>
  <div class="abclab">Combined approved budget</div>
  <hr class="rule" style="margin:14px 0 18px">
  <p class="lede">PhilGEPS shows {html.escape(firm.title())} won {peso(biggest)} in
  {a0['award_date'][-4:]}. That record qualifies you for the work in this brief.
  One contract per page: the budget, the deadline, what it needs.</p>
  <div class="toc">{toc}</div>
  <div class="foot" style="margin-top:12px">
    <span>Prepared for {html.escape((a0['winner_contact'] or firm).title())} · {html.escape(contact['phone'] or '')}</span>
    <span>1 / {npages}</span></div>
</div>"""

    pages = ""
    for i, r in enumerate(picked):
        url = (MPHIL if r["source"] == "mphilgeps" else LEGACY).format(r["id"])
        close = datetime.fromisoformat(r["closing_at"])
        when = (f"{close:%A %-d %B}, {close:%H:%M}" if (close.hour or close.minute)
                else f"{close:%A %-d %B}")
        reqs = json.loads(r["eligibility"] or "[]")
        req_html = ("<br>".join(html.escape(x.capitalize()) for x in reqs) if reqs
                    else 'Listed in the bid documents. Link below.')
        src = " Read from the attached bid documents." if r["from_docs"] and reqs else ""
        tag = tags[r["nid"]]
        pages += f"""<div class="page">
  <div class="mast" style="margin-bottom:16mm"><span class="word">bidkita</span>
    <span class="kick">{html.escape(province)} · {i + 2} of {npages}</span></div>
  <span><span class="tag {tag}">{tag}</span></span>
  <div class="ntitle">{html.escape(calm(r['title'] or '', 130))}</div>
  <div class="agency">{html.escape((r['agency'] or '').title())}</div>
  {f'<p class="scope">{html.escape(r["scope"])}</p>' if r['scope'] else ''}
  <div class="abc mono">{peso(r['abc'])}</div>
  <div class="abclab">Approved budget for the contract</div>
  <div class="facts">
    <div class="fact"><b>Closes</b><span class="mono">{when} &nbsp;·&nbsp; {('%d day' % r['days_left'] if r['days_left'] < 1.5 else '%.0f days' % r['days_left'])} from today</span></div>
    <div class="fact"><b>Mode</b><span>{html.escape((r['mode_norm'] or '').capitalize())}</span></div>
    {build_time(r)}
    <div class="fact"><b>Needs</b><span>{req_html}<span class="grey">{src}</span></span></div>
    <div class="fact"><b>Ref</b><span class="mono"><a href="{url}">{html.escape(r['ref_no'] or str(r['id']))}</a>
      &nbsp;<span class="grey">verify on PhilGEPS</span></span></div>
  </div>
  <p class="why">{why_line(r, tag, kind, work_type, awards)}</p>
  <div class="foot"><span>bidkita · bid brief · {now:%-d %b %Y}</span>
    <span>{i + 2} / {npages}</span></div>
</div>"""

    last = f"""<div class="page">
  <div class="mast"><span class="word">bidkita</span>
    <span class="kick">{html.escape(firm)} · {npages} of {npages}</span></div>
  <div class="big">This brief, rebuilt for you<br>every Friday.</div>
  <hr class="rule">
  <p class="lede">We read all {corpus_n:,} open PhilGEPS notices nightly, both boards.
  Your record sets the size and the work. Deadlines cluster on Monday and Tuesday,
  so this lands before the weekend.</p>
  <p class="lede" style="margin-top:10mm"><b>Want next Friday's?</b><br>
  Reply to this email. Free.</p>
  <div class="fine">
    Sources: PhilGEPS public notices, snapshot {now:%-d %B %Y %H:%M} Manila. Amounts are the
    published approved budget. Nothing here predicts an award. Your firm and contact details
    come from the public award notice of your {a0['award_date'][-4:]} contract.
    Reply STOP and we will not contact you again.
  </div>
</div>"""

    return css + cover + pages + last


# --- build ----------------------------------------------------------------------------------
def build(con, firm, keys=("11",), strict=True):
    awards = con.execute("select * from awards where winner = ? order by award_date desc",
                         (firm,)).fetchall()
    contact = con.execute("select * from contacts where winner = ?", (firm,)).fetchone()
    assert awards and contact, f"missing rows for {firm}"

    province = awards[0]["winner_province"]
    assert province, f"no province for {firm}"
    biggest = max(a["contract_amount"] or 0 for a in awards)
    work_type, kind = infer_firm(awards)
    picked, tags, rung = match(con, province, biggest, work_type, kind)
    if strict:
        assert 5 <= len(picked) <= 12, f"matcher returned {len(picked)} for {firm}"
    elif not picked:
        return None, dict(firm=firm, province=province, work_type=work_type, n=0, rung=rung)

    pool = con.execute("""select count(distinct s.nid) from c.corpus_state s
                          join c.notice_location l on l.nid = s.nid
                          where s.state='open' and l.location_norm = ?""",
                       (province.upper(),)).fetchone()[0]
    corpus_n, corpus_value = con.execute(
        "select count(*), sum(abc) from c.corpus_state where state='open'").fetchone()

    slug = "-".join(w for w in "".join(
        ch if ch.isalnum() else " " for ch in firm.lower()).split())
    subprocess.run(["mkdir", "-p", f"{HERE}/briefs"], check=True)
    out = None
    for k in keys:
        th = THEMES[k]
        out = f"{HERE}/briefs/{slug}" + ("" if k == "11" else f"-{k}-{th['name']}")
        with open(out + ".html", "w") as f:
            f.write(render(th, firm, contact, awards, picked, tags, rung, province, pool,
                           corpus_n, corpus_value, work_type))
        subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-sandbox",
                        "--no-pdf-header-footer", f"--print-to-pdf={out}.pdf",
                        "file://" + out + ".html"], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        pages = open(out + ".pdf", "rb").read().count(b"/Type /Page\n")
        assert pages == len(picked) + 2, f"{firm}: {pages} pages, want {len(picked) + 2}"
    exact_n = sum(1 for v in tags.values() if v == "match")
    return out + ".pdf", dict(
        firm=firm, province=province, work_type=work_type, kind=kind, n=len(picked),
        exact=exact_n, widened=len(picked) - exact_n, rung=rung,
        min_days=min(r["days_left"] for r in picked), biggest=biggest,
        phone=contact["phone"], email=contact["email"])


def batch():
    con = db()
    firms = [r[0] for r in con.execute("""
        select winner from contacts
        where (phone is not null and confidence='good')
           or (email is not null and email_confidence='good')
        order by winner""")]
    rows, fails = [], []
    for f in firms:
        try:
            pdf, info = build(con, f, strict=False)
            (rows if pdf else fails).append(info)
            status = (f"{info['n']:>2} notices ({info.get('exact', 0)} exact, rung {info['rung']})"
                      if pdf else "NO MATCHES")
            print(f"{'ok ' if pdf else 'FAIL'} {f[:52]:<52} {info['province'][:18]:<18} "
                  f"{info['work_type']:<16} {status}", flush=True)
        except Exception as e:
            fails.append(dict(firm=f, error=str(e)))
            print(f"ERR  {f[:52]:<52} {e}", flush=True)

    with open(f"{HERE}/briefs/INDEX.md", "w") as fh:
        fh.write(f"# Brief batch — {datetime.now(MANILA):%Y-%m-%d %H:%M} Manila\n\n"
                 f"{len(rows)} built · {len(fails)} failed. Read every PDF before any is sent"
                 f" (#148: the human pass is the matcher test).\n\n"
                 "| firm | province | work | n | exact | rung | closest close | phone | email |\n"
                 "|---|---|---|---|---|---|---|---|---|\n")
        for r in sorted(rows, key=lambda r: (r["rung"], -r["n"])):
            fh.write(f"| {r['firm']} | {r['province']} | {r['work_type']}"
                     f"{('/' + r['kind']) if r.get('kind') else ''} | {r['n']} | {r['exact']} "
                     f"| {r['rung']} | {r['min_days']:.0f}d | {r['phone'] or ''} "
                     f"| {r['email'] or ''} |\n")
        if fails:
            fh.write("\n## Failed\n\n")
            for r in fails:
                fh.write(f"- {r['firm']} — {r.get('error', 'no matches at any ladder rung')}"
                         f" ({r.get('province', '?')}, {r.get('work_type', '?')})\n")
    n5_12 = sum(1 for r in rows if 5 <= r["n"] <= 12)
    print(f"\n{len(rows)} briefs built, {n5_12} in the 5-12 band, {len(fails)} failed"
          f" -> briefs/INDEX.md")


if __name__ == "__main__":
    args = sys.argv[1:]
    if args and args[0] == "batch":
        batch()
    else:
        firm = args[0] if args else "AVZ CONSTRUCTION & SUPPLY"
        keys = [a for a in args[1:] if a in THEMES] or ["11"]
        pdf, info = build(db(), firm, keys)
        print(pdf, "—", info["n"], "notices,", info["exact"], "exact, ladder rung", info["rung"])

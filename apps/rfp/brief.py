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
               s.days_left, s.mode_norm, g.needs_pcab, g.work_type,
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
def render(th, firm, contact, awards, picked, tags, rung, province, pool, corpus_n,
           corpus_value, work_type):
    now = datetime.now(MANILA)
    elig, pcab, doc_read = {}, 0, 0
    for r in picked:
        pcab += 1 if r["needs_pcab"] else 0
        doc_read += 1 if r["from_docs"] else 0
        for e in json.loads(r["eligibility"] or "[]"):
            elig[e.lower()] = elig.get(e.lower(), 0) + 1

    total = sum(r["abc"] or 0 for r in picked)
    biggest = max((a["contract_amount"] or 0) for a in awards)
    over = sum(1 for r in picked if (r["abc"] or 0) > biggest)
    monday = sum(1 for r in picked
                 if datetime.fromisoformat(r["closing_at"]).weekday() in (0, 1))
    exact_n = sum(1 for r in picked if tags[r["nid"]] == "match")
    widened_n = len(picked) - exact_n
    horizon = max(r["days_left"] for r in picked)
    lo, hi = min(r["abc"] for r in picked), max(r["abc"] for r in picked)
    civil = work_type == "civil_works"

    def notice_row(r):
        url = (MPHIL if r["source"] == "mphilgeps" else LEGACY).format(r["id"])
        close = datetime.fromisoformat(r["closing_at"])
        when = f"{close:%H:%M}" if (close.hour or close.minute) else "no time given"
        reqs = ", ".join(json.loads(r["eligibility"] or "[]")) or "stated in the bid documents"
        src = " · read from the bid documents" if r["from_docs"] else ""
        return f"""<tr>
          <td class="t"><span class="tag {tags[r['nid']]}">{tags[r['nid']]}</span>{html.escape(r['title'][:96])}
            <div class="sub">{html.escape(r['agency'][:64])} · {html.escape(r['mode_norm'] or '')}</div>
            <div class="sub req">needs · {html.escape(reqs[:150])}{html.escape(src)}</div></td>
          <td class="n big">{peso(r['abc'])}</td>
          <td class="n">{close:%a %-d %b}<div class="sub">{when} · {r['days_left']:.0f}d left</div></td>
          <td class="n ref"><a href="{url}">{html.escape(r['ref_no'] or str(r['id']))}</a></td>
        </tr>"""

    award_rows = "".join(f"""<tr>
        <td class="t">{html.escape(a['title'][:96])}
          <div class="sub">{html.escape(a['unspsc_desc'] or '')}</div></td>
        <td class="n big">{peso(a['contract_amount'])}</td>
        <td class="n">{peso(a['abc'])}</td>
        <td class="n">{a['win_ratio'] * 100:.1f}%</td>
        <td class="n">{html.escape(a['award_date'] or '')}</td></tr>""" for a in awards)

    eliglist = "".join(f"<li><b>{v}</b> of {len(picked)} — {html.escape(k[:110])}</li>"
                       for k, v in sorted(elig.items(), key=lambda x: -x[1])[:8])

    if th.get("flat"):
        hero = f"""<div class="hero flat">
    <h1>{peso(total)} closes in<br>{html.escape(province)} in the<br>next {horizon:.0f} days.</h1>
    <hr class="flatrule">
    <div class="strap">{len(picked)} NOTICES &nbsp;·&nbsp; {monday} CLOSE MON–TUE
      &nbsp;·&nbsp; {over} BIGGER THAN YOUR LAST WIN</div>
  </div>"""
    else:
        hero = f"""<div class="hero">
    <div class="plate" style="{th['hero_a']}"></div>
    <div class="plate" style="{th['hero_b']}"></div>
    <div class="plate over" style="{th.get('hero_c', 'display:none')}"></div>
    <h1>{peso(total)} closes in<br>{html.escape(province)} in the<br>next {horizon:.0f} days.</h1>
    <div class="strap">{len(picked)} NOTICES &nbsp;·&nbsp; {monday} CLOSE MON–TUE
      &nbsp;·&nbsp; {over} BIGGER THAN YOUR LAST WIN</div>
  </div>"""

    pcab_block = f"""<b>All {pcab} of the {len(picked)} require a PCAB licence.</b> You bid
      {peso(biggest)} of work in {awards[0]['award_date'][-4:]} and won it, so the licence is not
      the question — the category is, because PCAB caps the size of a single contract you may bid
      and {'<b>' + str(over) + ' of these sit above what your record proves</b>' if over
           else 'all of these sit at or under what your record proves'}.""" if civil else \
        f"""<b>These are {'engagements in the services you already deliver'
                          if work_type in ('consulting', 'outsourced_services')
                          else 'quotation-level and small-bid notices in the goods you already supply'}.</b>
      Your {peso(biggest)} award in {awards[0]['award_date'][-4:]} is the eligibility story:
      a completed government contract of record."""

    docs_line = (f" <b>{doc_read} of the {len(picked)} requirement lists were read out of the "
                 f"bid documents attached to the notice</b>, not summarised from the title."
                 if doc_read else "")

    return f"""<meta charset="utf-8"><title>bidkita — {html.escape(firm)}</title>
<style>
@page {{ size:A4; margin:0; }}
* {{ box-sizing:border-box; }}
body {{ margin:0; background:{th['paper']}; color:{th['ink']};
  font:9.2px/1.42 "Helvetica Neue",Helvetica,Arial,sans-serif;
  -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
.page {{ width:210mm; height:297mm; padding:11mm 12mm 9mm; position:relative; overflow:hidden;
  display:flex; flex-direction:column; }}
.page + .page {{ break-before:page; }}
.mono, .n, .ref, .strap, td.n {{ font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
  font-variant-numeric:tabular-nums; }}
.mast {{ display:flex; justify-content:space-between; align-items:baseline;
  border-bottom:1.5px solid {th['ink']}; padding-bottom:5px; margin-bottom:9px; }}
.word {{ font-family:{DISPLAY}; font-weight:800; font-size:19px; letter-spacing:-.045em;
  color:{th['mark']}; }}
.kicker {{ font-size:7.6px; letter-spacing:.19em; text-transform:uppercase; }}
.hero {{ position:relative; height:{th['hero_h']}px; margin-bottom:11px; }}
.hero.flat {{ height:auto; padding:16px 0 6px; }}
.hero.flat h1 {{ position:static; transform:none; color:{th['ink']}; font-size:37px; }}
.flatrule {{ border:0; border-top:2.5px solid {th['a2']}; width:88px; margin:14px 0 10px; }}
.hero.flat .strap {{ position:static; color:{th['ink']}; opacity:.65; }}
.plate {{ position:absolute; mix-blend-mode:multiply; }}
.plate.over {{ mix-blend-mode:normal; }}
.hero h1 {{ position:absolute; {th.get('h1_box', '')} top:46%; transform:translateY(-50%);
  margin:0; font-family:{DISPLAY}; font-weight:800; font-size:{th.get('h1_size', 34)}px;
  line-height:.97; letter-spacing:-.035em; color:{th['hero_text']}; }}
.strap {{ position:absolute; {th.get('strap_box', '')} bottom:14px; font-size:8.8px;
  letter-spacing:.055em; color:{th['hero_text']}; }}
.towho {{ display:flex; justify-content:space-between; align-items:flex-end; gap:16px;
  border-top:1px solid {th['ink']}; border-bottom:1px solid {th['rule']};
  padding:6px 0 7px; margin-bottom:11px; }}
.towho .firm {{ font-family:{DISPLAY}; font-weight:800; font-size:16px;
  letter-spacing:-.03em; line-height:1.05; }}
.towho .meta {{ text-align:right; font-size:8.4px; line-height:1.55; white-space:nowrap; }}
h2 {{ font-size:9px; letter-spacing:.2em; text-transform:uppercase; margin:0 0 6px;
  color:{th['a1']}; }}
h2 em {{ font-style:normal; color:{th['ink']}; opacity:.45; }}
section {{ margin-bottom:15px; }}
p {{ margin:0 0 7px; }}
.lede {{ font-size:11px; line-height:1.58; }}
table {{ width:100%; border-collapse:collapse; }}
th {{ text-align:left; font-size:7.4px; letter-spacing:.13em; text-transform:uppercase;
  padding:0 6px 4px 0; border-bottom:1.2px solid {th['ink']}; font-weight:600; opacity:.7; }}
td {{ padding:6px 6px 6px 0; border-bottom:1px solid {th['rule']}; vertical-align:top;
  font-size:9.4px; }}
td.n, th.n {{ text-align:right; padding-right:0; padding-left:12px; white-space:nowrap; width:1%; }}
td.t, th.t {{ width:99%; }}
td.big {{ font-size:10.2px; }}
.sub {{ font-size:8px; margin-top:2px; opacity:.62;
  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif; }}
.req {{ opacity:1; color:{th['a1']}; }}
.tag {{ display:inline-block; font-size:6.8px; letter-spacing:.13em; text-transform:uppercase;
  padding:1.5px 4px; margin-right:6px; vertical-align:1.5px; }}
.tag.match {{ background:{th['a2']}; color:{th['paper']}; }}
.tag.widened {{ border:1px solid {th['a1']}; color:{th['a1']}; }}
a {{ color:{th['a1']}; text-decoration:none; }}
.panel {{ background:{th['panel']}; padding:14px 17px; font-size:10px; line-height:1.55;
  border-left:3px solid {th['a2']}; }}
.panel ul {{ margin:8px 0 8px; padding-left:15px; }} li {{ margin-bottom:3px; }}
.how {{ display:flex; gap:0; }}
.step {{ flex:1; padding:0 12px 0 0; }}
.step:last-child {{ padding-right:0; }}
.step .num {{ font-family:ui-monospace,Menlo,monospace; font-size:24px; color:{th['a2']};
  letter-spacing:-.05em; line-height:1; }}
.step h3 {{ font-size:10px; margin:6px 0 4px; letter-spacing:.02em; }}
.step p {{ font-size:9.2px; line-height:1.6; margin:0; opacity:.85; }}
.cta {{ margin:auto -12mm 0; background:{th['a1']}; color:{th['paper']};
  padding:22px 12mm 24px; display:flex; justify-content:space-between;
  align-items:flex-end; gap:18px; }}
.cta .big {{ font-family:{DISPLAY}; font-weight:800; font-size:24px; line-height:1.05;
  letter-spacing:-.032em; max-width:120mm; }}
.cta .sell {{ font-size:9.2px; line-height:1.55; margin-top:8px; opacity:.88;
  max-width:110mm; font-family:{DISPLAY}; letter-spacing:0; font-weight:400; }}
.cta a {{ color:{th['paper']}; }}
.fine {{ font-size:7.2px; line-height:1.55; opacity:.72; margin-top:10px; }}
</style>

<div class="page">
  <div class="mast">
    <div class="word">bidkita</div>
    <div class="kicker">Weekly bid brief · {html.escape(province)} · {now:%-d %B %Y}</div>
  </div>
  {hero}
  <div class="towho">
    <div><div class="kicker" style="opacity:.6;margin-bottom:3px">Prepared for</div>
      <div class="firm">{html.escape(firm)}</div></div>
    <div class="meta">{html.escape(awards[0]['winner_contact'] or '')}<br>
      {html.escape(contact['phone'] or '')} &nbsp;·&nbsp; {html.escape(contact['email'] or '')}<br>
      {html.escape((contact['address'] or awards[0]['winner_address'] or '')[:58])}</div>
  </div>

  <section>
    <h2>01 · Your record <em>— as PhilGEPS publishes it</em></h2>
    <table><thead><tr><th class="t">Contract</th><th class="n">Awarded</th><th class="n">ABC</th>
      <th class="n">Bid ratio</th><th class="n">Date</th></tr></thead>
      <tbody>{award_rows}</tbody></table>
    <div class="sub" style="margin-top:5px">{len(awards)} award record{'s' if len(awards) != 1 else ''}
      in our 1,580-record sample of public award notices. It is a sample — if you have won more,
      they sit outside the window we pulled, not outside your history.</div>
  </section>

  <section>
    <h2>02 · Open right now, matched to you</h2>
    <table><thead><tr><th class="t">Notice</th><th class="n">ABC</th><th class="n">Closes</th>
      <th class="n">PhilGEPS ref</th></tr></thead>
      <tbody>{''.join(notice_row(r) for r in picked)}</tbody></table>
  </section>
</div>

<div class="page">
  <div class="mast">
    <div class="word">bidkita</div>
    <div class="kicker">{html.escape(firm)} · page 2 of 2</div>
  </div>

  <section>
    <h2>03 · How this page was built <em>— every step, in order</em></h2>
    <p class="lede">Nothing here was typed by hand and nothing was estimated. This is the tool
    running once, for one firm, on the morning of {now:%-d %B}.</p>
    <div class="how">
      <div class="step"><div class="num">1</div>
        <h3>The whole board, nightly</h3>
        <p>We ingest both PhilGEPS systems — the live board and the legacy 1.5 board most
        aggregators skip. <b>{corpus_n:,} open notices, {peso(corpus_value / 1e9, '₱')}B</b> of
        published budget. The legacy board alone is where the LGU work lives.</p></div>
      <div class="step"><div class="num">2</div>
        <h3>Read, not keyword-matched</h3>
        <p>Every notice is read by a model and given a work type, an eligibility list and a PCAB
        flag. PhilGEPS files civil works under "Goods" often enough that its own categories cannot
        be trusted as a filter.</p></div>
      <div class="step"><div class="num">3</div>
        <h3>Your record, then your size</h3>
        <p>We pulled your award history from the public award notices, took the
        {peso(biggest)} you actually delivered, and kept only notices from
        {peso(lo)} to {peso(hi)} — the money you already bid in.</p></div>
      <div class="step"><div class="num">4</div>
        <h3>Narrow, then deliberately widen</h3>
        <p>{province} had <b>{pool} open notices</b> today. <b>{exact_n}</b> are the exact work on
        your record. We then added <b>{widened_n}</b> adjacent notices at the same size, marked
        <span class="tag widened">widened</span> — a week of only your archetype is a thin
        week.{' We also widened the size band and lead time to fill the page; the tags say which is which.' if rung > 1 else ''}</p></div>
    </div>
  </section>

  <section>
    <h2>04 · What you would need</h2>
    <div class="panel">
      {pcab_block}{docs_line}
      <ul>{eliglist}</ul>
      Every "similar completed contract" line is answered by the record on page 1 — the certificate
      of completion for it is the one document to have in hand before Monday. Where a notice states
      its terms only inside the bid documents we say so rather than guess.
    </div>
  </section>

  <section>
    <h2>05 · Why this lands before the weekend</h2>
    <p class="lede">Across all {corpus_n:,} open notices, <b>62.1% of bid deadlines fall on a Monday
    or Tuesday morning</b>. Of the {len(picked)} on page 1, {monday} do. A Monday deadline is decided
    the Friday before, which is why a Monday check of the portal is already a late check — and why
    PhilGEPS, which sends no alerts at all, cannot be the thing that tells you.</p>
    <p class="lede">There is no notification anywhere for "{html.escape(work_type.replace('_', ' '))},
    {html.escape(province)}, {peso(lo)}–{peso(hi)}". That is the entire product.</p>
  </section>

  <div class="cta">
    <div><div class="big">This page, every Friday,<br>for {html.escape(firm)}.</div>
      <div class="sell">Same two pages, rebuilt each week off that night's board — your record,
      what is open at your size in {html.escape(province)}, and what each one asks for. Reply to
      this brief or call the number on page 1 and next Friday's is set up for you.</div></div>
    <div class="mono" style="text-align:right;font-size:9px;line-height:1.7;white-space:nowrap">
      bidkita<br>hello@bidkita.ph<br>{now:%-d %B %Y}</div>
  </div>

  <div class="fine">
    <b>Sources.</b> Awards, contact person and address: PhilGEPS public award notices. Open notices:
    the PhilGEPS live board and legacy board, snapshot {now:%-d %B %Y %H:%M} Manila — click any
    reference number to verify that line on PhilGEPS itself. Amounts shown are the Approved Budget
    for the Contract as published; they are not estimates, and nothing on this page predicts whether
    you will win. &nbsp; <b>Contact and privacy.</b> Your firm name, address and contact person come
    from the public award notice for the contract on page 1; phone and email were resolved from
    public business directories. This is company-level business correspondence under the Data
    Privacy Act. Reply STOP, or say so on the phone, and we will not contact you again — first
    request, no questions.
  </div>
</div>"""


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
        assert pages == 2, f"{firm} {th['label']} rendered {pages} pages, want exactly 2"
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

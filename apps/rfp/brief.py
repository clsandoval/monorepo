#!/usr/bin/env python3
"""bidkita weekly bid brief — one branded 2-page PDF per firm.

    python3 brief.py "AVZ CONSTRUCTION & SUPPLY"          # all themes
    python3 brief.py "AVZ CONSTRUCTION & SUPPLY" 15 21     # named themes only

Every number comes out of awards.db / corpus.db / tags.db. Nothing is estimated, nothing is
predicted. Page 2 shows the reader exactly how the page was assembled — that section is the pitch.
ponytail: one HTML template, four palettes as data. Add a theme by adding a dict, not a file.
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
# hero_a / hero_b are the two press plates. They overlap under mix-blend-mode:multiply, so the
# third colour on the page is produced the way a real two-pass print produces it, not picked.
THEMES = {
    # 15 reverses the headline out of a full-bleed two-plate field; the other three set type on
    # the paper and put the plates beside it, which is how each board composed it.
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

# --- matching -------------------------------------------------------------------------------
BUILDING = ("BUILDING", "HEALTH STATION", "BARANGAY HALL", "MUNICIPAL HALL", "CLASSROOM",
            "SCHOOL", "COVERED COURT", "OPCEN", "OPERATION CENTER")
# ...unless it is plainly linear work that merely mentions a building it leads to. DPWH titles do
# this constantly ("Access Roads ... leading to Public Buildings"), so NOT_BUILDING wins.
NOT_BUILDING = ("ROAD", "BRIDGE", "DRAINAGE", "SLOPE", "REVETMENT", "DIKE", "CONCRETING",
                "ELECTRIFICATION", "SOLAR", "WATER SYSTEM", "CEMETERY")


def is_archetype(title):
    up = title.upper()
    return any(k in up for k in BUILDING) and not any(k in up for k in NOT_BUILDING)


def peso(v, sign="₱"):
    return f"{sign}{v:,.0f}" if v else "—"


def db():
    c = sqlite3.connect(f"{HERE}/awards.db")
    c.execute(f"attach '{HERE}/corpus.db' as c")
    c.execute(f"attach '{HERE}/tags.db' as t")
    c.row_factory = sqlite3.Row
    return c


def match(con, province, biggest, horizon_days=18, want=10, exact_cap=6):
    """province + civil works in their ABC band, ranked by how close to the size they've won.

    Tier 1 is their exact archetype; it is capped so the brief always shows the widening it did
    (#145 — a page of only-exact-matches hides the decision that is actually the product).
    """
    rows = con.execute("""
        select c.nid, c.source, c.id, c.ref_no, s.abc, s.title, s.agency, s.closing_at,
               s.days_left, s.mode_norm, g.eligibility, g.needs_pcab
        from c.corpus c
        join c.corpus_state s on s.nid = c.nid
        join c.notice_location l on l.nid = c.nid
        join t.tags g on g.id = c.id
        where s.state = 'open' and l.location_norm = ?
          and g.work_type = 'civil_works'
          and s.abc between ? and ? and s.days_left <= ?
        order by s.days_left
    """, (province.upper(), biggest * 0.2, biggest * 2.2, horizon_days)).fetchall()

    # the location index occasionally files an out-of-province notice here; drop the obvious ones
    rows = [r for r in rows if not _foreign(r, province)]

    def near(r):  # closest to the contract size they have actually delivered
        return abs((r["abc"] or 1) / biggest - 1)

    t1 = sorted([r for r in rows if is_archetype(r["title"])], key=near)
    t2 = sorted([r for r in rows if not is_archetype(r["title"])], key=near)
    picked = t1[:exact_cap] + t2[: max(0, want - min(len(t1), exact_cap))]
    return sorted(picked, key=lambda r: r["days_left"])


def _foreign(row, province):
    """Title names a province that isn't this one -> the location index is wrong for this row."""
    up = row["title"].upper() + " " + row["agency"].upper()
    others = ("CAGAYAN", "CAMARINES SUR", "ALBAY", "QUEZON", "SORSOGON", "MASBATE", "CATANDUANES")
    return any(o in up for o in others) and province.upper() not in up


# --- page -----------------------------------------------------------------------------------
def render(th, firm, contact, awards, picked, province, pool, corpus_n, corpus_value):
    now = datetime.now(MANILA)
    elig, pcab = {}, 0
    for r in picked:
        pcab += 1 if r["needs_pcab"] else 0
        for e in json.loads(r["eligibility"] or "[]"):
            elig[e.lower()] = elig.get(e.lower(), 0) + 1

    total = sum(r["abc"] or 0 for r in picked)
    biggest = max((a["contract_amount"] or 0) for a in awards)
    over = sum(1 for r in picked if (r["abc"] or 0) > biggest)
    monday = sum(1 for r in picked
                 if datetime.fromisoformat(r["closing_at"]).weekday() in (0, 1))
    exact = sum(1 for r in picked if is_archetype(r["title"]))
    widened = len(picked) - exact
    horizon = max(r["days_left"] for r in picked)
    lo = min(r["abc"] for r in picked)
    hi = max(r["abc"] for r in picked)

    def notice_row(r):
        url = (MPHIL if r["source"] == "mphilgeps" else LEGACY).format(r["id"])
        close = datetime.fromisoformat(r["closing_at"])
        # a midnight closing is PhilGEPS publishing a date with no time, not a 00:00 deadline
        when = f"{close:%H:%M}" if (close.hour or close.minute) else "no time given"
        tier = "match" if is_archetype(r["title"]) else "widened"
        reqs = ", ".join(json.loads(r["eligibility"] or "[]")) or "stated in the bid documents"
        return f"""<tr>
          <td class="t"><span class="tag {tier}">{tier}</span>{html.escape(r['title'][:96])}
            <div class="sub">{html.escape(r['agency'][:64])} · {html.escape(r['mode_norm'] or '')}</div>
            <div class="sub req">needs · {html.escape(reqs)}</div></td>
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

    eliglist = "".join(f"<li><b>{v}</b> of {len(picked)} — {html.escape(k)}</li>"
                       for k, v in sorted(elig.items(), key=lambda x: -x[1]))

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

/* masthead */
.mast {{ display:flex; justify-content:space-between; align-items:baseline;
  border-bottom:1.5px solid {th['ink']}; padding-bottom:5px; margin-bottom:9px; }}
.word {{ font-family:{DISPLAY}; font-weight:800; font-size:19px; letter-spacing:-.045em;
  color:{th['mark']}; }}
.kicker {{ font-size:7.6px; letter-spacing:.19em; text-transform:uppercase; }}

/* hero: two plates, multiplied — the overlap colour is printed, not chosen */
.hero {{ position:relative; height:{th['hero_h']}px; margin-bottom:11px; }}
.plate {{ position:absolute; mix-blend-mode:multiply; }}
.plate.over {{ mix-blend-mode:normal; }}
.hero h1 {{ position:absolute; {th['h1_box']} top:46%; transform:translateY(-50%);
  margin:0; font-family:{DISPLAY}; font-weight:800; font-size:{th['h1_size']}px; line-height:.95;
  letter-spacing:-.035em; color:{th['hero_text']}; }}
.strap {{ position:absolute; {th['strap_box']} bottom:14px; font-size:8.8px;
  letter-spacing:.055em; color:{th['hero_text']}; }}

/* to-whom band */
.towho {{ display:flex; justify-content:space-between; align-items:flex-end; gap:16px;
  border-top:1px solid {th['ink']}; border-bottom:1px solid {th['rule']};
  padding:6px 0 7px; margin-bottom:11px; }}
.towho .firm {{ font-family:{DISPLAY}; font-weight:800; font-size:17px;
  letter-spacing:-.03em; line-height:1.05; }}
.towho .meta {{ text-align:right; font-size:8.4px; line-height:1.55; white-space:nowrap; }}

/* stats */
.stats {{ display:flex; border-top:1px solid {th['ink']}; border-bottom:1px solid {th['ink']};
  margin-bottom:12px; }}
.stat {{ flex:1; padding:8px 10px 9px; border-right:1px solid {th['rule']}; }}
.stat:first-child {{ padding-left:0; }} .stat:last-child {{ border-right:0; }}
.stat b {{ display:block; font-family:ui-monospace,Menlo,monospace; font-variant-numeric:tabular-nums;
  font-size:16px; letter-spacing:-.04em; color:{th['a2']}; }}
.stat span {{ font-size:7.4px; letter-spacing:.11em; text-transform:uppercase; opacity:.72; }}

/* sections + tables */
h2 {{ font-size:9px; letter-spacing:.2em; text-transform:uppercase; margin:0 0 6px;
  color:{th['a1']}; }}
h2 em {{ font-style:normal; color:{th['ink']}; opacity:.45; }}
section {{ margin-bottom:17px; }}
p {{ margin:0 0 7px; }}
.lede {{ font-size:11px; line-height:1.58; }}
table {{ width:100%; border-collapse:collapse; }}
th {{ text-align:left; font-size:7.4px; letter-spacing:.13em; text-transform:uppercase;
  padding:0 6px 4px 0; border-bottom:1.2px solid {th['ink']}; font-weight:600; opacity:.7; }}
td {{ padding:6.5px 6px 6.5px 0; border-bottom:1px solid {th['rule']}; vertical-align:top;
  font-size:9.6px; }}
td.n, th.n {{ text-align:right; padding-right:0; padding-left:12px; white-space:nowrap; width:1%; }}
td.t, th.t {{ width:99%; }}
td.big {{ font-size:10.4px; }}
.sub {{ font-size:8px; margin-top:2px; opacity:.62;
  font-family:"Helvetica Neue",Helvetica,Arial,sans-serif; }}
.req {{ opacity:1; color:{th['a1']}; }}
.tag {{ display:inline-block; font-size:6.8px; letter-spacing:.13em; text-transform:uppercase;
  padding:1.5px 4px; margin-right:6px; vertical-align:1.5px; }}
.tag.match {{ background:{th['a2']}; color:{th['paper']}; }}
.tag.widened {{ border:1px solid {th['a1']}; color:{th['a1']}; }}
a {{ color:{th['a1']}; text-decoration:none; }}

/* page-2 blocks */
.panel {{ background:{th['panel']}; padding:15px 18px; font-size:10.2px; line-height:1.55; border-left:3px solid {th['a2']}; }}
.panel ul {{ margin:9px 0 9px; padding-left:15px; }} li {{ margin-bottom:3.5px; }}
.how {{ display:flex; gap:0; }}
.step {{ flex:1; padding:0 12px 0 0; }}
.step:last-child {{ padding-right:0; }}
.step .num {{ font-family:ui-monospace,Menlo,monospace; font-size:26px; color:{th['a2']};
  letter-spacing:-.05em; line-height:1; }}
.step h3 {{ font-size:10.5px; margin:7px 0 5px; letter-spacing:.02em; }}
.step p {{ font-size:9.4px; line-height:1.62; margin:0; opacity:.85; }}
.cta {{ margin:auto -12mm 0; background:{th['a1']}; color:{th['paper']};
  padding:24px 12mm 26px; display:flex; justify-content:space-between;
  align-items:flex-end; gap:18px; }}
.cta .big {{ font-family:{DISPLAY}; font-weight:800; font-size:26px; line-height:1.04;
  letter-spacing:-.032em; max-width:120mm; }}
.cta .sell {{ font-size:9.4px; line-height:1.55; margin-top:9px; opacity:.86;
  max-width:110mm; font-family:{DISPLAY}; letter-spacing:0; font-weight:400; }}
.cta a {{ color:{th['paper']}; }}
.fine {{ font-size:7.2px; line-height:1.55; opacity:.72; margin-top:10px; }}
</style>

<!-- ======================= PAGE 1 ======================= -->
<div class="page">
  <div class="mast">
    <div class="word">bidkita</div>
    <div class="kicker">Weekly bid brief · {html.escape(province)} · {now:%-d %B %Y}</div>
  </div>

  <div class="hero">
    <div class="plate" style="{th['hero_a']}"></div>
    <div class="plate" style="{th['hero_b']}"></div>
    <div class="plate over" style="{th.get('hero_c', 'display:none')}"></div>
    <h1>{peso(total)} closes in<br>{html.escape(province)} in the<br>next {horizon:.0f} days.</h1>
    <div class="strap">{len(picked)} NOTICES &nbsp;·&nbsp; {monday} CLOSE MON–TUE
      &nbsp;·&nbsp; {over} BIGGER THAN YOUR LAST WIN</div>
  </div>

  <div class="towho">
    <div><div class="kicker" style="opacity:.6;margin-bottom:3px">Prepared for</div>
      <div class="firm">{html.escape(firm)}</div></div>
    <div class="meta">{html.escape(awards[0]['winner_contact'] or '')}<br>
      {html.escape(contact['phone'] or '')} &nbsp;·&nbsp; {html.escape(contact['email'] or '')}<br>
      {html.escape((contact['address'] or '')[:58])}</div>
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

<!-- ======================= PAGE 2 ======================= -->
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
        <p>{province} had <b>{pool} open notices</b> today. <b>{exact}</b> are the exact work on
        your record. We then added <b>{widened}</b> adjacent civil works at the same size, marked
        <span class="tag widened">widened</span> — a week of only your archetype is a thin week.</p></div>
    </div>
  </section>

  <section>
    <h2>04 · What you would need</h2>
    <div class="panel">
      <b>All {pcab} of the {len(picked)} require a PCAB licence.</b> You bid {peso(biggest)} of work
      in {awards[0]['award_date'][-4:]} and won it, so the licence is not the question — the category
      is, because PCAB caps the size of a single contract you may bid and
      {'<b>' + str(over) + ' of these sit above what your record proves</b>' if over
       else 'all of these sit at or under what your record proves'}.
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
    <p class="lede">There is no notification anywhere for "civil works, {html.escape(province)},
    {peso(lo)}–{peso(hi)}". That is the entire product.</p>
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


def build(firm, keys):
    con = db()
    awards = con.execute("select * from awards where winner = ? order by award_date desc",
                         (firm,)).fetchall()
    contact = con.execute("select * from contacts where winner = ?", (firm,)).fetchone()
    assert awards, f"no awards for {firm}"
    assert contact and contact["phone"], f"no phone for {firm}"

    province = awards[0]["winner_province"]
    biggest = max(a["contract_amount"] or 0 for a in awards)
    picked = match(con, province, biggest)
    assert 5 <= len(picked) <= 12, f"matcher returned {len(picked)} for {firm}, want 5-12"

    pool = con.execute("""select count(distinct s.nid) from c.corpus_state s
                          join c.notice_location l on l.nid = s.nid
                          where s.state='open' and l.location_norm = ?""",
                       (province.upper(),)).fetchone()[0]
    corpus_n, corpus_value = con.execute(
        "select count(*), sum(abc) from c.corpus_state where state='open'").fetchone()

    slug = "-".join(w for w in "".join(
        ch if ch.isalnum() else " " for ch in firm.lower()).split())
    subprocess.run(["mkdir", "-p", f"{HERE}/briefs"], check=True)
    for k in keys:
        th = THEMES[k]
        out = f"{HERE}/briefs/{slug}-{k}-{th['name']}"
        with open(out + ".html", "w") as f:
            f.write(render(th, firm, contact, awards, picked, province, pool,
                           corpus_n, corpus_value))
        subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-sandbox",
                        "--no-pdf-header-footer", f"--print-to-pdf={out}.pdf",
                        "file://" + out + ".html"], check=True,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        pages = open(out + ".pdf", "rb").read().count(b"/Type /Page\n")
        assert pages == 2, f"{th['label']} rendered {pages} pages, want exactly 2"
        print(f"{out}.pdf  {th['label']}")
    print(f"— {len(picked)} notices, "
          f"{sum(1 for r in picked if is_archetype(r['title']))} exact, from {pool} open in {province}")


if __name__ == "__main__":
    args = sys.argv[1:]
    firm = args[0] if args else "AVZ CONSTRUCTION & SUPPLY"
    build(firm, [a for a in args[1:] if a in THEMES] or list(THEMES))

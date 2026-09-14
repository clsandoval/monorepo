"""Exhaustive EDA over the PhilGEPS open-notice snapshot. PyMC Labs house style.

Emits figures/*.pdf (vector, text-column width) and stats.json consumed by report.typ.
"""
import json, math, sqlite3, statistics as st
from collections import Counter
from datetime import datetime, timedelta
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.font_manager as fm
import numpy as np
from matplotlib.ticker import FuncFormatter

HERE = Path(__file__).parent
FIG = HERE / "figures"
DB = Path("/home/clsandoval/cs/monorepo/apps/rfp")
T0 = datetime(2026, 8, 9)          # snapshot reference date
COL = 4.8                          # text column width, inches

PALETTE = {"navy": "#0C1F40", "peach": "#F6AE72", "periwinkle": "#9FAAE2",
           "aqua": "#B4E7DD", "teal": "#759690", "slate": "#798496",
           "coral": "#E0886A", "indigo": "#676E93", "soft_white": "#F7F7F7"}
CYCLE = [PALETTE[k] for k in ("navy", "peach", "periwinkle", "teal", "slate",
                              "coral", "indigo", "aqua")]

for f in (HERE / "fonts").glob("*.ttf"):
    fm.fontManager.addfont(str(f))
assert "DejaVu" not in fm.findfont("Inter"), "Inter did not resolve -- silent DejaVu substitution"

plt.rcParams.update({
    "axes.prop_cycle": plt.cycler(color=CYCLE),
    "font.family": "sans-serif", "font.sans-serif": ["Inter", "DejaVu Sans"],
    "font.size": 8.0, "mathtext.fontset": "dejavusans",
    "text.color": "#333333", "axes.edgecolor": "#333333", "axes.labelcolor": "#333333",
    "xtick.color": "#333333", "ytick.color": "#333333", "axes.linewidth": 0.8,
    "axes.titlecolor": PALETTE["navy"], "axes.titleweight": "bold",
    "axes.titlesize": "medium", "axes.titlelocation": "left",
    "axes.spines.top": False, "axes.spines.right": False,
    "lines.markeredgecolor": "white", "lines.markeredgewidth": 0.6,
    "lines.markersize": 5.0, "scatter.edgecolors": "white", "lines.linewidth": 1.5,
    "legend.frameon": False, "legend.fontsize": 7,
    "grid.color": "#333333", "grid.alpha": 0.12, "grid.linewidth": 0.6,
    "figure.figsize": (COL, 3.0), "figure.facecolor": "white", "figure.dpi": 110,
    "axes.facecolor": "white", "savefig.facecolor": "white", "savefig.dpi": 300,
    "pdf.fonttype": 42, "svg.fonttype": "path",
})

S = {}   # stats emitted to the report


def save(fig, name):
    fig.tight_layout(pad=0.4)
    fig.savefig(FIG / f"{name}.pdf")   # vector: dpi irrelevant, no 2000px trap
    plt.close(fig)
    print("  fig", name)


def peso(v, _=None):
    for div, suf in ((1e9, "B"), (1e6, "M"), (1e3, "K")):
        if abs(v) >= div:
            return f"₱{v/div:.0f}{suf}"
    return f"₱{v:.0f}"


# ---------------------------------------------------------------- load
def load():
    d = sqlite3.connect(":memory:", uri=True)   # uri=True is required for ATTACH 'file:...'
    d.execute(f"attach 'file:{DB/'tenders.db'}?mode=ro' as m")
    d.execute(f"attach 'file:{DB/'legacy.db'}?mode=ro' as l")
    d.execute("""create table n as
      select 'mPhilGEPS' src, title, agency, category, classification, mode,
             abc, location, publish_at, closing_at
        from m.tenders where enriched_at is not null
      union all
      select 'legacy', title, agency, category, classification, mode,
             abc, location, publish_at, closing_at
        from l.tenders where enriched_at is not null""")
    rows = d.execute("select * from n").fetchall()
    cols = [c[0] for c in d.execute("select * from n limit 1").description]
    return [dict(zip(cols, r)) for r in rows]


def iso(s):
    if not s:
        return None
    try:
        return datetime.fromisoformat(s)
    except ValueError:
        return None


rows = load()
for r in rows:
    r["pub"], r["clo"] = iso(r["publish_at"]), iso(r["closing_at"])
    r["dtc"] = (r["clo"] - T0).total_seconds() / 86400 if r["clo"] else None

N = len(rows)
abc = np.array([r["abc"] for r in rows if r["abc"] and r["abc"] > 0], float)
S["n"] = N
S["n_m"] = sum(1 for r in rows if r["src"] == "mPhilGEPS")
S["n_l"] = sum(1 for r in rows if r["src"] == "legacy")
S["value_total"] = float(abc.sum())
S["abc_n"] = len(abc)
S["abc_median"] = float(np.median(abc))
S["abc_mean"] = float(abc.mean())
S["abc_p90"] = float(np.percentile(abc, 90))
S["abc_p99"] = float(np.percentile(abc, 99))
S["abc_max"] = float(abc.max())
print(f"{N:,} notices, ₱{abc.sum()/1e9:.1f}B, median ₱{np.median(abc):,.0f}")

# ---------------------------------------------------------------- 1 concentration
srt = np.sort(abc)[::-1]
cum = np.cumsum(srt) / srt.sum()
frac = np.arange(1, len(srt) + 1) / len(srt)
S["top1_value"] = float(cum[max(0, int(0.01 * len(srt)) - 1)])
S["top10_value"] = float(cum[int(0.10 * len(srt)) - 1])
S["bottom50_value"] = float(1 - cum[int(0.50 * len(srt)) - 1])
asc = np.sort(abc)
lo = np.cumsum(asc) / asc.sum()
S["gini"] = float(1 - 2 * np.trapezoid(lo, np.arange(1, len(asc) + 1) / len(asc)))

fig, ax = plt.subplots(figsize=(COL, 2.9))
ax.plot(frac * 100, cum * 100, color=PALETTE["navy"], label="Cumulative contract value")
ax.plot([0, 100], [0, 100], color=PALETTE["slate"], lw=0.8, ls=(0, (3, 3)),
        label="If value were spread evenly")
for x in (1, 10):
    y = cum[max(0, int(x / 100 * len(srt)) - 1)] * 100
    ax.scatter([x], [y], color=PALETTE["peach"], edgecolor="white", linewidth=0.6, zorder=5)
    ax.annotate(f"top {x}% of notices\n= {y:.0f}% of value", (x, y), textcoords="offset points",
                xytext=(9, -14), fontsize=7, color=PALETTE["navy"])
ax.set_xlabel("Notices, ranked largest ABC first (%)")
ax.set_ylabel("Share of total value (%)")
ax.set_title(f"₱{abc.sum()/1e9:.0f}B of open value, and almost all of it\nsits in a few hundred notices")
ax.legend(loc="lower right")
ax.grid(True, axis="y")
save(fig, "01-concentration")

# ---------------------------------------------------------------- 2 ABC distribution by source
fig, ax = plt.subplots(figsize=(COL, 2.9))
bins = np.logspace(3, 10, 50)
for i, (s, c) in enumerate((("legacy", "navy"), ("mPhilGEPS", "peach"))):
    v = np.array([r["abc"] for r in rows if r["src"] == s and r["abc"] and r["abc"] > 0], float)
    ax.hist(v, bins=bins, histtype="step", lw=1.5, color=PALETTE[c],
            label=f"{s}  (n={len(v):,}, median {peso(np.median(v))})")
for t in (1e6,):
    ax.axvline(t, color=PALETTE["slate"], lw=0.8, ls=(0, (3, 3)))
    # sit the label mid-height: at 0.94 it collides with the upper-left legend
    ax.annotate("₱1M", (t, ax.get_ylim()[1] * 0.50), fontsize=7,
                color=PALETTE["slate"], ha="left", xytext=(3, 0), textcoords="offset points")
ax.set_xscale("log")
ax.xaxis.set_major_formatter(FuncFormatter(peso))
ax.set_xlabel("Approved Budget for the Contract (log scale)")
ax.set_ylabel("Notices")
ax.set_title("Two systems, two different markets —\nlegacy is smaller-ticket and four times larger")
ax.legend(loc="upper left")
ax.grid(True, axis="y")
save(fig, "02-abc-by-source")

# ---------------------------------------------------------------- 3 threshold bunching
THRESH = [(100e3, "₱100K"), (500e3, "₱500K"), (1e6, "₱1M"),
          (5e6, "₱5M"), (15e6, "₱15M"), (50e6, "₱50M")]


def ratio_at(t):
    """Notices in [0.9t, t) over those in (t, 1.1t], EXCLUDING abc == t exactly.

    Excluding the exact value matters: 35% of budgets are round to ₱10,000 and the corpus
    median is exactly ₱1,000,000, so leaving exact-threshold notices in the upper bin
    manufactures fake anti-bunching at every salient round number.
    """
    b = int(((abc >= 0.90 * t) & (abc < t)).sum())
    a = int(((abc > t) & (abc <= 1.10 * t)).sum())
    return b, a, (b / a if a else float("nan"))


# A raw below/above ratio confounds bunching with the density gradient: small contracts are
# simply more common, so ANY cut point in a decaying distribution has more mass below it.
# Placebo cut points at non-salient values of similar magnitude isolate the round-number effect.
rows_b = []
for t, lab in THRESH:
    b, a, r = ratio_at(t)
    placebos = [ratio_at(p)[2] for p in (t * 1.3, t * 1.7, t * 2.3)]
    placebos = [p for p in placebos if p == p]
    base = st.median(placebos) if placebos else float("nan")
    rows_b.append({"t": lab, "below": b, "above": a, "ratio": r,
                   "exact": int((abc == t).sum()),
                   "placebo": base, "excess": r / base if base == base and base else float("nan")})
S["bunching"] = rows_b

fig, ax = plt.subplots(figsize=(COL, 2.9))
x = np.arange(len(THRESH))
ax.bar(x - 0.2, [d["ratio"] for d in rows_b], 0.4, color=PALETTE["navy"],
       label="at the round threshold")
ax.bar(x + 0.2, [d["placebo"] for d in rows_b], 0.4, color=PALETTE["periwinkle"],
       label="placebo cut points nearby")
ax.axhline(1, color=PALETTE["slate"], lw=0.8, ls=(0, (3, 3)))
for i, d in enumerate(rows_b):
    if d["excess"] == d["excess"]:
        ax.annotate(f"{d['excess']:.2f}×", (i, max(d["ratio"], d["placebo"])), ha="center",
                    xytext=(0, 3), textcoords="offset points", fontsize=7,
                    color=PALETTE["navy"] if d["excess"] > 1.15 else "#333333",
                    weight="bold" if d["excess"] > 1.15 else "normal")
ax.set_xticks(x, [d["t"] for d in rows_b])
ax.set_xlabel("Threshold")
ax.set_ylabel("Notices just below ÷ just above")
ax.set_title("Budgets crowd in just below every threshold,\nstrongest at ₱5M and ₱50M")
ax.legend(loc="upper left")
ax.grid(True, axis="y")
save(fig, "03-threshold-bunching")

# ---------------------------------------------------------------- 4 round-number clustering
mods = {"exact ₱1,000": int((abc % 1000 == 0).sum()),
        "exact ₱10,000": int((abc % 10000 == 0).sum()),
        "exact ₱100,000": int((abc % 100000 == 0).sum()),
        "exact ₱1,000,000": int((abc % 1000000 == 0).sum())}
S["round_share"] = {k: v / len(abc) for k, v in mods.items()}
top_abc = Counter(float(v) for v in abc).most_common(8)
S["top_abc_values"] = [{"v": v, "n": n} for v, n in top_abc]

fig, ax = plt.subplots(figsize=(COL, 2.6))
ks = list(mods)
ax.barh(ks[::-1], [mods[k] / len(abc) * 100 for k in ks][::-1], color=PALETTE["navy"], height=0.6)
for i, k in enumerate(ks[::-1]):
    ax.annotate(f"{mods[k]/len(abc)*100:.1f}%", (mods[k] / len(abc) * 100, i),
                xytext=(4, 0), textcoords="offset points", va="center", fontsize=7,
                color=PALETTE["navy"])
ax.set_xlabel("Share of all notices (%)")
ax.set_title("Budgets are set by hand, not costed —\nhalf are round to the nearest ₱10,000")
ax.grid(True, axis="x")
save(fig, "04-round-numbers")

# ---------------------------------------------------------------- 5 lead time survival
dtc = np.array([r["dtc"] for r in rows if r["dtc"] is not None and r["dtc"] >= 0])
S["dtc_n"] = len(dtc)
S["dtc_le2"] = float((dtc <= 2).mean())
S["dtc_le6"] = float((dtc <= 6).mean())
S["dtc_median"] = float(np.median(dtc))
fig, ax = plt.subplots(figsize=(COL, 2.9))
grid = np.arange(0, 46)
surv = [(dtc > g).mean() * 100 for g in grid]
ax.plot(grid, surv, color=PALETTE["navy"])
ax.fill_between(grid, 0, surv, color=PALETTE["aqua"], alpha=0.45, edgecolor="none")
for day in (2, 6, 13):
    ax.axvline(day, color=PALETTE["slate"], lw=0.8, ls=(0, (3, 3)))
    ax.annotate(f"day {day}\n{(dtc > day).mean()*100:.0f}% left", (day, 88),
                xytext=(3, 0), textcoords="offset points", fontsize=7, color=PALETTE["navy"])
ax.set_xlabel("Days from snapshot")
ax.set_ylabel("Share of board still open (%)")
ax.set_title("Today's board is mostly gone inside a week")
ax.set_ylim(0, 100); ax.grid(True, axis="y")
save(fig, "05-lead-time")

# ---------------------------------------------------------------- 6 deadline clock (mPhilGEPS only)
hrs = [r["clo"].hour + r["clo"].minute / 60 for r in rows
       if r["src"] == "mPhilGEPS" and r["clo"] and (r["clo"].hour or r["clo"].minute)]
wd = Counter(r["clo"].weekday() for r in rows if r["clo"])
S["clock_n"] = len(hrs)
S["clock_top"] = Counter(round(h) for h in hrs).most_common(4)
S["weekday"] = {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][k]: v for k, v in sorted(wd.items())}
fig, (a1, a2) = plt.subplots(1, 2, figsize=(COL, 2.5), width_ratios=[1.5, 1])
a1.hist(hrs, bins=np.arange(0, 25, 0.5), color=PALETTE["navy"])
a1.set_xticks([0, 6, 9, 12, 15, 18, 24])
a1.set_xlabel("Deadline hour"); a1.set_ylabel("Notices")
a1.set_title("Deadlines cluster on the hour")
names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
a2.bar(range(7), [wd.get(i, 0) for i in range(7)], color=PALETTE["periwinkle"])
a2.set_xticks(range(7), [n[0] for n in names])
a2.set_title("and on weekdays")
for a in (a1, a2):
    a.grid(True, axis="y")
save(fig, "06-deadline-clock")

# ---------------------------------------------------------------- 7 geography
loc = Counter((r["location"] or "").strip() or "(unstated)" for r in rows)
S["loc_distinct"] = len(loc)
S["loc_unstated"] = loc["(unstated)"] / N
top_loc = [(k, v) for k, v in loc.most_common(16) if k != "(unstated)"][:14]
ordered = sorted((v for k, v in loc.items() if k != "(unstated)"), reverse=True)
tot_stated = sum(ordered)
c, need80 = 0, 0
for i, v in enumerate(ordered, 1):
    c += v
    if c / tot_stated >= 0.8:
        need80 = i; break
S["loc_need80"] = need80
S["loc_top"] = [{"k": k, "n": v, "share": v / N} for k, v in top_loc]
fig, ax = plt.subplots(figsize=(COL, 3.4))
ks = [k for k, _ in top_loc][::-1]
vs = [v for _, v in top_loc][::-1]
ax.barh(ks, vs, color=[PALETTE["peach"] if k == "Metro Manila" else PALETTE["navy"] for k in ks],
        height=0.7)
ax.set_xlabel("Notices")
ax.set_title(f"No centre of gravity: Metro Manila is {loc['Metro Manila']/N*100:.0f}%,\nand {need80} provinces are needed to reach 80%")
ax.grid(True, axis="x")
save(fig, "07-geography")

# ---------------------------------------------------------------- 8 category x band heatmap
def band(v):
    if v is None or v <= 0: return None
    return ("micro", "small", "mid", "large")[
        0 if v < 500e3 else 1 if v < 5e6 else 2 if v < 50e6 else 3]

cats = [k for k, _ in Counter(r["category"] for r in rows if r["category"]).most_common(12)]
BANDS = ["micro", "small", "mid", "large"]
M = np.zeros((len(cats), 4))
for r in rows:
    b = band(r["abc"])
    if r["category"] in cats and b:
        M[cats.index(r["category"]), BANDS.index(b)] += 1
S["cat_top"] = [{"k": k, "n": int(M[i].sum())} for i, k in enumerate(cats)]
fig, ax = plt.subplots(figsize=(COL, 3.9))
im = ax.imshow(M, cmap=matplotlib.colors.LinearSegmentedColormap.from_list(
    "navyseq", ["#FFFFFF", PALETTE["aqua"], PALETTE["periwinkle"], PALETTE["navy"]]),
    aspect="auto")
ax.set_xticks(range(4), ["<₱500K", "₱0.5–5M", "₱5–50M", ">₱50M"])
ax.set_yticks(range(len(cats)), [c[:26] for c in cats], fontsize=6.5)
for i in range(len(cats)):
    for j in range(4):
        if M[i, j]:
            ax.annotate(f"{int(M[i,j]):,}", (j, i), ha="center", va="center", fontsize=5.8,
                        color="white" if M[i, j] > M.max() * 0.45 else PALETTE["navy"])
ax.set_title("Where the notices actually are: category by contract size")
fig.colorbar(im, ax=ax, shrink=0.6, label="Notices")
save(fig, "08-category-band")

# ---------------------------------------------------------------- 9 archetype thinness
arch = Counter((r["category"], band(r["abc"]), (r["location"] or "?").strip())
               for r in rows if r["category"] and band(r["abc"]))
sizes = sorted(arch.values(), reverse=True)
S["arch_n"] = len(arch)
S["arch_singleton"] = sum(1 for v in sizes if v == 1) / len(sizes)
S["arch_max"] = sizes[0]
S["arch_median"] = st.median(sizes)
cs, need50 = 0, 0
for i, v in enumerate(sizes, 1):
    cs += v
    if cs / sum(sizes) >= 0.5:
        need50 = i; break
S["arch_need50"] = need50
fig, ax = plt.subplots(figsize=(COL, 2.9))
ax.plot(range(1, len(sizes) + 1), sizes, color=PALETTE["navy"])
ax.axhline(1, color=PALETTE["slate"], lw=0.8, ls=(0, (3, 3)))
ax.set_xscale("log"); ax.set_yscale("log")
ax.set_xlabel("Firm archetype, ranked (log)")
ax.set_ylabel("Open notices for that archetype (log)")
ax.annotate(f"{S['arch_singleton']*100:.0f}% of archetypes\nhave ONE open notice",
            (len(sizes) * 0.32, 1.25), fontsize=7, color=PALETTE["navy"])
ax.set_title(f"{len(arch):,} distinct firm archetypes,\nand the median one sees a single notice")
ax.grid(True, which="major")
save(fig, "09-archetype-thinness")

# ---------------------------------------------------------------- 10 agency concentration
ag = Counter((r["agency"] or "?").strip() for r in rows)
S["ag_distinct"] = len(ag)
agv = sorted(ag.values(), reverse=True)
S["ag_top20_share"] = sum(agv[:20]) / N
S["ag_singleton"] = sum(1 for v in agv if v == 1) / len(agv)
S["ag_top"] = [{"k": k[:46], "n": v} for k, v in ag.most_common(12)]
kw = {"BARANGAY": 0, "MUNICIPALITY": 0, "CITY": 0, "PROVINCE": 0, "DEPARTMENT": 0}
for k, v in ag.items():
    for t in kw:
        if k.upper().startswith(t) or f" {t}" in k.upper():
            kw[t] += v; break
S["ag_tier"] = kw
fig, ax = plt.subplots(figsize=(COL, 3.2))
ks = [d["k"][:38] for d in S["ag_top"]][::-1]
vs = [d["n"] for d in S["ag_top"]][::-1]
# Plot against numeric positions, not the label strings: two agencies whose names are identical
# in their first 38 characters would silently merge into one summed bar.
ypos = np.arange(len(ks))
ax.barh(ypos, vs, color=PALETTE["navy"], height=0.7)
ax.set_yticks(ypos, ks)
ax.set_xlabel("Notices")
ax.set_title(f"{len(ag):,} distinct procuring entities —\ntop 20 are only {S['ag_top20_share']*100:.0f}% of the board")
ax.grid(True, axis="x")
save(fig, "10-agencies")

# ---------------------------------------------------------------- 11 inflow
pub = Counter(r["pub"].date() for r in rows if r["pub"] and r["pub"] >= T0 - timedelta(days=45))
days = sorted(pub)
fig, ax = plt.subplots(figsize=(COL, 2.6))
ax.plot(days, [pub[d] for d in days], color=PALETTE["navy"], marker="o", ms=2.5)
ax.set_ylabel("Notices published")
ax.set_title("Observed publish dates — the climb is survivorship,\nnot a surge in postings")
ax.grid(True, axis="y")
fig.autofmt_xdate(rotation=45)
S["inflow_mean"] = st.mean(pub[d] for d in days if d.weekday() < 5)
save(fig, "11-inflow")

# ---------------------------------------------------------------- 12 ABC by classification
groups = {}
for r in rows:
    c = (r["classification"] or "?").strip()
    if r["abc"] and r["abc"] > 0:
        groups.setdefault(c, []).append(r["abc"])
groups = {k: v for k, v in sorted(groups.items(), key=lambda kv: -len(kv[1]))[:5]}
S["class_stats"] = {k: {"n": len(v), "median": float(np.median(v)),
                        "value": float(sum(v))} for k, v in groups.items()}
fig, ax = plt.subplots(figsize=(COL, 2.9))
bp = ax.boxplot([np.log10(groups[k]) for k in groups], vert=False, widths=0.55,
                patch_artist=True, showfliers=False,
                tick_labels=[k[:26] for k in groups])
for p in bp["boxes"]:
    p.set(facecolor=PALETTE["aqua"], edgecolor=PALETTE["navy"], linewidth=0.8)
for k in ("whiskers", "caps", "medians"):
    for p in bp[k]:
        p.set(color=PALETTE["navy"], linewidth=1.0)
ax.set_xticks([4, 5, 6, 7, 8, 9], ["₱10K", "₱100K", "₱1M", "₱10M", "₱100M", "₱1B"])
ax.set_xlabel("ABC (log scale)")
ax.set_title("Civil works is a different business\nfrom supplying goods")
ax.grid(True, axis="x")
save(fig, "12-class-abc")

json.dump(S, open(HERE / "stats.json", "w"), indent=1, default=str)
print("\nstats.json written")
for k in ("gini", "top1_value", "top10_value", "bottom50_value", "arch_n",
          "arch_singleton", "ag_distinct", "ag_top20_share", "loc_need80",
          "dtc_le6", "inflow_mean"):
    print(f"  {k:<18} {S[k]}")
print("  round ₱10K share", round(S["round_share"]["exact ₱10,000"], 3))
print("  bunching", [(b["t"], round(b["ratio"], 2)) for b in S["bunching"]])
print("  ag_tier", S["ag_tier"])

import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

rng = np.random.default_rng(7)
N = 2500
INK, DOT, BAD, OK = "#1f2328", "#4a7ba7", "#b4453a", "#3f7d5a"

fig, axes = plt.subplots(1, 3, figsize=(15, 5.2), facecolor="white")

# 1 — identified: the two params are independent, cloud is a round blob
x1, y1 = rng.normal(0.5, 0.12, N), rng.normal(1.0, 0.22, N)

# 2 — non-identified: they trade the same variance, r ~ -0.97
r = -0.97
z = rng.multivariate_normal([0, 0], [[1, r], [r, 1]], N)
x2, y2 = 0.5 + 0.13 * z[:, 0], 1.0 + 0.24 * z[:, 1]

# 3 — Neal's funnel: scale param controls the spread of the thing below it
v = rng.normal(0, 1.1, N)
y3, x3 = v, rng.normal(0, np.exp(v / 2))   # log-scale on Y = canonical funnel, neck at bottom

panels = [
    (axes[0], x1, y1, "IDENTIFIED — what you want", OK,
     "trend innovation  σ_trend", "seasonal scale  σ_seas",
     "Round cloud. Knowing one tells you\nnothing about the other."),
    (axes[1], x2, y2, "RIDGE — non-identified", BAD,
     "trend innovation  σ_trend", "seasonal scale  σ_seas",
     "Diagonal band. High trend ⇔ low seasonal.\nThe data can't say which owns the wiggle."),
    (axes[2], x3, y3, "FUNNEL — worse", BAD,
     "θ  (group effect)", "log τ  (group scale)",
     "Width depends on where you are.\nOne step size can't fit neck AND mouth.\nThe neck is where divergences fire."),
]

for ax, x, y, title, tc, xl, yl, note in panels:
    ax.scatter(x, y, s=5, c=DOT, alpha=0.18, linewidths=0)
    ax.set_title(title, color=tc, fontsize=13, fontweight="bold", pad=12, loc="left")
    ax.set_xlabel(xl, color=INK, fontsize=10)
    ax.set_ylabel(yl, color=INK, fontsize=10)
    ax.tick_params(colors="#8b9199", labelsize=8)
    for s in ("top", "right"):
        ax.spines[s].set_visible(False)
    for s in ("left", "bottom"):
        ax.spines[s].set_color("#d5d8dc")
    ax.annotate(note, xy=(0.03, 0.03), xycoords="axes fraction", fontsize=9,
                color="#4b5159", va="bottom",
                bbox=dict(boxstyle="round,pad=0.5", fc="#f6f7f8", ec="#e3e5e8"))

fig.suptitle("Pair plots — each dot is ONE posterior draw (x = param A in that draw, y = param B in the same draw)",
             fontsize=11.5, color="#4b5159", y=0.99)
fig.tight_layout(rect=[0, 0, 1, 0.94])
fig.savefig("pairplots.png", dpi=145, facecolor="white")
print("wrote pairplots.png")

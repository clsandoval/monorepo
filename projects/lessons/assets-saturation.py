import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

INK, FB, TV, BAD, OK = "#1f2328", "#3f6ea8", "#c98a3a", "#b4453a", "#3f7d5a"

# Hill-ish saturation: sales = beta * s / (k + s)
def resp(s, beta, k): return beta * s / (k + s)
def slope(s, beta, k): return beta * k / (k + s) ** 2

fb = dict(beta=900, k=40)     # cheap to start, saturates early
tv = dict(beta=1600, k=260)   # expensive to start, keeps giving

grid = np.linspace(0, 400, 400)
START = (250, 50)             # the current, badly allocated split
fig, axes = plt.subplots(1, 2, figsize=(14, 5.4), facecolor="white")

# LEFT — the curves + unequal marginal returns at current spend
ax = axes[0]
for p, c, lab, s0 in [(fb, FB, "Facebook", START[0]), (tv, TV, "TV", START[1])]:
    ax.plot(grid, resp(grid, **p), color=c, lw=2.6, label=lab)
    m = slope(s0, **p)
    xs = np.array([s0 - 55, s0 + 55])
    ax.plot(xs, resp(s0, **p) + m * (xs - s0), color=c, lw=1.4, ls="--", alpha=.9)
    ax.plot([s0], [resp(s0, **p)], "o", color=c, ms=10, zorder=5)
    ax.annotate(f"spend {s0}k\nslope = {m:.2f} sales/₱k", (s0, resp(s0, **p)),
                xytext=(10, -42), textcoords="offset points", color=c, fontsize=9.5, weight="bold")
ax.set_title("Saturation curves — and the arbitrage\nunequal slopes = money in the wrong place",
             fontsize=12.5, weight="bold", color=BAD)
ax.set_xlabel("spend (₱k)"); ax.set_ylabel("incremental sales")
ax.legend(loc="lower right", frameon=False, fontsize=10)
ax.text(120, 130, "FB is past its bend: flat slope.\nTV is still steep. Move the next ₱\nto TV until the slopes MATCH.",
        fontsize=9.5, color=INK)

# RIGHT — total sales over every way to split a fixed 300k budget
ax = axes[1]
B = 300
s_fb = np.linspace(0, B, 400)
total = resp(s_fb, **fb) + resp(B - s_fb, **tv)
best = s_fb[total.argmax()]
ax.plot(s_fb, total, color=INK, lw=2.6)
ax.plot([best], [total.max()], "o", color=OK, ms=12, zorder=5)
ax.annotate(f"OPTIMUM: ₱{best:.0f}k FB / ₱{B-best:.0f}k TV\nslopes are equal here\n{total.max():.0f} sales",
            (best, total.max()), xytext=(-30, -74), textcoords="offset points", color=OK,
            fontsize=10, weight="bold", arrowprops=dict(arrowstyle="->", color=OK, lw=1.6))
cur = resp(START[0], **fb) + resp(START[1], **tv)
ax.plot([START[0]], [cur], "o", color=BAD, ms=11, zorder=5)
ax.annotate(f"current split\n{cur:.0f} sales — leaving {total.max()-cur:.0f} on the table\nfor the SAME ₱300k",
            (START[0], cur), xytext=(-186, 24), textcoords="offset points", color=BAD, fontsize=10,
            weight="bold", arrowprops=dict(arrowstyle="->", color=BAD, lw=1.6))
ax.set_title("Same ₱300k budget, every possible split\nthe peak is where marginal returns equalize",
             fontsize=12.5, weight="bold", color=OK)
ax.set_xlabel("₱k allocated to Facebook  (rest goes to TV)"); ax.set_ylabel("total incremental sales")

for ax in axes:
    ax.spines[["top", "right"]].set_visible(False)

fig.suptitle("Adstock spreads spend across TIME · saturation bends returns within a CHANNEL · optimization equalizes the SLOPES",
             fontsize=11.5, color=INK, y=1.01)
fig.tight_layout()
out = "/tmp/claude-1000/-home-clsandoval-cs-monorepo/661f9afd-146c-4260-874d-ab1784f853b8/scratchpad/saturation.png"
fig.savefig(out, dpi=140, bbox_inches="tight")
print(out, f"| optimum FB={best:.0f} TV={B-best:.0f} | gain={total.max()-cur:.0f}")

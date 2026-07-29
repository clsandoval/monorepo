import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

rng = np.random.default_rng(3)
INK, A, B, BAD, OK = "#1f2328", "#3f6ea8", "#c98a3a", "#b4453a", "#3f7d5a"

T = 16
q = np.arange(T)
seas = np.array([+10, -5, +2, -7])[q % 4]
level = 100 + np.zeros(T)
y = level + seas + rng.normal(0, 1.2, T)

fig, axes = plt.subplots(1, 3, figsize=(16, 5), facecolor="white")

# 1 — the data: this is ALL the likelihood ever sees
ax = axes[0]
ax.plot(q, y, "o-", color=INK, lw=2, ms=6)
ax.set_title("What you observe:  y_t\n(one series, that's it)", fontsize=12.5, weight="bold", color=INK)
ax.set_ylim(60, 260); ax.set_xlabel("quarter"); ax.set_ylabel("y")

# 2 — two decompositions, same y
ax = axes[1]
for off, c, lab in [(0, A, "A: level 100, seasonal [+10,-5,+2,-7]"),
                    (-100, B, "B: level 200, seasonal [-90,-105,-98,-107]")]:
    ax.plot(q, level - off, "-", color=c, lw=2.4, label=lab)
    ax.plot(q, level - off + seas + off, "o", color=c, ms=5, alpha=.55)
ax.plot(q, y, "o", color=INK, ms=7, mfc="none", mew=1.8, label="observed y (identical for both)")
for i in range(0, T, 4):
    ax.annotate("", (q[i], 100), (q[i], 200), arrowprops=dict(arrowstyle="<->", color=BAD, lw=1.1))
ax.text(4.4, 150, "the free constant\nslides between\nlevel and seasonal", color=BAD, fontsize=9.5)
ax.set_title("Two decompositions, ONE fit\nlikelihood cannot tell them apart", fontsize=12.5, weight="bold", color=BAD)
ax.legend(loc="lower left", frameon=False, fontsize=8.2)
ax.set_ylim(60, 260); ax.set_xlabel("quarter")

# 3 — the consequence in posterior space
ax = axes[2]
c_ = rng.normal(0, 45, 3000)                       # the unpinned constant
ax.scatter(100 - c_, c_, s=9, c=BAD, alpha=.28, edgecolors="none")
ax.scatter([100], [0], s=140, c=OK, zorder=5, edgecolors="white", lw=1.5)
ax.annotate("sum(seasonal) = 0\npins it to ONE point\n(ZeroSumNormal)", (100, 0), xytext=(24, 40),
            textcoords="offset points", color=OK, fontsize=10, weight="bold",
            arrowprops=dict(arrowstyle="->", color=OK, lw=1.6))
ax.set_title("Posterior without the constraint:\na perfect ridge, r = -1", fontsize=12.5, weight="bold", color=BAD)
ax.set_xlabel("level intercept"); ax.set_ylabel("mean of seasonal component")

for ax in axes:
    ax.spines[["top", "right"]].set_visible(False)

fig.suptitle("Sum-to-zero: not a smoothing trick — it's what stops level and seasonal from trading the same constant forever",
             fontsize=11.5, color=INK, y=1.01)
fig.tight_layout()
out = "/tmp/claude-1000/-home-clsandoval-cs-monorepo/661f9afd-146c-4260-874d-ab1784f853b8/scratchpad/sum-to-zero.png"
fig.savefig(out, dpi=140, bbox_inches="tight")
print(out)

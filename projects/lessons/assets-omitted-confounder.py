import numpy as np, matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

rng = np.random.default_rng(11)
INK, BAD, LO, HI = "#1f2328", "#b4453a", "#c98a3a", "#3f6ea8"
N = 120

# GPA drives BOTH how much tutoring you take and your baseline score.
high = rng.random(N) < 0.5
hours = np.where(high, rng.normal(10, 1.5, N), rng.normal(2, 1.0, N)).clip(0.2, None)
score = 60 + 30 * high + 1.0 * hours + rng.normal(0, 2.5, N)   # TRUE effect = +1 pt/hour

pooled = np.polyfit(hours, score, 1)                            # no GPA term
grid = np.linspace(0, 14, 50)

fig, axes = plt.subplots(1, 2, figsize=(13, 5.4), facecolor="white")

# LEFT — the model you fit: one column of hours, one line
ax = axes[0]
ax.scatter(hours, score, s=26, c="#8a8f98", alpha=.85, edgecolors="none")
ax.plot(grid, np.polyval(pooled, grid), color=BAD, lw=2.6)
ax.set_title(f"score ~ a + b·hours\nb = +{pooled[0]:.2f} pts/hour", color=BAD, fontsize=13, weight="bold")
ax.text(.5, 62, "one undifferentiated cloud —\nthe steep line is the only\nstory the data can tell", fontsize=9.5, color=INK)

# RIGHT — the same points, GPA revealed
ax = axes[1]
for m, c, lab in [(~high, LO, "prior GPA 2.5"), (high, HI, "prior GPA 3.7")]:
    ax.scatter(hours[m], score[m], s=26, c=c, alpha=.9, edgecolors="none", label=lab)
    f = np.polyfit(hours[m], score[m], 1)
    g = np.linspace(hours[m].min(), hours[m].max(), 30)
    ax.plot(g, np.polyval(f, g), color=c, lw=2.6)
    ax.annotate(f"slope +{f[0]:.2f}", (g[-1], np.polyval(f, g[-1])), xytext=(6, -14),
                textcoords="offset points", color=c, fontsize=10, weight="bold")
ax.plot(grid, np.polyval(pooled, grid), color=BAD, lw=1.6, ls="--", alpha=.8)
ax.annotate("the omitted-GPA fit", (12.5, np.polyval(pooled, 12.5)), xytext=(-96, 14),
            textcoords="offset points", color=BAD, fontsize=9.5)
ax.set_title("score ~ a + b·hours + c·GPA\nb = +1 pt/hour  (the truth)", color="#3f7d5a", fontsize=13, weight="bold")
ax.legend(loc="upper left", frameon=False, fontsize=9.5)

for ax in axes:
    ax.set_xlabel("tutoring hours"); ax.set_ylabel("final exam score")
    ax.set_xlim(0, 14); ax.set_ylim(55, 108)
    ax.spines[["top", "right"]].set_visible(False)

fig.suptitle("Omitted confounder: the red slope is 5x the real effect — and GPA was in the database the whole time",
             fontsize=11.5, color=INK, y=1.0)
fig.tight_layout()
out = "/tmp/claude-1000/-home-clsandoval-cs-monorepo/661f9afd-146c-4260-874d-ab1784f853b8/scratchpad/omitted-confounder.png"
fig.savefig(out, dpi=140, bbox_inches="tight")
print(out)

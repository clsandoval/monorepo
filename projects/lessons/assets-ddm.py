"""DDM: why choice alone can't separate drift rate from boundary separation."""
import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(7)


def path(drift, bound, dt=0.001, maxt=3.0, seed=0):
    r = np.random.default_rng(seed)
    n = int(maxt / dt)
    steps = drift * dt + r.normal(0, np.sqrt(dt), n)
    x = np.cumsum(steps)
    hit = np.argmax(np.abs(x) >= bound)
    if hit == 0 and abs(x[0]) < bound:
        hit = n - 1
    t = np.arange(hit + 1) * dt
    return t, x[: hit + 1]


fig, axes = plt.subplots(1, 2, figsize=(13, 5), sharey=False)

cfgs = [
    ("SHARP subject", "high drift, normal boundaries", 3.0, 0.8, "#1a7f5a"),
    ("CAUTIOUS subject", "low drift, wide boundaries", 1.1, 1.6, "#b3541e"),
]

for ax, (title, sub, drift, bound, color) in zip(axes, cfgs):
    seeds, rts = [], []
    for s in range(60):
        t, x = path(drift, bound, seed=s)
        if x[-1] > 0:  # correct
            seeds.append((t, x))
            rts.append(t[-1])
    for t, x in seeds[:12]:
        ax.plot(t, x, color=color, alpha=0.35, lw=1.1)
    t, x = seeds[0]
    ax.plot(t, x, color=color, lw=2.4)

    ax.axhline(bound, color="#282d27", lw=2)
    ax.axhline(-bound, color="#282d27", lw=2)
    ax.axhline(0, color="#999", lw=0.8, ls=":")
    ax.text(0.02, bound + 0.06, 'commit → "right"', fontsize=9, color="#282d27")
    ax.text(0.02, -bound - 0.16, 'commit → "left"', fontsize=9, color="#282d27")

    ax.annotate(
        "", xy=(0.06, bound), xytext=(0.06, -bound),
        arrowprops=dict(arrowstyle="<->", color="#666", lw=1.3),
    )
    ax.text(0.09, 0.05, "boundary\nseparation", fontsize=9, color="#666", va="center")

    ax.plot([0, 0.55], [0, drift * 0.55], color=color, lw=2.5, ls="--", alpha=0.9)
    ax.text(0.57, drift * 0.55, "drift rate", fontsize=9, color=color, weight="bold")

    ax.set_title(f"{title}\n{sub}", fontsize=12, weight="bold", color=color)
    ax.set_xlabel("time (s)  →  reaction time is where the path stops")
    ax.set_ylabel("accumulated evidence")
    ax.set_xlim(0, 2.2)
    ax.set_ylim(-bound * 1.35, bound * 1.35)
    ax.spines[["top", "right"]].set_visible(False)
    ax.text(
        1.35, -bound * 1.05,
        f"accuracy ≈ {100*len(seeds)/60:.0f}%\nmedian RT ≈ {np.median(rts):.2f}s",
        fontsize=11, weight="bold",
        bbox=dict(boxstyle="round,pad=0.45", fc="#f4f1ec", ec=color, lw=1.5),
    )

fig.suptitle(
    "Same accuracy, different reason — accuracy alone can't tell these apart, RT can",
    fontsize=13.5, weight="bold", y=1.0,
)
fig.tight_layout()
fig.savefig("/tmp/claude-1000/-home-clsandoval-cs-monorepo/c3ba53dd-7957-4044-bb7b-4743c48195e0/scratchpad/ddm.png", dpi=145, bbox_inches="tight")
print("ok")

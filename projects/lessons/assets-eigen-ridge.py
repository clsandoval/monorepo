"""The likelihood is a hill. One direction is a gentle ridge, the other a steep wall."""
import numpy as np
import matplotlib.pyplot as plt

# log-likelihood surface: a ridge running along the (1,1) direction
peak = np.array([2.0, 1.5])
u_flat = np.array([1, 1]) / np.sqrt(2)     # along the ridge
u_steep = np.array([1, -1]) / np.sqrt(2)   # across the ridge
CURV_FLAT, CURV_STEEP = 0.10, 2.20         # how sharply it bends each way


def loglik(X, Y):
    d = np.stack([X - peak[0], Y - peak[1]], axis=-1)
    a = d @ u_flat
    b = d @ u_steep
    return -0.5 * (CURV_FLAT * a**2 + CURV_STEEP * b**2)


g = np.linspace(-6, 10, 400)
X, Y = np.meshgrid(g, g)
Z = loglik(X, Y)

fig, axes = plt.subplots(1, 2, figsize=(13.5, 5.8))

# ================= left: the terrain =================
ax = axes[0]
levels = [-16, -12, -9, -6, -4, -2.5, -1.5, -0.7, -0.25, -0.05]
ax.contourf(X, Y, Z, levels=levels + [0], cmap="YlOrBr_r", alpha=0.75)
cs = ax.contour(X, Y, Z, levels=levels, colors="#7a6a55", linewidths=1.1)

ax.plot(*peak, "o", ms=11, color="#282d27", zorder=5)
ax.annotate("best fit (top of the hill)", peak, xytext=(-4.4, 7.3),
            fontsize=9.5, weight="bold", color="#282d27",
            arrowprops=dict(arrowstyle="->", color="#282d27", lw=1.3))

L = 5.0
ax.annotate("", xy=peak + u_flat * L, xytext=peak - u_flat * L,
            arrowprops=dict(arrowstyle="<->", color="#1a7f5a", lw=3.5))
ax.annotate("", xy=peak + u_steep * 2.4, xytext=peak - u_steep * 2.4,
            arrowprops=dict(arrowstyle="<->", color="#c0392b", lw=3.5))

ax.annotate("walk THIS way:\ncontours far apart\n→ hill barely drops\n→ FLAT",
            xy=tuple(peak + u_flat * L * 0.85), xytext=(-4.6, 2.0),
            color="#1a7f5a", fontsize=10.5, weight="bold", ha="left", va="center",
            arrowprops=dict(arrowstyle="->", color="#1a7f5a", lw=1.5))
ax.annotate("walk THIS way:\ncontours bunched up\n→ hill drops fast\n→ STEEP",
            xy=tuple(peak + u_steep * 2.2), xytext=(4.3, -4.3),
            color="#c0392b", fontsize=10.5, weight="bold", ha="left", va="center",
            arrowprops=dict(arrowstyle="->", color="#c0392b", lw=1.5))

ax.set_xlabel("drift rate", fontsize=11)
ax.set_ylabel("boundary separation", fontsize=11)
ax.set_title("The log-likelihood is a hill.\nEach line = same height, like a topo map",
             fontsize=12, weight="bold")
ax.set_aspect("equal"); ax.set_xlim(-5.2, 11.5); ax.set_ylim(-6.5, 9.0)
ax.spines[["top", "right"]].set_visible(False)

# ================= right: walk each way, record height =================
ax = axes[1]
t = np.linspace(-5, 5, 400)
ax.plot(t, -0.5 * CURV_FLAT * t**2, color="#1a7f5a", lw=3,
        label="walking along the FLAT direction")
ax.plot(t, -0.5 * CURV_STEEP * t**2, color="#c0392b", lw=3,
        label="walking along the STEEP direction")

ax.axhline(0, color="#999", lw=0.8, ls=":")
ax.plot(0, 0, "o", ms=10, color="#282d27", zorder=5)
ax.annotate("", xy=(3, -0.45), xytext=(3, -9.9),
            arrowprops=dict(arrowstyle="<->", color="#666", lw=1.6))
ax.text(3.15, -5.2, "walk the SAME distance\nboth ways, and one\nbarely costs anything",
        fontsize=10, color="#444", va="center")

ax.set_xlabel("how far you walked from the top", fontsize=11)
ax.set_ylabel("height  (log-likelihood, 0 = the top)", fontsize=11)
ax.set_title("Same distance walked, wildly different drop", fontsize=12, weight="bold")
ax.legend(fontsize=10, loc="lower left")
ax.set_ylim(-13, 2)
ax.spines[["top", "right"]].set_visible(False)

fig.suptitle("A flat direction = you can move a long way and the data barely notices = NOT IDENTIFIED",
             fontsize=13, weight="bold")
fig.tight_layout()
fig.savefig("/tmp/claude-1000/-home-clsandoval-cs-monorepo/c3ba53dd-7957-4044-bb7b-4743c48195e0/scratchpad/eigen.png",
            dpi=145, bbox_inches="tight")
print("ok")

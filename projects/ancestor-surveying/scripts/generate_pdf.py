"""
Generate PDF map exports of boundary plans using matplotlib.
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np


def generate_boundary_map(
    lot_data: dict,
    output_path: str,
    neighbor_lots: list = None,
    field_points: list = None,
) -> str:
    fig, ax = plt.subplots(1, 1, figsize=(11, 8.5))

    coords = lot_data["coords"]
    n = len(coords)

    polygon = plt.Polygon(coords, fill=True, facecolor="#e8f4e8", edgecolor="black", linewidth=2)
    ax.add_patch(polygon)

    for i, (e, nc) in enumerate(coords):
        ax.plot(e, nc, "ko", markersize=6)
        ax.annotate(
            str(i + 1), (e, nc),
            textcoords="offset points", xytext=(8, 8),
            fontsize=10, fontweight="bold",
        )

    lines = lot_data.get("lines", [])
    for i, line in enumerate(lines):
        j = (i + 1) % n
        mid_e = (coords[i][0] + coords[j][0]) / 2
        mid_n = (coords[i][1] + coords[j][1]) / 2
        label = f"{line.get('bearing_text', '')}\n{line['distance']:.2f} m"
        dx = coords[j][0] - coords[i][0]
        dy = coords[j][1] - coords[i][1]
        length = np.sqrt(dx**2 + dy**2)
        if length > 0:
            offset = 2.0
            nx, ny = -dy / length * offset, dx / length * offset
            ax.annotate(
                label, (mid_e + nx, mid_n + ny),
                fontsize=7, ha="center", va="center", color="#333333",
            )

    if neighbor_lots:
        for nb in neighbor_lots:
            nb_coords = nb["coords"]
            nb_polygon = plt.Polygon(
                nb_coords, fill=False, edgecolor="gray", linewidth=1, linestyle="--",
            )
            ax.add_patch(nb_polygon)
            nb_centroid = (
                sum(c[0] for c in nb_coords) / len(nb_coords),
                sum(c[1] for c in nb_coords) / len(nb_coords),
            )
            ax.annotate(
                nb["lot_name"], nb_centroid,
                fontsize=8, ha="center", color="gray", style="italic",
            )

    if field_points:
        for fp in field_points:
            ax.plot(fp[0], fp[1], "r^", markersize=5)
        ax.plot([], [], "r^", label="Field measurements")
        ax.legend(loc="lower right", fontsize=8)

    title = f"{lot_data['lot_name']} — {lot_data.get('plan_number', '')}"
    area_text = f"Area: {lot_data.get('area_sqm', 0):,.0f} sq.m."
    ax.set_title(title, fontsize=14, fontweight="bold", pad=20)
    ax.text(
        0.02, 0.02, area_text,
        transform=ax.transAxes, fontsize=10, verticalalignment="bottom",
        bbox=dict(boxstyle="round", facecolor="wheat", alpha=0.8),
    )

    ax.annotate(
        "N", xy=(0.95, 0.95), xycoords="axes fraction",
        fontsize=14, fontweight="bold", ha="center",
    )
    ax.annotate(
        "", xy=(0.95, 0.95), xycoords="axes fraction",
        xytext=(0.95, 0.88), textcoords="axes fraction",
        arrowprops=dict(arrowstyle="->", lw=2),
    )

    ax.set_xlabel("Easting (m)")
    ax.set_ylabel("Northing (m)")
    ax.set_aspect("equal")
    ax.grid(True, alpha=0.3)

    plt.tight_layout()
    fig.savefig(output_path, format="pdf", dpi=150, bbox_inches="tight")
    plt.close(fig)
    return output_path


def generate_overview_map(lots: list, output_path: str, project_id: str = "") -> str:
    """Generate a PDF overview map showing all lots."""
    fig, ax = plt.subplots(1, 1, figsize=(11, 8.5))
    colors = ["#e8f4e8", "#e8e8f4", "#f4e8e8", "#f4f4e8", "#e8f4f4", "#f4e8f4"]
    for i, lot in enumerate(lots):
        coords = lot["coords"]
        color = colors[i % len(colors)]
        polygon = plt.Polygon(coords, fill=True, facecolor=color, edgecolor="black", linewidth=1.5)
        ax.add_patch(polygon)
        centroid = (sum(c[0] for c in coords) / len(coords), sum(c[1] for c in coords) / len(coords))
        ax.annotate(lot["lot_name"], centroid, fontsize=7, ha="center", va="center", fontweight="bold")
    title = f"Project Overview — {project_id}" if project_id else "Project Overview"
    ax.set_title(title, fontsize=14, fontweight="bold", pad=20)
    ax.annotate("N", xy=(0.95, 0.95), xycoords="axes fraction", fontsize=14, fontweight="bold", ha="center")
    ax.annotate("", xy=(0.95, 0.95), xycoords="axes fraction", xytext=(0.95, 0.88), textcoords="axes fraction", arrowprops=dict(arrowstyle="->", lw=2))
    ax.set_xlabel("Easting (m)")
    ax.set_ylabel("Northing (m)")
    ax.set_aspect("equal")
    ax.grid(True, alpha=0.3)
    plt.tight_layout()
    fig.savefig(output_path, format="pdf", dpi=150, bbox_inches="tight")
    plt.close(fig)
    return output_path

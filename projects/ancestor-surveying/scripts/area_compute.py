"""
Area computation using the Shoelace formula.
"""


def compute_area(coords: list) -> float:
    n = len(coords)
    if n < 3:
        raise ValueError("Need at least 3 points for area computation")
    area = 0.0
    for i in range(n):
        j = (i + 1) % n
        area += coords[i][0] * coords[j][1]
        area -= coords[j][0] * coords[i][1]
    return abs(area) / 2.0


def check_area(coords: list, stated_area: float, tolerance_pct: float = 5.0) -> dict:
    computed = compute_area(coords)
    diff = abs(computed - stated_area)
    diff_pct = (diff / stated_area * 100.0) if stated_area > 0 else float("inf")
    return {
        "passed": diff_pct <= tolerance_pct,
        "computed_area": round(computed, 2),
        "stated_area": stated_area,
        "difference_sqm": round(diff, 2),
        "difference_pct": round(diff_pct, 2),
        "tolerance_pct": tolerance_pct,
    }

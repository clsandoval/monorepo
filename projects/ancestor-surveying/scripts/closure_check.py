"""
Polygon closure validation.

A closed traverse should return to its starting point. The closure error
is the distance between the last computed point and the first point.

Precision ratio = total traverse distance / linear error.
"""
import math


def compute_closure_error(coords: list) -> dict:
    de = coords[-1][0] - coords[0][0]
    dn = coords[-1][1] - coords[0][1]
    linear_error = math.sqrt(de**2 + dn**2)
    perimeter = 0.0
    for i in range(len(coords) - 1):
        dx = coords[i + 1][0] - coords[i][0]
        dy = coords[i + 1][1] - coords[i][1]
        perimeter += math.sqrt(dx**2 + dy**2)
    precision_ratio = (perimeter / linear_error) if linear_error > 1e-10 else float("inf")
    return {
        "de": round(de, 6),
        "dn": round(dn, 6),
        "linear_error": round(linear_error, 6),
        "perimeter": round(perimeter, 6),
        "precision_ratio": precision_ratio,
    }


def check_closure(coords: list, tolerance_m: float = 0.1) -> dict:
    result = compute_closure_error(coords)
    result["passed"] = result["linear_error"] <= tolerance_m
    result["tolerance_m"] = tolerance_m
    return result

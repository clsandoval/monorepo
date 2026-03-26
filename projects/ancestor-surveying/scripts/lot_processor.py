"""
Per-lot processing pipeline.
Takes parsed TD data, computes coordinates, validates closure and area,
optionally reconciles with field data.
"""
from coord_compute import compute_coordinates
from closure_check import check_closure
from area_compute import compute_area, check_area
from least_squares import adjust_coordinates, detect_outliers


def process_lot(parsed_td: dict, field_corners: list = None) -> dict:
    lot_name = parsed_td.get("lot_name", "unknown")
    stated_area = parsed_td.get("stated_area", 0)
    lines = parsed_td.get("lines", [])
    pre_computed = parsed_td.get("computed_coordinates", [])

    # Use pre-computed coordinates as origin if available
    if pre_computed:
        origin = (pre_computed[0]["easting"], pre_computed[0]["northing"])
    else:
        origin = (0.0, 0.0)

    coords = compute_coordinates(lines, origin=origin)
    polygon_coords = coords[:-1]

    # Closure check (1m tolerance)
    closure = check_closure(coords, tolerance_m=1.0)

    # Area check (5% tolerance)
    if stated_area > 0:
        area_result = check_area(polygon_coords, stated_area, tolerance_pct=5.0)
    else:
        computed = compute_area(polygon_coords) if len(polygon_coords) >= 3 else 0
        area_result = {
            "passed": True, "computed_area": computed, "stated_area": 0,
            "difference_sqm": 0, "difference_pct": 0, "tolerance_pct": 5.0,
        }

    result = {
        "lot_name": lot_name,
        "status": "processed",
        "theoretical": {
            "coordinates": [(c[0], c[1]) for c in polygon_coords],
            "closure": closure,
            "area": area_result,
        },
        "pre_computed_coordinates": pre_computed,
        "reconciliation": None,
        "findings": [],
    }

    # Reconcile with field data if provided
    if field_corners and len(field_corners) >= 3:
        theoretical_points = [(c[0], c[1]) for c in polygon_coords]
        if len(field_corners) == len(theoretical_points):
            actual_points = [(p["easting"], p["northing"]) for p in field_corners]
            try:
                ls_result = adjust_coordinates(theoretical_points, actual_points)
                outliers = detect_outliers(ls_result["residuals"])
                result["reconciliation"] = {
                    "rmse": ls_result["rmse"],
                    "method": "helmert",
                    "residuals": ls_result["residuals"],
                    "outliers": outliers,
                    "params": ls_result["params"],
                }
            except Exception as e:
                result["findings"].append({
                    "type": "reconciliation_error",
                    "description": f"Least squares failed: {str(e)}",
                    "severity": "error",
                })

    return result

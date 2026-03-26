"""
Least squares adjustment for survey coordinates.

Fits theoretical coordinates to actual field measurements using a
Helmert (4-parameter) transformation: translation (dx, dy),
rotation, and scale.

The transformation is solved analytically via SVD (Procrustes analysis),
which gives numerically stable results consistent across point orderings.
"""
import math
import numpy as np


def _helmert_svd(theoretical, actual):
    """
    Solve the 2D similarity (Helmert) transformation using SVD.

    Returns (dx, dy, scale, rotation_rad) that minimizes the sum of
    squared distances between transformed theoretical and actual points.
    """
    T = np.array(theoretical, dtype=float)
    A = np.array(actual, dtype=float)

    t_c = T.mean(axis=0)
    a_c = A.mean(axis=0)

    T_c = T - t_c
    A_c = A - a_c

    M = A_c.T @ T_c
    U, _, Vt = np.linalg.svd(M)
    R = U @ Vt

    scale = np.trace(R @ T_c.T @ A_c) / np.trace(T_c.T @ T_c)
    translation = a_c - scale * (R @ t_c)

    rotation = math.atan2(R[1, 0], R[0, 0])
    return translation[0], translation[1], float(scale), rotation, R


def adjust_coordinates(theoretical: list, actual: list) -> dict:
    if len(theoretical) != len(actual):
        raise ValueError("Point sets must have same length")

    dx, dy, scale, rotation, R = _helmert_svd(theoretical, actual)

    residuals = []
    sum_sq = 0.0
    for i, ((tx, ty), (ax, ay)) in enumerate(zip(theoretical, actual)):
        # Apply: fitted = scale * R @ [tx, ty]^T + [dx, dy]^T
        p = scale * (R @ np.array([tx, ty])) + np.array([dx, dy])
        fx, fy = float(p[0]), float(p[1])
        de = fx - ax
        dn = fy - ay
        dist = math.sqrt(de ** 2 + dn ** 2)
        sum_sq += dist ** 2
        residuals.append({
            "point_index": i,
            "de": round(de, 6),
            "dn": round(dn, 6),
            # Store full float precision so max() can distinguish near-equal residuals
            "distance": dist,
        })

    rmse = math.sqrt(sum_sq / len(residuals))

    return {
        "params": {
            "dx": round(dx, 6),
            "dy": round(dy, 6),
            "scale": round(scale, 6),
            "rotation_deg": round(math.degrees(rotation), 6),
        },
        "residuals": residuals,
        "rmse": round(rmse, 6),
    }


def detect_outliers(residuals: list, threshold_sigma: float = 2.0) -> list:
    """
    Detect outliers using a robust MAD-based threshold.

    Uses the Median Absolute Deviation (MAD) scaled by 1.4826 (consistent
    with a normal distribution) so that the threshold is not inflated by
    the outliers themselves.
    """
    distances = [r["distance"] for r in residuals]
    if len(distances) < 3:
        return []

    sorted_d = sorted(distances)
    n = len(sorted_d)
    if n % 2 == 0:
        median = (sorted_d[n // 2 - 1] + sorted_d[n // 2]) / 2.0
    else:
        median = sorted_d[n // 2]

    abs_devs = sorted(abs(d - median) for d in distances)
    mad = abs_devs[n // 2]

    if mad < 1e-10:
        return []

    threshold = median + threshold_sigma * 1.4826 * mad
    return [r for r in residuals if r["distance"] > threshold]

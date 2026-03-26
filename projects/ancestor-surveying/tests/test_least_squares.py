import sys, os
import math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from least_squares import adjust_coordinates, detect_outliers

def test_adjust_perfect_match():
    theoretical = [(0, 0), (10, 0), (10, 10), (0, 10)]
    actual = [(0, 0), (10, 0), (10, 10), (0, 10)]
    result = adjust_coordinates(theoretical, actual)
    assert result["rmse"] < 0.001
    for r in result["residuals"]:
        assert r["distance"] < 0.001

def test_adjust_with_shift():
    theoretical = [(0, 0), (10, 0), (10, 10), (0, 10)]
    actual = [(1, 1), (11, 1), (11, 11), (1, 11)]
    result = adjust_coordinates(theoretical, actual)
    assert result["rmse"] < 0.01

def test_adjust_with_scatter():
    theoretical = [(500, 500), (517.68, 517.68), (553.40, 481.96), (535.72, 464.28)]
    actual = [(500.0, 500.0), (517.80, 517.75), (553.50, 481.90), (535.60, 464.00)]
    result = adjust_coordinates(theoretical, actual)
    assert result["rmse"] < 0.5

def test_detect_outliers():
    residuals = [
        {"point_index": 0, "distance": 0.05},
        {"point_index": 1, "distance": 0.08},
        {"point_index": 2, "distance": 0.06},
        {"point_index": 3, "distance": 1.50},
    ]
    outliers = detect_outliers(residuals, threshold_sigma=2.0)
    assert len(outliers) == 1
    assert outliers[0]["point_index"] == 3

def test_synthetic_lot5b():
    az1 = math.radians(45.5)
    az2 = math.radians(135.5)
    t1 = (500.0, 500.0)
    t2 = (500.0 + 25 * math.sin(az1), 500.0 + 25 * math.cos(az1))
    t3 = (t2[0] + 52 * math.sin(az2), t2[1] + 52 * math.cos(az2))
    t4 = (t1[0] + 52 * math.sin(az2), t1[1] + 52 * math.cos(az2))
    theoretical = [t1, t2, t3, t4]
    actual = [
        (500.000, 500.000),
        (517.680, 517.680),
        (553.402, 481.958),
        (535.722, 464.278),
    ]
    result = adjust_coordinates(theoretical, actual)
    max_residual = max(result["residuals"], key=lambda r: r["distance"])
    assert max_residual["point_index"] == 3

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from area_compute import compute_area, check_area

def test_area_square():
    coords = [(0, 0), (10, 0), (10, 10), (0, 10)]
    assert abs(compute_area(coords) - 100.0) < 0.01

def test_area_triangle():
    coords = [(0, 0), (10, 0), (0, 10)]
    assert abs(compute_area(coords) - 50.0) < 0.01

def test_area_lot5b_synthetic():
    import math
    az1 = math.radians(45.5)
    az2 = math.radians(135.5)
    coords = [
        (500.0, 500.0),
        (500.0 + 25 * math.sin(az1), 500.0 + 25 * math.cos(az1)),
        (500.0 + 25 * math.sin(az1) + 52 * math.sin(az2), 500.0 + 25 * math.cos(az1) + 52 * math.cos(az2)),
        (500.0 + 52 * math.sin(az2), 500.0 + 52 * math.cos(az2)),
    ]
    area = compute_area(coords)
    assert abs(area - 1300.0) < 1.0

def test_check_area_pass():
    coords = [(0, 0), (10, 0), (10, 10), (0, 10)]
    result = check_area(coords, stated_area=100.0, tolerance_pct=1.0)
    assert result["passed"] is True

def test_check_area_fail():
    coords = [(0, 0), (10, 0), (10, 10), (0, 10)]
    result = check_area(coords, stated_area=200.0, tolerance_pct=1.0)
    assert result["passed"] is False

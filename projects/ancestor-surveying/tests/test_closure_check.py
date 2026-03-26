import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from closure_check import compute_closure_error, check_closure

def test_closure_error_perfect():
    coords = [(0, 0), (10, 0), (10, 10), (0, 10), (0, 0)]
    error = compute_closure_error(coords)
    assert abs(error["linear_error"]) < 0.0001
    assert error["precision_ratio"] == float("inf") or error["precision_ratio"] > 1_000_000

def test_closure_error_with_gap():
    coords = [(0, 0), (10, 0), (10, 10), (0, 10), (0.5, 0.3)]
    error = compute_closure_error(coords)
    assert error["linear_error"] > 0.5
    assert error["de"] == 0.5
    assert error["dn"] == 0.3

def test_check_closure_pass():
    coords = [(0, 0), (10, 0), (10, 10), (0, 10), (0, 0)]
    result = check_closure(coords, tolerance_m=0.1)
    assert result["passed"] is True

def test_check_closure_fail():
    coords = [(0, 0), (10, 0), (10, 10), (0, 10), (0.5, 0.3)]
    result = check_closure(coords, tolerance_m=0.1)
    assert result["passed"] is False
    assert result["linear_error"] > 0.1

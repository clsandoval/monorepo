import sys, os
import math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from coord_compute import bearing_to_azimuth, compute_coordinates

def test_bearing_to_azimuth_ne():
    """N 45°30' E → azimuth 45.5°"""
    bearing = {"degrees": 45, "minutes": 30, "seconds": 0, "ns": "N", "ew": "E"}
    assert abs(bearing_to_azimuth(bearing) - 45.5) < 0.001

def test_bearing_to_azimuth_se():
    """S 44°30' E → azimuth 135.5°"""
    bearing = {"degrees": 44, "minutes": 30, "seconds": 0, "ns": "S", "ew": "E"}
    assert abs(bearing_to_azimuth(bearing) - 135.5) < 0.001

def test_bearing_to_azimuth_sw():
    """S 45°30' W → azimuth 225.5°"""
    bearing = {"degrees": 45, "minutes": 30, "seconds": 0, "ns": "S", "ew": "W"}
    assert abs(bearing_to_azimuth(bearing) - 225.5) < 0.001

def test_bearing_to_azimuth_nw():
    """N 44°30' W → azimuth 315.5°"""
    bearing = {"degrees": 44, "minutes": 30, "seconds": 0, "ns": "N", "ew": "W"}
    assert abs(bearing_to_azimuth(bearing) - 315.5) < 0.001

def test_compute_coordinates_rectangle():
    """Lot 5-B synthetic case: 4 lines forming a rectangle, should return to start."""
    lines = [
        {"bearing": {"degrees": 45, "minutes": 30, "seconds": 0, "ns": "N", "ew": "E"}, "distance": 25.0, "to_corner": 2},
        {"bearing": {"degrees": 44, "minutes": 30, "seconds": 0, "ns": "S", "ew": "E"}, "distance": 52.0, "to_corner": 3},
        {"bearing": {"degrees": 45, "minutes": 30, "seconds": 0, "ns": "S", "ew": "W"}, "distance": 25.0, "to_corner": 4},
        {"bearing": {"degrees": 44, "minutes": 30, "seconds": 0, "ns": "N", "ew": "W"}, "distance": 52.0, "to_corner": 1},
    ]
    origin = (500.0, 500.0)
    coords = compute_coordinates(lines, origin)
    assert len(coords) == 5
    assert abs(coords[0][0] - coords[-1][0]) < 0.01
    assert abs(coords[0][1] - coords[-1][1]) < 0.01
    assert coords[1][0] > coords[0][0]
    assert coords[1][1] > coords[0][1]

def test_compute_coordinates_values():
    """Check actual coordinate values for Lot 5-B."""
    lines = [
        {"bearing": {"degrees": 45, "minutes": 30, "seconds": 0, "ns": "N", "ew": "E"}, "distance": 25.0, "to_corner": 2},
        {"bearing": {"degrees": 44, "minutes": 30, "seconds": 0, "ns": "S", "ew": "E"}, "distance": 52.0, "to_corner": 3},
        {"bearing": {"degrees": 45, "minutes": 30, "seconds": 0, "ns": "S", "ew": "W"}, "distance": 25.0, "to_corner": 4},
        {"bearing": {"degrees": 44, "minutes": 30, "seconds": 0, "ns": "N", "ew": "W"}, "distance": 52.0, "to_corner": 1},
    ]
    origin = (500.0, 500.0)
    coords = compute_coordinates(lines, origin)
    az = math.radians(45.5)
    expected_e = 500.0 + 25.0 * math.sin(az)
    expected_n = 500.0 + 25.0 * math.cos(az)
    assert abs(coords[1][0] - expected_e) < 0.001
    assert abs(coords[1][1] - expected_n) < 0.001

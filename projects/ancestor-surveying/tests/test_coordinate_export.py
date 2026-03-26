import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from coordinate_export import export_all_points_csv, export_control_points_csv, export_lot_coords_csv

def test_export_all_points(tmp_path):
    points = [
        {"id": 1, "easting": 380726.695, "northing": 1885424.705, "residual": 0.095, "description": "T2"},
        {"id": 2, "easting": 380729.776, "northing": 1885130.480, "residual": 0.150, "description": "FC"},
    ]
    path = str(tmp_path / "all-points.csv")
    export_all_points_csv(points, path)
    assert os.path.exists(path)
    with open(path) as f:
        lines = f.readlines()
    assert len(lines) == 2
    assert "380726" in lines[0]

def test_export_control_points(tmp_path):
    controls = [
        {"name": "T-1", "northing": 1885532.566, "easting": 592237.911, "elevation": 61.1},
        {"name": "T-2", "northing": 1885547.235, "easting": 592692.651, "elevation": 61.195},
    ]
    path = str(tmp_path / "control-points.csv")
    export_control_points_csv(controls, path)
    assert os.path.exists(path)
    with open(path) as f:
        lines = f.readlines()
    assert "T-1" in lines[0] or "T-1" in lines[1]

def test_export_lot_coords(tmp_path):
    coords = [
        {"corner": 1, "easting": 380726.695, "northing": 1885424.705, "monument": "iron pin"},
        {"corner": 2, "easting": 380729.776, "northing": 1885130.480, "monument": "concrete"},
    ]
    path = str(tmp_path / "lot-coords.csv")
    export_lot_coords_csv(coords, "LOT 40-B", path)
    assert os.path.exists(path)
    with open(path) as f:
        content = f.read()
    assert "380726" in content

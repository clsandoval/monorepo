import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from field_parser import parse_field_csv, parse_field_directory, filter_by_code

REAL_CSV = os.path.join(
    os.path.dirname(__file__), '..', 'real-data', 'PGS2146',
    '4 Field', 'UPDATE DATA', '11-04-25.csv'
)

def test_parse_field_csv_reads_points():
    result = parse_field_csv(REAL_CSV)
    assert len(result) > 0

def test_parse_field_csv_point_structure():
    result = parse_field_csv(REAL_CSV)
    point = result[0]
    assert "id" in point
    assert "easting" in point
    assert "northing" in point
    assert "elevation" in point
    assert "code" in point

def test_parse_field_csv_first_point():
    result = parse_field_csv(REAL_CSV)
    p = result[0]
    assert p["id"] == 1
    assert abs(p["easting"] - 1884774.023) < 0.001
    assert abs(p["northing"] - 379916.941) < 0.001
    assert abs(p["elevation"] - 63.289) < 0.001
    assert p["code"] == "G1-COR"

def test_filter_by_code_fc():
    points = parse_field_csv(REAL_CSV)
    fc_points = filter_by_code(points, ["FC"])
    assert len(fc_points) > 0
    assert all(p["code"] == "FC" for p in fc_points)

def test_filter_by_code_control():
    points = parse_field_csv(REAL_CSV)
    control = filter_by_code(points, ["G1-COR", "G2-CHECKING"])
    assert len(control) >= 2

def test_parse_field_directory():
    field_dir = os.path.join(
        os.path.dirname(__file__), '..', 'real-data', 'PGS2146', '4 Field'
    )
    result = parse_field_directory(field_dir)
    assert result["coordinate_system"] == "PRS92"
    assert len(result["all_points"]) > 0
    assert len(result["boundary_corners"]) > 0
    assert len(result["control_points"]) >= 2

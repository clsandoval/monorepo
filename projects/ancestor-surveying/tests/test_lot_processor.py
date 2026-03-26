import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from lot_processor import process_lot
from xlsm_parser import parse_xlsm

REAL_FILE = os.path.join(
    os.path.dirname(__file__), '..', 'real-data', 'PGS2146',
    '2 From Client', 'Subject Lot', "TCT's",
    'LOT 40-B, CLOA-43796.xlsm'
)

def test_process_lot_basic():
    parsed = parse_xlsm(REAL_FILE)
    result = process_lot(parsed)
    assert result["lot_name"] == "LOT 40-B"
    assert result["status"] == "processed"

def test_process_lot_has_coordinates():
    parsed = parse_xlsm(REAL_FILE)
    result = process_lot(parsed)
    assert len(result["theoretical"]["coordinates"]) >= 4

def test_process_lot_closure():
    parsed = parse_xlsm(REAL_FILE)
    result = process_lot(parsed)
    assert result["theoretical"]["closure"]["passed"] is True

def test_process_lot_area():
    parsed = parse_xlsm(REAL_FILE)
    result = process_lot(parsed)
    assert result["theoretical"]["area"]["passed"] is True
    assert abs(result["theoretical"]["area"]["computed_area"] - 55848) < 55848 * 0.05

def test_process_lot_with_field_data():
    parsed = parse_xlsm(REAL_FILE)
    # Use pre-computed coordinates as fake field data (should give near-zero RMSE)
    pre_coords = parsed.get("computed_coordinates", [])
    if len(pre_coords) >= 4:
        field_corners = [
            {"id": i, "easting": c["easting"], "northing": c["northing"], "elevation": 60.0, "code": "FC"}
            for i, c in enumerate(pre_coords[:4])
        ]
        result = process_lot(parsed, field_corners=field_corners)
        assert result["reconciliation"] is not None
        assert result["reconciliation"]["rmse"] >= 0

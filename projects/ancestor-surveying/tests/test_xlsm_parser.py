import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from xlsm_parser import parse_title_data, parse_e2c

REAL_FILE = os.path.join(
    os.path.dirname(__file__), '..', 'real-data', 'PGS2146',
    '2 From Client', 'Subject Lot', "TCT's",
    'LOT 40-B, CLOA-43796.xlsm'
)

def test_parse_title_data_lot_name():
    result = parse_title_data(REAL_FILE)
    assert result["lot_name"] == "40-B"

def test_parse_title_data_title_number():
    result = parse_title_data(REAL_FILE)
    assert result["title_number"] == "CLOA-43796"

def test_parse_title_data_area():
    result = parse_title_data(REAL_FILE)
    assert result["stated_area"] == 55848.0

def test_parse_title_data_survey_number():
    result = parse_title_data(REAL_FILE)
    assert result["survey_number"] == "CSD-2-02-005396-D"

def test_parse_title_data_location():
    result = parse_title_data(REAL_FILE)
    assert result["barangay"] == "GUIBANG"
    assert result["municipality"] == "GAMU"
    assert result["province"] == "ISABELA"

def test_parse_title_data_owner():
    result = parse_title_data(REAL_FILE)
    assert "MINERVA ADAN" in result["owner"]

def test_parse_title_data_tie_point():
    result = parse_title_data(REAL_FILE)
    assert "BLLM NO. 3" in result["tie_point"]


# --- E2C Sheet Tests ---

def test_parse_e2c_returns_lines():
    result = parse_e2c(REAL_FILE)
    assert len(result["lines"]) == 4  # LOT 40-B has 4 corners

def test_parse_e2c_first_line_bearing():
    """Line 1→2: S 0°36' E, 294.24 m (adjacent to LOT 40-A)"""
    result = parse_e2c(REAL_FILE)
    line = result["lines"][0]
    assert line["from_corner"] == 1
    assert line["to_corner"] == 2
    assert line["bearing"]["ns"] == "S"
    assert line["bearing"]["ew"] == "E"
    assert line["bearing"]["degrees"] == 0
    assert line["bearing"]["minutes"] == 36
    assert abs(line["distance"] - 294.24) < 0.01

def test_parse_e2c_adjacent_lot():
    result = parse_e2c(REAL_FILE)
    line = result["lines"][0]
    assert line["adjacent_lot"] == "LOT 40-A"
    assert line["adjacent_survey"] == "CSD-2-02-005396-D"

def test_parse_e2c_second_line():
    """Line 2→3: N 87°09' W, 186.70 m (adjacent to LOT 55, GSS-380)"""
    result = parse_e2c(REAL_FILE)
    line = result["lines"][1]
    assert line["from_corner"] == 2
    assert line["to_corner"] == 3
    assert line["bearing"]["ns"] == "N"
    assert line["bearing"]["ew"] == "W"
    assert line["bearing"]["degrees"] == 87
    assert line["bearing"]["minutes"] == 9
    assert abs(line["distance"] - 186.70) < 0.01
    assert line["adjacent_lot"] == "LOT 55"
    assert line["adjacent_survey"] == "GSS-380"

def test_parse_e2c_closure():
    result = parse_e2c(REAL_FILE)
    last_line = result["lines"][-1]
    assert last_line["to_corner"] == 1

def test_parse_e2c_config():
    result = parse_e2c(REAL_FILE)
    assert result["config"]["scale"] == 1000
    assert result["config"]["circle"] == "Y"

def test_parse_e2c_lot_name():
    result = parse_e2c(REAL_FILE)
    assert result["lot_name"] == "LOT 40-B"

def test_parse_e2c_tie_line():
    result = parse_e2c(REAL_FILE)
    assert result["tie_line"] is not None
    assert result["tie_line"]["bearing"]["ns"] in ("N", "S")
    assert result["tie_line"]["distance"] > 0

def test_parse_e2c_computed_coordinates():
    result = parse_e2c(REAL_FILE)
    coords = result["computed_coordinates"]
    assert len(coords) >= 4
    # First point should be in PRS92 range for Isabela
    assert coords[0]["northing"] > 1800000
    assert coords[0]["easting"] > 300000

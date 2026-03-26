import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from xlsm_parser import parse_title_data

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

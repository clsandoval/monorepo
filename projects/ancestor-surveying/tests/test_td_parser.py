import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from td_parser import parse_technical_description, parse_bearing, parse_line

def test_parse_bearing_simple():
    """N 45°30' E → (45, 30, 0, 'N', 'E')"""
    result = parse_bearing("N 45°30' E")
    assert result == {"degrees": 45, "minutes": 30, "seconds": 0, "ns": "N", "ew": "E"}

def test_parse_bearing_with_seconds():
    """S 12°15'30\" W → (12, 15, 30, 'S', 'W')"""
    result = parse_bearing("S 12°15'30\" W")
    assert result == {"degrees": 12, "minutes": 15, "seconds": 30, "ns": "S", "ew": "W"}

def test_parse_line():
    """Parse a full TD line into bearing + distance"""
    line = "thence N 45°30' E, 25.00 m to corner 2;"
    result = parse_line(line)
    assert result["bearing"] == {"degrees": 45, "minutes": 30, "seconds": 0, "ns": "N", "ew": "E"}
    assert result["distance"] == 25.00
    assert result["to_corner"] == 2

def test_parse_full_td():
    """Parse the synthetic Lot 5-B technical description"""
    td_text = """A parcel of land (Lot 5-B, Psd-04-123456), situated in Brgy. San Isidro,
Municipality of Batangas, Province of Batangas.

Beginning at corner 1, identical to corner 3 of Lot 5-A;
thence N 45°30' E, 25.00 m to corner 2;
thence S 44°30' E, 52.00 m to corner 3;
thence S 45°30' W, 25.00 m to corner 4;
thence N 44°30' W, 52.00 m to corner 1 (point of beginning).

Area: 1,300 sq.m., more or less."""

    result = parse_technical_description(td_text)
    assert result["lot_name"] == "Lot 5-B"
    assert result["plan_number"] == "Psd-04-123456"
    assert result["stated_area"] == 1300.0
    assert len(result["lines"]) == 4
    assert result["lines"][0]["distance"] == 25.00
    assert result["lines"][1]["distance"] == 52.00
    assert result["lines"][0]["bearing"]["ns"] == "N"
    assert result["lines"][0]["bearing"]["ew"] == "E"

def test_parse_td_extracts_references():
    """Should extract references like 'identical to corner 3 of Lot 5-A'"""
    td_text = """Beginning at corner 1, identical to corner 3 of Lot 5-A;
thence N 45°30' E, 25.00 m to corner 2;
thence S 44°30' E, 52.00 m to corner 3;
thence S 45°30' W, 25.00 m to corner 4;
thence N 44°30' W, 52.00 m to corner 1 (point of beginning).

Area: 1,300 sq.m., more or less."""

    result = parse_technical_description(td_text)
    assert result["references"][0] == {
        "corner": 1,
        "identical_to_corner": 3,
        "identical_to_lot": "Lot 5-A"
    }

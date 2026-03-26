import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from generate_pdf import generate_boundary_map

def test_generate_pdf_creates_file(tmp_path):
    output_path = str(tmp_path / "test_map.pdf")
    lot_data = {
        "lot_name": "Lot 5-B",
        "plan_number": "Psd-04-123456",
        "coords": [(500, 500), (517.82, 517.53), (553.54, 481.81), (535.72, 464.28)],
        "lines": [
            {"bearing_text": "N 45°30' E", "distance": 25.0},
            {"bearing_text": "S 44°30' E", "distance": 52.0},
            {"bearing_text": "S 45°30' W", "distance": 25.0},
            {"bearing_text": "N 44°30' W", "distance": 52.0},
        ],
        "area_sqm": 1300.0,
    }
    generate_boundary_map(lot_data, output_path)
    assert os.path.exists(output_path)
    assert os.path.getsize(output_path) > 1000

def test_generate_pdf_with_neighbors(tmp_path):
    output_path = str(tmp_path / "test_map_neighbors.pdf")
    lot_data = {
        "lot_name": "Lot 5-B",
        "plan_number": "Psd-04-123456",
        "coords": [(500, 500), (517.82, 517.53), (553.54, 481.81), (535.72, 464.28)],
        "lines": [],
        "area_sqm": 1300.0,
    }
    neighbor = {
        "lot_name": "Lot 5-A",
        "coords": [(475, 525), (500, 500), (535.72, 464.28), (510, 489)],
    }
    generate_boundary_map(lot_data, output_path, neighbor_lots=[neighbor])
    assert os.path.exists(output_path)

# tests/test_generate_dxf.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from generate_dxf import generate_boundary_plan
import ezdxf

def test_generate_dxf_creates_file(tmp_path):
    output_path = str(tmp_path / "test_plan.dxf")
    lot_data = {
        "lot_name": "Lot 5-B",
        "plan_number": "Psd-04-123456",
        "coords": [(500, 500), (517.82, 517.53), (553.54, 481.81), (535.72, 464.28)],
        "lines": [
            {"bearing_text": "N 45°30' E", "distance": 25.0, "to_corner": 2},
            {"bearing_text": "S 44°30' E", "distance": 52.0, "to_corner": 3},
            {"bearing_text": "S 45°30' W", "distance": 25.0, "to_corner": 4},
            {"bearing_text": "N 44°30' W", "distance": 52.0, "to_corner": 1},
        ],
        "area_sqm": 1300.0,
    }
    generate_boundary_plan(lot_data, output_path)
    assert os.path.exists(output_path)
    doc = ezdxf.readfile(output_path)
    assert doc is not None

def test_dxf_has_boundary_layer(tmp_path):
    output_path = str(tmp_path / "test_plan.dxf")
    lot_data = {
        "lot_name": "Lot 5-B",
        "plan_number": "Psd-04-123456",
        "coords": [(500, 500), (517.82, 517.53), (553.54, 481.81), (535.72, 464.28)],
        "lines": [
            {"bearing_text": "N 45°30' E", "distance": 25.0, "to_corner": 2},
            {"bearing_text": "S 44°30' E", "distance": 52.0, "to_corner": 3},
            {"bearing_text": "S 45°30' W", "distance": 25.0, "to_corner": 4},
            {"bearing_text": "N 44°30' W", "distance": 52.0, "to_corner": 1},
        ],
        "area_sqm": 1300.0,
    }
    generate_boundary_plan(lot_data, output_path)
    doc = ezdxf.readfile(output_path)
    msp = doc.modelspace()
    layers = set(e.dxf.layer for e in msp)
    assert "BOUNDARY" in layers
    assert "LABELS" in layers
    assert "ANNOTATIONS" in layers

def test_dxf_has_corner_labels(tmp_path):
    output_path = str(tmp_path / "test_plan.dxf")
    lot_data = {
        "lot_name": "Lot 5-B",
        "plan_number": "Psd-04-123456",
        "coords": [(500, 500), (517.82, 517.53), (553.54, 481.81), (535.72, 464.28)],
        "lines": [
            {"bearing_text": "N 45°30' E", "distance": 25.0, "to_corner": 2},
            {"bearing_text": "S 44°30' E", "distance": 52.0, "to_corner": 3},
            {"bearing_text": "S 45°30' W", "distance": 25.0, "to_corner": 4},
            {"bearing_text": "N 44°30' W", "distance": 52.0, "to_corner": 1},
        ],
        "area_sqm": 1300.0,
    }
    generate_boundary_plan(lot_data, output_path)
    doc = ezdxf.readfile(output_path)
    msp = doc.modelspace()
    texts = [e for e in msp if e.dxftype() == "TEXT" or e.dxftype() == "MTEXT"]
    text_content = " ".join(t.dxf.text if hasattr(t.dxf, "text") else t.text for t in texts)
    assert "1" in text_content
    assert "Lot 5-B" in text_content

# tests/test_synthetic_case.py
"""
End-to-end test: run the full pipeline on the synthetic Lot 5-B case.
"""
import sys, os, json, math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from td_parser import parse_technical_description
from coord_compute import compute_coordinates
from closure_check import check_closure
from area_compute import compute_area, check_area
from least_squares import adjust_coordinates, detect_outliers
from generate_dxf import generate_boundary_plan
from generate_docx import generate_survey_report
from generate_pdf import generate_boundary_map

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'test-data', 'synthetic')


def load_input():
    with open(os.path.join(DATA_DIR, 'lot-5b-input.json')) as f:
        return json.load(f)


def load_expected():
    with open(os.path.join(DATA_DIR, 'lot-5b-expected.json')) as f:
        return json.load(f)


def test_phase2_parse_all_tds():
    data = load_input()
    for key in ["subject", "neighbor", "parent"]:
        td = data["lots"][key]["technical_description"]
        result = parse_technical_description(td)
        assert len(result["lines"]) == 4, f"{key} should have 4 lines"
        assert result["stated_area"] == data["lots"][key]["stated_area"]


def test_phase2_closure_all_lots():
    data = load_input()
    for key in ["subject", "neighbor", "parent"]:
        td = data["lots"][key]["technical_description"]
        parsed = parse_technical_description(td)
        coords = compute_coordinates(parsed["lines"], origin=(0, 0))
        result = check_closure(coords, tolerance_m=0.01)
        assert result["passed"], f"{key} failed closure check: {result['linear_error']}m"


def test_phase2_area_validation():
    data = load_input()
    for key in ["subject", "neighbor", "parent"]:
        td = data["lots"][key]["technical_description"]
        parsed = parse_technical_description(td)
        coords = compute_coordinates(parsed["lines"], origin=(0, 0))
        polygon_coords = coords[:-1]
        area = compute_area(polygon_coords)
        stated = data["lots"][key]["stated_area"]
        assert abs(area - stated) < 1.0, f"{key}: computed {area} vs stated {stated}"


def test_phase2_neighbor_mismatch():
    data = load_input()
    subject = parse_technical_description(data["lots"]["subject"]["technical_description"])
    neighbor = parse_technical_description(data["lots"]["neighbor"]["technical_description"])
    assert 25.0 in [l["distance"] for l in subject["lines"]]
    assert 24.0 in [l["distance"] for l in neighbor["lines"]]
    assert 25.0 not in [l["distance"] for l in neighbor["lines"]]


def test_phase2_subdivision_consistency():
    data = load_input()
    subject_area = data["lots"]["subject"]["stated_area"]
    neighbor_area = data["lots"]["neighbor"]["stated_area"]
    parent_area = data["lots"]["parent"]["stated_area"]
    assert abs((subject_area + neighbor_area) - parent_area) < 1.0


def test_phase4_least_squares_subject():
    data = load_input()
    td = data["lots"]["subject"]["technical_description"]
    parsed = parse_technical_description(td)
    field = data["field_measurements"]["corners"]
    origin = (field[0]["easting"], field[0]["northing"])
    theoretical_coords = compute_coordinates(parsed["lines"], origin=origin)
    theoretical = theoretical_coords[:-1]
    actual = [(c["easting"], c["northing"]) for c in field]
    result = adjust_coordinates(theoretical, actual)
    assert result["rmse"] < 1.0


def test_phase4_outlier_detection():
    data = load_input()
    td = data["lots"]["subject"]["technical_description"]
    parsed = parse_technical_description(td)
    field = data["field_measurements"]["corners"]
    origin = (field[0]["easting"], field[0]["northing"])
    theoretical = compute_coordinates(parsed["lines"], origin=origin)[:-1]
    actual = [(c["easting"], c["northing"]) for c in field]
    result = adjust_coordinates(theoretical, actual)
    max_residual = max(result["residuals"], key=lambda r: r["distance"])
    assert max_residual["point_index"] == 3


def test_phase5_generate_all_outputs(tmp_path):
    data = load_input()
    td = parse_technical_description(data["lots"]["subject"]["technical_description"])
    field = data["field_measurements"]["corners"]
    origin = (field[0]["easting"], field[0]["northing"])
    coords = compute_coordinates(td["lines"], origin=origin)[:-1]

    lot_data = {
        "lot_name": td["lot_name"],
        "plan_number": td["plan_number"],
        "coords": coords,
        "lines": [
            {
                "bearing_text": f"{l['bearing']['ns']} {l['bearing']['degrees']}°{l['bearing']['minutes']}' {l['bearing']['ew']}",
                "distance": l["distance"],
                "to_corner": l["to_corner"],
            }
            for l in td["lines"]
        ],
        "area_sqm": td["stated_area"],
    }

    # DXF
    dxf_path = str(tmp_path / "lot-5b.dxf")
    generate_boundary_plan(lot_data, dxf_path)
    assert os.path.exists(dxf_path)

    # DOCX
    docx_path = str(tmp_path / "lot-5b-report.docx")
    report_data = {
        "lot_name": td["lot_name"],
        "plan_number": td["plan_number"],
        "location": data["lots"]["subject"]["location"],
        "client": data["project"]["client"],
        "date": data["project"]["date"],
        "documents_reviewed": [
            {"title": lot["title"], "type": "TCT", "year": lot["year"]}
            for lot in [data["lots"]["subject"], data["lots"]["neighbor"], data["lots"]["parent"]]
        ],
        "errors_found": [
            {
                "description": "Shared boundary mismatch: 24m vs 25m",
                "source": "TCT No. 98765 (Lot 5-A)",
                "resolution": "Parent title confirms 49m. Field supports 25+24. Lot 5-A has error.",
            }
        ],
        "qa_summary": [
            {"check": "Closure", "result": "PASS", "details": "All lots close"},
            {"check": "Area", "result": "PASS", "details": "Areas match stated values"},
            {"check": "Subdivision", "result": "PASS", "details": "Children sum to parent"},
        ],
        "recommendation": "Lot 5-B boundary is correct. Lot 5-A has transcription error.",
        "coordinates": [
            {"corner": i + 1, "easting": c[0], "northing": c[1], "monument": field[i]["monument"]}
            for i, c in enumerate(coords)
        ],
    }
    generate_survey_report(report_data, docx_path)
    assert os.path.exists(docx_path)

    # PDF
    pdf_path = str(tmp_path / "lot-5b-map.pdf")
    generate_boundary_map(lot_data, pdf_path)
    assert os.path.exists(pdf_path)

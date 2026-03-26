"""
End-to-end test: process real PGS2146 calibration data through the full pipeline.
"""
import sys
import os
import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
from project_scanner import scan_project
from xlsm_parser import parse_xlsm
from field_parser import parse_field_directory
from subdivision_tree import build_tree, compute_seniority, validate_area_sums
from lot_processor import process_lot
from generate_dxf import generate_consolidated_plan
from generate_docx import generate_project_report
from generate_pdf import generate_overview_map

PROJECT_DIR = os.path.join(os.path.dirname(__file__), "..", "real-data", "PGS2146")

# Skip entire module if real data is not available
pytestmark = pytest.mark.skipif(
    not os.path.isdir(PROJECT_DIR),
    reason="PGS2146 real data not available",
)


def test_scan_pgs2146():
    result = scan_project(PROJECT_DIR)
    assert result["project_id"] == "PGS2146"
    assert result["project_type"] == "relocation"
    assert len(result["subject_lots"]) >= 10


def test_parse_all_subject_lots():
    scan = scan_project(PROJECT_DIR)
    parsed_count = 0
    failures = []
    for lot_info in scan["subject_lots"]:
        td_path = os.path.join(PROJECT_DIR, lot_info["td_file"])
        if os.path.exists(td_path):
            try:
                parsed = parse_xlsm(td_path)
                assert len(parsed["lines"]) >= 3, f"{lot_info['lot_name']} has < 3 lines"
                parsed_count += 1
            except Exception as e:
                failures.append(f"{lot_info['lot_name']}: {e}")
    if failures:
        print(f"\nFailed to parse {len(failures)} lots:")
        for f in failures:
            print(f"  - {f}")
    assert parsed_count >= 10, f"Only parsed {parsed_count} lots (failures: {failures})"


def test_parse_field_data():
    field_dir = os.path.join(PROJECT_DIR, "4 Field")
    result = parse_field_directory(field_dir)
    assert len(result["all_points"]) > 50
    assert len(result["boundary_corners"]) > 10


def test_build_subdivision_tree():
    scan = scan_project(PROJECT_DIR)
    all_lots = []
    for lot_info in scan["subject_lots"]:
        td_path = os.path.join(PROJECT_DIR, lot_info["td_file"])
        if os.path.exists(td_path):
            try:
                parsed = parse_xlsm(td_path)
                all_lots.append(parsed)
            except Exception:
                continue
    tree = build_tree(all_lots)
    assert len(tree["surveys"]) >= 2


def test_process_one_lot():
    td_path = os.path.join(
        PROJECT_DIR,
        "2 From Client",
        "Subject Lot",
        "TCT's",
        "LOT 40-B, CLOA-43796.xlsm",
    )
    if not os.path.exists(td_path):
        pytest.skip("LOT 40-B XLSM not found")
    parsed = parse_xlsm(td_path)
    result = process_lot(parsed)
    assert result["status"] == "processed"
    assert result["theoretical"]["closure"]["passed"]


def test_generate_consolidated_output(tmp_path):
    scan = scan_project(PROJECT_DIR)
    lot_data_list = []
    for lot_info in scan["subject_lots"][:5]:
        td_path = os.path.join(PROJECT_DIR, lot_info["td_file"])
        if os.path.exists(td_path):
            try:
                parsed = parse_xlsm(td_path)
                result = process_lot(parsed)
                if result["theoretical"]["coordinates"]:
                    lot_data_list.append(
                        {
                            "lot_name": result["lot_name"],
                            "coords": result["theoretical"]["coordinates"],
                            "lines": [],
                            "area_sqm": parsed["stated_area"],
                        }
                    )
            except Exception:
                continue
    assert len(lot_data_list) >= 3, f"Only got {len(lot_data_list)} processable lots"
    dxf_path = str(tmp_path / "PGS2146-consolidated.dxf")
    generate_consolidated_plan(lot_data_list, dxf_path, project_id="PGS2146")
    assert os.path.exists(dxf_path)
    assert os.path.getsize(dxf_path) > 0


def test_generate_overview_map_output(tmp_path):
    scan = scan_project(PROJECT_DIR)
    lot_data_list = []
    for lot_info in scan["subject_lots"][:5]:
        td_path = os.path.join(PROJECT_DIR, lot_info["td_file"])
        if os.path.exists(td_path):
            try:
                parsed = parse_xlsm(td_path)
                result = process_lot(parsed)
                if result["theoretical"]["coordinates"]:
                    lot_data_list.append(
                        {
                            "lot_name": result["lot_name"],
                            "coords": result["theoretical"]["coordinates"],
                        }
                    )
            except Exception:
                continue
    assert len(lot_data_list) >= 3, f"Only got {len(lot_data_list)} processable lots"
    pdf_path = str(tmp_path / "PGS2146-overview.pdf")
    generate_overview_map(lot_data_list, pdf_path, project_id="PGS2146")
    assert os.path.exists(pdf_path)
    assert os.path.getsize(pdf_path) > 0

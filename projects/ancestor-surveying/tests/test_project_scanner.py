import sys, os, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from project_scanner import scan_project

PROJECT_DIR = os.path.join(os.path.dirname(__file__), '..', 'real-data', 'PGS2146')

def test_scan_project_id():
    result = scan_project(PROJECT_DIR)
    assert result["project_id"] == "PGS2146"

def test_scan_project_type():
    result = scan_project(PROJECT_DIR)
    assert result["project_type"] == "relocation"

def test_scan_finds_subject_lots():
    result = scan_project(PROJECT_DIR)
    assert len(result["subject_lots"]) > 0
    lot_names = [l["lot_name"] for l in result["subject_lots"]]
    assert any("40-B" in name for name in lot_names)

def test_scan_finds_adjoining_lots():
    result = scan_project(PROJECT_DIR)
    assert len(result["adjoining_lots"]) > 0

def test_scan_finds_field_data():
    result = scan_project(PROJECT_DIR)
    assert len(result["field_data_files"]) > 0

def test_scan_finds_parent_surveys():
    result = scan_project(PROJECT_DIR)
    assert len(result["parent_surveys"]) > 0

def test_scan_result_is_serializable():
    result = scan_project(PROJECT_DIR)
    json_str = json.dumps(result)
    assert len(json_str) > 0

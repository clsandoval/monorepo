import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from generate_dxf import generate_boundary_plan, generate_consolidated_plan
from generate_docx import generate_survey_report, generate_project_report
from generate_pdf import generate_boundary_map, generate_overview_map

def test_generate_consolidated_dxf(tmp_path):
    lots = [
        {"lot_name": "Lot A", "coords": [(0, 0), (100, 0), (100, 100), (0, 100)], "lines": [], "area_sqm": 10000},
        {"lot_name": "Lot B", "coords": [(100, 0), (200, 0), (200, 100), (100, 100)], "lines": [], "area_sqm": 10000},
    ]
    path = str(tmp_path / "consolidated.dxf")
    generate_consolidated_plan(lots, path, project_id="TEST001")
    assert os.path.exists(path)
    import ezdxf
    doc = ezdxf.readfile(path)
    msp = doc.modelspace()
    layers = set(e.dxf.layer for e in msp)
    assert "BOUNDARY" in layers

def test_generate_project_report(tmp_path):
    project_data = {
        "project_id": "PGS2146",
        "project_type": "relocation",
        "location": "Guibang, Gamu, Isabela",
        "lot_results": [
            {
                "lot_name": "LOT 40-B",
                "title_number": "CLOA-43796",
                "closure_passed": True,
                "area_passed": True,
                "stated_area": 55848,
                "computed_area": 55840,
                "findings": [],
            },
        ],
        "seniority_chain": [{"survey": "GSS-380", "year": 1959, "rank": 1}],
        "qa_summary": [{"check": "Closure", "result": "PASS", "details": "All lots close"}],
    }
    path = str(tmp_path / "project-report.docx")
    generate_project_report(project_data, path)
    assert os.path.exists(path)
    from docx import Document
    doc = Document(path)
    headings = [p.text for p in doc.paragraphs if p.style.name.startswith("Heading")]
    assert any("Lot Results" in h or "Summary" in h for h in headings)

def test_generate_overview_map(tmp_path):
    lots = [
        {"lot_name": "Lot A", "coords": [(0, 0), (100, 0), (100, 100), (0, 100)]},
        {"lot_name": "Lot B", "coords": [(100, 0), (200, 0), (200, 100), (100, 100)]},
    ]
    path = str(tmp_path / "overview.pdf")
    generate_overview_map(lots, path, project_id="TEST001")
    assert os.path.exists(path)
    assert os.path.getsize(path) > 1000

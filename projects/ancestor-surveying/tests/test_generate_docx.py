import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from generate_docx import generate_survey_report
from docx import Document

def test_generate_docx_creates_file(tmp_path):
    output_path = str(tmp_path / "test_report.docx")
    report_data = {
        "lot_name": "Lot 5-B",
        "plan_number": "Psd-04-123456",
        "location": "Brgy. San Isidro, Municipality of Batangas, Province of Batangas",
        "client": "Juan Dela Cruz",
        "date": "2026-03-26",
        "documents_reviewed": [
            {"title": "TCT No. 98766", "type": "Transfer Certificate of Title", "year": 2003},
            {"title": "TCT No. 98765", "type": "Transfer Certificate of Title (neighbor)", "year": 2003},
            {"title": "TCT No. 56789", "type": "Transfer Certificate of Title (parent)", "year": 1978},
        ],
        "errors_found": [
            {
                "description": "Shared boundary mismatch: Lot 5-A says 24m, Lot 5-B says 25m",
                "source": "TCT No. 98765 (Lot 5-A)",
                "resolution": "Parent title (1978) confirms 49m total. Field evidence supports 25m + 24m split. Lot 5-A has transcription error.",
            },
        ],
        "qa_summary": [
            {"check": "Closure verification", "result": "PASS", "details": "Linear error: 0.000m"},
            {"check": "Area cross-check", "result": "PASS", "details": "Computed: 1,300.0 sqm vs stated: 1,300 sqm"},
            {"check": "Subdivision consistency", "result": "PASS", "details": "Children sum to parent"},
            {"check": "Measurement residuals", "result": "FLAG", "details": "Corner 4: 0.4m residual (wooden peg)"},
            {"check": "Error resolution audit", "result": "PASS", "details": "All flags resolved"},
            {"check": "Deliverable cross-check", "result": "PASS", "details": "Coordinates consistent across outputs"},
        ],
        "recommendation": "Lot 5-B boundary as described in TCT No. 98766 is correct. Recommend re-monumentation of corner 4 (degraded wooden peg). Lot 5-A (TCT No. 98765) contains a transcription error on the shared boundary (24m should be 25m).",
        "coordinates": [
            {"corner": 1, "easting": 500.000, "northing": 500.000, "monument": "iron pin"},
            {"corner": 2, "easting": 517.824, "northing": 517.534, "monument": "concrete monument"},
            {"corner": 3, "easting": 553.544, "northing": 481.812, "monument": "iron pin"},
            {"corner": 4, "easting": 535.720, "northing": 464.278, "monument": "wooden peg (degraded)"},
        ],
    }
    generate_survey_report(report_data, output_path)
    assert os.path.exists(output_path)

def test_docx_has_required_sections(tmp_path):
    output_path = str(tmp_path / "test_report.docx")
    report_data = {
        "lot_name": "Lot 5-B",
        "plan_number": "Psd-04-123456",
        "location": "Brgy. San Isidro, Batangas",
        "client": "Juan Dela Cruz",
        "date": "2026-03-26",
        "documents_reviewed": [
            {"title": "TCT No. 98766", "type": "TCT", "year": 2003},
        ],
        "errors_found": [],
        "qa_summary": [
            {"check": "Closure", "result": "PASS", "details": "OK"},
        ],
        "recommendation": "Boundary is correct.",
        "coordinates": [
            {"corner": 1, "easting": 0, "northing": 0, "monument": "pin"},
        ],
    }
    generate_survey_report(report_data, output_path)
    doc = Document(output_path)
    headings = [p.text for p in doc.paragraphs if p.style.name.startswith("Heading")]
    assert any("Documents Reviewed" in h for h in headings)
    assert any("Findings" in h or "Errors" in h for h in headings)
    assert any("QA" in h or "Quality" in h for h in headings)
    assert any("Recommendation" in h for h in headings)
    assert any("Coordinates" in h for h in headings)

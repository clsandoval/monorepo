# Survey Report Template

When generating the DOCX report, follow this structure. Claude writes the content; the script formats it.

## Structure

1. **Title:** "Boundary Survey Report"
2. **Subtitle:** "[Lot Name] — [Plan Number]"
3. **Project Info Table:** Location, Client, Date, Plan Number
4. **Documents Reviewed:** Table of all titles/documents examined, with year and type. Ordered by seniority (oldest first).
5. **Findings and Errors:** Table of every discrepancy found. Columns: Description, Source Document, Resolution. Be specific — cite exact measurements and document numbers.
6. **QA Verification Summary:** The 6-check QA table from qa-checklist.md.
7. **Professional Recommendation:** 1-3 paragraphs summarizing:
   - What the boundary should be (with coordinates)
   - What errors were found and how they were resolved
   - What actions are recommended (e.g., re-monumentation)
   - Note: this is a technical recommendation, not a legal opinion
8. **Boundary Coordinates:** Table with Corner, Easting, Northing, Monument columns.

## Tone
- Technical and factual. No hedging, no marketing language.
- Cite specific documents and measurements.
- "Based on TCT No. 98766 and confirmed by field measurements dated 2026-03-20..."
- Not "We believe the boundary might be..."

## Report Data Dict
Pass this to `generate_survey_report()`:
```python
{
    "lot_name": str,
    "plan_number": str,
    "location": str,
    "client": str,
    "date": str,
    "documents_reviewed": [{"title": str, "type": str, "year": int}],
    "errors_found": [{"description": str, "source": str, "resolution": str}],
    "qa_summary": [{"check": str, "result": str, "details": str}],
    "recommendation": str,
    "coordinates": [{"corner": int, "easting": float, "northing": float, "monument": str}],
}
```

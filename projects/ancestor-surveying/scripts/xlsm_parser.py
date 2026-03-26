"""
Parse Philippine survey XLSM files (TD Check workbooks).

These workbooks have standardized sheets:
  - Title Data: lot metadata (name, title, area, owner, location)
  - E2C: bearing-distance traverse data
  - Correction Comparison: flagged corrections
  - Commonline Checker: shared boundary validation

Cell positions are fixed across all files (same template).
"""
import openpyxl


def parse_title_data(file_path: str) -> dict:
    """
    Parse the Title Data sheet from an XLSM file.

    Cell positions (fixed template):
      A1/B1: DECREE/TCT NO
      A2/B2: LOT NO
      A5/B5: SURVEY NUMBER
      A6/B6: DATE OF ORIGINAL SURVEY (may be empty)
      A7/B7: BARRIO/BARANGAY
      A8/B8: MUN/CITY
      A9/B9: PROVINCE
      A10/B10: ISLAND
      A11/B11: REGISTERED OWNER
      A12/B12: TIE POINT
      A13/B13: AREA (numeric)
    """
    wb = openpyxl.load_workbook(file_path, data_only=True, read_only=True)
    ws = wb["Title Data"]

    def cell(col, row):
        val = ws[f"{col}{row}"].value
        return str(val).strip() if val is not None else ""

    area_raw = ws["B13"].value
    stated_area = float(area_raw) if area_raw is not None else 0.0

    result = {
        "title_number": cell("B", 1),
        "lot_name": cell("B", 2),
        "survey_number": cell("B", 5),
        "date_of_original_survey": cell("B", 6),
        "barangay": cell("B", 7),
        "municipality": cell("B", 8),
        "province": cell("B", 9),
        "island": cell("B", 10),
        "owner": cell("B", 11),
        "tie_point": cell("B", 12),
        "stated_area": stated_area,
    }

    wb.close()
    return result

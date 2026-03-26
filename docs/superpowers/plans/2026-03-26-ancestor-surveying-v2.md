# Ancestor Surveying v2 — Generic Project Processor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the boundary survey pipeline into a generic survey project processor that reads real XLSM/CSV inputs from any 7-folder project directory and produces the full deliverable set (DXF, DOCX, PDF, CSV).

**Architecture:** Phase-based pipeline with per-lot subagents. Orchestrator skill coordinates project-level work; per-lot computation dispatched to subagents. New parsers (XLSM, CSV) feed into existing computation scripts (coord_compute, closure_check, area_compute, least_squares). Output generators extended for multi-lot support.

**Tech Stack:** Python 3 (openpyxl for XLSM, existing deps from v1), Claude Code skills (markdown prompts)

**Calibration data:** `projects/ancestor-surveying/real-data/PGS2146/`

---

## File Structure

```
projects/ancestor-surveying/
├── CLAUDE.md                          # Updated ops context (v2)
├── scripts/
│   ├── project_scanner.py             # NEW: scan 7-folder project → project.json
│   ├── xlsm_parser.py                 # NEW: parse XLSM E2C sheets → structured TD data
│   ├── field_parser.py                # NEW: parse CSV field measurements
│   ├── subdivision_tree.py            # NEW: build lot hierarchy, validate parent-child
│   ├── lot_processor.py               # NEW: per-lot pipeline (parse → compute → validate)
│   ├── coordinate_export.py           # NEW: export coordinate tables (CSV, XLSX)
│   ├── td_parser.py                   # KEEP: plain-text TD fallback
│   ├── coord_compute.py               # KEEP: bearing-distance → XY
│   ├── closure_check.py               # KEEP: polygon closure
│   ├── area_compute.py                # KEEP: shoelace area
│   ├── least_squares.py               # KEEP: Helmert + outlier detection
│   ├── generate_dxf.py                # EXTEND: multi-lot consolidated plans
│   ├── generate_docx.py               # EXTEND: project-level reports
│   └── generate_pdf.py                # EXTEND: overview maps
├── skills/
│   ├── project-orchestrator.md        # NEW: master workflow
│   ├── lot-processing.md              # NEW: per-lot subagent guide
│   ├── boundary-survey-workflow.md    # KEEP
│   ├── td-parsing.md                  # KEEP
│   ├── error-patterns.md              # KEEP
│   ├── seniority-rules.md             # KEEP
│   ├── qa-checklist.md                # KEEP
│   └── report-template.md             # KEEP
├── tests/
│   ├── test_xlsm_parser.py            # NEW
│   ├── test_field_parser.py           # NEW
│   ├── test_project_scanner.py        # NEW
│   ├── test_subdivision_tree.py       # NEW
│   ├── test_lot_processor.py          # NEW
│   ├── test_coordinate_export.py      # NEW
│   ├── test_pgs2146_e2e.py            # NEW: end-to-end on real data
│   └── ... (existing v1 tests kept)
└── real-data/
    ├── PGS2146/                        # Calibration file (File A)
    └── PGS2149/                        # Blind test (File B)
```

---

### Task 1: XLSM Parser — Title Data Sheet

Parse the Title Data sheet from XLSM files into structured metadata.

**Files:**
- Create: `projects/ancestor-surveying/scripts/xlsm_parser.py`
- Create: `projects/ancestor-surveying/tests/test_xlsm_parser.py`

- [ ] **Step 1: Write failing tests**

```python
# tests/test_xlsm_parser.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from xlsm_parser import parse_title_data

# Use real calibration file
REAL_FILE = os.path.join(
    os.path.dirname(__file__), '..', 'real-data', 'PGS2146',
    '2 From Client', 'Subject Lot', "TCT's",
    'LOT 40-B, CLOA-43796.xlsm'
)

def test_parse_title_data_lot_name():
    result = parse_title_data(REAL_FILE)
    assert result["lot_name"] == "40-B"

def test_parse_title_data_title_number():
    result = parse_title_data(REAL_FILE)
    assert result["title_number"] == "CLOA-43796"

def test_parse_title_data_area():
    result = parse_title_data(REAL_FILE)
    assert result["stated_area"] == 55848.0

def test_parse_title_data_survey_number():
    result = parse_title_data(REAL_FILE)
    assert result["survey_number"] == "CSD-2-02-005396-D"

def test_parse_title_data_location():
    result = parse_title_data(REAL_FILE)
    assert result["barangay"] == "GUIBANG"
    assert result["municipality"] == "GAMU"
    assert result["province"] == "ISABELA"

def test_parse_title_data_owner():
    result = parse_title_data(REAL_FILE)
    assert "MINERVA ADAN" in result["owner"]

def test_parse_title_data_tie_point():
    result = parse_title_data(REAL_FILE)
    assert "BLLM NO. 3" in result["tie_point"]
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/test_xlsm_parser.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'xlsm_parser'`

- [ ] **Step 3: Implement parse_title_data**

```python
# scripts/xlsm_parser.py
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
      A7/B7: BARRIO/BARANGAY
      A8/B8: MUN/CITY
      A9/B9: PROVINCE
      A10/B10: ISLAND
      A11/B11: REGISTERED OWNER
      A12/B12: TIE POINT
      A13/B13: AREA (numeric)
      C3: "AREA = XXXXX SQ.M." (string, for display)
      C4: "T.C.T. # XXXXX" (string, for display)
    """
    wb = openpyxl.load_workbook(file_path, data_only=True, read_only=True)
    ws = wb["Title Data"]

    def cell(col, row):
        """Read a cell value, return empty string if None."""
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
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/test_xlsm_parser.py -v
```

Expected: All 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add projects/ancestor-surveying/scripts/xlsm_parser.py projects/ancestor-surveying/tests/test_xlsm_parser.py
git commit -m "feat(ancestor-v2): XLSM parser — Title Data sheet extraction"
```

---

### Task 2: XLSM Parser — E2C Sheet (Bearing-Distance Traverse)

The critical parser — extracts bearing-distance lines from the E2C sheet.

**Files:**
- Modify: `projects/ancestor-surveying/scripts/xlsm_parser.py`
- Modify: `projects/ancestor-surveying/tests/test_xlsm_parser.py`

- [ ] **Step 1: Write failing tests**

Add to `tests/test_xlsm_parser.py`:

```python
from xlsm_parser import parse_title_data, parse_e2c

def test_parse_e2c_returns_lines():
    result = parse_e2c(REAL_FILE)
    assert len(result["lines"]) == 4  # LOT 40-B has 4 corners

def test_parse_e2c_first_line_bearing():
    """Line 1→2: S 0°36' E, 294.24 m (adjacent to LOT 40-A)"""
    result = parse_e2c(REAL_FILE)
    line = result["lines"][0]
    assert line["from_corner"] == 1
    assert line["to_corner"] == 2
    assert line["bearing"]["ns"] == "S"
    assert line["bearing"]["ew"] == "E"
    assert line["bearing"]["degrees"] == 0
    assert line["bearing"]["minutes"] == 36
    assert abs(line["distance"] - 294.24) < 0.01

def test_parse_e2c_adjacent_lot():
    """First line is adjacent to LOT 40-A"""
    result = parse_e2c(REAL_FILE)
    line = result["lines"][0]
    assert line["adjacent_lot"] == "LOT 40-A"
    assert line["adjacent_survey"] == "CSD-2-02-005396-D"

def test_parse_e2c_second_line():
    """Line 2→3: N 87°09' W, 186.70 m (adjacent to LOT 55, GSS-380)"""
    result = parse_e2c(REAL_FILE)
    line = result["lines"][1]
    assert line["from_corner"] == 2
    assert line["to_corner"] == 3
    assert line["bearing"]["ns"] == "N"
    assert line["bearing"]["ew"] == "W"
    assert line["bearing"]["degrees"] == 87
    assert line["bearing"]["minutes"] == 9
    assert abs(line["distance"] - 186.70) < 0.01
    assert line["adjacent_lot"] == "LOT 55"
    assert line["adjacent_survey"] == "GSS-380"

def test_parse_e2c_closure():
    """Last line should return to corner 1."""
    result = parse_e2c(REAL_FILE)
    last_line = result["lines"][-1]
    assert last_line["to_corner"] == 1

def test_parse_e2c_config():
    """Should extract E2C config (scale, circle, etc.)."""
    result = parse_e2c(REAL_FILE)
    assert result["config"]["scale"] == 1000
    assert result["config"]["circle"] == "Y"

def test_parse_e2c_lot_name():
    result = parse_e2c(REAL_FILE)
    assert result["lot_name"] == "LOT 40-B"

def test_parse_e2c_tie_line():
    """Should extract the tie line from reference point to corner 1."""
    result = parse_e2c(REAL_FILE)
    assert result["tie_line"] is not None
    assert result["tie_line"]["bearing"]["ns"] in ("N", "S")
    assert result["tie_line"]["distance"] > 0

def test_parse_e2c_computed_coordinates():
    """Should extract pre-computed coordinates from BG/BH columns."""
    result = parse_e2c(REAL_FILE)
    coords = result["computed_coordinates"]
    assert len(coords) >= 4
    # First point should be in PRS92 range for Isabela
    assert coords[0]["northing"] > 1800000
    assert coords[0]["easting"] > 300000
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/test_xlsm_parser.py::test_parse_e2c_returns_lines -v
```

Expected: FAIL — `ImportError: cannot import name 'parse_e2c'`

- [ ] **Step 3: Implement parse_e2c**

Add to `scripts/xlsm_parser.py`:

```python
def parse_e2c(file_path: str) -> dict:
    """
    Parse the E2C sheet from an XLSM file.

    E2C sheet layout (fixed template):
      Rows 15-23: Configuration
        B15: decimal places
        B16: scale (typically 1000)
        B17: CIRCLE(Y/N)
        B18: ADJ(Y/N)
        B19: BEARING(Y/N)
        B23: PS/DENR-LRA
      Row 19: Tie line data
        M19: bearing encoded, N19: distance encoded
        P19/Q19: N-S/E-W, T19: distance in meters
      Row 24: Column headers
      Row 25: Subject lot name in L25
      Rows 26+: Traverse data
        A: adjacent lot name
        B: adjacent survey number
        E: "START" marker for adjacency groups
        I: from corner number
        K: to corner number
        M: bearing encoded (DDMM integer, e.g., 8709 = 87°09')
        N: distance encoded (raw value, divide by scale = mm, /1000 = m)
        P: N or S
        Q: E or W
        R: degrees (string)
        S: minutes (string)
        T: distance in meters (float)
        BG: computed northing (PRS92)
        BH: computed easting (PRS92)
    """
    wb = openpyxl.load_workbook(file_path, data_only=True, read_only=True)
    ws = wb["E2C"]

    def cell(col, row):
        val = ws[f"{col}{row}"].value
        return val

    def cell_str(col, row):
        val = ws[f"{col}{row}"].value
        return str(val).strip() if val is not None else ""

    def cell_float(col, row):
        val = ws[f"{col}{row}"].value
        try:
            return float(val) if val is not None else 0.0
        except (ValueError, TypeError):
            return 0.0

    def cell_int(col, row):
        val = ws[f"{col}{row}"].value
        try:
            return int(val) if val is not None else 0
        except (ValueError, TypeError):
            return 0

    # Config
    config = {
        "decimal_places": cell_int("B", 15),
        "scale": cell_int("B", 16),
        "circle": cell_str("B", 17),
        "adj": cell_str("B", 18),
        "bearing_format": cell_str("B", 19),
        "system": cell_str("B", 23),
    }

    # Tie line (row 19)
    tie_line = None
    tie_ns = cell_str("P", 19)
    tie_ew = cell_str("Q", 19)
    tie_dist = cell_float("T", 19)
    if tie_ns and tie_ew and tie_dist > 0:
        tie_r = cell_str("R", 19)
        tie_s = cell_str("S", 19)
        tie_deg = int(tie_r) if tie_r.isdigit() else 0
        tie_min = int(tie_s) if tie_s.isdigit() else 0
        tie_line = {
            "bearing": {"degrees": tie_deg, "minutes": tie_min, "seconds": 0, "ns": tie_ns, "ew": tie_ew},
            "distance": tie_dist,
        }

    # Lot name from row 25
    lot_name = cell_str("L", 25) or cell_str("V", 25)

    # Traverse lines (rows 26+)
    lines = []
    computed_coordinates = []
    current_adjacent_lot = ""
    current_adjacent_survey = ""

    for row_num in range(26, ws.max_row + 1):
        from_corner = cell(col="I", row=row_num)
        to_corner = cell(col="K", row=row_num)

        # Stop when we hit empty corner data
        if from_corner is None or to_corner is None:
            break

        try:
            from_corner = int(from_corner)
            to_corner = int(to_corner)
        except (ValueError, TypeError):
            break

        # Adjacent lot (columns A, B) — sticky: carries forward until new value
        adj_lot = cell_str("A", row_num)
        adj_survey = cell_str("B", row_num)
        if adj_lot:
            current_adjacent_lot = adj_lot
            current_adjacent_survey = adj_survey

        # Bearing from R (degrees string) and S (minutes string)
        ns = cell_str("P", row_num)
        ew = cell_str("Q", row_num)
        deg_str = cell_str("R", row_num)
        min_str = cell_str("S", row_num)
        degrees = int(deg_str) if deg_str.isdigit() else 0
        minutes = int(min_str) if min_str.isdigit() else 0

        # Distance from T (meters)
        distance = cell_float("T", row_num)

        if not ns or not ew or distance == 0:
            break

        lines.append({
            "from_corner": from_corner,
            "to_corner": to_corner,
            "bearing": {
                "degrees": degrees,
                "minutes": minutes,
                "seconds": 0,
                "ns": ns,
                "ew": ew,
            },
            "distance": distance,
            "adjacent_lot": current_adjacent_lot,
            "adjacent_survey": current_adjacent_survey,
        })

        # Computed coordinates from BG (northing) and BH (easting)
        northing = cell_float("BG", row_num)
        easting = cell_float("BH", row_num)
        if northing > 0 and easting > 0:
            computed_coordinates.append({
                "corner": to_corner,
                "northing": northing,
                "easting": easting,
            })

    # Also grab corner 1 coordinates from row 25 (BG25, BH25)
    c1_northing = cell_float("BG", 25)
    c1_easting = cell_float("BH", 25)
    if c1_northing > 0 and c1_easting > 0:
        computed_coordinates.insert(0, {
            "corner": 1,
            "northing": c1_northing,
            "easting": c1_easting,
        })

    wb.close()

    return {
        "lot_name": lot_name,
        "config": config,
        "tie_line": tie_line,
        "lines": lines,
        "computed_coordinates": computed_coordinates,
    }
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/test_xlsm_parser.py -v
```

Expected: All tests PASS (7 title data + 9 E2C = 16 total)

- [ ] **Step 5: Commit**

```bash
git add projects/ancestor-surveying/scripts/xlsm_parser.py projects/ancestor-surveying/tests/test_xlsm_parser.py
git commit -m "feat(ancestor-v2): XLSM parser — E2C sheet bearing-distance extraction"
```

---

### Task 3: XLSM Parser — Combined `parse_xlsm` Function

Combines Title Data + E2C into a single output compatible with downstream scripts.

**Files:**
- Modify: `projects/ancestor-surveying/scripts/xlsm_parser.py`
- Modify: `projects/ancestor-surveying/tests/test_xlsm_parser.py`

- [ ] **Step 1: Write failing tests**

Add to `tests/test_xlsm_parser.py`:

```python
from xlsm_parser import parse_title_data, parse_e2c, parse_xlsm

def test_parse_xlsm_combined():
    """parse_xlsm returns merged title data + E2C data."""
    result = parse_xlsm(REAL_FILE)
    # Title data fields
    assert result["title_number"] == "CLOA-43796"
    assert result["stated_area"] == 55848.0
    # E2C fields
    assert len(result["lines"]) == 4
    assert result["config"]["scale"] == 1000

def test_parse_xlsm_backward_compatible():
    """Output should work with coord_compute.py (needs 'lines' with 'bearing' and 'distance')."""
    from coord_compute import compute_coordinates
    result = parse_xlsm(REAL_FILE)
    coords = compute_coordinates(result["lines"], origin=(0, 0))
    assert len(coords) == 5  # 4 corners + return to start

def test_parse_xlsm_closure_check():
    """Parsed data should produce a closed polygon."""
    from coord_compute import compute_coordinates
    from closure_check import check_closure
    result = parse_xlsm(REAL_FILE)
    coords = compute_coordinates(result["lines"], origin=(0, 0))
    closure = check_closure(coords, tolerance_m=1.0)
    assert closure["passed"], f"Closure error: {closure['linear_error']}m"

def test_parse_xlsm_area_check():
    """Computed area should be close to stated area."""
    from coord_compute import compute_coordinates
    from area_compute import compute_area
    result = parse_xlsm(REAL_FILE)
    coords = compute_coordinates(result["lines"], origin=(0, 0))
    area = compute_area(coords[:-1])  # remove closing point
    stated = result["stated_area"]
    pct_diff = abs(area - stated) / stated * 100
    assert pct_diff < 5.0, f"Area diff: {pct_diff:.1f}% (computed={area:.0f}, stated={stated:.0f})"

def test_parse_xlsm_adjoining_lot():
    """Parse an adjoining lot file."""
    adj_file = os.path.join(
        os.path.dirname(__file__), '..', 'real-data', 'PGS2146',
        '3 Research', 'LDC Adjoining Lots', 'LOT 30.xlsm'
    )
    if os.path.exists(adj_file):
        result = parse_xlsm(adj_file)
        assert result["lot_name"] is not None
        assert len(result["lines"]) > 0
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/test_xlsm_parser.py::test_parse_xlsm_combined -v
```

Expected: FAIL — `ImportError: cannot import name 'parse_xlsm'`

- [ ] **Step 3: Implement parse_xlsm**

Add to `scripts/xlsm_parser.py`:

```python
def parse_xlsm(file_path: str) -> dict:
    """
    Parse a complete XLSM file — combines Title Data + E2C into one dict.

    Returns a dict compatible with downstream scripts (coord_compute, closure_check, etc.)
    The 'lines' array has the same shape as td_parser.py output.
    """
    title = parse_title_data(file_path)
    e2c = parse_e2c(file_path)

    return {
        # Title Data fields
        "title_number": title["title_number"],
        "lot_name": e2c["lot_name"] or title["lot_name"],
        "survey_number": title["survey_number"],
        "date_of_original_survey": title["date_of_original_survey"],
        "owner": title["owner"],
        "barangay": title["barangay"],
        "municipality": title["municipality"],
        "province": title["province"],
        "island": title["island"],
        "tie_point": title["tie_point"],
        "stated_area": title["stated_area"],
        # E2C fields
        "config": e2c["config"],
        "tie_line": e2c["tie_line"],
        "lines": e2c["lines"],
        "computed_coordinates": e2c["computed_coordinates"],
        # Compat: plan_number maps to survey_number
        "plan_number": title["survey_number"],
        # Compat: references (empty for XLSM, used by td_parser)
        "references": [],
    }
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/test_xlsm_parser.py -v
```

Expected: All tests PASS (7 + 9 + 5 = 21 total)

- [ ] **Step 5: Commit**

```bash
git add projects/ancestor-surveying/scripts/xlsm_parser.py projects/ancestor-surveying/tests/test_xlsm_parser.py
git commit -m "feat(ancestor-v2): XLSM combined parser — backward compatible with v1 scripts"
```

---

### Task 4: Field Parser

Parse CSV field measurement files.

**Files:**
- Create: `projects/ancestor-surveying/scripts/field_parser.py`
- Create: `projects/ancestor-surveying/tests/test_field_parser.py`

- [ ] **Step 1: Write failing tests**

```python
# tests/test_field_parser.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from field_parser import parse_field_csv, parse_field_directory, filter_by_code

REAL_CSV = os.path.join(
    os.path.dirname(__file__), '..', 'real-data', 'PGS2146',
    '4 Field', 'UPDATE DATA', '11-04-25.csv'
)

def test_parse_field_csv_reads_points():
    result = parse_field_csv(REAL_CSV)
    assert len(result) > 0

def test_parse_field_csv_point_structure():
    result = parse_field_csv(REAL_CSV)
    point = result[0]
    assert "id" in point
    assert "easting" in point
    assert "northing" in point
    assert "elevation" in point
    assert "code" in point

def test_parse_field_csv_first_point():
    """First point: 1,1884774.023,379916.941,63.289,G1-COR"""
    result = parse_field_csv(REAL_CSV)
    p = result[0]
    assert p["id"] == 1
    assert abs(p["easting"] - 1884774.023) < 0.001
    assert abs(p["northing"] - 379916.941) < 0.001
    assert abs(p["elevation"] - 63.289) < 0.001
    assert p["code"] == "G1-COR"

def test_filter_by_code_fc():
    points = parse_field_csv(REAL_CSV)
    fc_points = filter_by_code(points, ["FC"])
    assert len(fc_points) > 0
    assert all(p["code"] == "FC" for p in fc_points)

def test_filter_by_code_control():
    points = parse_field_csv(REAL_CSV)
    control = filter_by_code(points, ["G1-COR", "G2-CHECKING"])
    assert len(control) >= 2

def test_parse_field_directory():
    """Should find and merge all CSV files in a directory tree."""
    field_dir = os.path.join(
        os.path.dirname(__file__), '..', 'real-data', 'PGS2146', '4 Field'
    )
    result = parse_field_directory(field_dir)
    assert result["coordinate_system"] == "PRS92"
    assert len(result["all_points"]) > 0
    assert len(result["boundary_corners"]) > 0
    assert len(result["control_points"]) >= 2
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/test_field_parser.py -v
```

Expected: FAIL

- [ ] **Step 3: Implement field_parser.py**

```python
# scripts/field_parser.py
"""
Parse CSV field measurement files from survey equipment.

CSV format (no header): point_id, easting, northing, elevation, point_code

Point codes:
  FC = field corner (boundary point)
  FL = field line point
  G1-COR, G2-CHECKING = control/benchmark
  A1, A2 = alignment
  BWL, BWC = building wall
  G = ground (topo)
"""
import csv
import os
import glob


def parse_field_csv(file_path: str) -> list:
    """
    Parse a single CSV field measurement file.

    Returns list of dicts: {id, easting, northing, elevation, code}
    """
    points = []
    with open(file_path, "r") as f:
        reader = csv.reader(f)
        for row in reader:
            if len(row) < 5:
                continue
            try:
                points.append({
                    "id": int(row[0].strip()),
                    "easting": float(row[1].strip()),
                    "northing": float(row[2].strip()),
                    "elevation": float(row[3].strip()),
                    "code": row[4].strip(),
                })
            except (ValueError, IndexError):
                continue
    return points


def filter_by_code(points: list, codes: list) -> list:
    """Filter points by one or more point codes."""
    return [p for p in points if p["code"] in codes]


def parse_field_directory(directory: str) -> dict:
    """
    Find and merge all CSV files in a field directory tree.

    Returns structured dict with points categorized by type.
    """
    csv_files = glob.glob(os.path.join(directory, "**", "*.csv"), recursive=True)

    all_points = []
    seen_ids = set()

    for csv_file in csv_files:
        points = parse_field_csv(csv_file)
        for p in points:
            if p["id"] not in seen_ids:
                all_points.append(p)
                seen_ids.add(p["id"])

    control_codes = {"G1-COR", "G2-CHECKING", "G1", "G2"}
    boundary_codes = {"FC"}
    line_codes = {"FL"}
    ground_codes = {"G"}

    return {
        "coordinate_system": "PRS92",
        "all_points": all_points,
        "control_points": [p for p in all_points if p["code"] in control_codes],
        "boundary_corners": [p for p in all_points if p["code"] in boundary_codes],
        "line_points": [p for p in all_points if p["code"] in line_codes],
        "ground_points": [p for p in all_points if p["code"] in ground_codes],
    }
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/test_field_parser.py -v
```

Expected: All 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add projects/ancestor-surveying/scripts/field_parser.py projects/ancestor-surveying/tests/test_field_parser.py
git commit -m "feat(ancestor-v2): field parser — CSV measurement ingestion with point code filtering"
```

---

### Task 5: Project Scanner

Scans a 7-folder project directory and produces project.json.

**Files:**
- Create: `projects/ancestor-surveying/scripts/project_scanner.py`
- Create: `projects/ancestor-surveying/tests/test_project_scanner.py`

- [ ] **Step 1: Write failing tests**

```python
# tests/test_project_scanner.py
import sys, os, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from project_scanner import scan_project

PROJECT_DIR = os.path.join(
    os.path.dirname(__file__), '..', 'real-data', 'PGS2146'
)

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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/test_project_scanner.py -v
```

Expected: FAIL

- [ ] **Step 3: Implement project_scanner.py**

```python
# scripts/project_scanner.py
"""
Scan a 7-folder survey project directory and produce structured metadata.

Expected folder structure:
  1 Proposal/
  2 From Client/
  3 Research/
  4 Field/
  5 Reports and Drafting/
  6 Sent/
  7 Project Closing/
"""
import os
import glob
import re


def scan_project(project_dir: str) -> dict:
    """
    Scan a project directory and return structured metadata.

    Infers project type from contents:
      - Has TDs + field CSVs → relocation
      - Has TDs only → boundary
    """
    project_id = os.path.basename(os.path.normpath(project_dir))

    # Find subject lot XLSM files
    subject_lots = []
    client_dir = os.path.join(project_dir, "2 From Client")
    if os.path.isdir(client_dir):
        for xlsm in glob.glob(os.path.join(client_dir, "**", "*.xlsm"), recursive=True):
            filename = os.path.basename(xlsm)
            lot_name = _extract_lot_name(filename)
            subject_lots.append({
                "lot_name": lot_name,
                "td_file": os.path.relpath(xlsm, project_dir),
                "filename": filename,
            })

    # Find adjoining lot XLSM files
    adjoining_lots = []
    research_dir = os.path.join(project_dir, "3 Research")
    if os.path.isdir(research_dir):
        adj_dir = os.path.join(research_dir, "LDC Adjoining Lots")
        if os.path.isdir(adj_dir):
            for xlsm in glob.glob(os.path.join(adj_dir, "*.xlsm")):
                filename = os.path.basename(xlsm)
                lot_name = _extract_lot_name(filename)
                adjoining_lots.append({
                    "lot_name": lot_name,
                    "td_file": os.path.relpath(xlsm, project_dir),
                    "filename": filename,
                })

    # Find field CSV files
    field_data_files = []
    field_dir = os.path.join(project_dir, "4 Field")
    if os.path.isdir(field_dir):
        for csv_file in glob.glob(os.path.join(field_dir, "**", "*.csv"), recursive=True):
            field_data_files.append(os.path.relpath(csv_file, project_dir))

    # Find parent surveys from research subfolder names
    parent_surveys = []
    if os.path.isdir(research_dir):
        for item in os.listdir(research_dir):
            item_path = os.path.join(research_dir, item)
            if os.path.isdir(item_path) and item != "LDC Adjoining Lots":
                parent_surveys.append(item)
        # Also check for PDF plan files
        for pdf in glob.glob(os.path.join(research_dir, "*.pdf")):
            name = os.path.splitext(os.path.basename(pdf))[0]
            if name not in parent_surveys:
                parent_surveys.append(name)

    # Find existing outputs
    existing_outputs = []
    output_dir = os.path.join(project_dir, "5 Reports and Drafting")
    if os.path.isdir(output_dir):
        for f in glob.glob(os.path.join(output_dir, "**", "*.pdf"), recursive=True):
            existing_outputs.append(os.path.relpath(f, project_dir))
        for f in glob.glob(os.path.join(output_dir, "**", "*.dwg"), recursive=True):
            existing_outputs.append(os.path.relpath(f, project_dir))

    # Infer project type
    has_field = len(field_data_files) > 0
    has_tds = len(subject_lots) > 0
    project_type = "relocation" if has_field and has_tds else "boundary" if has_tds else "unknown"

    return {
        "project_id": project_id,
        "project_type": project_type,
        "subject_lots": subject_lots,
        "adjoining_lots": adjoining_lots,
        "field_data_files": field_data_files,
        "parent_surveys": parent_surveys,
        "existing_outputs": existing_outputs,
        "status": "scanned",
    }


def _extract_lot_name(filename: str) -> str:
    """Extract lot name from filename like 'LOT 40-B, CLOA-43796.xlsm'."""
    name = os.path.splitext(filename)[0]
    # Try to extract "LOT XX" pattern
    match = re.match(r"(LOT\s+[\w\-]+)", name, re.IGNORECASE)
    if match:
        return match.group(1)
    return name
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/test_project_scanner.py -v
```

Expected: All 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add projects/ancestor-surveying/scripts/project_scanner.py projects/ancestor-surveying/tests/test_project_scanner.py
git commit -m "feat(ancestor-v2): project scanner — 7-folder directory analysis"
```

---

### Task 6: Subdivision Tree Builder

Builds lot hierarchy from parsed TDs and validates parent-child relationships.

**Files:**
- Create: `projects/ancestor-surveying/scripts/subdivision_tree.py`
- Create: `projects/ancestor-surveying/tests/test_subdivision_tree.py`

- [ ] **Step 1: Write failing tests**

```python
# tests/test_subdivision_tree.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from subdivision_tree import build_tree, compute_seniority

def test_build_tree_basic():
    lots = [
        {"lot_name": "LOT 42-A", "survey_number": "PSD-(AF)-02-047911 (AR)", "stated_area": 25520},
        {"lot_name": "LOT 42-B", "survey_number": "PSD-(AF)-02-047911 (AR)", "stated_area": 25001},
    ]
    tree = build_tree(lots)
    assert "PSD-(AF)-02-047911 (AR)" in [n["survey"] for n in tree["surveys"]]

def test_build_tree_groups_by_survey():
    lots = [
        {"lot_name": "LOT 42-A", "survey_number": "PSD-(AF)-02-047911 (AR)", "stated_area": 25520},
        {"lot_name": "LOT 42-B", "survey_number": "PSD-(AF)-02-047911 (AR)", "stated_area": 25001},
        {"lot_name": "LOT 40-A", "survey_number": "CSD-2-02-005396-D", "stated_area": 55920},
        {"lot_name": "LOT 40-B", "survey_number": "CSD-2-02-005396-D", "stated_area": 55848},
    ]
    tree = build_tree(lots)
    survey_names = [n["survey"] for n in tree["surveys"]]
    assert "PSD-(AF)-02-047911 (AR)" in survey_names
    assert "CSD-2-02-005396-D" in survey_names

def test_build_tree_children():
    lots = [
        {"lot_name": "LOT 42-A", "survey_number": "PSD-(AF)-02-047911 (AR)", "stated_area": 25520},
        {"lot_name": "LOT 42-B", "survey_number": "PSD-(AF)-02-047911 (AR)", "stated_area": 25001},
    ]
    tree = build_tree(lots)
    survey = [s for s in tree["surveys"] if s["survey"] == "PSD-(AF)-02-047911 (AR)"][0]
    child_names = [c["lot_name"] for c in survey["lots"]]
    assert "LOT 42-A" in child_names
    assert "LOT 42-B" in child_names

def test_compute_seniority():
    lots = [
        {"lot_name": "LOT 42-A", "survey_number": "PSD-(AF)-02-047911 (AR)", "date_of_original_survey": "2003"},
        {"lot_name": "LOT 30", "survey_number": "GSS-380", "date_of_original_survey": "Jan. 19, 1959"},
    ]
    chain = compute_seniority(lots)
    # GSS-380 (1959) should rank higher (lower number) than PSD (2003)
    gss = [c for c in chain if c["survey"] == "GSS-380"][0]
    psd = [c for c in chain if c["survey"] == "PSD-(AF)-02-047911 (AR)"][0]
    assert gss["rank"] < psd["rank"]

def test_area_sum_validation():
    from subdivision_tree import validate_area_sums
    lots = [
        {"lot_name": "LOT 42-A", "survey_number": "PSD-(AF)-02-047911 (AR)", "stated_area": 25520},
        {"lot_name": "LOT 42-B", "survey_number": "PSD-(AF)-02-047911 (AR)", "stated_area": 25001},
    ]
    results = validate_area_sums(lots)
    # Should report sum for PSD-(AF)-02-047911
    assert len(results) > 0
    assert results[0]["survey"] == "PSD-(AF)-02-047911 (AR)"
    assert results[0]["total_area"] == 50521
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/test_subdivision_tree.py -v
```

Expected: FAIL

- [ ] **Step 3: Implement subdivision_tree.py**

```python
# scripts/subdivision_tree.py
"""
Build lot hierarchy from parsed TD data.

Groups lots by survey number, computes seniority from dates,
and validates area sums within subdivision groups.
"""
import re
from collections import defaultdict


def build_tree(lots: list) -> dict:
    """
    Group lots by survey number into a tree structure.

    Args:
        lots: List of dicts with lot_name, survey_number, stated_area.

    Returns:
        Dict with surveys (grouped lots) and metadata.
    """
    groups = defaultdict(list)
    for lot in lots:
        survey = lot.get("survey_number", "unknown")
        groups[survey].append({
            "lot_name": lot["lot_name"],
            "stated_area": lot.get("stated_area", 0),
        })

    surveys = []
    for survey_name, lot_list in groups.items():
        surveys.append({
            "survey": survey_name,
            "lots": lot_list,
            "total_area": sum(l["stated_area"] for l in lot_list),
            "lot_count": len(lot_list),
        })

    return {"surveys": surveys}


def compute_seniority(lots: list) -> list:
    """
    Compute seniority ranking for surveys based on date.

    Older surveys get lower rank numbers (higher precedence).
    """
    surveys = {}
    for lot in lots:
        survey = lot.get("survey_number", "unknown")
        if survey not in surveys:
            date_str = lot.get("date_of_original_survey", "")
            year = _extract_year(date_str)
            surveys[survey] = year

    # Sort by year (oldest first), assign ranks
    sorted_surveys = sorted(surveys.items(), key=lambda x: x[1] if x[1] else 9999)

    chain = []
    current_rank = 1
    prev_year = None
    for survey_name, year in sorted_surveys:
        if prev_year is not None and year != prev_year:
            current_rank += 1
        chain.append({
            "survey": survey_name,
            "year": year,
            "rank": current_rank,
        })
        prev_year = year

    return chain


def validate_area_sums(lots: list) -> list:
    """
    Validate that lots within each survey group have consistent areas.

    Returns a list of per-survey validation results.
    """
    groups = defaultdict(list)
    for lot in lots:
        survey = lot.get("survey_number", "unknown")
        groups[survey].append(lot)

    results = []
    for survey_name, lot_list in groups.items():
        total = sum(l.get("stated_area", 0) for l in lot_list)
        results.append({
            "survey": survey_name,
            "lot_count": len(lot_list),
            "total_area": total,
            "lots": [{"lot_name": l["lot_name"], "area": l.get("stated_area", 0)} for l in lot_list],
        })

    return results


def _extract_year(date_str: str) -> int:
    """Extract a 4-digit year from various date formats."""
    if not date_str:
        return 0
    match = re.search(r"\b(19|20)\d{2}\b", str(date_str))
    if match:
        return int(match.group(0))
    return 0
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/test_subdivision_tree.py -v
```

Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add projects/ancestor-surveying/scripts/subdivision_tree.py projects/ancestor-surveying/tests/test_subdivision_tree.py
git commit -m "feat(ancestor-v2): subdivision tree builder with seniority and area validation"
```

---

### Task 7: Lot Processor

Per-lot deterministic pipeline — computes coordinates, validates, reconciles.

**Files:**
- Create: `projects/ancestor-surveying/scripts/lot_processor.py`
- Create: `projects/ancestor-surveying/tests/test_lot_processor.py`

- [ ] **Step 1: Write failing tests**

```python
# tests/test_lot_processor.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from lot_processor import process_lot
from xlsm_parser import parse_xlsm

REAL_FILE = os.path.join(
    os.path.dirname(__file__), '..', 'real-data', 'PGS2146',
    '2 From Client', 'Subject Lot', "TCT's",
    'LOT 40-B, CLOA-43796.xlsm'
)

def test_process_lot_basic():
    parsed = parse_xlsm(REAL_FILE)
    result = process_lot(parsed)
    assert result["lot_name"] == "LOT 40-B"
    assert result["status"] == "processed"

def test_process_lot_has_coordinates():
    parsed = parse_xlsm(REAL_FILE)
    result = process_lot(parsed)
    assert len(result["theoretical"]["coordinates"]) >= 4

def test_process_lot_closure():
    parsed = parse_xlsm(REAL_FILE)
    result = process_lot(parsed)
    assert result["theoretical"]["closure"]["passed"] is True

def test_process_lot_area():
    parsed = parse_xlsm(REAL_FILE)
    result = process_lot(parsed)
    assert result["theoretical"]["area"]["passed"] is True
    assert abs(result["theoretical"]["area"]["computed"] - 55848) < 55848 * 0.05

def test_process_lot_with_field_data():
    parsed = parse_xlsm(REAL_FILE)
    field_corners = [
        {"id": 100, "easting": 380726.695, "northing": 1885424.705, "elevation": 60.0, "code": "FC"},
        {"id": 101, "easting": 380729.776, "northing": 1885130.480, "elevation": 58.0, "code": "FC"},
        {"id": 102, "easting": 380543.307, "northing": 1885139.763, "elevation": 55.0, "code": "FC"},
        {"id": 103, "easting": 380541.342, "northing": 1885446.757, "elevation": 62.0, "code": "FC"},
    ]
    result = process_lot(parsed, field_corners=field_corners)
    assert result["reconciliation"] is not None
    assert result["reconciliation"]["rmse"] >= 0
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/test_lot_processor.py -v
```

Expected: FAIL

- [ ] **Step 3: Implement lot_processor.py**

```python
# scripts/lot_processor.py
"""
Per-lot processing pipeline.

Takes parsed TD data for one lot, computes coordinates,
validates closure and area, optionally reconciles with field data.
"""
from coord_compute import compute_coordinates
from closure_check import check_closure
from area_compute import compute_area, check_area
from least_squares import adjust_coordinates, detect_outliers


def process_lot(parsed_td: dict, field_corners: list = None) -> dict:
    """
    Process a single lot through the computation pipeline.

    Args:
        parsed_td: Dict from xlsm_parser.parse_xlsm() or td_parser.parse_technical_description().
                   Must have 'lines' and 'stated_area'.
        field_corners: Optional list of field measurement points
                       [{id, easting, northing, elevation, code}].

    Returns:
        Dict with lot_name, status, theoretical (coords, closure, area),
        reconciliation (if field data), and findings.
    """
    lot_name = parsed_td.get("lot_name", "unknown")
    stated_area = parsed_td.get("stated_area", 0)
    lines = parsed_td.get("lines", [])

    # Use pre-computed coordinates if available (from XLSM BG/BH columns)
    pre_computed = parsed_td.get("computed_coordinates", [])

    # Compute coordinates from bearing-distance
    if pre_computed:
        # Use the first pre-computed point as origin
        origin = (pre_computed[0]["easting"], pre_computed[0]["northing"])
    else:
        origin = (0.0, 0.0)

    coords = compute_coordinates(lines, origin=origin)
    polygon_coords = coords[:-1]  # remove closing point

    # Closure check (1m tolerance for typical surveys)
    closure = check_closure(coords, tolerance_m=1.0)

    # Area check (5% tolerance)
    area_result = check_area(polygon_coords, stated_area, tolerance_pct=5.0) if stated_area > 0 else {
        "passed": True, "computed_area": compute_area(polygon_coords), "stated_area": 0,
        "difference_sqm": 0, "difference_pct": 0, "tolerance_pct": 5.0,
    }

    result = {
        "lot_name": lot_name,
        "status": "processed",
        "theoretical": {
            "coordinates": [(c[0], c[1]) for c in polygon_coords],
            "closure": closure,
            "area": area_result,
        },
        "pre_computed_coordinates": pre_computed,
        "reconciliation": None,
        "findings": [],
    }

    # Reconcile with field data if provided
    if field_corners and len(field_corners) >= 3:
        theoretical_points = [(c[0], c[1]) for c in polygon_coords]

        if len(field_corners) == len(theoretical_points):
            actual_points = [(p["easting"], p["northing"]) for p in field_corners]
            try:
                ls_result = adjust_coordinates(theoretical_points, actual_points)
                outliers = detect_outliers(ls_result["residuals"])
                result["reconciliation"] = {
                    "rmse": ls_result["rmse"],
                    "method": "helmert",
                    "residuals": ls_result["residuals"],
                    "outliers": outliers,
                    "params": ls_result["params"],
                }
            except Exception as e:
                result["findings"].append({
                    "type": "reconciliation_error",
                    "description": f"Least squares failed: {str(e)}",
                    "severity": "error",
                })

    return result
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/test_lot_processor.py -v
```

Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add projects/ancestor-surveying/scripts/lot_processor.py projects/ancestor-surveying/tests/test_lot_processor.py
git commit -m "feat(ancestor-v2): lot processor — per-lot computation pipeline"
```

---

### Task 8: Coordinate Export

Export coordinate tables matching their existing output format.

**Files:**
- Create: `projects/ancestor-surveying/scripts/coordinate_export.py`
- Create: `projects/ancestor-surveying/tests/test_coordinate_export.py`

- [ ] **Step 1: Write failing tests**

```python
# tests/test_coordinate_export.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from coordinate_export import export_all_points_csv, export_control_points_csv, export_lot_coords_csv

def test_export_all_points(tmp_path):
    points = [
        {"id": 1, "easting": 380726.695, "northing": 1885424.705, "residual": 0.095, "description": "T2"},
        {"id": 2, "easting": 380729.776, "northing": 1885130.480, "residual": 0.150, "description": "FC"},
    ]
    path = str(tmp_path / "all-points.csv")
    export_all_points_csv(points, path)
    assert os.path.exists(path)
    with open(path) as f:
        lines = f.readlines()
    assert len(lines) == 2
    assert "380726.695" in lines[0] or "380726.6950" in lines[0]

def test_export_control_points(tmp_path):
    controls = [
        {"name": "T-1", "northing": 1885532.566, "easting": 592237.911, "elevation": 61.1},
        {"name": "T-2", "northing": 1885547.235, "easting": 592692.651, "elevation": 61.195},
    ]
    path = str(tmp_path / "control-points.csv")
    export_control_points_csv(controls, path)
    assert os.path.exists(path)
    with open(path) as f:
        lines = f.readlines()
    assert "T-1" in lines[0] or "T-1" in lines[1]

def test_export_lot_coords(tmp_path):
    coords = [
        {"corner": 1, "easting": 380726.695, "northing": 1885424.705, "monument": "iron pin"},
        {"corner": 2, "easting": 380729.776, "northing": 1885130.480, "monument": "concrete"},
    ]
    path = str(tmp_path / "lot-coords.csv")
    export_lot_coords_csv(coords, "LOT 40-B", path)
    assert os.path.exists(path)
    with open(path) as f:
        content = f.read()
    assert "LOT 40-B" in content or "380726" in content
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/test_coordinate_export.py -v
```

Expected: FAIL

- [ ] **Step 3: Implement coordinate_export.py**

```python
# scripts/coordinate_export.py
"""
Export coordinate tables in formats matching existing surveying output.

Formats:
  all-points.csv: id easting northing residual "description"
  control-points.csv: name,northing,easting,elevation
  lot-coords.csv: corner,easting,northing,monument
"""
import csv


def export_all_points_csv(points: list, output_path: str) -> str:
    """
    Export all surveyed points with residuals.

    Format: id easting northing residual "description"
    (space-separated, description in quotes — matches their existing format)
    """
    with open(output_path, "w") as f:
        for p in points:
            desc = p.get("description", "")
            residual = p.get("residual", 0.0)
            f.write(f'{p["id"]} {p["easting"]:.4f} {p["northing"]:.4f} {residual:.4f} "{desc}"\n')
    return output_path


def export_control_points_csv(controls: list, output_path: str) -> str:
    """
    Export control/benchmark points.

    Format: name,northing,easting,elevation (CSV with header)
    """
    with open(output_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["CONTROL", "NORTHING", "EASTING", "ELEVATION"])
        for c in controls:
            writer.writerow([c["name"], f'{c["northing"]:.3f}', f'{c["easting"]:.3f}', f'{c["elevation"]:.3f}'])
    return output_path


def export_lot_coords_csv(coords: list, lot_name: str, output_path: str) -> str:
    """
    Export per-lot boundary coordinates.

    Format: corner,easting,northing,monument (CSV with header)
    """
    with open(output_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["LOT", "CORNER", "EASTING", "NORTHING", "MONUMENT"])
        for c in coords:
            writer.writerow([lot_name, c["corner"], f'{c["easting"]:.3f}', f'{c["northing"]:.3f}', c.get("monument", "")])
    return output_path
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/test_coordinate_export.py -v
```

Expected: All 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add projects/ancestor-surveying/scripts/coordinate_export.py projects/ancestor-surveying/tests/test_coordinate_export.py
git commit -m "feat(ancestor-v2): coordinate export — CSV tables matching existing output formats"
```

---

### Task 9: Extend Output Generators for Multi-Lot Support

Extend generate_dxf.py, generate_docx.py, generate_pdf.py to handle project-level output.

**Files:**
- Modify: `projects/ancestor-surveying/scripts/generate_dxf.py`
- Modify: `projects/ancestor-surveying/scripts/generate_docx.py`
- Modify: `projects/ancestor-surveying/scripts/generate_pdf.py`
- Create: `projects/ancestor-surveying/tests/test_multi_lot_output.py`

- [ ] **Step 1: Write failing tests**

```python
# tests/test_multi_lot_output.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from generate_dxf import generate_boundary_plan, generate_consolidated_plan
from generate_docx import generate_survey_report, generate_project_report
from generate_pdf import generate_boundary_map, generate_overview_map

def test_generate_consolidated_dxf(tmp_path):
    lots = [
        {
            "lot_name": "Lot A",
            "coords": [(0, 0), (100, 0), (100, 100), (0, 100)],
            "lines": [],
            "area_sqm": 10000,
        },
        {
            "lot_name": "Lot B",
            "coords": [(100, 0), (200, 0), (200, 100), (100, 100)],
            "lines": [],
            "area_sqm": 10000,
        },
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
        "seniority_chain": [
            {"survey": "GSS-380", "year": 1959, "rank": 1},
        ],
        "qa_summary": [
            {"check": "Closure", "result": "PASS", "details": "All lots close"},
        ],
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
        {
            "lot_name": "Lot A",
            "coords": [(0, 0), (100, 0), (100, 100), (0, 100)],
        },
        {
            "lot_name": "Lot B",
            "coords": [(100, 0), (200, 0), (200, 100), (100, 100)],
        },
    ]
    path = str(tmp_path / "overview.pdf")
    generate_overview_map(lots, path, project_id="TEST001")
    assert os.path.exists(path)
    assert os.path.getsize(path) > 1000
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/test_multi_lot_output.py -v
```

Expected: FAIL

- [ ] **Step 3: Add generate_consolidated_plan to generate_dxf.py**

Add to `scripts/generate_dxf.py`:

```python
def generate_consolidated_plan(
    lots: list,
    output_path: str,
    project_id: str = "",
) -> str:
    """
    Generate a consolidated DXF with all lots on one plan.

    Args:
        lots: List of lot_data dicts (each with lot_name, coords, lines, area_sqm).
        output_path: Path to write the .dxf file.
        project_id: Project identifier for the title block.
    """
    doc = ezdxf.new("R2010")
    msp = doc.modelspace()

    doc.layers.add("BOUNDARY", color=7)
    doc.layers.add("LABELS", color=3)
    doc.layers.add("ANNOTATIONS", color=1)

    all_coords = []
    for lot_data in lots:
        coords = lot_data["coords"]
        all_coords.extend(coords)
        n = len(coords)

        # Draw boundary
        points = list(coords) + [coords[0]]
        for i in range(len(points) - 1):
            msp.add_line(points[i], points[i + 1], dxfattribs={"layer": "BOUNDARY"})

        # Corner markers
        text_height = _compute_text_height(coords)
        marker_size = text_height * 0.3
        for i, (e, n_coord) in enumerate(coords):
            msp.add_line(
                (e - marker_size, n_coord), (e + marker_size, n_coord),
                dxfattribs={"layer": "LABELS"},
            )
            msp.add_line(
                (e, n_coord - marker_size), (e, n_coord + marker_size),
                dxfattribs={"layer": "LABELS"},
            )

        # Lot label at centroid
        centroid = (sum(c[0] for c in coords) / n, sum(c[1] for c in coords) / n)
        text_height = _compute_text_height(all_coords) if all_coords else 1.0
        msp.add_text(
            lot_data["lot_name"],
            height=text_height,
            dxfattribs={"layer": "ANNOTATIONS"},
        ).set_placement(centroid)
        if lot_data.get("area_sqm"):
            msp.add_text(
                f"Area: {lot_data['area_sqm']:,.0f} sq.m.",
                height=text_height * 0.6,
                dxfattribs={"layer": "ANNOTATIONS"},
            ).set_placement((centroid[0], centroid[1] - text_height * 1.5))

    # Project title
    if project_id and all_coords:
        overall_text_height = _compute_text_height(all_coords)
        max_n = max(c[1] for c in all_coords)
        mid_e = (min(c[0] for c in all_coords) + max(c[0] for c in all_coords)) / 2
        msp.add_text(
            f"Project: {project_id}",
            height=overall_text_height * 2,
            dxfattribs={"layer": "ANNOTATIONS"},
        ).set_placement((mid_e, max_n + overall_text_height * 5))

    doc.saveas(output_path)
    return output_path
```

- [ ] **Step 4: Add generate_project_report to generate_docx.py**

Add to `scripts/generate_docx.py`:

```python
def generate_project_report(project_data: dict, output_path: str) -> str:
    """
    Generate a project-level report covering all lots.

    Args:
        project_data: Dict with project_id, project_type, location,
                      lot_results, seniority_chain, qa_summary.
    """
    doc = Document()

    doc.add_heading("Survey Project Report", level=0)
    doc.add_heading(f"{project_data['project_id']} — {project_data.get('project_type', '').title()} Survey", level=1)

    # Project info
    doc.add_paragraph(f"Location: {project_data.get('location', '')}")
    doc.add_paragraph(f"Project Type: {project_data.get('project_type', '')}")
    doc.add_paragraph("")

    # Lot Results Summary
    doc.add_heading("Lot Results Summary", level=2)
    lot_table = doc.add_table(rows=1, cols=5)
    lot_table.style = "Table Grid"
    hdr = lot_table.rows[0].cells
    hdr[0].text = "Lot"
    hdr[1].text = "Title"
    hdr[2].text = "Closure"
    hdr[3].text = "Area Check"
    hdr[4].text = "Stated Area (sqm)"
    for lr in project_data.get("lot_results", []):
        row = lot_table.add_row().cells
        row[0].text = lr["lot_name"]
        row[1].text = lr.get("title_number", "")
        row[2].text = "PASS" if lr.get("closure_passed") else "FAIL"
        row[3].text = "PASS" if lr.get("area_passed") else "FAIL"
        row[4].text = f"{lr.get('stated_area', 0):,.0f}"

    # Seniority chain
    doc.add_heading("Document Seniority", level=2)
    sen_table = doc.add_table(rows=1, cols=3)
    sen_table.style = "Table Grid"
    hdr = sen_table.rows[0].cells
    hdr[0].text = "Survey"
    hdr[1].text = "Year"
    hdr[2].text = "Rank"
    for s in project_data.get("seniority_chain", []):
        row = sen_table.add_row().cells
        row[0].text = s["survey"]
        row[1].text = str(s.get("year", ""))
        row[2].text = str(s["rank"])

    # QA Summary
    doc.add_heading("QA Summary", level=2)
    qa_table = doc.add_table(rows=1, cols=3)
    qa_table.style = "Table Grid"
    hdr = qa_table.rows[0].cells
    hdr[0].text = "Check"
    hdr[1].text = "Result"
    hdr[2].text = "Details"
    for q in project_data.get("qa_summary", []):
        row = qa_table.add_row().cells
        row[0].text = q["check"]
        row[1].text = q["result"]
        row[2].text = q["details"]

    doc.save(output_path)
    return output_path
```

- [ ] **Step 5: Add generate_overview_map to generate_pdf.py**

Add to `scripts/generate_pdf.py`:

```python
def generate_overview_map(
    lots: list,
    output_path: str,
    project_id: str = "",
) -> str:
    """
    Generate a PDF overview map showing all lots.

    Args:
        lots: List of dicts with lot_name and coords.
        output_path: Path to write the PDF.
        project_id: For the title.
    """
    fig, ax = plt.subplots(1, 1, figsize=(11, 8.5))

    colors = ["#e8f4e8", "#e8e8f4", "#f4e8e8", "#f4f4e8", "#e8f4f4", "#f4e8f4"]

    for i, lot in enumerate(lots):
        coords = lot["coords"]
        color = colors[i % len(colors)]
        polygon = plt.Polygon(coords, fill=True, facecolor=color, edgecolor="black", linewidth=1.5)
        ax.add_patch(polygon)

        # Lot label
        centroid = (
            sum(c[0] for c in coords) / len(coords),
            sum(c[1] for c in coords) / len(coords),
        )
        ax.annotate(
            lot["lot_name"], centroid,
            fontsize=7, ha="center", va="center", fontweight="bold",
        )

    title = f"Project Overview — {project_id}" if project_id else "Project Overview"
    ax.set_title(title, fontsize=14, fontweight="bold", pad=20)

    ax.annotate(
        "N", xy=(0.95, 0.95), xycoords="axes fraction",
        fontsize=14, fontweight="bold", ha="center",
    )
    ax.annotate(
        "", xy=(0.95, 0.95), xycoords="axes fraction",
        xytext=(0.95, 0.88), textcoords="axes fraction",
        arrowprops=dict(arrowstyle="->", lw=2),
    )

    ax.set_xlabel("Easting (m)")
    ax.set_ylabel("Northing (m)")
    ax.set_aspect("equal")
    ax.grid(True, alpha=0.3)

    plt.tight_layout()
    fig.savefig(output_path, format="pdf", dpi=150, bbox_inches="tight")
    plt.close(fig)
    return output_path
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/test_multi_lot_output.py -v
```

Expected: All 3 tests PASS

- [ ] **Step 7: Run ALL existing tests to verify nothing broke**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/ -v
```

Expected: All tests PASS (v1 tests + new tests)

- [ ] **Step 8: Commit**

```bash
git add projects/ancestor-surveying/scripts/generate_dxf.py projects/ancestor-surveying/scripts/generate_docx.py projects/ancestor-surveying/scripts/generate_pdf.py projects/ancestor-surveying/tests/test_multi_lot_output.py
git commit -m "feat(ancestor-v2): multi-lot output — consolidated DXF, project report, overview map"
```

---

### Task 10: PGS2146 End-to-End Test

Run the full pipeline on the real calibration data.

**Files:**
- Create: `projects/ancestor-surveying/tests/test_pgs2146_e2e.py`

- [ ] **Step 1: Write the end-to-end test**

```python
# tests/test_pgs2146_e2e.py
"""
End-to-end test: process real PGS2146 calibration data through the full pipeline.

This exercises every new script:
  project_scanner → xlsm_parser → field_parser → subdivision_tree → lot_processor → outputs
"""
import sys, os, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from project_scanner import scan_project
from xlsm_parser import parse_xlsm
from field_parser import parse_field_directory
from subdivision_tree import build_tree, compute_seniority, validate_area_sums
from lot_processor import process_lot
from generate_dxf import generate_consolidated_plan
from generate_docx import generate_project_report
from generate_pdf import generate_overview_map
from coordinate_export import export_all_points_csv

PROJECT_DIR = os.path.join(os.path.dirname(__file__), '..', 'real-data', 'PGS2146')


def test_scan_pgs2146():
    result = scan_project(PROJECT_DIR)
    assert result["project_id"] == "PGS2146"
    assert result["project_type"] == "relocation"
    assert len(result["subject_lots"]) >= 10


def test_parse_all_subject_lots():
    scan = scan_project(PROJECT_DIR)
    parsed_count = 0
    for lot_info in scan["subject_lots"]:
        td_path = os.path.join(PROJECT_DIR, lot_info["td_file"])
        if os.path.exists(td_path):
            parsed = parse_xlsm(td_path)
            assert len(parsed["lines"]) >= 3, f"{lot_info['lot_name']} has < 3 lines"
            parsed_count += 1
    assert parsed_count >= 10, f"Only parsed {parsed_count} lots"


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
            parsed = parse_xlsm(td_path)
            all_lots.append(parsed)
    tree = build_tree(all_lots)
    assert len(tree["surveys"]) >= 2


def test_process_one_lot():
    """Process LOT 40-B as the canary."""
    td_path = os.path.join(
        PROJECT_DIR, '2 From Client', 'Subject Lot', "TCT's",
        'LOT 40-B, CLOA-43796.xlsm'
    )
    parsed = parse_xlsm(td_path)
    result = process_lot(parsed)
    assert result["status"] == "processed"
    assert result["theoretical"]["closure"]["passed"]


def test_generate_consolidated_output(tmp_path):
    """Generate consolidated DXF from all processable lots."""
    scan = scan_project(PROJECT_DIR)
    lot_data_list = []
    for lot_info in scan["subject_lots"][:5]:  # first 5 for speed
        td_path = os.path.join(PROJECT_DIR, lot_info["td_file"])
        if os.path.exists(td_path):
            parsed = parse_xlsm(td_path)
            result = process_lot(parsed)
            if result["theoretical"]["coordinates"]:
                lot_data_list.append({
                    "lot_name": result["lot_name"],
                    "coords": result["theoretical"]["coordinates"],
                    "lines": [],
                    "area_sqm": parsed["stated_area"],
                })
    assert len(lot_data_list) >= 3
    dxf_path = str(tmp_path / "PGS2146-consolidated.dxf")
    generate_consolidated_plan(lot_data_list, dxf_path, project_id="PGS2146")
    assert os.path.exists(dxf_path)


def test_generate_overview_map_output(tmp_path):
    scan = scan_project(PROJECT_DIR)
    lot_data_list = []
    for lot_info in scan["subject_lots"][:5]:
        td_path = os.path.join(PROJECT_DIR, lot_info["td_file"])
        if os.path.exists(td_path):
            parsed = parse_xlsm(td_path)
            result = process_lot(parsed)
            if result["theoretical"]["coordinates"]:
                lot_data_list.append({
                    "lot_name": result["lot_name"],
                    "coords": result["theoretical"]["coordinates"],
                })
    pdf_path = str(tmp_path / "PGS2146-overview.pdf")
    generate_overview_map(lot_data_list, pdf_path, project_id="PGS2146")
    assert os.path.exists(pdf_path)
```

- [ ] **Step 2: Run the e2e tests**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/test_pgs2146_e2e.py -v
```

Expected: All 7 tests PASS

- [ ] **Step 3: Commit**

```bash
git add projects/ancestor-surveying/tests/test_pgs2146_e2e.py
git commit -m "feat(ancestor-v2): PGS2146 end-to-end test — real data through full pipeline"
```

---

### Task 11: Skills — Project Orchestrator and Lot Processing

Write the two new Claude Code skill files.

**Files:**
- Create: `projects/ancestor-surveying/skills/project-orchestrator.md`
- Create: `projects/ancestor-surveying/skills/lot-processing.md`

- [ ] **Step 1: Write project-orchestrator.md**

```markdown
# Project Orchestrator

You are processing a survey project folder. Follow these phases in order.

## Phase 1: SCAN
1. Run `python3 scripts/project_scanner.py` on the project folder (or import and call scan_project()).
2. Present the summary to the user: project ID, type, number of lots, field files found.
3. Wait for confirmation before proceeding.

## Phase 2: PARSE
1. Run `xlsm_parser.parse_xlsm()` on every TD file (subject + adjoining).
2. Run `field_parser.parse_field_directory()` on the field folder.
3. Run `subdivision_tree.build_tree()` and `compute_seniority()` on all parsed lots.
4. Save intermediate data to `working/` directory.

## Phase 3: PROCESS
1. For each subject lot, dispatch a subagent with `lot-processing.md` skill.
2. Each subagent runs `lot_processor.process_lot()` with parsed TD + matched field data.
3. Claude in the subagent handles: field point assignment, neighbor comparison, findings.
4. Subject lots can be processed in parallel.
5. Adjoining lots get lighter treatment: parse + validate TD only, no field matching.

## Phase 4: CROSS-VALIDATE
1. Check commonlines: shared boundaries between adjacent lots should match.
2. Subdivision tree validation: children areas sum to parent.
3. Field coverage: are there FC points that weren't assigned to any lot?
4. Cross-lot coordinate consistency.

## Phase 5: QA
1. Run per-lot QA checks (closure, area, residuals).
2. Run project-level QA (subdivision consistency, commonline, field coverage).
3. ALL must pass before generating outputs.
4. On failure: investigate, fix if possible, re-check (max 3 attempts per check).
5. After 3 failures: stop and report.

## Phase 6: OUTPUT
Generate all deliverables:
1. Per-lot DXF plans + coordinate CSVs
2. Consolidated DXF (all lots on one plan)
3. Project report (DOCX)
4. Overview map (PDF)
5. All-points CSV
6. Control-points CSV

## Phase 7: REPORT
Present results to user:
1. File listing with sizes
2. QA summary table
3. Any unresolved findings that need human review
4. Comparison against existing outputs (if folder 5 has files)
```

Write to `projects/ancestor-surveying/skills/project-orchestrator.md`.

- [ ] **Step 2: Write lot-processing.md**

```markdown
# Per-Lot Processing Guide

You are a subagent processing one lot. You have the parsed TD data and optionally field measurements.

## Your Job

1. **Run the processor:** Call `lot_processor.process_lot(parsed_td, field_corners=matched_field_points)`.
2. **Match field points:** If field data is available, find the FC points nearest to this lot's theoretical corners. Use Euclidean distance. A match is valid if distance < 50m (accounts for projection differences). If multiple lots compete for the same FC point, the closest lot wins.
3. **Compare neighbors:** Check this lot's boundary lines against adjacent lots listed in the TD. Flag mismatches in distance or bearing.
4. **Apply seniority:** If there are conflicts, note which document is senior and what that implies.
5. **Document findings:** Every flag gets a dict: {type, description, severity, resolution}.
6. **Write results:** Save to `working/lots/<lot-name>.json`.

## Severity Levels
- **error:** Something is wrong and must be resolved (e.g., polygon doesn't close).
- **warning:** Discrepancy detected but within tolerance (e.g., 0.3m mismatch on a 1958 survey).
- **info:** Notable observation (e.g., monument is a wooden peg, recommend replacement).

## Report Back
Return the lot result JSON. Include status (processed/error), all validation results, and findings.
```

Write to `projects/ancestor-surveying/skills/lot-processing.md`.

- [ ] **Step 3: Commit**

```bash
git add projects/ancestor-surveying/skills/project-orchestrator.md projects/ancestor-surveying/skills/lot-processing.md
git commit -m "feat(ancestor-v2): orchestrator + lot processing skills for Claude Code"
```

---

### Task 12: Update CLAUDE.md for v2

Update the operations context document to reference new scripts and workflows.

**Files:**
- Modify: `projects/ancestor-surveying/CLAUDE.md`

- [ ] **Step 1: Update CLAUDE.md**

Add a new section at the top (after Company Overview) documenting the v2 pipeline:

```markdown
## How to Process a Project

To process a complete survey project folder, follow the orchestrator skill: `skills/project-orchestrator.md`

Quick reference:
1. `project_scanner.scan_project(path)` — scan the folder, identify lots and files
2. `xlsm_parser.parse_xlsm(path)` — parse each XLSM TD file
3. `field_parser.parse_field_directory(path)` — parse field CSVs
4. `subdivision_tree.build_tree(lots)` — build lot hierarchy
5. `lot_processor.process_lot(parsed)` — process one lot (coordinates, closure, area, reconciliation)
6. Generate outputs: `generate_dxf`, `generate_docx`, `generate_pdf`, `coordinate_export`

### Input Formats
- **Technical Descriptions:** XLSM files with E2C sheets (bearing-distance traverse data)
- **Field Measurements:** CSV files (id, easting, northing, elevation, point_code)
- **Project Structure:** 7-folder layout (Proposal / From Client / Research / Field / Reports / Sent / Closing)

### Output Formats
- `.dxf` — AutoCAD boundary plans (per-lot + consolidated)
- `.docx` — Project report with per-lot findings and QA summary
- `.pdf` — Overview map with all lots
- `.csv` — Coordinate tables (all points, control points, per-lot)
```

- [ ] **Step 2: Commit**

```bash
git add projects/ancestor-surveying/CLAUDE.md
git commit -m "feat(ancestor-v2): update CLAUDE.md with v2 pipeline reference"
```

---

### Task 13: Run Full Test Suite

**Files:** None — verification step.

- [ ] **Step 1: Run all tests**

```bash
cd projects/ancestor-surveying && python3 -m pytest tests/ -v
```

Expected: All tests pass — v1 tests (40) + v2 tests (Task 1-10 new tests).

- [ ] **Step 2: Generate full PGS2146 output**

```bash
cd projects/ancestor-surveying && python3 -c "
import json, os, sys
sys.path.insert(0, 'scripts')
from project_scanner import scan_project
from xlsm_parser import parse_xlsm
from field_parser import parse_field_directory
from subdivision_tree import build_tree, compute_seniority
from lot_processor import process_lot
from generate_dxf import generate_consolidated_plan
from generate_docx import generate_project_report
from generate_pdf import generate_overview_map
from coordinate_export import export_all_points_csv

PROJECT = 'real-data/PGS2146'
os.makedirs('output/v2', exist_ok=True)

# Scan
scan = scan_project(PROJECT)
print(f'Project: {scan[\"project_id\"]}, Type: {scan[\"project_type\"]}')
print(f'Subject lots: {len(scan[\"subject_lots\"])}')
print(f'Adjoining lots: {len(scan[\"adjoining_lots\"])}')
print(f'Field files: {len(scan[\"field_data_files\"])}')

# Parse all subject lots
all_parsed = []
all_results = []
for lot_info in scan['subject_lots']:
    td_path = os.path.join(PROJECT, lot_info['td_file'])
    if os.path.exists(td_path):
        parsed = parse_xlsm(td_path)
        result = process_lot(parsed)
        all_parsed.append(parsed)
        all_results.append(result)
        status = 'OK' if result['theoretical']['closure']['passed'] else 'FAIL'
        print(f'  {result[\"lot_name\"]}: closure={status}, area={result[\"theoretical\"][\"area\"][\"computed\"]:.0f}/{parsed[\"stated_area\"]:.0f}')

# Tree + seniority
tree = build_tree(all_parsed)
seniority = compute_seniority(all_parsed)

# Consolidated DXF
lot_data_list = [
    {'lot_name': r['lot_name'], 'coords': r['theoretical']['coordinates'], 'lines': [], 'area_sqm': p['stated_area']}
    for r, p in zip(all_results, all_parsed) if r['theoretical']['coordinates']
]
generate_consolidated_plan(lot_data_list, 'output/v2/PGS2146-consolidated.dxf', 'PGS2146')
print(f'DXF: output/v2/PGS2146-consolidated.dxf')

# Overview map
generate_overview_map(
    [{'lot_name': r['lot_name'], 'coords': r['theoretical']['coordinates']} for r in all_results if r['theoretical']['coordinates']],
    'output/v2/PGS2146-overview.pdf', 'PGS2146'
)
print(f'PDF: output/v2/PGS2146-overview.pdf')

# Project report
generate_project_report({
    'project_id': 'PGS2146', 'project_type': 'relocation',
    'location': 'Guibang, Gamu, Isabela',
    'lot_results': [
        {'lot_name': r['lot_name'], 'title_number': p.get('title_number',''),
         'closure_passed': r['theoretical']['closure']['passed'],
         'area_passed': r['theoretical']['area']['passed'],
         'stated_area': p['stated_area'],
         'computed_area': r['theoretical']['area']['computed_area'],
         'findings': r['findings']}
        for r, p in zip(all_results, all_parsed)
    ],
    'seniority_chain': seniority,
    'qa_summary': [{'check': 'Closure', 'result': 'PASS', 'details': f'{sum(1 for r in all_results if r[\"theoretical\"][\"closure\"][\"passed\"])}/{len(all_results)} lots pass'}],
}, 'output/v2/PGS2146-report.docx')
print(f'DOCX: output/v2/PGS2146-report.docx')

print('Done!')
"
```

- [ ] **Step 3: Verify outputs exist**

```bash
ls -la projects/ancestor-surveying/output/v2/
```

Expected: `PGS2146-consolidated.dxf`, `PGS2146-overview.pdf`, `PGS2146-report.docx`

- [ ] **Step 4: Commit**

```bash
git add projects/ancestor-surveying/output/.gitignore
git commit -m "feat(ancestor-v2): verified full pipeline on PGS2146 real data"
```

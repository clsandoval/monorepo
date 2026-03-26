# Ancestor Surveying Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Claude Code-orchestrated boundary survey pipeline with Python scripts for computation/generation, domain skills for surveying knowledge, and a self-QA step — validated against a synthetic test case, then two real survey files.

**Architecture:** Claude Code is the orchestrator — it reads title documents, reasons about errors and seniority, and makes judgment calls. Python scripts handle deterministic work: coordinate math, polygon validation, least squares adjustment, and file generation (DXF, DOCX, PDF). Skills encode domain knowledge so Claude has surveying context at each phase.

**Tech Stack:** Python 3 (numpy, scipy, shapely, ezdxf, python-docx, matplotlib), Claude Code skills (markdown prompts)

---

## File Structure

```
projects/ancestor-surveying/
├── CLAUDE.md                        # Operations context doc (the main deliverable)
├── scripts/
│   ├── requirements.txt             # Python dependencies
│   ├── td_parser.py                 # Parse technical descriptions → structured data
│   ├── coord_compute.py             # Bearing-distance → XY coordinates
│   ├── closure_check.py             # Polygon closure validation
│   ├── area_compute.py              # Shoelace formula area computation
│   ├── least_squares.py             # Least squares adjustment + outlier detection
│   ├── generate_dxf.py              # Generate AutoCAD .dxf boundary plans
│   ├── generate_docx.py             # Generate Word survey reports
│   └── generate_pdf.py              # Generate PDF map exports
├── skills/
│   ├── boundary-survey-workflow.md  # Full phase-by-phase orchestration guide
│   ├── td-parsing.md                # How to read Philippine technical descriptions
│   ├── error-patterns.md            # Common errors and how to investigate them
│   ├── seniority-rules.md           # Document seniority and legal precedence
│   ├── qa-checklist.md              # Self-QA checks before output generation
│   └── report-template.md           # Structure for the professional opinion report
├── test-data/
│   └── synthetic/
│       ├── lot-5b-input.json        # Synthetic test case: all title TDs + field measurements
│       └── lot-5b-expected.json     # Expected outputs: flags, conclusions, coordinates
├── tests/
│   ├── test_td_parser.py
│   ├── test_coord_compute.py
│   ├── test_closure_check.py
│   ├── test_area_compute.py
│   ├── test_least_squares.py
│   ├── test_generate_dxf.py
│   ├── test_generate_docx.py
│   ├── test_generate_pdf.py
│   └── test_synthetic_case.py       # End-to-end: synthetic test case through full pipeline
└── output/                           # Generated deliverables land here
```

---

### Task 1: Project Scaffold and Dependencies

**Files:**
- Create: `projects/ancestor-surveying/scripts/requirements.txt`
- Create: `projects/ancestor-surveying/tests/__init__.py`
- Create: `projects/ancestor-surveying/scripts/__init__.py`

- [ ] **Step 1: Create project directory structure**

```bash
mkdir -p projects/ancestor-surveying/{scripts,skills,test-data/synthetic,tests,output}
```

- [ ] **Step 2: Create requirements.txt**

```
numpy>=1.24
scipy>=1.10
shapely>=2.0
ezdxf>=1.0
python-docx>=1.0
matplotlib>=3.7
geopandas>=0.14
```

Write to `projects/ancestor-surveying/scripts/requirements.txt`.

- [ ] **Step 3: Create __init__.py files**

Create empty `projects/ancestor-surveying/scripts/__init__.py` and `projects/ancestor-surveying/tests/__init__.py`.

- [ ] **Step 4: Install dependencies**

```bash
cd projects/ancestor-surveying && pip install -r scripts/requirements.txt
```

- [ ] **Step 5: Verify imports work**

```bash
python -c "import numpy, scipy, shapely, ezdxf, docx, matplotlib; print('All imports OK')"
```

Expected: `All imports OK`

- [ ] **Step 6: Commit**

```bash
git add projects/ancestor-surveying/
git commit -m "feat(ancestor): scaffold project structure and dependencies"
```

---

### Task 2: Technical Description Parser (`td_parser.py`)

Parses Philippine-style technical descriptions (bearing-distance text) into structured data.

**Files:**
- Create: `projects/ancestor-surveying/scripts/td_parser.py`
- Create: `projects/ancestor-surveying/tests/test_td_parser.py`

- [ ] **Step 1: Write failing tests**

```python
# tests/test_td_parser.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from td_parser import parse_technical_description, parse_bearing, parse_line

def test_parse_bearing_simple():
    """N 45°30' E → (45, 30, 0, 'N', 'E')"""
    result = parse_bearing("N 45°30' E")
    assert result == {"degrees": 45, "minutes": 30, "seconds": 0, "ns": "N", "ew": "E"}

def test_parse_bearing_with_seconds():
    """S 12°15'30\" W → (12, 15, 30, 'S', 'W')"""
    result = parse_bearing("S 12°15'30\" W")
    assert result == {"degrees": 12, "minutes": 15, "seconds": 30, "ns": "S", "ew": "W"}

def test_parse_line():
    """Parse a full TD line into bearing + distance"""
    line = "thence N 45°30' E, 25.00 m to corner 2;"
    result = parse_line(line)
    assert result["bearing"] == {"degrees": 45, "minutes": 30, "seconds": 0, "ns": "N", "ew": "E"}
    assert result["distance"] == 25.00
    assert result["to_corner"] == 2

def test_parse_full_td():
    """Parse the synthetic Lot 5-B technical description"""
    td_text = """A parcel of land (Lot 5-B, Psd-04-123456), situated in Brgy. San Isidro,
Municipality of Batangas, Province of Batangas.

Beginning at corner 1, identical to corner 3 of Lot 5-A;
thence N 45°30' E, 25.00 m to corner 2;
thence S 44°30' E, 52.00 m to corner 3;
thence S 45°30' W, 25.00 m to corner 4;
thence N 44°30' W, 52.00 m to corner 1 (point of beginning).

Area: 1,300 sq.m., more or less."""

    result = parse_technical_description(td_text)
    assert result["lot_name"] == "Lot 5-B"
    assert result["plan_number"] == "Psd-04-123456"
    assert result["stated_area"] == 1300.0
    assert len(result["lines"]) == 4
    assert result["lines"][0]["distance"] == 25.00
    assert result["lines"][1]["distance"] == 52.00
    assert result["lines"][0]["bearing"]["ns"] == "N"
    assert result["lines"][0]["bearing"]["ew"] == "E"

def test_parse_td_extracts_references():
    """Should extract references like 'identical to corner 3 of Lot 5-A'"""
    td_text = """Beginning at corner 1, identical to corner 3 of Lot 5-A;
thence N 45°30' E, 25.00 m to corner 2;
thence S 44°30' E, 52.00 m to corner 3;
thence S 45°30' W, 25.00 m to corner 4;
thence N 44°30' W, 52.00 m to corner 1 (point of beginning).

Area: 1,300 sq.m., more or less."""

    result = parse_technical_description(td_text)
    assert result["references"][0] == {
        "corner": 1,
        "identical_to_corner": 3,
        "identical_to_lot": "Lot 5-A"
    }
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd projects/ancestor-surveying && python -m pytest tests/test_td_parser.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'td_parser'`

- [ ] **Step 3: Implement td_parser.py**

```python
# scripts/td_parser.py
"""
Parse Philippine-style technical descriptions into structured data.

Input: Raw text of a technical description from a land title.
Output: Dict with lot_name, plan_number, stated_area, lines (bearing/distance/corner),
        and references (corner identity links to other lots).

Philippine TD format:
  "thence N 45°30' E, 25.00 m to corner 2;"
  Bearing: N/S degrees°minutes'seconds" E/W
  Distance: meters
  Corner: integer
"""
import re
from typing import Optional


def parse_bearing(text: str) -> dict:
    """Parse a bearing string like \"N 45°30' E\" into components."""
    pattern = r"([NS])\s*(\d+)[°]\s*(\d+)['](?:\s*(\d+)[\"
    ])?\s*([EW])"
    match = re.search(pattern, text)
    if not match:
        raise ValueError(f"Cannot parse bearing from: {text}")
    return {
        "degrees": int(match.group(2)),
        "minutes": int(match.group(3)),
        "seconds": int(match.group(4)) if match.group(4) else 0,
        "ns": match.group(1),
        "ew": match.group(5),
    }


def parse_line(text: str) -> dict:
    """Parse a single TD line into bearing, distance, and corner number."""
    bearing = parse_bearing(text)
    dist_match = re.search(r"([\d.]+)\s*m\b", text)
    if not dist_match:
        raise ValueError(f"Cannot parse distance from: {text}")
    corner_match = re.search(r"to\s+corner\s+(\d+)", text)
    if not corner_match:
        raise ValueError(f"Cannot parse corner from: {text}")
    return {
        "bearing": bearing,
        "distance": float(dist_match.group(1)),
        "to_corner": int(corner_match.group(1)),
    }


def parse_technical_description(text: str) -> dict:
    """Parse a full technical description into structured data."""
    # Extract lot name and plan number
    lot_match = re.search(r"\(([^,)]+),\s*([^)]+)\)", text)
    lot_name = lot_match.group(1).strip() if lot_match else None
    plan_number = lot_match.group(2).strip() if lot_match else None

    # Extract stated area
    area_match = re.search(r"Area:\s*([\d,]+(?:\.\d+)?)\s*sq\.?\s*m", text)
    stated_area = float(area_match.group(1).replace(",", "")) if area_match else None

    # Extract references (e.g., "identical to corner 3 of Lot 5-A")
    references = []
    ref_pattern = r"corner\s+(\d+),?\s*identical\s+to\s+corner\s+(\d+)\s+of\s+([\w\s\-]+?)(?:[;,.]|\s*$)"
    for match in re.finditer(ref_pattern, text, re.IGNORECASE):
        references.append({
            "corner": int(match.group(1)),
            "identical_to_corner": int(match.group(2)),
            "identical_to_lot": match.group(3).strip(),
        })

    # Extract bearing-distance lines
    lines = []
    line_pattern = r"thence\s+[NS].*?to\s+corner\s+\d+.*?[;.]"
    for match in re.finditer(line_pattern, text, re.IGNORECASE):
        lines.append(parse_line(match.group(0)))

    return {
        "lot_name": lot_name,
        "plan_number": plan_number,
        "stated_area": stated_area,
        "lines": lines,
        "references": references,
    }
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd projects/ancestor-surveying && python -m pytest tests/test_td_parser.py -v
```

Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add projects/ancestor-surveying/scripts/td_parser.py projects/ancestor-surveying/tests/test_td_parser.py
git commit -m "feat(ancestor): TD parser — extract bearing/distance/corners from title text"
```

---

### Task 3: Coordinate Computation (`coord_compute.py`)

Converts parsed bearing-distance sequences into XY coordinates.

**Files:**
- Create: `projects/ancestor-surveying/scripts/coord_compute.py`
- Create: `projects/ancestor-surveying/tests/test_coord_compute.py`

- [ ] **Step 1: Write failing tests**

```python
# tests/test_coord_compute.py
import sys, os
import math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from coord_compute import bearing_to_azimuth, compute_coordinates

def test_bearing_to_azimuth_ne():
    """N 45°30' E → azimuth 45.5°"""
    bearing = {"degrees": 45, "minutes": 30, "seconds": 0, "ns": "N", "ew": "E"}
    assert abs(bearing_to_azimuth(bearing) - 45.5) < 0.001

def test_bearing_to_azimuth_se():
    """S 44°30' E → azimuth 135.5°"""
    bearing = {"degrees": 44, "minutes": 30, "seconds": 0, "ns": "S", "ew": "E"}
    assert abs(bearing_to_azimuth(bearing) - 135.5) < 0.001

def test_bearing_to_azimuth_sw():
    """S 45°30' W → azimuth 225.5°"""
    bearing = {"degrees": 45, "minutes": 30, "seconds": 0, "ns": "S", "ew": "W"}
    assert abs(bearing_to_azimuth(bearing) - 225.5) < 0.001

def test_bearing_to_azimuth_nw():
    """N 44°30' W → azimuth 315.5°"""
    bearing = {"degrees": 44, "minutes": 30, "seconds": 0, "ns": "N", "ew": "W"}
    assert abs(bearing_to_azimuth(bearing) - 315.5) < 0.001

def test_compute_coordinates_rectangle():
    """Lot 5-B synthetic case: 4 lines forming a rectangle, should return to start."""
    lines = [
        {"bearing": {"degrees": 45, "minutes": 30, "seconds": 0, "ns": "N", "ew": "E"}, "distance": 25.0, "to_corner": 2},
        {"bearing": {"degrees": 44, "minutes": 30, "seconds": 0, "ns": "S", "ew": "E"}, "distance": 52.0, "to_corner": 3},
        {"bearing": {"degrees": 45, "minutes": 30, "seconds": 0, "ns": "S", "ew": "W"}, "distance": 25.0, "to_corner": 4},
        {"bearing": {"degrees": 44, "minutes": 30, "seconds": 0, "ns": "N", "ew": "W"}, "distance": 52.0, "to_corner": 1},
    ]
    origin = (500.0, 500.0)
    coords = compute_coordinates(lines, origin)
    # Should have 5 points (4 corners + return to start)
    assert len(coords) == 5
    # First and last should be the same (closed polygon)
    assert abs(coords[0][0] - coords[-1][0]) < 0.01
    assert abs(coords[0][1] - coords[-1][1]) < 0.01
    # Second corner should be NE of first
    assert coords[1][0] > coords[0][0]  # east
    assert coords[1][1] > coords[0][1]  # north

def test_compute_coordinates_values():
    """Check actual coordinate values for Lot 5-B."""
    lines = [
        {"bearing": {"degrees": 45, "minutes": 30, "seconds": 0, "ns": "N", "ew": "E"}, "distance": 25.0, "to_corner": 2},
        {"bearing": {"degrees": 44, "minutes": 30, "seconds": 0, "ns": "S", "ew": "E"}, "distance": 52.0, "to_corner": 3},
        {"bearing": {"degrees": 45, "minutes": 30, "seconds": 0, "ns": "S", "ew": "W"}, "distance": 25.0, "to_corner": 4},
        {"bearing": {"degrees": 44, "minutes": 30, "seconds": 0, "ns": "N", "ew": "W"}, "distance": 52.0, "to_corner": 1},
    ]
    origin = (500.0, 500.0)
    coords = compute_coordinates(lines, origin)
    # N 45°30' E, 25m from (500,500):
    # easting = 500 + 25 * sin(45.5°) = 500 + 17.824 = 517.824
    # northing = 500 + 25 * cos(45.5°) = 500 + 17.534 = 517.534
    az = math.radians(45.5)
    expected_e = 500.0 + 25.0 * math.sin(az)
    expected_n = 500.0 + 25.0 * math.cos(az)
    assert abs(coords[1][0] - expected_e) < 0.001
    assert abs(coords[1][1] - expected_n) < 0.001
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd projects/ancestor-surveying && python -m pytest tests/test_coord_compute.py -v
```

Expected: FAIL — `ModuleNotFoundError`

- [ ] **Step 3: Implement coord_compute.py**

```python
# scripts/coord_compute.py
"""
Convert bearing-distance sequences into XY coordinates.

Bearings use Philippine surveying convention:
  N/S angle E/W → quadrant bearing measured from N or S toward E or W.

Converted to azimuth (clockwise from north):
  NE: azimuth = angle
  SE: azimuth = 180 - angle
  SW: azimuth = 180 + angle
  NW: azimuth = 360 - angle

Coordinates: (easting, northing) in meters.
  easting += distance * sin(azimuth)
  northing += distance * cos(azimuth)
"""
import math


def bearing_to_azimuth(bearing: dict) -> float:
    """Convert a quadrant bearing dict to azimuth in decimal degrees."""
    angle = bearing["degrees"] + bearing["minutes"] / 60.0 + bearing["seconds"] / 3600.0
    ns, ew = bearing["ns"], bearing["ew"]
    if ns == "N" and ew == "E":
        return angle
    elif ns == "S" and ew == "E":
        return 180.0 - angle
    elif ns == "S" and ew == "W":
        return 180.0 + angle
    elif ns == "N" and ew == "W":
        return 360.0 - angle
    else:
        raise ValueError(f"Invalid bearing quadrant: {ns} {ew}")


def compute_coordinates(lines: list, origin: tuple = (0.0, 0.0)) -> list:
    """
    Compute XY coordinates from a sequence of bearing-distance lines.

    Args:
        lines: List of dicts with 'bearing' and 'distance' keys.
        origin: (easting, northing) of the starting point.

    Returns:
        List of (easting, northing) tuples, starting with origin
        and ending with the computed return-to-start point.
    """
    coords = [origin]
    e, n = origin
    for line in lines:
        azimuth_deg = bearing_to_azimuth(line["bearing"])
        azimuth_rad = math.radians(azimuth_deg)
        dist = line["distance"]
        e += dist * math.sin(azimuth_rad)
        n += dist * math.cos(azimuth_rad)
        coords.append((e, n))
    return coords
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd projects/ancestor-surveying && python -m pytest tests/test_coord_compute.py -v
```

Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add projects/ancestor-surveying/scripts/coord_compute.py projects/ancestor-surveying/tests/test_coord_compute.py
git commit -m "feat(ancestor): coordinate computation — bearing-distance to XY"
```

---

### Task 4: Closure Check and Area Computation (`closure_check.py`, `area_compute.py`)

**Files:**
- Create: `projects/ancestor-surveying/scripts/closure_check.py`
- Create: `projects/ancestor-surveying/scripts/area_compute.py`
- Create: `projects/ancestor-surveying/tests/test_closure_check.py`
- Create: `projects/ancestor-surveying/tests/test_area_compute.py`

- [ ] **Step 1: Write failing tests for closure_check**

```python
# tests/test_closure_check.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from closure_check import compute_closure_error, check_closure

def test_closure_error_perfect():
    """A perfectly closed polygon has zero closure error."""
    # Square: (0,0) → (10,0) → (10,10) → (0,10) → (0,0)
    coords = [(0, 0), (10, 0), (10, 10), (0, 10), (0, 0)]
    error = compute_closure_error(coords)
    assert abs(error["linear_error"]) < 0.0001
    assert error["precision_ratio"] == float("inf") or error["precision_ratio"] > 1_000_000

def test_closure_error_with_gap():
    """A polygon that doesn't close should report the gap."""
    # Last point doesn't return to origin
    coords = [(0, 0), (10, 0), (10, 10), (0, 10), (0.5, 0.3)]
    error = compute_closure_error(coords)
    assert error["linear_error"] > 0.5
    assert error["de"] == 0.5
    assert error["dn"] == 0.3

def test_check_closure_pass():
    """Closed polygon passes tolerance check."""
    coords = [(0, 0), (10, 0), (10, 10), (0, 10), (0, 0)]
    result = check_closure(coords, tolerance_m=0.1)
    assert result["passed"] is True

def test_check_closure_fail():
    """Open polygon fails tolerance check."""
    coords = [(0, 0), (10, 0), (10, 10), (0, 10), (0.5, 0.3)]
    result = check_closure(coords, tolerance_m=0.1)
    assert result["passed"] is False
    assert result["linear_error"] > 0.1
```

- [ ] **Step 2: Write failing tests for area_compute**

```python
# tests/test_area_compute.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from area_compute import compute_area, check_area

def test_area_square():
    """10x10 square = 100 sqm."""
    coords = [(0, 0), (10, 0), (10, 10), (0, 10)]
    assert abs(compute_area(coords) - 100.0) < 0.01

def test_area_triangle():
    """Right triangle with legs 10, 10 = 50 sqm."""
    coords = [(0, 0), (10, 0), (0, 10)]
    assert abs(compute_area(coords) - 50.0) < 0.01

def test_area_lot5b_synthetic():
    """Lot 5-B stated area is 1,300 sqm. Computed should be close."""
    # Using the coords from coord_compute for Lot 5-B (25m x 52m rectangle)
    # Area of a parallelogram: base * height
    # For a rectangle with sides 25 and 52: area = 25 * 52 = 1300
    # But the angles mean it's not exactly a rectangle — it's a parallelogram.
    # With bearings N45°30'E and S44°30'E, the interior angle is 90°.
    # So it IS a rectangle: 25 * 52 = 1300 sqm exactly.
    import math
    az1 = math.radians(45.5)
    az2 = math.radians(135.5)
    coords = [
        (500.0, 500.0),
        (500.0 + 25 * math.sin(az1), 500.0 + 25 * math.cos(az1)),
        (500.0 + 25 * math.sin(az1) + 52 * math.sin(az2), 500.0 + 25 * math.cos(az1) + 52 * math.cos(az2)),
        (500.0 + 52 * math.sin(az2), 500.0 + 52 * math.cos(az2)),
    ]
    area = compute_area(coords)
    assert abs(area - 1300.0) < 1.0  # within 1 sqm

def test_check_area_pass():
    """Area within tolerance passes."""
    coords = [(0, 0), (10, 0), (10, 10), (0, 10)]
    result = check_area(coords, stated_area=100.0, tolerance_pct=1.0)
    assert result["passed"] is True

def test_check_area_fail():
    """Area outside tolerance fails."""
    coords = [(0, 0), (10, 0), (10, 10), (0, 10)]
    result = check_area(coords, stated_area=200.0, tolerance_pct=1.0)
    assert result["passed"] is False
```

- [ ] **Step 3: Run tests to verify they fail**

```bash
cd projects/ancestor-surveying && python -m pytest tests/test_closure_check.py tests/test_area_compute.py -v
```

Expected: FAIL — `ModuleNotFoundError`

- [ ] **Step 4: Implement closure_check.py**

```python
# scripts/closure_check.py
"""
Polygon closure validation.

A closed traverse should return to its starting point. The closure error
is the distance between the last computed point and the first point.

Precision ratio = total traverse distance / linear error.
Philippine standards vary by survey class, but typical:
  - 1st order: 1:50,000
  - 2nd order: 1:20,000
  - 3rd order: 1:5,000
"""
import math


def compute_closure_error(coords: list) -> dict:
    """
    Compute closure error for a coordinate sequence.

    Args:
        coords: List of (easting, northing) tuples. First and last
                points should be the same if perfectly closed.

    Returns:
        Dict with de, dn, linear_error, perimeter, precision_ratio.
    """
    de = coords[-1][0] - coords[0][0]
    dn = coords[-1][1] - coords[0][1]
    linear_error = math.sqrt(de**2 + dn**2)

    # Compute perimeter (total traverse distance)
    perimeter = 0.0
    for i in range(len(coords) - 1):
        dx = coords[i + 1][0] - coords[i][0]
        dy = coords[i + 1][1] - coords[i][1]
        perimeter += math.sqrt(dx**2 + dy**2)

    precision_ratio = (perimeter / linear_error) if linear_error > 1e-10 else float("inf")

    return {
        "de": round(de, 6),
        "dn": round(dn, 6),
        "linear_error": round(linear_error, 6),
        "perimeter": round(perimeter, 6),
        "precision_ratio": precision_ratio,
    }


def check_closure(coords: list, tolerance_m: float = 0.1) -> dict:
    """
    Check if polygon closure error is within tolerance.

    Args:
        coords: Coordinate sequence (first/last should be same if closed).
        tolerance_m: Maximum allowable linear error in meters.

    Returns:
        Dict with passed (bool), linear_error, perimeter, precision_ratio.
    """
    result = compute_closure_error(coords)
    result["passed"] = result["linear_error"] <= tolerance_m
    result["tolerance_m"] = tolerance_m
    return result
```

- [ ] **Step 5: Implement area_compute.py**

```python
# scripts/area_compute.py
"""
Area computation using the Shoelace formula.

Works on any simple (non-self-intersecting) polygon defined by
ordered coordinate pairs.
"""


def compute_area(coords: list) -> float:
    """
    Compute polygon area using the Shoelace formula.

    Args:
        coords: List of (easting, northing) tuples. Does NOT need to
                repeat the first point — the function closes it automatically.

    Returns:
        Area in square meters (always positive).
    """
    n = len(coords)
    if n < 3:
        raise ValueError("Need at least 3 points for area computation")
    area = 0.0
    for i in range(n):
        j = (i + 1) % n
        area += coords[i][0] * coords[j][1]
        area -= coords[j][0] * coords[i][1]
    return abs(area) / 2.0


def check_area(coords: list, stated_area: float, tolerance_pct: float = 5.0) -> dict:
    """
    Check if computed area matches stated area within tolerance.

    Args:
        coords: Polygon coordinates (no closing repeat needed).
        stated_area: Area stated in the title document (sqm).
        tolerance_pct: Allowable percentage difference.

    Returns:
        Dict with passed, computed_area, stated_area, difference_sqm, difference_pct.
    """
    computed = compute_area(coords)
    diff = abs(computed - stated_area)
    diff_pct = (diff / stated_area * 100.0) if stated_area > 0 else float("inf")
    return {
        "passed": diff_pct <= tolerance_pct,
        "computed_area": round(computed, 2),
        "stated_area": stated_area,
        "difference_sqm": round(diff, 2),
        "difference_pct": round(diff_pct, 2),
        "tolerance_pct": tolerance_pct,
    }
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
cd projects/ancestor-surveying && python -m pytest tests/test_closure_check.py tests/test_area_compute.py -v
```

Expected: All 9 tests PASS

- [ ] **Step 7: Commit**

```bash
git add projects/ancestor-surveying/scripts/closure_check.py projects/ancestor-surveying/scripts/area_compute.py projects/ancestor-surveying/tests/test_closure_check.py projects/ancestor-surveying/tests/test_area_compute.py
git commit -m "feat(ancestor): closure check and area computation with validation"
```

---

### Task 5: Least Squares Adjustment (`least_squares.py`)

Fits theoretical coordinates to actual field measurements, identifies outliers.

**Files:**
- Create: `projects/ancestor-surveying/scripts/least_squares.py`
- Create: `projects/ancestor-surveying/tests/test_least_squares.py`

- [ ] **Step 1: Write failing tests**

```python
# tests/test_least_squares.py
import sys, os
import math
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from least_squares import adjust_coordinates, detect_outliers

def test_adjust_perfect_match():
    """Identical point sets should have zero residuals."""
    theoretical = [(0, 0), (10, 0), (10, 10), (0, 10)]
    actual = [(0, 0), (10, 0), (10, 10), (0, 10)]
    result = adjust_coordinates(theoretical, actual)
    assert result["rmse"] < 0.001
    for r in result["residuals"]:
        assert r["distance"] < 0.001

def test_adjust_with_shift():
    """Shifted point set should be aligned by translation + rotation."""
    theoretical = [(0, 0), (10, 0), (10, 10), (0, 10)]
    # Shift everything by (1, 1)
    actual = [(1, 1), (11, 1), (11, 11), (1, 11)]
    result = adjust_coordinates(theoretical, actual)
    # After adjustment, residuals should be near zero
    assert result["rmse"] < 0.01

def test_adjust_with_scatter():
    """Points with realistic scatter should have small residuals."""
    theoretical = [(500, 500), (517.68, 517.68), (553.40, 481.96), (535.72, 464.28)]
    actual = [(500.0, 500.0), (517.80, 517.75), (553.50, 481.90), (535.60, 464.00)]
    result = adjust_coordinates(theoretical, actual)
    assert result["rmse"] < 0.5  # sub-meter after adjustment

def test_detect_outliers():
    """A point with large residual should be flagged."""
    residuals = [
        {"point_index": 0, "distance": 0.05},
        {"point_index": 1, "distance": 0.08},
        {"point_index": 2, "distance": 0.06},
        {"point_index": 3, "distance": 1.50},  # outlier
    ]
    outliers = detect_outliers(residuals, threshold_sigma=2.0)
    assert len(outliers) == 1
    assert outliers[0]["point_index"] == 3

def test_synthetic_lot5b():
    """Full Lot 5-B synthetic case: corner 4 should be flagged as outlier."""
    # Theoretical from 25m TD
    az1 = math.radians(45.5)
    az2 = math.radians(135.5)
    t1 = (500.0, 500.0)
    t2 = (500.0 + 25 * math.sin(az1), 500.0 + 25 * math.cos(az1))
    t3 = (t2[0] + 52 * math.sin(az2), t2[1] + 52 * math.cos(az2))
    t4 = (t1[0] + 52 * math.sin(az2), t1[1] + 52 * math.cos(az2))
    theoretical = [t1, t2, t3, t4]

    # Actual from spec (corner 4 has larger error)
    actual = [
        (500.000, 500.000),
        (517.680, 517.680),
        (553.402, 481.958),
        (535.722, 464.278),  # ~0.4m error
    ]

    result = adjust_coordinates(theoretical, actual)
    outliers = detect_outliers(result["residuals"], threshold_sigma=2.0)
    # Corner 4 (index 3) should have the largest residual
    max_residual = max(result["residuals"], key=lambda r: r["distance"])
    assert max_residual["point_index"] == 3
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd projects/ancestor-surveying && python -m pytest tests/test_least_squares.py -v
```

Expected: FAIL — `ModuleNotFoundError`

- [ ] **Step 3: Implement least_squares.py**

```python
# scripts/least_squares.py
"""
Least squares adjustment for survey coordinates.

Fits theoretical coordinates to actual field measurements using a
Helmert (4-parameter) transformation: translation (dx, dy),
rotation, and scale.

This finds the best rigid transformation that aligns the two point sets,
then reports residuals per point. Large residuals indicate problem points.
"""
import math
import numpy as np
from scipy.optimize import least_squares as scipy_least_squares


def _helmert_residuals(params, theoretical, actual):
    """Compute residuals for Helmert transformation."""
    dx, dy, scale, rotation = params
    cos_r = math.cos(rotation)
    sin_r = math.sin(rotation)
    residuals = []
    for (tx, ty), (ax, ay) in zip(theoretical, actual):
        # Transform theoretical point
        fx = dx + scale * (tx * cos_r - ty * sin_r)
        fy = dy + scale * (tx * sin_r + ty * cos_r)
        residuals.extend([fx - ax, fy - ay])
    return residuals


def adjust_coordinates(theoretical: list, actual: list) -> dict:
    """
    Fit theoretical coordinates to actual measurements using Helmert transformation.

    Args:
        theoretical: List of (easting, northing) tuples — from title TD.
        actual: List of (easting, northing) tuples — from field survey.
        Must be same length, corresponding by index.

    Returns:
        Dict with:
          - params: {dx, dy, scale, rotation_deg}
          - residuals: list of {point_index, de, dn, distance}
          - rmse: root mean square error of residuals
    """
    if len(theoretical) != len(actual):
        raise ValueError("Point sets must have same length")

    t = np.array(theoretical)
    a = np.array(actual)

    # Initial guess: no rotation, unit scale, translation = centroid difference
    t_centroid = t.mean(axis=0)
    a_centroid = a.mean(axis=0)
    x0 = [a_centroid[0] - t_centroid[0], a_centroid[1] - t_centroid[1], 1.0, 0.0]

    result = scipy_least_squares(
        _helmert_residuals, x0, args=(theoretical, actual), method="lm"
    )

    dx, dy, scale, rotation = result.x
    cos_r = math.cos(rotation)
    sin_r = math.sin(rotation)

    residuals = []
    sum_sq = 0.0
    for i, ((tx, ty), (ax, ay)) in enumerate(zip(theoretical, actual)):
        fx = dx + scale * (tx * cos_r - ty * sin_r)
        fy = dy + scale * (tx * sin_r + ty * cos_r)
        de = fx - ax
        dn = fy - ay
        dist = math.sqrt(de**2 + dn**2)
        sum_sq += dist**2
        residuals.append({
            "point_index": i,
            "de": round(de, 6),
            "dn": round(dn, 6),
            "distance": round(dist, 6),
        })

    rmse = math.sqrt(sum_sq / len(residuals))

    return {
        "params": {
            "dx": round(dx, 6),
            "dy": round(dy, 6),
            "scale": round(scale, 6),
            "rotation_deg": round(math.degrees(rotation), 6),
        },
        "residuals": residuals,
        "rmse": round(rmse, 6),
    }


def detect_outliers(residuals: list, threshold_sigma: float = 2.0) -> list:
    """
    Flag points with residuals exceeding threshold_sigma standard deviations.

    Args:
        residuals: List of dicts with 'point_index' and 'distance'.
        threshold_sigma: Number of standard deviations for outlier threshold.

    Returns:
        List of residual dicts that are outliers.
    """
    distances = [r["distance"] for r in residuals]
    if len(distances) < 3:
        return []
    mean_d = sum(distances) / len(distances)
    std_d = math.sqrt(sum((d - mean_d) ** 2 for d in distances) / len(distances))
    if std_d < 1e-10:
        return []
    threshold = mean_d + threshold_sigma * std_d
    return [r for r in residuals if r["distance"] > threshold]
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd projects/ancestor-surveying && python -m pytest tests/test_least_squares.py -v
```

Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add projects/ancestor-surveying/scripts/least_squares.py projects/ancestor-surveying/tests/test_least_squares.py
git commit -m "feat(ancestor): least squares adjustment with Helmert transform and outlier detection"
```

---

### Task 6: DXF Generation (`generate_dxf.py`)

Produces AutoCAD-compatible .dxf files with boundary plan, labels, and annotations.

**Files:**
- Create: `projects/ancestor-surveying/scripts/generate_dxf.py`
- Create: `projects/ancestor-surveying/tests/test_generate_dxf.py`

- [ ] **Step 1: Write failing tests**

```python
# tests/test_generate_dxf.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from generate_dxf import generate_boundary_plan
import ezdxf

def test_generate_dxf_creates_file(tmp_path):
    """Should create a valid .dxf file."""
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
    # Verify it's a valid DXF
    doc = ezdxf.readfile(output_path)
    assert doc is not None

def test_dxf_has_boundary_layer(tmp_path):
    """DXF should have a BOUNDARY layer with the polygon."""
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
    """DXF should have corner labels (1, 2, 3, 4)."""
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd projects/ancestor-surveying && python -m pytest tests/test_generate_dxf.py -v
```

Expected: FAIL — `ModuleNotFoundError`

- [ ] **Step 3: Implement generate_dxf.py**

```python
# scripts/generate_dxf.py
"""
Generate AutoCAD-compatible .dxf boundary plan files.

Produces a DXF with:
  - BOUNDARY layer: closed polygon of the lot boundary
  - LABELS layer: corner numbers, bearing-distance annotations on each line
  - ANNOTATIONS layer: lot name, plan number, area

Designed to be opened and edited in AutoCAD by the surveying team.
"""
import math
import ezdxf


def _midpoint(p1: tuple, p2: tuple) -> tuple:
    return ((p1[0] + p2[0]) / 2.0, (p1[1] + p2[1]) / 2.0)


def _line_angle(p1: tuple, p2: tuple) -> float:
    """Angle of line from p1 to p2 in degrees (for text rotation)."""
    dx = p2[0] - p1[0]
    dy = p2[1] - p1[1]
    return math.degrees(math.atan2(dy, dx))


def generate_boundary_plan(
    lot_data: dict,
    output_path: str,
    neighbor_lots: list = None,
    discrepancies: list = None,
) -> str:
    """
    Generate a DXF boundary plan.

    Args:
        lot_data: Dict with keys:
            - lot_name: str (e.g., "Lot 5-B")
            - plan_number: str (e.g., "Psd-04-123456")
            - coords: list of (easting, northing) tuples (no closing repeat)
            - lines: list of dicts with bearing_text, distance, to_corner
            - area_sqm: float
        output_path: Path to write the .dxf file.
        neighbor_lots: Optional list of neighbor lot_data dicts to draw as context.
        discrepancies: Optional list of dicts with annotation text and location.

    Returns:
        The output_path.
    """
    doc = ezdxf.new("R2010")
    msp = doc.modelspace()

    # Create layers
    doc.layers.add("BOUNDARY", color=7)  # white
    doc.layers.add("LABELS", color=3)  # green
    doc.layers.add("ANNOTATIONS", color=1)  # red
    if neighbor_lots:
        doc.layers.add("NEIGHBORS", color=8)  # gray

    coords = lot_data["coords"]
    n = len(coords)

    # Draw boundary polygon
    points = list(coords) + [coords[0]]  # close the polygon
    for i in range(len(points) - 1):
        msp.add_line(points[i], points[i + 1], dxfattribs={"layer": "BOUNDARY"})

    # Draw corner markers and labels
    text_height = _compute_text_height(coords)
    marker_size = text_height * 0.3
    for i, (e, n_coord) in enumerate(coords):
        corner_num = i + 1
        # Corner marker (small cross)
        msp.add_line(
            (e - marker_size, n_coord), (e + marker_size, n_coord),
            dxfattribs={"layer": "LABELS"},
        )
        msp.add_line(
            (e, n_coord - marker_size), (e, n_coord + marker_size),
            dxfattribs={"layer": "LABELS"},
        )
        # Corner number label
        msp.add_text(
            str(corner_num),
            height=text_height,
            dxfattribs={"layer": "LABELS"},
        ).set_placement((e + marker_size * 1.5, n_coord + marker_size * 1.5))

    # Bearing-distance labels on each line
    lines = lot_data.get("lines", [])
    for i, line in enumerate(lines):
        j = (i + 1) % n
        mid = _midpoint(coords[i], coords[j])
        angle = _line_angle(coords[i], coords[j])
        # Offset text slightly perpendicular to line
        offset_dist = text_height * 1.2
        perp_angle = math.radians(angle + 90)
        text_pos = (
            mid[0] + offset_dist * math.cos(perp_angle),
            mid[1] + offset_dist * math.sin(perp_angle),
        )
        label = f"{line['bearing_text']}, {line['distance']:.2f} m"
        text_entity = msp.add_text(
            label,
            height=text_height * 0.7,
            rotation=angle if -90 <= angle <= 90 else angle + 180,
            dxfattribs={"layer": "LABELS"},
        )
        text_entity.set_placement(text_pos)

    # Lot name and area annotation (centered in polygon)
    centroid = (
        sum(c[0] for c in coords) / n,
        sum(c[1] for c in coords) / n,
    )
    msp.add_text(
        lot_data["lot_name"],
        height=text_height * 1.5,
        dxfattribs={"layer": "ANNOTATIONS"},
    ).set_placement(centroid)
    msp.add_text(
        f"{lot_data['plan_number']}",
        height=text_height * 0.8,
        dxfattribs={"layer": "ANNOTATIONS"},
    ).set_placement((centroid[0], centroid[1] - text_height * 2))
    msp.add_text(
        f"Area: {lot_data['area_sqm']:,.0f} sq.m.",
        height=text_height * 0.8,
        dxfattribs={"layer": "ANNOTATIONS"},
    ).set_placement((centroid[0], centroid[1] - text_height * 4))

    # Draw neighbor lots if provided
    if neighbor_lots:
        for nb in neighbor_lots:
            nb_coords = nb["coords"]
            nb_points = list(nb_coords) + [nb_coords[0]]
            for i in range(len(nb_points) - 1):
                msp.add_line(
                    nb_points[i], nb_points[i + 1],
                    dxfattribs={"layer": "NEIGHBORS"},
                )
            nb_centroid = (
                sum(c[0] for c in nb_coords) / len(nb_coords),
                sum(c[1] for c in nb_coords) / len(nb_coords),
            )
            msp.add_text(
                nb["lot_name"],
                height=text_height,
                dxfattribs={"layer": "NEIGHBORS"},
            ).set_placement(nb_centroid)

    # Discrepancy annotations
    if discrepancies:
        for disc in discrepancies:
            pos = disc.get("position", centroid)
            msp.add_text(
                disc["text"],
                height=text_height * 0.6,
                dxfattribs={"layer": "ANNOTATIONS", "color": 1},
            ).set_placement(pos)

    doc.saveas(output_path)
    return output_path


def _compute_text_height(coords: list) -> float:
    """Compute appropriate text height based on lot extent."""
    es = [c[0] for c in coords]
    ns = [c[1] for c in coords]
    extent = max(max(es) - min(es), max(ns) - min(ns))
    return max(0.5, extent / 40.0)
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd projects/ancestor-surveying && python -m pytest tests/test_generate_dxf.py -v
```

Expected: All 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add projects/ancestor-surveying/scripts/generate_dxf.py projects/ancestor-surveying/tests/test_generate_dxf.py
git commit -m "feat(ancestor): DXF boundary plan generation with layers and annotations"
```

---

### Task 7: DOCX Report Generation (`generate_docx.py`)

Produces Word survey reports with evidence tables and professional opinion.

**Files:**
- Create: `projects/ancestor-surveying/scripts/generate_docx.py`
- Create: `projects/ancestor-surveying/tests/test_generate_docx.py`

- [ ] **Step 1: Write failing tests**

```python
# tests/test_generate_docx.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from generate_docx import generate_survey_report
from docx import Document

def test_generate_docx_creates_file(tmp_path):
    """Should create a valid .docx file."""
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
    """Report should have all required sections."""
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
    # Should have these sections
    assert any("Documents Reviewed" in h for h in headings)
    assert any("Findings" in h or "Errors" in h for h in headings)
    assert any("QA" in h or "Quality" in h for h in headings)
    assert any("Recommendation" in h for h in headings)
    assert any("Coordinates" in h for h in headings)
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd projects/ancestor-surveying && python -m pytest tests/test_generate_docx.py -v
```

Expected: FAIL — `ModuleNotFoundError`

- [ ] **Step 3: Implement generate_docx.py**

```python
# scripts/generate_docx.py
"""
Generate Word (.docx) boundary survey reports.

Report structure:
  1. Title and project info
  2. Documents reviewed (with seniority ranking)
  3. Findings (errors found, with source and resolution)
  4. QA summary table
  5. Professional recommendation
  6. Coordinate table
"""
from docx import Document
from docx.shared import Inches, Pt
from docx.enum.table import WD_TABLE_ALIGNMENT


def generate_survey_report(report_data: dict, output_path: str) -> str:
    """
    Generate a boundary survey report as .docx.

    Args:
        report_data: Dict with keys:
            - lot_name, plan_number, location, client, date
            - documents_reviewed: list of {title, type, year}
            - errors_found: list of {description, source, resolution}
            - qa_summary: list of {check, result, details}
            - recommendation: str
            - coordinates: list of {corner, easting, northing, monument}
        output_path: Path to write the .docx file.

    Returns:
        The output_path.
    """
    doc = Document()

    # Title
    doc.add_heading(f"Boundary Survey Report", level=0)
    doc.add_heading(f"{report_data['lot_name']} — {report_data['plan_number']}", level=1)

    # Project info
    info_table = doc.add_table(rows=4, cols=2)
    info_table.alignment = WD_TABLE_ALIGNMENT.LEFT
    info_data = [
        ("Location", report_data.get("location", "")),
        ("Client", report_data.get("client", "")),
        ("Date", report_data.get("date", "")),
        ("Plan Number", report_data.get("plan_number", "")),
    ]
    for i, (label, value) in enumerate(info_data):
        info_table.rows[i].cells[0].text = label
        info_table.rows[i].cells[1].text = str(value)
    doc.add_paragraph("")  # spacer

    # Documents Reviewed
    doc.add_heading("Documents Reviewed", level=2)
    docs_table = doc.add_table(rows=1, cols=3)
    docs_table.style = "Table Grid"
    hdr = docs_table.rows[0].cells
    hdr[0].text = "Document"
    hdr[1].text = "Type"
    hdr[2].text = "Year"
    for d in report_data.get("documents_reviewed", []):
        row = docs_table.add_row().cells
        row[0].text = d["title"]
        row[1].text = d["type"]
        row[2].text = str(d["year"])

    # Findings / Errors
    doc.add_heading("Findings and Errors", level=2)
    errors = report_data.get("errors_found", [])
    if errors:
        errors_table = doc.add_table(rows=1, cols=3)
        errors_table.style = "Table Grid"
        hdr = errors_table.rows[0].cells
        hdr[0].text = "Description"
        hdr[1].text = "Source"
        hdr[2].text = "Resolution"
        for e in errors:
            row = errors_table.add_row().cells
            row[0].text = e["description"]
            row[1].text = e["source"]
            row[2].text = e["resolution"]
    else:
        doc.add_paragraph("No errors or discrepancies found.")

    # QA Summary
    doc.add_heading("QA Verification Summary", level=2)
    qa_table = doc.add_table(rows=1, cols=3)
    qa_table.style = "Table Grid"
    hdr = qa_table.rows[0].cells
    hdr[0].text = "Check"
    hdr[1].text = "Result"
    hdr[2].text = "Details"
    for q in report_data.get("qa_summary", []):
        row = qa_table.add_row().cells
        row[0].text = q["check"]
        row[1].text = q["result"]
        row[2].text = q["details"]

    # Recommendation
    doc.add_heading("Professional Recommendation", level=2)
    doc.add_paragraph(report_data.get("recommendation", ""))

    # Coordinate Table
    doc.add_heading("Boundary Coordinates", level=2)
    coord_table = doc.add_table(rows=1, cols=4)
    coord_table.style = "Table Grid"
    hdr = coord_table.rows[0].cells
    hdr[0].text = "Corner"
    hdr[1].text = "Easting (m)"
    hdr[2].text = "Northing (m)"
    hdr[3].text = "Monument"
    for c in report_data.get("coordinates", []):
        row = coord_table.add_row().cells
        row[0].text = str(c["corner"])
        row[1].text = f"{c['easting']:.3f}"
        row[2].text = f"{c['northing']:.3f}"
        row[3].text = c.get("monument", "")

    doc.save(output_path)
    return output_path
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd projects/ancestor-surveying && python -m pytest tests/test_generate_docx.py -v
```

Expected: All 2 tests PASS

- [ ] **Step 5: Commit**

```bash
git add projects/ancestor-surveying/scripts/generate_docx.py projects/ancestor-surveying/tests/test_generate_docx.py
git commit -m "feat(ancestor): DOCX report generation with evidence tables and QA summary"
```

---

### Task 8: PDF Map Generation (`generate_pdf.py`)

Produces PDF map exports using matplotlib.

**Files:**
- Create: `projects/ancestor-surveying/scripts/generate_pdf.py`
- Create: `projects/ancestor-surveying/tests/test_generate_pdf.py`

- [ ] **Step 1: Write failing tests**

```python
# tests/test_generate_pdf.py
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'scripts'))
from generate_pdf import generate_boundary_map

def test_generate_pdf_creates_file(tmp_path):
    """Should create a PDF file."""
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
    assert os.path.getsize(output_path) > 1000  # not an empty file

def test_generate_pdf_with_neighbors(tmp_path):
    """Should create PDF with neighbor lots drawn."""
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd projects/ancestor-surveying && python -m pytest tests/test_generate_pdf.py -v
```

Expected: FAIL — `ModuleNotFoundError`

- [ ] **Step 3: Implement generate_pdf.py**

```python
# scripts/generate_pdf.py
"""
Generate PDF map exports of boundary plans using matplotlib.

Produces a clean survey-style map with:
  - Lot boundary polygon (filled with light color)
  - Corner labels
  - Bearing-distance annotations
  - Neighbor lots (dashed outline)
  - North arrow and scale bar
  - Title block
"""
import matplotlib
matplotlib.use("Agg")  # non-interactive backend
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyArrowPatch
import numpy as np


def generate_boundary_map(
    lot_data: dict,
    output_path: str,
    neighbor_lots: list = None,
    field_points: list = None,
) -> str:
    """
    Generate a PDF boundary map.

    Args:
        lot_data: Dict with lot_name, plan_number, coords, lines, area_sqm.
        output_path: Path to write the PDF.
        neighbor_lots: Optional list of {lot_name, coords} for context.
        field_points: Optional list of (easting, northing) actual measurements.

    Returns:
        The output_path.
    """
    fig, ax = plt.subplots(1, 1, figsize=(11, 8.5))  # landscape letter

    coords = lot_data["coords"]
    n = len(coords)

    # Draw main lot polygon
    polygon = plt.Polygon(coords, fill=True, facecolor="#e8f4e8", edgecolor="black", linewidth=2)
    ax.add_patch(polygon)

    # Corner markers and labels
    for i, (e, nc) in enumerate(coords):
        ax.plot(e, nc, "ko", markersize=6)
        ax.annotate(
            str(i + 1),
            (e, nc),
            textcoords="offset points",
            xytext=(8, 8),
            fontsize=10,
            fontweight="bold",
        )

    # Bearing-distance labels on each line
    lines = lot_data.get("lines", [])
    for i, line in enumerate(lines):
        j = (i + 1) % n
        mid_e = (coords[i][0] + coords[j][0]) / 2
        mid_n = (coords[i][1] + coords[j][1]) / 2
        label = f"{line.get('bearing_text', '')}\n{line['distance']:.2f} m"
        # Offset perpendicular to line
        dx = coords[j][0] - coords[i][0]
        dy = coords[j][1] - coords[i][1]
        length = np.sqrt(dx**2 + dy**2)
        if length > 0:
            offset = 2.0
            nx, ny = -dy / length * offset, dx / length * offset
            ax.annotate(
                label,
                (mid_e + nx, mid_n + ny),
                fontsize=7,
                ha="center",
                va="center",
                color="#333333",
            )

    # Neighbor lots
    if neighbor_lots:
        for nb in neighbor_lots:
            nb_coords = nb["coords"]
            nb_polygon = plt.Polygon(
                nb_coords, fill=False, edgecolor="gray",
                linewidth=1, linestyle="--",
            )
            ax.add_patch(nb_polygon)
            nb_centroid = (
                sum(c[0] for c in nb_coords) / len(nb_coords),
                sum(c[1] for c in nb_coords) / len(nb_coords),
            )
            ax.annotate(
                nb["lot_name"], nb_centroid,
                fontsize=8, ha="center", color="gray", style="italic",
            )

    # Field measurement points
    if field_points:
        for fp in field_points:
            ax.plot(fp[0], fp[1], "r^", markersize=5)
        ax.plot([], [], "r^", label="Field measurements")
        ax.legend(loc="lower right", fontsize=8)

    # Title block
    title = f"{lot_data['lot_name']} — {lot_data.get('plan_number', '')}"
    area_text = f"Area: {lot_data.get('area_sqm', 0):,.0f} sq.m."
    ax.set_title(title, fontsize=14, fontweight="bold", pad=20)
    ax.text(
        0.02, 0.02, area_text,
        transform=ax.transAxes, fontsize=10,
        verticalalignment="bottom",
        bbox=dict(boxstyle="round", facecolor="wheat", alpha=0.8),
    )

    # North arrow
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

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd projects/ancestor-surveying && python -m pytest tests/test_generate_pdf.py -v
```

Expected: All 2 tests PASS

- [ ] **Step 5: Commit**

```bash
git add projects/ancestor-surveying/scripts/generate_pdf.py projects/ancestor-surveying/tests/test_generate_pdf.py
git commit -m "feat(ancestor): PDF map generation with boundary plot and annotations"
```

---

### Task 9: Synthetic Test Case Data

Creates the synthetic Lot 5-B test data files so the pipeline can run end-to-end.

**Files:**
- Create: `projects/ancestor-surveying/test-data/synthetic/lot-5b-input.json`
- Create: `projects/ancestor-surveying/test-data/synthetic/lot-5b-expected.json`

- [ ] **Step 1: Create input data file**

```json
{
  "project": {
    "client": "Juan Dela Cruz",
    "date": "2026-03-26",
    "scope": "Boundary survey to resolve dispute with Lot 5-A owner",
    "deliverables": ["dxf", "docx", "pdf"]
  },
  "lots": {
    "subject": {
      "lot_name": "Lot 5-B",
      "title": "TCT No. 98766",
      "plan_number": "Psd-04-123456",
      "year": 2003,
      "location": "Brgy. San Isidro, Municipality of Batangas, Province of Batangas",
      "technical_description": "A parcel of land (Lot 5-B, Psd-04-123456), situated in Brgy. San Isidro,\nMunicipality of Batangas, Province of Batangas.\n\nBeginning at corner 1, identical to corner 3 of Lot 5-A;\nthence N 45°30' E, 25.00 m to corner 2;\nthence S 44°30' E, 52.00 m to corner 3;\nthence S 45°30' W, 25.00 m to corner 4;\nthence N 44°30' W, 52.00 m to corner 1 (point of beginning).\n\nArea: 1,300 sq.m., more or less.",
      "stated_area": 1300.0
    },
    "neighbor": {
      "lot_name": "Lot 5-A",
      "title": "TCT No. 98765",
      "plan_number": "Psd-04-123456",
      "year": 2003,
      "technical_description": "Beginning at corner 1, identical to corner 2 of Lot 5;\nthence S 45°30' E, 24.00 m to corner 2;\nthence S 44°30' E, 52.00 m to corner 3, identical to corner 1 of Lot 5-B;\nthence N 45°30' W, 24.00 m to corner 4;\nthence N 44°30' W, 52.00 m to corner 1 (point of beginning).\n\nArea: 1,248 sq.m., more or less.",
      "stated_area": 1248.0
    },
    "parent": {
      "lot_name": "Lot 5",
      "title": "TCT No. 56789",
      "plan_number": "Psd-04-000001",
      "year": 1978,
      "technical_description": "Beginning at corner 1;\nthence N 45°30' E, 49.00 m to corner 2;\nthence S 44°30' E, 52.00 m to corner 3;\nthence S 45°30' W, 49.00 m to corner 4;\nthence N 44°30' W, 52.00 m to corner 1 (point of beginning).\n\nArea: 2,548 sq.m., more or less.",
      "stated_area": 2548.0
    }
  },
  "subdivision_tree": {
    "root": "OCT No. 1234",
    "root_year": 1952,
    "children": [
      {
        "title": "TCT No. 56789",
        "lot_name": "Lot 5",
        "year": 1978,
        "children": [
          {"title": "TCT No. 98765", "lot_name": "Lot 5-A", "year": 2003},
          {"title": "TCT No. 98766", "lot_name": "Lot 5-B", "year": 2003}
        ]
      }
    ]
  },
  "field_measurements": {
    "date": "2026-03-20",
    "equipment": "Total station + GPS",
    "corners": [
      {"corner": 1, "easting": 500.000, "northing": 500.000, "monument": "iron pin found"},
      {"corner": 2, "easting": 517.680, "northing": 517.680, "monument": "concrete monument"},
      {"corner": 3, "easting": 553.402, "northing": 481.958, "monument": "iron pin found"},
      {"corner": 4, "easting": 535.722, "northing": 464.278, "monument": "wooden peg (old, unreliable)"}
    ]
  }
}
```

Write to `projects/ancestor-surveying/test-data/synthetic/lot-5b-input.json`.

- [ ] **Step 2: Create expected output file**

```json
{
  "expected_flags": [
    {
      "type": "neighbor_mismatch",
      "description": "Shared boundary mismatch: Lot 5-A says 24.00m, Lot 5-B says 25.00m on bearing S 45°30' E / N 45°30' W",
      "lots": ["Lot 5-A", "Lot 5-B"],
      "severity": "error"
    },
    {
      "type": "seniority_ambiguity",
      "description": "Parent (Lot 5, 1978) says 49.00m total on NE side. Children: 25m + 24m = 49m. Both children are same year (2003) — need field evidence to determine which has the error.",
      "resolution_hint": "Field measurements support 25m (Lot 5-B). Lot 5-A likely has transcription error (25→24)."
    },
    {
      "type": "outlier_point",
      "description": "Corner 4 has larger residual (~0.4m) than other corners (~0.15m). Monument: wooden peg (degraded).",
      "recommendation": "Re-monumentation recommended for corner 4."
    }
  ],
  "expected_closure": {
    "lot_5b_closes": true,
    "lot_5a_closes": true,
    "lot_5_parent_closes": true
  },
  "expected_areas": {
    "lot_5b_computed": 1300.0,
    "lot_5a_computed": 1248.0,
    "lot_5_parent_computed": 2548.0,
    "children_sum_matches_parent": true
  },
  "expected_seniority_chain": [
    {"title": "OCT No. 1234", "year": 1952, "rank": 1},
    {"title": "TCT No. 56789", "year": 1978, "rank": 2},
    {"title": "TCT No. 98765", "year": 2003, "rank": 3},
    {"title": "TCT No. 98766", "year": 2003, "rank": 3}
  ],
  "expected_conclusion": "Lot 5-B boundary per TCT No. 98766 is correct (25.00m on shared boundary). Lot 5-A (TCT No. 98765) contains transcription error (24m should be 25m). Corner 4 monument degraded — recommend re-monumentation."
}
```

Write to `projects/ancestor-surveying/test-data/synthetic/lot-5b-expected.json`.

- [ ] **Step 3: Commit**

```bash
git add projects/ancestor-surveying/test-data/
git commit -m "feat(ancestor): synthetic Lot 5-B test case data with expected outputs"
```

---

### Task 10: End-to-End Synthetic Test (`test_synthetic_case.py`)

Runs all scripts in sequence on the synthetic data and validates outputs.

**Files:**
- Create: `projects/ancestor-surveying/tests/test_synthetic_case.py`

- [ ] **Step 1: Write the end-to-end test**

```python
# tests/test_synthetic_case.py
"""
End-to-end test: run the full pipeline on the synthetic Lot 5-B case.

This test exercises every script in sequence:
  1. Parse TDs for all three lots
  2. Compute coordinates for each
  3. Check closure for each
  4. Compute and validate areas
  5. Run least squares on subject lot vs field measurements
  6. Detect outliers
  7. Generate DXF, DOCX, PDF
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
    """Parse all three technical descriptions."""
    data = load_input()
    for key in ["subject", "neighbor", "parent"]:
        td = data["lots"][key]["technical_description"]
        result = parse_technical_description(td)
        assert len(result["lines"]) == 4, f"{key} should have 4 lines"
        assert result["stated_area"] == data["lots"][key]["stated_area"]


def test_phase2_closure_all_lots():
    """All three lots should close (no closure errors in TDs themselves)."""
    data = load_input()
    expected = load_expected()
    for key in ["subject", "neighbor", "parent"]:
        td = data["lots"][key]["technical_description"]
        parsed = parse_technical_description(td)
        coords = compute_coordinates(parsed["lines"], origin=(0, 0))
        result = check_closure(coords, tolerance_m=0.01)
        assert result["passed"], f"{key} failed closure check: {result['linear_error']}m"


def test_phase2_area_validation():
    """Computed areas should match stated areas."""
    data = load_input()
    for key in ["subject", "neighbor", "parent"]:
        td = data["lots"][key]["technical_description"]
        parsed = parse_technical_description(td)
        coords = compute_coordinates(parsed["lines"], origin=(0, 0))
        # Remove the closing point for area computation
        polygon_coords = coords[:-1]
        area = compute_area(polygon_coords)
        stated = data["lots"][key]["stated_area"]
        assert abs(area - stated) < 1.0, f"{key}: computed {area} vs stated {stated}"


def test_phase2_neighbor_mismatch():
    """Should detect the 24m vs 25m mismatch between Lot 5-A and Lot 5-B."""
    data = load_input()
    subject = parse_technical_description(data["lots"]["subject"]["technical_description"])
    neighbor = parse_technical_description(data["lots"]["neighbor"]["technical_description"])
    # The shared boundary is line 0 of subject (N 45°30' E, 25m)
    # and line 0 of neighbor (S 45°30' E, 24m) — but direction differs.
    # Detect by finding lines with same/opposite bearing but different distance.
    # In this case: subject line 0 is 25m, neighbor line 0 is 24m on parallel bearings.
    subject_distances = sorted([l["distance"] for l in subject["lines"]])
    neighbor_distances = sorted([l["distance"] for l in neighbor["lines"]])
    # Both have 52m lines (matching). Subject has 25m, neighbor has 24m (mismatch).
    assert 25.0 in [l["distance"] for l in subject["lines"]]
    assert 24.0 in [l["distance"] for l in neighbor["lines"]]
    assert 25.0 not in [l["distance"] for l in neighbor["lines"]]  # confirms mismatch


def test_phase2_subdivision_consistency():
    """Children areas should sum to approximately parent area."""
    data = load_input()
    subject_area = data["lots"]["subject"]["stated_area"]
    neighbor_area = data["lots"]["neighbor"]["stated_area"]
    parent_area = data["lots"]["parent"]["stated_area"]
    assert abs((subject_area + neighbor_area) - parent_area) < 1.0


def test_phase4_least_squares_subject():
    """Least squares fit of subject lot theoretical vs field measurements."""
    data = load_input()
    td = data["lots"]["subject"]["technical_description"]
    parsed = parse_technical_description(td)

    # Use field measurement corner 1 as origin
    field = data["field_measurements"]["corners"]
    origin = (field[0]["easting"], field[0]["northing"])
    theoretical_coords = compute_coordinates(parsed["lines"], origin=origin)
    theoretical = theoretical_coords[:-1]  # remove closing point

    actual = [(c["easting"], c["northing"]) for c in field]

    result = adjust_coordinates(theoretical, actual)
    assert result["rmse"] < 1.0  # should be well under 1m


def test_phase4_outlier_detection():
    """Corner 4 should be flagged as the largest residual."""
    data = load_input()
    td = data["lots"]["subject"]["technical_description"]
    parsed = parse_technical_description(td)

    field = data["field_measurements"]["corners"]
    origin = (field[0]["easting"], field[0]["northing"])
    theoretical = compute_coordinates(parsed["lines"], origin=origin)[:-1]
    actual = [(c["easting"], c["northing"]) for c in field]

    result = adjust_coordinates(theoretical, actual)
    max_residual = max(result["residuals"], key=lambda r: r["distance"])
    assert max_residual["point_index"] == 3  # corner 4 (0-indexed)


def test_phase5_generate_all_outputs(tmp_path):
    """Generate DXF, DOCX, and PDF for the synthetic case."""
    data = load_input()
    td = data["lots"]["subject"]["technical_description"]
    parsed = parse_technical_description(td)

    field = data["field_measurements"]["corners"]
    origin = (field[0]["easting"], field[0]["northing"])
    coords = compute_coordinates(parsed["lines"], origin=origin)[:-1]

    lot_data = {
        "lot_name": parsed["lot_name"],
        "plan_number": parsed["plan_number"],
        "coords": coords,
        "lines": [
            {
                "bearing_text": f"{l['bearing']['ns']} {l['bearing']['degrees']}°{l['bearing']['minutes']}' {l['bearing']['ew']}",
                "distance": l["distance"],
                "to_corner": l["to_corner"],
            }
            for l in parsed["lines"]
        ],
        "area_sqm": parsed["stated_area"],
    }

    # DXF
    dxf_path = str(tmp_path / "lot-5b.dxf")
    generate_boundary_plan(lot_data, dxf_path)
    assert os.path.exists(dxf_path)

    # DOCX
    docx_path = str(tmp_path / "lot-5b-report.docx")
    report_data = {
        "lot_name": parsed["lot_name"],
        "plan_number": parsed["plan_number"],
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
```

- [ ] **Step 2: Run end-to-end tests**

```bash
cd projects/ancestor-surveying && python -m pytest tests/test_synthetic_case.py -v
```

Expected: All 8 tests PASS

- [ ] **Step 3: Commit**

```bash
git add projects/ancestor-surveying/tests/test_synthetic_case.py
git commit -m "feat(ancestor): end-to-end synthetic test exercising full pipeline"
```

---

### Task 11: Claude Code Skills (Domain Prompts)

The skills that give Claude surveying context at each phase.

**Files:**
- Create: `projects/ancestor-surveying/skills/boundary-survey-workflow.md`
- Create: `projects/ancestor-surveying/skills/td-parsing.md`
- Create: `projects/ancestor-surveying/skills/error-patterns.md`
- Create: `projects/ancestor-surveying/skills/seniority-rules.md`
- Create: `projects/ancestor-surveying/skills/qa-checklist.md`
- Create: `projects/ancestor-surveying/skills/report-template.md`

- [ ] **Step 1: Create boundary-survey-workflow.md**

```markdown
# Boundary Survey Workflow

You are orchestrating a boundary survey for a Philippine land title. Follow these phases in order.

## Phase 1: Intake
- Read the input file (JSON or raw text).
- Identify: subject lot, neighbor lots, parent lot, field measurements.
- Confirm deliverables: DXF, DOCX, PDF.

## Phase 2: Theoretical Boundary
1. Parse each technical description using `scripts/td_parser.py`.
2. Compute coordinates using `scripts/coord_compute.py`.
3. Check closure using `scripts/closure_check.py` — tolerance depends on survey era.
4. Compute area using `scripts/area_compute.py` — compare against stated area.
5. Compare neighbor lots: find shared boundaries, flag distance/bearing mismatches.
6. Trace subdivision tree: verify children fit within parent.
7. Establish seniority: older documents take precedence. See `skills/seniority-rules.md`.
8. Flag all errors — see `skills/error-patterns.md`. Never correct originals, only flag.

## Phase 3: Field Measurements
- Load field measurement coordinates.
- Validate: check for impossible values, duplicates, obvious outliers.

## Phase 4: Reconciliation
1. Run `scripts/least_squares.py` — fit theoretical to actual.
2. Detect outliers. Large residuals = problem points.
3. Apply seniority: when theoretical and actual conflict, older survey wins (within era tolerance).
4. Document every discrepancy with source and resolution.

## Phase 5: QA (MUST PASS BEFORE OUTPUT)
- Run every check in `skills/qa-checklist.md`.
- If any check fails, fix and re-check (max 3 attempts).
- If still failing after 3 attempts, stop and report.

## Phase 6: Output
1. Generate DXF using `scripts/generate_dxf.py`.
2. Generate DOCX report using `scripts/generate_docx.py`.
3. Generate PDF map using `scripts/generate_pdf.py`.
4. Verify all three files exist and are non-empty.
5. Report complete with file paths.
```

Write to `projects/ancestor-surveying/skills/boundary-survey-workflow.md`.

- [ ] **Step 2: Create td-parsing.md**

```markdown
# Technical Description Parsing Guide

## Philippine TD Format

A typical Philippine technical description looks like:

```
A parcel of land (Lot 5-B, Psd-04-123456), situated in Brgy. San Isidro,
Municipality of Batangas, Province of Batangas.

Beginning at corner 1, identical to corner 3 of Lot 5-A;
thence N 45°30' E, 25.00 m to corner 2;
thence S 44°30' E, 52.00 m to corner 3;
thence S 45°30' W, 25.00 m to corner 4;
thence N 44°30' W, 52.00 m to corner 1 (point of beginning).

Area: 1,300 sq.m., more or less.
```

## Key Elements
- **Lot identifier:** In parentheses at the start — lot name + plan number.
- **Location:** Municipality, province.
- **Bearings:** N/S degrees°minutes'seconds" E/W. Seconds often omitted.
- **Distances:** Always in meters.
- **Corner references:** "identical to corner X of Lot Y" — these link lots together.
- **Area:** Stated at the end, "more or less" is standard.

## Script Usage
Run: `python scripts/td_parser.py` (imported as module)

```python
from td_parser import parse_technical_description
result = parse_technical_description(td_text)
# result = {lot_name, plan_number, stated_area, lines: [{bearing, distance, to_corner}], references}
```

## What To Watch For
- Missing seconds in bearings (assume 0)
- OCR artifacts: °→o, '→`, "→"
- "thence" sometimes spelled "Thence" or abbreviated
- Area may use "sq.m.", "sqm", "square meters"
- References are critical — they define how lots connect
```

Write to `projects/ancestor-surveying/skills/td-parsing.md`.

- [ ] **Step 3: Create error-patterns.md**

```markdown
# Common Error Patterns in Philippine Land Titles

## Bearing Errors
| Error | How to detect | Investigation |
|-------|--------------|---------------|
| N↔S swap | Polygon doesn't close; reversing one N/S fixes it | Check original scan |
| E↔W swap | Same as above | Same |
| Degree misread | Closure error on one segment | Compare against parent/older title |

## Distance Errors
| Error | How to detect | Investigation |
|-------|--------------|---------------|
| Digit misread (5↔6, 3↔8) | Segment too long/short vs neighbors | Check parent title |
| Transposed digits (52↔25) | Dramatic closure error | Usually obvious from context |
| Missing decimal (2500↔25.00) | Impossible distance | Check units |

## Inter-Lot Errors
| Error | How to detect | Investigation |
|-------|--------------|---------------|
| Shared boundary mismatch | Adjacent lots disagree on distance/bearing | Apply seniority |
| Subdivision overflow | Children don't fit in parent | Recompute all children |
| Transcription compounding | Errors amplify through generations | Trace to mother title |

## Rules
1. **Never correct the original document.** Only flag.
2. **Always preserve what the document says.** Your job is to identify what's wrong, not to fix titles.
3. **Flag with evidence.** Every flag must cite the specific documents that conflict.
4. **Recommend, don't decide.** Present the evidence and your recommendation. The surveyor makes the call.
```

Write to `projects/ancestor-surveying/skills/error-patterns.md`.

- [ ] **Step 4: Create seniority-rules.md**

```markdown
# Document Seniority Rules

## The Principle
Older documents take legal precedence over newer documents. This is a fundamental principle of Philippine land law.

## Seniority Ranking
1. **OCT (Original Certificate of Title)** — highest seniority. The root.
2. **Early TCTs** — closer to the root = higher seniority.
3. **Later TCTs** — further subdivisions = lower seniority.
4. **Same-year documents** — no automatic seniority between siblings. Use field evidence.

## How to Apply
- When two documents conflict, the older one wins.
- When two same-year documents conflict (e.g., two 2003 TCTs from the same subdivision), you need external evidence: the parent title's dimensions, field measurements, or other documentation.
- The parent title is always the anchor. If Lot 5 (1978) says 49m, and children say 25m + 24m = 49m, that's consistent. But which child has the error requires additional evidence.

## Historical Accuracy
- 1908 surveys: ~3m accuracy (chain + compass)
- 1950s surveys: ~1m accuracy (transit + tape)
- 1980s surveys: ~0.3m accuracy (theodolite + steel tape)
- 2000s+ surveys: ~0.01m accuracy (total station + GPS)

When comparing old vs new, the error tolerance must account for the older survey's accuracy. You cannot expect a 1908 boundary to match modern measurements within centimeters.

## Fruit of the Poisonous Tree
If an error is found in a parent title, every subdivision derived from it is suspect. The error propagates down the tree. You must check ALL children, not just the one you're surveying.
```

Write to `projects/ancestor-surveying/skills/seniority-rules.md`.

- [ ] **Step 5: Create qa-checklist.md**

```markdown
# QA Checklist — Must Pass Before Output

Run these checks after Phase 4 (reconciliation), before generating deliverables. ALL must pass.

## Check 1: Closure Verification
```bash
python -c "
from scripts.closure_check import check_closure
from scripts.coord_compute import compute_coordinates
# ... compute final coords
result = check_closure(coords, tolerance_m=<era_tolerance>)
print(f'PASS' if result['passed'] else f'FAIL: {result[\"linear_error\"]}m')
"
```
Tolerance by era: 1908→3.0m, 1950s→1.0m, 1980s→0.3m, 2000s→0.05m.

## Check 2: Area Cross-Check
Compute area from final coordinates (shoelace). Compare against stated area.
Tolerance: 2% for pre-1950, 1% for 1950-2000, 0.5% for post-2000.

## Check 3: Subdivision Consistency
Sum of child lot areas ≈ parent lot area (within tolerance).
Shared boundaries between adjacent lots must have matching coordinates.

## Check 4: Measurement Residuals
After least squares, all residuals within 3× era tolerance.
Flag any point exceeding 2σ as an outlier.

## Check 5: Error Resolution Audit
Every flagged error must have a documented resolution:
- What was flagged
- What evidence was used
- What the resolution is
- Why (seniority rule, field evidence, parent title)
NO unresolved flags allowed.

## Check 6: Deliverable Cross-Check
Coordinates in DXF = coordinates in DOCX = coordinates in computation.
Spot-check 2+ corners across all three outputs.

## On Failure
- Re-run the failing phase with the error as additional context.
- Max 3 retries per check.
- After 3 failures: STOP. Report which check failed and why. Human review needed.

## QA Summary Table (include in DOCX report)
| Check | Result | Details |
|-------|--------|---------|
| Closure | PASS/FAIL | linear error value |
| Area | PASS/FAIL | computed vs stated |
| Subdivision | PASS/FAIL | children sum vs parent |
| Residuals | PASS/FAIL | max residual + point |
| Error audit | PASS/FAIL | N flags, all resolved? |
| Cross-check | PASS/FAIL | coordinates match? |
```

Write to `projects/ancestor-surveying/skills/qa-checklist.md`.

- [ ] **Step 6: Create report-template.md**

```markdown
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
```

Write to `projects/ancestor-surveying/skills/report-template.md`.

- [ ] **Step 7: Commit**

```bash
git add projects/ancestor-surveying/skills/
git commit -m "feat(ancestor): domain skills — workflow, TD parsing, errors, seniority, QA, report template"
```

---

### Task 12: CLAUDE.md Operations Context Document

The main deliverable — the standalone doc they drop into their project.

**Files:**
- Create: `projects/ancestor-surveying/CLAUDE.md`

- [ ] **Step 1: Write the CLAUDE.md**

This file combines the spec content into a Claude Code-ready context document. It should contain:

1. The Company Overview section from the spec (high-level)
2. Service Types placeholder section
3. The full Boundary Survey Workflow (referencing the skills and scripts by path)
4. Common Error Patterns table
5. Domain Knowledge (Philippine Land Title System)
6. The Living Knowledge Base section
7. Script reference: what each script does, its inputs/outputs, how to call it
8. Skill reference: what each skill covers, when to read it

The content is already written in the spec — restructure it as a CLAUDE.md with script/skill references.

Write to `projects/ancestor-surveying/CLAUDE.md`. Content:

```markdown
# Ancestor Surveying — Operations Context

This document is the operational reference for a geodetic/land surveying consulting firm in the Philippines. It serves two purposes:
1. **Human reference:** A business process manual for the team.
2. **Claude Code context:** Domain knowledge so Claude can orchestrate boundary survey workflows.

## Company Overview

- Geodetic/land surveying consulting firm, Philippines
- Project-based accounting — each statement of work is a discrete project
- ~6-7 service types (boundary survey, subdivision, relocation, etc.)
- Team: upper management (direction + technical decisions), project managers (scheduling + assignment), engineers (2-3 yr experience, fieldwork + data processing)
- Tools: Excel, Google Sheets, AutoCAD, total stations, GPS/GNSS, drones

## Service Types

### Boundary Survey
Full workflow documented below. This is the core service.

### Subdivision Survey
*To be documented — use same phase structure as boundary survey.*

### Relocation Survey
*To be documented.*

### Other Services
*~3-4 additional service types to be documented over time.*

---

## Boundary Survey Workflow

Follow the skill guide: `skills/boundary-survey-workflow.md`

### Phase 1: Client Intake & Scoping
- Client provides title (TCT/OCT), tax declaration, deed of sale, or informal evidence
- Determine scope, estimate cost, prepare statement of work
- Deliverables: typically AutoCAD plan (.dxf), survey report (.docx), PDF map

### Phase 2: Theoretical Boundary (Title Analysis & Research)

**This is the biggest time sink and highest-value automation target.**

1. **Parse technical descriptions** — `python scripts/td_parser.py`
   - Input: raw TD text
   - Output: structured bearing-distance-corner data
   - See: `skills/td-parsing.md`

2. **Compute coordinates** — `python scripts/coord_compute.py`
   - Input: parsed TD lines + origin point
   - Output: (easting, northing) coordinate sequence

3. **Validate closure** — `python scripts/closure_check.py`
   - Input: coordinate sequence
   - Output: closure error (linear, precision ratio)
   - Tolerance depends on survey era (see Domain Knowledge below)

4. **Validate area** — `python scripts/area_compute.py`
   - Input: coordinates + stated area from title
   - Output: computed area, difference from stated

5. **Compare neighbors** — Claude reasoning (not scripted)
   - Parse neighbor TDs, find shared boundaries
   - Flag distance/bearing mismatches
   - See: `skills/error-patterns.md`

6. **Trace subdivision tree** — Claude reasoning
   - Collect all related TDs (mother → children)
   - Verify children fit within parent
   - See: `skills/seniority-rules.md`

7. **Establish seniority** — Claude reasoning
   - Rank documents by age (older = higher precedence)
   - When conflicts arise, senior document wins
   - Same-year documents need field evidence to break ties

8. **Error tracing** — Claude reasoning
   - If errors found, trace up subdivision tree to source
   - "Fruit of the poisonous tree" — everything downstream is suspect
   - See: `skills/error-patterns.md`

### Phase 3: Actual Boundary (Field Measurement)
- Load field measurement coordinates from input
- Validate: check for impossible values, duplicates, obvious outliers
- Equipment accuracy depends on era and type

### Phase 4: Comparison & Reconciliation

1. **Least squares adjustment** — `python scripts/least_squares.py`
   - Input: theoretical coordinates + actual measurements
   - Output: transformation parameters, per-point residuals, RMSE
   - Uses Helmert (4-parameter) transformation

2. **Outlier detection** — part of least_squares.py
   - Points exceeding 2σ are flagged
   - Large residuals often indicate degraded monuments or measurement errors

3. **Seniority application** — Claude reasoning
   - When theoretical vs actual conflict, apply era tolerance
   - Older surveys get wider tolerance
   - See: `skills/seniority-rules.md`

### Phase 5: QA (Self-Check Before Output)

**The pipeline does not produce deliverables until all QA checks pass.**

See: `skills/qa-checklist.md`

6 checks: closure, area, subdivision consistency, residuals, error resolution, cross-check.

### Phase 6: Output Generation

1. **DXF boundary plan** — `python scripts/generate_dxf.py`
   - Layers: BOUNDARY, LABELS, ANNOTATIONS, NEIGHBORS
   - Opens in AutoCAD

2. **DOCX survey report** — `python scripts/generate_docx.py`
   - See: `skills/report-template.md` for structure
   - Includes QA summary table

3. **PDF map** — `python scripts/generate_pdf.py`
   - Boundary plot with labels, north arrow, scale

---

## Common Error Patterns

| Error | Detection | Investigation |
|-------|-----------|---------------|
| N↔S bearing swap | Polygon doesn't close; reversing one fixes it | Check original scan |
| E↔W bearing swap | Same as above | Same |
| Digit misread (5↔6, 3↔8) | Closure error on one segment | Compare against parent title |
| Polygon doesn't close | Interior angles ≠ (n-2)×180° | Check all bearings/distances |
| Neighbor mismatch | Shared boundary differs between adjacent titles | Apply seniority (older wins) |
| Subdivision overflow | Children don't fit in parent | Recompute all children |
| Transcription compounding | Errors amplify through generations | Trace to mother title |

**Rule: Never correct the original document. Only flag discrepancies.**

---

## Domain Knowledge: Philippine Land Title System

- **OCT (Original Certificate of Title):** Root of subdivision tree. Torrens system since 1908.
- **TCT (Transfer Certificate of Title):** Issued on transfer/subdivision. References parent.
- **Technical Description (TD):** Legal boundary — bearing-distance polygon.
- **Subdivision tree:** OCT → TCTs → further TCTs. Errors propagate down.
- **Seniority:** Older documents take legal precedence.
- **DENR:** Adjudicates land disputes, maintains survey records.
- **LRA:** Maintains title registry.
- **Accuracy by era:** 1908 ≈ 3m, 1950s ≈ 1m, 1980s ≈ 0.3m, 2000s+ ≈ sub-cm.

---

## Living Knowledge Base

This document grows with every project. After each project, add learnings below.

### Format for new entries:
```
### [Date] — [Project reference]
- **What we learned:** [description]
- **When this applies:** [situation/trigger]
- **Action:** [what to do differently]
```

Claude should prompt after each project: "Anything new from this one that should go into the playbook?"

---

## Project Learnings

*No entries yet. This section will grow as projects are completed.*
```

- [ ] **Step 2: Commit**

```bash
git add projects/ancestor-surveying/CLAUDE.md
git commit -m "feat(ancestor): CLAUDE.md operations context — the standalone deliverable"
```

---

### Task 13: Run Full Test Suite and Verify

**Files:** None — this is a verification step.

- [ ] **Step 1: Run all tests**

```bash
cd projects/ancestor-surveying && python -m pytest tests/ -v
```

Expected: All tests pass (unit tests + end-to-end synthetic case).

- [ ] **Step 2: Run the synthetic case manually to verify outputs**

```bash
cd projects/ancestor-surveying && python -c "
import json
from scripts.td_parser import parse_technical_description
from scripts.coord_compute import compute_coordinates
from scripts.closure_check import check_closure
from scripts.area_compute import compute_area, check_area
from scripts.least_squares import adjust_coordinates, detect_outliers
from scripts.generate_dxf import generate_boundary_plan
from scripts.generate_docx import generate_survey_report
from scripts.generate_pdf import generate_boundary_map

with open('test-data/synthetic/lot-5b-input.json') as f:
    data = json.load(f)

# Parse subject lot
td = parse_technical_description(data['lots']['subject']['technical_description'])
print(f'Parsed: {td[\"lot_name\"]}, {len(td[\"lines\"])} lines, area={td[\"stated_area\"]}')

# Compute coordinates
field = data['field_measurements']['corners']
origin = (field[0]['easting'], field[0]['northing'])
coords = compute_coordinates(td['lines'], origin=origin)
print(f'Coordinates: {len(coords)} points')

# Closure
closure = check_closure(coords, tolerance_m=0.05)
print(f'Closure: {\"PASS\" if closure[\"passed\"] else \"FAIL\"} (error={closure[\"linear_error\"]}m)')

# Area
polygon_coords = coords[:-1]
area = compute_area(polygon_coords)
print(f'Area: {area:.1f} sqm (stated: {td[\"stated_area\"]})')

# Least squares
actual = [(c['easting'], c['northing']) for c in field]
ls_result = adjust_coordinates(polygon_coords, actual)
print(f'Least squares RMSE: {ls_result[\"rmse\"]}m')
outliers = detect_outliers(ls_result['residuals'])
print(f'Outliers: {[o[\"point_index\"] for o in outliers]}')

# Generate outputs
generate_boundary_plan({
    'lot_name': td['lot_name'], 'plan_number': td['plan_number'],
    'coords': polygon_coords,
    'lines': [{'bearing_text': f\"{l['bearing']['ns']} {l['bearing']['degrees']}°{l['bearing']['minutes']}' {l['bearing']['ew']}\", 'distance': l['distance'], 'to_corner': l['to_corner']} for l in td['lines']],
    'area_sqm': td['stated_area'],
}, 'output/lot-5b.dxf')
print('DXF: output/lot-5b.dxf')

generate_boundary_map({
    'lot_name': td['lot_name'], 'plan_number': td['plan_number'],
    'coords': polygon_coords, 'lines': [], 'area_sqm': td['stated_area'],
}, 'output/lot-5b-map.pdf')
print('PDF: output/lot-5b-map.pdf')

print('Done — all outputs generated.')
"
```

Expected: All steps complete, files in `output/`.

- [ ] **Step 3: Verify output files exist**

```bash
ls -la projects/ancestor-surveying/output/
```

Expected: `lot-5b.dxf`, `lot-5b-map.pdf`

- [ ] **Step 4: Final commit**

```bash
git add projects/ancestor-surveying/output/.gitkeep
git commit -m "feat(ancestor): verified full pipeline — synthetic test case passes end-to-end"
```

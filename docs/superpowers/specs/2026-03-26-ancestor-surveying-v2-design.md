# Ancestor Surveying v2 — Generic Project Processor Design

## Goal

Redesign the surveying pipeline from a single-lot boundary survey tool into a **generic survey project processor**. Given any project folder with the 7-folder structure (Proposal / From Client / Research / Field / Reports and Drafting / Sent / Project Closing), Claude Code reads the inputs, infers the project type, processes all lots, and produces the full deliverable set.

Validated against real data: PGS2146 (relocation survey, 15 subject lots + 22 adjoining, Gamu Isabela).

## Architecture: Phase-Based Pipeline with Per-Lot Subagents

Claude Code orchestrates project-level work. Per-lot computation is dispatched to subagents (one per lot) to keep context manageable and enable parallelization.

```
Orchestrator (Claude Code + project-orchestrator.md skill)
├── Phase 1: Scan — project_scanner.py → project.json
├── Phase 2: Parse — xlsm_parser.py + field_parser.py + subdivision_tree.py
├── Phase 3: Process — per-lot subagents (lot_processor.py + Claude reasoning)
├── Phase 4: Cross-validate — project-level consistency checks
├── Phase 5: QA — per-lot + project-level (qa-checklist.md)
├── Phase 6: Output — generate all deliverables
└── Phase 7: Report — present results to user
```

Scripts handle deterministic computation. Claude handles reasoning (error investigation, seniority analysis, field point assignment, report writing).

## What We Keep from v1

All existing scripts and their tests (40 tests passing):

- `coord_compute.py` — bearing-distance → XY coordinates
- `closure_check.py` — polygon closure validation
- `area_compute.py` — shoelace formula + tolerance check
- `least_squares.py` — Helmert transform + outlier detection
- `generate_dxf.py` — DXF boundary plan generation (extend for multi-lot)
- `generate_docx.py` — Word report generation (extend for project-level reports)
- `generate_pdf.py` — PDF map generation (extend for overview maps)
- `td_parser.py` — kept for plain-text TD parsing (fallback)
- All 6 domain skills (seniority, error patterns, QA, etc.)

## New Scripts

### `project_scanner.py`

Scans a 7-folder project directory and produces `project.json`.

**Input:** Path to project root folder.

**What it does:**
- Walks the 7-folder structure, catalogs all files by type
- Finds XLSM files in `2 From Client/` and `3 Research/` — these are TDs
- Finds CSV files in `4 Field/` — field measurements
- Reads `Scope and Client Info.xlsx` for client/location/scope metadata
- Infers project type from contents:
  - Has TDs + field CSVs → relocation
  - Has TDs only → boundary
  - Has LiDAR/contour data → topo component present
- Enumerates subject lots (from `2 From Client/Subject Lot/`) and adjoining lots (from `3 Research/LDC Adjoining Lots/`)
- Identifies parent surveys from research folder structure

**Output:** `project.json`

```json
{
  "project_id": "PGS2146",
  "client": "PEAK ENERGY",
  "location": "Guibang, Gamu, Isabela",
  "project_type": "relocation",
  "subject_lots": [
    {"lot_name": "Lot 42-A", "title": "CLOA-45606", "td_file": "path/to/file.xlsm"}
  ],
  "adjoining_lots": [
    {"lot_name": "Lot 54", "td_file": "path/to/file.xlsm"}
  ],
  "field_data_files": ["4 Field/UPDATE DATA/11-04-25.csv"],
  "parent_surveys": ["GSS-380", "PSU-153794"],
  "existing_outputs": ["5 Reports and Drafting/2146.dwg"],
  "status": "scanned"
}
```

### `xlsm_parser.py`

Replaces `td_parser.py` as the primary TD parser. Reads XLSM E2C sheets.

**Input:** Path to an XLSM file.

**What it does:**
- Opens with openpyxl
- Reads **Title Data sheet** — lot name, title number, area, survey number, owner, location, date of original survey
- Reads **E2C sheet** — bearing-distance traverse lines with adjacent lot references. This is cell-position parsing (structured data in known columns), not regex.
- Reads **Correction Comparison sheet** — flagged corrections
- Reads **Commonline Checker sheet** — shared boundary data

**Output:** Superset of `td_parser.py` output format:

```json
{
  "lot_name": "Lot 42-A",
  "title_number": "CLOA-45606",
  "survey_number": "PSD-(AF)-02-047911 (AR)",
  "stated_area": 25520.0,
  "date_of_original_survey": "1958-10-09",
  "owner": "Rustico Simon",
  "location": "Guibang, Gamu, Isabela",
  "lines": [
    {
      "bearing": {"degrees": 79, "minutes": 42, "seconds": 0, "ns": "N", "ew": "W"},
      "distance": 73.84,
      "to_corner": 2,
      "adjacent_lot": "Lot 54",
      "adjacent_survey": "PSU-153794"
    }
  ],
  "references": [],
  "corrections": [],
  "commonlines": []
}
```

**Critical dependency:** The exact cell positions in the E2C sheet must be reverse-engineered from a real XLSM file (PGS2146 calibration data). This is the first implementation task — read a real file, map the cell layout, then build the parser.

**Backward compatibility:** The `lines` array has the same shape as `td_parser.py` output. All downstream scripts (`coord_compute`, `closure_check`, `area_compute`) consume this without changes.

### `field_parser.py`

Parses CSV field measurement files.

**Input:** One or more CSV file paths.

**What it does:**
- Each row: `point_id, easting, northing, elevation, point_code`
- Filters by point code:
  - `FC` → boundary corners (matched to lots)
  - `FL` → line points
  - `G1-COR`, `G2-CHECKING` → control/benchmark points
  - `A1`, `A2` → alignment points
  - `BWL`, `BWC` → building features
  - `G` → ground/topo points
- Merges multiple CSV files (different field dates), deduplicates by point_id
- Does NOT assign points to lots — Claude handles that reasoning

**Output:**

```json
{
  "coordinate_system": "PRS92",
  "field_dates": ["2025-10-30", "2025-11-04", "2025-11-05"],
  "control_points": [{"id": 1, "easting": 1884774.023, "northing": 379916.941, "elevation": 63.289, "code": "G1-COR"}],
  "boundary_corners": [{"id": 5, "easting": 1885561.943, "northing": 381220.03, "elevation": 84.187, "code": "FC"}],
  "line_points": [],
  "ground_points": [],
  "all_points": []
}
```

### `subdivision_tree.py`

Builds lot hierarchy from parsed TDs.

**Input:** All parsed lot data (list of dicts from `xlsm_parser.py`).

**What it does:**
- Links lots via survey numbers — each subdivision references its parent
- Root: original survey (e.g., GSS-380, 1958)
- Children: subdivision plans (PSD, CSD)
- Leaves: individual lots (TCTs/CLOAs)
- Validates:
  - Child areas sum to parent area (within tolerance)
  - Shared boundaries between siblings match
  - No orphan lots

**Output:**

```json
{
  "root": {
    "survey": "GSS-380",
    "year": 1958,
    "children": [
      {
        "survey": "PSD-(AF)-02-047911 (AR)",
        "parent_lot": "Lot 42",
        "year": 2003,
        "children": [
          {"lot": "Lot 42-A", "title": "CLOA-45606", "area": 25520.0}
        ]
      }
    ]
  },
  "seniority_chain": [
    {"survey": "GSS-380", "year": 1958, "rank": 1}
  ],
  "validation": {
    "area_checks": [],
    "commonline_checks": [],
    "orphan_lots": []
  }
}
```

### `lot_processor.py`

Per-lot deterministic pipeline. Called by subagents.

**Input:** Parsed TD for one lot + field data (optional).

**What it does:**
1. Compute coordinates (`coord_compute.py`)
2. Check closure (`closure_check.py`) with era-appropriate tolerance
3. Compute and validate area (`area_compute.py`)
4. If field data provided, run least squares (`least_squares.py`)
5. Write results to `working/lots/<lot-name>.json`

**Output:**

```json
{
  "lot_name": "Lot 42-A",
  "status": "processed",
  "theoretical": {
    "coordinates": [],
    "closure": {"passed": true, "error": 0.002},
    "area": {"computed": 25518.3, "stated": 25520.0, "passed": true}
  },
  "field_match": {
    "matched_corners": [{"corner": 1, "field_point_id": 22, "distance": 0.15}],
    "unmatched_corners": [],
    "outliers": [3]
  },
  "reconciliation": {
    "rmse": 0.34,
    "method": "helmert",
    "final_coordinates": []
  },
  "findings": []
}
```

Claude reasoning in the subagent adds: field point assignment, neighbor comparison, seniority analysis, and findings documentation.

### `coordinate_export.py`

Exports coordinate tables in formats matching their existing output.

**Input:** Per-lot results + control points.

**Output files:**
- `all-points.csv` — all surveyed points with residuals (matches their format: `id easting northing residual "description"`)
- `control-points.csv` — benchmark coordinates
- Per-lot coordinate CSVs

## New Skills

### `project-orchestrator.md`

Master workflow skill. Guides Claude through the 7-phase pipeline:

1. **SCAN** — Run `project_scanner.py`. Present summary. Confirm with user.
2. **PARSE** — Run `xlsm_parser.py` on all TDs. Run `field_parser.py`. Build subdivision tree.
3. **PROCESS** — Dispatch per-lot subagents (parallelize subject lots). Lighter pass for adjoining lots.
4. **CROSS-VALIDATE** — Commonline validation across lots. Subdivision area checks. Field coverage check.
5. **QA** — Per-lot + project-level checks. Must all pass before output.
6. **OUTPUT** — Generate all deliverables.
7. **REPORT** — Present results with file listing, QA summary, unresolved findings.

### `lot-processing.md`

Per-lot subagent instructions. Guides Claude through processing one lot: run scripts, match field points, compare neighbors, apply seniority, document findings.

## Output Structure

```
working/
├── project.json
├── field_data.json
├── subdivision_tree.json
├── lots/
│   ├── lot-42-a.json
│   ├── lot-42-b.json
│   └── ...
└── output/
    ├── per-lot/
    │   ├── lot-42-a.dxf
    │   ├── lot-42-a-coords.csv
    │   └── ...
    ├── consolidated.dxf
    ├── control-points.csv
    ├── all-points.csv
    ├── PGS2146-report.docx
    ├── PGS2146-map.pdf
    └── PGS2146-qa-summary.json
```

## Output Formats

- `.dxf` — AutoCAD-compatible boundary plans (surveyors finalize in AutoCAD, save as .dwg for delivery)
- `.docx` — Project report with per-lot findings, QA summary, seniority analysis, recommendations
- `.pdf` — Overview map with all lots
- `.csv` — Coordinate tables (all points, control points, per-lot corners)
- `.json` — Machine-readable QA results

## Validation Strategy

Same two-file approach as v1:
- **PGS2146 (File A)** — calibration. We know the correct output. Iterate until pipeline matches.
- **PGS2149 (File B)** — blind test. Run cold. Surveyor reviews.

## Self-QA Step

Same 6 checks as v1, applied at two levels:
1. **Per-lot:** closure, area, residuals (run by lot subagent)
2. **Project-level:** subdivision consistency, commonline validation, field coverage, cross-lot coordinate consistency, error resolution audit, deliverable cross-check (run by orchestrator)

Pipeline does not generate outputs until all QA checks pass at both levels.

## Existing Scripts Extended (Not Rewritten)

- `generate_dxf.py` — add multi-lot consolidated plan support, neighbor lot rendering from project data
- `generate_docx.py` — add project-level report structure (multi-lot findings table, subdivision tree summary)
- `generate_pdf.py` — add overview map with all lots plotted

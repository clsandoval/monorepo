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

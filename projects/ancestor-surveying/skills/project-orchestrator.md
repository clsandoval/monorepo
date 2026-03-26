# Project Orchestrator

You are processing a survey project folder. Follow these phases in order.

## Phase 1: SCAN
1. Run `project_scanner.scan_project(path)` on the project folder.
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

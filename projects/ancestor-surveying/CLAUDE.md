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

1. **Parse technical descriptions** — `python3 scripts/td_parser.py`
   - Input: raw TD text
   - Output: structured bearing-distance-corner data
   - See: `skills/td-parsing.md`

2. **Compute coordinates** — `python3 scripts/coord_compute.py`
   - Input: parsed TD lines + origin point
   - Output: (easting, northing) coordinate sequence

3. **Validate closure** — `python3 scripts/closure_check.py`
   - Input: coordinate sequence
   - Output: closure error (linear, precision ratio)
   - Tolerance depends on survey era (see Domain Knowledge below)

4. **Validate area** — `python3 scripts/area_compute.py`
   - Input: coordinates + stated area from title
   - Output: computed area, difference from stated

5. **Compare neighbors** — Claude reasoning (not scripted)
   - Parse neighbor TDs, find shared boundaries
   - Flag distance/bearing mismatches
   - See: `skills/error-patterns.md`

6. **Trace subdivision tree** — Claude reasoning
   - Collect all related TDs (mother to children)
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

1. **Least squares adjustment** — `python3 scripts/least_squares.py`
   - Input: theoretical coordinates + actual measurements
   - Output: transformation parameters, per-point residuals, RMSE
   - Uses Helmert (4-parameter) transformation

2. **Outlier detection** — part of least_squares.py
   - Points exceeding 2 sigma are flagged
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

1. **DXF boundary plan** — `python3 scripts/generate_dxf.py`
   - Layers: BOUNDARY, LABELS, ANNOTATIONS, NEIGHBORS
   - Opens in AutoCAD

2. **DOCX survey report** — `python3 scripts/generate_docx.py`
   - See: `skills/report-template.md` for structure
   - Includes QA summary table

3. **PDF map** — `python3 scripts/generate_pdf.py`
   - Boundary plot with labels, north arrow, scale

---

## Common Error Patterns

| Error | Detection | Investigation |
|-------|-----------|---------------|
| N/S bearing swap | Polygon doesn't close; reversing one fixes it | Check original scan |
| E/W bearing swap | Same as above | Same |
| Digit misread (5 vs 6, 3 vs 8) | Closure error on one segment | Compare against parent title |
| Polygon doesn't close | Interior angles don't sum correctly | Check all bearings/distances |
| Neighbor mismatch | Shared boundary differs between adjacent titles | Apply seniority (older wins) |
| Subdivision overflow | Children don't fit in parent | Recompute all children |
| Transcription compounding | Errors amplify through generations | Trace to mother title |

**Rule: Never correct the original document. Only flag discrepancies.**

---

## Domain Knowledge: Philippine Land Title System

- **OCT (Original Certificate of Title):** Root of subdivision tree. Torrens system since 1908.
- **TCT (Transfer Certificate of Title):** Issued on transfer/subdivision. References parent.
- **Technical Description (TD):** Legal boundary — bearing-distance polygon.
- **Subdivision tree:** OCT to TCTs to further TCTs. Errors propagate down.
- **Seniority:** Older documents take legal precedence.
- **DENR:** Adjudicates land disputes, maintains survey records.
- **LRA:** Maintains title registry.
- **Accuracy by era:** 1908 = ~3m, 1950s = ~1m, 1980s = ~0.3m, 2000s+ = sub-cm.

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

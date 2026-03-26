# Ancestor Surveying — Operations Context Document Design

## Goal

Produce two deliverables:

1. **Entity file** (`entities/businesses/ancestor-surveying.md`) — brief business profile for the monorepo knowledge graph
2. **Standalone CLAUDE.md-style operations context doc** — the main deliverable. A living document that:
   - A human can read as a business process reference
   - Claude Code can use as domain context to guide engineers through workflows
   - Grows smarter with every project as new learnings are added

The standalone doc is what gets handed to the surveying company. They drop it into a project folder, point Claude Code at it, and start working.

## Standalone Doc Structure

### Company Overview (High-Level)

- Geodetic/land surveying consulting firm, Philippines
- Project-based accounting — each statement of work is a discrete project, profitability tracked per project
- ~6-7 service types (boundary survey, subdivision, relocation, etc.)
- Team structure:
  - Upper management: sets direction, evaluates new service lines, makes technical decisions
  - Project managers: assign engineers to projects, track schedules, report status
  - Engineers (2-3 yr experience): execute fieldwork and data processing
- Business processes: cost control, budgeting, cost estimation, proposal generation
- New capabilities introduced via prototype projects with small teams; upper management shadows initially, then hands off once the team is confident
- Current tools: Excel, Google Sheets, AutoCAD (with AutoLISP scripting), total stations / laser equipment

### Service Types (Placeholder Section)

Boundary survey gets the full deep-dive. Other services get stub sections with the same phase-by-phase structure to be filled in over time:

- Boundary Survey → detailed below
- Subdivision Survey → to document
- Relocation Survey → to document
- ~3-4 others → to document

### Boundary Survey Workflow (Deep Dive)

#### Phase 1: Client Intake & Scoping

- **Input:** Client approaches with a request. Provides scope — usually a land title (Transfer Certificate of Title / Original Certificate of Title), but could also be a tax declaration, deed of sale, or even informal evidence (e.g., an elder pointing at landmarks)
- **What happens:** Determine the type of boundary survey needed, assess scope, estimate cost
- **Who:** Project manager or senior surveyor
- **Output:** Statement of work, cost estimate, proposal to client
- **Automatable:** Proposal/estimate generation based on project type and historical costs

#### Phase 2: Theoretical Boundary (Title Analysis & Research)

This is the most knowledge-intensive phase and the biggest time sink.

- **Input:** Land title and/or other documentary evidence from Phase 1
- **Step 1 — Digitize the technical description:** Extract the bearing-distance-angle sequence from the title document into Excel (coordinate pairs). Currently manual typing — error-prone.
- **Step 2 — Plot and validate:** Plot coordinates, check basic validity:
  - Does the polygon close?
  - Do bearings and distances follow a consistent pattern?
  - Do neighbor boundaries match?
  - Flag common transcription errors: N↔S swaps, E↔W swaps, digit misreads (5 vs 6), transposed numbers
  - **Never correct the original document** — only flag discrepancies
- **Step 3 — Identify gaps and investigate:** Documents are often incomplete. Missing bearings, absent subdivision records, references to documents you don't have. The professional skill is knowing where to look:
  - Which government office holds the record (DENR, LRA, local Registry of Deeds)
  - Which neighboring titles might contain the missing information
  - Which older surveys in the area could fill gaps
  - This requires domain experience and in-person visits — government records are not digitized
- **Step 4 — Trace the subdivision tree:** Land in the Philippines subdivides over generations. An Original Certificate of Title (OCT) from 1908 gets subdivided into Transfer Certificates of Title (TCTs), which get further subdivided. Collect all related technical descriptions from mother title down to the subject lot.
- **Step 5 — Establish document seniority:** Older/parent documents take legal precedence over newer/child documents. When there's a conflict between a mother title and a subdivision title, the mother title wins. Build a seniority-ranked evidence chain.
- **Step 6 — Error tracing:** If errors are found in a subdivision, trace up the tree to find where the error was introduced. Everything downstream of the original error is tainted ("fruit of the poisonous tree"). This determines whether errors are local (fixable) or systemic (affects the entire chain).
- **Who:** Senior surveyor + research staff
- **Output:** Validated theoretical boundary with seniority-ranked evidence chain, plus a list of remaining gaps and where to look
- **Automatable:**
  - Digitization: OCR + coordinate extraction from scanned documents
  - Validation: closure checks, error pattern detection (N↔S, E↔W, digit misreads), neighbor matching
  - Subdivision tree visualization and traversal (if records are digitized)
  - Claude can review a plotted boundary and flag anomalies

#### Phase 3: Actual Boundary (Field Measurement)

- **Input:** Understanding of theoretical boundary from Phase 2
- **What happens:** Field crew visits the property and measures physical features that represent the actual boundary — walls, fences, trees, rocks, iron boundary pins, concrete monuments, rivers, roads
- **Equipment:** Total station, GPS/GNSS receivers, laser rangefinders, drones (for larger surveys)
- **Who:** Field engineers (2-3 yr experience), sometimes with upper management for new equipment/methods
- **Output:** Coordinate set of all measured boundary features
- **Error risk:** Highest error-prone step — human data entry in field conditions. Mis-identified points, wrong prism heights, transcription errors in field notes
- **Automatable:** Real-time data entry validation at capture time (check for outliers, impossible values)

#### Phase 4: Comparison & Reconciliation

- **Input:** Theoretical boundary (Phase 2) + Actual measurements (Phase 3)
- **Step 1 — Least squares adjustment:** Mathematically fit the two datasets together. Already partially automated — click theoretical points, click actual points, run the adjustment.
- **Step 2 — Identify outliers:** Points that don't fit the adjustment are flagged for review
- **Step 3 — Account for historical accuracy:** A title from 1908 was surveyed with equipment accurate to ~3 meters. Modern equipment is sub-centimeter. You cannot hold a 1908 survey to modern accuracy standards — the allowable error must account for the technology of the original survey.
- **Step 4 — Apply seniority rules:** When boundaries conflict (e.g., your survey vs neighbor's survey), the older survey takes precedence. This is a legal principle, not just a technical one — a senior surveyor must make this judgment call.
- **Step 5 — Source the error:** If discrepancies exist, trace back through the subdivision tree (from Phase 2) to find where the error originated.
- **Who:** Senior surveyor (professional judgment required for seniority and error sourcing)
- **Output:** Reconciled boundary with documented discrepancies and evidence for each decision
- **Automatable:** Least squares (already done), outlier detection, accuracy tolerance calculation based on survey date. Seniority judgment is human — but Claude can present the evidence and options.

#### Phase 5: Output & Deliverables

- **Step 1 — Generate AutoCAD drawing:** Excel data → AutoLISP script → AutoCAD (.dwg). One map with all technical descriptions, labeled points, boundary lines. May have multiple sheets. This pipeline is already scripted.
- **Step 2 — Write the report:** Professional opinion on what the boundary should be, supported by evidence:
  - List of all documents reviewed (titles, surveys, tax declarations)
  - Error table: every discrepancy found, where it originated, how it was resolved
  - Seniority analysis: which documents took precedence and why
  - Final recommended boundary with coordinates
- **Step 3 — Handle disputes (if any):** If the survey results conflict with a neighbor's claim:
  - First: direct negotiation between parties
  - If unresolved: escalate to DENR (Department of Environment and Natural Resources) for adjudication
  - The surveyor's role is to present technical evidence, not to advocate for a claim — analogous to a forensic expert presenting blood test results, not arguing guilt
- **Who:** Senior surveyor (report), AutoCAD operator (drawings)
- **Output:** AutoCAD drawings + written professional opinion with evidence
- **Automatable:** AutoCAD generation (already done), report drafting (Claude can draft from structured data, human reviews)

### Common Error Patterns

A reference for validation logic — things to check automatically:

| Error | How to detect | How to investigate |
|-------|--------------|-------------------|
| N↔S bearing swap | Polygon doesn't close; reversing one bearing fixes it | Check original document scan for ambiguous characters |
| E↔W bearing swap | Same as above | Same |
| Digit misread (5↔6, 3↔8, etc.) | Closure error; systematic offset in one segment | Compare against older/parent title for correct value |
| Polygon doesn't close | Sum of interior angles ≠ (n-2)×180° | Check all bearings and distances against source docs |
| Neighbor mismatch | Shared boundary has different descriptions in adjacent titles | Pull both titles, check which is senior (older wins) |
| Subdivision doesn't fit mother | Child lots don't add up to parent lot area/boundaries | Pull mother title, recompute all subdivisions |
| Transcription compounding | Small errors in mother title amplify through subdivisions | Trace to original source, identify the first divergence |

### Automation Opportunities Summary

| Phase | What's automatable | Effort | Impact |
|-------|-------------------|--------|--------|
| 1. Client Intake | Proposal/estimate generation from templates + historical data | Low | Medium |
| 2. Title Analysis | Digitization (OCR), validation checks, error pattern detection, plot visualization | Medium | **High** — biggest time sink |
| 2. Research | Limited — government records aren't digital, requires in-person visits | N/A | N/A (blocked by external systems) |
| 3. Field Measurement | Real-time data entry validation | Medium | Medium |
| 4. Reconciliation | Least squares (already done), outlier detection, tolerance calculation | Low (mostly done) | High |
| 5. Output | AutoCAD (already done), report drafting | Low-Medium | Medium |

**Highest-value automation target:** Phase 2 — title analysis, validation, and error detection. This is where the most time is spent and where pattern-based checking can catch the most errors.

### Architecture: Claude Code as Orchestrator

**This is NOT a deterministic script pipeline.** Claude Code is the operator — it reads inputs, reasons about the domain, makes judgment calls, and calls Python scripts as tools when it needs math or file generation.

```
┌─────────────────────────────────────────────────┐
│                  Claude Code                     │
│  (orchestrator — reads context, reasons, decides)│
├─────────────────────────────────────────────────┤
│                                                  │
│  Skills (domain prompts)    Scripts (Python tools)│
│  ┌──────────────────┐      ┌──────────────────┐ │
│  │ TD parsing guide │      │ coord_compute.py │ │
│  │ Subdivision tree │      │ closure_check.py │ │
│  │ Seniority rules  │      │ least_squares.py │ │
│  │ Error patterns   │      │ generate_dxf.py  │ │
│  │ QA checklist     │      │ generate_docx.py │ │
│  │ Report template  │      │ generate_pdf.py  │ │
│  └──────────────────┘      │ area_compute.py  │ │
│                             └──────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Why Claude Code, not deterministic code?**
- Half the job is judgment: seniority reasoning, error investigation, deciding which evidence to trust, writing the professional opinion. This is reasoning, not computation.
- The investigation phase (Phase 2) is inherently exploratory — you don't know what you'll find or what's missing until you look. Claude handles ambiguity; scripts don't.
- Edge cases are the norm, not the exception. Every survey has something weird. Claude adapts; a fixed pipeline breaks.
- Scripts handle what scripts are good at: math, file I/O, coordinate transforms, polygon operations. Claude handles what Claude is good at: reading documents, spotting anomalies, reasoning about conflicting evidence, writing reports.

**The split:**

| Claude Code handles | Python scripts handle |
|--------------------|-----------------------|
| Reading/interpreting title documents | Bearing-distance → XY coordinate conversion |
| Identifying gaps in documentation | Polygon closure computation |
| Spotting error patterns (N↔S, digit misreads) | Least squares adjustment |
| Seniority reasoning and judgment calls | Outlier detection (statistical) |
| Tracing subdivision tree logic | Area computation (shoelace formula) |
| Writing the professional opinion/report | DXF file generation (`ezdxf`) |
| QA reasoning (does this make sense?) | DOCX file generation (`python-docx`) |
| Deciding what to investigate next | PDF map generation (`matplotlib`) |

**Skills** are domain-specific prompts that give Claude the context it needs at each phase — like a senior surveyor whispering in its ear. They encode the rules, patterns, and institutional knowledge from this document.

**Scripts** are deterministic Python tools Claude calls via Bash. They take structured input (coordinates, bearings, distances) and return structured output (computed coordinates, closure error, residuals, generated files).

### Python Script Dependencies

Scripts need these libraries — no AutoCAD license required:

| Library | Purpose |
|---------|---------|
| `numpy`, `scipy` | Coordinate math, least squares adjustment, outlier detection |
| `shapely`, `geopandas` | Polygon operations, area computation, neighbor boundary comparison |
| `ezdxf` | Generate .dxf files (AutoCAD opens natively) |
| `python-docx` | Generate .docx survey reports |
| `matplotlib` | Generate PDF map exports with boundary plots, labels, scale bar |

**Why .dxf instead of AutoLISP?** They already use AutoLISP inside AutoCAD. But generating .dxf externally is better:
- No AutoCAD license needed to *create* the files
- Python is easier to maintain and test than AutoLISP
- Claude Code can run the full pipeline without AutoCAD installed
- Surveyors still open/edit in AutoCAD on their end — no workflow change

### Synthetic Test Case

A fabricated but realistic boundary survey scenario that exercises every phase of the pipeline. This is for demonstrating the automation pipeline end-to-end — all data is fictional.

#### Scenario: Lot 5-B, Psd-04-123456, Barangay San Isidro, Batangas

**Background:**
- Client wants a boundary survey of Lot 5-B
- Lot 5-B is a subdivision of Lot 5, which was subdivided from OCT No. 1234 (original survey: 1952)
- There's a dispute with the neighbor (Lot 5-A) about the shared boundary

**Document tree (subdivision hierarchy):**
```
OCT No. 1234 (1952) — Mother title, 10,000 sqm
├── Lot 5, TCT No. 56789 (1978) — 2,500 sqm
│   ├── Lot 5-A, TCT No. 98765 (2003) — 1,200 sqm ← neighbor
│   └── Lot 5-B, TCT No. 98766 (2003) — 1,300 sqm ← client's lot
└── [other lots...]
```

**Phase 1 — Client Intake:**
- Client provides: TCT No. 98766 (Lot 5-B), tax declaration, deed of sale
- Scope: boundary survey to resolve dispute with Lot 5-A owner
- Deliverables: AutoCAD plan (.dxf), boundary survey report (.docx), PDF map

**Phase 2 — Theoretical Boundary (Title Analysis):**

Technical description for Lot 5-B (TCT No. 98766):
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

Technical description for Lot 5-A (TCT No. 98765) — neighbor:
```
Beginning at corner 1, identical to corner 2 of Lot 5;
thence S 45°30' E, 24.00 m to corner 2;   ← NOTE: 24m, not 25m
thence S 44°30' E, 52.00 m to corner 3, identical to corner 1 of Lot 5-B;
thence N 45°30' W, 24.00 m to corner 4;
thence N 44°30' W, 52.00 m to corner 1 (point of beginning).

Area: 1,248 sq.m., more or less.
```

Parent lot (Lot 5, TCT No. 56789):
```
Beginning at corner 1;
thence N 45°30' E, 49.00 m to corner 2;   ← NOTE: 49m = 25 + 24, not 25 + 25
thence S 44°30' E, 52.00 m to corner 3;
thence S 45°30' W, 49.00 m to corner 4;
thence N 44°30' W, 52.00 m to corner 1 (point of beginning).

Area: 2,548 sq.m., more or less.
```

**Planted errors for the pipeline to detect:**

1. **Neighbor mismatch:** Lot 5-A says 24m on the shared boundary direction; Lot 5-B says 25m. 1m discrepancy.
2. **Area inconsistency:** Lot 5-A (1,248) + Lot 5-B (1,300) = 2,548 sqm. Parent lot says 2,548 sqm. But if Lot 5-B's 25m is correct, the parent should be 2,500 + remainder. The areas are internally consistent with the *wrong* value.
3. **Seniority test:** Parent lot (1978) says 49m total. Lot 5-A (2003) says 24m. Lot 5-B (2003) says 25m. 24 + 25 = 49 ✓ — but which child lot has the error? The parent is senior, so 49m is the anchor. The question is whether it's 25+24 or 24+25 — the pipeline should flag this ambiguity.
4. **Closure test:** The technical descriptions are designed to close properly (rectangular lots), so closure itself isn't the issue — the inter-lot consistency is.

**Phase 3 — Field Measurements (Synthetic):**

Survey crew measures the actual physical boundary:
```
Corner 1: (500.000, 500.000) — iron pin found
Corner 2: (517.680, 517.680) — concrete monument
Corner 3: (553.402, 481.958) — iron pin found
Corner 4: (535.722, 464.278) — wooden peg (old, unreliable)
```

These coordinates correspond approximately to the 25m version of Lot 5-B, with ~0.15m scatter (realistic for modern equipment vs 1978 monuments). Corner 4 has larger error (~0.4m) due to the degraded wooden peg.

**Phase 4 — Reconciliation:**
- Least squares fit of theoretical (25m version) vs actual → good fit except corner 4
- Least squares fit of theoretical (24m version) vs actual → poor fit on the shared boundary side
- Seniority: parent title (1978) says 49m total. Field evidence supports the 25m + 24m split.
- Conclusion: Lot 5-B's 25m is correct. Lot 5-A likely has a transcription error (25→24). Flag corner 4 for re-monumentation.

**Phase 5 — Deliverables:**
- AutoCAD .dxf: boundary plan showing Lot 5-B with corners, bearings, distances, neighbor boundaries, and annotations for discrepancies
- Word .docx: boundary survey report with evidence table, seniority analysis, error findings, professional recommendation
- PDF: map export of the boundary plan

#### What This Test Case Exercises

| Pipeline Step | What's Tested |
|---------------|--------------|
| TD parsing | Extract bearing-distance from text format |
| Coordinate computation | Bearing-distance → XY coordinates |
| Closure check | Verify polygon closes (it does — that's not the issue here) |
| Neighbor comparison | Detect 24m vs 25m mismatch on shared boundary |
| Subdivision tree check | Verify children fit within parent (area, dimensions) |
| Seniority resolution | Parent (1978) anchors at 49m; determine which child has the error |
| Least squares adjustment | Fit theoretical to actual measurements, identify outliers |
| Outlier detection | Flag corner 4 (wooden peg, larger error) |
| Historical accuracy | 1978 survey tolerance vs modern measurements |
| DXF generation | Produce AutoCAD-compatible boundary plan |
| DOCX generation | Produce formatted survey report with evidence |
| PDF generation | Export map to PDF |

### Validation Strategy: Two-File Approach

The surveyor provides two real survey files — completed projects where he already has the correct manual output.

**File A — Calibration file (open-book test):**
- He tells us the correct answer upfront (his completed AutoCAD plan, report, and conclusions)
- We run the pipeline, compare output against his ground truth
- Iterate: fix discrepancies, tune tolerances, adjust error detection logic
- Pipeline is "done" when File A output matches his manual work

**File B — Blind test (closed-book):**
- We run the pipeline cold — no peeking at his answer
- He reviews the output: DXF, DOCX, PDF
- If correct (or correct enough to just verify and sign off) → pipeline works
- If not → the discrepancies tell us what the pipeline still gets wrong

This two-file approach separates fitting from validation. File A prevents overfitting to one specific case because File B is the real test.

### Self-QA Agent Step

Runs after Phase 4 (reconciliation), before Phase 5 (output generation). The pipeline does not produce deliverables until it passes its own checks. This maximizes the chance of one-shotting File B.

**Check 1 — Closure verification:**
Recompute the polygon from the final recommended coordinates. Does it close within the era-appropriate tolerance? If not, do not proceed.

**Check 2 — Area cross-check:**
Compute area from final coordinates using the shoelace formula. Compare against the stated area in the title. Flag if discrepancy exceeds expected tolerance for the survey era.

**Check 3 — Subdivision consistency:**
Do all child lots fit within the parent lot? Do shared boundaries between adjacent lots match exactly? Sum of child areas ≈ parent area?

**Check 4 — Measurement residuals:**
After least squares adjustment, are all point residuals within the expected range for the survey era and equipment? Flag any suspiciously large residuals with the specific point and magnitude.

**Check 5 — Error resolution audit:**
For every error flagged during Phase 2 and Phase 4, verify the resolution is documented: "Flagged [X], resolved by [Y], because [seniority rule / field evidence / parent title reference]." No unresolved flags allowed.

**Check 6 — Deliverable cross-check:**
The coordinates in the DXF match the coordinates in the DOCX report match the coordinates in the computation log. No copy-paste drift between output formats.

**Behavior on failure:**
- If any check fails, the pipeline logs the failure, attempts to fix it (re-run the relevant phase with the error as context), and re-checks
- After 3 failed attempts on the same check, stop and report: "QA check [N] failed after 3 attempts — [details]. Human review needed."
- The final deliverables include a QA summary table showing every check and its pass/fail result, so the surveyor can see at a glance that the pipeline verified its own work

### Domain Knowledge: Philippine Land Title System

Key concepts Claude needs to understand:

- **OCT (Original Certificate of Title):** First title ever issued for a parcel. The root of the subdivision tree. In the Philippines, the Torrens system was introduced in 1908.
- **TCT (Transfer Certificate of Title):** Issued when land is transferred (sale, inheritance, subdivision). References the parent title.
- **Technical Description (TD):** The legal description of boundaries — a sequence of bearings, distances, and angles defining the polygon. This is what gets digitized and validated.
- **Subdivision tree:** OCT → TCTs → further TCTs. Each subdivision creates new titles that must fit within the parent. Errors propagate down.
- **Seniority principle:** Older documents take legal precedence. A 1908 OCT overrides a 2020 TCT if they conflict.
- **DENR:** Department of Environment and Natural Resources — the government body that adjudicates land disputes and maintains survey records.
- **LRA:** Land Registration Authority — maintains the title registry.
- **Accuracy by era:** 1908 surveys ≈ 3m accuracy. Modern surveys ≈ sub-centimeter. Error tolerances must account for the era of the original survey.

### Living Knowledge Base

This document is a starting point, not a final reference. It should grow with every project.

**After each project, add:**
- New document types that proved useful (e.g., "for surveys near rivers, also check DPWH flood maps")
- New error patterns discovered
- New sources/offices for specific situations
- Rules of thumb that experienced surveyors know but aren't written down
- Edge cases and how they were resolved

**Format for additions:**
```
### [Date] — [Project reference]
- **What we learned:** [description]
- **When this applies:** [situation/trigger]
- **Action:** [what to do differently]
```

Claude can prompt after each project: "Anything new from this one that should go into the playbook?"

Over time, this document becomes the institutional memory of the company — the knowledge that currently lives only in senior surveyors' heads.

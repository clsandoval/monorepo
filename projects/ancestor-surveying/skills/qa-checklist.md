# QA Checklist — Must Pass Before Output

Run these checks after Phase 4 (reconciliation), before generating deliverables. ALL must pass.

## Check 1: Closure Verification
Recompute the polygon from final recommended coordinates. Must close within era-appropriate tolerance.

Tolerance by era: 1908 = 3.0m, 1950s = 1.0m, 1980s = 0.3m, 2000s = 0.05m.

```python
from closure_check import check_closure
result = check_closure(coords, tolerance_m=era_tolerance)
```

## Check 2: Area Cross-Check
Compute area from final coordinates (shoelace). Compare against stated area.
Tolerance: 2% for pre-1950, 1% for 1950-2000, 0.5% for post-2000.

```python
from area_compute import check_area
result = check_area(coords, stated_area=stated, tolerance_pct=era_pct)
```

## Check 3: Subdivision Consistency
Sum of child lot areas must approximate parent lot area (within tolerance).
Shared boundaries between adjacent lots must have matching coordinates.

## Check 4: Measurement Residuals
After least squares, all residuals within 3x era tolerance.
Flag any point exceeding 2 sigma as an outlier.

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

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

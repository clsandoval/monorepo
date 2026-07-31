// FIXTURE — never compiled. Lives outside engine/src on purpose so cargo never
// sees it. Drives the WARNINGS SUPPRESSED verdict of scripts/check-observability.mjs.
//
// This is what engine/src/step10_finalize.rs looked like before Phase 5: the
// warning channel hardcoded shut, so every legal defect reproduced silently.

fn build_output() -> EngineOutput {
    EngineOutput {
        per_heir_shares,
        narratives,
        computation_log,
        warnings: vec![],
        succession_type: input.succession_type,
        scenario_code: input.scenario_code,
    }
}

// FIXTURE — never compiled. Lives outside engine/src on purpose so cargo never
// sees it. Drives the OUTPUT CHECK MISSING verdict of
// scripts/check-observability.mjs.
//
// check_output still exists by name, but neither defect variant does, so the
// conservation and uniqueness invariants are no longer actually checked.

pub fn check_output(output: &EngineOutput, net_estate: &Money) -> Result<(), Vec<String>> {
    let _ = (output, net_estate);
    Ok(())
}

// FIXTURE — never compiled. Lives outside engine/src on purpose so cargo never
// sees it. Drives the BOUNDARY ERROR UNSTRUCTURED verdict of
// scripts/check-observability.mjs.
//
// run_pipeline_checked is present, so OUTPUT CHECK MISSING does not fire, but
// the boundary rejects with an opaque string that names no failure kind.

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn compute_json(input: &str) -> Result<String, JsValue> {
    let engine_input: EngineInput =
        serde_json::from_str(input).map_err(|_| JsValue::from_str("boom"))?;
    let output = run_pipeline_checked(&engine_input).map_err(|_| JsValue::from_str("boom"))?;
    serde_json::to_string(&output).map_err(|_| JsValue::from_str("boom"))
}

use wasm_bindgen::prelude::*;
use crate::pipeline::run_pipeline_checked;
use crate::types::EngineInput;

#[wasm_bindgen]
pub fn compute_json(input: &str) -> Result<String, JsValue> {
    let engine_input: EngineInput = serde_json::from_str(input)
        .map_err(|e| JsValue::from_str(&format!("Input parse error: {e}")))?;
    let output = run_pipeline_checked(&engine_input).map_err(|defects| {
        let joined = defects
            .iter()
            .map(|d| d.to_string())
            .collect::<Vec<_>>()
            .join("; ");
        JsValue::from_str(&format!("Engine output check failed: {joined}"))
    })?;
    serde_json::to_string(&output)
        .map_err(|e| JsValue::from_str(&format!("Output serialize error: {e}")))
}

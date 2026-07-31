//! The WASM boundary.
//!
//! Every failure path rejects with a JSON **document**, not a sentence, so the
//! JavaScript side can switch on `kind` instead of matching substrings:
//!
//! ```json
//! {"error":{"kind":"invalid_input","message":"...","detail":"..."}}
//! ```
//!
//! `kind` is always one of exactly three strings — `invalid_input`,
//! `output_check`, `serialize`. `message` is fixed text a user can read; `detail`
//! is the engine's own diagnostic and may be any length.
//!
//! The payload is built with `serde_json::json!` rather than string concatenation
//! on purpose: a `serde` error containing a quote or a newline would otherwise
//! produce invalid JSON and the kind would be lost.

use serde_json::json;
use wasm_bindgen::prelude::*;

use crate::pipeline::run_pipeline_checked;
use crate::types::EngineInput;

/// Build the structured rejection payload.
///
/// Rejecting with a `JsValue` string is what makes the failure a thrown JS value
/// rather than an unrecoverable WASM trap; that mechanism is deliberate and must
/// not be replaced.
fn engine_error(kind: &str, message: &str, detail: &str) -> JsValue {
    let payload = json!({
        "error": {
            "kind": kind,
            "message": message,
            "detail": detail,
        }
    });
    JsValue::from_str(&payload.to_string())
}

#[wasm_bindgen]
pub fn compute_json(input: &str) -> Result<String, JsValue> {
    let engine_input: EngineInput = serde_json::from_str(input).map_err(|e| {
        engine_error(
            "invalid_input",
            "The engine input could not be parsed.",
            &e.to_string(),
        )
    })?;

    let output = run_pipeline_checked(&engine_input).map_err(|defects| {
        let joined = defects
            .iter()
            .map(|d| d.to_string())
            .collect::<Vec<_>>()
            .join("; ");
        engine_error(
            "output_check",
            "The computed distribution failed the engine output check.",
            &joined,
        )
    })?;

    serde_json::to_string(&output).map_err(|e| {
        engine_error(
            "serialize",
            "The engine output could not be serialised.",
            &e.to_string(),
        )
    })
}

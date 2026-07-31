// Fixture for scripts/check-lawyer-agenda.mjs — NOT part of the engine crate.
//
// It lives under scripts/fixtures/ rather than engine/src/ precisely so that
// `cargo test` never compiles it. It contains the anchor pattern exactly once
// and deliberately carries NO decision marker, which is what makes the
// DECISION MARKER MISSING verdict observable.

/// Stub standing in for the real eligibility gate.
pub fn check_eligibility() -> bool {
    true
}

//! Runtime output checks.
//!
//! Two invariants that were previously only test assertions now run on every
//! production computation, including the one a lawyer triggers from the browser:
//!
//! 1. **Conservation** — the per-heir `net_from_estate` values must sum exactly to
//!    the net distributable estate. This is the identical predicate
//!    `engine/tests/fuzz_invariants.rs` applies over its 100 cases.
//! 2. **Uniqueness** — no `heir_id` may appear twice in `per_heir_shares`.
//!
//! Silent wrongness is categorically worse than loud failure in this product: a
//! wrong number here becomes a wrong pleading. So a defect is **reported, never
//! corrected**. There is no repair path, no clamping and no rounding fix, and
//! `check_output` takes an immutable reference so there could not be one.
//!
//! Nothing in this module may panic. A panic would become an unrecoverable WASM
//! trap in the browser, which is the opposite of the structured failure the
//! product needs. There is no `unwrap`, no `expect`, no positional indexing and no
//! fallible integer conversion here, and a grep asserts it.

use std::collections::HashMap;
use std::fmt;

use num_bigint::BigInt;
use num_traits::Zero;

use crate::types::{EngineOutput, HeirId, Money};

/// A defect found in a computed `EngineOutput`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum OutputDefect {
    /// The per-heir `net_from_estate` values do not sum to the distributable estate.
    SumMismatch { expected: BigInt, actual: BigInt },
    /// The same `heir_id` appears more than once in `per_heir_shares`.
    DuplicateHeirId {
        heir_id: HeirId,
        occurrences: usize,
    },
}

impl fmt::Display for OutputDefect {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            OutputDefect::SumMismatch { expected, actual } => write!(
                f,
                "sum conservation violated: per-heir net_from_estate totals {actual} centavos, distributable estate is {expected} centavos"
            ),
            OutputDefect::DuplicateHeirId {
                heir_id,
                occurrences,
            } => write!(
                f,
                "duplicate heir_id in per_heir_shares: {heir_id} appears {occurrences} times"
            ),
        }
    }
}

/// Check a computed output against the two runtime invariants.
///
/// Collects **every** defect before returning — it never short-circuits on the
/// first — and returns `Ok(())` only when nothing was found. Never panics and
/// never modifies `output`.
pub fn check_output(
    output: &EngineOutput,
    net_estate: &Money,
) -> Result<(), Vec<OutputDefect>> {
    let mut defects: Vec<OutputDefect> = Vec::new();

    // 1. Conservation.
    //
    // `net_from_estate`, not `total`: `total` is the gross entitlement and
    // includes collated donations that never came out of the physical estate.
    //
    // Run unconditionally. Scenario I15 (escheat) synthesises a State share rather
    // than producing an empty distribution, so an empty `per_heir_shares` against a
    // nonzero estate is a defect, not a legitimate escheat.
    let actual = output
        .per_heir_shares
        .iter()
        .fold(BigInt::zero(), |acc, s| acc + &s.net_from_estate.centavos);
    if actual != net_estate.centavos {
        defects.push(OutputDefect::SumMismatch {
            expected: net_estate.centavos.clone(),
            actual,
        });
    }

    // 2. Uniqueness.
    let mut counts: HashMap<&str, usize> = HashMap::new();
    for share in &output.per_heir_shares {
        *counts.entry(share.heir_id.as_str()).or_insert(0) += 1;
    }
    let mut duplicates: Vec<OutputDefect> = counts
        .into_iter()
        .filter(|(_, n)| *n > 1)
        .map(|(id, n)| OutputDefect::DuplicateHeirId {
            heir_id: id.to_string(),
            occurrences: n,
        })
        .collect();
    // Sorted so the defect list is deterministic regardless of hash order.
    duplicates.sort_by(|a, b| match (a, b) {
        (
            OutputDefect::DuplicateHeirId { heir_id: x, .. },
            OutputDefect::DuplicateHeirId { heir_id: y, .. },
        ) => x.cmp(y),
        _ => std::cmp::Ordering::Equal,
    });
    defects.extend(duplicates);

    if defects.is_empty() {
        Ok(())
    } else {
        Err(defects)
    }
}

// ── Tests ───────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::*;

    fn share(heir_id: &str, net_centavos: i64) -> InheritanceShare {
        InheritanceShare {
            heir_id: heir_id.to_string(),
            heir_name: heir_id.to_string(),
            heir_category: EffectiveCategory::LegitimateChildGroup,
            inherits_by: InheritanceMode::OwnRight,
            represents: None,
            from_legitime: Money::new(0),
            from_free_portion: Money::new(0),
            from_intestate: Money::new(net_centavos),
            total: Money::new(net_centavos),
            legitime_fraction: "0".to_string(),
            legal_basis: vec![],
            donations_imputed: Money::new(0),
            gross_entitlement: Money::new(net_centavos),
            net_from_estate: Money::new(net_centavos),
        }
    }

    fn output(shares: Vec<InheritanceShare>) -> EngineOutput {
        EngineOutput {
            per_heir_shares: shares,
            narratives: vec![],
            computation_log: ComputationLog {
                steps: vec![],
                total_restarts: 0,
                final_scenario: "I1".to_string(),
            },
            warnings: Vec::new(),
            succession_type: SuccessionType::Intestate,
            scenario_code: ScenarioCode::I1,
        }
    }

    #[test]
    fn test_clean_output_passes() {
        let o = output(vec![share("h1", 600_000), share("h2", 400_000)]);
        assert_eq!(check_output(&o, &Money::new(1_000_000)), Ok(()));
    }

    #[test]
    fn test_sum_mismatch_is_rejected() {
        let o = output(vec![share("h1", 600_001), share("h2", 400_000)]);
        let defects = check_output(&o, &Money::new(1_000_000))
            .expect_err("an unbalanced distribution must be rejected");

        assert_eq!(defects.len(), 1);
        assert_eq!(
            defects[0],
            OutputDefect::SumMismatch {
                expected: BigInt::from(1_000_000),
                actual: BigInt::from(1_000_001),
            }
        );
    }

    #[test]
    fn test_duplicate_heir_id_is_rejected() {
        let o = output(vec![share("h1", 600_000), share("h1", 400_000)]);
        let defects = check_output(&o, &Money::new(1_000_000))
            .expect_err("a duplicated heir_id must be rejected");

        assert_eq!(defects.len(), 1);
        assert_eq!(
            defects[0],
            OutputDefect::DuplicateHeirId {
                heir_id: "h1".to_string(),
                occurrences: 2,
            }
        );
    }

    #[test]
    fn test_both_defects_are_reported_together() {
        // Unbalanced AND duplicated: the check must not short-circuit.
        let o = output(vec![share("h1", 600_001), share("h1", 400_000)]);
        let defects = check_output(&o, &Money::new(1_000_000))
            .expect_err("both defects must be rejected");

        assert_eq!(defects.len(), 2);
        assert_eq!(
            defects[0],
            OutputDefect::SumMismatch {
                expected: BigInt::from(1_000_000),
                actual: BigInt::from(1_000_001),
            }
        );
        assert_eq!(
            defects[1],
            OutputDefect::DuplicateHeirId {
                heir_id: "h1".to_string(),
                occurrences: 2,
            }
        );
    }

    #[test]
    fn test_empty_shares_with_nonzero_estate_is_rejected() {
        let o = output(vec![]);
        let defects = check_output(&o, &Money::new(1_000_000))
            .expect_err("an empty distribution against a nonzero estate must be rejected");

        assert_eq!(defects.len(), 1);
        assert_eq!(
            defects[0],
            OutputDefect::SumMismatch {
                expected: BigInt::from(1_000_000),
                actual: BigInt::zero(),
            }
        );
    }

    #[test]
    fn test_display_text_of_both_variants() {
        assert_eq!(
            OutputDefect::SumMismatch {
                expected: BigInt::from(1_000_000),
                actual: BigInt::from(1_000_001),
            }
            .to_string(),
            "sum conservation violated: per-heir net_from_estate totals 1000001 centavos, distributable estate is 1000000 centavos"
        );
        assert_eq!(
            OutputDefect::DuplicateHeirId {
                heir_id: "h1".to_string(),
                occurrences: 2,
            }
            .to_string(),
            "duplicate heir_id in per_heir_shares: h1 appears 2 times"
        );
    }
}

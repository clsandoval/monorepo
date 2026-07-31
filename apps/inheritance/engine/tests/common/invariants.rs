//! The named property invariants, shared by `tests/fuzz_invariants.rs` and
//! `tests/defect_ledger.rs` via `#[path] mod`.
//!
//! A Rust integration-test binary cannot import another test binary's items, so the two
//! suites include this one file instead of copying predicates. That is deliberate: the
//! defect ledger only means something if it evaluates the *identical* predicate the green
//! corpus is held to. Copy-paste would let the two drift apart silently, which is exactly
//! the failure mode this project exists to prevent.
//!
//! Every check function returns a `Vec<String>` of violations rather than asserting, so a
//! caller can decide whether a violation is a failure (the green corpus) or an expectation
//! (the defect ledger). Each returned string begins with the invariant id, then a colon and
//! a space, then the offending heir id where the violation is per-row, then the expected and
//! observed values.

use std::collections::HashMap;
use std::fs;
use std::path::Path;

use num_bigint::BigInt;
use num_traits::Zero;

use inheritance_engine::pipeline::run_pipeline;
use inheritance_engine::types::*;

/// A parsed corpus entry: filename, the input, and the output `run_pipeline` produced.
pub struct Case {
    pub filename: String,
    pub input: EngineInput,
    pub output: EngineOutput,
}

/// Load every `.json` file in `dirs`, in sorted filename order, and run the pipeline on each.
///
/// `run_pipeline` is called inside `catch_unwind` because a panic is an expected failure mode
/// this suite exists to detect. `run_pipeline_checked` is deliberately NOT used: the checked
/// entry point rejects the defect cases before an invariant can be evaluated.
pub fn load_corpus(dirs: &[&str]) -> Vec<Case> {
    let mut cases = Vec::new();

    for dir_name in dirs {
        let dir = Path::new(dir_name);
        assert!(
            dir.exists(),
            "corpus directory not found: {dir_name}. Run the generator that produces it."
        );

        let mut entries: Vec<_> = fs::read_dir(dir)
            .unwrap_or_else(|e| panic!("cannot read {dir_name}: {e}"))
            .filter_map(|e| e.ok())
            .filter(|e| e.path().extension().map_or(false, |ext| ext == "json"))
            .collect();
        entries.sort_by_key(|e| e.file_name());

        assert!(!entries.is_empty(), "no .json files found in {dir_name}");

        for entry in &entries {
            let path = entry.path();
            let filename = path.file_name().unwrap().to_string_lossy().to_string();

            let json_str = fs::read_to_string(&path)
                .unwrap_or_else(|e| panic!("cannot read {filename}: {e}"));
            let input: EngineInput = serde_json::from_str(&json_str)
                .unwrap_or_else(|e| panic!("{filename}: PARSE ERROR: {e}"));

            let output = match std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
                run_pipeline(&input)
            })) {
                Ok(o) => o,
                Err(_) => panic!("{filename}: PANIC in run_pipeline"),
            };

            cases.push(Case {
                filename,
                input,
                output,
            });
        }
    }

    cases
}

// ══════════════════════════════════════════════════════════════════════
// The invariant check functions
// ══════════════════════════════════════════════════════════════════════

/// INV01 — sum of `net_from_estate` across rows equals the distributable estate.
pub fn inv01_sum_conservation(input: &EngineInput, output: &EngineOutput) -> Vec<String> {
    let estate = &input.net_distributable_estate.centavos;
    let sum_nfe: BigInt = output
        .per_heir_shares
        .iter()
        .map(|s| s.net_from_estate.centavos.clone())
        .fold(BigInt::zero(), |a, b| a + b);
    if sum_nfe != *estate {
        return vec![format!(
            "INV01: sum_conservation expected estate={estate}, observed sum_net_from_estate={sum_nfe}"
        )];
    }
    Vec::new()
}

/// INV02 — no row has a negative `total`.
pub fn inv02_legitime_floor(_input: &EngineInput, output: &EngineOutput) -> Vec<String> {
    let mut v = Vec::new();
    for share in &output.per_heir_shares {
        if share.total.centavos < BigInt::zero() {
            v.push(format!(
                "INV02: {} legitime_floor expected total>=0, observed total={}",
                share.heir_id, share.total.centavos
            ));
        }
    }
    v
}

/// INV03 — with both present and nonzero, `max(IC total)` does not exceed
/// `min(LC own-right total)`. Applies to every succession type: measured over all 140
/// committed inputs with zero violations, so the previous testate-only gate was removed.
pub fn inv03_ic_le_lc(_input: &EngineInput, output: &EngineOutput) -> Vec<String> {
    let lc_shares: Vec<&BigInt> = output
        .per_heir_shares
        .iter()
        .filter(|s| {
            s.heir_category == EffectiveCategory::LegitimateChildGroup
                && matches!(s.inherits_by, InheritanceMode::OwnRight)
                && s.total.centavos > BigInt::zero()
        })
        .map(|s| &s.total.centavos)
        .collect();
    let ic_shares: Vec<&BigInt> = output
        .per_heir_shares
        .iter()
        .filter(|s| {
            s.heir_category == EffectiveCategory::IllegitimateChildGroup
                && s.total.centavos > BigInt::zero()
        })
        .map(|s| &s.total.centavos)
        .collect();
    if lc_shares.is_empty() || ic_shares.is_empty() {
        return Vec::new();
    }
    let max_ic = ic_shares.iter().max().unwrap();
    let min_lc = lc_shares.iter().min().unwrap();
    if max_ic > min_lc {
        return vec![format!(
            "INV03: ic_le_lc expected max_ic<=min_lc={min_lc}, observed max_ic={max_ic}"
        )];
    }
    Vec::new()
}

/// INV04 — the total of all `IllegitimateChildGroup` totals does not exceed the estate.
/// Applies to every succession type; the previous testate-only gate was removed.
pub fn inv04_ic_cap(input: &EngineInput, output: &EngineOutput) -> Vec<String> {
    let estate = &input.net_distributable_estate.centavos;
    let total_ic: BigInt = output
        .per_heir_shares
        .iter()
        .filter(|s| s.heir_category == EffectiveCategory::IllegitimateChildGroup)
        .map(|s| s.total.centavos.clone())
        .fold(BigInt::zero(), |a, b| a + b);
    if total_ic > *estate {
        return vec![format!(
            "INV04: ic_cap expected total_ic<=estate={estate}, observed total_ic={total_ic}"
        )];
    }
    Vec::new()
}

/// INV05 — `represents` and `inherits_by == Representation` imply each other, and no
/// representation group sums to a negative amount. Both directions measured with zero
/// violations over the committed corpus.
pub fn inv05_representation_link(_input: &EngineInput, output: &EngineOutput) -> Vec<String> {
    let mut v = Vec::new();

    for share in &output.per_heir_shares {
        let has_represents = share.represents.is_some();
        let by_representation = matches!(share.inherits_by, InheritanceMode::Representation);
        if has_represents && !by_representation {
            v.push(format!(
                "INV05: {} representation_link expected inherits_by=Representation because represents is set, observed inherits_by={:?}",
                share.heir_id, share.inherits_by
            ));
        }
        if by_representation && !has_represents {
            v.push(format!(
                "INV05: {} representation_link expected represents to be set because inherits_by=Representation, observed represents=None",
                share.heir_id
            ));
        }
    }

    let mut rep_groups: HashMap<&str, BigInt> = HashMap::new();
    for share in &output.per_heir_shares {
        if let Some(ref ancestor) = share.represents {
            let entry = rep_groups
                .entry(ancestor.as_str())
                .or_insert_with(BigInt::zero);
            *entry += &share.net_from_estate.centavos;
        }
    }
    for (ancestor_id, sum) in &rep_groups {
        if *sum < BigInt::zero() {
            v.push(format!(
                "INV05: {ancestor_id} representation_link expected representation-group sum>=0, observed sum={sum}"
            ));
        }
    }

    v
}

/// INV06 — an `AdoptedChild` is treated as a legitimate child.
///
/// Real check, replacing a body that only asserted `net_from_estate >= 0` and therefore
/// duplicated SAFETY02. Two conditions: the adopted child's row is in
/// `LegitimateChildGroup`, and its `total` equals every other own-right
/// `LegitimateChildGroup` total in the same case, comparing only rows where both sides have
/// `donations_imputed == 0` and both totals are above zero (collation legitimately makes
/// siblings unequal).
pub fn inv06_adoption_equality(input: &EngineInput, output: &EngineOutput) -> Vec<String> {
    let mut v = Vec::new();

    let adopted_ids: Vec<&str> = input
        .family_tree
        .iter()
        .filter(|p| p.relationship_to_decedent == Relationship::AdoptedChild)
        .map(|p| p.id.as_str())
        .collect();
    if adopted_ids.is_empty() {
        return v;
    }

    for adopted_id in &adopted_ids {
        let adopted_share = match output
            .per_heir_shares
            .iter()
            .find(|s| s.heir_id == *adopted_id)
        {
            Some(s) => s,
            None => continue,
        };

        if adopted_share.heir_category != EffectiveCategory::LegitimateChildGroup {
            v.push(format!(
                "INV06: {adopted_id} adoption_equality expected heir_category=LegitimateChildGroup, observed {:?}",
                adopted_share.heir_category
            ));
            continue;
        }

        if adopted_share.donations_imputed.centavos != BigInt::zero()
            || adopted_share.total.centavos <= BigInt::zero()
        {
            continue;
        }

        for other in &output.per_heir_shares {
            if other.heir_id == adopted_share.heir_id {
                continue;
            }
            if other.heir_category != EffectiveCategory::LegitimateChildGroup
                || !matches!(other.inherits_by, InheritanceMode::OwnRight)
                || other.donations_imputed.centavos != BigInt::zero()
                || other.total.centavos <= BigInt::zero()
            {
                continue;
            }
            if other.total.centavos != adopted_share.total.centavos {
                v.push(format!(
                    "INV06: {adopted_id} adoption_equality expected total={} (same as legitimate sibling {}), observed total={}",
                    other.total.centavos, other.heir_id, adopted_share.total.centavos
                ));
            }
        }
    }

    v
}

/// INV07 — an `IntestateByPreterition` succession distributes something.
pub fn inv07_preterition_annulment(_input: &EngineInput, output: &EngineOutput) -> Vec<String> {
    if output.succession_type != SuccessionType::IntestateByPreterition {
        return Vec::new();
    }
    let any_positive = output
        .per_heir_shares
        .iter()
        .any(|s| s.total.centavos > BigInt::zero());
    if !any_positive {
        return vec![
            "INV07: preterition_annulment expected at least one heir with total>0, observed none"
                .to_string(),
        ];
    }
    Vec::new()
}

/// INV08 — a validly disinherited heir with no children receives nothing.
pub fn inv08_disinheritance_zero(input: &EngineInput, output: &EngineOutput) -> Vec<String> {
    let mut v = Vec::new();
    let will = match input.will {
        Some(ref w) => w,
        None => return v,
    };

    for dis in &will.disinheritances {
        if !(dis.cause_specified_in_will && dis.cause_proven && !dis.reconciliation_occurred) {
            continue;
        }
        let pid = match dis.heir_reference.person_id {
            Some(ref p) => p,
            None => continue,
        };
        let has_children = input
            .family_tree
            .iter()
            .find(|p| &p.id == pid)
            .map(|p| !p.children.is_empty())
            .unwrap_or(false);
        if has_children {
            continue;
        }
        if let Some(share) = output.per_heir_shares.iter().find(|s| &s.heir_id == pid) {
            if share.total.centavos != BigInt::zero() {
                v.push(format!(
                    "INV08: {pid} disinheritance_zero expected total=0 (validly disinherited, no children), observed total={}",
                    share.total.centavos
                ));
            }
        }
    }
    v
}

/// INV09 — per row, `gross_entitlement == net_from_estate + donations_imputed`.
///
/// Real check, replacing a comment that evaluated nothing. Measured over 564 rows with zero
/// violations.
pub fn inv09_collation_identity(_input: &EngineInput, output: &EngineOutput) -> Vec<String> {
    let mut v = Vec::new();
    for share in &output.per_heir_shares {
        let expected = &share.net_from_estate.centavos + &share.donations_imputed.centavos;
        if share.gross_entitlement.centavos != expected {
            v.push(format!(
                "INV09: {} collation_identity expected gross_entitlement={expected} (net_from_estate {} + donations_imputed {}), observed {}",
                share.heir_id,
                share.net_from_estate.centavos,
                share.donations_imputed.centavos,
                share.gross_entitlement.centavos
            ));
        }
    }
    v
}

/// INV10 — the scenario-code prefix matches the succession type.
///
/// A prefix check on purpose: this runs over generated cases whose exact code is not known
/// in advance. The exact-code assertions live in `tests/integration.rs`, one per legal
/// vector. `IntestateByPreterition` keeps the original T-prefixed code because preterition
/// is detected during testate validation in step 6.
pub fn inv10_scenario_consistency(_input: &EngineInput, output: &EngineOutput) -> Vec<String> {
    let sc = format!("{:?}", output.scenario_code);
    let st = &output.succession_type;
    let prefix_ok = match st {
        SuccessionType::Intestate => sc.starts_with('I'),
        SuccessionType::IntestateByPreterition => sc.starts_with('T') || sc.starts_with('I'),
        SuccessionType::Testate | SuccessionType::Mixed => sc.starts_with('T'),
    };
    if !prefix_ok {
        return vec![format!(
            "INV10: scenario_consistency expected a prefix matching type={st:?}, observed scenario={sc}"
        )];
    }
    Vec::new()
}

/// INV11 — per row, `gross_entitlement >= net_from_estate`.
pub fn inv11_gross_ge_net(_input: &EngineInput, output: &EngineOutput) -> Vec<String> {
    let mut v = Vec::new();
    for share in &output.per_heir_shares {
        if share.gross_entitlement.centavos < share.net_from_estate.centavos {
            v.push(format!(
                "INV11: {} gross_ge_net expected gross_entitlement>=net_from_estate={}, observed gross_entitlement={}",
                share.heir_id, share.net_from_estate.centavos, share.gross_entitlement.centavos
            ));
        }
    }
    v
}

/// INV12 — per row, `donations_imputed >= 0`.
pub fn inv12_donations_imputed_nonneg(
    _input: &EngineInput,
    output: &EngineOutput,
) -> Vec<String> {
    let mut v = Vec::new();
    for share in &output.per_heir_shares {
        if share.donations_imputed.centavos < BigInt::zero() {
            v.push(format!(
                "INV12: {} donations_imputed_nonneg expected donations_imputed>=0, observed {}",
                share.heir_id, share.donations_imputed.centavos
            ));
        }
    }
    v
}

/// INV13 — `heir_id` values are unique within `per_heir_shares`.
pub fn inv13_unique_heir_id(_input: &EngineInput, output: &EngineOutput) -> Vec<String> {
    let mut counts: HashMap<&str, usize> = HashMap::new();
    for share in &output.per_heir_shares {
        *counts.entry(share.heir_id.as_str()).or_insert(0) += 1;
    }
    let mut dupes: Vec<(&str, usize)> = counts
        .into_iter()
        .filter(|(_, n)| *n > 1)
        .collect();
    dupes.sort();
    dupes
        .into_iter()
        .map(|(heir_id, n)| {
            format!("INV13: {heir_id} unique_heir_id expected 1 occurrence, observed {n}")
        })
        .collect()
}

/// INV14 — every row carries a non-empty `legitime_fraction`.
pub fn inv14_legitime_fraction_present(
    _input: &EngineInput,
    output: &EngineOutput,
) -> Vec<String> {
    let mut v = Vec::new();
    for share in &output.per_heir_shares {
        if share.legitime_fraction.is_empty() {
            v.push(format!(
                "INV14: {} legitime_fraction_present expected a non-empty legitime_fraction, observed \"\"",
                share.heir_id
            ));
        }
    }
    v
}

/// SAFETY01 — no single row's `net_from_estate` exceeds the estate.
pub fn safety01_single_share_cap(input: &EngineInput, output: &EngineOutput) -> Vec<String> {
    let estate = &input.net_distributable_estate.centavos;
    let mut v = Vec::new();
    for share in &output.per_heir_shares {
        if share.net_from_estate.centavos > *estate {
            v.push(format!(
                "SAFETY01: {} single_share_cap expected net_from_estate<=estate={estate}, observed {}",
                share.heir_id, share.net_from_estate.centavos
            ));
        }
    }
    v
}

/// SAFETY02 — no row has a negative `net_from_estate`.
pub fn safety02_no_negative_nfe(_input: &EngineInput, output: &EngineOutput) -> Vec<String> {
    let mut v = Vec::new();
    for share in &output.per_heir_shares {
        if share.net_from_estate.centavos < BigInt::zero() {
            v.push(format!(
                "SAFETY02: {} no_negative_nfe expected net_from_estate>=0, observed {}",
                share.heir_id, share.net_from_estate.centavos
            ));
        }
    }
    v
}

/// `(id, human_name, check_fn)` for every named invariant.
pub const INVARIANTS: &[(
    &str,
    &str,
    fn(&EngineInput, &EngineOutput) -> Vec<String>,
)] = &[
    ("INV01", "sum_conservation", inv01_sum_conservation),
    ("INV02", "legitime_floor", inv02_legitime_floor),
    ("INV03", "ic_le_lc", inv03_ic_le_lc),
    ("INV04", "ic_cap", inv04_ic_cap),
    ("INV05", "representation_link", inv05_representation_link),
    ("INV06", "adoption_equality", inv06_adoption_equality),
    ("INV07", "preterition_annulment", inv07_preterition_annulment),
    ("INV08", "disinheritance_zero", inv08_disinheritance_zero),
    ("INV09", "collation_identity", inv09_collation_identity),
    ("INV10", "scenario_consistency", inv10_scenario_consistency),
    ("INV11", "gross_ge_net", inv11_gross_ge_net),
    (
        "INV12",
        "donations_imputed_nonneg",
        inv12_donations_imputed_nonneg,
    ),
    ("INV13", "unique_heir_id", inv13_unique_heir_id),
    (
        "INV14",
        "legitime_fraction_present",
        inv14_legitime_fraction_present,
    ),
    ("SAFETY01", "single_share_cap", safety01_single_share_cap),
    ("SAFETY02", "no_negative_nfe", safety02_no_negative_nfe),
];

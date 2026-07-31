//! Property invariants over the generated corpora.
//!
//! Reads every case in `examples/fuzz-cases/` (100 files, SEED 20260224) **and**
//! `examples/coverage-cases/` (30 files, SEED 20260731), and evaluates each named invariant
//! as its own `#[test]`. Cargo therefore reports *which* invariant broke, not merely that
//! "a test failed" — that is the whole point of the split, and it is requirement COV-02.
//!
//! The predicates themselves live in `tests/common/invariants.rs`, shared with
//! `tests/defect_ledger.rs` so the two suites cannot drift apart.
//!
//! Generate fixtures first:
//!     python3 examples/generate-fuzz-cases.py
//!     python3 examples/generate-coverage-cases.py
//! Run:
//!     cargo test --test fuzz_invariants
//!
//! `examples/defect-cases/` is deliberately NOT read here. Those three inputs are known to
//! violate sum conservation today; `tests/defect_ledger.rs` owns them and asserts exactly
//! which invariants each one breaks.

#[path = "common/invariants.rs"]
mod invariants;

use invariants::{load_corpus, Case, INVARIANTS};

use inheritance_engine::types::{EngineInput, EngineOutput};

/// Both generated corpora. `examples/cases` and `examples/testate-cases` are hand-curated
/// and are covered by `tests/integration.rs`; this suite is the property layer.
const CORPUS_DIRS: &[&str] = &["examples/fuzz-cases", "examples/coverage-cases"];

/// Floor on the combined file count, so deleting inputs cannot quietly shrink what these
/// tests cover. 100 fuzz cases + 30 coverage cases = 130 today.
const MIN_CORPUS_FILES: usize = 130;

fn corpus() -> Vec<Case> {
    let cases = load_corpus(CORPUS_DIRS);
    assert!(
        cases.len() >= MIN_CORPUS_FILES,
        "corpus shrank: {} case(s) loaded from {:?}, expected at least {}",
        cases.len(),
        CORPUS_DIRS,
        MIN_CORPUS_FILES
    );
    cases
}

/// Run one invariant over the whole corpus and panic with every violation it found.
fn run_invariant(
    id: &str,
    name: &str,
    check: fn(&EngineInput, &EngineOutput) -> Vec<String>,
) {
    let cases = corpus();
    let mut failing_cases = 0usize;
    let mut report: Vec<String> = Vec::new();

    for case in &cases {
        let violations = check(&case.input, &case.output);
        if !violations.is_empty() {
            failing_cases += 1;
            report.push(format!("{}:\n    {}", case.filename, violations.join("\n    ")));
        }
    }

    if !report.is_empty() {
        panic!(
            "\n{id} {name}: {failing_cases} of {} case(s) violated this invariant:\n\n{}\n",
            cases.len(),
            report.join("\n\n")
        );
    }
}

macro_rules! invariant_test {
    ($test_name:ident, $index:expr) => {
        #[test]
        fn $test_name() {
            let (id, name, check) = INVARIANTS[$index];
            run_invariant(id, name, check);
        }
    };
}

invariant_test!(test_inv01_sum_conservation, 0);
invariant_test!(test_inv02_legitime_floor, 1);
invariant_test!(test_inv03_ic_le_lc, 2);
invariant_test!(test_inv04_ic_cap, 3);
invariant_test!(test_inv05_representation_link, 4);
invariant_test!(test_inv06_adoption_equality, 5);
invariant_test!(test_inv07_preterition_annulment, 6);
invariant_test!(test_inv08_disinheritance_zero, 7);
invariant_test!(test_inv09_collation_identity, 8);
invariant_test!(test_inv10_scenario_consistency, 9);
invariant_test!(test_inv11_gross_ge_net, 10);
invariant_test!(test_inv12_donations_imputed_nonneg, 11);
invariant_test!(test_inv13_unique_heir_id, 12);
invariant_test!(test_inv14_legitime_fraction_present, 13);
invariant_test!(test_safety01_single_share_cap, 14);
invariant_test!(test_safety02_no_negative_nfe, 15);

/// Roll-up. Kept from the original single-test form and never removed: a case that breaks
/// four invariants is reported once with all four, instead of appearing as four separate
/// test failures with no indication they share a cause.
#[test]
fn test_fuzz_invariants() {
    let cases = corpus();

    let mut passed = 0usize;
    let mut failed = 0usize;
    let mut failures: Vec<String> = Vec::new();

    for case in &cases {
        let mut case_failures: Vec<String> = Vec::new();
        for (_id, _name, check) in INVARIANTS {
            case_failures.extend(check(&case.input, &case.output));
        }
        if case_failures.is_empty() {
            passed += 1;
        } else {
            failed += 1;
            failures.push(format!("{}:\n    {}", case.filename, case_failures.join("\n    ")));
        }
    }

    eprintln!("\n=== Property Invariant Results ===");
    eprintln!("Corpus: {:?}", CORPUS_DIRS);
    eprintln!("Invariants: {}", INVARIANTS.len());
    eprintln!("Passed: {passed}/{}", passed + failed);
    eprintln!("Failed: {failed}/{}", passed + failed);

    if !failures.is_empty() {
        panic!(
            "\n{failed} case(s) failed invariant checks:\n\n{}\n",
            failures.join("\n\n")
        );
    }
}

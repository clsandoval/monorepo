//! Corpus-wide observability assertions (OBS-01 … OBS-09).
//!
//! Every plan in Phase 5 changed a behavior that is invisible unless something
//! looks for it. The measured starting point, taken live over all 140 committed
//! inputs and 564 per-heir rows:
//!
//! | Quantity | Before |
//! |---|---|
//! | rows with a nonzero `from_legitime` | 0 |
//! | rows with a nonzero `from_free_portion` | 0 |
//! | rows with a nonzero `from_intestate` | 0 |
//! | rows with a non-empty `legitime_fraction` | 0 |
//! | cases emitting any warning | 0 of 140 |
//! | `computation_log.steps` length | exactly 1, every case |
//!
//! This file turns those six numbers into assertions that run on every
//! `cargo test`. It is the *behavioral* half of the anti-regression pair;
//! `scripts/check-observability.mjs` (gate G11) is the *source* half, catching a
//! re-suppression on a path no test happens to cover.
//!
//! Modelled on `engine/tests/fuzz_invariants.rs`: collect every per-file failure
//! and report them all at once rather than panicking on the first.

use std::fs;
use std::path::{Path, PathBuf};

use num_bigint::BigInt;
use num_traits::Zero;

use inheritance_engine::output_check::check_output;
use inheritance_engine::pipeline::run_pipeline;
use inheritance_engine::types::*;

const CORPUS_DIRS: [&str; 3] = [
    "examples/cases",
    "examples/fuzz-cases",
    "examples/testate-cases",
];

/// Floor on the committed corpus. Deleting inputs must not quietly shrink what
/// these tests cover.
const MIN_CORPUS_FILES: usize = 140;

/// Collect every committed `.json` input across the three corpus directories.
fn corpus_files() -> Vec<PathBuf> {
    let mut files: Vec<PathBuf> = Vec::new();
    for dir_name in CORPUS_DIRS {
        let dir = Path::new(dir_name);
        assert!(
            dir.exists(),
            "corpus directory not found: {dir_name} (run from engine/)"
        );
        let mut entries: Vec<PathBuf> = fs::read_dir(dir)
            .unwrap_or_else(|e| panic!("cannot read {dir_name}: {e}"))
            .filter_map(|e| e.ok())
            .map(|e| e.path())
            .filter(|p| p.extension().is_some_and(|ext| ext == "json"))
            .collect();
        entries.sort();
        files.extend(entries);
    }
    assert!(
        files.len() >= MIN_CORPUS_FILES,
        "corpus shrank: found {} committed inputs across {:?}, expected at least {}",
        files.len(),
        CORPUS_DIRS,
        MIN_CORPUS_FILES
    );
    files
}

fn load(path: &Path) -> (String, EngineInput) {
    let name = path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_else(|| path.display().to_string());
    let json = fs::read_to_string(path).unwrap_or_else(|e| panic!("cannot read {name}: {e}"));
    let input: EngineInput =
        serde_json::from_str(&json).unwrap_or_else(|e| panic!("cannot parse {name}: {e}"));
    (name, input)
}

/// The six inverted-baseline properties, asserted over every row of every case.
#[test]
fn test_observability_across_corpus() {
    let files = corpus_files();
    let mut failures: Vec<String> = Vec::new();

    let mut rows = 0usize;
    let mut nonzero_legitime = 0usize;
    let mut nonzero_free_portion = 0usize;
    let mut nonzero_intestate = 0usize;

    for path in &files {
        let (name, input) = load(path);
        let output = run_pipeline(&input);

        // Assertion 5 — every case reports at least ten computation-log steps.
        // Plan 05-01 established exactly 10 with no restart and exactly 18 with
        // one, so `>= 10` covers both.
        let steps = output.computation_log.steps.len();
        if steps < 10 {
            failures.push(format!(
                "{name}: computation_log.steps.len() == {steps}, expected at least 10"
            ));
        }

        for share in &output.per_heir_shares {
            rows += 1;

            // Assertion 1 — every per-heir row carries a non-empty fraction.
            if share.legitime_fraction.is_empty() {
                failures.push(format!(
                    "{name}: heir {} has an empty legitime_fraction",
                    share.heir_id
                ));
            }

            let l = &share.from_legitime.centavos;
            let f = &share.from_free_portion.centavos;
            let i = &share.from_intestate.centavos;

            if !l.is_zero() {
                nonzero_legitime += 1;
            }
            if !f.is_zero() {
                nonzero_free_portion += 1;
            }
            if !i.is_zero() {
                nonzero_intestate += 1;
            }

            // Assertion 6 — the sub-components sum to the row's gross entitlement.
            let sum: BigInt = l + f + i;
            if sum != share.gross_entitlement.centavos {
                failures.push(format!(
                    "{name}: heir {} sub-components sum to {} but gross_entitlement is {}",
                    share.heir_id, sum, share.gross_entitlement.centavos
                ));
            }
        }
    }

    // Assertions 2, 3 and 4 — each count was 0 before this phase.
    if nonzero_legitime == 0 {
        failures.push(format!(
            "corpus-wide count of rows with a nonzero from_legitime is 0 across {rows} rows; the measured pre-phase baseline was 0 and this phase must invert it"
        ));
    }
    if nonzero_free_portion == 0 {
        failures.push(format!(
            "corpus-wide count of rows with a nonzero from_free_portion is 0 across {rows} rows; the measured pre-phase baseline was 0 and this phase must invert it"
        ));
    }
    if nonzero_intestate == 0 {
        failures.push(format!(
            "corpus-wide count of rows with a nonzero from_intestate is 0 across {rows} rows; the measured pre-phase baseline was 0 and this phase must invert it"
        ));
    }

    assert!(
        failures.is_empty(),
        "observability regressed over {} committed inputs ({} rows). \
         nonzero_legitime={} nonzero_free_portion={} nonzero_intestate={}\n{}",
        files.len(),
        rows,
        nonzero_legitime,
        nonzero_free_portion,
        nonzero_intestate,
        failures.join("\n")
    );
}

/// Corpus-scale proof that the runtime rejection plan 05-05 introduced is not
/// over-tight: every committed input must still pass `check_output`.
#[test]
fn test_output_check_holds_across_corpus() {
    let files = corpus_files();
    let mut failures: Vec<String> = Vec::new();

    for path in &files {
        let (name, input) = load(path);
        let output = run_pipeline(&input);
        if let Err(defects) = check_output(&output, &input.net_distributable_estate) {
            let rendered = defects
                .iter()
                .map(|d| d.to_string())
                .collect::<Vec<_>>()
                .join("; ");
            failures.push(format!("{name}: {rendered}"));
        }
    }

    assert!(
        failures.is_empty(),
        "check_output rejected {} of {} committed inputs; the check must not be over-tight\n{}",
        failures.len(),
        files.len(),
        failures.join("\n")
    );
}

/// At least one committed case must emit a warning. The measured pre-phase
/// baseline was 0 of 140, which is what made every legal defect invisible.
#[test]
fn test_at_least_one_case_emits_a_warning() {
    let files = corpus_files();
    let mut with_warnings = 0usize;
    let mut categories: Vec<String> = Vec::new();

    for path in &files {
        let (_, input) = load(path);
        let output = run_pipeline(&input);
        if !output.warnings.is_empty() {
            with_warnings += 1;
            for w in &output.warnings {
                if !categories.contains(&w.category) {
                    categories.push(w.category.clone());
                }
            }
        }
    }

    assert!(
        with_warnings > 0,
        "0 of {} committed inputs emitted a warning. The measured pre-phase baseline was 0 of 140; \
         after plans 05-01 and 05-04 this must be greater than 0. Do not delete this assertion — \
         a zero here is a real finding.",
        files.len()
    );
}

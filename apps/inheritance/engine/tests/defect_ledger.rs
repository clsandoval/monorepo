//! The bidirectional known-violation check over `engine/defect-baseline.json`.
//!
//! `examples/defect-cases/` holds three inputs that reproduce engine defects **today**. They
//! are not surprises and they are not unowned:
//!
//!   - `01-collateral-halfblood-nephews.json` — collateral succession through a predeceased
//!     half-blood sibling duplicates every nephew row and loses a fifth of the estate.
//!     Owned by requirement **LAW-02**, scheduled for phase 7.
//!   - `02-heir-donation-above-estate.json` and `03-stranger-donee.json` — a donation
//!     *inter vivos* makes the distributed shares exceed the estate. Owned by requirement
//!     **LAW-06**, scheduled for phase 14, and blocked there on the recorded decision
//!     **LAWYER-06**, whose status in `.planning/lawyer-decisions.json` is `awaiting-answer`.
//!     Nothing in this file takes a position on which reading of Art. 771 is correct; it
//!     records arithmetic only.
//!
//! The check runs in both directions, which is what makes phases 7 and 14 self-verifying:
//!
//!   - a defect case that violates an invariant its ledger entry does not declare fails with
//!     `NEW DEFECT` — the defect got worse;
//!   - a declared violation that no longer reproduces fails with
//!     `STALE DEFECT DECLARATION` — the defect was fixed.
//!
//! **The correct response to `STALE DEFECT DECLARATION` is to delete that entry from
//! `engine/defect-baseline.json`. It is never to re-break the engine, and never to loosen
//! this test.** The ledger may only shrink. This file parses it and never writes it, and has
//! no flag that would repair it.

#[path = "common/invariants.rs"]
mod invariants;

use std::collections::BTreeSet;
use std::fs;
use std::path::Path;

use serde::Deserialize;

use invariants::{load_corpus, INVARIANTS};

use inheritance_engine::output_check::check_output;

const DEFECT_DIR: &str = "examples/defect-cases";
const LEDGER_PATH: &str = "defect-baseline.json";

#[derive(Debug, Deserialize)]
struct DefectLedger {
    known_violations: Vec<DefectEntry>,
}

#[derive(Debug, Deserialize)]
struct DefectEntry {
    case: String,
    invariants_violated: Vec<String>,
    #[allow(dead_code)]
    requirement: String,
}

fn load_ledger() -> DefectLedger {
    let raw = fs::read_to_string(LEDGER_PATH)
        .unwrap_or_else(|e| panic!("cannot read {LEDGER_PATH}: {e}"));
    serde_json::from_str(&raw)
        .unwrap_or_else(|e| panic!("{LEDGER_PATH} is not valid defect-ledger JSON: {e}"))
}

fn defect_case_filenames() -> Vec<String> {
    let dir = Path::new(DEFECT_DIR);
    assert!(dir.exists(), "defect-cases directory not found: {DEFECT_DIR}");
    let mut names: Vec<String> = fs::read_dir(dir)
        .unwrap_or_else(|e| panic!("cannot read {DEFECT_DIR}: {e}"))
        .filter_map(|e| e.ok())
        .map(|e| e.path())
        .filter(|p| p.extension().map_or(false, |ext| ext == "json"))
        .map(|p| p.file_name().unwrap().to_string_lossy().to_string())
        .collect();
    names.sort();
    names
}

/// Every defect case has exactly one ledger entry, and every ledger entry names a real file.
#[test]
fn test_every_defect_case_is_declared() {
    let ledger = load_ledger();
    let on_disk: BTreeSet<String> = defect_case_filenames().into_iter().collect();

    let mut declared: BTreeSet<String> = BTreeSet::new();
    let mut problems: Vec<String> = Vec::new();

    for entry in &ledger.known_violations {
        if !declared.insert(entry.case.clone()) {
            problems.push(format!(
                "DUPLICATE DEFECT ENTRY: {} appears more than once in {LEDGER_PATH}",
                entry.case
            ));
        }
        if !on_disk.contains(&entry.case) {
            problems.push(format!(
                "MISSING DEFECT CASE: {} is declared in {LEDGER_PATH} but no such file exists in {DEFECT_DIR}",
                entry.case
            ));
        }
    }

    for name in &on_disk {
        if !declared.contains(name) {
            problems.push(format!(
                "UNDECLARED DEFECT CASE: {DEFECT_DIR}/{name} has no entry in {LEDGER_PATH}"
            ));
        }
    }

    if !problems.is_empty() {
        panic!(
            "\n{} defect-ledger declaration problem(s):\n\n{}\n",
            problems.len(),
            problems.join("\n")
        );
    }
}

/// Each defect case violates exactly the invariants its ledger entry declares — no more, no
/// fewer.
#[test]
fn test_declared_violations_still_reproduce() {
    let ledger = load_ledger();
    let cases = load_corpus(&[DEFECT_DIR]);

    let mut failing_cases = 0usize;
    let mut problems: Vec<String> = Vec::new();

    for entry in &ledger.known_violations {
        let case = match cases.iter().find(|c| c.filename == entry.case) {
            Some(c) => c,
            // Absence is reported by test_every_defect_case_is_declared; do not double-report.
            None => continue,
        };

        let mut observed: BTreeSet<String> = BTreeSet::new();
        for (id, _name, check) in INVARIANTS {
            if !check(&case.input, &case.output).is_empty() {
                observed.insert((*id).to_string());
            }
        }
        let declared: BTreeSet<String> = entry.invariants_violated.iter().cloned().collect();

        let mut case_problems: Vec<String> = Vec::new();
        for id in observed.difference(&declared) {
            case_problems.push(format!(
                "NEW DEFECT: {} now violates {id}, which the ledger does not declare",
                entry.case
            ));
        }
        for id in declared.difference(&observed) {
            case_problems.push(format!(
                "STALE DEFECT DECLARATION: {} no longer violates {id}; delete that entry from engine/{LEDGER_PATH}",
                entry.case
            ));
        }

        if !case_problems.is_empty() {
            failing_cases += 1;
            problems.extend(case_problems);
        }
    }

    if !problems.is_empty() {
        panic!(
            "\n{failing_cases} defect case(s) no longer match the ledger:\n\n{}\n",
            problems.join("\n")
        );
    }
}

/// The corpus-level ledger and the runtime rejection must agree: every defect case is also
/// rejected by `output_check::check_output`, the entry point the browser goes through.
#[test]
fn test_defect_cases_are_rejected_by_the_checked_entry_point() {
    let cases = load_corpus(&[DEFECT_DIR]);
    let mut failing_cases = 0usize;
    let mut problems: Vec<String> = Vec::new();

    for case in &cases {
        match check_output(&case.output, &case.input.net_distributable_estate) {
            Ok(()) => {
                failing_cases += 1;
                problems.push(format!(
                    "{}: check_output returned Ok, expected Err — a case in {DEFECT_DIR} that the runtime check accepts belongs in examples/coverage-cases instead",
                    case.filename
                ));
            }
            Err(defects) => {
                let rendered: Vec<String> = defects.iter().map(|d| d.to_string()).collect();
                let joined = rendered.join(" | ");
                if !(joined.contains("sum conservation violated")
                    || joined.contains("duplicate heir_id"))
                {
                    failing_cases += 1;
                    problems.push(format!(
                        "{}: check_output returned Err but the text names neither 'sum conservation violated' nor 'duplicate heir_id'; observed: {joined}",
                        case.filename
                    ));
                }
            }
        }
    }

    if !problems.is_empty() {
        panic!(
            "\n{failing_cases} defect case(s) were not rejected as expected:\n\n{}\n",
            problems.join("\n")
        );
    }
}

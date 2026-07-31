//! The behavioural half of the `engine/BUGS.md` check.
//!
//! `BUGS.md` is a document, and a document about numbers rots silently. This test re-runs every
//! entry's committed reproduction JSON through the **current** engine and compares the result
//! against the figures the entry records, so the ledger cannot describe an engine that no longer
//! exists.
//!
//! It is the behavioural half of a two-part split this project already uses for observability
//! (`engine/tests/observability.rs` catches a behaviour regression, `scripts/check-observability.mjs`
//! catches a source regression). Here:
//!
//!   - **this file** catches the numbers drifting;
//!   - **`scripts/check-bugs-ledger.mjs`** catches the document's shape drifting.
//!
//! Failure markers, and what each one means:
//!
//!   - `MISSING REPRODUCTION` — an entry has no fenced `json` block, so nobody can run it.
//!   - `UNKNOWN STATUS` — a `**Status:**` value outside the two allowed strings. A third status is
//!     how a stale entry hides.
//!   - `HEIR SET DRIFTED` — the engine now returns a different set of heirs than the entry records.
//!   - `ACTUAL DRIFTED` — a recorded centavo figure no longer matches what the engine produces.
//!   - `OUTPUT CHECK REJECTED` — `run_pipeline_checked` refused the output entirely.
//!   - `CLOSURE INVALIDATED` — an entry closed as non-reproducing has started failing conservation
//!     again, i.e. the bug came back and the closure is now a lie.
//!
//! **The correct response to `ACTUAL DRIFTED` is to re-run the reproduction and update the recorded
//! figure in `BUGS.md` to what the engine actually printed.** It is never to loosen this test. This
//! file parses `BUGS.md` and never writes it, and has no flag that would repair it.

use std::fs;
use std::path::Path;

use num_bigint::BigInt;

use inheritance_engine::pipeline::run_pipeline_checked;
use inheritance_engine::types::EngineInput;

const BUGS_PATH: &str = "BUGS.md";

const STATUS_OPEN: &str = "Open";
const STATUS_CLOSED: &str = "Closed — does not reproduce";

#[derive(Debug)]
struct Entry {
    id: String,
    status: String,
    /// The fenced ```json block under `### Reproduction`, if any.
    reproduction: Option<String>,
    /// The `- <heir_id> = <centavos>` bullets under `### Actual`, in file order.
    actuals: Vec<(String, BigInt)>,
}

/// Split `BUGS.md` on `## BUG-` headings and pull the four things this test needs out of
/// each entry. Deliberately literal: no regex crate is a dependency of this engine.
fn parse_entries() -> Vec<Entry> {
    let path = Path::new(BUGS_PATH);
    let text = fs::read_to_string(path)
        .unwrap_or_else(|e| panic!("BUGS LEDGER UNREADABLE: could not read {BUGS_PATH}: {e}"));

    let lines: Vec<&str> = text.lines().collect();
    let mut starts: Vec<usize> = Vec::new();
    for (i, line) in lines.iter().enumerate() {
        if line.starts_with("## BUG-") {
            starts.push(i);
        }
    }

    let mut entries = Vec::new();
    for (n, &start) in starts.iter().enumerate() {
        let end = starts.get(n + 1).copied().unwrap_or(lines.len());
        let body = &lines[start..end];

        let id = body[0]
            .trim_start_matches("## ")
            .split(':')
            .next()
            .unwrap_or("")
            .trim()
            .to_string();

        let mut status = String::new();
        let mut reproduction: Option<String> = None;
        let mut actuals: Vec<(String, BigInt)> = Vec::new();

        // Section walk. `section` is the most recent `### ` heading seen.
        let mut section = String::new();
        let mut in_json = false;
        let mut json_buf = String::new();

        for line in body.iter() {
            if let Some(rest) = line.strip_prefix("**Status:**") {
                if status.is_empty() {
                    status = rest.trim().to_string();
                }
            }
            if line.starts_with("### ") {
                section = line.trim_start_matches("### ").trim().to_string();
                continue;
            }
            if line.trim_start().starts_with("```") {
                if in_json {
                    if reproduction.is_none() {
                        reproduction = Some(json_buf.clone());
                    }
                    in_json = false;
                    json_buf.clear();
                } else if section == "Reproduction" && line.trim() == "```json" {
                    in_json = true;
                    json_buf.clear();
                }
                continue;
            }
            if in_json {
                json_buf.push_str(line);
                json_buf.push('\n');
                continue;
            }
            if section == "Actual" {
                if let Some(rest) = line.strip_prefix("- ") {
                    if let Some((left, right)) = rest.split_once(" = ") {
                        let heir = left.trim().to_string();
                        if let Ok(value) = right.trim().parse::<BigInt>() {
                            actuals.push((heir, value));
                        }
                    }
                }
            }
        }

        entries.push(Entry {
            id,
            status,
            reproduction,
            actuals,
        });
    }

    assert!(
        !entries.is_empty(),
        "MISSING REPRODUCTION: {BUGS_PATH} contains no '## BUG-' entry at all"
    );
    entries
}

fn parse_input(entry: &Entry) -> EngineInput {
    let json = entry.reproduction.as_ref().unwrap_or_else(|| {
        panic!(
            "MISSING REPRODUCTION: {} has no fenced json block under '### Reproduction', so nobody can run it",
            entry.id
        )
    });
    serde_json::from_str::<EngineInput>(json).unwrap_or_else(|e| {
        panic!(
            "MISSING REPRODUCTION: {}'s reproduction JSON does not deserialize into EngineInput: {e}",
            entry.id
        )
    })
}

#[test]
fn test_every_entry_has_a_runnable_reproduction() {
    for entry in parse_entries() {
        assert!(
            entry.reproduction.is_some(),
            "MISSING REPRODUCTION: {} has no fenced json block under '### Reproduction'",
            entry.id
        );
        assert!(
            entry.status == STATUS_OPEN || entry.status == STATUS_CLOSED,
            "UNKNOWN STATUS: {} has status '{}', which is neither '{STATUS_OPEN}' nor '{STATUS_CLOSED}'. \
             A third status is how a stale entry hides; use one of the two.",
            entry.id,
            entry.status
        );
        // Proves the block is not merely present but actually parseable.
        let _ = parse_input(&entry);
    }
}

#[test]
fn test_recorded_actuals_still_reproduce() {
    for entry in parse_entries() {
        let input = parse_input(&entry);
        let output = run_pipeline_checked(&input).unwrap_or_else(|defects| {
            let joined = defects
                .iter()
                .map(|d| d.to_string())
                .collect::<Vec<_>>()
                .join("; ");
            panic!(
                "OUTPUT CHECK REJECTED: {}'s reproduction was refused by run_pipeline_checked: {joined}",
                entry.id
            )
        });

        let mut produced: Vec<(String, BigInt)> = output
            .per_heir_shares
            .iter()
            .map(|s| (s.heir_id.clone(), s.net_from_estate.centavos.clone()))
            .collect();
        let mut recorded = entry.actuals.clone();

        let mut produced_ids: Vec<String> = produced.iter().map(|(id, _)| id.clone()).collect();
        let mut recorded_ids: Vec<String> = recorded.iter().map(|(id, _)| id.clone()).collect();
        produced_ids.sort();
        recorded_ids.sort();
        assert_eq!(
            recorded_ids, produced_ids,
            "HEIR SET DRIFTED: {} records heirs {:?} under '### Actual' but the engine now returns {:?}. \
             Re-run the reproduction and update BUGS.md; never loosen this test.",
            entry.id, recorded_ids, produced_ids
        );

        produced.sort_by(|a, b| a.0.cmp(&b.0));
        recorded.sort_by(|a, b| a.0.cmp(&b.0));
        for ((rid, rval), (pid, pval)) in recorded.iter().zip(produced.iter()) {
            assert_eq!(rid, pid, "HEIR SET DRIFTED: {} heir order mismatch", entry.id);
            assert_eq!(
                rval, pval,
                "ACTUAL DRIFTED: {} records {rid} = {rval} centavos under '### Actual', \
                 but the engine now produces {pval} centavos. Re-run the reproduction and update \
                 BUGS.md to what the engine printed; never loosen this test.",
                entry.id
            );
        }
    }
}

#[test]
fn test_closed_entries_still_conserve() {
    for entry in parse_entries() {
        if entry.status != STATUS_CLOSED {
            continue;
        }
        let input = parse_input(&entry);
        let output = run_pipeline_checked(&input).unwrap_or_else(|defects| {
            let joined = defects
                .iter()
                .map(|d| d.to_string())
                .collect::<Vec<_>>()
                .join("; ");
            panic!(
                "CLOSURE INVALIDATED: {} is closed as non-reproducing, but run_pipeline_checked now \
                 refuses its reproduction: {joined}",
                entry.id
            )
        });

        let sum: BigInt = output
            .per_heir_shares
            .iter()
            .map(|s| s.net_from_estate.centavos.clone())
            .fold(BigInt::from(0), |a, b| a + b);

        assert_eq!(
            sum, input.net_distributable_estate.centavos,
            "CLOSURE INVALIDATED: {} is closed as non-reproducing, but its per-heir net_from_estate \
             now sums to {sum} centavos against a distributable estate of {} centavos. The bug came \
             back; reopen the entry rather than editing this test.",
            entry.id, input.net_distributable_estate.centavos
        );
    }
}

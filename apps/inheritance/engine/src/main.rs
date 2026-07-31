//! CLI entry point for the Philippine Inheritance Distribution Engine.
//!
//! Usage:
//!   inheritance-engine <input.json>   # Read from file
//!   inheritance-engine -              # Read from stdin
//!   inheritance-engine                # Read from stdin (default)

use std::env;
use std::fs;
use std::io::{self, Read};
use std::process;

use inheritance_engine::pipeline::run_pipeline_checked;
use inheritance_engine::types::EngineInput;

fn main() {
    let args: Vec<String> = env::args().collect();

    let json_input = match args.get(1).map(|s| s.as_str()) {
        Some("-") | None => {
            let mut buf = String::new();
            io::stdin().read_to_string(&mut buf).unwrap_or_else(|e| {
                eprintln!("Error reading stdin: {e}");
                process::exit(1);
            });
            buf
        }
        Some(path) => fs::read_to_string(path).unwrap_or_else(|e| {
            eprintln!("Error reading {path}: {e}");
            process::exit(1);
        }),
    };

    let input: EngineInput = serde_json::from_str(&json_input).unwrap_or_else(|e| {
        eprintln!("Error parsing input JSON: {e}");
        process::exit(1);
    });

    // Exit codes: 0 success, 1 read/parse/write failure, 2 the computed output
    // failed the runtime conservation / uniqueness check.
    let output = match run_pipeline_checked(&input) {
        Ok(output) => output,
        Err(defects) => {
            for defect in &defects {
                eprintln!("engine output check failed: {defect}");
            }
            process::exit(2);
        }
    };

    serde_json::to_writer_pretty(io::stdout(), &output).unwrap_or_else(|e| {
        eprintln!("Error writing output JSON: {e}");
        process::exit(1);
    });
    println!();
}

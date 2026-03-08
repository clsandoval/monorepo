# Cheerful CLI Self-Documenting Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the Cheerful CLI fully self-documenting by embedding build-time-generated workflow/activity schema data, adding a `cheerful schema` command, renaming `workflows` to `automations`, and adding a Temporal workflow explorer.

**Architecture:** A Python script introspects the Temporal workflow/activity code and generates `workflow_schema.json`. `build.rs` calls the script and embeds the JSON in the binary via `include_str!`. A `SchemaRegistry` struct provides query access. Two new commands (`schema`, `workflows`) expose the data.

**Tech Stack:** Rust (clap, serde_json, once_cell), Python (inspect, pydantic), tonic-build

---

### Task 1: Python Introspection Script

**Files:**
- Create: `projects/cheerful/apps/cli/scripts/extract_workflow_schema.py`

**Step 1: Create the script directory**

Run: `mkdir -p projects/cheerful/apps/cli/scripts`

**Step 2: Write the introspection script**

```python
#!/usr/bin/env python3
"""Extract workflow/activity schema from Temporal code for CLI embedding."""

import importlib
import inspect
import json
import os
import sys
from pathlib import Path
from typing import get_type_hints

# Add backend source to path
BACKEND_SRC = Path(__file__).resolve().parents[2] / "backend" / "src"
sys.path.insert(0, str(BACKEND_SRC))

# Suppress any import side effects
os.environ.setdefault("TEMPORAL_SKIP_WORKER", "1")


def extract_pydantic_schema(model_class):
    """Extract JSON Schema from a Pydantic model."""
    try:
        if hasattr(model_class, "model_json_schema"):
            return model_class.model_json_schema()
    except Exception:
        pass
    return None


def extract_retry_policy(call_node_source: str):
    """Parse retry policy from workflow source code execute_activity calls."""
    import re
    policy = {}
    max_match = re.search(r"maximum_attempts\s*=\s*(\d+)", call_node_source)
    if max_match:
        policy["max_attempts"] = int(max_match.group(1))
    init_match = re.search(r"initial_interval\s*=\s*timedelta\(seconds\s*=\s*(\d+)\)", call_node_source)
    if init_match:
        policy["initial_interval_s"] = int(init_match.group(1))
    max_int_match = re.search(r"maximum_interval\s*=\s*timedelta\(seconds\s*=\s*(\d+)\)", call_node_source)
    if max_int_match:
        policy["max_interval_s"] = int(max_int_match.group(1))
    return policy if policy else None


def extract_timeout(source: str, activity_name: str):
    """Extract start_to_close_timeout for an activity call."""
    import re
    # Look for the activity call and its timeout
    pattern = rf"{activity_name}.*?start_to_close_timeout\s*=\s*timedelta\((.*?)\)"
    match = re.search(pattern, source, re.DOTALL)
    if match:
        args = match.group(1)
        seconds = 0
        s_match = re.search(r"seconds\s*=\s*(\d+)", args)
        m_match = re.search(r"minutes\s*=\s*(\d+)", args)
        if s_match:
            seconds += int(s_match.group(1))
        if m_match:
            seconds += int(m_match.group(1)) * 60
        return seconds
    return None


def extract_workflow_info(workflow_class, workflow_source: str):
    """Extract metadata from a workflow class."""
    import re
    info = {
        "task_queue": "cheerful",
        "parameters": {},
        "children": [],
        "activities": [],
    }

    # Extract parameters from the run method
    run_method = None
    for name, method in inspect.getmembers(workflow_class, predicate=inspect.isfunction):
        if name == "run":
            run_method = method
            break

    if run_method:
        hints = get_type_hints(run_method)
        for param_name, param_type in hints.items():
            if param_name in ("self", "return"):
                continue
            type_name = getattr(param_type, "__name__", str(param_type))
            info["parameters"][param_name] = {"type": type_name}

    # Extract child workflows from source
    child_pattern = r"execute_child_workflow\(\s*(\w+)"
    for match in re.finditer(child_pattern, workflow_source):
        child_name = match.group(1)
        if child_name not in info["children"]:
            info["children"].append(child_name)

    # Extract activities from source
    activity_pattern = r"execute_activity\(\s*(\w+)"
    for match in re.finditer(activity_pattern, workflow_source):
        activity_name = match.group(1)
        if activity_name not in info["activities"]:
            info["activities"].append(activity_name)

    return info


def extract_activity_info(activity_func):
    """Extract metadata from an activity function."""
    info = {"parameters": {}}

    hints = get_type_hints(activity_func)
    for param_name, param_type in hints.items():
        if param_name == "return":
            if hasattr(param_type, "__name__"):
                info["returns"] = param_type.__name__
            continue
        type_name = getattr(param_type, "__name__", str(param_type))
        info["parameters"][param_name] = type_name

    return info


def main():
    schema = {"workflows": {}, "activities": {}, "models": {}}
    models_seen = set()

    # Import workflow module
    try:
        from temporal.workflow import __all__ as workflow_names
        import temporal.workflow as workflow_module
    except ImportError as e:
        print(f"Warning: Cannot import workflows: {e}", file=sys.stderr)
        workflow_names = []
        workflow_module = None

    # Process workflows
    for wf_name in workflow_names:
        wf_class = getattr(workflow_module, wf_name, None)
        if wf_class is None:
            continue

        try:
            source_file = inspect.getfile(wf_class)
            with open(source_file) as f:
                source = f.read()
        except (TypeError, OSError):
            source = ""

        info = extract_workflow_info(wf_class, source)
        schema["workflows"][wf_name] = info

        # Collect param types for model extraction
        run_method = getattr(wf_class, "run", None)
        if run_method:
            hints = get_type_hints(run_method)
            for param_name, param_type in hints.items():
                if param_name in ("self", "return"):
                    continue
                if hasattr(param_type, "model_json_schema"):
                    type_name = param_type.__name__
                    if type_name not in models_seen:
                        models_seen.add(type_name)
                        model_schema = extract_pydantic_schema(param_type)
                        if model_schema:
                            schema["models"][type_name] = model_schema

    # Import activity module
    try:
        from temporal.activity import __all__ as activity_names
        import temporal.activity as activity_module
    except ImportError as e:
        print(f"Warning: Cannot import activities: {e}", file=sys.stderr)
        activity_names = []
        activity_module = None

    # Process activities
    for act_name in activity_names:
        act_func = getattr(activity_module, act_name, None)
        if act_func is None or not callable(act_func):
            continue

        info = extract_activity_info(act_func)
        schema["activities"][act_name] = info

        # Collect param types for model extraction
        hints = get_type_hints(act_func)
        for param_name, param_type in hints.items():
            if param_name == "return":
                continue
            if hasattr(param_type, "model_json_schema"):
                type_name = param_type.__name__
                if type_name not in models_seen:
                    models_seen.add(type_name)
                    model_schema = extract_pydantic_schema(param_type)
                    if model_schema:
                        schema["models"][type_name] = model_schema

    # Write output
    output_dir = Path(__file__).resolve().parent.parent / "src" / "generated"
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "workflow_schema.json"

    with open(output_path, "w") as f:
        json.dump(schema, f, indent=2, default=str)

    print(f"Schema written to {output_path}", file=sys.stderr)
    print(f"  Workflows: {len(schema['workflows'])}", file=sys.stderr)
    print(f"  Activities: {len(schema['activities'])}", file=sys.stderr)
    print(f"  Models: {len(schema['models'])}", file=sys.stderr)


if __name__ == "__main__":
    main()
```

**Step 3: Run the script to generate initial schema**

Run: `cd projects/cheerful/apps/cli && python3 scripts/extract_workflow_schema.py`
Expected: `workflow_schema.json` created in `src/generated/` with workflow/activity/model entries

**Step 4: Verify the generated JSON is valid**

Run: `python3 -m json.tool projects/cheerful/apps/cli/src/generated/workflow_schema.json | head -30`
Expected: Valid JSON with `workflows`, `activities`, `models` keys

**Step 5: Commit**

```bash
git add projects/cheerful/apps/cli/scripts/extract_workflow_schema.py projects/cheerful/apps/cli/src/generated/workflow_schema.json
git commit -m "cheerful-cli: add Python workflow schema introspection script"
```

---

### Task 2: Build-Time Integration

**Files:**
- Modify: `projects/cheerful/apps/cli/build.rs`

**Step 1: Update build.rs to call the Python script**

Replace the entire `build.rs` with:

```rust
use std::path::Path;
use std::process::Command;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // --- Temporal protobuf compilation ---
    if std::env::var("PROTOC").is_err() {
        let home = std::env::var("HOME").unwrap_or_default();
        let local_protoc = format!("{home}/.local/bin/protoc");
        if std::path::Path::new(&local_protoc).exists() {
            std::env::set_var("PROTOC", &local_protoc);
        }
    }

    tonic_build::configure()
        .build_server(false)
        .compile_protos(
            &["proto/temporal/api/workflowservice/v1/service.proto"],
            &["proto/"],
        )?;

    // --- Workflow schema generation ---
    let script_path = Path::new("scripts/extract_workflow_schema.py");
    let output_path = Path::new("src/generated/workflow_schema.json");

    // Rerun if Python workflow/activity sources change
    let backend_temporal = "../../apps/backend/src/temporal";
    println!("cargo:rerun-if-changed={backend_temporal}/workflow/");
    println!("cargo:rerun-if-changed={backend_temporal}/activity/");
    println!("cargo:rerun-if-changed=scripts/extract_workflow_schema.py");

    if script_path.exists() {
        let result = Command::new("python3")
            .arg(script_path)
            .status();

        match result {
            Ok(status) if status.success() => {
                eprintln!("cargo:warning=workflow_schema.json regenerated");
            }
            Ok(status) => {
                eprintln!("cargo:warning=Schema generation exited with: {status}");
                // Fall through to use existing schema if available
            }
            Err(e) => {
                eprintln!("cargo:warning=Python not available for schema generation: {e}");
                // Fall through to use existing/fallback schema
            }
        }
    }

    if !output_path.exists() {
        // Write minimal fallback schema
        std::fs::create_dir_all("src/generated")?;
        std::fs::write(
            output_path,
            r#"{"workflows":{},"activities":{},"models":{}}"#,
        )?;
        eprintln!("cargo:warning=Using fallback empty workflow_schema.json");
    }

    Ok(())
}
```

**Step 2: Build to verify**

Run: `cd projects/cheerful/apps/cli && cargo build 2>&1 | tail -10`
Expected: Build succeeds, possibly with "workflow_schema.json regenerated" warning

**Step 3: Commit**

```bash
git add projects/cheerful/apps/cli/build.rs
git commit -m "cheerful-cli: build.rs calls Python schema generation"
```

---

### Task 3: SchemaRegistry Module

**Files:**
- Create: `projects/cheerful/apps/cli/src/schema.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs` (add `mod schema;`)

**Step 1: Write the SchemaRegistry**

Create `src/schema.rs`:

```rust
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::OnceLock;

static SCHEMA: OnceLock<WorkflowSchema> = OnceLock::new();

const SCHEMA_JSON: &str = include_str!("generated/workflow_schema.json");

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowSchema {
    pub workflows: HashMap<String, WorkflowInfo>,
    pub activities: HashMap<String, ActivityInfo>,
    pub models: HashMap<String, serde_json::Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowInfo {
    pub task_queue: String,
    pub parameters: HashMap<String, serde_json::Value>,
    pub children: Vec<String>,
    pub activities: Vec<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub retry_policy: Option<RetryPolicy>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ActivityInfo {
    pub parameters: HashMap<String, serde_json::Value>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub returns: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub timeout_s: Option<u64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub retry_policy: Option<RetryPolicy>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RetryPolicy {
    pub max_attempts: u32,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub initial_interval_s: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_interval_s: Option<u32>,
}

impl WorkflowSchema {
    pub fn global() -> &'static WorkflowSchema {
        SCHEMA.get_or_init(|| {
            serde_json::from_str(SCHEMA_JSON)
                .expect("embedded workflow_schema.json is invalid")
        })
    }

    pub fn get_workflow(&self, name: &str) -> Option<&WorkflowInfo> {
        self.workflows.get(name)
    }

    pub fn get_activity(&self, name: &str) -> Option<&ActivityInfo> {
        self.activities.get(name)
    }

    pub fn get_model(&self, name: &str) -> Option<&serde_json::Value> {
        self.models.get(name)
    }

    /// Expand a workflow tree to the given depth.
    /// depth=1 returns the workflow with children as names.
    /// depth=2+ inlines child workflow objects recursively.
    pub fn expand_workflow(&self, name: &str, depth: u32) -> Option<serde_json::Value> {
        let wf = self.get_workflow(name)?;
        let mut obj = serde_json::to_value(wf).ok()?;
        let map = obj.as_object_mut()?;
        map.insert("name".to_string(), serde_json::Value::String(name.to_string()));

        if depth > 1 {
            let children_expanded: Vec<serde_json::Value> = wf
                .children
                .iter()
                .map(|child_name| {
                    self.expand_workflow(child_name, depth - 1)
                        .unwrap_or(serde_json::Value::String(child_name.clone()))
                })
                .collect();
            map.insert("children".to_string(), serde_json::Value::Array(children_expanded));
        }

        Some(obj)
    }
}
```

**Step 2: Add `mod schema;` to main.rs**

In `projects/cheerful/apps/cli/src/main.rs`, add after the existing mod declarations:

```rust
mod schema;
```

**Step 3: Build to verify**

Run: `cd projects/cheerful/apps/cli && cargo build 2>&1 | tail -10`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add projects/cheerful/apps/cli/src/schema.rs projects/cheerful/apps/cli/src/main.rs
git commit -m "cheerful-cli: add SchemaRegistry with embedded workflow schema"
```

---

### Task 4: Rename `workflows` → `automations`

**Files:**
- Create: `projects/cheerful/apps/cli/src/commands/automations.rs` (copy of `workflows.rs` with rename)
- Modify: `projects/cheerful/apps/cli/src/commands/mod.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs`
- Modify: `projects/cheerful/apps/cli/src/models/workflow.rs` → rename structs

**Step 1: Copy workflows.rs to automations.rs**

Copy `projects/cheerful/apps/cli/src/commands/workflows.rs` to `projects/cheerful/apps/cli/src/commands/automations.rs`. Rename all `Workflow` references to `Automation`:
- `WorkflowCommands` → `AutomationCommands`
- Keep all API paths the same (backend still uses `/workflows`)
- Keep all functionality identical

```rust
use clap::Subcommand;
use crate::context::Context;
use crate::error::CliError;
use crate::output;

#[derive(Subcommand)]
pub enum AutomationCommands {
    /// List automation rules for a campaign
    List {
        #[arg(long)]
        campaign: String,
    },
    /// Get automation rule details
    Get {
        id: String,
        #[arg(long)]
        campaign: String,
    },
    /// Create a new automation rule
    Create {
        #[arg(long)]
        campaign: String,
        #[arg(long)]
        name: String,
        #[arg(long)]
        instructions: String,
    },
    /// Update an automation rule
    Update {
        id: String,
        #[arg(long)]
        campaign: String,
        #[arg(long)]
        name: Option<String>,
        #[arg(long)]
        instructions: Option<String>,
        #[arg(long)]
        enabled: Option<bool>,
    },
    /// Delete an automation rule
    Delete {
        id: String,
        #[arg(long)]
        campaign: String,
    },
    /// List automation rule executions
    Executions {
        id: String,
        #[arg(long)]
        campaign: String,
    },
}

pub async fn run(ctx: &Context, cmd: AutomationCommands) -> Result<(), CliError> {
    match cmd {
        AutomationCommands::List { campaign } => {
            let result: serde_json::Value = ctx.api.get(
                &format!("/v1/campaigns/{campaign}/workflows"),
            ).await?;
            output::print_json(&result, ctx.pretty);
        }
        AutomationCommands::Get { id, campaign } => {
            let result: serde_json::Value = ctx.api.get(
                &format!("/v1/campaigns/{campaign}/workflows/{id}"),
            ).await?;
            output::print_json(&result, ctx.pretty);
        }
        AutomationCommands::Create { campaign, name, instructions } => {
            let result: serde_json::Value = ctx.api.post(
                &format!("/v1/campaigns/{campaign}/workflows"),
                serde_json::json!({"name": name, "instructions": instructions}),
            ).await?;
            output::print_json(&result, ctx.pretty);
        }
        AutomationCommands::Update { id, campaign, name, instructions, enabled } => {
            let mut map = serde_json::Map::new();
            if let Some(n) = name { map.insert("name".into(), n.into()); }
            if let Some(i) = instructions { map.insert("instructions".into(), i.into()); }
            if let Some(e) = enabled { map.insert("is_enabled".into(), e.into()); }
            let result: serde_json::Value = ctx.api.patch(
                &format!("/v1/campaigns/{campaign}/workflows/{id}"),
                serde_json::Value::Object(map),
            ).await?;
            output::print_json(&result, ctx.pretty);
        }
        AutomationCommands::Delete { id, campaign } => {
            ctx.api.delete(&format!("/v1/campaigns/{campaign}/workflows/{id}")).await?;
            output::print_success(&format!("Automation {id} deleted"), ctx.pretty);
        }
        AutomationCommands::Executions { id, campaign } => {
            let result: serde_json::Value = ctx.api.get(
                &format!("/v1/campaigns/{campaign}/workflows/{id}/executions"),
            ).await?;
            output::print_json(&result, ctx.pretty);
        }
    }
    Ok(())
}
```

**Step 2: Update commands/mod.rs**

Replace `pub mod workflows;` with `pub mod automations;` and add the new modules:

```rust
pub mod analytics;
pub mod auth;
pub mod automations;
pub mod campaigns;
pub mod config_cmd;
pub mod creators;
pub mod drafts;
pub mod email;
pub mod integrations;
pub mod lists;
pub mod schema_cmd;
pub mod temporal_cmd;
pub mod threads;
pub mod workflows_cmd;
```

**Step 3: Update main.rs**

Replace the `Workflows` variant in the `Commands` enum:

```rust
    /// Campaign automation rules
    Automations {
        #[command(subcommand)]
        command: commands::automations::AutomationCommands,
    },
```

And in the match arm:

```rust
        Commands::Automations { command } => commands::automations::run(&ctx, command).await,
```

Remove the old `Workflows` variant and its match arm. (The new `Workflows` command comes in Task 6.)

**Step 4: Delete the old workflows.rs**

Run: `rm projects/cheerful/apps/cli/src/commands/workflows.rs`

**Step 5: Build to verify**

Run: `cd projects/cheerful/apps/cli && cargo build 2>&1 | tail -10`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add -A projects/cheerful/apps/cli/src/commands/
git add projects/cheerful/apps/cli/src/main.rs
git commit -m "cheerful-cli: rename workflows to automations"
```

---

### Task 5: `cheerful schema` Command

**Files:**
- Create: `projects/cheerful/apps/cli/src/commands/schema_cmd.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs` (add Schema variant)

**Step 1: Write the schema command**

Create `src/commands/schema_cmd.rs`:

```rust
use clap::Subcommand;
use crate::error::CliError;
use crate::output;
use crate::schema::WorkflowSchema;

#[derive(Subcommand)]
pub enum SchemaCommands {
    /// List all CLI commands with their workflow mappings
    Commands {
        /// Drill into a specific command path (e.g., "campaigns launch")
        #[arg(trailing_var_arg = true)]
        path: Vec<String>,
    },
    /// Describe a Temporal workflow
    Workflow {
        /// Workflow class name (e.g., ThreadProcessingCoordinatorWorkflow)
        name: String,
        /// Expand child workflows to this depth (default: 1)
        #[arg(long, default_value = "1")]
        depth: u32,
    },
    /// Describe a Temporal activity
    Activity {
        /// Activity function name
        name: String,
    },
    /// Show JSON schema for a Pydantic model
    Model {
        /// Model class name (e.g., Candidate)
        name: String,
    },
    /// Dump the entire schema
    All,
}

/// Command-to-workflow mapping. Hand-maintained.
fn command_workflow_map() -> serde_json::Value {
    serde_json::json!({
        "campaigns": {
            "launch": {
                "workflow": "SendCampaignOutboxWorkflow",
                "requires": ["≥1 sender", "≥1 recipient with email", "outbox populated"],
                "returns": {"workflow_id": "string", "run_id": "string"}
            },
            "discover": {
                "workflow": "CampaignDiscoveryWorkflow",
                "requires": ["campaign_id", "discovery enabled on campaign"],
                "returns": {"workflow_id": "string", "run_id": "string"}
            },
            "enrich": {
                "workflow": "EnrichForCampaignWorkflow",
                "requires": ["campaign_id", "creator_ids[]"],
                "returns": {"results": "EnrichmentResult[]"}
            }
        },
        "drafts": {
            "generate": {
                "workflow": "ThreadResponseDraftWorkflow",
                "requires": ["thread_id"],
                "returns": {"draft_id": "string", "status": "string"}
            },
            "bulk-edit": {
                "workflow": "BulkDraftEditWorkflow",
                "requires": ["campaign_id", "edit_instructions"],
                "returns": {"edited_count": "number"}
            }
        },
        "email": {
            "send": {
                "workflow": null,
                "requires": ["to", "subject", "body", "sender account"],
                "returns": {"message_id": "string"}
            }
        },
        "temporal": {
            "trigger": {
                "workflow": "(dynamic — specified by name argument)",
                "requires": ["workflow name", "params JSON"],
                "returns": {"workflow_id": "string", "run_id": "string"}
            }
        }
    })
}

pub fn run(cmd: SchemaCommands, pretty: bool) -> Result<(), CliError> {
    let schema = WorkflowSchema::global();

    match cmd {
        SchemaCommands::Commands { path } => {
            let map = command_workflow_map();
            if path.is_empty() {
                output::print_json(&map, pretty);
            } else {
                let mut current = &map;
                for segment in &path {
                    match current.get(segment) {
                        Some(v) => current = v,
                        None => {
                            return Err(CliError::Other(
                                format!("Unknown command path: {}", path.join(" "))
                            ));
                        }
                    }
                }
                output::print_json(current, pretty);
            }
        }
        SchemaCommands::Workflow { name, depth } => {
            match schema.expand_workflow(&name, depth) {
                Some(value) => output::print_json(&value, pretty),
                None => {
                    return Err(CliError::Other(format!("Unknown workflow: {name}")));
                }
            }
        }
        SchemaCommands::Activity { name } => {
            match schema.get_activity(&name) {
                Some(info) => {
                    let mut value = serde_json::to_value(info)
                        .map_err(|e| CliError::Other(e.to_string()))?;
                    value.as_object_mut().unwrap()
                        .insert("name".to_string(), serde_json::Value::String(name));
                    output::print_json(&value, pretty);
                }
                None => {
                    return Err(CliError::Other(format!("Unknown activity: {name}")));
                }
            }
        }
        SchemaCommands::Model { name } => {
            match schema.get_model(&name) {
                Some(model) => output::print_json(model, pretty),
                None => {
                    return Err(CliError::Other(format!("Unknown model: {name}")));
                }
            }
        }
        SchemaCommands::All => {
            let value = serde_json::to_value(schema)
                .map_err(|e| CliError::Other(e.to_string()))?;
            output::print_json(&value, pretty);
        }
    }
    Ok(())
}
```

**Step 2: Add Schema command to main.rs**

Add to the `Commands` enum:

```rust
    /// Workflow and activity schema discovery
    Schema {
        #[command(subcommand)]
        command: commands::schema_cmd::SchemaCommands,
    },
```

Add to the no-auth match block (schema doesn't need API/auth), after the `Commands::Config` match arm:

```rust
        Commands::Schema { command } => {
            let result = commands::schema_cmd::run(command, cli.pretty);
            if let Err(e) = result {
                e.print_and_exit(cli.pretty);
            }
            return;
        }
```

**Step 3: Build to verify**

Run: `cd projects/cheerful/apps/cli && cargo build 2>&1 | tail -10`
Expected: Build succeeds

**Step 4: Smoke test**

Run: `cd projects/cheerful/apps/cli && ./target/debug/cheerful schema all | python3 -m json.tool | head -20`
Expected: Valid JSON with workflows, activities, models

**Step 5: Commit**

```bash
git add projects/cheerful/apps/cli/src/commands/schema_cmd.rs projects/cheerful/apps/cli/src/main.rs
git commit -m "cheerful-cli: add cheerful schema command"
```

---

### Task 6: `cheerful workflows` Command (Temporal Explorer)

**Files:**
- Create: `projects/cheerful/apps/cli/src/commands/workflows_cmd.rs`
- Modify: `projects/cheerful/apps/cli/src/main.rs` (add Workflows variant)

**Step 1: Write the workflows explorer command**

Create `src/commands/workflows_cmd.rs`:

```rust
use clap::Subcommand;
use crate::error::CliError;
use crate::output;
use crate::schema::WorkflowSchema;

#[derive(Subcommand)]
pub enum WorkflowExplorerCommands {
    /// List all registered Temporal workflows
    List,
    /// Describe a workflow with its children and activities
    Describe {
        /// Workflow class name
        name: String,
        /// Expand child workflows to this depth (default: 1)
        #[arg(long, default_value = "1")]
        depth: u32,
    },
    /// List or describe Temporal activities
    Activities {
        /// Activity name (omit to list all)
        name: Option<String>,
    },
}

pub fn run(cmd: WorkflowExplorerCommands, pretty: bool) -> Result<(), CliError> {
    let schema = WorkflowSchema::global();

    match cmd {
        WorkflowExplorerCommands::List => {
            let mut workflows: Vec<serde_json::Value> = schema
                .workflows
                .iter()
                .map(|(name, info)| {
                    serde_json::json!({
                        "name": name,
                        "task_queue": info.task_queue,
                        "children_count": info.children.len(),
                        "activities_count": info.activities.len(),
                        "parameter_types": info.parameters.keys().collect::<Vec<_>>(),
                    })
                })
                .collect();
            workflows.sort_by(|a, b| {
                a["name"].as_str().cmp(&b["name"].as_str())
            });
            output::print_json(&serde_json::Value::Array(workflows), pretty);
        }
        WorkflowExplorerCommands::Describe { name, depth } => {
            match schema.expand_workflow(&name, depth) {
                Some(value) => output::print_json(&value, pretty),
                None => {
                    return Err(CliError::Other(format!("Unknown workflow: {name}")));
                }
            }
        }
        WorkflowExplorerCommands::Activities { name } => {
            if let Some(activity_name) = name {
                match schema.get_activity(&activity_name) {
                    Some(info) => {
                        let mut value = serde_json::to_value(info)
                            .map_err(|e| CliError::Other(e.to_string()))?;
                        value.as_object_mut().unwrap()
                            .insert("name".to_string(), serde_json::Value::String(activity_name));
                        output::print_json(&value, pretty);
                    }
                    None => {
                        return Err(CliError::Other(
                            format!("Unknown activity: {activity_name}")
                        ));
                    }
                }
            } else {
                let mut activities: Vec<serde_json::Value> = schema
                    .activities
                    .iter()
                    .map(|(name, info)| {
                        serde_json::json!({
                            "name": name,
                            "parameter_count": info.parameters.len(),
                            "returns": info.returns,
                        })
                    })
                    .collect();
                activities.sort_by(|a, b| {
                    a["name"].as_str().cmp(&b["name"].as_str())
                });
                output::print_json(&serde_json::Value::Array(activities), pretty);
            }
        }
    }
    Ok(())
}
```

**Step 2: Add Workflows command to main.rs**

Add to the `Commands` enum:

```rust
    /// Temporal workflow explorer
    Workflows {
        #[command(subcommand)]
        command: commands::workflows_cmd::WorkflowExplorerCommands,
    },
```

Add to the no-auth match block (doesn't need API):

```rust
        Commands::Workflows { command } => {
            let result = commands::workflows_cmd::run(command, cli.pretty);
            if let Err(e) = result {
                e.print_and_exit(cli.pretty);
            }
            return;
        }
```

**Step 3: Build and smoke test**

Run: `cd projects/cheerful/apps/cli && cargo build && ./target/debug/cheerful workflows list | python3 -m json.tool | head -20`
Expected: JSON array of workflow objects with name, task_queue, children_count, etc.

**Step 4: Commit**

```bash
git add projects/cheerful/apps/cli/src/commands/workflows_cmd.rs projects/cheerful/apps/cli/src/main.rs
git commit -m "cheerful-cli: add Temporal workflow explorer command"
```

---

### Task 7: Enhanced --help Text

**Files:**
- Modify: `projects/cheerful/apps/cli/src/commands/campaigns.rs`
- Modify: `projects/cheerful/apps/cli/src/commands/drafts.rs`
- Modify: `projects/cheerful/apps/cli/src/commands/creators.rs`
- Modify: `projects/cheerful/apps/cli/src/commands/temporal_cmd.rs`

**Step 1: Enhance campaign command help**

Find the `Launch` variant in campaigns.rs and update its doc comment:

```rust
    /// Launch a campaign
    ///
    /// Triggers: SendCampaignOutboxWorkflow
    /// Requires: ≥1 sender, ≥1 recipient with email, outbox populated
    /// Returns: { workflow_id, run_id }
    ///
    /// Use `cheerful schema commands campaigns launch` for full JSON schema
    Launch {
```

**Step 2: Enhance drafts command help**

Find the `Generate` variant in drafts.rs and update:

```rust
    /// Generate a response draft using LLM
    ///
    /// Triggers: ThreadResponseDraftWorkflow
    /// Requires: thread_id with campaign association
    /// Returns: { draft_id, status }
    ///
    /// Use `cheerful schema commands drafts generate` for full JSON schema
    Generate {
```

**Step 3: Enhance creators command help**

Find the `Enrich` variant in creators.rs (if it exists) and update:

```rust
    /// Enrich creators for a campaign
    ///
    /// Triggers: EnrichForCampaignWorkflow
    /// Requires: campaign_id, creator_ids[]
    /// Returns: { results: EnrichmentResult[] }
    ///
    /// Use `cheerful schema commands campaigns enrich` for full JSON schema
    Enrich {
```

**Step 4: Enhance temporal trigger help**

Update the `Trigger` variant in temporal_cmd.rs:

```rust
    /// Trigger a Temporal workflow
    ///
    /// Runs any registered workflow by name.
    /// Use `cheerful workflows list` to see all available workflows
    /// Use `cheerful schema workflow <NAME>` for parameters and schema
    ///
    /// Returns: { workflow_type, workflow_id, run_id, status }
    Trigger {
```

**Step 5: Build and verify help output**

Run: `cd projects/cheerful/apps/cli && cargo build && ./target/debug/cheerful campaigns launch --help`
Expected: Help text shows Triggers, Requires, Returns, schema pointer

**Step 6: Commit**

```bash
git add projects/cheerful/apps/cli/src/commands/campaigns.rs projects/cheerful/apps/cli/src/commands/drafts.rs projects/cheerful/apps/cli/src/commands/creators.rs projects/cheerful/apps/cli/src/commands/temporal_cmd.rs
git commit -m "cheerful-cli: enrich --help with workflow/schema references"
```

---

### Task 8: Integration Tests

**Files:**
- Modify: `projects/cheerful/apps/cli/tests/cli_test.rs`

**Step 1: Write schema command tests**

Add to `tests/cli_test.rs`:

```rust
#[test]
fn test_schema_all_outputs_valid_json() {
    let cmd = Command::cargo_bin("cheerful").unwrap();
    let output = cmd.arg("schema").arg("all").output().unwrap();
    assert!(output.status.success());
    let json: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    assert!(json.get("workflows").is_some());
    assert!(json.get("activities").is_some());
    assert!(json.get("models").is_some());
}

#[test]
fn test_schema_commands_outputs_valid_json() {
    let cmd = Command::cargo_bin("cheerful").unwrap();
    let output = cmd.arg("schema").arg("commands").output().unwrap();
    assert!(output.status.success());
    let json: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    assert!(json.get("campaigns").is_some());
}

#[test]
fn test_schema_unknown_workflow_errors() {
    let cmd = Command::cargo_bin("cheerful").unwrap();
    let output = cmd
        .arg("schema")
        .arg("workflow")
        .arg("NonexistentWorkflow")
        .output()
        .unwrap();
    assert!(!output.status.success());
}

#[test]
fn test_workflows_list_outputs_array() {
    let cmd = Command::cargo_bin("cheerful").unwrap();
    let output = cmd.arg("workflows").arg("list").output().unwrap();
    assert!(output.status.success());
    let json: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    assert!(json.is_array());
}

#[test]
fn test_workflows_activities_outputs_array() {
    let cmd = Command::cargo_bin("cheerful").unwrap();
    let output = cmd.arg("workflows").arg("activities").output().unwrap();
    assert!(output.status.success());
    let json: serde_json::Value = serde_json::from_slice(&output.stdout).unwrap();
    assert!(json.is_array());
}
```

**Step 2: Run tests**

Run: `cd projects/cheerful/apps/cli && cargo test 2>&1`
Expected: All tests pass

**Step 3: Commit**

```bash
git add projects/cheerful/apps/cli/tests/cli_test.rs
git commit -m "cheerful-cli: integration tests for schema and workflows commands"
```

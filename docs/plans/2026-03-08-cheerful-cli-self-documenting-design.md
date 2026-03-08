# Cheerful CLI Self-Documenting Design

**Date:** 2026-03-08
**Status:** Approved

## Problem

The Cheerful CLI wraps a complex backend with 23 Temporal workflows, ~50 activities, and deep orchestration logic (automation levels, domain routing, conditional drafting, fan-out enrichment). None of this domain knowledge is accessible to CLI users. Coding agents using the CLI cannot discover what workflows exist, what parameters they need, or how commands map to backend behavior without reading backend source code.

## Goal

Make the CLI fully self-documenting so a coding agent can run `cheerful <command> --help` or `cheerful schema <path>` and know exactly what to pass, what gets triggered, and what the structural relationships are — without reading backend code.

## Design Decisions

| Decision | Choice |
|----------|--------|
| Context level | Structural (schemas, workflow mappings, parameters) — not behavioral or advisory |
| Format | Both: enriched `--help` (human-readable) + `cheerful schema` (machine-readable JSON) |
| Workflow tree depth | Expandable — one level default, `--depth N` to drill deeper |
| Data source | Build-time generation from Python → embedded in Rust binary |
| Generation pipeline | Python script introspects workflows, `build.rs` calls it, `include_str!` embeds result |
| Command rename | `cheerful workflows` → `cheerful automations` (campaign rules); `cheerful workflows` becomes Temporal explorer |

## Architecture

### 1. Python Introspection Script

**Location:** `projects/cheerful/apps/cli/scripts/extract_workflow_schema.py`

Imports Temporal workflow and activity modules from `apps/backend/src/temporal/`. For each:

- **Workflow class:** extracts name, task queue, parameter types (Pydantic → JSON Schema), child workflows, activities, retry policies
- **Activity function:** extracts name, parameter types, timeout, retry policy
- **Pydantic models:** generates full JSON Schema via `.model_json_schema()` with field types, optional/required markers

Output: `apps/cli/src/generated/workflow_schema.json`

```json
{
  "workflows": {
    "ThreadProcessingCoordinatorWorkflow": {
      "task_queue": "cheerful",
      "parameters": {
        "candidate": { "$ref": "#/models/Candidate" }
      },
      "children": [
        "ThreadAttachmentExtractWorkflow",
        "ThreadAssociateToCampaignWorkflow",
        "ThreadResponseDraftWorkflow"
      ],
      "activities": [
        "ensure_complete_thread_ingested_activity",
        "update_state_status_activity"
      ],
      "retry_policy": { "max_attempts": 3, "initial_interval_s": 5, "max_interval_s": 30 }
    }
  },
  "activities": {
    "generate_draft_with_rag_activity": {
      "parameters": { "candidate": "Candidate", "campaign_id": "UUID" },
      "timeout_s": 1200,
      "retry_policy": { "max_attempts": 1 }
    }
  },
  "models": {
    "Candidate": { "type": "object", "properties": { ... }, "required": [ ... ] }
  }
}
```

### 2. Build-Time Integration

**`build.rs`** in the CLI crate:

1. Checks if `workflow_schema.json` exists and is fresh (compares mtime against Python source files)
2. If stale or missing, shells out: `python3 scripts/extract_workflow_schema.py`
3. Sets `cargo:rerun-if-changed` on Python workflow/activity source directories
4. Binary embeds JSON via `include_str!("generated/workflow_schema.json")`

A `SchemaRegistry` struct deserializes the embedded JSON at startup (lazy_static/once_cell). All schema queries go through this registry.

**Fallback:** If Python isn't available at build time, the build succeeds with a bundled fallback `workflow_schema.json` checked into git. The generation script updates it, but it's never absent.

### 3. `cheerful schema` Command

New top-level command for machine-readable JSON output:

```
cheerful schema commands                          # list all CLI commands with workflow mappings
cheerful schema commands campaigns launch         # schema for a specific command
cheerful schema workflow <WorkflowName>           # one workflow, params/children/activities
cheerful schema workflow <WorkflowName> --depth 2 # expand children recursively
cheerful schema activity <activity_name>          # one activity, params/timeout/retry
cheerful schema model <ModelName>                 # full JSON schema for a Pydantic model
cheerful schema all                               # dump everything
```

Default output is JSON. `--pretty` flag formats as human-readable tables/trees (reuses existing `--pretty` infrastructure).

### 4. Enhanced `--help` Text

Every command that triggers a backend action gets enriched clap descriptions:

- **Workflow triggered** — which Temporal workflow runs
- **Required fields** — what must exist before the command succeeds
- **Output fields** — what the response JSON contains
- **Schema pointer** — `Use cheerful schema commands <path> for full JSON schema`

Example:

```
cheerful campaigns launch <ID>
    Launch a campaign

    Triggers: SendCampaignOutboxWorkflow
    Requires: ≥1 sender, ≥1 recipient with email, outbox populated
    Returns: { workflow_id, run_id }

    Use `cheerful schema commands campaigns launch` for full JSON schema
```

Descriptions are hand-maintained in clap derive attributes but reference the generated schema data.

### 5. Command Rename

**`cheerful workflows`** (current — campaign automation rules CRUD) renamed to **`cheerful automations`**:

```
cheerful automations list [--campaign-id <ID>]
cheerful automations get <ID>
cheerful automations create --campaign-id <ID> --name <NAME> ...
cheerful automations update <ID> ...
cheerful automations delete <ID>
cheerful automations executions <ID>
```

**`cheerful workflows`** becomes the Temporal workflow explorer:

```
cheerful workflows list                              # list all registered workflows
cheerful workflows describe <WorkflowName>           # human-readable workflow details
cheerful workflows describe <WorkflowName> --depth 2 # expand tree
cheerful workflows activities                        # list all activities
cheerful workflows activities <activity_name>        # describe one activity
```

Two entry points to the same data: `cheerful schema` for machine consumption, `cheerful workflows` for human/agent browsing. Both read from the same embedded `SchemaRegistry`.

## Components

| Component | Location | Language |
|-----------|----------|----------|
| Introspection script | `apps/cli/scripts/extract_workflow_schema.py` | Python |
| Generated schema | `apps/cli/src/generated/workflow_schema.json` | JSON |
| Build integration | `apps/cli/build.rs` | Rust |
| Schema registry | `apps/cli/src/schema.rs` | Rust |
| Schema command | `apps/cli/src/commands/schema_cmd.rs` | Rust |
| Workflows command (new) | `apps/cli/src/commands/workflows_cmd.rs` (replaces `temporal_cmd.rs` explorer role) | Rust |
| Automations command (renamed) | `apps/cli/src/commands/automations.rs` (renamed from `workflows.rs`) | Rust |
| Enhanced help text | across all `apps/cli/src/commands/*.rs` | Rust |

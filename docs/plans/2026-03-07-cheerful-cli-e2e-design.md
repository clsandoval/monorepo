# Cheerful CLI: Temporal gRPC, OAuth, and E2E QA Design

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the 4 deferred tasks from the initial CLI build (Temporal gRPC, OAuth, token refresh, hybrid wiring) and add a comprehensive E2E test suite that runs against staging with real API calls, real Temporal workflows, and real user accounts.

**Design doc:** `docs/plans/2026-03-07-cheerful-cli-e2e-design.md`
**Implementation plan:** `docs/plans/2026-03-07-cheerful-cli-e2e-plan.md` (generated separately)
**Location:** `projects/cheerful/apps/cli/`

---

## 1. Temporal gRPC Client

### Approach

Direct gRPC via `tonic` with proto compilation via `tonic-build` in `build.rs`.

### Dependencies

```toml
tonic = { version = "0.12", features = ["tls"] }
prost = "0.13"
prost-types = "0.13"

[build-dependencies]
tonic-build = "0.12"
```

### Proto files

Vendor the minimal Temporal proto files from `temporalio/api` into `proto/`:
- `temporal/api/workflowservice/v1/service.proto`
- `temporal/api/workflowservice/v1/request_response.proto`
- Required dependencies (common, enums, taskqueue, workflow, history, etc.)

Compile with `build.rs`:
```rust
tonic_build::configure()
    .build_server(false)
    .compile(&["proto/temporal/api/workflowservice/v1/service.proto"], &["proto/"])
```

### Client Implementation (`src/temporal.rs`)

```
TemporalClient
├── connect(server, namespace, api_key?) -> Result<Self>
│   ├── No api_key: plain gRPC connection
│   └── With api_key: TLS + Bearer token in authorization metadata
├── start_workflow(workflow_type, workflow_id, task_queue, params) -> WorkflowId
├── describe_workflow(workflow_id) -> WorkflowStatus
├── list_workflows(query) -> Vec<WorkflowExecution>
├── signal_workflow(workflow_id, signal_name, data) -> ()
├── cancel_workflow(workflow_id) -> ()
└── get_history(workflow_id) -> Vec<HistoryEvent>
```

### TLS + Auth

Temporal Cloud uses mTLS or API key auth. Staging uses API key:
- Connect with TLS to `{server}`
- Pass `Bearer {api_key}` in the `authorization` gRPC metadata header
- Namespace set in each RPC request

### Workflow ID generation

Default: `{workflow-name}-{unix-timestamp-hex}`, overridable with `--id`.

### Config additions

Add to `TemporalConfig`:
```rust
pub api_key: Option<String>,
```

Env var: `CHEERFUL_TEMPORAL_API_KEY`

---

## 2. Replace Temporal Command Stubs

Wire real gRPC calls into `commands/temporal_cmd.rs`:

| Command | gRPC RPC |
|---------|----------|
| `temporal trigger <name>` | `StartWorkflowExecution` |
| `temporal status <id>` | `DescribeWorkflowExecution` (with `--watch`: poll every 2s) |
| `temporal list` | `ListWorkflowExecutions` with search attribute query |
| `temporal signal <id> <name>` | `SignalWorkflowExecution` |
| `temporal cancel <id>` | `RequestCancelWorkflowExecution` |
| `temporal history <id>` | `GetWorkflowExecutionHistory` |

Task queue defaults to `"main"` (matching backend config).

---

## 3. Hybrid Command Wiring

### `campaigns launch <id>`

1. POST `/api/campaigns/launch` (API call — sets up outbox)
2. Trigger `SendCampaignOutboxWorkflow` via Temporal with `{"campaign_id": id}`
3. Return API result + workflow ID

### `drafts generate <thread_id>`

1. Trigger `ThreadResponseDraftWorkflow` via Temporal with `{"thread_state_id": thread_id}`
2. Return workflow ID

Both detect whether Temporal is configured. If `temporal.server` is not set, fall back to API-only with a warning.

---

## 4. OAuth Browser Flow

### Flow

1. Generate random 32-byte `state` parameter (hex-encoded)
2. Build Supabase OAuth URL: `{supabase_url}/auth/v1/authorize?provider=google&redirect_to=http://localhost:9876/callback`
3. Open in browser via `open::that()`
4. Listen on `localhost:9876` with `tokio::net::TcpListener`
5. Serve callback HTML page that reads URL fragment (`access_token`, `refresh_token`) and POSTs them to `localhost:9876/token`
6. Parse the POST, store tokens in config
7. Print success

### Dependencies

```toml
open = "5"
```

### Config additions

Add to `ApiConfig`:
```rust
pub refresh_token: Option<String>,
pub supabase_url: Option<String>,
```

Env vars: `CHEERFUL_SUPABASE_URL`

---

## 5. Token Auto-Refresh

In `ApiClient::request()`:

1. Make the request
2. If 401 and `refresh_token` exists:
   a. POST `{supabase_url}/auth/v1/token?grant_type=refresh_token` with `{"refresh_token": "..."}`
   b. Parse new `access_token` + `refresh_token`
   c. Update in-memory client token
   d. Save to config file
   e. Retry original request once
3. If retry also 401, return error

---

## 6. E2E Test Suite

### File

`tests/e2e_test.rs`

### Required env vars (tests skip if missing)

| Var | Purpose |
|-----|---------|
| `CHEERFUL_STG_API_URL` | Staging API URL (e.g., `https://stg-cheerful.fly.dev/api`) |
| `CHEERFUL_STG_SERVICE_KEY` | Staging `SERVICE_API_KEY` |
| `CHEERFUL_STG_SUPABASE_URL` | Staging Supabase URL |
| `CHEERFUL_STG_SUPABASE_KEY` | Staging Supabase anon key |
| `CHEERFUL_STG_USER_EMAIL` | Test user email |
| `CHEERFUL_STG_USER_PASSWORD` | Test user password |
| `CHEERFUL_STG_TEMPORAL_SERVER` | Staging Temporal Cloud address |
| `CHEERFUL_STG_TEMPORAL_NAMESPACE` | Staging Temporal namespace |
| `CHEERFUL_STG_TEMPORAL_API_KEY` | Staging Temporal API key |

### Setup helper

Creates a temp HOME dir, writes `~/.cheerful/config.toml` with staging values, returns a `Command` builder pre-configured with env vars.

### Shared state

A JSON file in the temp dir stores captured IDs between tests (campaign IDs, thread IDs, workflow IDs). Tests are numbered `test_01_` through `test_20_` to control execution order.

### Test scenarios

| # | Test | Verifies |
|---|------|----------|
| 01 | `health_check` | Staging API is up via `/health` |
| 02 | `auth_login_api_key` | Service key auth, config written |
| 03 | `auth_login_jwt` | Supabase email/password → JWT, `auth whoami` returns user |
| 04 | `campaigns_list` | JSON array returned, capture campaign ID |
| 05 | `campaigns_get` | Campaign fields present |
| 06 | `campaigns_create_update_delete` | Full CRUD cycle |
| 07 | `creators_search` | Keyword search returns results |
| 08 | `threads_list` | Thread listing works |
| 09 | `drafts_get` | Draft structure for known thread |
| 10 | `workflows_list` | Workflow listing for campaign |
| 11 | `integrations_accounts` | Connected accounts returned |
| 12 | `lists_crud` | Create → get → update → delete |
| 13 | `analytics_dashboard` | Dashboard fields present |
| 14 | `temporal_trigger_poll_history` | Trigger workflow, get workflow ID |
| 15 | `temporal_status` | Poll until terminal state (max 120s, 5s interval) |
| 16 | `temporal_list_running` | List running workflows |
| 17 | `temporal_draft_round_trip` | Trigger draft-generate, wait, verify draft via API |
| 18 | `temporal_history` | Event history returned |
| 19 | `email_scheduled_list` | Scheduled email listing |
| 20 | `campaigns_launch_hybrid` | API + Temporal workflow both succeed |

### Timeouts

- Per-test: 60 seconds
- Temporal polling: 5s interval, 120s max wait

---

## Task Dependency Graph

```
T1 (Temporal gRPC client)
 └─► T2 (Replace stubs)
      └─► T3 (Hybrid wiring)
           └─► T11 (E2E: hybrid commands)

T4 (OAuth browser flow)
 └─► T5 (Token auto-refresh)

T6 (Config additions)  ◄── needed by T1, T4, T5

T7 (E2E test infra)
 ├─► T8 (E2E: auth flows)      ◄── needs T5
 ├─► T9 (E2E: CRUD commands)
 ├─► T10 (E2E: Temporal)       ◄── needs T2
 └─► T11 (E2E: hybrid)         ◄── needs T3
```

## Not in Scope

- CI integration (running E2E in GitHub Actions with staging secrets)
- Temporal proto auto-update from upstream
- OAuth refresh token rotation monitoring

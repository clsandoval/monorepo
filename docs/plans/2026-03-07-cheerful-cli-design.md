# Cheerful CLI Design

**Date:** 2026-03-07
**Status:** Approved
**Author:** clsandoval + Claude

## Overview

Cheerful CLI is a Rust binary that exposes the full Cheerful platform as structured commands for automation, AI agents, and team power users. It is a dual-client: HTTP client for CRUD operations against the FastAPI backend, and Temporal client for direct workflow orchestration.

## Architecture

```
cheerful <command> <subcommand> [args] [flags]
    |
    +-- HTTP Client --> FastAPI Backend (~220 endpoints)
    |                    JWT auth (OAuth flow) or API key
    |
    +-- Temporal Client --> Temporal Server (24 workflows)
                            mTLS or API key auth
```

**Config:** `~/.cheerful/config.toml`

```toml
[api]
url = "https://api.cheerful.com"
key = "ck_..."          # for automation/agents
token = "eyJ..."        # from OAuth flow, auto-refreshed

[temporal]
server = "temporal.cheerful.internal:7233"
namespace = "cheerful-production"
tls_cert = "~/.cheerful/temporal.pem"  # optional mTLS
```

All config values overridable via env vars: `CHEERFUL_API_URL`, `CHEERFUL_API_KEY`, `CHEERFUL_TEMPORAL_SERVER`, etc.

**Output:** JSON by default, `--pretty` flag for human-readable tables.

**Key Rust crates:** `clap` (CLI framework), `reqwest` (HTTP), `temporalio-sdk-core` (Temporal), `serde`/`serde_json`, `toml`, `tabled` (pretty tables), `keyring` (secure token storage).

## Command Structure

```
cheerful
+-- auth
|   +-- login              # OAuth browser flow -> store token
|   +-- login --api-key    # Set API key directly
|   +-- logout             # Clear stored credentials
|   +-- whoami             # Show current user/team
|
+-- campaigns
|   +-- list               # List all campaigns
|   +-- get <id>           # Get campaign details
|   +-- create             # Create campaign (flags or --from-json)
|   +-- update <id>        # Update campaign metadata
|   +-- delete <id>        # Delete campaign
|   +-- launch <id>        # Launch campaign (triggers Temporal)
|   +-- status <id>        # Outbox table + send/fail counts
|   +-- senders add <id>   # Add sender to campaign
|   +-- senders remove <id> <sender-id>
|   +-- recipients add <id> --csv <file>
|   +-- recipients search <id> --query <q>
|   +-- recipients approve <id> <recipient-id>
|   +-- recipients remove <id> <recipient-id>
|   +-- merge-tags <id>    # List available merge tags
|   +-- summary <id>       # Generate AI client summary
|
+-- creators
|   +-- search --keyword <q> --platform <p>
|   +-- search --similar <handle>
|   +-- enrich <handle>    # Enrich creator profile
|   +-- profile <handle>   # Get creator profile
|   +-- list --campaign <id>  # List creators in campaign
|   +-- get <creator-id> --campaign <id>
|
+-- threads
|   +-- list               # List email threads (filterable)
|   +-- get <thread-id>    # Get thread + all messages
|   +-- search --keyword <q>
|   +-- search --similar <q>  # Semantic/RAG search
|   +-- hide <thread-id>
|   +-- unhide <thread-id>
|
+-- drafts
|   +-- get <thread-id>       # Get current draft
|   +-- create <thread-id>    # Create manual draft
|   +-- update <thread-id>    # Update draft
|   +-- bulk-edit --campaign <id> --instruction "..."
|   +-- generate <thread-id>  # Trigger AI draft generation (Temporal)
|
+-- email
|   +-- send --thread <id> --body "..." [--subject "..."]
|   +-- schedule --thread <id> --body "..." --at "2026-03-10T09:00"
|   +-- scheduled list        # List scheduled emails
|   +-- scheduled cancel <id>
|   +-- scheduled reschedule <id> --at "..."
|
+-- workflows
|   +-- list --campaign <id>  # List campaign automation rules
|   +-- get <id>
|   +-- create --campaign <id> --name "..." --instructions "..."
|   +-- update <id>
|   +-- delete <id>
|   +-- executions <id>      # View execution history
|
+-- analytics
|   +-- dashboard [--campaign <id>] [--time-range 30d]
|
+-- integrations
|   +-- accounts list         # List Gmail + SMTP accounts
|   +-- smtp add              # Add SMTP account
|   +-- smtp list
|   +-- smtp remove <id>
|   +-- signatures list [--campaign <id>]
|   +-- signatures create --name "..." --content "..."
|   +-- signatures update <id>
|   +-- signatures delete <id>
|   +-- shopify shops         # List connected Shopify shops
|   +-- instantly status|connect|disconnect|test
|
+-- lists
|   +-- list                  # List all creator lists
|   +-- get <id>
|   +-- create --title "..."
|   +-- update <id> --title "..."
|   +-- delete <id>
|   +-- duplicate <id>
|   +-- creators <id>         # List creators in list
|   +-- creators add <id> --creator-ids [...]
|   +-- creators remove <id> <creator-id>
|   +-- creators import <id> --csv <file>
|
+-- temporal
|   +-- trigger <workflow-name> [--params '{}']
|   +-- status <workflow-id> [--watch]
|   +-- list [--running] [--campaign <id>] [--type <name>]
|   +-- signal <workflow-id> <signal-name> [--data '{}']
|   +-- cancel <workflow-id>
|   +-- history <workflow-id>  # Event history
|
+-- config
    +-- show                  # Print current config
    +-- set <key> <value>     # Set config value
    +-- init                  # Interactive setup wizard
```

## Data Flow

**Read operations** go through the API:

```
cheerful campaigns list
  -> GET /campaigns/ (JWT or API key)
  -> JSON response -> stdout
```

**Write operations** go through the API:

```
cheerful campaigns create --name "Summer 2026" --type gifting
  -> POST /campaigns/ (JSON body)
  -> JSON response -> stdout
```

**Workflow triggers** go directly to Temporal:

```
cheerful temporal trigger campaign-launch --params '{"campaign_id": "abc"}'
  -> Temporal SDK -> StartWorkflow("CampaignLaunchWorkflow", params)
  -> Returns workflow ID + run ID -> stdout
```

**Hybrid operations** compose both:

```
cheerful campaigns launch <id>
  -> POST /campaigns/launch (API - validates, prepares outbox)
  -> Then starts SendCampaignOutboxWorkflow via Temporal
  -> Returns campaign status + workflow ID
```

```
cheerful drafts generate <thread-id>
  -> Triggers ThreadResponseDraftWorkflow via Temporal
  -> Returns workflow ID (draft generation is async)
  -> User can poll: cheerful temporal status <workflow-id>
```

**Long-running operations** return immediately with a workflow ID:

```
cheerful temporal status wf-abc123 --watch
  -> Polls every 2s, updates in-place until completion
```

**Piping and composition:**

```bash
# Get all opted-in creators across campaigns
cheerful campaigns list | jq '.[].id' -r | \
  xargs -I{} cheerful creators list --campaign {} | \
  jq '[.[] | select(.gifting_status == "opted_in")]'

# Bulk trigger enrichment for a list
cheerful lists creators <list-id> | jq '.[].id' -r | \
  xargs -I{} cheerful temporal trigger enrich-creator --params "{\"creator_id\": \"{}\"}"
```

## Rust Struct Mapping

Structs are derived from API response models (not database models). The CLI never touches the DB directly.

```rust
// Core enums
enum CampaignType { PaidPromotion, Creator, Gifting, Sales, Other }
enum CampaignStatus { Active, Paused, Draft, Completed }
enum ThreadStatus { ReadyForAttachmentExtraction, ReadyForCampaignAssociation,
                    ReadyForResponseDraft, WaitingForDraftReview,
                    WaitingForInbound, Ignore, Done, NotLatest }
enum MessageDirection { Inbound, Outbound }
enum QueueStatus { Pending, Processing, Sent, Failed, Cancelled }
enum AccountType { Gmail, Smtp }

// Core structs (deserialized from API JSON responses)
struct Campaign { id, name, campaign_type, status, product_id,
                  sent_count, thread_count, pending_count, ... }
struct Creator { id, platform, handle, email, follower_count,
                 is_verified, location, keywords, profile_data }
struct CampaignCreator { id, campaign_id, email, name, role,
                         gifting_status, paid_promotion_status,
                         social_media_handles, ... }
struct EmailThread { id, gmail_thread_id, status, latest_internal_date }
struct EmailMessage { id, direction, sender_email, recipient_emails,
                      subject, body_text, internal_date }
struct Draft { gmail_thread_state_id, draft_subject, draft_body_text,
              source, alternative_drafts }
struct CreatorList { id, title, creator_count }
struct DashboardAnalytics { active_campaigns_count, total_opted_in,
                            opt_in_rate, response_rate, email_stats, ... }
struct WorkflowExecution { workflow_id, run_id, status, start_time }
```

All structs derive `Serialize, Deserialize, Debug` and use `#[serde(rename_all = "snake_case")]`.

Each struct implements a `PrettyTable` trait for `--pretty` output:

```
$ cheerful campaigns list --pretty
+----------+----------------+---------+--------+------+---------+
| ID       | Name           | Type    | Status | Sent | Threads |
+----------+----------------+---------+--------+------+---------+
| abc..123 | Summer 2026    | Gifting | Active | 142  | 89      |
| def..456 | Q3 Paid Push   | Paid    | Draft  | 0    | 0       |
+----------+----------------+---------+--------+------+---------+
```

## Authentication & Security

**Two auth paths:**

### OAuth browser flow (interactive/team use)

```
$ cheerful auth login
Opening browser for authentication...
> Logged in as aspen@nutsandbolts.co (team: Nuts and Bolts)
```

- Opens Supabase OAuth URL in browser
- Local HTTP server on `localhost:9876` catches the callback
- Stores JWT + refresh token in OS keyring (`keyring` crate), falls back to config file
- Auto-refreshes token on 401 responses

### API key (automation/agents)

```
$ cheerful auth login --api-key ck_live_abc123
> API key stored

# Or via env var (no config file needed)
$ CHEERFUL_API_KEY=ck_live_abc123 cheerful campaigns list
```

- Uses existing `X-Service-Api-Key` header path (backend `service.py` routes)
- Env var takes precedence over config file

**Auth precedence:** env var -> config file API key -> config file OAuth token

**Temporal auth:**
- mTLS cert path in config, or `CHEERFUL_TEMPORAL_TLS_CERT` env var
- Namespace from config or `CHEERFUL_TEMPORAL_NAMESPACE` env var
- No auth needed for local dev (default `localhost:7233`)

**Security:**
- Config file created with `0600` permissions (owner-only read/write)
- `cheerful config show` redacts secrets: `key = "ck_...b123"`
- No credentials ever printed to stdout in JSON output
- `cheerful auth logout` clears keyring + config file credentials

## Error Handling & Exit Codes

**Structured errors** in JSON by default:

```
$ cheerful campaigns get nonexistent-id
{"error": "not_found", "message": "Campaign not found", "status": 404}
$ echo $?
1
```

With `--pretty`:

```
$ cheerful campaigns get nonexistent-id --pretty
Error: Campaign not found (404)
```

**Exit codes:**

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | API/application error (4xx/5xx) |
| 2 | CLI usage error (bad args, missing flags) |
| 3 | Auth error (no credentials, expired token) |
| 4 | Network error (unreachable API/Temporal) |
| 5 | Temporal error (workflow failed, signal rejected) |

**Timeout handling:**
- HTTP requests: 30s default, `--timeout <seconds>` override
- Temporal operations: 10s for describe/signal, no timeout for `--watch`

**No automatic retries** -- the CLI is a thin client, agents/scripts handle their own retry logic.

## Temporal Workflow Mapping

| CLI Name | Temporal Workflow | Typical Use |
|----------|------------------|-------------|
| `poll-history` | AllPollHistoryWorkflow | Start Gmail polling loop |
| `smtp-sync` | AllSmtpInboxSyncWorkflow | Sync all SMTP inboxes |
| `thread-sync` | ThreadSyncWorkflow | Process new thread states |
| `thread-process` | ThreadProcessingCoordinatorWorkflow | Process single thread |
| `draft-generate` | ThreadResponseDraftWorkflow | Generate AI draft for thread |
| `draft-generate-corrections` | ThreadResponseDraftWithCorrectionsWorkflow | Draft with correction examples |
| `draft-follow-up` | TriggerThreadFollowUpDraftWorkflow | Generate follow-up drafts |
| `draft-bulk-edit` | BulkDraftEditWorkflow | Bulk edit campaign drafts |
| `send-outbox` | SendCampaignOutboxWorkflow | Send pending outbound emails |
| `send-follow-ups` | SendCampaignFollowUpsWorkflow | Send scheduled follow-ups |
| `send-dispatches` | SendEmailDispatchesWorkflow | Send scheduled dispatches |
| `send-post-optin` | SendPostOptInFollowUpsWorkflow | Send post-opt-in follow-ups |
| `enrich-campaign` | EnrichForCampaignWorkflow | Enrich creators for campaign |
| `campaign-discovery` | CampaignDiscoveryWorkflow | Run creator discovery |
| `campaign-discovery-scheduler` | CampaignDiscoverySchedulerWorkflow | Weekly discovery sweep |
| `post-tracking` | PostTrackingWorkflow | Track creator posts |
| `post-tracking-scheduler` | PostTrackingSchedulerWorkflow | Scheduled post tracking |
| `slack-digest` | SlackOrderDigestWorkflow | Post order digest to Slack |
| `sync-sheet-creators` | SyncSheetCreatorsWorkflow | Sync creators from Google Sheets |
| `thread-extract-metrics` | ThreadExtractMetricsWorkflow | Extract metrics from thread |
| `thread-extract-attachments` | ThreadAttachmentExtractWorkflow | Extract attachment content |
| `thread-associate-campaign` | ThreadAssociateToCampaignWorkflow | Associate thread to campaign |

**Search attribute filtering:**

```bash
cheerful temporal list --campaign abc123        # by campaign_id
cheerful temporal list --user user-456          # by user_id
cheerful temporal list --running                # only open workflows
cheerful temporal list --type draft-generate    # by workflow type
```

## Tech Stack Summary

- **Language:** Rust
- **CLI framework:** clap (derive API)
- **HTTP client:** reqwest (async, rustls)
- **Temporal client:** temporalio-sdk-core
- **Serialization:** serde + serde_json
- **Config:** toml
- **Pretty output:** tabled
- **Secure storage:** keyring
- **Target:** Single static binary, cross-compiled for linux-amd64, linux-arm64, darwin-amd64, darwin-arm64

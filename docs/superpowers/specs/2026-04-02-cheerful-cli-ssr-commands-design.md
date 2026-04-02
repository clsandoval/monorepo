# Cheerful CLI SSR Commands — Design Spec

**Date:** 2026-04-02
**Status:** Draft
**Depends on:** Cheerful backend SSR endpoints (nuts-and-bolts-ai/cheerful#1468)

## Overview

Add 6 SSR (Synthetic Consumer Panel) subcommands to the Cheerful Rust CLI, providing full coverage of the backend SSR API. Commands are fire-and-forget — async operations (panel creation, stimulus runs) return immediately with an ID; the caller polls with `get-panel` / `get-run`.

## Command Interface

All commands live under `cheerful ssr`:

### `cheerful ssr create-panel`

Create a new consumer panel. Returns immediately with `panel_id` and status `generating`.

```
cheerful ssr create-panel \
  --product-category "skincare" \
  --demographics '{"age_min":18,"age_max":35,"genders":["female"],"locations":["Metro Manila"]}' \
  [--psychographics '{"interests":["K-beauty"],"values":["affordability"]}'] \
  [--panel-size 20] \
  [--panel-name "Skincare Gen Z Panel"] \
  [--custom-instructions "Focus on budget-conscious consumers"]
```

| Flag | Required | Type | Default | Description |
|------|----------|------|---------|-------------|
| `--product-category` | yes | string | — | Product category context |
| `--demographics` | yes | JSON string | — | Demographics constraints |
| `--psychographics` | no | JSON string | — | Psychographic texture |
| `--panel-size` | no | int | 20 | Number of personas (5-50) |
| `--panel-name` | no | string | auto | Panel display name |
| `--custom-instructions` | no | string | — | Free-text appended to prompts |

**API:** `POST /api/v1/ssr/panels`
**Response:** `{ panel_id, status: "generating" }`

### `cheerful ssr list-panels`

List consumer panels for the authenticated user.

```
cheerful ssr list-panels [--limit 20] [--offset 0]
```

| Flag | Required | Type | Default |
|------|----------|------|---------|
| `--limit` | no | int | 20 |
| `--offset` | no | int | 0 |

**API:** `GET /api/v1/ssr/panels?limit=N&offset=N`
**Pretty output:** Table with columns: ID, Name, Product Category, Status, Size, Created At

### `cheerful ssr get-panel <panel_id>`

Get panel details with personas. Use for polling panel creation status.

```
cheerful ssr get-panel abc123
```

**API:** `GET /api/v1/ssr/panels/{panel_id}`
**Pretty output:** Pretty-printed JSON (includes persona summaries when status is `ready`/`partial`)

### `cheerful ssr delete-panel <panel_id>`

Soft-delete a panel.

```
cheerful ssr delete-panel abc123
```

**API:** `DELETE /api/v1/ssr/panels/{panel_id}`
**Output:** Success message

### `cheerful ssr run <panel_id>`

Start a stimulus run against a panel. Returns immediately with `run_id` and status `pending`.

```
cheerful ssr run abc123 \
  --stimulus "Try our new glow serum — K-beauty inspired, locally made, only P299!" \
  --stimulus-type ad_copy \
  [--dimensions purchase_intent,message_clarity,overall_appeal] \
  [--run-label "Version A — price-led"] \
  [--image-url "https://example.com/creative.jpg"]
```

| Flag | Required | Type | Default | Description |
|------|----------|------|---------|-------------|
| `<panel_id>` | yes | positional | — | Panel to run against |
| `--stimulus` | yes | string | — | Stimulus text (max 4000 chars) |
| `--stimulus-type` | yes | string | — | One of: ad_copy, headline, tagline, product_concept, brand_message, campaign_theme, influencer_pitch, pricing_message, packaging_description, social_caption |
| `--dimensions` | no | comma-separated | purchase_intent,message_clarity,overall_appeal | Evaluation dimensions |
| `--run-label` | no | string | — | Label for identification |
| `--image-url` | no | string | — | HTTPS image URL |

**API:** `POST /api/v1/ssr/panels/{panel_id}/runs`
**Response:** `{ run_id, status: "pending" }`

### `cheerful ssr get-run <run_id>`

Get run status and results. When completed, includes dimension scores, distributions, CIs, and highlights. Optionally compare with another run.

```
cheerful ssr get-run def456 [--comparison-run-id ghi789]
```

| Flag | Required | Type | Description |
|------|----------|------|-------------|
| `<run_id>` | yes | positional | Run to retrieve |
| `--comparison-run-id` | no | string | A/B comparison run |

**API:** `GET /api/v1/ssr/runs/{run_id}[?comparison_run_id=X]`
**Pretty output:** Pretty-printed JSON with full results

## Implementation

### Files

| File | Action | Description |
|------|--------|-------------|
| `apps/cli/src/commands/ssr.rs` | Create | 6 subcommands + response serde structs |
| `apps/cli/src/commands/mod.rs` | Modify | Add `pub mod ssr;` |
| `apps/cli/src/main.rs` | Modify | Register `Ssr` variant in `Commands` enum |

### Response Structs

Defined in `ssr.rs` (no separate models file — simple enough to colocate):

```rust
// For create-panel response
#[derive(Serialize, Deserialize)]
struct PanelCreated { panel_id: String, status: String }

// For list-panels table display
#[derive(Serialize, Deserialize)]
struct PanelListItem {
    id: String,
    panel_name: String,
    product_category: String,
    status: String,
    actual_size: Option<i64>,
    run_count: i64,
    created_at: String,
}

#[derive(Tabled, Serialize)]
struct PanelRow {
    #[tabled(rename = "ID")] id: String,
    #[tabled(rename = "Name")] name: String,
    #[tabled(rename = "Category")] category: String,
    #[tabled(rename = "Status")] status: String,
    #[tabled(rename = "Size")] size: String,
    #[tabled(rename = "Created")] created: String,
}

// For run response
#[derive(Serialize, Deserialize)]
struct RunCreated { run_id: String, status: String }
```

### Patterns

- `--demographics` and `--psychographics` are parsed as `serde_json::Value` from the raw string, then embedded in the POST body
- `--dimensions` uses `value_delimiter = ','` to split into `Vec<String>`
- All output: pretty mode uses `output::print_json` for single items, `output::print_list` with `PanelRow` for list-panels, `output::print_success` for delete
- Error handling via `Result<(), CliError>` with `?` propagation

### API Path Prefix

The CLI's `ApiClient` uses base URL (e.g., `https://prd-cheerful.fly.dev`). All SSR paths are prefixed with `/api/v1/ssr/`.

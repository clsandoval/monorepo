# Cheerful SSR Consumer Panel — Design Spec

**Date:** 2026-04-02
**Status:** Draft
**Reference:** [Synthetic Consumer Panels (arxiv 2510.08338v1)](https://arxiv.org/html/2510.08338v1)

## Overview

Add synthetic consumer panel capability to the Cheerful NanoClaw instance, enabling pre-campaign launch optimization. Cheerful team members test ad copy, influencer pitches, headlines, and other marketing assets against AI-generated consumer personas — getting quantitative Likert scores and qualitative reactions in seconds, directly from Slack.

The implementation ports the decision-orchestrator's SSR (Semantic Similarity Rating) pipeline to the Cheerful backend as REST endpoints, with a thin NanoClaw skill handling the conversational UX.

## Architecture

Three components:

1. **SSR API endpoints** — FastAPI routes in `cs/cheerful/apps/backend` (branch off `staging`). Own the full pipeline: persona generation, response elicitation, embedding, scoring, aggregation, comparison.
2. **SSR database tables** — Added to Cheerful's existing Supabase, scoped by `org_id`.
3. **NanoClaw skill** — `container/skills/cheerful/ssr-panel/SKILL.md`. Conversational orchestrator that checks briefs, builds panel specs with the user, calls backend, formats results.

### Data Flow

```
Slack user → NanoClaw container (Claude + ssr-panel skill)
  → reads campaign briefs from Supabase (cheerful-supabase skill)
  → conversational panel-building flow (demographics, psychographics)
  → POST /v1/ssr/panels → polls GET /v1/ssr/panels/{id} until ready
  → POST /v1/ssr/panels/{id}/runs → polls GET /v1/ssr/runs/{id} until completed
  → skill formats scored results for Slack
```

## Backend API

Six endpoints under `/v1/ssr/`, authenticated via existing JWT/API key pattern. All scoped by `org_id` derived from the authenticated user.

### Panel Management

**`POST /v1/ssr/panels`** — Create panel + generate personas.
- Input: `panel_name` (optional), `demographics` (required), `psychographics` (optional), `product_category` (required), `panel_size` (5-50, default 20), `custom_instructions` (optional)
- Returns immediately: `{ panel_id, status: "generating" }`
- Background task generates personas concurrently via Claude Haiku 4.5
- Panel status transitions: `generating` → `ready` | `partial` | `failed`
- Failure threshold: <50% persona generation success rate → `failed`

**`GET /v1/ssr/panels`** — List panels for org.

**`GET /v1/ssr/panels/{id}`** — Get panel with status. When `ready`/`partial`, includes persona summaries.

**`DELETE /v1/ssr/panels/{id}`** — Soft delete (sets `deleted_at` timestamp, excluded from list queries).

### Stimulus Runs

**`POST /v1/ssr/panels/{id}/runs`** — Start stimulus test.
- Input: `stimulus` (text, max 4000 chars), `stimulus_type`, `evaluation_dimensions` (list), `response_format` (`summary` | `detailed` | `raw`), `stimulus_image_url` (optional, HTTPS), `run_label` (optional)
- Returns immediately: `{ run_id, status: "pending" }`
- Background task runs full pipeline: elicit → embed → score → aggregate
- Run status transitions: `pending` → `running` → `completed` | `failed`
- Failure threshold: <50% response elicitation success rate → `failed`
- Timeout safety: background task fails after 5 minutes max

**`GET /v1/ssr/runs/{id}`** — Get run status and results.
- When `completed`: includes full scored results (distributions, means, CIs, highlights)
- When `failed`: includes error message
- Optional query param: `comparison_run_id` for A/B comparison (delta means, significance via non-overlapping CIs)

## Pipeline (Ported from decision-orchestrator)

Exact same approach as the arxiv paper and existing implementation. No deviations.

### Stage 1: Persona Generation

- Model: Claude Haiku 4.5 (`claude-haiku-4-5-20251001`), 800 max tokens
- System prompt: guidelines emphasizing specificity, internal consistency, realism, panel diversity
- User prompt: demographics block + psychographics + product category + persona index
- Response format: labeled sections (NAME, AGE, LOCATION, OCCUPATION, HOUSEHOLD, INCOME_BRACKET, EDUCATION, BACKGROUND, VALUES, LIFESTYLE, MEDIA_HABITS, PRODUCT_CATEGORY_ATTITUDES, VOICE)
- Parsing: regex extraction of labeled sections, validation of enums, UUID generation
- Concurrent: all personas generated in parallel via `asyncio.gather()`

### Stage 2: Response Elicitation

- Model: Claude Haiku 4.5, 450 max tokens
- System prompt: persona inhabitation with full profile, critical instructions (stay in character, no numeric ratings, authentic voice)
- User prompt: stimulus context sentence (from stimulus type) + stimulus text + reaction prompt
- Image support: HTTPS URLs fetched, base64-encoded, included as content blocks
- Break-character detection: heuristic check for "as an AI", third-person self-reference, etc. Discards broken responses.
- Concurrent: all persona responses elicited in parallel

### Stage 3: Embedding

- Model: OpenAI `text-embedding-3-small`
- Batch API call for all response texts
- Returns 1536-dimensional vectors (float32)

### Stage 4: Scoring

For each (persona, dimension):
1. Compute cosine similarity between response embedding and each of 5 anchor embeddings
2. Hard score: argmax (which anchor is most similar) → 1-5
3. Weighted score: softmax over similarities × scale points → continuous 1.0-5.0

Exact algorithm:
```python
sims_array = [cosine_similarity(response_emb, anchor_emb) for anchor in anchors]
exp_sims = np.exp(sims_array - np.max(sims_array))  # numerically stable softmax
weights = exp_sims / exp_sims.sum()
hard_score = scores[np.argmax(sims_array)]
weighted_score = np.dot(weights, scores)
```

### Stage 5: Aggregation

Per dimension:
- Distribution: count of hard scores at each point (1-5)
- Mean and std dev of weighted scores
- Mode: most common hard score (lowest wins ties)
- 95% CI: t-distribution critical values (hardcoded lookup table, df=1..49, z=1.96 for n>=50)
- Qualitative highlights: top positive, top negative, closest-to-mean neutral — persona name + 200-char excerpt

### Stage 6: Comparison (A/B)

- Delta = mean_b - mean_a per dimension
- Direction: → (delta ≤ 0.05), ↑ (positive), ↓ (negative)
- Significance: non-overlapping 95% CIs

## Database Schema

All tables in Cheerful's existing Supabase. Every table has `org_id` (UUID, NOT NULL) for multi-org scoping.

### Tables

| Table | Purpose |
|-------|---------|
| `ssr_panel` | Panel metadata: demographics (JSONB), psychographics (JSONB), product_category, panel_size, actual_size, status, org_id |
| `ssr_persona` | Generated personas: name, age, location, occupation, income_bracket, education, summary, full_profile. Unique (panel_id, persona_index) |
| `ssr_run` | Stimulus test runs: stimulus, stimulus_type, evaluation_dimensions (TEXT[]), status, personas_scored, dimension_means (JSONB), stimulus_image_url |
| `ssr_response` | Free-text persona reactions: response_text. Unique (run_id, persona_id) |
| `ssr_score` | Per-persona per-dimension scores: hard_score, weighted_score, similarities (JSONB), response_embedding (FLOAT8[1536]). Unique (response_id, dimension) |
| `ssr_anchor_set` | Pre-embedded Likert anchor statements: dimension_name, scale_point, anchor_text, anchor_embedding (FLOAT8[1536]), is_default. org_id NULL = global |
| `ssr_stimulus_type` | Stimulus type definitions: name, label, context_sentence, is_default. org_id NULL = global |
| `ssr_prompt_template` | Customizable prompts: template_type (persona_system/persona_user/inhabitation_system/elicitation_user), template_text. org_id NULL = global |

### Org Scoping

- All queries include `WHERE org_id = :org_id`
- Anchor sets, stimulus types, prompt templates: org-specific first, fall back to global (`org_id IS NULL`)
- `org_id` resolved from authenticated user on the backend, never passed from the client

### Seeding

- 10 default evaluation dimensions with anchor statements (purchase_intent, brand_favorability, message_clarity, emotional_response, brand_trust, product_quality, value_for_money, cultural_relevance, overall_appeal, perceived_authenticity)
- 10 default stimulus types (ad_copy, headline, tagline, product_concept, brand_message, campaign_theme, influencer_pitch, pricing_message, packaging_description, social_caption)
- Anchor embeddings pre-computed via seed script using OpenAI text-embedding-3-small
- All defaults seeded with `org_id = NULL`

## NanoClaw Skill

**File:** `automations/nanoclaw/container/skills/cheerful/ssr-panel/SKILL.md`

### Behavior Flow

1. **Trigger**: User mentions consumer panel, testing ad copy, pre-launch validation, etc.

2. **Brief lookup**: Query campaign tables via `cheerful-supabase` skill for the relevant client/campaign. Extract any existing target audience data (demographics, psychographics, product category) from briefs.

3. **Conversational panel-building**: Walk through panel spec one question at a time. Pre-fill from brief data where available, user confirms or adjusts:
   - Product category
   - Target demographics: age range, genders, locations, income brackets, education levels
   - Psychographics: interests, values, lifestyle, media consumption
   - Panel size (default 20)

4. **Panel creation**: Call `POST /v1/ssr/panels`, poll `GET /v1/ssr/panels/{id}` until `ready`/`partial`/`failed`. Report persona summaries.

5. **Stimulus testing**: Ask for the stimulus (ad copy, headline, image URL, etc.), stimulus type, and which dimensions to evaluate. Call `POST /v1/ssr/panels/{id}/runs`, poll until complete. Present results.

6. **Results formatting**: Slack-friendly format — per-dimension mean, distribution bar, top highlights with persona quotes.

7. **Comparison**: If user wants to A/B test variants, run second stimulus against same panel, retrieve results with `comparison_run_id`.

### Auth

Reuses existing `CHEERFUL_BACKEND_URL` and auth mechanism from `cheerful-api` skill. No new env vars or API keys needed on the container side.

### What the Skill Does NOT Do

No scoring math, no embedding calls, no direct DB writes for SSR tables. All compute is backend-side. The skill is purely conversational orchestration + HTTP calls to the backend.

## Env & Auth

- **Backend secrets** (already present): `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`
- **Container env**: reuses existing `CHEERFUL_BACKEND_URL` + auth from `cheerful-api` skill
- **No new secrets** required on either side

## Scope

V1 includes:
- Full panel creation with conversational flow + brief pre-fill
- Stimulus runs with all 10 default dimensions and 10 stimulus types
- Image stimulus support (HTTPS URLs)
- A/B comparison between runs
- Summary, detailed, and raw result formats
- Multi-org scoping via `org_id`

## Cost

- ~$0.003 per persona per run (Claude Haiku + OpenAI embedding)
- Panel of 20 personas: ~$0.06 per stimulus run
- Panel creation: ~$0.02 for 20 personas

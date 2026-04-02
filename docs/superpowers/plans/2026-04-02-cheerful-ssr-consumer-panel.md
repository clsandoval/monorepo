# Cheerful SSR Consumer Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port the decision-orchestrator's SSR (Synthetic Consumer Panel) pipeline to the Cheerful backend as async REST endpoints, with a thin NanoClaw skill for conversational UX in Slack.

**Architecture:** FastAPI async endpoints in `cs/cheerful/apps/backend` backed by Cheerful's existing Supabase. Background tasks handle the heavy pipeline work (persona generation via Claude Haiku, embedding via OpenAI, cosine-similarity scoring). A thin NanoClaw SKILL.md orchestrates the conversational flow and polls the backend. All data scoped by `user_id` (Cheerful's existing auth pattern — each authenticated user represents an org/client).

**Tech Stack:** Python 3.12+, FastAPI, SQLAlchemy 2.0, Pydantic v2, Anthropic SDK (AsyncAnthropic), OpenAI SDK (AsyncOpenAI), NumPy, structlog

**Spec:** `docs/superpowers/specs/2026-04-02-cheerful-ssr-consumer-panel-design.md`

**Source to port:** `projects/decision-orchestrator/apps/bot/src_v2/mcp/tools/ssr/` (api.py, models.py, core/models/ssr.py)

---

## File Structure

```
cs/cheerful/apps/backend/
├── src/
│   ├── api/route/ssr.py                         # 6 REST endpoints (panels + runs)
│   ├── models/
│   │   ├── database/ssr.py                      # SQLAlchemy models (8 tables)
│   │   └── api/ssr.py                           # Pydantic request/response models
│   ├── repositories/ssr.py                      # Repository for all SSR tables
│   └── services/ssr/
│       ├── __init__.py                          # Public API: create_panel, run_pipeline, get_results
│       ├── scoring.py                           # Cosine similarity, anchor scoring, aggregation
│       ├── persona.py                           # Persona generation, parsing, break-character detection
│       ├── prompts.py                           # Default prompt templates + template builders
│       └── constants.py                         # Anchor statements, t-critical table, model configs
├── tests/
│   └── ssr/
│       ├── test_scoring.py                      # Unit tests for scoring math
│       ├── test_persona.py                      # Unit tests for persona parsing + break detection
│       └── test_routes.py                       # Route-level tests with mocked services
├── scripts/
│   └── seed_ssr_anchors.py                      # Embed + seed anchor statements
└── ...

cs/cheerful/supabase/migrations/
└── 20260402000000_create_ssr_tables.sql         # All SSR tables

automations/nanoclaw/
├── container/skills/cheerful/ssr-panel/SKILL.md # NanoClaw conversational skill
└── deployments/cheerful.json                    # Add ssr-panel to defaults.skills
```

---

### Task 1: Branch Setup

**Files:**
- Working directory: `/home/clsandoval/cs/cheerful`

- [ ] **Step 1: Create feature branch off staging**

```bash
cd /home/clsandoval/cs/cheerful
git fetch origin
git checkout -b feat/ssr-consumer-panel origin/staging
```

- [ ] **Step 2: Add numpy dependency**

```bash
cd /home/clsandoval/cs/cheerful/apps/backend
# Add numpy to pyproject.toml dependencies
```

Add to `pyproject.toml` under `[project] dependencies`:
```
"numpy>=2.0.0",
```

- [ ] **Step 3: Install dependencies**

```bash
cd /home/clsandoval/cs/cheerful/apps/backend
pip install -e ".[dev]"
```

- [ ] **Step 4: Commit**

```bash
git add pyproject.toml
git commit -m "chore: add numpy dependency for SSR scoring pipeline"
```

---

### Task 2: SSR Constants & Prompt Templates

**Files:**
- Create: `src/services/ssr/constants.py`
- Create: `src/services/ssr/prompts.py`
- Create: `src/services/ssr/__init__.py`

- [ ] **Step 1: Create SSR service package**

Create `src/services/ssr/__init__.py`:
```python
"""SSR (Synthetic Consumer Panel) service — ports the decision-orchestrator pipeline."""
```

- [ ] **Step 2: Write constants.py**

Create `src/services/ssr/constants.py` with all configuration constants ported from `decision-orchestrator/apps/bot/src_v2/mcp/tools/ssr/api.py`:

```python
"""SSR pipeline constants — model configs, t-critical table, anchor statements."""

# --- Model Configuration ---
PERSONA_MODEL = "claude-haiku-4-5-20251001"
PERSONA_MAX_TOKENS = 800

ELICITATION_MODEL = "claude-haiku-4-5-20251001"
ELICITATION_MAX_TOKENS = 450

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536

# --- Break-Character Detection Markers ---
BREAK_CHARACTER_MARKERS = [
    "as an ai",
    "as a language model",
    "i'm an ai",
    "i am an ai",
    "i don't have personal",
    "i cannot experience",
    "as the persona",
    "the persona would",
]

# --- T-Critical Values (97.5th percentile, two-tailed 95% CI) ---
# Keys are degrees of freedom (n - 1)
T_CRITICAL: dict[int, float] = {
    1: 12.706, 2: 4.303, 3: 3.182, 4: 2.776, 5: 2.571,
    6: 2.447, 7: 2.365, 8: 2.306, 9: 2.262, 10: 2.228,
    11: 2.201, 12: 2.179, 13: 2.160, 14: 2.145, 15: 2.131,
    16: 2.120, 17: 2.110, 18: 2.101, 19: 2.093, 20: 2.086,
    21: 2.080, 22: 2.074, 23: 2.069, 24: 2.064, 25: 2.060,
    26: 2.056, 27: 2.052, 28: 2.048, 29: 2.045, 30: 2.042,
    35: 2.030, 40: 2.021, 45: 2.014, 49: 2.010,
}
T_CRITICAL_DEFAULT = 1.960  # z-score for n >= 50

# --- Default Anchor Statements (10 dimensions x 5 points) ---
# Ported from decision-orchestrator anchor-statements.md
# These are seeded into ssr_anchor_set with user_id = NULL (global defaults)
DEFAULT_ANCHOR_STATEMENTS: dict[str, dict[int, str]] = {
    "purchase_intent": {
        1: "I would not buy this under any circumstances and would actively avoid it.",
        2: "I am unlikely to buy this — it does not appeal to me enough to spend my money.",
        3: "I might consider buying this if the conditions were right, but I'm not drawn to it strongly.",
        4: "I would probably buy this — it appeals to me and I could see myself picking it up.",
        5: "I would definitely buy this and would look for it the next time I shop.",
    },
    "brand_favorability": {
        1: "This makes me think worse of the brand — it feels off-putting or inconsistent with what I expect.",
        2: "This does not improve my impression of the brand — I feel indifferent or slightly negative.",
        3: "This does not change how I feel about the brand — my impression is the same as before.",
        4: "This gives me a better impression of the brand — it feels authentic and aligned with my values.",
        5: "This makes me think much more highly of the brand — I feel genuinely positive and more loyal.",
    },
    "message_clarity": {
        1: "I have no idea what this is trying to say — the message is completely unclear or confusing.",
        2: "The message is somewhat unclear — I had to work to understand what they're trying to communicate.",
        3: "I understand what this is saying, but it took me a moment — the communication is average.",
        4: "The message is clear and easy to follow — I understood immediately what they were communicating.",
        5: "The message is crystal clear and instantly understood — exactly what they wanted to communicate came through perfectly.",
    },
    "emotional_response": {
        1: "This leaves me completely cold — I feel nothing positive and may even feel annoyed or repelled.",
        2: "This generates very little emotional response in me — it fails to connect or engage emotionally.",
        3: "This produces a mild emotional response — I feel slightly interested or mildly positive but not moved.",
        4: "This genuinely engages me emotionally — I feel something real like warmth, excitement, or nostalgia.",
        5: "This moves me deeply — I feel strong positive emotions like joy, inspiration, or heartfelt connection.",
    },
    "personal_relevance": {
        1: "This has absolutely nothing to do with my life — it speaks to someone completely different from me.",
        2: "This doesn't really speak to me — it's for someone with a very different lifestyle or situation.",
        3: "This is somewhat relevant to my life — I can see how it might apply, though it's not specifically for me.",
        4: "This speaks directly to my life — it addresses something I actually think about or deal with.",
        5: "This feels made exactly for me — it addresses my specific situation, needs, and values precisely.",
    },
    "uniqueness": {
        1: "This feels completely generic — I've seen exactly this before from many other brands and nothing stands out.",
        2: "This is mostly familiar — there are small differences but nothing that really makes it stand apart.",
        3: "This is somewhat distinctive — there are elements that differ from what I usually see, though not dramatically.",
        4: "This stands out from the competition — there is something genuinely different and memorable about it.",
        5: "This is completely fresh and distinctive — I've never seen anything quite like it and it truly stands apart.",
    },
    "trust_credibility": {
        1: "I find this completely unbelievable and it makes me distrust the brand — it feels manipulative or dishonest.",
        2: "I am skeptical of this — the claims feel exaggerated or the brand feels inauthentic.",
        3: "I neither trust nor distrust this — it's plausible but I don't have strong confidence in the claims.",
        4: "I find this credible and believable — the claims feel honest and the brand feels authentic.",
        5: "I fully trust this — the claims feel completely authentic, honest, and backed by real substance.",
    },
    "value_perception": {
        1: "This seems like terrible value — the price is way too high for what's being offered.",
        2: "This seems somewhat overpriced — I don't think it's worth what they're asking.",
        3: "The value seems fair — the price is about what I'd expect for what's being offered.",
        4: "This seems like good value — I'm getting more than I'd expect for the price.",
        5: "This seems like exceptional value — the offer is clearly worth every peso and then some.",
    },
    "share_worthiness": {
        1: "I would not share this with anyone — it's not interesting or relevant enough for me to pass on.",
        2: "I'm unlikely to share this — it's not compelling enough to send to my friends or family.",
        3: "I might share this with one or two people in specific situations, but not broadly.",
        4: "I would share this with friends or family — it's something they'd find useful or interesting.",
        5: "I would immediately share this widely — it's exactly the kind of content I love to pass on.",
    },
    "overall_appeal": {
        1: "This is deeply unappealing — I have a strong negative reaction to the overall execution.",
        2: "This doesn't appeal to me — the overall impression is weak or off-putting.",
        3: "This is neither appealing nor unappealing — it's average and leaves no strong impression.",
        4: "This appeals to me — the overall execution is strong and leaves a positive impression.",
        5: "This is highly appealing — the overall execution is excellent and I have a very strong positive reaction.",
    },
}

# --- Default Stimulus Types ---
DEFAULT_STIMULUS_TYPES: list[dict[str, str]] = [
    {"name": "ad_copy", "label": "the ad copy", "context_sentence": "Imagine you've just seen this advertisement while browsing online."},
    {"name": "headline", "label": "the headline", "context_sentence": "Imagine you've just read this headline in your news feed."},
    {"name": "tagline", "label": "the tagline", "context_sentence": "Imagine you've just seen this tagline on a product or in an ad."},
    {"name": "product_concept", "label": "the product concept", "context_sentence": "Imagine a friend is telling you about this new product they discovered."},
    {"name": "brand_message", "label": "the brand message", "context_sentence": "Imagine you've encountered this brand message while browsing the brand's website."},
    {"name": "campaign_theme", "label": "the campaign theme", "context_sentence": "Imagine you've been exposed to a campaign built around this theme across multiple touchpoints."},
    {"name": "influencer_pitch", "label": "the influencer pitch", "context_sentence": "Imagine you've just seen an influencer you follow share this pitch or endorsement."},
    {"name": "pricing_message", "label": "the pricing message", "context_sentence": "Imagine you're shopping and you've just encountered this pricing or promotional message."},
    {"name": "packaging_description", "label": "the packaging description", "context_sentence": "Imagine you're browsing a store shelf and reading the description on a product package."},
    {"name": "social_caption", "label": "the social media caption", "context_sentence": "Imagine you've just seen this caption on a social media post while scrolling your feed."},
]
```

- [ ] **Step 3: Write prompts.py**

Create `src/services/ssr/prompts.py`. Port all prompt templates and builder functions from `decision-orchestrator/apps/bot/src_v2/mcp/tools/ssr/api.py`:

```python
"""SSR prompt templates and builder functions.

Ported from decision-orchestrator. These are the default templates —
custom templates can be loaded from ssr_prompt_template table.
"""

import re

DEFAULT_PERSONA_SYSTEM = """You are a synthetic consumer persona generator for marketing research.

Your job is to create a realistic, detailed consumer persona that matches the given demographic and psychographic constraints. The persona must feel like a real person with genuine preferences, habits, and attitudes.

GUIDELINES:
1. SPECIFICITY: Use real-sounding names appropriate to the demographic, exact ages, specific cities/neighborhoods, concrete job titles
2. INTERNAL CONSISTENCY: Demographics must align — a 22-year-old in Manila earning "low" income should have media habits and attitudes consistent with that reality
3. REALISM: Include nuance and contradictions real people have — brand-loyal but price-sensitive, health-conscious but loves fast food, etc.
4. PRODUCT CATEGORY GROUNDING: The persona must have a specific, detailed relationship with the product category — not generic opinions but real behaviors
5. PANEL DIVERSITY: Each persona in the panel must be genuinely distinct — different names, ages, locations, occupations, and attitudes
6. RESPONSE FORMAT: Use the labeled sections below exactly

RESPONSE FORMAT (use these exact labels, one per line):
NAME: [full name]
AGE: [exact age]
LOCATION: [specific city/area]
OCCUPATION: [specific job title]
HOUSEHOLD: [household composition]
INCOME_BRACKET: [low/lower_middle/middle/upper_middle/high]
EDUCATION: [high_school/some_college/bachelors/graduate/postgraduate]
BACKGROUND: [2-3 sentences about life situation, daily routine, priorities]
VALUES: [core values that drive decisions]
LIFESTYLE: [daily habits, social activities, how they spend free time]
MEDIA_HABITS: [social media usage, content consumption, platforms]
PRODUCT_CATEGORY_ATTITUDES: [specific relationship with the product category — brands they use, purchase frequency, what matters to them]
VOICE: [how they talk — formal/casual, slang, dialect notes]"""

DEFAULT_PERSONA_USER = """Create a synthetic consumer persona with the following constraints.

DEMOGRAPHIC CONSTRAINTS (these are hard limits — do not create a persona outside these bounds):
{demographics_block}

PRODUCT CATEGORY CONTEXT:
{product_category}

PANEL DIVERSITY NOTE:
This is persona {persona_index} of {panel_size}. Make this persona genuinely distinct from others in the panel — different name, age, location, occupation, and attitudes. Avoid stereotypes."""

DEFAULT_INHABITATION_SYSTEM = """You are {full_profile_name}, a {full_profile_age}-year-old {full_profile_occupation} from {full_profile_location}.

Here is your complete personal profile:
{full_profile}

CRITICAL INSTRUCTIONS:
1. STAY IN CHARACTER at all times — you ARE this person, not an AI pretending to be them
2. Use first person only — "I", "me", "my"
3. NO NUMERIC RATINGS — express your reaction entirely in natural language
4. BE AUTHENTIC AND SPECIFIC — reference your budget constraints, values, past experiences with similar products
5. NATURAL VOICE — speak as you would naturally, with your own speech patterns
6. HONEST REACTIONS ONLY — if you don't like something, say so directly; no diplomatic filtering"""

DEFAULT_ELICITATION_USER = """Here is {stimulus_article} {stimulus_label} for you to react to:

---
{stimulus}
---

{stimulus_context}

Now, as yourself, describe your honest reaction. Consider:
- Your immediate first impression
- How it makes you feel emotionally
- Whether it's relevant to your life and situation
- Whether you trust what's being communicated
- Whether it would change your behavior in any way

Respond naturally in 3-5 sentences."""

# --- Placeholder validation for custom templates ---
REQUIRED_PLACEHOLDERS: dict[str, list[str]] = {
    "persona_system": [],
    "persona_user": ["{product_category}", "{demographics_block}", "{persona_index}", "{panel_size}"],
    "inhabitation_system": ["{full_profile}"],
    "elicitation_user": ["{stimulus_label}", "{stimulus}", "{stimulus_context}"],
}


def build_demographics_block(
    demographics: dict,
    psychographics: dict | None = None,
    custom_instructions: str | None = None,
) -> str:
    """Format demographics + psychographics into a prompt block.

    Args:
        demographics: Dict with keys: age_min, age_max, genders, locations,
            income_brackets, education_levels, languages
        psychographics: Optional dict with keys: interests, values,
            lifestyle_descriptors, media_consumption
        custom_instructions: Optional free-text appended verbatim
    """
    lines = []
    lines.append(f"Age range: {demographics.get('age_min', 18)}–{demographics.get('age_max', 99)}")

    if demographics.get("genders"):
        lines.append(f"Gender: {', '.join(demographics['genders'])}")
    if demographics.get("locations"):
        lines.append(f"Location: {', '.join(demographics['locations'])}")
    if demographics.get("income_brackets"):
        lines.append(f"Income bracket: {', '.join(demographics['income_brackets'])}")
    if demographics.get("education_levels"):
        lines.append(f"Education: {', '.join(demographics['education_levels'])}")
    if demographics.get("languages"):
        lines.append(f"Primary language(s): {', '.join(demographics['languages'])}")

    if psychographics:
        psych_lines = []
        if psychographics.get("interests"):
            psych_lines.append(f"Interests/hobbies: {', '.join(psychographics['interests'])}")
        if psychographics.get("values"):
            psych_lines.append(f"Core values: {', '.join(psychographics['values'])}")
        if psychographics.get("lifestyle_descriptors"):
            psych_lines.append(f"Lifestyle: {', '.join(psychographics['lifestyle_descriptors'])}")
        if psychographics.get("media_consumption"):
            psych_lines.append(f"Media consumption: {', '.join(psychographics['media_consumption'])}")
        if psych_lines:
            lines.append("\nPSYCHOGRAPHIC CONTEXT:")
            lines.extend(psych_lines)

    if custom_instructions:
        lines.append(f"\nADDITIONAL INSTRUCTIONS:\n{custom_instructions}")

    return "\n".join(lines)


def build_persona_user_prompt(
    index: int,
    total: int,
    demographics: dict,
    psychographics: dict | None,
    product_category: str,
    custom_instructions: str | None = None,
) -> str:
    """Build the user prompt for persona generation."""
    demographics_block = build_demographics_block(demographics, psychographics, custom_instructions)
    return DEFAULT_PERSONA_USER.format(
        demographics_block=demographics_block,
        product_category=product_category,
        persona_index=index,
        panel_size=total,
    )


def build_inhabitation_system_prompt(persona_profile: dict) -> str:
    """Build system prompt for persona inhabitation.

    Args:
        persona_profile: Dict with keys: name, age, occupation, location, full_profile
    """
    return DEFAULT_INHABITATION_SYSTEM.format(
        full_profile_name=persona_profile["name"],
        full_profile_age=persona_profile["age"],
        full_profile_occupation=persona_profile["occupation"],
        full_profile_location=persona_profile["location"],
        full_profile=persona_profile["full_profile"],
    )


def build_elicitation_user_prompt(
    stimulus: str,
    stimulus_label: str,
    stimulus_context: str,
) -> str:
    """Build user prompt for stimulus elicitation."""
    # Determine article (a/an)
    article = "an" if stimulus_label[0].lower() in "aeiou" else "a"
    return DEFAULT_ELICITATION_USER.format(
        stimulus_article=article,
        stimulus_label=stimulus_label,
        stimulus=stimulus,
        stimulus_context=stimulus_context,
    )


_FIELD_PATTERN = re.compile(r"^([A-Z][A-Z_]+):\s*(.*?)(?=\n[A-Z][A-Z_]+:|\Z)", re.MULTILINE | re.DOTALL)


def parse_persona_response(raw_text: str, index: int) -> dict:
    """Parse labeled-section Claude output into a persona dict.

    Returns dict with keys: index, name, age, location, occupation,
    income_bracket, education, summary, full_profile. Raises ValueError
    if required fields are missing.
    """
    fields: dict[str, str] = {}
    for match in _FIELD_PATTERN.finditer(raw_text):
        fields[match.group(1).strip()] = match.group(2).strip()

    required = ["NAME", "AGE", "LOCATION", "OCCUPATION", "INCOME_BRACKET", "EDUCATION", "BACKGROUND", "PRODUCT_CATEGORY_ATTITUDES"]
    missing = [f for f in required if f not in fields]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")

    # Parse age — extract first integer
    age_str = fields["AGE"]
    age_match = re.search(r"\d+", age_str)
    age = int(age_match.group()) if age_match else 30

    # Validate enums with fallbacks
    valid_income = {"low", "lower_middle", "middle", "upper_middle", "high"}
    income = fields["INCOME_BRACKET"].lower().strip()
    if income not in valid_income:
        income = "middle"

    valid_education = {"high_school", "some_college", "bachelors", "graduate", "postgraduate"}
    education = fields["EDUCATION"].lower().strip()
    if education not in valid_education:
        education = "some_college"

    # Build summary from background + attitudes
    bg = fields.get("BACKGROUND", "")[:150]
    att = fields.get("PRODUCT_CATEGORY_ATTITUDES", "")[:150]
    summary = f"{bg} {att}".strip()

    return {
        "index": index,
        "name": fields["NAME"],
        "age": age,
        "location": fields["LOCATION"],
        "occupation": fields["OCCUPATION"],
        "income_bracket": income,
        "education": education,
        "summary": summary,
        "full_profile": raw_text,
    }
```

- [ ] **Step 4: Commit**

```bash
git add src/services/ssr/
git commit -m "feat(ssr): add constants, prompt templates, and builder functions"
```

---

### Task 3: SSR Scoring Module (TDD)

**Files:**
- Create: `src/services/ssr/scoring.py`
- Create: `tests/ssr/__init__.py`
- Create: `tests/ssr/test_scoring.py`

- [ ] **Step 1: Write failing tests for cosine_similarity**

Create `tests/ssr/__init__.py` (empty file).

Create `tests/ssr/test_scoring.py`:

```python
"""Unit tests for SSR scoring math — cosine similarity, anchor scoring, aggregation."""

import numpy as np
import pytest


class TestCosineSimilarity:
    def test_identical_vectors(self):
        from src.services.ssr.scoring import cosine_similarity

        a = np.array([1.0, 2.0, 3.0])
        result = cosine_similarity(a, a)
        assert abs(result - 1.0) < 1e-6

    def test_orthogonal_vectors(self):
        from src.services.ssr.scoring import cosine_similarity

        a = np.array([1.0, 0.0])
        b = np.array([0.0, 1.0])
        result = cosine_similarity(a, b)
        assert abs(result) < 1e-6

    def test_opposite_vectors(self):
        from src.services.ssr.scoring import cosine_similarity

        a = np.array([1.0, 0.0])
        b = np.array([-1.0, 0.0])
        result = cosine_similarity(a, b)
        assert abs(result - (-1.0)) < 1e-6

    def test_zero_vector_returns_zero(self):
        from src.services.ssr.scoring import cosine_similarity

        a = np.zeros(3)
        b = np.array([1.0, 2.0, 3.0])
        assert cosine_similarity(a, b) == 0.0
        assert cosine_similarity(b, a) == 0.0


class TestScoreAgainstAnchors:
    def _make_anchors(self) -> dict[int, np.ndarray]:
        """Create 5 mock anchor embeddings spread across 3D space."""
        return {
            1: np.array([1.0, 0.0, 0.0]),
            2: np.array([0.7, 0.3, 0.0]),
            3: np.array([0.0, 1.0, 0.0]),
            4: np.array([0.0, 0.3, 0.7]),
            5: np.array([0.0, 0.0, 1.0]),
        }

    def test_exact_match_anchor_1(self):
        from src.services.ssr.scoring import score_against_anchors

        anchors = self._make_anchors()
        response = np.array([1.0, 0.0, 0.0])  # identical to anchor 1
        hard, weighted, sims = score_against_anchors(response, anchors)
        assert hard == 1
        assert sims[1] > sims[5]

    def test_exact_match_anchor_5(self):
        from src.services.ssr.scoring import score_against_anchors

        anchors = self._make_anchors()
        response = np.array([0.0, 0.0, 1.0])  # identical to anchor 5
        hard, weighted, sims = score_against_anchors(response, anchors)
        assert hard == 5
        assert sims[5] > sims[1]

    def test_weighted_score_between_1_and_5(self):
        from src.services.ssr.scoring import score_against_anchors

        anchors = self._make_anchors()
        response = np.array([0.3, 0.5, 0.2])  # somewhere in the middle
        hard, weighted, sims = score_against_anchors(response, anchors)
        assert 1.0 <= weighted <= 5.0

    def test_returns_all_five_similarities(self):
        from src.services.ssr.scoring import score_against_anchors

        anchors = self._make_anchors()
        response = np.array([0.5, 0.5, 0.0])
        _, _, sims = score_against_anchors(response, anchors)
        assert set(sims.keys()) == {1, 2, 3, 4, 5}


class TestAggregateScores:
    def test_basic_aggregation(self):
        from src.services.ssr.scoring import aggregate_dimension_scores

        # 5 personas, all scored on one dimension
        scores = [
            {"hard_score": 3, "weighted_score": 3.1, "response_text": "It's okay.", "persona_name": "A", "persona_id": "a"},
            {"hard_score": 4, "weighted_score": 4.0, "response_text": "I like it.", "persona_name": "B", "persona_id": "b"},
            {"hard_score": 3, "weighted_score": 2.9, "response_text": "Meh.", "persona_name": "C", "persona_id": "c"},
            {"hard_score": 5, "weighted_score": 4.8, "response_text": "Love it!", "persona_name": "D", "persona_id": "d"},
            {"hard_score": 2, "weighted_score": 2.1, "response_text": "Not for me.", "persona_name": "E", "persona_id": "e"},
        ]
        result = aggregate_dimension_scores(scores)
        assert result["distribution"] == {1: 0, 2: 1, 3: 2, 4: 1, 5: 1}
        assert 2.0 < result["mean"] < 4.0
        assert result["mode"] == 3
        assert len(result["confidence_interval_95"]) == 2
        assert result["confidence_interval_95"][0] <= result["mean"] <= result["confidence_interval_95"][1]
        assert len(result["highlights"]) > 0

    def test_single_score(self):
        from src.services.ssr.scoring import aggregate_dimension_scores

        scores = [
            {"hard_score": 4, "weighted_score": 4.2, "response_text": "Good.", "persona_name": "A", "persona_id": "a"},
        ]
        result = aggregate_dimension_scores(scores)
        assert result["mean"] == 4.2
        assert result["std_dev"] == 0.0


class TestTCritical:
    def test_known_values(self):
        from src.services.ssr.scoring import t_critical

        assert t_critical(2) == 12.706  # df=1
        assert t_critical(3) == 4.303  # df=2
        assert t_critical(31) == 2.042  # df=30

    def test_large_n_uses_default(self):
        from src.services.ssr.scoring import t_critical

        assert t_critical(100) == 1.960
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/clsandoval/cs/cheerful/apps/backend
python -m pytest tests/ssr/test_scoring.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'src.services.ssr.scoring'`

- [ ] **Step 3: Write scoring.py**

Create `src/services/ssr/scoring.py`:

```python
"""SSR scoring pipeline — embedding, cosine similarity, anchor scoring, aggregation.

Implements the SSR (Semantic Similarity Rating) approach from arxiv 2510.08338v1:
embed free-text responses, compare against Likert anchor embeddings via cosine
similarity, then softmax-weight to produce continuous scores.
"""

import statistics

import numpy as np
from openai import AsyncOpenAI

from src.services.ssr.constants import (
    EMBEDDING_MODEL,
    T_CRITICAL,
    T_CRITICAL_DEFAULT,
)


def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Cosine similarity between two vectors. Returns 0.0 if either is zero."""
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0.0 or norm_b == 0.0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def score_against_anchors(
    response_embedding: np.ndarray,
    anchor_embeddings: dict[int, np.ndarray],
) -> tuple[int, float, dict[int, float]]:
    """Score a response embedding against Likert anchor embeddings.

    Returns:
        (hard_score, weighted_score, similarities)
        - hard_score: argmax scale point (1-5)
        - weighted_score: softmax-weighted mean (continuous 1.0-5.0)
        - similarities: {scale_point: cosine_similarity}
    """
    scores = sorted(anchor_embeddings.keys())  # [1, 2, 3, 4, 5]
    sims_array = np.array(
        [cosine_similarity(response_embedding, anchor_embeddings[s]) for s in scores],
        dtype=np.float64,
    )

    # Numerically stable softmax
    exp_sims = np.exp(sims_array - np.max(sims_array))
    weights = exp_sims / exp_sims.sum()

    hard_score = scores[int(np.argmax(sims_array))]
    weighted_score = float(np.dot(weights, np.array(scores, dtype=np.float64)))

    similarities = {s: float(sims_array[i]) for i, s in enumerate(scores)}
    return hard_score, weighted_score, similarities


def t_critical(n: int) -> float:
    """Look up t-critical value for 95% CI given sample size n."""
    if n < 2:
        return T_CRITICAL.get(1, 12.706)
    df = n - 1
    if df in T_CRITICAL:
        return T_CRITICAL[df]
    # Find closest lower key
    for key in sorted(T_CRITICAL.keys(), reverse=True):
        if key <= df:
            return T_CRITICAL[key]
    return T_CRITICAL_DEFAULT


def aggregate_dimension_scores(scores: list[dict]) -> dict:
    """Aggregate per-persona scores for a single dimension.

    Args:
        scores: List of dicts with keys: hard_score, weighted_score,
            response_text, persona_name, persona_id

    Returns:
        Dict with: distribution, mean, std_dev, mode, confidence_interval_95, highlights
    """
    hard_scores = [s["hard_score"] for s in scores]
    weighted_scores = [s["weighted_score"] for s in scores]
    n = len(scores)

    # Distribution
    distribution: dict[int, int] = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for hs in hard_scores:
        distribution[hs] = distribution.get(hs, 0) + 1

    # Mean and std dev
    mean = statistics.mean(weighted_scores)
    std_dev = statistics.stdev(weighted_scores) if n > 1 else 0.0

    # Mode (lowest wins ties)
    mode = min(distribution, key=lambda k: (-distribution[k], k))

    # 95% CI
    t_crit = t_critical(n)
    margin = t_crit * (std_dev / (n**0.5)) if n > 0 else 0.0
    ci_low = max(1.0, mean - margin)
    ci_high = min(5.0, mean + margin)

    # Highlights
    highlights = _select_highlights(scores, mean)

    return {
        "distribution": distribution,
        "mean": round(mean, 2),
        "std_dev": round(std_dev, 2),
        "mode": mode,
        "confidence_interval_95": (round(ci_low, 2), round(ci_high, 2)),
        "highlights": highlights,
    }


def _extract_excerpt(text: str, max_chars: int = 200) -> str:
    """Extract a sentence-boundary-aware excerpt."""
    if len(text) <= max_chars:
        return text
    truncated = text[:max_chars]
    # Try to cut at sentence boundary
    for sep in [". ", "! ", "? "]:
        idx = truncated.rfind(sep)
        if idx > max_chars // 2:
            return truncated[: idx + 1]
    # Fall back to word boundary
    idx = truncated.rfind(" ")
    if idx > max_chars // 2:
        return truncated[:idx] + "..."
    return truncated + "..."


def _select_highlights(scores: list[dict], mean: float) -> list[dict]:
    """Select up to 6 qualitative highlights: positive, negative, neutral."""
    sorted_by_score = sorted(scores, key=lambda s: s["weighted_score"])
    highlights = []

    # Up to 2 negative (lowest)
    for s in sorted_by_score[:2]:
        highlights.append({
            "persona_name": s["persona_name"],
            "persona_id": s["persona_id"],
            "quote": _extract_excerpt(s["response_text"]),
            "valence": "negative",
            "weighted_score": round(s["weighted_score"], 2),
        })

    # Up to 2 positive (highest)
    for s in sorted_by_score[-2:]:
        if s not in sorted_by_score[:2]:  # avoid duplicates in small panels
            highlights.append({
                "persona_name": s["persona_name"],
                "persona_id": s["persona_id"],
                "quote": _extract_excerpt(s["response_text"]),
                "valence": "positive",
                "weighted_score": round(s["weighted_score"], 2),
            })

    # Up to 2 neutral (closest to mean)
    by_distance = sorted(scores, key=lambda s: abs(s["weighted_score"] - mean))
    for s in by_distance[:2]:
        already = {h["persona_id"] for h in highlights}
        if s["persona_id"] not in already:
            highlights.append({
                "persona_name": s["persona_name"],
                "persona_id": s["persona_id"],
                "quote": _extract_excerpt(s["response_text"]),
                "valence": "neutral",
                "weighted_score": round(s["weighted_score"], 2),
            })

    return highlights[:6]


async def embed_texts(client: AsyncOpenAI, texts: list[str]) -> list[np.ndarray]:
    """Batch-embed texts via OpenAI text-embedding-3-small.

    Returns list of 1536-dim numpy arrays in same order as input.
    """
    response = await client.embeddings.create(model=EMBEDDING_MODEL, input=texts)
    # Sort by index (API may reorder)
    sorted_data = sorted(response.data, key=lambda d: d.index)
    return [np.array(d.embedding, dtype=np.float32) for d in sorted_data]


def compute_dimension_comparison(
    result_a: dict,
    result_b: dict,
) -> dict:
    """Compare two aggregated dimension results.

    Returns dict with: delta_mean, delta_direction, significant
    """
    delta = round(result_b["mean"] - result_a["mean"], 2)
    if abs(delta) <= 0.05:
        direction = "→"
    elif delta > 0:
        direction = "↑"
    else:
        direction = "↓"

    # Significance: non-overlapping 95% CIs
    ci_a = result_a["confidence_interval_95"]
    ci_b = result_b["confidence_interval_95"]
    significant = ci_a[1] < ci_b[0] or ci_b[1] < ci_a[0]

    return {
        "delta_mean": delta,
        "delta_direction": direction,
        "significant": significant,
    }
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/clsandoval/cs/cheerful/apps/backend
python -m pytest tests/ssr/test_scoring.py -v
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/services/ssr/scoring.py tests/ssr/
git commit -m "feat(ssr): add scoring module with cosine similarity, anchor scoring, aggregation (TDD)"
```

---

### Task 4: Persona Parsing Tests & Break-Character Detection (TDD)

**Files:**
- Create: `tests/ssr/test_persona.py`
- Create: `src/services/ssr/persona.py`

- [ ] **Step 1: Write failing tests**

Create `tests/ssr/test_persona.py`:

```python
"""Unit tests for SSR persona parsing and break-character detection."""

import pytest


class TestParsePersonaResponse:
    SAMPLE_RESPONSE = """NAME: Maria Santos
AGE: 34
LOCATION: Quezon City, Metro Manila
OCCUPATION: Elementary School Teacher
HOUSEHOLD: Lives with husband and two sons (ages 8 and 5)
INCOME_BRACKET: lower_middle
EDUCATION: bachelors
BACKGROUND: Maria has been teaching for 10 years at a public school. She supplements her income with weekend tutorial sessions. She's practical with money but treats her family on paydays.
VALUES: Family security, education, practicality
LIFESTYLE: Wakes at 5am, commutes by jeepney, cooks dinner every night, watches K-drama before bed
MEDIA_HABITS: Heavy Facebook user, watches TikTok during commute, follows mommy bloggers on Instagram
PRODUCT_CATEGORY_ATTITUDES: Buys mid-range skincare from Watsons. Tried expensive brands but can't justify the cost. Trusts recommendations from friends and family over ads.
VOICE: Casual Taglish speaker, uses Filipino expressions naturally"""

    def test_parses_all_fields(self):
        from src.services.ssr.prompts import parse_persona_response

        result = parse_persona_response(self.SAMPLE_RESPONSE, 1)
        assert result["name"] == "Maria Santos"
        assert result["age"] == 34
        assert result["location"] == "Quezon City, Metro Manila"
        assert result["occupation"] == "Elementary School Teacher"
        assert result["income_bracket"] == "lower_middle"
        assert result["education"] == "bachelors"
        assert result["index"] == 1

    def test_invalid_income_falls_back(self):
        from src.services.ssr.prompts import parse_persona_response

        bad = self.SAMPLE_RESPONSE.replace("lower_middle", "medium-ish")
        result = parse_persona_response(bad, 1)
        assert result["income_bracket"] == "middle"

    def test_missing_required_field_raises(self):
        from src.services.ssr.prompts import parse_persona_response

        incomplete = "NAME: Test\nAGE: 25\nLOCATION: Manila"
        with pytest.raises(ValueError, match="Missing required fields"):
            parse_persona_response(incomplete, 1)

    def test_age_extracts_integer(self):
        from src.services.ssr.prompts import parse_persona_response

        modified = self.SAMPLE_RESPONSE.replace("AGE: 34", "AGE: 34 years old")
        result = parse_persona_response(modified, 1)
        assert result["age"] == 34


class TestIsBreakCharacter:
    def test_clean_response(self):
        from src.services.ssr.persona import is_break_character

        assert is_break_character("I love this product! It reminds me of what my mom used to buy.", "Maria") is False

    def test_ai_disclosure(self):
        from src.services.ssr.persona import is_break_character

        assert is_break_character("As an AI, I don't have personal preferences.", "Maria") is True

    def test_third_person_self_reference(self):
        from src.services.ssr.persona import is_break_character

        assert is_break_character("Maria would probably like this product.", "Maria") is True

    def test_language_model_disclosure(self):
        from src.services.ssr.persona import is_break_character

        assert is_break_character("As a language model, I cannot experience products.", "Maria") is True
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/clsandoval/cs/cheerful/apps/backend
python -m pytest tests/ssr/test_persona.py -v
```

Expected: FAIL — `ModuleNotFoundError: No module named 'src.services.ssr.persona'`

- [ ] **Step 3: Write persona.py**

Create `src/services/ssr/persona.py`:

```python
"""SSR persona generation, elicitation, and break-character detection.

Handles async calls to Claude Haiku for persona generation and
stimulus response elicitation.
"""

import asyncio
import uuid

import httpx
import numpy as np
import structlog
from anthropic import AsyncAnthropic

from src.services.ssr.constants import (
    BREAK_CHARACTER_MARKERS,
    ELICITATION_MAX_TOKENS,
    ELICITATION_MODEL,
    PERSONA_MAX_TOKENS,
    PERSONA_MODEL,
)
from src.services.ssr.prompts import (
    DEFAULT_INHABITATION_SYSTEM,
    DEFAULT_PERSONA_SYSTEM,
    build_elicitation_user_prompt,
    build_inhabitation_system_prompt,
    build_persona_user_prompt,
    parse_persona_response,
)

log = structlog.get_logger()


def is_break_character(response_text: str, persona_name: str) -> bool:
    """Detect if the model broke character in its response.

    Checks for common AI self-disclosure markers and third-person
    self-reference using the persona's name.
    """
    lower = response_text.lower()
    for marker in BREAK_CHARACTER_MARKERS:
        if marker in lower:
            return True

    # Third-person self-reference check
    name_parts = persona_name.lower().split()
    for part in name_parts:
        if len(part) > 2 and f"{part} would" in lower:
            return True

    return False


async def generate_single_persona(
    client: AsyncAnthropic,
    index: int,
    total: int,
    demographics: dict,
    psychographics: dict | None,
    product_category: str,
    custom_instructions: str | None = None,
) -> dict:
    """Generate a single synthetic consumer persona via Claude Haiku.

    Returns parsed persona dict or raises on failure.
    """
    user_prompt = build_persona_user_prompt(
        index=index,
        total=total,
        demographics=demographics,
        psychographics=psychographics,
        product_category=product_category,
        custom_instructions=custom_instructions,
    )

    response = await client.messages.create(
        model=PERSONA_MODEL,
        max_tokens=PERSONA_MAX_TOKENS,
        system=DEFAULT_PERSONA_SYSTEM,
        messages=[{"role": "user", "content": user_prompt}],
    )

    raw_text = response.content[0].text
    persona = parse_persona_response(raw_text, index)
    persona["persona_id"] = str(uuid.uuid4())
    return persona


async def generate_panel_personas(
    client: AsyncAnthropic,
    panel_size: int,
    demographics: dict,
    psychographics: dict | None,
    product_category: str,
    custom_instructions: str | None = None,
) -> tuple[list[dict], bool]:
    """Generate all personas for a panel concurrently.

    Returns (personas, is_partial). Raises if <50% succeed.
    """
    tasks = [
        generate_single_persona(
            client=client,
            index=i + 1,
            total=panel_size,
            demographics=demographics,
            psychographics=psychographics,
            product_category=product_category,
            custom_instructions=custom_instructions,
        )
        for i in range(panel_size)
    ]

    results = await asyncio.gather(*tasks, return_exceptions=True)

    personas = []
    for r in results:
        if isinstance(r, Exception):
            log.warning("persona_generation_failed", error=str(r))
        else:
            personas.append(r)

    if len(personas) < panel_size * 0.5:
        raise RuntimeError(
            f"Only {len(personas)}/{panel_size} personas generated "
            f"({len(personas)/panel_size:.0%}). Minimum threshold is 50%."
        )

    is_partial = len(personas) < panel_size
    return personas, is_partial


async def elicit_single_response(
    client: AsyncAnthropic,
    persona: dict,
    stimulus: str,
    stimulus_label: str,
    stimulus_context: str,
    image_data: dict | None = None,
) -> str | None:
    """Elicit a single persona's response to a stimulus.

    Returns response text, or None if break-character detected.
    """
    system_prompt = build_inhabitation_system_prompt(persona)
    user_prompt = build_elicitation_user_prompt(stimulus, stimulus_label, stimulus_context)

    # Build content blocks (with optional image)
    if image_data:
        content = [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": image_data["media_type"],
                    "data": image_data["base64"],
                },
            },
            {"type": "text", "text": user_prompt},
        ]
    else:
        content = user_prompt

    response = await client.messages.create(
        model=ELICITATION_MODEL,
        max_tokens=ELICITATION_MAX_TOKENS,
        system=system_prompt,
        messages=[{"role": "user", "content": content}],
    )

    response_text = response.content[0].text

    if is_break_character(response_text, persona["name"]):
        log.warning("break_character_detected", persona=persona["name"])
        return None

    return response_text


async def elicit_all_responses(
    client: AsyncAnthropic,
    personas: list[dict],
    stimulus: str,
    stimulus_label: str,
    stimulus_context: str,
    image_data: dict | None = None,
) -> list[tuple[dict, str]]:
    """Elicit responses from all personas concurrently.

    Returns list of (persona, response_text) pairs. Raises if <50% succeed.
    """
    tasks = [
        elicit_single_response(
            client=client,
            persona=p,
            stimulus=stimulus,
            stimulus_label=stimulus_label,
            stimulus_context=stimulus_context,
            image_data=image_data,
        )
        for p in personas
    ]

    results = await asyncio.gather(*tasks, return_exceptions=True)

    successful = []
    for persona, result in zip(personas, results):
        if isinstance(result, Exception):
            log.warning("elicitation_failed", persona=persona["name"], error=str(result))
        elif result is not None:
            successful.append((persona, result))

    if len(successful) < len(personas) * 0.5:
        raise RuntimeError(
            f"Only {len(successful)}/{len(personas)} responses elicited "
            f"({len(successful)/len(personas):.0%}). Minimum threshold is 50%."
        )

    return successful


async def fetch_and_encode_image(url: str) -> dict:
    """Fetch an image from HTTPS URL and base64-encode it.

    Returns dict with keys: base64, media_type. Raises on invalid URL or type.
    """
    import base64

    if not url.startswith("https://"):
        raise ValueError("Only HTTPS image URLs are supported")

    allowed_types = {"image/jpeg", "image/png", "image/gif", "image/webp"}

    async with httpx.AsyncClient(timeout=30.0) as http:
        resp = await http.get(url)
        resp.raise_for_status()

    content_type = resp.headers.get("content-type", "").split(";")[0].strip()
    if content_type not in allowed_types:
        raise ValueError(f"Unsupported image type: {content_type}")

    return {
        "base64": base64.b64encode(resp.content).decode(),
        "media_type": content_type,
    }
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /home/clsandoval/cs/cheerful/apps/backend
python -m pytest tests/ssr/test_persona.py -v
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add src/services/ssr/persona.py tests/ssr/test_persona.py
git commit -m "feat(ssr): add persona generation, elicitation, and break-character detection (TDD)"
```

---

### Task 5: Pydantic API Models

**Files:**
- Create: `src/models/api/ssr.py`

- [ ] **Step 1: Write request/response models**

Create `src/models/api/ssr.py`:

```python
"""Pydantic request/response models for SSR API endpoints."""

import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


# --- Request Models ---


class PersonaDemographicsRequest(BaseModel):
    age_min: int = Field(ge=18, le=99, default=18)
    age_max: int = Field(ge=18, le=99, default=99)
    genders: list[Literal["male", "female", "nonbinary"]] | None = None
    locations: list[str] | None = None
    income_brackets: list[Literal["low", "lower_middle", "middle", "upper_middle", "high"]] | None = None
    education_levels: list[Literal["high_school", "some_college", "bachelors", "graduate", "postgraduate"]] | None = None
    languages: list[str] = Field(default=["English"])


class PersonaPsychographicsRequest(BaseModel):
    interests: list[str] | None = None
    values: list[str] | None = None
    lifestyle_descriptors: list[str] | None = None
    media_consumption: list[str] | None = None


class PanelCreateRequest(BaseModel):
    panel_name: str | None = None
    demographics: PersonaDemographicsRequest
    psychographics: PersonaPsychographicsRequest | None = None
    product_category: str
    panel_size: int = Field(default=20, ge=5, le=50)
    custom_instructions: str | None = None


class RunCreateRequest(BaseModel):
    stimulus: str = Field(min_length=1, max_length=4000)
    stimulus_type: str
    evaluation_dimensions: list[str] = Field(
        default=["purchase_intent", "message_clarity", "overall_appeal"]
    )
    response_format: Literal["summary", "detailed", "raw"] = "summary"
    stimulus_image_url: str | None = None
    run_label: str | None = None


# --- Response Models ---


class PersonaSummaryResponse(BaseModel):
    persona_id: uuid.UUID
    index: int
    name: str
    age: int
    location: str
    occupation: str
    income_bracket: str
    education: str
    summary: str

    class Config:
        from_attributes = True


class PanelResponse(BaseModel):
    id: uuid.UUID
    panel_name: str
    product_category: str
    status: str
    panel_size: int
    actual_size: int | None
    created_at: datetime
    personas: list[PersonaSummaryResponse] = []

    class Config:
        from_attributes = True


class PanelListItemResponse(BaseModel):
    id: uuid.UUID
    panel_name: str
    product_category: str
    status: str
    actual_size: int | None
    run_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class PanelCreateAcceptedResponse(BaseModel):
    panel_id: uuid.UUID
    status: str = "generating"


class HighlightResponse(BaseModel):
    persona_name: str
    persona_id: str
    quote: str
    valence: str
    weighted_score: float


class DimensionResultResponse(BaseModel):
    dimension: str
    distribution: dict[int, int]
    mean: float
    std_dev: float
    mode: int
    confidence_interval_95: tuple[float, float]
    highlights: list[HighlightResponse]


class DimensionComparisonResponse(BaseModel):
    dimension: str
    run_a_mean: float
    run_b_mean: float
    delta_mean: float
    delta_direction: str
    significant: bool


class RunResponse(BaseModel):
    id: uuid.UUID
    panel_id: uuid.UUID
    status: str
    run_label: str | None
    stimulus: str
    stimulus_type: str
    evaluation_dimensions: list[str]
    personas_scored: int | None
    dimension_results: list[DimensionResultResponse] | None = None
    comparisons: list[DimensionComparisonResponse] | None = None
    created_at: datetime
    completed_at: datetime | None

    class Config:
        from_attributes = True


class RunCreateAcceptedResponse(BaseModel):
    run_id: uuid.UUID
    status: str = "pending"
```

- [ ] **Step 2: Commit**

```bash
git add src/models/api/ssr.py
git commit -m "feat(ssr): add Pydantic request/response models for API endpoints"
```

---

### Task 6: SQLAlchemy Database Models

**Files:**
- Create: `src/models/database/ssr.py`
- Modify: `src/models/database/__init__.py`

- [ ] **Step 1: Write SQLAlchemy models**

Create `src/models/database/ssr.py`:

```python
"""SQLAlchemy models for SSR (Synthetic Consumer Panel) tables."""

import uuid
from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from .base import Base


class SsrPanel(Base):
    __tablename__ = "ssr_panel"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("auth.users.id"), nullable=False)
    panel_name: Mapped[str] = mapped_column(Text, nullable=False)
    product_category: Mapped[str] = mapped_column(Text, nullable=False)
    demographics: Mapped[dict] = mapped_column(JSONB, nullable=False)
    psychographics: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    panel_size: Mapped[int] = mapped_column(Integer, nullable=False)
    actual_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    custom_instructions: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default="generating")
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint("status IN ('generating', 'ready', 'partial', 'failed')", name="ssr_panel_status_check"),
        Index("idx_ssr_panel_user_id", "user_id"),
        Index("idx_ssr_panel_created_at", "created_at"),
    )


class SsrPersona(Base):
    __tablename__ = "ssr_persona"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    panel_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("ssr_panel.id", ondelete="CASCADE"), nullable=False)
    persona_index: Mapped[int] = mapped_column(Integer, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    age: Mapped[int] = mapped_column(Integer, nullable=False)
    location: Mapped[str] = mapped_column(Text, nullable=False)
    occupation: Mapped[str] = mapped_column(Text, nullable=False)
    income_bracket: Mapped[str] = mapped_column(Text, nullable=False)
    education: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    full_profile: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("age >= 18 AND age <= 99", name="ssr_persona_age_check"),
        UniqueConstraint("panel_id", "persona_index", name="unique_panel_persona_index"),
        Index("idx_ssr_persona_panel_id", "panel_id"),
    )


class SsrRun(Base):
    __tablename__ = "ssr_run"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    panel_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("ssr_panel.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("auth.users.id"), nullable=False)
    run_label: Mapped[str | None] = mapped_column(Text, nullable=True)
    stimulus: Mapped[str] = mapped_column(Text, nullable=False)
    stimulus_type: Mapped[str] = mapped_column(Text, nullable=False)
    evaluation_dimensions: Mapped[list[str]] = mapped_column(ARRAY(Text), nullable=False)
    status: Mapped[str] = mapped_column(Text, nullable=False, server_default="pending")
    personas_scored: Mapped[int | None] = mapped_column(Integer, nullable=True)
    dimension_means: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    stimulus_image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint("status IN ('pending', 'running', 'completed', 'failed')", name="ssr_run_status_check"),
        Index("idx_ssr_run_panel_id", "panel_id", "created_at"),
        Index("idx_ssr_run_user_id", "user_id", "created_at"),
        Index("idx_ssr_run_status", "status"),
    )


class SsrResponse(Base):
    __tablename__ = "ssr_response"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("ssr_run.id", ondelete="CASCADE"), nullable=False)
    persona_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("ssr_persona.id", ondelete="CASCADE"), nullable=False)
    response_text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("run_id", "persona_id", name="unique_run_persona_response"),
        Index("idx_ssr_response_run_id", "run_id"),
    )


class SsrScore(Base):
    __tablename__ = "ssr_score"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    response_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("ssr_response.id", ondelete="CASCADE"), nullable=False)
    run_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("ssr_run.id", ondelete="CASCADE"), nullable=False)
    persona_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("ssr_persona.id", ondelete="CASCADE"), nullable=False)
    dimension: Mapped[str] = mapped_column(Text, nullable=False)
    hard_score: Mapped[int] = mapped_column(Integer, nullable=False)
    weighted_score: Mapped[float] = mapped_column(Float, nullable=False)
    similarities: Mapped[dict] = mapped_column(JSONB, nullable=False)
    response_embedding: Mapped[list[float] | None] = mapped_column(ARRAY(Float), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("hard_score >= 1 AND hard_score <= 5", name="ssr_score_hard_score_check"),
        UniqueConstraint("response_id", "dimension", name="unique_response_dimension_score"),
        Index("idx_ssr_score_run_id", "run_id"),
        Index("idx_ssr_score_response_id", "response_id"),
    )


class SsrAnchorSet(Base):
    __tablename__ = "ssr_anchor_set"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    dimension_name: Mapped[str] = mapped_column(Text, nullable=False)
    scale_point: Mapped[int] = mapped_column(Integer, nullable=False)
    anchor_text: Mapped[str] = mapped_column(Text, nullable=False)
    anchor_embedding: Mapped[list[float] | None] = mapped_column(ARRAY(Float), nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint("scale_point >= 1 AND scale_point <= 5", name="ssr_anchor_scale_check"),
        UniqueConstraint("dimension_name", "scale_point", "user_id", name="unique_dimension_point_user"),
        Index("idx_ssr_anchor_dimension", "dimension_name"),
    )


class SsrStimulusType(Base):
    __tablename__ = "ssr_stimulus_type"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    label: Mapped[str] = mapped_column(Text, nullable=False)
    context_sentence: Mapped[str] = mapped_column(Text, nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="true")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        UniqueConstraint("name", "user_id", name="unique_stimulus_type_name_user"),
        Index("idx_ssr_stimulus_type_name", "name"),
    )


class SsrPromptTemplate(Base):
    __tablename__ = "ssr_prompt_template"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True)
    template_type: Mapped[str] = mapped_column(Text, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    template_text: Mapped[str] = mapped_column(Text, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, nullable=False, server_default="false")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (
        CheckConstraint(
            "template_type IN ('persona_system', 'persona_user', 'inhabitation_system', 'elicitation_user')",
            name="ssr_template_type_check",
        ),
        UniqueConstraint("template_type", "name", "user_id", name="unique_template_type_name_user"),
    )
```

- [ ] **Step 2: Add models to __init__.py**

Read `src/models/database/__init__.py` and add imports for all SSR models. Add these lines:

```python
from src.models.database.ssr import (
    SsrAnchorSet,
    SsrPanel,
    SsrPersona,
    SsrPromptTemplate,
    SsrResponse,
    SsrRun,
    SsrScore,
    SsrStimulusType,
)
```

- [ ] **Step 3: Commit**

```bash
git add src/models/database/ssr.py src/models/database/__init__.py
git commit -m "feat(ssr): add SQLAlchemy models for 8 SSR tables"
```

---

### Task 7: Database Migration

**Files:**
- Create: `supabase/migrations/20260402000000_create_ssr_tables.sql`

- [ ] **Step 1: Write migration SQL**

Create `supabase/migrations/20260402000000_create_ssr_tables.sql`:

```sql
-- SSR (Synthetic Consumer Panel) tables
-- Ports the decision-orchestrator SSR schema with user_id scoping

-- Updated-at trigger function (create if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Panels
CREATE TABLE ssr_panel (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    panel_name TEXT NOT NULL,
    product_category TEXT NOT NULL,
    demographics JSONB NOT NULL,
    psychographics JSONB,
    panel_size INTEGER NOT NULL,
    actual_size INTEGER,
    custom_instructions TEXT,
    status TEXT NOT NULL DEFAULT 'generating'
        CHECK (status IN ('generating', 'ready', 'partial', 'failed')),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ssr_panel_user_id ON ssr_panel(user_id);
CREATE INDEX idx_ssr_panel_created_at ON ssr_panel(created_at DESC);
CREATE TRIGGER ssr_panel_updated_at BEFORE UPDATE ON ssr_panel
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 2. Personas
CREATE TABLE ssr_persona (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_id UUID NOT NULL REFERENCES ssr_panel(id) ON DELETE CASCADE,
    persona_index INTEGER NOT NULL,
    name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 18 AND age <= 99),
    location TEXT NOT NULL,
    occupation TEXT NOT NULL,
    income_bracket TEXT NOT NULL
        CHECK (income_bracket IN ('low', 'lower_middle', 'middle', 'upper_middle', 'high')),
    education TEXT NOT NULL
        CHECK (education IN ('high_school', 'some_college', 'bachelors', 'graduate', 'postgraduate')),
    summary TEXT NOT NULL,
    full_profile TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (panel_id, persona_index)
);

CREATE INDEX idx_ssr_persona_panel_id ON ssr_persona(panel_id);

-- 3. Runs
CREATE TABLE ssr_run (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    panel_id UUID NOT NULL REFERENCES ssr_panel(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    run_label TEXT,
    stimulus TEXT NOT NULL,
    stimulus_type TEXT NOT NULL,
    evaluation_dimensions TEXT[] NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'running', 'completed', 'failed')),
    personas_scored INTEGER,
    dimension_means JSONB,
    stimulus_image_url TEXT,
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ssr_run_panel_id ON ssr_run(panel_id, created_at DESC);
CREATE INDEX idx_ssr_run_user_id ON ssr_run(user_id, created_at DESC);
CREATE INDEX idx_ssr_run_status ON ssr_run(status);
CREATE TRIGGER ssr_run_updated_at BEFORE UPDATE ON ssr_run
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Responses
CREATE TABLE ssr_response (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    run_id UUID NOT NULL REFERENCES ssr_run(id) ON DELETE CASCADE,
    persona_id UUID NOT NULL REFERENCES ssr_persona(id) ON DELETE CASCADE,
    response_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (run_id, persona_id)
);

CREATE INDEX idx_ssr_response_run_id ON ssr_response(run_id);

-- 5. Scores
CREATE TABLE ssr_score (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    response_id UUID NOT NULL REFERENCES ssr_response(id) ON DELETE CASCADE,
    run_id UUID NOT NULL REFERENCES ssr_run(id) ON DELETE CASCADE,
    persona_id UUID NOT NULL REFERENCES ssr_persona(id) ON DELETE CASCADE,
    dimension TEXT NOT NULL,
    hard_score INTEGER NOT NULL CHECK (hard_score >= 1 AND hard_score <= 5),
    weighted_score FLOAT8 NOT NULL,
    similarities JSONB NOT NULL,
    response_embedding FLOAT8[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (response_id, dimension)
);

CREATE INDEX idx_ssr_score_run_id ON ssr_score(run_id);
CREATE INDEX idx_ssr_score_response_id ON ssr_score(response_id);

-- 6. Anchor sets (Likert anchor statements with pre-embedded vectors)
CREATE TABLE ssr_anchor_set (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,  -- NULL = global default
    dimension_name TEXT NOT NULL,
    scale_point INTEGER NOT NULL CHECK (scale_point >= 1 AND scale_point <= 5),
    anchor_text TEXT NOT NULL,
    anchor_embedding FLOAT8[],  -- 1536 elements, NULL until seeded
    is_default BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (dimension_name, scale_point, user_id)
);

CREATE INDEX idx_ssr_anchor_dimension ON ssr_anchor_set(dimension_name);

-- 7. Stimulus types
CREATE TABLE ssr_stimulus_type (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,  -- NULL = global default
    name TEXT NOT NULL,
    label TEXT NOT NULL,
    context_sentence TEXT NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (name, user_id)
);

CREATE INDEX idx_ssr_stimulus_type_name ON ssr_stimulus_type(name);

-- 8. Prompt templates
CREATE TABLE ssr_prompt_template (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,  -- NULL = global default
    template_type TEXT NOT NULL
        CHECK (template_type IN ('persona_system', 'persona_user', 'inhabitation_system', 'elicitation_user')),
    name TEXT NOT NULL,
    template_text TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (template_type, name, user_id)
);

-- Seed default stimulus types
INSERT INTO ssr_stimulus_type (user_id, name, label, context_sentence) VALUES
    (NULL, 'ad_copy', 'the ad copy', 'Imagine you''ve just seen this advertisement while browsing online.'),
    (NULL, 'headline', 'the headline', 'Imagine you''ve just read this headline in your news feed.'),
    (NULL, 'tagline', 'the tagline', 'Imagine you''ve just seen this tagline on a product or in an ad.'),
    (NULL, 'product_concept', 'the product concept', 'Imagine a friend is telling you about this new product they discovered.'),
    (NULL, 'brand_message', 'the brand message', 'Imagine you''ve encountered this brand message while browsing the brand''s website.'),
    (NULL, 'campaign_theme', 'the campaign theme', 'Imagine you''ve been exposed to a campaign built around this theme across multiple touchpoints.'),
    (NULL, 'influencer_pitch', 'the influencer pitch', 'Imagine you''ve just seen an influencer you follow share this pitch or endorsement.'),
    (NULL, 'pricing_message', 'the pricing message', 'Imagine you''re shopping and you''ve just encountered this pricing or promotional message.'),
    (NULL, 'packaging_description', 'the packaging description', 'Imagine you''re browsing a store shelf and reading the description on a product package.'),
    (NULL, 'social_caption', 'the social media caption', 'Imagine you''ve just seen this caption on a social media post while scrolling your feed.');

-- Seed default anchor statements (embeddings will be NULL until seed script runs)
INSERT INTO ssr_anchor_set (user_id, dimension_name, scale_point, anchor_text) VALUES
    -- purchase_intent
    (NULL, 'purchase_intent', 1, 'I would not buy this under any circumstances and would actively avoid it.'),
    (NULL, 'purchase_intent', 2, 'I am unlikely to buy this — it does not appeal to me enough to spend my money.'),
    (NULL, 'purchase_intent', 3, 'I might consider buying this if the conditions were right, but I''m not drawn to it strongly.'),
    (NULL, 'purchase_intent', 4, 'I would probably buy this — it appeals to me and I could see myself picking it up.'),
    (NULL, 'purchase_intent', 5, 'I would definitely buy this and would look for it the next time I shop.'),
    -- brand_favorability
    (NULL, 'brand_favorability', 1, 'This makes me think worse of the brand — it feels off-putting or inconsistent with what I expect.'),
    (NULL, 'brand_favorability', 2, 'This does not improve my impression of the brand — I feel indifferent or slightly negative.'),
    (NULL, 'brand_favorability', 3, 'This does not change how I feel about the brand — my impression is the same as before.'),
    (NULL, 'brand_favorability', 4, 'This gives me a better impression of the brand — it feels authentic and aligned with my values.'),
    (NULL, 'brand_favorability', 5, 'This makes me think much more highly of the brand — I feel genuinely positive and more loyal.'),
    -- message_clarity
    (NULL, 'message_clarity', 1, 'I have no idea what this is trying to say — the message is completely unclear or confusing.'),
    (NULL, 'message_clarity', 2, 'The message is somewhat unclear — I had to work to understand what they''re trying to communicate.'),
    (NULL, 'message_clarity', 3, 'I understand what this is saying, but it took me a moment — the communication is average.'),
    (NULL, 'message_clarity', 4, 'The message is clear and easy to follow — I understood immediately what they were communicating.'),
    (NULL, 'message_clarity', 5, 'The message is crystal clear and instantly understood — exactly what they wanted to communicate came through perfectly.'),
    -- emotional_response
    (NULL, 'emotional_response', 1, 'This leaves me completely cold — I feel nothing positive and may even feel annoyed or repelled.'),
    (NULL, 'emotional_response', 2, 'This generates very little emotional response in me — it fails to connect or engage emotionally.'),
    (NULL, 'emotional_response', 3, 'This produces a mild emotional response — I feel slightly interested or mildly positive but not moved.'),
    (NULL, 'emotional_response', 4, 'This genuinely engages me emotionally — I feel something real like warmth, excitement, or nostalgia.'),
    (NULL, 'emotional_response', 5, 'This moves me deeply — I feel strong positive emotions like joy, inspiration, or heartfelt connection.'),
    -- personal_relevance
    (NULL, 'personal_relevance', 1, 'This has absolutely nothing to do with my life — it speaks to someone completely different from me.'),
    (NULL, 'personal_relevance', 2, 'This doesn''t really speak to me — it''s for someone with a very different lifestyle or situation.'),
    (NULL, 'personal_relevance', 3, 'This is somewhat relevant to my life — I can see how it might apply, though it''s not specifically for me.'),
    (NULL, 'personal_relevance', 4, 'This speaks directly to my life — it addresses something I actually think about or deal with.'),
    (NULL, 'personal_relevance', 5, 'This feels made exactly for me — it addresses my specific situation, needs, and values precisely.'),
    -- uniqueness
    (NULL, 'uniqueness', 1, 'This feels completely generic — I''ve seen exactly this before from many other brands and nothing stands out.'),
    (NULL, 'uniqueness', 2, 'This is mostly familiar — there are small differences but nothing that really makes it stand apart.'),
    (NULL, 'uniqueness', 3, 'This is somewhat distinctive — there are elements that differ from what I usually see, though not dramatically.'),
    (NULL, 'uniqueness', 4, 'This stands out from the competition — there is something genuinely different and memorable about it.'),
    (NULL, 'uniqueness', 5, 'This is completely fresh and distinctive — I''ve never seen anything quite like it and it truly stands apart.'),
    -- trust_credibility
    (NULL, 'trust_credibility', 1, 'I find this completely unbelievable and it makes me distrust the brand — it feels manipulative or dishonest.'),
    (NULL, 'trust_credibility', 2, 'I am skeptical of this — the claims feel exaggerated or the brand feels inauthentic.'),
    (NULL, 'trust_credibility', 3, 'I neither trust nor distrust this — it is plausible but I don''t have strong confidence in the claims.'),
    (NULL, 'trust_credibility', 4, 'I find this credible and believable — the claims feel honest and the brand feels authentic.'),
    (NULL, 'trust_credibility', 5, 'I fully trust this — the claims feel completely authentic, honest, and backed by real substance.'),
    -- value_perception
    (NULL, 'value_perception', 1, 'This seems like terrible value — the price is way too high for what''s being offered.'),
    (NULL, 'value_perception', 2, 'This seems somewhat overpriced — I don''t think it''s worth what they''re asking.'),
    (NULL, 'value_perception', 3, 'The value seems fair — the price is about what I''d expect for what''s being offered.'),
    (NULL, 'value_perception', 4, 'This seems like good value — I''m getting more than I''d expect for the price.'),
    (NULL, 'value_perception', 5, 'This seems like exceptional value — the offer is clearly worth every peso and then some.'),
    -- share_worthiness
    (NULL, 'share_worthiness', 1, 'I would not share this with anyone — it''s not interesting or relevant enough for me to pass on.'),
    (NULL, 'share_worthiness', 2, 'I''m unlikely to share this — it''s not compelling enough to send to my friends or family.'),
    (NULL, 'share_worthiness', 3, 'I might share this with one or two people in specific situations, but not broadly.'),
    (NULL, 'share_worthiness', 4, 'I would share this with friends or family — it''s something they''d find useful or interesting.'),
    (NULL, 'share_worthiness', 5, 'I would immediately share this widely — it''s exactly the kind of content I love to pass on.'),
    -- overall_appeal
    (NULL, 'overall_appeal', 1, 'This is deeply unappealing — I have a strong negative reaction to the overall execution.'),
    (NULL, 'overall_appeal', 2, 'This doesn''t appeal to me — the overall impression is weak or off-putting.'),
    (NULL, 'overall_appeal', 3, 'This is neither appealing nor unappealing — it''s average and leaves no strong impression.'),
    (NULL, 'overall_appeal', 4, 'This appeals to me — the overall execution is strong and leaves a positive impression.'),
    (NULL, 'overall_appeal', 5, 'This is highly appealing — the overall execution is excellent and I have a very strong positive reaction.');
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/20260402000000_create_ssr_tables.sql
git commit -m "feat(ssr): add database migration for 8 SSR tables with seed data"
```

---

### Task 8: SSR Repository

**Files:**
- Create: `src/repositories/ssr.py`

- [ ] **Step 1: Write repository**

Create `src/repositories/ssr.py`:

```python
"""Repository for all SSR database operations."""

import uuid
from datetime import UTC, datetime

import numpy as np
from sqlalchemy import select, update
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from src.models.database.ssr import (
    SsrAnchorSet,
    SsrPanel,
    SsrPersona,
    SsrResponse,
    SsrRun,
    SsrScore,
    SsrStimulusType,
)
from src.repositories.base import BaseRepository


class SsrRepository(BaseRepository[SsrPanel]):
    def __init__(self, db: Session):
        super().__init__(db, SsrPanel)

    # --- Panels ---

    def create_panel(
        self,
        user_id: uuid.UUID,
        panel_name: str,
        product_category: str,
        demographics: dict,
        psychographics: dict | None,
        panel_size: int,
        custom_instructions: str | None,
    ) -> SsrPanel:
        panel = SsrPanel(
            user_id=user_id,
            panel_name=panel_name,
            product_category=product_category,
            demographics=demographics,
            psychographics=psychographics,
            panel_size=panel_size,
            custom_instructions=custom_instructions,
        )
        self.db.add(panel)
        self.db.flush()
        self.db.refresh(panel)
        return panel

    def get_panel(self, panel_id: uuid.UUID, user_id: uuid.UUID) -> SsrPanel | None:
        stmt = (
            select(SsrPanel)
            .where(SsrPanel.id == panel_id, SsrPanel.user_id == user_id, SsrPanel.deleted_at.is_(None))
        )
        return self.db.execute(stmt).scalar_one_or_none()

    def list_panels(self, user_id: uuid.UUID, limit: int = 20, offset: int = 0) -> list[SsrPanel]:
        stmt = (
            select(SsrPanel)
            .where(SsrPanel.user_id == user_id, SsrPanel.deleted_at.is_(None))
            .order_by(SsrPanel.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(self.db.execute(stmt).scalars())

    def update_panel_status(self, panel_id: uuid.UUID, status: str, actual_size: int | None = None) -> None:
        values: dict = {"status": status}
        if actual_size is not None:
            values["actual_size"] = actual_size
        self.db.execute(update(SsrPanel).where(SsrPanel.id == panel_id).values(**values))

    def soft_delete_panel(self, panel_id: uuid.UUID) -> None:
        self.db.execute(
            update(SsrPanel)
            .where(SsrPanel.id == panel_id)
            .values(deleted_at=datetime.now(UTC))
        )

    # --- Personas ---

    def bulk_create_personas(self, panel_id: uuid.UUID, personas: list[dict]) -> list[SsrPersona]:
        db_personas = []
        for p in personas:
            persona = SsrPersona(
                id=uuid.UUID(p["persona_id"]) if isinstance(p.get("persona_id"), str) else p.get("persona_id", uuid.uuid4()),
                panel_id=panel_id,
                persona_index=p["index"],
                name=p["name"],
                age=p["age"],
                location=p["location"],
                occupation=p["occupation"],
                income_bracket=p["income_bracket"],
                education=p["education"],
                summary=p["summary"],
                full_profile=p["full_profile"],
            )
            self.db.add(persona)
            db_personas.append(persona)
        self.db.flush()
        return db_personas

    def get_personas(self, panel_id: uuid.UUID) -> list[SsrPersona]:
        stmt = (
            select(SsrPersona)
            .where(SsrPersona.panel_id == panel_id)
            .order_by(SsrPersona.persona_index)
        )
        return list(self.db.execute(stmt).scalars())

    # --- Runs ---

    def create_run(
        self,
        panel_id: uuid.UUID,
        user_id: uuid.UUID,
        stimulus: str,
        stimulus_type: str,
        evaluation_dimensions: list[str],
        stimulus_image_url: str | None = None,
        run_label: str | None = None,
    ) -> SsrRun:
        run = SsrRun(
            panel_id=panel_id,
            user_id=user_id,
            stimulus=stimulus,
            stimulus_type=stimulus_type,
            evaluation_dimensions=evaluation_dimensions,
            stimulus_image_url=stimulus_image_url,
            run_label=run_label,
        )
        self.db.add(run)
        self.db.flush()
        self.db.refresh(run)
        return run

    def get_run(self, run_id: uuid.UUID, user_id: uuid.UUID) -> SsrRun | None:
        stmt = select(SsrRun).where(SsrRun.id == run_id, SsrRun.user_id == user_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def update_run_status(
        self,
        run_id: uuid.UUID,
        status: str,
        personas_scored: int | None = None,
        dimension_means: dict | None = None,
        error_message: str | None = None,
    ) -> None:
        values: dict = {"status": status}
        if status == "running":
            values["started_at"] = datetime.now(UTC)
        if status in ("completed", "failed"):
            values["completed_at"] = datetime.now(UTC)
        if personas_scored is not None:
            values["personas_scored"] = personas_scored
        if dimension_means is not None:
            values["dimension_means"] = dimension_means
        if error_message is not None:
            values["error_message"] = error_message
        self.db.execute(update(SsrRun).where(SsrRun.id == run_id).values(**values))

    # --- Responses & Scores ---

    def bulk_create_responses(self, run_id: uuid.UUID, responses: list[dict]) -> list[SsrResponse]:
        db_responses = []
        for r in responses:
            resp = SsrResponse(
                run_id=run_id,
                persona_id=uuid.UUID(r["persona_id"]) if isinstance(r["persona_id"], str) else r["persona_id"],
                response_text=r["response_text"],
            )
            self.db.add(resp)
            db_responses.append(resp)
        self.db.flush()
        for r in db_responses:
            self.db.refresh(r)
        return db_responses

    def bulk_create_scores(self, scores: list[dict]) -> None:
        for s in scores:
            score = SsrScore(
                response_id=s["response_id"],
                run_id=s["run_id"],
                persona_id=s["persona_id"],
                dimension=s["dimension"],
                hard_score=s["hard_score"],
                weighted_score=s["weighted_score"],
                similarities=s["similarities"],
                response_embedding=s.get("response_embedding"),
            )
            self.db.add(score)
        self.db.flush()

    def get_run_scores(self, run_id: uuid.UUID) -> list[SsrScore]:
        stmt = select(SsrScore).where(SsrScore.run_id == run_id)
        return list(self.db.execute(stmt).scalars())

    def get_run_responses(self, run_id: uuid.UUID) -> list[SsrResponse]:
        stmt = select(SsrResponse).where(SsrResponse.run_id == run_id)
        return list(self.db.execute(stmt).scalars())

    # --- Anchors ---

    def get_anchor_sets(self, dimensions: list[str], user_id: uuid.UUID | None = None) -> dict[str, dict[int, dict]]:
        """Load anchor sets for dimensions. User-specific first, then global defaults."""
        stmt = (
            select(SsrAnchorSet)
            .where(
                SsrAnchorSet.dimension_name.in_(dimensions),
                SsrAnchorSet.anchor_embedding.isnot(None),
            )
            .order_by(SsrAnchorSet.dimension_name, SsrAnchorSet.scale_point)
        )
        rows = list(self.db.execute(stmt).scalars())

        result: dict[str, dict[int, dict]] = {}
        for row in rows:
            dim = row.dimension_name
            # User-specific overrides global
            if dim not in result:
                result[dim] = {}
            # Skip global if user-specific exists
            if row.user_id is None and row.scale_point in result[dim]:
                continue
            if row.user_id is not None and row.user_id != user_id:
                continue
            result[dim][row.scale_point] = {
                "statement": row.anchor_text,
                "embedding": np.array(row.anchor_embedding, dtype=np.float32),
            }

        return result

    # --- Stimulus Types ---

    def get_stimulus_type(self, name: str, user_id: uuid.UUID | None = None) -> SsrStimulusType | None:
        # Try user-specific first
        if user_id:
            stmt = select(SsrStimulusType).where(SsrStimulusType.name == name, SsrStimulusType.user_id == user_id)
            row = self.db.execute(stmt).scalar_one_or_none()
            if row:
                return row
        # Fall back to global
        stmt = select(SsrStimulusType).where(SsrStimulusType.name == name, SsrStimulusType.user_id.is_(None))
        return self.db.execute(stmt).scalar_one_or_none()
```

- [ ] **Step 2: Commit**

```bash
git add src/repositories/ssr.py
git commit -m "feat(ssr): add SSR repository with panel, persona, run, score, and anchor operations"
```

---

### Task 9: Pipeline Orchestration Service

**Files:**
- Create: `src/services/ssr/__init__.py` (overwrite the stub)

- [ ] **Step 1: Write the pipeline service**

Overwrite `src/services/ssr/__init__.py`:

```python
"""SSR pipeline service — ties together persona generation, elicitation, scoring.

Public API:
- create_panel_async(db, user_id, request) -> panel_id
- run_pipeline_async(db, user_id, run_id) -> None (updates DB)
- get_run_results(db, user_id, run_id, comparison_run_id) -> dict
"""

import asyncio
import uuid

import numpy as np
import structlog
from anthropic import AsyncAnthropic
from openai import AsyncOpenAI

from src.core.config import settings
from src.core.database import get_db_session_context
from src.repositories.ssr import SsrRepository
from src.services.ssr.persona import (
    elicit_all_responses,
    fetch_and_encode_image,
    generate_panel_personas,
)
from src.services.ssr.scoring import (
    aggregate_dimension_scores,
    compute_dimension_comparison,
    embed_texts,
    score_against_anchors,
)

log = structlog.get_logger()


async def create_panel_background(
    panel_id: uuid.UUID,
    user_id: uuid.UUID,
    demographics: dict,
    psychographics: dict | None,
    product_category: str,
    panel_size: int,
    custom_instructions: str | None,
) -> None:
    """Background task: generate personas and update panel status."""
    anthropic = AsyncAnthropic()

    try:
        personas, is_partial = await generate_panel_personas(
            client=anthropic,
            panel_size=panel_size,
            demographics=demographics,
            psychographics=psychographics,
            product_category=product_category,
            custom_instructions=custom_instructions,
        )

        with get_db_session_context() as db:
            repo = SsrRepository(db)
            repo.bulk_create_personas(panel_id, personas)
            status = "partial" if is_partial else "ready"
            repo.update_panel_status(panel_id, status, actual_size=len(personas))

        log.info("panel_created", panel_id=str(panel_id), personas=len(personas), status=status)

    except Exception as e:
        log.error("panel_creation_failed", panel_id=str(panel_id), error=str(e))
        with get_db_session_context() as db:
            repo = SsrRepository(db)
            repo.update_panel_status(panel_id, "failed")


async def run_pipeline_background(
    run_id: uuid.UUID,
    panel_id: uuid.UUID,
    user_id: uuid.UUID,
    stimulus: str,
    stimulus_type_name: str,
    evaluation_dimensions: list[str],
    stimulus_image_url: str | None,
) -> None:
    """Background task: run the full SSR pipeline and update run status."""
    anthropic = AsyncAnthropic()
    openai = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    try:
        # Update status to running
        with get_db_session_context() as db:
            repo = SsrRepository(db)
            repo.update_run_status(run_id, "running")

            # Load personas
            personas_db = repo.get_personas(panel_id)
            personas = [
                {
                    "persona_id": str(p.id),
                    "name": p.name,
                    "age": p.age,
                    "location": p.location,
                    "occupation": p.occupation,
                    "full_profile": p.full_profile,
                }
                for p in personas_db
            ]

            # Load stimulus type
            stim_type = repo.get_stimulus_type(stimulus_type_name, user_id)
            if not stim_type:
                raise ValueError(f"Unknown stimulus type: {stimulus_type_name}")
            stimulus_label = stim_type.label
            stimulus_context = stim_type.context_sentence

            # Load anchor sets
            anchor_sets = repo.get_anchor_sets(evaluation_dimensions, user_id)
            missing_dims = set(evaluation_dimensions) - set(anchor_sets.keys())
            if missing_dims:
                raise ValueError(f"No anchor sets found for dimensions: {missing_dims}")

        # Fetch image if provided
        image_data = None
        if stimulus_image_url:
            image_data = await fetch_and_encode_image(stimulus_image_url)

        # Stage 1: Elicit responses
        log.info("ssr_eliciting", run_id=str(run_id), personas=len(personas))
        response_pairs = await elicit_all_responses(
            client=anthropic,
            personas=personas,
            stimulus=stimulus,
            stimulus_label=stimulus_label,
            stimulus_context=stimulus_context,
            image_data=image_data,
        )

        # Stage 2: Embed all responses
        log.info("ssr_embedding", run_id=str(run_id), responses=len(response_pairs))
        response_texts = [text for _, text in response_pairs]
        embeddings = await embed_texts(openai, response_texts)

        # Stage 3: Score against anchors
        log.info("ssr_scoring", run_id=str(run_id))
        all_scores_for_db = []
        all_responses_for_db = []
        dimension_score_lists: dict[str, list[dict]] = {d: [] for d in evaluation_dimensions}

        for (persona, response_text), embedding in zip(response_pairs, embeddings):
            all_responses_for_db.append({
                "persona_id": persona["persona_id"],
                "response_text": response_text,
            })

            for dim in evaluation_dimensions:
                anchor_embs = {
                    pt: info["embedding"]
                    for pt, info in anchor_sets[dim].items()
                }
                hard, weighted, sims = score_against_anchors(embedding, anchor_embs)

                all_scores_for_db.append({
                    "persona_id": persona["persona_id"],
                    "dimension": dim,
                    "hard_score": hard,
                    "weighted_score": weighted,
                    "similarities": {str(k): v for k, v in sims.items()},
                    "response_embedding": embedding.tolist(),
                })

                dimension_score_lists[dim].append({
                    "hard_score": hard,
                    "weighted_score": weighted,
                    "response_text": response_text,
                    "persona_name": persona["name"],
                    "persona_id": persona["persona_id"],
                })

        # Stage 4: Aggregate
        log.info("ssr_aggregating", run_id=str(run_id))
        dimension_means = {}
        for dim in evaluation_dimensions:
            agg = aggregate_dimension_scores(dimension_score_lists[dim])
            dimension_means[dim] = agg["mean"]

        # Stage 5: Persist to DB
        with get_db_session_context() as db:
            repo = SsrRepository(db)

            # Create responses and get IDs
            db_responses = repo.bulk_create_responses(run_id, all_responses_for_db)

            # Map persona_id -> response_id
            persona_to_response = {
                str(r.persona_id): r.id for r in db_responses
            }

            # Add response_id and run_id to scores
            for score_dict in all_scores_for_db:
                pid = score_dict["persona_id"]
                score_dict["response_id"] = persona_to_response[pid]
                score_dict["run_id"] = run_id
                score_dict["persona_id"] = uuid.UUID(pid) if isinstance(pid, str) else pid

            repo.bulk_create_scores(all_scores_for_db)

            repo.update_run_status(
                run_id,
                "completed",
                personas_scored=len(response_pairs),
                dimension_means=dimension_means,
            )

        log.info("ssr_pipeline_completed", run_id=str(run_id), personas_scored=len(response_pairs))

    except Exception as e:
        log.error("ssr_pipeline_failed", run_id=str(run_id), error=str(e))
        with get_db_session_context() as db:
            repo = SsrRepository(db)
            repo.update_run_status(run_id, "failed", error_message=str(e))


def build_run_results(
    db_run,
    db_scores: list,
    db_responses: list,
    db_personas: list,
    evaluation_dimensions: list[str],
) -> dict:
    """Build structured results from DB records."""
    # Map persona_id -> name
    persona_names = {str(p.id): p.name for p in db_personas}
    # Map persona_id -> response_text
    response_texts = {str(r.persona_id): r.response_text for r in db_responses}

    # Group scores by dimension
    dim_scores: dict[str, list[dict]] = {d: [] for d in evaluation_dimensions}
    for s in db_scores:
        if s.dimension in dim_scores:
            dim_scores[s.dimension].append({
                "hard_score": s.hard_score,
                "weighted_score": s.weighted_score,
                "response_text": response_texts.get(str(s.persona_id), ""),
                "persona_name": persona_names.get(str(s.persona_id), "Unknown"),
                "persona_id": str(s.persona_id),
            })

    # Aggregate each dimension
    dimension_results = []
    for dim in evaluation_dimensions:
        if dim_scores[dim]:
            agg = aggregate_dimension_scores(dim_scores[dim])
            agg["dimension"] = dim
            dimension_results.append(agg)

    return {
        "run_id": str(db_run.id),
        "panel_id": str(db_run.panel_id),
        "status": db_run.status,
        "run_label": db_run.run_label,
        "stimulus": db_run.stimulus,
        "stimulus_type": db_run.stimulus_type,
        "evaluation_dimensions": list(db_run.evaluation_dimensions),
        "personas_scored": db_run.personas_scored,
        "dimension_results": dimension_results,
        "created_at": db_run.created_at,
        "completed_at": db_run.completed_at,
    }
```

- [ ] **Step 2: Commit**

```bash
git add src/services/ssr/__init__.py
git commit -m "feat(ssr): add pipeline orchestration service with background task handlers"
```

---

### Task 10: API Routes

**Files:**
- Create: `src/api/route/ssr.py`
- Modify: `src/api/router.py`

- [ ] **Step 1: Write the route file**

Create `src/api/route/ssr.py`:

```python
"""SSR (Synthetic Consumer Panel) API endpoints.

All endpoints are async with polling — creation and runs return immediately,
background tasks do the heavy work, clients poll for status.
"""

import uuid

import structlog
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query

from src.api.dependencies.auth import get_current_user_or_api_key
from src.core.database import get_db_session_context
from src.models.api.ssr import (
    DimensionComparisonResponse,
    DimensionResultResponse,
    HighlightResponse,
    PanelCreateAcceptedResponse,
    PanelCreateRequest,
    PanelListItemResponse,
    PanelResponse,
    PersonaSummaryResponse,
    RunCreateAcceptedResponse,
    RunCreateRequest,
    RunResponse,
)
from src.repositories.ssr import SsrRepository
from src.services.ssr import (
    build_run_results,
    create_panel_background,
    run_pipeline_background,
)
from src.services.ssr.scoring import (
    aggregate_dimension_scores,
    compute_dimension_comparison,
)

log = structlog.get_logger()
router = APIRouter(prefix="/ssr", tags=["ssr"])


@router.post("/panels", response_model=PanelCreateAcceptedResponse, status_code=202)
async def create_panel(
    request: PanelCreateRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user_or_api_key),
):
    """Create a new consumer panel. Returns immediately; personas are generated in background."""
    user_id = uuid.UUID(current_user["user_id"])
    panel_name = request.panel_name or f"{request.product_category} panel"

    with get_db_session_context() as db:
        repo = SsrRepository(db)
        panel = repo.create_panel(
            user_id=user_id,
            panel_name=panel_name,
            product_category=request.product_category,
            demographics=request.demographics.model_dump(),
            psychographics=request.psychographics.model_dump() if request.psychographics else None,
            panel_size=request.panel_size,
            custom_instructions=request.custom_instructions,
        )
        panel_id = panel.id

    # BackgroundTasks can run async functions directly in FastAPI
    background_tasks.add_task(
        create_panel_background,
        panel_id=panel_id,
        user_id=user_id,
        demographics=request.demographics.model_dump(),
        psychographics=request.psychographics.model_dump() if request.psychographics else None,
        product_category=request.product_category,
        panel_size=request.panel_size,
        custom_instructions=request.custom_instructions,
    )

    return PanelCreateAcceptedResponse(panel_id=panel_id)


@router.get("/panels", response_model=list[PanelListItemResponse])
async def list_panels(
    limit: int = Query(default=20, ge=1, le=50),
    offset: int = Query(default=0, ge=0),
    current_user: dict = Depends(get_current_user_or_api_key),
):
    """List consumer panels for the authenticated user."""
    user_id = uuid.UUID(current_user["user_id"])

    with get_db_session_context() as db:
        repo = SsrRepository(db)
        panels = repo.list_panels(user_id, limit, offset)

        return [
            PanelListItemResponse(
                id=p.id,
                panel_name=p.panel_name,
                product_category=p.product_category,
                status=p.status,
                actual_size=p.actual_size,
                run_count=0,
                created_at=p.created_at,
            )
            for p in panels
        ]


@router.get("/panels/{panel_id}", response_model=PanelResponse)
async def get_panel(
    panel_id: uuid.UUID,
    current_user: dict = Depends(get_current_user_or_api_key),
):
    """Get panel details with personas. Use for polling panel creation status."""
    user_id = uuid.UUID(current_user["user_id"])

    with get_db_session_context() as db:
        repo = SsrRepository(db)
        panel = repo.get_panel(panel_id, user_id)

        if not panel:
            raise HTTPException(status_code=404, detail="Panel not found")

        personas = []
        if panel.status in ("ready", "partial"):
            db_personas = repo.get_personas(panel_id)
            personas = [
                PersonaSummaryResponse(
                    persona_id=p.id,
                    index=p.persona_index,
                    name=p.name,
                    age=p.age,
                    location=p.location,
                    occupation=p.occupation,
                    income_bracket=p.income_bracket,
                    education=p.education,
                    summary=p.summary,
                )
                for p in db_personas
            ]

        return PanelResponse(
            id=panel.id,
            panel_name=panel.panel_name,
            product_category=panel.product_category,
            status=panel.status,
            panel_size=panel.panel_size,
            actual_size=panel.actual_size,
            created_at=panel.created_at,
            personas=personas,
        )


@router.delete("/panels/{panel_id}", status_code=204)
async def delete_panel(
    panel_id: uuid.UUID,
    current_user: dict = Depends(get_current_user_or_api_key),
):
    """Soft-delete a panel."""
    user_id = uuid.UUID(current_user["user_id"])

    with get_db_session_context() as db:
        repo = SsrRepository(db)
        panel = repo.get_panel(panel_id, user_id)
        if not panel:
            raise HTTPException(status_code=404, detail="Panel not found")
        repo.soft_delete_panel(panel_id)


@router.post("/panels/{panel_id}/runs", response_model=RunCreateAcceptedResponse, status_code=202)
async def create_run(
    panel_id: uuid.UUID,
    request: RunCreateRequest,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user_or_api_key),
):
    """Start a stimulus run against a panel. Returns immediately; pipeline runs in background."""
    user_id = uuid.UUID(current_user["user_id"])

    with get_db_session_context() as db:
        repo = SsrRepository(db)
        panel = repo.get_panel(panel_id, user_id)
        if not panel:
            raise HTTPException(status_code=404, detail="Panel not found")
        if panel.status not in ("ready", "partial"):
            raise HTTPException(status_code=400, detail=f"Panel status is '{panel.status}', must be 'ready' or 'partial'")

        run = repo.create_run(
            panel_id=panel_id,
            user_id=user_id,
            stimulus=request.stimulus,
            stimulus_type=request.stimulus_type,
            evaluation_dimensions=request.evaluation_dimensions,
            stimulus_image_url=request.stimulus_image_url,
            run_label=request.run_label,
        )
        run_id = run.id

    background_tasks.add_task(
        run_pipeline_background,
        run_id=run_id,
        panel_id=panel_id,
        user_id=user_id,
        stimulus=request.stimulus,
        stimulus_type_name=request.stimulus_type,
        evaluation_dimensions=request.evaluation_dimensions,
        stimulus_image_url=request.stimulus_image_url,
    )

    return RunCreateAcceptedResponse(run_id=run_id)


@router.get("/runs/{run_id}", response_model=RunResponse)
async def get_run(
    run_id: uuid.UUID,
    comparison_run_id: uuid.UUID | None = Query(default=None),
    current_user: dict = Depends(get_current_user_or_api_key),
):
    """Get run status and results. Use for polling run completion. Optionally compare with another run."""
    user_id = uuid.UUID(current_user["user_id"])

    with get_db_session_context() as db:
        repo = SsrRepository(db)
        run = repo.get_run(run_id, user_id)
        if not run:
            raise HTTPException(status_code=404, detail="Run not found")

        dimension_results = None
        comparisons = None

        if run.status == "completed":
            scores = repo.get_run_scores(run_id)
            responses = repo.get_run_responses(run_id)
            personas = repo.get_personas(run.panel_id)

            results = build_run_results(run, scores, responses, personas, list(run.evaluation_dimensions))
            dimension_results = [
                DimensionResultResponse(
                    dimension=d["dimension"],
                    distribution=d["distribution"],
                    mean=d["mean"],
                    std_dev=d["std_dev"],
                    mode=d["mode"],
                    confidence_interval_95=d["confidence_interval_95"],
                    highlights=[HighlightResponse(**h) for h in d["highlights"]],
                )
                for d in results["dimension_results"]
            ]

            # Comparison if requested
            if comparison_run_id:
                comp_run = repo.get_run(comparison_run_id, user_id)
                if comp_run and comp_run.status == "completed":
                    comp_scores = repo.get_run_scores(comparison_run_id)
                    comp_responses = repo.get_run_responses(comparison_run_id)
                    comp_personas = repo.get_personas(comp_run.panel_id)
                    comp_results = build_run_results(
                        comp_run, comp_scores, comp_responses, comp_personas,
                        list(comp_run.evaluation_dimensions),
                    )

                    # Build comparisons for shared dimensions
                    results_a = {d["dimension"]: d for d in results["dimension_results"]}
                    results_b = {d["dimension"]: d for d in comp_results["dimension_results"]}
                    shared_dims = set(results_a.keys()) & set(results_b.keys())

                    comparisons = []
                    for dim in shared_dims:
                        comp = compute_dimension_comparison(results_a[dim], results_b[dim])
                        comparisons.append(DimensionComparisonResponse(
                            dimension=dim,
                            run_a_mean=results_a[dim]["mean"],
                            run_b_mean=results_b[dim]["mean"],
                            delta_mean=comp["delta_mean"],
                            delta_direction=comp["delta_direction"],
                            significant=comp["significant"],
                        ))

        return RunResponse(
            id=run.id,
            panel_id=run.panel_id,
            status=run.status,
            run_label=run.run_label,
            stimulus=run.stimulus,
            stimulus_type=run.stimulus_type,
            evaluation_dimensions=list(run.evaluation_dimensions),
            personas_scored=run.personas_scored,
            dimension_results=dimension_results,
            comparisons=comparisons,
            created_at=run.created_at,
            completed_at=run.completed_at,
        )
```

- [ ] **Step 2: Register routes in router.py**

Add to `src/api/router.py`:

```python
from src.api.route.ssr import router as ssr_router
```

And in the include section:

```python
api_router.include_router(ssr_router, prefix="/v1", tags=["ssr"])
```

- [ ] **Step 3: Commit**

```bash
git add src/api/route/ssr.py src/api/router.py
git commit -m "feat(ssr): add 6 API endpoints with async background tasks and polling"
```

---

### Task 11: Anchor Embedding Seed Script

**Files:**
- Create: `scripts/seed_ssr_anchors.py`

- [ ] **Step 1: Write the seed script**

Create `scripts/seed_ssr_anchors.py`:

```python
"""Seed SSR anchor embeddings.

Reads ssr_anchor_set rows with NULL embeddings, embeds via OpenAI
text-embedding-3-small, and writes embeddings back.

Usage: python -m scripts.seed_ssr_anchors
"""

import sys

from openai import OpenAI
from sqlalchemy import select, update

from src.core.config import settings
from src.core.database import get_db_session_context
from src.models.database.ssr import SsrAnchorSet
from src.services.ssr.constants import EMBEDDING_MODEL


def main():
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    with get_db_session_context() as db:
        # Load anchors with NULL embeddings
        stmt = select(SsrAnchorSet).where(SsrAnchorSet.anchor_embedding.is_(None))
        rows = list(db.execute(stmt).scalars())

        if not rows:
            print("No anchors need embedding. All done.")
            return

        print(f"Embedding {len(rows)} anchor statements...")

        # Batch embed (OpenAI supports up to 2048 per call)
        texts = [r.anchor_text for r in rows]
        response = client.embeddings.create(model=EMBEDDING_MODEL, input=texts)

        # Sort by index
        sorted_data = sorted(response.data, key=lambda d: d.index)

        # Update each row
        for row, embed_data in zip(rows, sorted_data):
            db.execute(
                update(SsrAnchorSet)
                .where(SsrAnchorSet.id == row.id)
                .values(anchor_embedding=embed_data.embedding)
            )

        print(f"Updated {len(rows)} anchor embeddings successfully.")


if __name__ == "__main__":
    main()
```

- [ ] **Step 2: Run it** (after migration is applied)

```bash
cd /home/clsandoval/cs/cheerful/apps/backend
python -m scripts.seed_ssr_anchors
```

Expected: "Embedding 50 anchor statements..." → "Updated 50 anchor embeddings successfully."

- [ ] **Step 3: Commit**

```bash
git add scripts/seed_ssr_anchors.py
git commit -m "feat(ssr): add anchor embedding seed script"
```

---

### Task 12: NanoClaw Skill

**Files:**
- Create: `automations/nanoclaw/container/skills/cheerful/ssr-panel/SKILL.md`

Note: This file lives in the monorepo, not the cheerful repo.

- [ ] **Step 1: Write the SKILL.md**

Create `/home/clsandoval/cs/monorepo/automations/nanoclaw/container/skills/cheerful/ssr-panel/SKILL.md`:

```markdown
---
name: ssr-panel
description: Run synthetic consumer panels to test marketing assets before campaign launch
---

# SSR Consumer Panel

Test ad copy, influencer pitches, headlines, and other marketing assets against AI-generated consumer personas. Get quantitative Likert scores and qualitative reactions in seconds.

Use this when a user wants to:
- Test ad copy or messaging before launch
- Get consumer feedback on a campaign theme
- Compare two versions of a headline or pitch (A/B test)
- Validate influencer messaging with a target audience

## Setup (once per session)

```python
import json, os, urllib.request, urllib.error

BACKEND_URL = os.environ.get("CHEERFUL_BACKEND_URL", "").rstrip("/")

def _get_auth_token():
    """Get JWT token via admin magic link flow (same as cheerful-api)."""
    from supabase import create_client
    sb = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
    # Use the client's email from CLAUDE.md CLIENT_IDS
    client_email = os.environ.get("CLIENT_EMAIL", "")
    link = sb.auth.admin.generate_link({"type": "magiclink", "email": client_email})
    token_resp = sb.auth.verify_otp({"token_hash": link.properties.hashed_token, "type": "magiclink"})
    return token_resp.session.access_token

AUTH_TOKEN = _get_auth_token()

def ssr_request(method, path, body=None):
    """Make authenticated request to SSR API."""
    url = f"{BACKEND_URL}/api/v1/ssr{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Authorization", f"Bearer {AUTH_TOKEN}")
    req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        raise RuntimeError(f"SSR API error {e.code}: {error_body}")
```

## Flow

### 1. Check for existing brief data

Before asking the user about demographics, check the campaign/brief data:

```python
# Query campaign table for the client's campaigns
# Look for brief content, target audience info, product category
# Use cheerful-supabase skill helpers for this
```

If brief data contains target audience information (demographics, psychographics, product category), use it as a starting point. Present what you found and ask the user to confirm or adjust.

### 2. Build panel spec (conversational)

Walk through the panel spec one question at a time. Pre-fill from brief data where available:

1. **Product category** — e.g., "skincare", "fast food", "fitness apparel"
2. **Demographics:**
   - Age range (min-max, e.g., 18-35)
   - Genders (male, female, nonbinary, or any)
   - Locations (countries, cities, regions)
   - Income brackets (low, lower_middle, middle, upper_middle, high)
   - Education levels (high_school, some_college, bachelors, graduate, postgraduate)
   - Languages (default: English)
3. **Psychographics** (optional but valuable):
   - Interests/hobbies
   - Core values
   - Lifestyle descriptors
   - Media consumption habits
4. **Panel size** — default 20, range 5-50

### 3. Create panel

```python
result = ssr_request("POST", "/panels", {
    "panel_name": "Skincare Gen Z Panel",  # descriptive name
    "demographics": {
        "age_min": 18,
        "age_max": 25,
        "genders": ["female", "nonbinary"],
        "locations": ["Metro Manila", "Cebu"],
        "income_brackets": ["low", "lower_middle", "middle"],
        "education_levels": ["some_college", "bachelors"],
        "languages": ["English", "Filipino"]
    },
    "psychographics": {
        "interests": ["skincare", "K-beauty", "TikTok trends"],
        "values": ["self-expression", "affordability"],
        "lifestyle_descriptors": ["college student", "budget-conscious"],
        "media_consumption": ["TikTok", "Instagram", "YouTube"]
    },
    "product_category": "affordable skincare",
    "panel_size": 20
})
panel_id = result["panel_id"]
```

### 4. Poll until ready

```python
import time
while True:
    panel = ssr_request("GET", f"/panels/{panel_id}")
    if panel["status"] in ("ready", "partial"):
        break
    if panel["status"] == "failed":
        raise RuntimeError("Panel creation failed")
    time.sleep(5)
```

Tell the user the panel is ready and show a summary of the personas.

### 5. Run stimulus test

Ask the user for:
- The stimulus text (ad copy, headline, etc.)
- Stimulus type: ad_copy, headline, tagline, product_concept, brand_message, campaign_theme, influencer_pitch, pricing_message, packaging_description, social_caption
- Which dimensions to evaluate (default: purchase_intent, message_clarity, overall_appeal)
- Optional: image URL, run label

```python
run = ssr_request("POST", f"/panels/{panel_id}/runs", {
    "stimulus": "Try our new glow serum — K-beauty inspired, locally made, only P299!",
    "stimulus_type": "ad_copy",
    "evaluation_dimensions": ["purchase_intent", "message_clarity", "emotional_response", "personal_relevance", "overall_appeal"],
    "run_label": "Version A — price-led"
})
run_id = run["run_id"]
```

### 6. Poll until complete

```python
while True:
    result = ssr_request("GET", f"/runs/{run_id}")
    if result["status"] == "completed":
        break
    if result["status"] == "failed":
        raise RuntimeError("Run failed")
    time.sleep(5)
```

### 7. Present results

Format results clearly for the user. For each dimension show:
- **Mean score** (out of 5)
- **Distribution** — how many personas scored 1-5
- **Top quotes** — positive and negative highlights with persona names

Example output format:
```
📊 Panel Results: "Version A — price-led" (18/20 personas scored)

Purchase Intent: 3.72/5
  ▁▂▅▇▃ (1:1  2:2  3:5  4:8  5:2)
  ✅ "I would definitely buy this — P299 is a steal for K-beauty!" — Maria, 22
  ❌ "I don't trust 'locally made' claims. Would need to see reviews first." — Rosa, 34

Message Clarity: 4.1/5
  ▁▁▃▇▅ (1:0  2:1  3:3  4:9  5:5)
  ...
```

### 8. A/B Comparison (optional)

If the user wants to compare two versions, run a second stimulus against the same panel, then retrieve with comparison:

```python
# After running both versions
result = ssr_request("GET", f"/runs/{run_id_b}?comparison_run_id={run_id_a}")
# result["comparisons"] contains delta_mean, direction, significance per dimension
```

Present comparison as:
```
📊 A/B Comparison

Purchase Intent: A=3.72 → B=4.01 (↑ +0.29) — Not statistically significant
Message Clarity: A=4.10 → B=3.85 (↓ -0.25) — Not statistically significant
```

## Available Dimensions

| Dimension | What it measures |
|-----------|-----------------|
| purchase_intent | Likelihood to buy |
| brand_favorability | Brand impression shift |
| message_clarity | Ease of understanding |
| emotional_response | Emotional engagement |
| personal_relevance | Relevance to respondent's life |
| uniqueness | Distinctiveness vs competitors |
| trust_credibility | Believability and authenticity |
| value_perception | Worth for money |
| share_worthiness | Likelihood to share |
| overall_appeal | Holistic attractiveness |

## Error Handling

```python
try:
    result = ssr_request("POST", "/panels", body)
except RuntimeError as e:
    # Report the error to the user and suggest fixes
    # Common issues: invalid demographics, unsupported stimulus type
```

## Cost

- ~$0.003 per persona per run
- Panel of 20: ~$0.06 per stimulus test, ~$0.02 for panel creation
```

- [ ] **Step 2: Commit** (in monorepo)

```bash
cd /home/clsandoval/cs/monorepo
git add automations/nanoclaw/container/skills/cheerful/ssr-panel/
git commit -m "feat(nanoclaw): add SSR consumer panel skill for Cheerful"
```

---

### Task 13: Update Deployment Config

**Files:**
- Modify: `automations/nanoclaw/deployments/cheerful.json`

- [ ] **Step 1: Add ssr-panel to default skills**

In `automations/nanoclaw/deployments/cheerful.json`, add `"cheerful/ssr-panel"` to the `defaults.skills` array:

```json
"skills": ["cheerful/cheerful-api", "cheerful/cheerful-supabase", "cheerful/creator-search", "cheerful/google-sheets", "cheerful/ssr-panel", "rollbar"]
```

- [ ] **Step 2: Commit** (in monorepo)

```bash
cd /home/clsandoval/cs/monorepo
git add automations/nanoclaw/deployments/cheerful.json
git commit -m "feat(nanoclaw): add ssr-panel skill to cheerful deployment defaults"
```

---

### Task 14: Verify & Smoke Test

- [ ] **Step 1: Run unit tests**

```bash
cd /home/clsandoval/cs/cheerful/apps/backend
python -m pytest tests/ssr/ -v
```

Expected: All scoring and persona parsing tests pass.

- [ ] **Step 2: Verify migration SQL syntax**

```bash
cd /home/clsandoval/cs/cheerful
# If local Supabase is available:
supabase db reset
# Or just verify SQL parses:
python -c "
with open('supabase/migrations/20260402000000_create_ssr_tables.sql') as f:
    sql = f.read()
print(f'Migration: {len(sql)} chars, {sql.count(\"CREATE TABLE\")} tables')
"
```

Expected: "Migration: ~X chars, 8 tables"

- [ ] **Step 3: Verify imports resolve**

```bash
cd /home/clsandoval/cs/cheerful/apps/backend
python -c "
from src.api.route.ssr import router
from src.services.ssr import create_panel_background, run_pipeline_background
from src.services.ssr.scoring import cosine_similarity, score_against_anchors
from src.services.ssr.persona import generate_single_persona, is_break_character
from src.repositories.ssr import SsrRepository
from src.models.database.ssr import SsrPanel, SsrRun, SsrScore
from src.models.api.ssr import PanelCreateRequest, RunCreateRequest
print('All imports OK')
"
```

Expected: "All imports OK"

- [ ] **Step 4: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(ssr): address import/test issues from verification"
```

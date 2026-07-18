---
name: macromapper
description: |
  Exhaustive, location-aware food scout for hitting macros. Given a place ("I'm at One Ayala"),
  enumerates EVERY food spot in reach (named venue OR open area), deep-researches each one's menu
  online, and returns the specific high-protein dishes to order, ranked by macro-fit. Deliberately
  expensive deep-research fan-out — cases the whole area.
  Triggers: "/macromapper", "what should I eat near <place>", "find me macro-friendly food at <mall>",
  "scan <area> for high-protein meals", "I'm at <place>, what's good for my macros".
---

# Macromapper

Location-in → ranked dishes-out. You tell it where you are; it cases every restaurant in reach and
tells you exactly what to order to hit protein without blowing the calorie ceiling.

**Core principle: exhaustive coverage, actionable output.** Every food spot gets cased. Every
recommendation is a real dish at a real place with an estimated macro line. No "eat healthy" fluff.

## Targets (baked in — this skill is standalone, does NOT read today's fitness log)

- **Protein floor: 160 g/day. Calorie ceiling: 2000/day.** A single meal picked here should push
  protein hard while fitting a meal-sized slice of the ceiling (aim **≤ ~800 kcal**, hard cap ~1000).
- **Ranking metric — protein density first.** Density = **`protein_g × 100 ÷ cal`** = grams of protein
  per 100 kcal. A strong restaurant pick is **≥30 g protein AND density ≥ ~7 g/100kcal** (~28%+ of
  calories from protein). Plain lean meat hits ~15–19; a good bowl ~7–9; below ~5 it's a carb/fat
  bomb with token protein.
- **Bias toward:** grilled/lean proteins, poke/donburi/sashimi, Korean BBQ, Japanese, rotisserie,
  steak, shawarma/kebab (meat, easy on sauce), salads-with-real-protein, unbreaded seafood.
- **Penalize:** deep-fried mains, heavy cream/cheese sauces, dessert, bubble tea / sugary drinks,
  carb-bomb bowls with token protein.
- These numbers are baked in — **do NOT read `profile.md` or the fitness log at runtime.** The
  profile is the source of truth only for a *human editing this skill*; if it changes, edit these
  constants. Nothing here needs a live file read.

## The flow (three phases)

### Phase 1 — Enumerate every food spot (Google Places API, inline — CHEAP: ~20 API calls, not agents)

1. **Get the location.** The trigger is usually a sentence ("find me food near my hotel in Cebu IT
   Park") — **extract the place phrase** from it (→ `"Cebu IT Park"`) and geocode THAT, not the whole
   sentence. "Don't rewrite" means don't *correct/normalize* the place (pass "One Ayala Manila" as-is,
   Places resolves it) — it does not mean feed the raw sentence. If no place is present at all, ask:
   *"Where are you — name the mall / building, the area/neighborhood, or a nearby landmark?"* Classify:
   - **Named venue** (a mall, building, complex) → tenant-set is bounded; use the same-venue filter (6a).
   - **Open area** (district, neighborhood, "near my hotel") → no bounded tenant set; the radius circle
     IS the boundary (6b). Anchor rule: if the phrase includes a usable area/landmark ("...in Cebu IT
     Park"), geocode that and tell the user you're centering on the area, not the exact spot — do NOT
     stop to ask. Only ask "which one?" when the anchor is unnamed AND no area/landmark is given at all
     (bare "near my hotel").
2. **Source the key read-only** (never echo it, never write it to a committed file):
   ```bash
   KEY_LINE=$(grep -E '^[[:space:]]*(export[[:space:]]+)?GOOGLE_MAPS_API_KEY=' /home/clsandoval/cs/monorepo/.env | head -1)
   export GMK="$(printf '%s' "$KEY_LINE" | sed -E 's/^[^=]*=//; s/^["'\'']//; s/["'\'']$//')"
   [ -n "$GMK" ] || echo "NO KEY — stop and tell the user GOOGLE_MAPS_API_KEY is missing from monorepo/.env"
   ```
   If the key is missing, stop and say so — don't proceed keyless.
3. **Geocode** to a center. Text Search doubles as geocoder (substitute the user's location text):
   ```bash
   curl -s -X POST 'https://places.googleapis.com/v1/places:searchText' \
     -H "X-Goog-Api-Key: $GMK" -H 'Content-Type: application/json' \
     -H 'X-Goog-FieldMask: places.id,places.displayName,places.location,places.formattedAddress' \
     -d '{"textQuery":"<LOCATION TEXT>","pageSize":1}'
   ```
   Capture the returned `location.latitude/longitude` — **you MUST use these real coords in step 4's
   Nearby calls; never hardcode a lat/lng.** If geocoding returns nothing, re-ask the user for a
   clearer place name (once), then bail if still unresolvable.
4. **Enumerate exhaustively — you MUST tile queries.** Each query caps at ~60 results (Text Search:
   20/page × 3 pages via `nextPageToken`; Nearby Search: 20 max, NO pagination). One query will NOT
   surface hundreds of tenants. Run all of these and union the results:
   - **Text Search, paginated:** `"restaurants in <LOCATION TEXT>"`. Follow pagination: repeat the
     same body with `"pageToken":"<token>"` until no `nextPageToken` comes back (≤3 pages).
   - **Cuisine sweeps** to reach past the 60 cap. Run ONE Text Search per term, and **every term MUST
     include the location** — the query text is `"<LOCATION TEXT> <cuisine>"`:
     `japanese, korean, grill, poke, seafood, steak, salad, chicken, shawarma, cafe, fast food, dessert`
     (dessert/cafe included so coverage is honest; they rank last). Bare cuisine words with no
     location = a global search = wrong. Sweeps are **single-page on purpose** (top 20 each) — the
     breadth comes from many terms, not deep pagination; only the main `"restaurants in …"` query paginates.
   - **Nearby Search** at the geocoded center, `radius: 1000`, one call per `includedType`
     (`restaurant, cafe, meal_takeaway, bakery, meal_delivery`), substituting the real center:
     ```bash
     curl -s -X POST 'https://places.googleapis.com/v1/places:searchNearby' \
       -H "X-Goog-Api-Key: $GMK" -H 'Content-Type: application/json' \
       -H 'X-Goog-FieldMask: places.id,places.displayName,places.primaryType,places.types,places.rating,places.userRatingCount,places.priceLevel,places.location,places.formattedAddress,places.googleMapsUri,places.websiteUri' \
       -d '{"includedTypes":["restaurant"],"maxResultCount":20,"locationRestriction":{"circle":{"center":{"latitude":<LAT>,"longitude":<LNG>},"radius":1000.0}}}'
     ```
   - **Field mask on ALL Text Search listing calls MUST include `nextPageToken`** or pagination
     silently dies — use: `places.id,places.displayName,places.primaryType,places.types,places.rating,places.userRatingCount,places.priceLevel,places.location,places.formattedAddress,places.googleMapsUri,places.websiteUri,nextPageToken`.
5. **Dedup by `places.id`** across every result (jq: gather `.places[]`, unique by `.id`). Keep an
   entry only if its **`primaryType`** is an eatery type (`restaurant|cafe|coffee|food|bakery|meal_|
   bar_and_grill|ice_cream|sandwich|fast_food` etc.), and **explicitly drop containers/retail even if
   their `types` array mentions food** — `shopping_mall, department_store, supermarket, grocery_store,
   convenience_store, gas_station, lodging, hotel` all leak in via a broad `types` match, so filter on
   `primaryType`, not `types`. This union is your tenant list — and, for an open area, the coverage
   denominator (you cased what you enumerated; you don't claim to know every spot in a whole district).
6. **Bound it to what's reachable:**
   - **(6a) Named venue:** keep tenants whose `formattedAddress` names the venue even if slightly
     past 1km (a deep-interior tenant may still be missed — note it in coverage).
   - **(6b) Open area:** the 1km circle is the bound — but the Text Search sweeps carry no radius, so
     you MUST clip: drop any tenant whose `location` is >1km from the geocoded center (haversine on
     lat/lng in jq). Keep the clipped union. Widen/narrow the radius only if the user says so
     (walkable district ~1km is the sane default).

### Phase 2 — Case every spot (this is where the money goes — gate BEFORE launching)

Phase 1 was cheap. Phase 2 spawns one research agent per restaurant and is the real spend. **Gate
first — report the count, then WAIT for an explicit go that comes AFTER the count:**

> "Found **N** food spots near <place>. The exhaustive scan runs ~N research agents — the big token
> spend. Options: **(a) go full** (all N), **(b) macro-narrow** — case only the K spots most likely to
> carry high-protein food (grills, poke, Japanese/Korean, rotisserie, seafood, chicken) plus any with
> published macros, **(c) filter cuisines**. Which?"

The **go itself is the opt-in for the spend** (and for multi-agent orchestration) — invocation is not.
Always wait for it after the count. Impatience narrows the **fan-out** via this gate (b/c); it never
skips the Phase-1 enumeration or the gate, and it can't speed Phase 1 (that latency is fixed). If the
user signaled hurry ("fast", "just the best", "don't overthink"), **recommend (b) and propose a small
K** — ~5–8 for a single-best ask, ~15–25 otherwise. "Macro-narrow" beats "cap by Google rating": a
3-star grill can out-macro a 4.8-star dessert bar, so narrow by protein-likelihood, not stars.

On go, run the fan-out — one research agent per restaurant:
- **Primary (`Workflow` tool, available to the main agent):** a `pipeline()` over the tenant list;
  `agent()`'s `schema` option enforces `DISH_SCHEMA` and concurrency is capped automatically. Shape:
  ```
  const tenants = typeof args === 'string' ? JSON.parse(args) : args  // Workflow args arrive stringified — guard or pipeline() throws
  pipeline(tenants, t => agent(researchPrompt(t), {schema: DISH_SCHEMA, label: t.name}))
  ```
- **Fallback (no `Workflow`, e.g. running inside a subagent):** dispatch parallel `Agent` calls in
  **batches of ~8–10**. `Agent` has no schema param, so **paste `DISH_SCHEMA` into each prompt and
  instruct the agent to return only that JSON.** Parse and collect across batches.

Each agent's job, for its one restaurant:
- Find the **menu** from whatever's online. **Delivery platforms are the primary menu source in the
  Philippines — GrabFood and Foodpanda list full items, often prices and photos.** Then the spot's
  own site / Instagram, and Google Places photos of the menu/dishes.
- Pull the **high-protein candidate dishes** (grilled meats, bowls, seafood, eggs — skip the fries).
- **Estimate macros per dish** the way the fitness skill does: published/label macros if it's a known
  chain; otherwise estimate from named ingredients + portion + photo. **Flag confidence L/M/H.**
- **Also capture `serving` (portion size / weight as menued, e.g. "12 oz / ~340g", "6 pcs", "solo")
  and `price` (local currency as listed, e.g. "₱890").** These drive the macro estimate and let the
  user judge value — pull them from the same menu source. Use `""` if a field genuinely isn't listed.
- Return the schema below. If no menu is findable, return `dishes: []` with a reason.

`DISH_SCHEMA`:
```json
{ "restaurant": "string", "maps_uri": "string",
  "dishes": [ { "name": "string", "serving": "string", "price": "string",
                "protein_g": 0, "cal": 0,
                "confidence": "L|M|H", "note": "why it's a good macro pick / caveat" } ],
  "no_menu_reason": "string (only if dishes empty)" }
```

### Phase 3 — Rank & synthesize (in main context)

1. Flatten all dishes across all restaurants.
2. **Hard filter (drops a dish entirely):** over ~1000 kcal, OR below ~20 g protein, OR density
   below ~5 g/100kcal (a true carb/fat bomb). Everything surviving is at least orderable.
3. **Score & tier:** primary = density (`protein_g × 100 ÷ cal`, g per 100 kcal); tiebreak = absolute
   `protein_g`. The **≥30 g protein AND density ≥7** bar is the **"Top picks" tier**, not the filter —
   dishes between the filter floor and that bar go under "Also solid." Apply the bias/penalty list;
   down-weight L-confidence when two picks tie.
4. **Output** (actionable, scannable):
   ```
   ### 🥇 Top picks near <place>
   1. **<Dish>** (<serving>, <price>) @ <Restaurant> — ~<P>g protein / ~<C> cal (<density> g/100kcal). <why> [conf: <L/M/H>]
   ...
   ### Also solid
   ...
   ### Coverage
   Cased <cased>/<total> spots. Skipped <k>: <reason clusters — dessert/bubble-tea/no menu online>.
   ```
   For an **open area**, phrase the denominator honestly: "Cased <cased>/<total> within 1km of
   <area> — not every spot in the district." For a **named venue**, "<total>" is the venue's tenants.
5. Lead with the single best pick. One row per pick. Confidence visible, not buried.

## Common mistakes

- **One Places query and calling it done.** It caps at ~60; a dense mall has more. Tiling is
  mandatory — paginate + cuisine sweeps (each with the location) + nearby types, then dedup.
- **Hardcoding coordinates.** Always geocode the actual location and feed those coords to Nearby.
- **Bare cuisine sweeps.** Every sweep query includes the location text, or it searches the globe.
- **Dropping `nextPageToken` from the field mask.** Then pagination silently returns one page.
- **Skipping / pre-inferring the cost gate.** Report N, then wait for a go given after the count.
  "Fast" narrows the fan-out through the gate; it never skips enumeration or the gate.
- **Echoing or committing the API key.** Source it inline into `$GMK`; never print the value. If it's
  missing from `.env`, stop and say so.
- **Recommending a place, not a dish.** Output is always a named dish + macro line, never "try X, it
  has healthy options."
- **Hiding uncertainty.** Macros here are estimates. Show confidence; don't fabricate precision.
- **Reading the fitness log OR `profile.md` at runtime.** Standalone against the baked-in targets —
  no live file read, ever. The profile pointer is for a human editing the skill, not for you.

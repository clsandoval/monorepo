# Wikilink Enrichment — Design Spec

**Date**: 2026-04-13
**Goal**: Make the Obsidian graph view useful by converting plain string references to `[[wikilinks]]` across trips and meaningful places.

## Current State

| Entity Type | Files | Wikilink Adoption | Action |
|-------------|-------|-------------------|--------|
| People | 13 | 100% | None |
| Businesses | 7 | 100% | None |
| Meetings | 6 | 100% | None |
| Trips | 21 | 24% (5 newer files) | **Enrich** |
| Places | 970 | ~1% (2 venue files) | **Enrich meaningful subset** |

## Scope

### What gets enriched

**Trips (all 21 files):**
- Convert `locations: ['Tokyo']` → `locations: [[Tokyo]]`
- Add `accommodation:` field with wikilinks to place entities where the visit dates overlap the trip dates
- Add `highlights:` field with wikilinks to attraction entities from the trip's date range
- Add `people:` wikilinks where meeting entities overlap with trip dates
- Fuzzy-match location strings to existing place entities
- Create missing city-level place entities if none exist

**Meaningful places (~180 files):**
- `accommodation/` (96 files) — all
- `attractions/` (84 files) — all
- `food-and-drink/` (~40 files) — only those with `visitCount >= 3`
- Convert `trips: ['Japan 2025']` → `trips: [[2025-01-japan]]` by fuzzy-matching to trip filenames

### What does NOT get enriched

- `shopping/` (201), `transport/` (93), `services/` (22), `other/` (166) — excluded
- `food-and-drink/` with `visitCount < 3` — excluded
- People, businesses, meetings — already 100% enriched
- Body text — only frontmatter fields are modified

## Approach: Forward Loop (Claude Code Agent)

A forward loop with ~150 stages. Each stage touches max 2-3 files. The agent uses fuzzy matching to resolve ambiguous string→entity mappings.

### Loop location

`loops/wikilink-enrichment-forward/`

### Stage breakdown

| Stages | Phase | What | Files per stage |
|--------|-------|------|-----------------|
| 1 | Index | Scan all entity dirs, build `_entity-index.json` lookup table | read-only |
| 2–22 | Trips | 1 per trip file — convert strings→wikilinks, add accommodation/highlights/people fields, create missing city entities | 1 trip + 0-2 new place files |
| 23–70 | Accommodation | Enrich `accommodation/` places (96 files, batched 2/stage) | 2 place files |
| 71–112 | Attractions | Enrich `attractions/` places (84 files, batched 2/stage) | 2 place files |
| 113–133 | Food repeats | Enrich high-visit food-and-drink (~40 files, batched 2/stage) | 2 place files |
| 134–136 | Discovery | Scan for orphaned entities, missing backlinks, broken wikilinks | varies |
| 137–139 | Verification | Spot-check 10 random enriched files, validate YAML parses correctly | read-only |

### Agent behavior rules

**Frontmatter editing:**
- Preserve all existing fields — never delete data
- Only convert string values to wikilinks; don't restructure YAML
- If a string can't be confidently matched (< 70% confidence), leave as plain string and add `# TODO: unmatched`
- New city-level place entities use minimal frontmatter: `type: place`, `name`, `category: city`, `tags`

**Matching strategy:**
1. Exact filename match first (`Tokyo` → `entities/places/tokyo.md`)
2. Fuzzy match on `name:` field in frontmatter
3. Date-range matching for trip↔place: trip `dates.start`/`dates.end` against place `visits:` array
4. When multiple places match, pick the one with visits during the trip's date range

**Constraints:**
- Don't enrich excluded categories (shopping, transport, services, other)
- Don't modify people, businesses, or meetings
- Don't create duplicate entities — always check the index first
- Don't add wikilinks in body text, only frontmatter

### Convergence criteria

- Every trip file has wikilinked `locations`
- Every trip file has `accommodation:` and `highlights:` fields (where data exists)
- Every meaningful place has wikilinked `trips:` field
- No broken `[[links]]` pointing to nonexistent files
- All modified files parse as valid YAML frontmatter

## One-time enrichment

This is a one-time script. The ingestion pipeline is not modified. Re-run the loop manually if new data is ingested and needs enrichment.

## Not in scope

- Updating the timeline ingestion pipeline
- Enriching body text with wikilinks
- Creating Dataview queries or dashboards
- Modifying the NanoClaw bot

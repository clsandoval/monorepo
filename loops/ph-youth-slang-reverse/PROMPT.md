# Filipino Youth Slang Dictionary & Thesaurus — Reverse Loop

You are running in `--print` mode. You MUST output text describing what you are doing.
If you only make tool calls without outputting text, your output is lost and the loop
operator cannot see progress. Always:
1. Start by printing which aspect you detected and what you're about to do
2. Print progress as you work
3. End with a summary of what you did and whether you committed

## Goal

Build a comprehensive, machine-readable dictionary and thesaurus from the aspects
defined in `frontier/aspects.md`. The canonical output is a JSON dataset
(`output/dictionary.json`) with a generated markdown reference (`output/dictionary.md`).

Categories and tags are discovered organically from the data — not predefined.

## Convergence

The loop converges when **3 consecutive iterations find zero new terms**. Each iteration
must attempt to discover new terms or refine existing ones. If an iteration adds 0 new
terms and refines 0 existing terms, increment a counter in `status/convergence.json`.
When the counter reaches 3, mark the loop as converged by writing `status/converged.txt`.

If the counter is at 1 or 2, print a warning so the operator can see convergence approaching.

## Waves

### Wave 1: Gather

For each unchecked Wave 1 aspect in `frontier/aspects.md`:
1. Web search the aspect's described source/target
2. Extract every slang term you encounter that is informal, non-standard, or emergent
3. For each term, write a raw entry to `raw/<aspect-slug>.json`:
   ```json
   {
     "term": "string",
     "raw_context": "where you found it (lyric line, tweet, video title)",
     "source_aspect": "aspect name"
   }
   ```
4. Mark the aspect as `[x]` in `frontier/aspects.md`
5. Update the statistics in `frontier/aspects.md`
6. Commit with message: `loop: gather — <aspect name> (<N> raw terms)`

Pick ONE unchecked Wave 1 aspect per iteration. Do not skip ahead to Wave 2 until all
Wave 1 aspects are complete.

### Wave 2: Define & Validate

For each unchecked Wave 2 aspect:
1. Read all `raw/*.json` files to collect gathered terms
2. For each term not yet in `output/dictionary.json`, research its meaning:
   - Web search: `"<term>" Filipino slang meaning`
   - Look for multiple independent usages to validate the definition
   - Check if the term exists with a different meaning in standard Tagalog/Filipino
3. Add validated entries to `output/dictionary.json` using this schema:
   ```json
   {
     "term": "string",
     "definitions": ["string"],
     "etymology": "string or null",
     "examples": [
       { "text": "string", "source": "string (lyric/conversation/social media)" }
     ],
     "regional_notes": "string or null",
     "related_terms": ["string"],
     "categories": ["string — discovered organically"],
     "sources": ["aspect names where this term was found"]
   }
   ```
4. If you discover new terms during research, add them to the raw files too
5. Mark aspect as `[x]`, update statistics, commit: `loop: define — batch <N> (<M> terms defined)`

### Wave 3: Thesaurus & Taxonomy

For each unchecked Wave 3 aspect:
1. Read `output/dictionary.json`
2. For each term, identify:
   - Synonyms (other terms in the dictionary with overlapping meaning)
   - Antonyms (if applicable)
   - Category clusters (group terms that share a usage domain)
3. Update each entry with `synonyms`, `antonyms`, and refine `categories`
4. Discover and document the organic category taxonomy in `output/categories.json`
5. Mark aspect, commit: `loop: thesaurus — <category/cluster name>`

### Wave 4: Synthesis

1. Read final `output/dictionary.json` and `output/categories.json`
2. Generate `output/dictionary.md` — organized by discovered categories, each entry with:
   - Term (bold), pronunciation hint if non-obvious
   - Definitions numbered
   - Example sentences with source attribution
   - Synonyms / antonyms / related terms as cross-references
   - Etymology note if known
3. Add summary statistics at the top (total terms, categories, top sources)
4. Commit: `loop: synthesis — dictionary.md generated (<N> terms, <M> categories)`

## Rules

- Never predefine categories — discover them from the data in Wave 3
- Each raw term must have at least one real-world usage example before being added to the dictionary
- If a term has multiple distinct meanings, list all of them as separate definitions
- Preserve original spelling/capitalization as used by the community
- If unsure about a definition, note uncertainty — do not guess
- Do not include terms that are well-established standard Tagalog/Filipino (pre-2023)
- Regional variants (Bisaya, Ilokano crossovers) are welcome but must be noted
- Every iteration must either discover new terms OR refine existing entries — never no-op
- When adding new Wave 2 aspects (because more raw terms were gathered than expected), add them to `frontier/aspects.md` and update the statistics
- Log each iteration's work in `frontier/analysis-log.md`

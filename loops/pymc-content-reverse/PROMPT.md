# PyMC Content Gathering — Reverse Loop

You are running in `--print` mode. You MUST output text describing what you are doing.
Always: (1) print which aspect you're working on, (2) print progress, (3) end with a summary of what you did.

You are an analysis agent in a ralph loop. Each time you run, you do ONE unit of work: gather, extract, or synthesize content for a single aspect, then commit and exit.

## Your Working Directory

`loops/pymc-content-reverse/`. All paths below are relative to this directory.

## Your Goal

Produce a **complete content package** in `content/` — one markdown file per page in the PyMC Labs website sitemap. Each file contains ALL raw material a frontend developer needs to build that page.

**Litmus test**: A developer must be able to populate every section of every page by reading ONLY `content/`. If they'd need to search Discord, google PyMC, or ask anyone, this loop has NOT converged.

## Sitemap

```
Home page (PyMC Labs)
├── Services
│   ├── Strategy & Advisory
│   ├── Solution Delivery
│   ├── Training & Enablement
│   └── Embedded Teams
├── Industries
│   ├── Marketing & Media
│   ├── Retail & E-Commerce
│   ├── Consumer Goods
│   ├── Pharma / Bio Tech
│   ├── Agriculture
│   ├── Finance / Insurance
│   ├── Gaming
│   └── Sports Analytics
├── Solutions (Drop Down)
│   ├── Simba
│   └── Decision AI
├── About Us
│   └── Our Story & Team
│       └── Team member Individual Page
├── Our Partners
├── Courses
│   ├── ABM Course
│   ├── BMA Course
│   └── CI Course
├── Case Studies (all discovered)
├── Our Blog
│   └── Blog Content Template
├── Resources
│   ├── Industry Benchmarks
│   └── Open Source Libraries
└── Contact Us
```

## Sources

| Source | Location | Contents |
|--------|----------|----------|
| Discord archive | `input/discord/index.jsonl`, `input/discord/channels/*.jsonl`, `input/discord/users.jsonl` | Full message history |
| Existing website | https://www.pymc-labs.com/ | Current content to migrate |
| Halah's draft | https://loyal-growth-093412.framer.app/ | Initial services + case studies |
| Brand deck | https://pymc-brand-deck.netlify.app/ | Visual brand reference |
| Public data | GitHub org, social media, press | Team info, OSS projects |

### Discord Archive Format

`index.jsonl`: `{"id":"...","name":"channel-name","type":"text","category":"...","msg_count":123,"first_ts":"...","last_ts":"..."}`
`channels/{id}.jsonl`: `{"id":"...","channel_id":"...","author_id":"...","content":"...","ts":"...","type":0}`
`users.jsonl`: `{"id":"...","name":"...","display_name":"...","bot":false}`

## Output Structure

```
content/
├── home.md
├── services/
│   ├── _overview.md
│   ├── strategy-advisory.md
│   ├── solution-delivery.md
│   ├── training-enablement.md
│   └── embedded-teams.md
├── industries/
│   ├── _overview.md
│   ├── marketing-media.md
│   ├── retail-ecommerce.md
│   ├── consumer-goods.md
│   ├── pharma-biotech.md
│   ├── agriculture.md
│   ├── finance-insurance.md
│   ├── gaming.md
│   └── sports-analytics.md
├── solutions/
│   ├── simba.md
│   └── decision-ai.md
├── about/
│   ├── story-and-team.md
│   └── team-members/{name}.md
├── partners.md
├── courses/
│   ├── abm.md
│   ├── bma.md
│   └── ci.md
├── case-studies/{name}.md
├── blog/template.md
├── resources/
│   ├── industry-benchmarks.md
│   └── open-source-libraries.md
└── contact.md
```

**Content file rules**:
- YAML frontmatter: `page`, `title`, `status` (stub|partial|complete), `sources`
- Organize by section as the page would render (hero, features, body, CTA)
- Include raw quotes with attribution (`— Name, #channel, 2026-01-15`)
- Flag gaps: `<!-- GAP: need X for this section -->`
- Append, don't overwrite existing content
- Cross-reference when content spans pages

## Each Iteration

1. Read `frontier/aspects.md`
2. Find the first unchecked `- [ ]` aspect (respect wave ordering)
3. Execute that ONE aspect
4. Write findings to `content/` and optionally `analysis/`
5. Update frontier: mark `- [x]`, update stats, add discovered aspects, log to `analysis-log.md`
6. Commit: `git add -A && git commit -m "loop(pymc-content-reverse): {aspect-name}"`
7. Exit

### Convergence Check

When all aspects are `- [x]`:
1. Read every file in `content/`
2. Verify:
   - Every sitemap page has a content file
   - No file has `status: stub`
   - Every case study has: client, problem, approach, results
   - Every service has: description, value prop, use cases
   - Every industry has: PyMC relevance, applications
   - Every course has: title, description, topics
   - Team members have: name, role, bio
   - Home page has: hero, service overview, social proof
3. If gaps → add new aspects, commit, exit
4. If complete → write `status/converged.txt`, commit, exit

## Rules

- ONE aspect per run, then exit.
- Be exhaustive. Extract every quote, data point, detail.
- Attribute everything to its source.
- Discover new aspects — add them to the frontier.
- Don't write polished copy. Gather raw material.
- Cross-reference when content spans pages.

# Prior Art Checklist

Before generating loop artifacts, search the monorepo for existing patterns to reference.

## Why This Matters

The daimon-saas-reverse loop missed the PodPlay Ops Supabase CI pattern (`supabase start`, seed migrations, Playwright against real DB) because its PROMPT.md didn't list PodPlay as a source. The pattern was sitting in the repo but the loop agent had no reason to look.

## What to Search For

### 1. Similar Tech Stacks

Search `apps/` for projects using the same stack:
- Supabase? Check `apps/podplay/supabase/` for config.toml, seed migrations, CI workflow
- React/Vite? Check existing app structures for router setup, component organization
- Rust/WASM? Check `apps/inheritance/engine/` or `apps/taxklaro/engine/`
- Next.js? Check any Next.js apps for middleware, layout patterns
- Fly.io? Check Dockerfiles, fly.toml patterns

### 2. Converged Reverse Loops

Search `loops/*/final-mega-spec/` for specs that solved similar problems:
- SaaS app? Check daimon-saas-reverse for multi-tenant, billing, auth patterns
- Content scraping? Check pymc-content-reverse for Discord/web extraction patterns
- Domain computation? Check freelance-tax-reverse for engine/test-vector patterns
- QA? Check podplay-ops-qa-forward, taxklaro-qa-forward for fix-verify patterns

### 3. CI/CD Patterns

Check `.github/workflows/` for:
- How existing apps do CI (build, test, deploy)
- Supabase start/stop in CI
- Playwright setup and screenshot capture
- Deploy targets (Vercel, Fly.io, Cloudflare)

### 4. Forward Loop Patterns

Check `loops/_template/PROMPT-forward.md.example` and any converged forward loops:
- Stage decomposition granularity
- Priority system (scaffold → test → implement → fix → advance)
- How they handle spec gaps
- Playwright verification stages

## How to Include Prior Art

Add discovered patterns to the PROMPT.md Key Sources table:

```markdown
### Key Sources

| Source | What It Contains | Reference |
|--------|-----------------|-----------|
| PodPlay Ops CI | supabase start, seed migrations, Playwright in CI | `.github/workflows/podplay-ops.yml`, `apps/podplay/supabase/` |
| TaxKlaro engine | Rust WASM bridge pattern, test vector format | `apps/taxklaro/engine/`, `loops/freelance-tax-reverse/final-mega-spec/engine/` |
```

The loop agent reads these sources and incorporates the patterns. Without them, it reinvents (or misses) solutions that already exist.

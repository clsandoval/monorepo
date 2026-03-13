# Daimon Forward — Spec Gaps

Gaps discovered during build that are missing from the mega-spec.

| Stage | Gap Description | Workaround | Resolved? |
|-------|----------------|------------|-----------|
| 005 | `tenants` RLS SELECT/UPDATE/DELETE policies reference `tenant_members` which doesn't exist until migration 002 — PostgreSQL rejects at policy-creation time | Deferred those 3 policies to migration 002 (`create_tenant_members`); INSERT policy added in 001 as specced | Resolved in stage 006 |
| 062 | Stage file mentions additional integrations (Dub, LinkedIn, GA, Fly, ACP, Onyx, Bluedot) and Discord (primary) as grouped services, but `integrations-page.md` only defines 4 services at launch (GitHub, Google, Linear, Toggl); Discord connections are managed separately | Built with 4 spec-defined services only | Open |
| 062 | Brand icon SVG files (`/icons/github.svg`, `/icons/google.svg`, `/icons/linear.svg`, `/icons/toggl.svg`) referenced in spec but not created | Used lucide-react icons + inline SVG as brand-color approximations | Open |

# Daimon Forward — Spec Gaps

Gaps discovered during build that are missing from the mega-spec.

| Stage | Gap Description | Workaround | Resolved? |
|-------|----------------|------------|-----------|
| 005 | `tenants` RLS SELECT/UPDATE/DELETE policies reference `tenant_members` which doesn't exist until migration 002 — PostgreSQL rejects at policy-creation time | Deferred those 3 policies to migration 002 (`create_tenant_members`); INSERT policy added in 001 as specced | Resolved in stage 006 |

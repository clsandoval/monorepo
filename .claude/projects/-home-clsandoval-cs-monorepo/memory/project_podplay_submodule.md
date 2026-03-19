---
name: podplay-submodule-migration
description: After Cost Analysis feature is done, extract apps/podplay into its own public repo and convert to a git submodule in the monorepo
type: project
---

After the Cost Analysis feature implementation, extract `apps/podplay/` into its own public GitHub repo, then replace it with a git submodule reference in the monorepo.

**Why:** User wants the PodPlay Ops app to be a standalone public repo.
**How to apply:** Once Cost Analysis + PDF fix are merged, help with repo extraction (git filter-branch or git subtree split) and submodule setup.

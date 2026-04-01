# Daimon Provisioner: Deployment Brief Redesign

**Date:** 2026-04-01
**Status:** Design approved

## Overview

Redesign the daimon-provisioner's left-side artifact from a config form into an interactive **Deployment Brief** — a structured, information-dense UI document that a CPO/CEO brainstorms with the agent, and that a coding agent can later execute to fork the daimon repo and deploy a new instance.

## Who Uses This

A CPO or CEO hypothesizing a Daimon forward deploy for a new client. They describe what the bot should do in the chat; the agent researches the decision-orchestrator codebase and progressively builds a deployment brief on the left. The brief is the final artifact — complete enough for a coding agent to take it, fork the repo, set env vars, and deploy.

## The Artifact: Deployment Brief

The left side renders a polished, interactive document (not a form, not markdown). It has:

### Sections

1. **Header** — client name, status badge (brainstorming/ready/deploying/deployed), elevator pitch summary
2. **Integrations** — each platform as a card showing: platform name, purpose, specific tools that will be used, required env vars
3. **User Journeys** — expandable step-by-step flows showing trigger → tool calls → output, with connector dots and platform references
4. **Credentials Checklist** — every env var needed, with have/needed/unknown status per credential
5. **Deployment Notes** — contextual notes the agent captures during brainstorming (e.g., "use SCHEDULED prompt variant", "needs CHANNEL_MAPPINGS for report routing")

### Interactions

- **Expand/collapse** — sections start collapsed with count badges, user drills into detail
- **Inline annotations** — user can add comments on any section. Comments appear as amber-highlighted callouts with resolve buttons. The agent sees unresolved annotations in its next turn and addresses them.
- **Comment inputs** — each section has an "Add comment" affordance at the bottom

### How Annotations Flow

1. User types a comment on the Integrations section: "Do we have a HubSpot token for this client?"
2. The annotation is stored in `brief.annotations[]` with `section: "integrations.hubspot"`
3. On the agent's next turn, it receives the full brief including unresolved annotations
4. Agent addresses the annotation in chat and may update the brief (e.g., changing credential status to "unknown" and adding a deployment note)
5. User can mark annotations as resolved

## New Data Model

Replace `InstanceConfig` with `DeploymentBrief`:

```typescript
interface DeploymentBrief {
  id: string;
  title: string;
  summary: string;
  status: 'brainstorming' | 'ready' | 'deploying' | 'deployed';

  integrations: Integration[];
  journeys: Journey[];
  credentials: Credential[];
  notes: string[];

  annotations: Annotation[];
  chat_messages: ChatMessage[];
  current_jsx: string | null;
  created_at: string;
  updated_at: string;
}

interface Integration {
  platform: string;
  purpose: string;
  tools: string[];
  env_vars: string[];
}

interface Journey {
  title: string;
  description: string;
  steps: JourneyStep[];
}

interface JourneyStep {
  action: string;
  tool: string | null;
  platform: string | null;
}

interface Credential {
  env_var: string;
  platform: string;
  status: 'needed' | 'have' | 'unknown';
  note: string | null;
}

interface Annotation {
  id: string;
  section: string;
  text: string;
  resolved: boolean;
}
```

## Agent Prompt Changes

The agent's system prompt must be rewritten to:

1. **Know the full integration catalog** — all 20 platforms, their tools, and required env vars (already done in current prompt)
2. **Build a DeploymentBrief, not an InstanceConfig** — the `render_ui` tool receives brief data and renders the deployment brief UI
3. **Address annotations** — when unresolved annotations exist, the agent must acknowledge and respond to them before other work
4. **Build journeys from conversation** — when the user describes "the bot should do X", the agent turns that into a structured journey with specific tool calls
5. **Auto-populate credentials** — based on selected integrations, automatically list all required env vars with initial status "needed"
6. **Add deployment notes** — capture implementation-relevant details that come up in conversation (prompt variant choices, channel mapping needs, scheduling requirements)

## ReactCanvas Changes

The `ReactCanvas` component stays the same — it transpiles and renders agent-generated JSX. But the agent now generates a deployment brief component instead of a config form. The component:

- Receives `{ brief, onBriefChange, onAnnotationAdd }` as props (instead of config/onConfigChange)
- Renders the expandable sections with the design system
- Handles expand/collapse via local `useState`
- Calls `onAnnotationAdd(section, text)` when user submits a comment
- Calls `onBriefChange(updatedBrief)` when user resolves an annotation

## ChatPanel Changes

- Pass unresolved annotations to the agent in the prompt context so it can see and address them
- The `buildPrompt` function includes annotations alongside the brief JSON

## Page Changes

- Replace `InstanceConfig` state with `DeploymentBrief` state
- `createEmptyBrief()` instead of `createEmptyConfig()`
- Handle `onAnnotationAdd` callback — append to brief's annotations array and save

## Supabase Schema

No migration needed. The `instance_configs` table stores the full object as JSONB — the column shape doesn't change, just the JSON structure inside it. The table could be renamed to `deployment_briefs` for clarity but isn't required.

## What Stays the Same

- Chat panel (right side) — same SSE streaming, same polish
- ReactCanvas transpilation — still Sucrase, still inline styles
- Supabase persistence — same store.ts functions, same table
- Agent SDK backend — same route.ts with render_ui tool
- Overall layout — split view with TopBar

## Out of Scope

- Actual deployment execution (the brief is the artifact, not a deploy button)
- Multi-user collaboration on a brief
- Version history of briefs
- Export to other formats

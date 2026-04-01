# Daimon Provisioner: Single-Panel Interaction Model

**Date:** 2026-04-01
**Status:** Design approved

## Overview

Remove the chat as the agent's reply channel. The left panel becomes the ONLY interface for agent output — questions, brief content, status all render there. The right side shrinks to a narrow sidebar with just the input box and a collapsed Q&A log.

## Layout

- **Left (~75% width)**: Deployment brief panel — agent questions at top as interactive cards, brief sections below
- **Right (250px sidebar)**: Input box at bottom, collapsed question log above, "Deploy Assistant" header with status dot

## Agent Output Flow

1. Agent calls `render_ui` → left panel updates with brief content AND/OR question cards
2. Agent text responses (SSE `text` events) are NOT rendered anywhere — all communication goes through `render_ui`
3. Agent must use `render_ui` for everything: questions, brief updates, status messages

## Question Cards

Appear at the top of the left panel, above brief sections.

**Visual treatment:**
- Blue top shimmer bar (gradient animation)
- "AWAITING YOUR INPUT" eyebrow with blue dot
- Question text in 15px medium weight
- Option buttons: full-width rows with A/B/C key badges on the left
- Options highlight on hover, shift right slightly

**Interaction:**
- User clicks an option → answer sent to agent, question card disappears
- Answer moves to the sidebar Q&A log as a collapsed entry
- Agent receives the answer and re-renders the brief

**For free-text questions** (no predefined options):
- Question card shows an inline text input instead of option buttons
- User types answer and hits Enter → same flow

## Sidebar (250px)

**Top:** "Deploy Assistant" header with blue icon + status dot (Ready/Thinking)

**Middle:** Collapsed question log
- Shows "N answered" as a toggle header
- Expands to show Q&A pairs: question in gray, answer in darker text
- Compact — 10px question, 12px answer

**Bottom:** Text input + send button
- For unprompted user messages (not responses to question cards)
- "Tell the assistant..." placeholder
- Sends as a regular user message to the agent

## What Changes

### ChatPanel.tsx → InputSidebar.tsx
- Strip all message rendering (no bubbles, no scroll, no markdown)
- Keep: input box, send button, status indicator
- Add: collapsed Q&A log component
- Change: sends `brief` instead of `config` in fetch body
- No longer renders SSE `text` events — only processes `render` and `brief` events

### ReactCanvas.tsx
- No changes to transpilation logic
- Agent-generated ConfigPanel now receives an additional `onQuestionAnswer` callback
- When user clicks a question option, ConfigPanel calls `onQuestionAnswer(questionId, answer)`
- Parent page sends the answer as a new chat message to `/api/chat`

### API Route (route.ts)
- No changes needed — still streams SSE with `render` events
- Agent still uses `render_ui` tool — just uses it for ALL output now

### Agent Prompt
- Remove all references to text responses — agent must ONLY communicate through `render_ui`
- Add question card JSX patterns to the prompt
- Add instruction: "Never respond with plain text. Always call render_ui."

### Pages (new, detail)
- Replace `<ChatPanel>` with `<InputSidebar>`
- Add `onQuestionAnswer` handler that sends answer as a user message
- Track Q&A log in state (question text + answer text pairs)

### DeploymentBrief type
- Add `pending_question` field to track the current unanswered question:
```typescript
interface PendingQuestion {
  id: string;
  text: string;
  options: string[] | null; // null = free-text
}
```

## What Stays the Same

- DeploymentBrief data model (integrations, journeys, credentials, notes, annotations)
- Supabase persistence
- Agent SDK backend with render_ui tool
- ReactCanvas Sucrase transpilation
- TopBar and dashboard
- Overall split layout (just narrower right side)

## Out of Scope

- Keyboard shortcuts for question options (A/B/C keys)
- Undo/back on answered questions
- Multiple simultaneous questions

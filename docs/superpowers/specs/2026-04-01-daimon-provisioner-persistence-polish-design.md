# Daimon Provisioner: Persistence & Chat Polish

**Date:** 2026-04-01
**Status:** Design approved

## Overview

Two focused workstreams for the daimon-provisioner app:
1. Replace localStorage with Supabase for multi-device config persistence
2. Light visual polish on the chat panel

## Workstream 1: Supabase Persistence

### Goal

Configs survive browser clears and are accessible from any device. No auth — internal tool, anyone with the URL can read/write all configs.

### Architecture

- **Local Supabase** (`supabase init` + `supabase start`) inside `apps/daimon-provisioner/`
- Single `instance_configs` table storing the full `InstanceConfig` as a JSONB column
- Supabase JS client in `store.ts`, replacing localStorage calls
- Same function signatures (`getInstances`, `getInstance`, `saveInstance`, `deleteInstance`, `createEmptyConfig`) — callers don't change

### Database Schema

```sql
create table instance_configs (
  id uuid primary key,
  config jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Single table, `config` column holds the full `InstanceConfig` object. The `id` matches `config.id`. No normalization — this is an internal tool with one table.

### Store Interface Changes

Current `store.ts` is synchronous (localStorage). New version becomes async:

```typescript
export async function getInstances(): Promise<InstanceConfig[]>
export async function getInstance(id: string): Promise<InstanceConfig | null>
export async function saveInstance(config: InstanceConfig): Promise<void>
export async function deleteInstance(id: string): Promise<void>
export function createEmptyConfig(): InstanceConfig  // stays sync, no DB call
```

All callers (dashboard page, instance detail page, new page) need to be updated from sync to async calls. This means:
- Dashboard: fetch instances in `useEffect` or via server component
- Instance detail: fetch instance by ID on load
- New page: `createEmptyConfig()` stays sync (just generates a blank config), `saveInstance()` becomes async

### Supabase Client Setup

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

Environment variables come from local Supabase (`supabase start` prints them).

### Migration from localStorage

No migration needed. The mock data currently seeds localStorage on first load — we'll drop that. Users start fresh with Supabase. The 4 mock instances were only for demo purposes.

## Workstream 2: Chat Panel Polish

### Goal

Make the chat panel look more polished without changing its structure or behavior.

### Changes

All changes are CSS-only in `globals.css` plus minor JSX tweaks in `ChatPanel.tsx`:

1. **Header icon**: Replace smiley SVG with speech bubble SVG
2. **Status indicator**: Replace subtitle "Describe your needs in plain language" with green dot + "Ready" text. Changes to amber dot + "Thinking" when `loading` is true.
3. **Message area background**: Change from `var(--surface)` to slightly warmer off-white (`#F7F7F3`)
4. **Bot message bubbles**: White background with subtle box-shadow (`0 1px 2px rgba(0,0,0,0.03)`) instead of matching the message area background
5. **System message**: White background instead of matching area
6. **Typing indicator**: Replace "Thinking..." text with three animated pulsing dots (CSS keyframe animation)
7. **Keyboard hint**: Add "Enter to send · Shift+Enter for new line" text below input area

### What stays the same

- Message layout (user right, bot left, no avatars)
- Input field shape and size (3px border-radius, same dimensions)
- Send button style
- Markdown rendering in bot messages
- All colors from existing design system (`--blue`, `--ink`, `--rule`, etc.)
- Chat panel width (400px)

## Dependencies

- `@supabase/supabase-js` — new dependency for Supabase client
- Supabase CLI — dev dependency for local instance (`npx supabase init/start`)
- Docker — required for local Supabase (assumed available)

## Out of Scope

- Authentication / user accounts
- Config version history
- Dashboard or TopBar visual changes
- ReactCanvas changes
- Agent prompt or backend changes

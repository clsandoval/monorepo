# Daimon Provisioner: Persistence & Chat Polish — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace localStorage with Supabase for multi-device config persistence and polish the chat panel UI.

**Architecture:** Local Supabase instance with a single `instance_configs` table storing full configs as JSONB. Store functions become async; callers updated to use `useEffect` + `useState` for data fetching. Chat panel gets CSS-only polish plus minor JSX tweaks for typing indicator and status.

**Tech Stack:** Next.js 16, Supabase (local via CLI), `@supabase/supabase-js`, React 19, CSS

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Create | `supabase/config.toml` | Local Supabase project config |
| Create | `supabase/migrations/001_instance_configs.sql` | DB schema |
| Create | `src/lib/supabase.ts` | Supabase client singleton |
| Modify | `src/lib/store.ts` | Replace localStorage with Supabase queries |
| Delete | `src/lib/mock-data.ts` | No longer needed |
| Modify | `src/app/page.tsx` | Async instance fetching |
| Modify | `src/app/instances/[id]/page.tsx` | Async instance load + async save |
| Modify | `src/app/new/page.tsx` | Async save |
| Modify | `src/components/ChatPanel.tsx` | Status indicator, typing dots, header icon, keyboard hint |
| Modify | `src/app/globals.css` | Chat polish styles |
| Modify | `.env.local.example` | Add Supabase env vars |
| Modify | `package.json` | Add `@supabase/supabase-js` |

---

### Task 1: Supabase Init & Migration

**Files:**
- Create: `apps/daimon-provisioner/supabase/config.toml`
- Create: `apps/daimon-provisioner/supabase/migrations/001_instance_configs.sql`

- [ ] **Step 1: Initialize Supabase project**

```bash
cd apps/daimon-provisioner
npx supabase@latest init
```

This creates `supabase/config.toml`. Edit the `project_id` line to:

```toml
project_id = "daimon-provisioner"
```

- [ ] **Step 2: Create the migration file**

Create `supabase/migrations/001_instance_configs.sql`:

```sql
create table instance_configs (
  id uuid primary key,
  config jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- No RLS — internal tool, no auth
alter table instance_configs enable row level security;

create policy "Allow all access"
  on instance_configs for all
  using (true)
  with check (true);
```

- [ ] **Step 3: Start local Supabase and verify**

```bash
cd apps/daimon-provisioner
npx supabase@latest start
```

Expected output includes `API URL`, `anon key`, `service_role key`, `DB URL`. Save the `API URL` and `anon key` values.

Verify the table exists:

```bash
npx supabase@latest db reset
```

Expected: runs migration, no errors.

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat(daimon-provisioner): init local Supabase with instance_configs table"
```

---

### Task 2: Supabase Client & Env Vars

**Files:**
- Create: `apps/daimon-provisioner/src/lib/supabase.ts`
- Modify: `apps/daimon-provisioner/.env.local.example`
- Modify: `apps/daimon-provisioner/.env.local`
- Modify: `apps/daimon-provisioner/package.json`

- [ ] **Step 1: Install @supabase/supabase-js**

```bash
cd apps/daimon-provisioner
npm install @supabase/supabase-js
```

- [ ] **Step 2: Create the Supabase client module**

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

- [ ] **Step 3: Update .env.local.example**

Add these two lines to the existing `.env.local.example`:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

- [ ] **Step 4: Update .env.local with real local values**

Add the actual values from `npx supabase status` output to `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key from supabase start output>
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase.ts .env.local.example package.json package-lock.json
git commit -m "feat(daimon-provisioner): add Supabase client and env config"
```

Note: Do NOT commit `.env.local` — it contains the actual key.

---

### Task 3: Rewrite store.ts to Use Supabase

**Files:**
- Modify: `apps/daimon-provisioner/src/lib/store.ts`

- [ ] **Step 1: Rewrite store.ts**

Replace the entire contents of `src/lib/store.ts` with:

```typescript
import { supabase } from './supabase';
import { InstanceConfig } from './types';

export async function getInstances(): Promise<InstanceConfig[]> {
  const { data, error } = await supabase
    .from('instance_configs')
    .select('config')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(row => row.config as InstanceConfig);
}

export async function getInstance(id: string): Promise<InstanceConfig | null> {
  const { data, error } = await supabase
    .from('instance_configs')
    .select('config')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data ? (data.config as InstanceConfig) : null;
}

export async function saveInstance(config: InstanceConfig): Promise<void> {
  const now = new Date().toISOString();
  const updated = { ...config, updated_at: now };

  const { error } = await supabase
    .from('instance_configs')
    .upsert({
      id: config.id,
      config: updated,
      updated_at: now,
    });

  if (error) throw error;
}

export async function deleteInstance(id: string): Promise<void> {
  const { error } = await supabase
    .from('instance_configs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export function createEmptyConfig(): InstanceConfig {
  return {
    id: crypto.randomUUID(),
    client: { name: '', description: '' },
    integrations: [],
    system_packages: [],
    prompt_variant: 'interactive',
    custom_prompt: null,
    features: {
      discord_archive: false,
      langfuse_tracing: false,
      bluedot_webhooks: false,
      ssr_panels: false,
    },
    frontends: { discord: true, slack: false, teams: false },
    workflows: [],
    alerts: [],
    status: 'draft',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd apps/daimon-provisioner
npx tsc --noEmit
```

Expected: may show errors in caller files (page.tsx etc.) because they still call the old sync API. That's fine — we fix those in the next tasks.

- [ ] **Step 3: Commit**

```bash
git add src/lib/store.ts
git commit -m "feat(daimon-provisioner): rewrite store.ts to use Supabase"
```

---

### Task 4: Update Dashboard Page (page.tsx)

**Files:**
- Modify: `apps/daimon-provisioner/src/app/page.tsx`
- Delete: `apps/daimon-provisioner/src/lib/mock-data.ts`

- [ ] **Step 1: Update the dashboard to fetch async**

Replace the entire contents of `src/app/page.tsx` with:

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { InstanceTable } from '@/components/InstanceTable';
import { getInstances } from '@/lib/store';
import { InstanceConfig } from '@/lib/types';

export default function Home() {
  const [instances, setInstances] = useState<InstanceConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInstances()
      .then(setInstances)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <TopBar />
      <div className="content">
        <div className="page-head">
          <h1 className="page-title">Instances</h1>
          <Link href="/new" className="new-btn">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
            </svg>
            New Instance
          </Link>
        </div>
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#999', fontSize: '13px' }}>
            Loading instances...
          </div>
        ) : (
          <InstanceTable instances={instances} />
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Delete mock-data.ts**

```bash
rm apps/daimon-provisioner/src/lib/mock-data.ts
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd apps/daimon-provisioner
npx tsc --noEmit
```

Expected: errors only in `instances/[id]/page.tsx` and `new/page.tsx` (still using sync API).

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git rm src/lib/mock-data.ts
git commit -m "feat(daimon-provisioner): async dashboard fetch, remove mock data"
```

---

### Task 5: Update Instance Detail Page

**Files:**
- Modify: `apps/daimon-provisioner/src/app/instances/[id]/page.tsx`

- [ ] **Step 1: Update instance detail page to async**

Replace the entire contents of `src/app/instances/[id]/page.tsx` with:

```typescript
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { ReactCanvas } from '@/components/ReactCanvas';
import { ChatPanel } from '@/components/ChatPanel';
import { getInstance, saveInstance } from '@/lib/store';
import { InstanceConfig } from '@/lib/types';

export default function InstanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [config, setConfig] = useState<InstanceConfig | null>(null);
  const [jsx, setJsx] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load instance on mount
  useEffect(() => {
    getInstance(id).then(instance => {
      if (!instance) {
        router.push('/');
        return;
      }
      setConfig(instance);
    });
  }, [id, router]);

  // Auto-save with 300ms debounce
  const handleChange = useCallback((updated: InstanceConfig) => {
    setConfig(updated);

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      saveInstance(updated);
    }, 300);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  if (!config) {
    return null;
  }

  return (
    <>
      <TopBar />
      <div className="main-split">
        <ReactCanvas jsx={jsx} config={config} onConfigChange={handleChange} />
        <ChatPanel config={config} onConfigChange={handleChange} onRender={setJsx} />
      </div>
    </>
  );
}
```

Key changes from current:
- `getInstance(id)` is now async (`.then()`)
- `saveInstance(updated)` is now async (fire-and-forget in debounce — no `await` needed)
- Combined the `handleChange` and auto-save into one `useCallback` to avoid the stale `config` issue in the old `useEffect` approach

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd apps/daimon-provisioner
npx tsc --noEmit
```

Expected: errors only in `new/page.tsx` now.

- [ ] **Step 3: Commit**

```bash
git add src/app/instances/[id]/page.tsx
git commit -m "feat(daimon-provisioner): async instance detail page"
```

---

### Task 6: Update New Instance Page

**Files:**
- Modify: `apps/daimon-provisioner/src/app/new/page.tsx`

- [ ] **Step 1: Update new page to async save**

Replace the entire contents of `src/app/new/page.tsx` with:

```typescript
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TopBar } from '@/components/TopBar';
import { ReactCanvas } from '@/components/ReactCanvas';
import { ChatPanel } from '@/components/ChatPanel';
import { createEmptyConfig, saveInstance } from '@/lib/store';
import { InstanceConfig } from '@/lib/types';

export default function NewInstancePage() {
  const [config, setConfig] = useState<InstanceConfig>(() => createEmptyConfig());
  const [jsx, setJsx] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback((updated: InstanceConfig) => {
    setConfig(updated);

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      saveInstance(updated);
    }, 300);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <TopBar />
      <div className="main-split">
        <ReactCanvas jsx={jsx} config={config} onConfigChange={handleChange} />
        <ChatPanel config={config} onConfigChange={handleChange} onRender={setJsx} />
      </div>
    </>
  );
}
```

- [ ] **Step 2: Full TypeScript check — all errors resolved**

```bash
cd apps/daimon-provisioner
npx tsc --noEmit
```

Expected: PASS — no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/new/page.tsx
git commit -m "feat(daimon-provisioner): async new instance page"
```

---

### Task 7: Chat Panel Polish — CSS

**Files:**
- Modify: `apps/daimon-provisioner/src/app/globals.css`

- [ ] **Step 1: Add typing indicator animation**

Add to the end of `globals.css`, before the closing comment or at the very end:

```css
/* ── Typing indicator ── */
@keyframes dot-pulse-1 { 0%,100%{opacity:0.3} 25%{opacity:1} }
@keyframes dot-pulse-2 { 0%,100%{opacity:0.3} 50%{opacity:1} }
@keyframes dot-pulse-3 { 0%,100%{opacity:0.3} 75%{opacity:1} }

.typing-indicator {
  align-self: flex-start;
  background: var(--surface);
  border: 1px solid var(--rule);
  padding: 12px 18px;
  border-radius: 10px 10px 10px 3px;
  display: inline-flex;
  gap: 5px;
  align-items: center;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
.typing-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--ink-3);
}
.typing-dot:nth-child(1) { animation: dot-pulse-1 1.4s infinite; }
.typing-dot:nth-child(2) { animation: dot-pulse-2 1.4s infinite; }
.typing-dot:nth-child(3) { animation: dot-pulse-3 1.4s infinite; }
```

- [ ] **Step 2: Update message area and bubble styles**

Find the `.chat-messages` rule in `globals.css` and change its background:

```css
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px 22px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  background: #F7F7F3;
}
```

Find the `.msg-sys` rule and change background to white:

```css
.msg-sys {
  font-size: 12px;
  color: var(--ink-3);
  padding: 10px 14px;
  background: var(--surface);
  border-left: 2px solid var(--blue-border);
  border-radius: 0 var(--radius) var(--radius) 0;
  line-height: 1.5;
}
```

Find the `.msg-b` rule and update background + add shadow:

```css
.msg-b {
  align-self: flex-start;
  background: var(--surface);
  border: 1px solid var(--rule);
  padding: 11px 14px;
  border-radius: 10px 10px 10px 3px;
  font-size: 13px;
  color: var(--ink-2);
  line-height: 1.6;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
}
```

Add shadow to user messages too. Find `.msg-u` and add shadow:

```css
.msg-u {
  align-self: flex-end;
  background: var(--ink);
  color: white;
  padding: 10px 14px;
  border-radius: 10px 10px 3px 10px;
  font-size: 13px;
  line-height: 1.5;
  box-shadow: 0 1px 2px rgba(0,0,0,0.08);
}
```

- [ ] **Step 3: Add keyboard hint and status indicator styles**

Add to the end of `globals.css`:

```css
/* ── Chat status & hint ── */
.chat-status {
  font-size: 10px;
  color: var(--ink-3);
  display: flex;
  align-items: center;
  gap: 5px;
}
.chat-status-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #34a853;
}
.chat-status-dot.thinking {
  background: var(--amber);
}
.chat-hint {
  font-size: 10px;
  color: var(--ink-4);
  margin-top: 6px;
  text-align: center;
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "style(daimon-provisioner): chat panel polish — typing dots, message depth, status"
```

---

### Task 8: Chat Panel Polish — JSX

**Files:**
- Modify: `apps/daimon-provisioner/src/components/ChatPanel.tsx`

- [ ] **Step 1: Update header icon and status indicator**

In `ChatPanel.tsx`, replace the header section (the `<div className="chat-head">` block, lines 132-146) with:

```tsx
      <div className="chat-head">
        <div className="chat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className="chat-title-group">
          <div className="chat-title">Config Assistant</div>
          <div className="chat-status">
            <span className={`chat-status-dot${loading ? ' thinking' : ''}`} />
            {loading ? 'Thinking' : 'Ready'}
          </div>
        </div>
      </div>
```

- [ ] **Step 2: Replace "Thinking..." with typing dots**

In `ChatPanel.tsx`, replace the loading indicator block (lines 174-178):

```tsx
        {loading && (
          <div className="msg msg-b" style={{ opacity: 0.6 }}>
            Thinking...
          </div>
        )}
```

With:

```tsx
        {loading && (
          <div className="typing-indicator">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}
```

- [ ] **Step 3: Add keyboard hint below input**

In `ChatPanel.tsx`, after the closing `</div>` of `chat-input-row` (line 199), add:

```tsx
        <div className="chat-hint">Enter to send &middot; Shift+Enter for new line</div>
```

So the full `chat-input-area` block becomes:

```tsx
      <div className="chat-input-area">
        <div className="chat-input-row">
          <input
            className="chat-field"
            placeholder="Describe what the bot needs..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button className="chat-send" onClick={() => sendMessage()} disabled={loading}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div className="chat-hint">Enter to send &middot; Shift+Enter for new line</div>
      </div>
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd apps/daimon-provisioner
npx tsc --noEmit
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ChatPanel.tsx
git commit -m "style(daimon-provisioner): chat panel JSX — speech icon, status, typing dots, hint"
```

---

### Task 9: Smoke Test

- [ ] **Step 1: Ensure Supabase is running**

```bash
cd apps/daimon-provisioner
npx supabase@latest status
```

If not running: `npx supabase@latest start`

- [ ] **Step 2: Start the dev server**

```bash
cd apps/daimon-provisioner
npm run dev
```

- [ ] **Step 3: Verify dashboard loads**

Open `http://localhost:3000`. Expected: empty instances table (no mock data), "New Instance" button visible.

- [ ] **Step 4: Create a new instance**

Click "New Instance". Expected: split layout with ReactCanvas on left, ChatPanel on right. Chat panel should show:
- Speech bubble icon (not smiley)
- "Ready" status with green dot
- Keyboard hint below input

- [ ] **Step 5: Send a chat message**

Type a message and hit Enter. Expected:
- Status changes to "Thinking" with amber dot
- Typing dots animate while waiting
- Agent responds with text and/or renders UI on the left

- [ ] **Step 6: Verify persistence**

Go back to dashboard (`/`). Expected: the new instance appears in the table. Open a different browser or incognito window and navigate to `http://localhost:3000`. Expected: same instance visible (persisted in Supabase, not localStorage).

- [ ] **Step 7: Commit any fixes if needed**

```bash
git add -A
git commit -m "fix(daimon-provisioner): smoke test fixes"
```

Only create this commit if fixes were needed.

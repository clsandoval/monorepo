# Deployment Brief Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the config-form left panel with an interactive Deployment Brief document that a CPO/CEO brainstorms with the agent, producing an artifact a coding agent can execute.

**Architecture:** New `DeploymentBrief` type replaces `InstanceConfig`. ReactCanvas passes `brief`/`onBriefChange`/`onAnnotationAdd` instead of `config`/`onConfigChange`. Agent prompt rewritten to build briefs progressively. ChatPanel sends annotations to the agent. Dashboard table updated for brief fields.

**Tech Stack:** Next.js 16, React 19, Supabase (JSONB), Sucrase, Agent SDK

---

## File Map

| Action | File | Responsibility |
|--------|------|---------------|
| Rewrite | `src/lib/types.ts` | Replace InstanceConfig with DeploymentBrief + related interfaces |
| Modify | `src/lib/store.ts` | Rename functions to use "brief" terminology, update types |
| Rewrite | `src/lib/agent-prompt.ts` | New system prompt + buildPrompt for DeploymentBrief |
| Modify | `src/components/ReactCanvas.tsx` | Accept brief/onBriefChange/onAnnotationAdd props |
| Modify | `src/components/ChatPanel.tsx` | Accept brief instead of config, pass annotations to agent |
| Modify | `src/components/InstanceTable.tsx` | Rename to BriefTable, update columns for brief fields |
| Modify | `src/app/page.tsx` | Use DeploymentBrief type + BriefTable |
| Modify | `src/app/new/page.tsx` | Use DeploymentBrief, wire annotation callbacks |
| Modify | `src/app/instances/[id]/page.tsx` | Use DeploymentBrief, wire annotation callbacks |
| Modify | `src/components/TopBar.tsx` | Update count from "running" to brief statuses |
| Modify | `src/app/api/chat/route.ts` | Update types, render_ui description, SSE events |

---

### Task 1: Replace Types — DeploymentBrief

**Files:**
- Rewrite: `apps/daimon-provisioner/src/lib/types.ts`

- [ ] **Step 1: Replace types.ts with new DeploymentBrief model**

Replace the entire contents of `src/lib/types.ts` with:

```typescript
export interface DeploymentBrief {
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

export interface Integration {
  platform: string;
  purpose: string;
  tools: string[];
  env_vars: string[];
}

export interface Journey {
  title: string;
  description: string;
  steps: JourneyStep[];
}

export interface JourneyStep {
  action: string;
  tool: string | null;
  platform: string | null;
}

export interface Credential {
  env_var: string;
  platform: string;
  status: 'needed' | 'have' | 'unknown';
  note: string | null;
}

export interface Annotation {
  id: string;
  section: string;
  text: string;
  resolved: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

- [ ] **Step 2: Verify file saved correctly**

```bash
cd apps/daimon-provisioner
head -20 src/lib/types.ts
```

Expected: `export interface DeploymentBrief {` on line 1.

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat(daimon-provisioner): replace InstanceConfig with DeploymentBrief type

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Update Store — Brief Terminology

**Files:**
- Modify: `apps/daimon-provisioner/src/lib/store.ts`

- [ ] **Step 1: Rewrite store.ts for DeploymentBrief**

Replace the entire contents of `src/lib/store.ts` with:

```typescript
import { supabase } from './supabase';
import { DeploymentBrief } from './types';

export async function getBriefs(): Promise<DeploymentBrief[]> {
  const { data, error } = await supabase
    .from('instance_configs')
    .select('config')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(row => row.config as DeploymentBrief);
}

export async function getBrief(id: string): Promise<DeploymentBrief | null> {
  const { data, error } = await supabase
    .from('instance_configs')
    .select('config')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ? (data.config as DeploymentBrief) : null;
}

export async function saveBrief(brief: DeploymentBrief): Promise<void> {
  const now = new Date().toISOString();
  const updated = { ...brief, updated_at: now };

  const { error } = await supabase
    .from('instance_configs')
    .upsert({
      id: brief.id,
      config: updated,
      updated_at: now,
    });

  if (error) throw error;
}

export async function deleteBrief(id: string): Promise<void> {
  const { error } = await supabase
    .from('instance_configs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export function createEmptyBrief(): DeploymentBrief {
  return {
    id: crypto.randomUUID(),
    title: '',
    summary: '',
    status: 'brainstorming',
    integrations: [],
    journeys: [],
    credentials: [],
    notes: [],
    annotations: [],
    chat_messages: [],
    current_jsx: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/store.ts
git commit -m "feat(daimon-provisioner): update store for DeploymentBrief terminology

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Update ReactCanvas — Brief Props

**Files:**
- Modify: `apps/daimon-provisioner/src/components/ReactCanvas.tsx`

- [ ] **Step 1: Update ReactCanvas to accept brief props**

Replace the entire contents of `src/components/ReactCanvas.tsx` with:

```typescript
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { transform } from 'sucrase';
import { DeploymentBrief } from '@/lib/types';

interface ReactCanvasProps {
  jsx: string | null;
  brief: DeploymentBrief;
  onBriefChange: (brief: DeploymentBrief) => void;
  onAnnotationAdd: (section: string, text: string) => void;
}

export function ReactCanvas({ jsx, brief, onBriefChange, onAnnotationAdd }: ReactCanvasProps) {
  const rendered = useMemo(() => {
    if (jsx === null) return null;

    try {
      const result = transform(jsx, {
        transforms: ['jsx'],
        jsxRuntime: 'classic',
        jsxPragma: 'React.createElement',
        jsxFragmentPragma: 'React.Fragment',
      });

      const ConfigPanel = new Function(
        'React',
        'useState',
        'useEffect',
        'useCallback',
        'useMemo',
        'useRef',
        result.code + '; return ConfigPanel;'
      )(React, useState, useEffect, useCallback, useMemo, useRef);

      return { Component: ConfigPanel, error: null };
    } catch (err) {
      return { Component: null, error: err instanceof Error ? err.message : String(err) };
    }
  }, [jsx]);

  if (jsx === null) {
    return (
      <div className="config">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <p style={{ color: '#999', fontSize: '14px' }}>
            Start a conversation to build the deployment brief.
          </p>
        </div>
      </div>
    );
  }

  if (rendered?.error) {
    return (
      <div className="config">
        <div style={{ border: '1px solid #dc2626', borderRadius: '3px', padding: '16px' }}>
          <p style={{ color: '#dc2626', fontWeight: 600, marginBottom: '8px' }}>Error rendering panel</p>
          <p style={{ color: '#dc2626', fontSize: '13px', marginBottom: '12px' }}>{rendered.error}</p>
          <details>
            <summary style={{ cursor: 'pointer', fontSize: '12px', color: '#999' }}>Show raw JSX</summary>
            <pre style={{ marginTop: '8px', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#555' }}>
              {jsx}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  const ConfigPanel = rendered!.Component;

  return (
    <div className="config">
      <ConfigPanel brief={brief} onBriefChange={onBriefChange} onAnnotationAdd={onAnnotationAdd} />
    </div>
  );
}
```

Key changes: props are now `brief`, `onBriefChange`, `onAnnotationAdd`. The component passes these to the agent-generated `ConfigPanel`.

- [ ] **Step 2: Commit**

```bash
git add src/components/ReactCanvas.tsx
git commit -m "feat(daimon-provisioner): update ReactCanvas for DeploymentBrief props

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Update ChatPanel — Brief + Annotations

**Files:**
- Modify: `apps/daimon-provisioner/src/components/ChatPanel.tsx`

- [ ] **Step 1: Update ChatPanel to use DeploymentBrief**

Replace the entire contents of `src/components/ChatPanel.tsx` with:

```typescript
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { DeploymentBrief, ChatMessage } from '@/lib/types';

const SYSTEM_MESSAGE: ChatMessage = {
  role: 'system',
  content: "Describe the client and what the bot should do. I'll build the deployment brief as we go.",
};

interface ChatPanelProps {
  brief: DeploymentBrief;
  onBriefChange: (brief: DeploymentBrief) => void;
  onRender?: (jsx: string) => void;
  initialMessages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
}

export function ChatPanel({ brief, onBriefChange, onRender, initialMessages, onMessagesChange }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialMessages && initialMessages.length > 0) return initialMessages;
    return [SYSTEM_MESSAGE];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const briefRef = useRef(brief);

  useEffect(() => {
    briefRef.current = brief;
  }, [brief]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    onMessagesChange?.(messages);
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  async function sendMessage(content?: string) {
    const text = (content ?? input).trim();
    if (!text || loading) return;

    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const chatMessages = [...messages.filter(m => m.role !== 'system'), userMsg].map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages, brief: briefRef.current }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7);
          } else if (line.startsWith('data: ') && eventType) {
            const data = JSON.parse(line.slice(6));

            if (eventType === 'text') {
              assistantText += data.content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return [...prev.slice(0, -1), { ...last, content: assistantText }];
                }
                return [...prev, { role: 'assistant', content: assistantText }];
              });
            } else if (eventType === 'render') {
              onRender?.(data.jsx);
            } else if (eventType === 'brief') {
              onBriefChange(data.brief);
            } else if (eventType === 'done') {
              // Finalize
            }
            eventType = '';
          }
        }
      }

      if (assistantText) {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return [...prev.slice(0, -1), { role: 'assistant', content: assistantText }];
          }
          return [...prev, { role: 'assistant', content: assistantText }];
        });
      }
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="chat">
      <div className="chat-head">
        <div className="chat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className="chat-title-group">
          <div className="chat-title">Deploy Assistant</div>
          <div className="chat-status">
            <span className={`chat-status-dot${loading ? ' thinking' : ''}`} />
            {loading ? 'Thinking' : 'Ready'}
          </div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => {
          if (msg.role === 'system') {
            return (
              <div key={i} className="msg msg-sys">
                {msg.content}
              </div>
            );
          }

          if (msg.role === 'user') {
            return (
              <div key={i} className="msg msg-u">
                {msg.content}
              </div>
            );
          }

          return (
            <div key={i} className="msg msg-b msg-markdown">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          );
        })}

        {loading && (
          <div className="typing-indicator">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-row">
          <input
            className="chat-field"
            placeholder="Describe the client and what the bot should do..."
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
        <div className="chat-hint">Enter to send · Shift+Enter for new line</div>
      </div>
    </div>
  );
}
```

Key changes: `config` → `brief`, `onConfigChange` → `onBriefChange`, SSE event `config` → `brief`, placeholder text updated, title changed to "Deploy Assistant".

- [ ] **Step 2: Commit**

```bash
git add src/components/ChatPanel.tsx
git commit -m "feat(daimon-provisioner): update ChatPanel for DeploymentBrief

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Update API Route — Brief Types

**Files:**
- Modify: `apps/daimon-provisioner/src/app/api/chat/route.ts`

- [ ] **Step 1: Update route.ts for DeploymentBrief**

Read the current `src/app/api/chat/route.ts` first. Then make these changes:

1. Change the import from `InstanceConfig` to `DeploymentBrief`:
```typescript
import type { DeploymentBrief } from '@/lib/types';
```

2. Update the request body destructuring:
```typescript
const { messages, brief } = body as {
  messages: Array<{ role: string; content: string }>;
  brief: DeploymentBrief;
};
```

3. Update the render_ui tool description:
```typescript
const renderTool = tool(
  'render_ui',
  'Render a React component as the deployment brief panel. The component must be named ConfigPanel and receives props: { brief, onBriefChange, onAnnotationAdd }. brief is a DeploymentBrief object. onBriefChange updates the brief. onAnnotationAdd(section, text) adds an inline comment. Use inline styles only.',
  { jsx: z.string().describe('Complete React function component. Must be named ConfigPanel. Receives props: { brief, onBriefChange, onAnnotationAdd }. Use inline styles only.') },
  async ({ jsx }) => {
    send('render', { jsx });
    return { content: [{ type: 'text' as const, text: 'Component rendered successfully.' }] };
  },
);
```

4. Update the prompt call:
```typescript
const prompt = buildPrompt(lastUserMessage.content, brief);
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat(daimon-provisioner): update API route for DeploymentBrief

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Update Agent Prompt — Deployment Brief Focus

**Files:**
- Rewrite: `apps/daimon-provisioner/src/lib/agent-prompt.ts`

- [ ] **Step 1: Rewrite agent-prompt.ts**

Replace the entire contents of `src/lib/agent-prompt.ts` with:

```typescript
import type { DeploymentBrief } from './types';

export const SYSTEM_PROMPT = `You are a deployment brainstorming assistant for Daimon bot instances. A CPO or CEO describes what a new client's bot should do, and you build a Deployment Brief — a structured document that a coding agent can later use to fork the Daimon repo, configure env vars, and deploy.

You have access to the decision-orchestrator codebase. Read it to verify what integrations, tools, and capabilities actually exist before recommending anything.

## Your Goal

Build a complete DeploymentBrief through conversation. The brief has:
- **Title & Summary** — who is the client, what does the bot do (1-2 sentences)
- **Integrations** — which platforms to connect, why, which specific tools, and what env vars are needed
- **User Journeys** — concrete end-to-end workflows the bot will handle, with specific tool calls at each step
- **Credentials Checklist** — every env var needed for deployment, with have/needed/unknown status
- **Deployment Notes** — implementation details captured during brainstorming

## Available Integrations (20 platforms, 80+ tools)

Only recommend these — they actually exist in the codebase:

| Platform | Key Tools | Required Env Vars |
|----------|-----------|-------------------|
| Discord | read_channel, read_thread, send_message, search_messages, create_thread | DISCORD_BOT_TOKEN, DISCORD_GUILD_ID |
| Fly.io | launch_session, stop_session, list_sessions, list_templates | FLY_API_TOKEN |
| Bluedot | list_meetings, get_transcript, get_summary, search_transcripts | BLUEDOT_SESSION_COOKIES |
| Onyx RAG | list_agents, query | ONYX_API_KEY |
| LinkedIn | create_post, list_posts, get_share_stats, get_follower_stats, list_campaigns, get_ad_analytics | LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_ORG_ID |
| HubSpot | list_contacts, get_contact, list_deals, get_deal, search_crm | HUBSPOT_ACCESS_TOKEN |
| Toggl Track | time entries, projects, tasks, workspace, analytics, reporting (34 tools) | TOGGL_WORKSPACE_ID, TOGGL_ORGANIZATION_ID, TOGGL_API_KEY |
| Google Analytics | run_report, get_traffic_overview, get_top_pages, get_campaign_performance | GOOGLE_ANALYTICS_SERVICE_ACCOUNT_JSON, GOOGLE_ANALYTICS_PROPERTY_ID |
| SSR Panels | panel_create, panel_run, panel_results, panel_list | OPENAI_API_KEY |
| Notion | search, get_page, query_database, list_pages | NOTION_API_KEY |
| Linear | list_issues, search_issues, create_issue, update_issue | LINEAR_API_KEY |
| Google Workspace | Drive, Gmail, Calendar, Sheets, Docs (via gws_run) | GWS_CREDENTIALS_JSON |
| Dub | list_links, get_analytics | DUB_API_KEY |
| Image Generation | generate_image (GPT-Image-1, DALL-E-3, Imagen 4) | OPENAI_API_KEY or GEMINI_API_KEY |

Every deployment also needs these base credentials:
- ANTHROPIC_API_KEY (Claude API)
- SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY (database)
- E2B_API_KEY (sandbox execution)
- FLY_API_TOKEN (deployment infrastructure)

## UI Rendering

You have a \`render_ui\` MCP tool. Use it to render a React component called \`ConfigPanel\`.

Props: \`{ brief: DeploymentBrief, onBriefChange: (brief) => void, onAnnotationAdd: (section, text) => void }\`

\`\`\`typescript
interface DeploymentBrief {
  id: string;
  title: string;
  summary: string;
  status: 'brainstorming' | 'ready' | 'deploying' | 'deployed';
  integrations: Array<{ platform: string; purpose: string; tools: string[]; env_vars: string[] }>;
  journeys: Array<{ title: string; description: string; steps: Array<{ action: string; tool: string | null; platform: string | null }> }>;
  credentials: Array<{ env_var: string; platform: string; status: 'needed' | 'have' | 'unknown'; note: string | null }>;
  notes: string[];
  annotations: Array<{ id: string; section: string; text: string; resolved: boolean }>;
  chat_messages: Array<{ role: string; content: string }>;
  current_jsx: string | null;
  created_at: string;
  updated_at: string;
}
\`\`\`

Each \`render_ui\` call replaces the previous UI entirely. Call \`onBriefChange(updatedBrief)\` when the brief data changes. The user can call \`onAnnotationAdd(section, text)\` to add inline comments.

## What to Render — Deployment Brief Sections

Build the brief progressively. The component should be a polished, information-dense document with expandable sections.

### 1. Header (always show)
- Brief title (e.g., "Acme Corp — Marketing Ops Bot")
- Status badge (brainstorming/ready)
- Summary paragraph — elevator pitch of what the bot does

### 2. Integrations (show after discussing what the bot needs)
- Each platform as a card: name, purpose, specific tools as blue tags, env vars as gray tags
- Inline annotation display: amber callouts with resolve button
- Comment input at bottom of section

### 3. User Journeys (show after discussing workflows)
- Expandable/collapsible per journey
- Step-by-step flow with connector dots and lines
- Steps show: action text, tool name in blue, platform name in gray
- Tool-using steps get a blue dot; non-tool steps get a gray dot
- Comment input at bottom

### 4. Credentials Checklist (auto-populated from integrations)
- Every env var needed, with color-coded status: green "Have", red "Needed", amber "Unknown"
- Auto-generate from selected integrations — when you add HubSpot, HUBSPOT_ACCESS_TOKEN appears as "Needed"
- Always include base credentials (ANTHROPIC_API_KEY, SUPABASE_*, E2B_API_KEY, FLY_API_TOKEN)

### 5. Deployment Notes (show when relevant)
- Bullet list of implementation notes captured during conversation
- Examples: "Use SCHEDULED prompt variant for weekly reports", "Needs CHANNEL_MAPPINGS for report routing"

## Annotations

When the brief has unresolved annotations (\`annotations.filter(a => !a.resolved)\`), address them FIRST before other work. Acknowledge the comment in chat, then update the brief if needed (e.g., change a credential status, add a note, modify an integration).

## Progressive Rendering

1. **First render**: After understanding the client — show header + initial integrations
2. **Second render**: After discussing workflows — add user journeys
3. **Third render+**: Refine, add credentials checklist, deployment notes

Never render empty sections. Only show sections that have real content from the conversation.

## Styling Rules

Use inline styles only. No CSS classes, no Tailwind.

**Design system:**
- Display font: 'Archivo', sans-serif — 700-900 weight, uppercase for section labels, letter-spacing 1.8px
- Body font: 'Libre Franklin', sans-serif — 400-600 weight
- Colors: bg #FAFAF6, surface #FFFFFF, ink #1a1a1a, ink-2 #555, ink-3 #999, ink-4 #ccc, rule #e5e2da, blue #006FFF, blue-light rgba(0,111,255,0.06), blue-border rgba(0,111,255,0.18), green #16a34a, amber #b45309, red #dc2626
- Spacing: 8, 12, 16, 20, 24, 32, 40px grid
- Border radius: 3px cards, 2px badges

**Section headers**: Archivo 9px uppercase, 700 weight, 1.8px letter-spacing, #999. Include count badge. Clickable to expand/collapse with chevron.
**Integration cards**: White bg, 1px #e5e2da border. Platform name bold 13px, purpose in #999, tool tags in blue-light, env var tags in gray.
**Journey steps**: Vertical connector with dots (blue for tool steps, gray for non-tool). Action text 12px, tool name in blue bold, platform in gray.
**Credential rows**: Flex row with monospace env var name, platform label, and color-coded status badge.
**Annotations**: Amber bg (rgba(180,83,9,0.04)), amber border, 💬 icon, resolve link.
**Comment inputs**: Bottom of each section, subtle input + dark submit button.

**Quality bar:**
- Clear visual hierarchy
- Dense but well-spaced
- Scrollable: overflow-y auto, height: calc(100vh - 52px) on outer container
- Professional polish — no raw dumps, no empty shells

**Never:**
- Generic gray boxes or unstyled HTML controls
- Raw JSON/array dumps
- Monospace for non-code content
- Empty placeholder sections

## Conversation Style

- Ask one question at a time
- Offer multiple choice when possible
- When the user describes "the bot should do X", immediately turn it into a structured journey with specific tool calls
- Cite what you found in the codebase when recommending integrations
- Be concise — the brief is the artifact, not the chat
`;

export function buildPrompt(
  userMessage: string,
  brief: DeploymentBrief,
): string {
  const unresolvedAnnotations = brief.annotations.filter(a => !a.resolved);
  const annotationContext = unresolvedAnnotations.length > 0
    ? `\n\n⚠️ UNRESOLVED ANNOTATIONS (address these first):\n${unresolvedAnnotations.map(a => `- [${a.section}] "${a.text}"`).join('\n')}`
    : '';

  return \`Current deployment brief:
\\\`\\\`\\\`json
\${JSON.stringify(brief, null, 2)}
\\\`\\\`\\\`\${annotationContext}

User message: \${userMessage}\`;
}
```

**IMPORTANT:** The template literal in `buildPrompt` uses backticks. The inner JSON code fence needs escaped backticks. When implementing, make sure the template literal nesting is correct — the outer function uses backticks, and the markdown code fence inside uses escaped backticks (\\\`).

- [ ] **Step 2: Commit**

```bash
git add src/lib/agent-prompt.ts
git commit -m "feat(daimon-provisioner): rewrite agent prompt for deployment brief brainstorming

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: Update Dashboard — BriefTable

**Files:**
- Modify: `apps/daimon-provisioner/src/components/InstanceTable.tsx` (rename to BriefTable)
- Modify: `apps/daimon-provisioner/src/app/page.tsx`

- [ ] **Step 1: Rewrite InstanceTable.tsx as BriefTable**

Replace the entire contents of `src/components/InstanceTable.tsx` with:

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { DeploymentBrief } from '@/lib/types';

interface BriefTableProps {
  briefs: DeploymentBrief[];
  onDelete?: (id: string) => void;
}

function formatTimestamp(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 2) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
}

function statusClass(status: DeploymentBrief['status']): string {
  switch (status) {
    case 'brainstorming': return 'status-draft';
    case 'ready': return 'status-running';
    case 'deploying': return 'status-deploying';
    case 'deployed': return 'status-running';
  }
}

function statusLabel(status: DeploymentBrief['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function BriefTable({ briefs, onDelete }: BriefTableProps) {
  const router = useRouter();

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Brief</th>
            <th>Status</th>
            <th>Integrations</th>
            <th>Journeys</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {briefs.map(brief => (
            <tr key={brief.id} onClick={() => router.push(`/instances/${brief.id}`)} style={{ cursor: 'pointer' }}>
              <td>
                <div className="client-name">{brief.title || '(untitled)'}</div>
                <div className="client-desc">{brief.summary}</div>
              </td>
              <td>
                <span className={`status-badge ${statusClass(brief.status)}`}>
                  <span className="status-dot-sm" />
                  {statusLabel(brief.status)}
                </span>
              </td>
              <td>
                <span className="tool-count">
                  <span>{brief.integrations.length}</span>
                </span>
              </td>
              <td>
                <span className="tool-count">
                  <span>{brief.journeys.length}</span>
                </span>
              </td>
              <td>
                <span className="timestamp">{formatTimestamp(brief.updated_at)}</span>
              </td>
              <td>
                {onDelete && (
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(brief.id);
                    }}
                    title="Delete brief"
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                      <path d="M5.75 1a.75.75 0 00-.75.75V3H2a.75.75 0 000 1.5h.37l.63 9.49A1.75 1.75 0 004.75 15.5h6.5A1.75 1.75 0 0013 13.99l.63-9.49H14A.75.75 0 0014 3h-3V1.75A.75.75 0 0010.25 1h-4.5zM6.5 3V2.5h3V3h-3zm-2.13 1.5h7.26l-.62 9.31a.25.25 0 01-.25.19h-6.5a.25.25 0 01-.25-.19L4.37 4.5z" />
                    </svg>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 2: Update dashboard page.tsx**

Replace the entire contents of `src/app/page.tsx` with:

```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { BriefTable } from '@/components/InstanceTable';
import { getBriefs, deleteBrief } from '@/lib/store';
import { DeploymentBrief } from '@/lib/types';

export default function Home() {
  const [briefs, setBriefs] = useState<DeploymentBrief[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBriefs()
      .then(setBriefs)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <TopBar />
      <div className="content">
        <div className="page-head">
          <h1 className="page-title">Deployment Briefs</h1>
          <Link href="/new" className="new-btn">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
            </svg>
            New Brief
          </Link>
        </div>
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#999', fontSize: '13px' }}>
            Loading briefs...
          </div>
        ) : (
          <BriefTable briefs={briefs} onDelete={async (id) => {
            await deleteBrief(id);
            setBriefs(prev => prev.filter(b => b.id !== id));
          }} />
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/InstanceTable.tsx src/app/page.tsx
git commit -m "feat(daimon-provisioner): update dashboard for DeploymentBrief

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Update New Page — Brief + Annotations

**Files:**
- Modify: `apps/daimon-provisioner/src/app/new/page.tsx`

- [ ] **Step 1: Rewrite new/page.tsx for DeploymentBrief**

Replace the entire contents of `src/app/new/page.tsx` with:

```typescript
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TopBar } from '@/components/TopBar';
import { ReactCanvas } from '@/components/ReactCanvas';
import { ChatPanel } from '@/components/ChatPanel';
import { createEmptyBrief, saveBrief } from '@/lib/store';
import { DeploymentBrief, ChatMessage } from '@/lib/types';

export default function NewBriefPage() {
  const [brief, setBrief] = useState<DeploymentBrief>(() => createEmptyBrief());
  const [jsx, setJsx] = useState<string | null>(null);
  const savedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback((updated: DeploymentBrief) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      saveBrief(updated);
    }, 300);
  }, []);

  const handleRender = useCallback((newJsx: string) => {
    setJsx(newJsx);
    if (!savedRef.current) {
      savedRef.current = true;
    }
    setBrief(prev => {
      const updated = { ...prev, current_jsx: newJsx };
      save(updated);
      return updated;
    });
  }, [save]);

  const handleBriefChange = useCallback((updated: DeploymentBrief) => {
    setBrief(updated);
    if (savedRef.current) {
      save(updated);
    }
  }, [save]);

  const handleAnnotationAdd = useCallback((section: string, text: string) => {
    setBrief(prev => {
      const annotation = {
        id: crypto.randomUUID(),
        section,
        text,
        resolved: false,
      };
      const updated = { ...prev, annotations: [...prev.annotations, annotation] };
      if (savedRef.current) {
        save(updated);
      }
      return updated;
    });
  }, [save]);

  const handleMessagesChange = useCallback((msgs: ChatMessage[]) => {
    if (savedRef.current) {
      setBrief(prev => {
        const updated = { ...prev, chat_messages: msgs };
        save(updated);
        return updated;
      });
    }
  }, [save]);

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
        <ReactCanvas jsx={jsx} brief={brief} onBriefChange={handleBriefChange} onAnnotationAdd={handleAnnotationAdd} />
        <ChatPanel
          brief={brief}
          onBriefChange={handleBriefChange}
          onRender={handleRender}
          onMessagesChange={handleMessagesChange}
        />
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/new/page.tsx
git commit -m "feat(daimon-provisioner): update new page for DeploymentBrief + annotations

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 9: Update Instance Detail Page

**Files:**
- Modify: `apps/daimon-provisioner/src/app/instances/[id]/page.tsx`

- [ ] **Step 1: Rewrite instance detail page for DeploymentBrief**

Replace the entire contents of `src/app/instances/[id]/page.tsx` with:

```typescript
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { ReactCanvas } from '@/components/ReactCanvas';
import { ChatPanel } from '@/components/ChatPanel';
import { getBrief, saveBrief } from '@/lib/store';
import { DeploymentBrief, ChatMessage } from '@/lib/types';

export default function BriefDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [brief, setBrief] = useState<DeploymentBrief | null>(null);
  const [jsx, setJsx] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getBrief(id).then(b => {
      if (!b) {
        router.push('/');
        return;
      }
      setBrief(b);
      if (b.current_jsx) setJsx(b.current_jsx);
      if (b.chat_messages?.length > 0) setInitialMessages(b.chat_messages);
    });
  }, [id, router]);

  const save = useCallback((updated: DeploymentBrief) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      saveBrief(updated);
    }, 300);
  }, []);

  const handleRender = useCallback((newJsx: string) => {
    setJsx(newJsx);
    setBrief(prev => {
      if (!prev) return prev;
      const updated = { ...prev, current_jsx: newJsx };
      save(updated);
      return updated;
    });
  }, [save]);

  const handleBriefChange = useCallback((updated: DeploymentBrief) => {
    setBrief(updated);
    save(updated);
  }, [save]);

  const handleAnnotationAdd = useCallback((section: string, text: string) => {
    setBrief(prev => {
      if (!prev) return prev;
      const annotation = {
        id: crypto.randomUUID(),
        section,
        text,
        resolved: false,
      };
      const updated = { ...prev, annotations: [...prev.annotations, annotation] };
      save(updated);
      return updated;
    });
  }, [save]);

  const handleMessagesChange = useCallback((msgs: ChatMessage[]) => {
    setBrief(prev => {
      if (!prev) return prev;
      const updated = { ...prev, chat_messages: msgs };
      save(updated);
      return updated;
    });
  }, [save]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  if (!brief) return null;

  return (
    <>
      <TopBar />
      <div className="main-split">
        <ReactCanvas jsx={jsx} brief={brief} onBriefChange={handleBriefChange} onAnnotationAdd={handleAnnotationAdd} />
        <ChatPanel
          brief={brief}
          onBriefChange={handleBriefChange}
          onRender={handleRender}
          initialMessages={initialMessages}
          onMessagesChange={handleMessagesChange}
        />
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/instances/[id]/page.tsx
git commit -m "feat(daimon-provisioner): update instance detail page for DeploymentBrief

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 10: Update TopBar

**Files:**
- Modify: `apps/daimon-provisioner/src/components/TopBar.tsx`

- [ ] **Step 1: Update TopBar for brief terminology**

Replace the entire contents of `src/components/TopBar.tsx` with:

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getBriefs } from '@/lib/store';

export function TopBar() {
  const pathname = usePathname();
  const isBriefsPage = pathname === '/';
  const isNewPage = pathname === '/new' || pathname.startsWith('/instances/');

  const [briefCount, setBriefCount] = useState(0);

  useEffect(() => {
    getBriefs().then(briefs => {
      setBriefCount(briefs.length);
    });
  }, [pathname]);

  return (
    <div className="topbar">
      <Link href="/" className="logo">
        <div className="logo-mark">
          <svg viewBox="0 0 16 16" fill="white">
            <path d="M4 3h8a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1zm1 2v2h2V5H5zm4 0v2h2V5H9zM5 9v2h6V9H5z" />
          </svg>
        </div>
        Daimon
      </Link>
      <nav>
        <Link href="/" className={isBriefsPage ? 'active' : ''}>
          Briefs
        </Link>
        <Link href="/new" className={isNewPage ? 'active' : ''}>
          New
        </Link>
      </nav>
      <div className="topbar-right">
        <div className="status-dot" />
        {briefCount} brief{briefCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/TopBar.tsx
git commit -m "feat(daimon-provisioner): update TopBar for deployment brief terminology

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

### Task 11: TypeCheck + Smoke Test

- [ ] **Step 1: Run TypeScript check**

```bash
cd apps/daimon-provisioner
npx tsc --noEmit
```

Expected: PASS — no type errors. If there are errors, fix them.

- [ ] **Step 2: Ensure Supabase is running**

```bash
cd apps/daimon-provisioner
npx supabase@latest status
```

If not running: `npx supabase@latest start`

- [ ] **Step 3: Clear old data from Supabase**

The old InstanceConfig rows won't match DeploymentBrief shape. Clear them:

```bash
curl -X DELETE "http://127.0.0.1:54421/rest/v1/instance_configs?id=not.is.null" \
  -H "apikey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH" \
  -H "Prefer: return=minimal"
```

- [ ] **Step 4: Verify the dev server starts**

```bash
cd apps/daimon-provisioner
npm run dev
```

Open `http://localhost:3000`. Expected: "Deployment Briefs" title, empty table, "New Brief" button.

- [ ] **Step 5: Test new brief flow**

Click "New Brief". Expected: split layout, "Start a conversation to build the deployment brief" on the left, chat panel on right with "Deploy Assistant" title and "Describe the client and what the bot should do..." placeholder.

- [ ] **Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix(daimon-provisioner): smoke test fixes for deployment brief

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

Only create this commit if fixes were needed.

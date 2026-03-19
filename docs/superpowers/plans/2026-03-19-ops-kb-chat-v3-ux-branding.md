# ops-knowledgebase-chat v3 — UX + Branding Overhaul Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform ops-knowledgebase-chat from a dark IDE-like interface to a warm, light-mode Mama Sita's branded web app with token-level streaming and typing indicators.

**Architecture:** Purely visual and UX changes — swap all color tokens to light/cream palette, add streaming via SDK's `includePartialMessages`, add typing indicator component, simplify file preview to download. No structural changes to the three-column layout.

**Tech Stack:** Same stack. Remove `highlight.js` client dependency. Add `includePartialMessages` SDK option.

**Spec:** `docs/superpowers/specs/2026-03-19-ops-kb-chat-v3-ux-branding-design.md`

---

## File Structure

### New Files
```
client/src/components/TypingIndicator.tsx  # Pulsing dot + status text
```

### Modified Files
```
server/src/protocol.ts          # Add assistant_delta
server/src/agent.ts             # includePartialMessages + stream_event handling
server/src/files.ts             # Content-Disposition for download
client/src/types.ts             # Mirror assistant_delta
client/src/index.css            # Full color overhaul + light syntax theme
client/tailwind.config.ts       # All color tokens → light palette
client/src/App.tsx              # agentStatus state, assistant_delta handler
client/src/components/Header.tsx           # Red-brown bg, white text
client/src/components/MessageBubble.tsx     # Card containers for all messages
client/src/components/ToolUseBlock.tsx      # Light theme
client/src/components/ChatInput.tsx        # White bg, warm styling
client/src/components/ChatView.tsx         # Add TypingIndicator
client/src/components/FileExplorer.tsx     # Download on click, remove preview
client/src/components/FileTreeNode.tsx     # Light theme
client/src/components/SessionItem.tsx      # Light theme
client/src/components/SessionHistory.tsx   # White bg
```

### Removed Files
```
client/src/components/FilePreview.tsx   # Replaced by download
```

---

### Task 1: Protocol + Server Streaming

**Files:**
- Modify: `projects/ops-knowledgebase-chat/server/src/protocol.ts`
- Modify: `projects/ops-knowledgebase-chat/server/src/agent.ts`
- Modify: `projects/ops-knowledgebase-chat/server/src/files.ts`
- Modify: `projects/ops-knowledgebase-chat/client/src/types.ts`

- [ ] **Step 1: Add `assistant_delta` to server protocol.ts**

Add to the `ServerMessage` union:
```typescript
  | { type: 'assistant_delta'; content: string }
```

- [ ] **Step 2: Add `assistant_delta` to client types.ts**

Same addition to the client's `ServerMessage` union.

- [ ] **Step 3: Enable streaming in agent.ts**

Add `includePartialMessages: true` to the `query()` options object (after `allowedTools`).

Add a new handler in the `for await` loop, before the existing `msg.type === 'assistant'` check:

```typescript
    // Stream events (partial/incremental text)
    if (msg.type === 'stream_event') {
      const event = msg as Record<string, unknown>;
      if (event.event_type === 'content_block_delta') {
        const delta = event.delta as { type?: string; text?: string } | undefined;
        if (delta?.type === 'text_delta' && delta.text) {
          yield { type: 'assistant_delta', content: delta.text };
        }
      }
    }
```

- [ ] **Step 4: Add Content-Disposition to files.ts**

In the `GET /api/files/{*filePath}` handler, before `res.type('text/plain').send(content)`, add:

```typescript
  const filename = path.basename(fullPath);
  res.set('Content-Disposition', `attachment; filename="${filename}"`);
```

- [ ] **Step 5: Verify server compiles**

Run: `cd projects/ops-knowledgebase-chat/server && npx tsc --noEmit`

- [ ] **Step 6: Commit**

```bash
git add projects/ops-knowledgebase-chat/server/src/protocol.ts projects/ops-knowledgebase-chat/server/src/agent.ts projects/ops-knowledgebase-chat/server/src/files.ts projects/ops-knowledgebase-chat/client/src/types.ts
git commit -m "feat(ops-kb-chat): add token streaming + file download headers"
```

---

### Task 2: TypingIndicator Component

**Files:**
- Create: `projects/ops-knowledgebase-chat/client/src/components/TypingIndicator.tsx`

- [ ] **Step 1: Create TypingIndicator.tsx**

```tsx
interface TypingIndicatorProps {
  status: string;
}

export function TypingIndicator({ status }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 py-2 animate-fade-in-up">
      <span
        className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-streaming flex-shrink-0"
      />
      <span className="text-sm text-text-secondary italic font-body">
        {status}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/components/TypingIndicator.tsx
git commit -m "feat(ops-kb-chat): add TypingIndicator component"
```

---

### Task 3: Color System Overhaul (CSS + Tailwind)

**Files:**
- Modify: `projects/ops-knowledgebase-chat/client/src/index.css`
- Modify: `projects/ops-knowledgebase-chat/client/tailwind.config.ts`

- [ ] **Step 1: Update CSS custom properties in index.css**

Replace the `:root` block (lines 12-49 approximately) with the new light palette:

```css
:root {
  --surface-0: #ffffff;
  --surface-1: #fdf6ee;
  --surface-2: #f5ede3;
  --surface-3: #ebe3d9;
  --surface-4: #d9d0c5;

  --text-primary: #2c2420;
  --text-secondary: #6b5e52;
  --text-muted: #a09488;
  --text-inverse: #ffffff;

  --accent-red: #a83227;
  --accent-red-hover: #c23b2f;
  --accent-red-subtle: rgba(168, 50, 39, 0.08);

  --accent-gold: #faac54;
  --accent-gold-hover: #ffbc6e;
  --accent-gold-subtle: rgba(250, 172, 84, 0.08);

  --status-success: #3d8c5c;
  --status-warning: #d4942e;
  --status-error: #a83227;
  --status-info: #3d7a8c;

  --border-default: rgba(107, 94, 82, 0.15);
  --border-strong: rgba(107, 94, 82, 0.30);

  --code-bg: #faf5ef;
  --code-text: #4a3f35;

  --tool-bg: #faf5ef;
  --tool-border: #ebe3d9;
  --tool-border-active: #faac54;

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-focus: 0 0 0 2px var(--accent-red);
}
```

- [ ] **Step 2: Update body styles**

In the `body` CSS rule, the background and color will inherit from CSS vars (already uses `var(--surface-1)` and `var(--text-primary)`), so no change needed there. But update the `::selection` style:

```css
  ::selection {
    background-color: var(--accent-gold-subtle);
    color: var(--text-primary);
  }
```

- [ ] **Step 3: Update scrollbar styles**

The scrollbar thumb and track need light-mode treatment. Update the scrollbar CSS:

```css
  * {
    scrollbar-width: thin;
    scrollbar-color: var(--surface-4) transparent;
  }
  ::-webkit-scrollbar-thumb {
    background-color: var(--surface-4);
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color: var(--text-muted);
  }
```

(These should already reference CSS vars — verify and update if hardcoded.)

- [ ] **Step 4: Update `.app-header` class**

Change the header to use red-brown background:

```css
  .app-header {
    height: 48px;
    background: var(--accent-red);
    border-bottom: none;
    /* ... keep layout properties ... */
  }

  .app-header-title {
    /* ... existing ... */
    color: var(--text-inverse);
  }
```

- [ ] **Step 5: Update `.msg-user` class**

```css
  .msg-user {
    background: var(--surface-0);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    /* ... keep other properties ... */
  }
```

- [ ] **Step 6: Update `.chat-input` class**

```css
  .chat-input {
    background: var(--surface-0);
    border: 1px solid var(--border-default);
    color: var(--text-primary);
    /* ... keep other properties ... */
  }

  .chat-input::placeholder {
    color: var(--text-muted);
  }

  .chat-input:focus {
    border-color: var(--accent-red);
  }
```

- [ ] **Step 7: Update syntax highlighting to light theme**

Replace all `.hljs-*` color values:

```css
  .hljs-keyword, .hljs-selector-tag, .hljs-built_in, .hljs-type { color: #a83227; }
  .hljs-string, .hljs-attr, .hljs-symbol, .hljs-template-variable { color: #b8762a; }
  .hljs-number, .hljs-literal, .hljs-variable.constant_ { color: #3d7a6a; }
  .hljs-comment, .hljs-quote, .hljs-doctag { color: #a09488; font-style: italic; }
  .hljs-function, .hljs-title { color: #4a3f35; }
  .hljs-variable, .hljs-params { color: #6b5e52; }
  .hljs-operator, .hljs-punctuation { color: #a09488; }
  .hljs-title.class_ { color: #3d7a8c; }
  .hljs-meta, .hljs-meta .hljs-keyword { color: #8a7a5a; }
  .hljs-section { color: var(--accent-gold); }
  .hljs-addition { color: var(--status-success); background: rgba(61, 140, 92, 0.08); }
  .hljs-deletion { color: var(--status-error); background: rgba(168, 50, 39, 0.08); }
```

- [ ] **Step 8: Update tailwind.config.ts colors**

Replace all color values in the `extend.colors` object:

```typescript
colors: {
  surface: {
    0: "#ffffff",
    1: "#fdf6ee",
    2: "#f5ede3",
    3: "#ebe3d9",
    4: "#d9d0c5",
  },
  accent: {
    red: {
      DEFAULT: "#a83227",
      hover: "#c23b2f",
      subtle: "rgba(168, 50, 39, 0.08)",
    },
    gold: {
      DEFAULT: "#faac54",
      hover: "#ffbc6e",
      subtle: "rgba(250, 172, 84, 0.08)",
    },
  },
  status: {
    success: "#3d8c5c",
    warning: "#d4942e",
    error: "#a83227",
    info: "#3d7a8c",
  },
  text: {
    primary: "#2c2420",
    secondary: "#6b5e52",
    muted: "#a09488",
    inverse: "#ffffff",
  },
  code: {
    bg: "#faf5ef",
    text: "#4a3f35",
  },
  tool: {
    bg: "#faf5ef",
    border: "#ebe3d9",
    "border-active": "#faac54",
  },
},
borderColor: {
  default: "rgba(107, 94, 82, 0.15)",
  strong: "rgba(107, 94, 82, 0.30)",
},
boxShadow: {
  sm: "0 1px 2px rgba(0,0,0,0.06)",
  md: "0 4px 12px rgba(0,0,0,0.08)",
  input: "0 0 0 1px rgba(107, 94, 82, 0.15)",
  focus: "0 0 0 2px #a83227",
},
```

- [ ] **Step 9: Verify client compiles**

Run: `cd projects/ops-knowledgebase-chat/client && npx tsc --noEmit`

- [ ] **Step 10: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/index.css projects/ops-knowledgebase-chat/client/tailwind.config.ts
git commit -m "style(ops-kb-chat): swap to Mama Sita's light/cream palette"
```

---

### Task 4: Reskin All Components

**Files:**
- Modify: `projects/ops-knowledgebase-chat/client/src/components/Header.tsx`
- Modify: `projects/ops-knowledgebase-chat/client/src/components/MessageBubble.tsx`
- Modify: `projects/ops-knowledgebase-chat/client/src/components/ToolUseBlock.tsx`
- Modify: `projects/ops-knowledgebase-chat/client/src/components/ChatInput.tsx`
- Modify: `projects/ops-knowledgebase-chat/client/src/components/FileExplorer.tsx`
- Modify: `projects/ops-knowledgebase-chat/client/src/components/FileTreeNode.tsx`
- Modify: `projects/ops-knowledgebase-chat/client/src/components/SessionItem.tsx`
- Modify: `projects/ops-knowledgebase-chat/client/src/components/SessionHistory.tsx`
- Remove: `projects/ops-knowledgebase-chat/client/src/components/FilePreview.tsx`

Read each component file first, then apply these changes:

- [ ] **Step 1: Update Header.tsx**

Change to red-brown background with white text:
- Outer `<header>`: add `style={{ background: '#a83227' }}` (or use a class)
- All text and icons: white (`text-white` or `text-text-inverse`)
- Status dot: keep green for connected, use white outline for disconnected
- Toggle button strokes: white when inactive, `#faac54` (gold) when active
- `btn-ghost` on New button: `text-white hover:bg-white/10`

- [ ] **Step 2: Update MessageBubble.tsx**

User message: white card with border
```tsx
<div className="max-w-[85%] bg-white border border-default rounded-lg px-4 py-3 text-text-primary font-body text-base whitespace-pre-wrap animate-fade-in-up">
```

Assistant message: gold-tinted card with border, contains tool blocks + text
```tsx
<div className="max-w-prose rounded-lg px-4 py-3 border border-default animate-fade-in-up" style={{ background: 'rgba(250, 172, 84, 0.08)' }}>
```

Error message: red-tinted card
```tsx
<div className="max-w-prose rounded-lg px-4 py-3 border border-accent-red-subtle animate-fade-in-up" style={{ background: 'rgba(168, 50, 39, 0.08)' }}>
```

- [ ] **Step 3: Update ToolUseBlock.tsx**

Light theme — cream bg, warm brown text:
- Container: `bg-code-bg border-l-2 border-l-tool-border` (gold when expanded: `border-l-tool-border-active`)
- Header text: `text-text-secondary hover:text-text-primary`
- Tool name: `text-text-primary font-medium`
- Input summary: `text-text-muted`
- Output section: `text-code-text` on `bg-code-bg`

- [ ] **Step 4: Update ChatInput.tsx**

- Outer container: `bg-white border-t border-default` (was `bg-surface-1`)
- Input: already uses `chat-input` class which is updated in CSS
- Send button: `bg-accent-red text-white` (already `btn-primary`)
- Stop button: `text-accent-red`
- Upload button: `text-text-secondary hover:text-text-primary`
- Hint text: `text-text-muted`

- [ ] **Step 5: Update FileExplorer.tsx**

- Remove `FilePreview` import and `previewPath` state
- Change `onFileClick` to trigger download: `window.open('/api/files/' + encodeURIComponent(path), '_blank')`
- Sidebar background: `bg-white` (was `bg-surface-0` which is now white — same thing)
- Text colors: `text-text-secondary`, `text-text-muted`

- [ ] **Step 6: Update FileTreeNode.tsx**

- Hover: `hover:bg-surface-2` (warm cream)
- Text: `text-text-secondary hover:text-text-primary`
- Arrows: `text-text-muted`

- [ ] **Step 7: Update SessionItem.tsx**

- Active border: `border-l-accent-gold` (stays the same token but new gold color)
- Active bg: `bg-surface-2` (warm cream)
- Title: `text-text-primary`
- Timestamp: `text-text-muted`

- [ ] **Step 8: Update SessionHistory.tsx**

- Background: `bg-white border-l border-default`
- Header text: `text-text-muted`

- [ ] **Step 9: Delete FilePreview.tsx**

```bash
rm projects/ops-knowledgebase-chat/client/src/components/FilePreview.tsx
```

- [ ] **Step 10: Remove highlight.js dependency**

```bash
cd projects/ops-knowledgebase-chat/client && npm uninstall highlight.js
```

- [ ] **Step 11: Verify client compiles**

Run: `cd projects/ops-knowledgebase-chat/client && npx tsc --noEmit`

- [ ] **Step 12: Commit**

```bash
git add -A projects/ops-knowledgebase-chat/client/
git commit -m "style(ops-kb-chat): reskin all components to Mama Sita's light theme"
```

---

### Task 5: App.tsx — Streaming + Typing Indicator

**Files:**
- Modify: `projects/ops-knowledgebase-chat/client/src/App.tsx`
- Modify: `projects/ops-knowledgebase-chat/client/src/components/ChatView.tsx`

- [ ] **Step 1: Add agentStatus state to App.tsx**

```typescript
const [agentStatus, setAgentStatus] = useState<string | null>(null);
```

- [ ] **Step 2: Handle assistant_delta in handleMessage**

Add case in the switch:

```typescript
case 'assistant_delta':
  setAgentStatus(null); // Clear status once text starts flowing
  setMessages((prev) => {
    const last = prev[prev.length - 1];
    if (last && last.role === 'assistant') {
      return [
        ...prev.slice(0, -1),
        { ...last, content: last.content + msg.content },
      ];
    }
    return [
      ...prev,
      { id: nextId(), role: 'assistant', content: msg.content, toolUses: [] },
    ];
  });
  break;
```

- [ ] **Step 3: Derive status from tool_use events**

In the `tool_use` case, after updating messages, add:

```typescript
// Derive typing status from tool use
const toolInput = msg.input as Record<string, unknown> | undefined;
let statusText = `Using ${msg.tool}...`;
switch (msg.tool) {
  case 'Read': statusText = `Reading ${toolInput?.file_path || 'file'}...`; break;
  case 'Grep': statusText = `Searching for ${toolInput?.pattern || 'pattern'}...`; break;
  case 'Glob': statusText = 'Finding files...'; break;
  case 'Bash': statusText = 'Running command...'; break;
  case 'Write': statusText = `Writing ${toolInput?.file_path || 'file'}...`; break;
  case 'Edit': statusText = `Editing ${toolInput?.file_path || 'file'}...`; break;
  case 'WebSearch': statusText = 'Searching the web...'; break;
  case 'WebFetch': statusText = 'Fetching page...'; break;
}
setAgentStatus(statusText);
```

- [ ] **Step 4: Set "Thinking..." on send, clear on done**

In `handleSend`, after `setIsStreaming(true)`:
```typescript
setAgentStatus('Thinking...');
```

In the `done` case:
```typescript
setAgentStatus(null);
```

In the `error` case:
```typescript
setAgentStatus(null);
```

In the `assistant_text` case (existing full-message handler), add at the top:
```typescript
setAgentStatus(null);
```

- [ ] **Step 5: Pass agentStatus to ChatView**

```tsx
<ChatView messages={messages} agentStatus={agentStatus} />
```

- [ ] **Step 6: Update ChatView.tsx to show TypingIndicator**

Add `agentStatus` to props:
```typescript
interface ChatViewProps {
  messages: ChatMessage[];
  agentStatus: string | null;
}
```

Import and render TypingIndicator before the bottom scroll ref:
```tsx
import { TypingIndicator } from './TypingIndicator';

// In the JSX, before <div ref={bottomRef} />:
{agentStatus && <TypingIndicator status={agentStatus} />}
```

- [ ] **Step 7: Update App.tsx background**

The root div background: `bg-surface-1` (now cream via CSS vars — no code change needed, but verify it renders cream not dark).

- [ ] **Step 8: Verify client compiles**

Run: `cd projects/ops-knowledgebase-chat/client && npx tsc --noEmit`

- [ ] **Step 9: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/App.tsx projects/ops-knowledgebase-chat/client/src/components/ChatView.tsx
git commit -m "feat(ops-kb-chat): add streaming + typing indicator to UI"
```

---

### Task 6: Build + Visual QA

**Files:** None (verification only)

- [ ] **Step 1: Build server**

Run: `cd projects/ops-knowledgebase-chat/server && npm run build`

- [ ] **Step 2: Build client**

Run: `cd projects/ops-knowledgebase-chat/client && npm run build`

- [ ] **Step 3: Start server locally and verify visually**

```bash
cd projects/ops-knowledgebase-chat/server
cp -r ../client/dist ./public
mkdir -p /tmp/ops-kb-v3-workspace
echo "Test file" > /tmp/ops-kb-v3-workspace/readme.txt
WORKSPACE_DIR=/tmp/ops-kb-v3-workspace node dist/index.js
```

Open http://localhost:8080 and verify:
- Cream background, white sidebars
- Red-brown header with white text
- Send a message — typing indicator shows "Thinking..."
- Agent response streams token-by-token in gold-tinted card
- Tool use blocks show warm cream theme
- File explorer shows files, clicking downloads
- Commit any fixes

---

### Task 7: Deploy to Fly

- [ ] **Step 1: Deploy**

```bash
cd projects/ops-knowledgebase-chat && fly deploy
```

- [ ] **Step 2: Verify at https://ops-knowledgebase-chat.fly.dev/**

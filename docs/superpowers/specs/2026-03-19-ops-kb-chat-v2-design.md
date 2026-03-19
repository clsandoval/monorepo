# ops-knowledgebase-chat v2 — Design Spec

**Date:** 2026-03-19
**Location:** `projects/ops-knowledgebase-chat/`
**Builds on:** `docs/superpowers/specs/2026-03-19-ops-knowledgebase-chat-design.md`

## Purpose

Add three features to the existing ops-knowledgebase-chat: a filesystem explorer sidebar (left), a session history sidebar (right), and `@` file autocomplete in the chat input. These transform the app from a single-session chat into a persistent, browsable knowledgebase tool.

## Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  [☰] ops-knowledgebase-chat  ●               [New]  [Sessions ☰]  │
├──────────┬──────────────────────────────────┬───────────────────────┤
│ FILES    │                                  │ SESSIONS              │
│ [⟳]     │  Chat messages (scrollable)      │                       │
│          │                                  │ ┌───────────────────┐ │
│ ▼ /      │                                  │ │ ● Budget review   │ │
│   notes… │                                  │ │   Mar 19, 8:37p   │ │
│   readme…│                                  │ └───────────────────┘ │
│   data…  │                                  │ ┌───────────────────┐ │
│ ▼ reports│                                  │ │   File analysis    │ │
│   q1.pdf │                                  │ │   Mar 19, 7:12p   │ │
│          │                                  │ └───────────────────┘ │
│          ├──────────────────────────────────┤                       │
│          │ [📎] [ Type or @mention...  ] [▶]│                       │
│          │  ctrl+enter · ctrl+u · esc       │                       │
├──────────┴──────────────────────────────────┴───────────────────────┤
```

- **Header:** Left toggle `[☰]` for file explorer, right toggle `[Sessions ☰]` for session history
- **Left sidebar:** 240px wide, `surface-0` background, collapsible
- **Right sidebar:** 260px wide, `surface-0` background, collapsible
- **Main area:** Flexible width, chat layout adjusts when sidebars open/close
- **Sidebars collapse** by sliding out, chat area expands to fill
- **Keyboard:** Existing shortcuts preserved (Ctrl+Enter, Ctrl+U, Ctrl+N, Esc)

## Feature 1: Filesystem Explorer (Left Sidebar)

### API

`GET /api/files` — returns recursive directory tree of `/workspace`, excluding `.sessions/`.

```typescript
interface FileTreeNode {
  name: string;
  path: string;        // relative to /workspace
  type: 'file' | 'directory';
  children?: FileTreeNode[];  // directories only
  size?: number;        // bytes, files only
}
```

`GET /api/files/*` — returns raw file content for a given path (for preview). Path is validated and confined to `/workspace` — requests containing `..` or absolute paths outside the workspace are rejected with 400.

**Performance:** Directory tree is capped at 1000 files and depth 10. Directories beyond these limits are truncated with a `truncated: true` flag on the node.

### UI

- Full directory tree, expandable/collapsible folders with `▶`/`▼` arrows
- Files show name only (no size/date)
- Monospace font (`IBM Plex Mono`)
- Refresh button `[⟳]` in sidebar header re-fetches the tree
- **Single click on a file** opens a read-only preview modal

### File Preview Modal

- Centered overlay, `surface-1` background, max 80% viewport width/height
- File path in header, content in scrollable `<pre>` with syntax highlighting
- Close with X button, Esc, or clicking outside
- Syntax highlighting via `highlight.js` directly (not `rehype-highlight`, since preview renders raw text in `<pre>`, not Markdown). `highlight.js` is already a transitive dependency.

## Feature 2: Session History (Right Sidebar)

### Persistence

Sessions saved as JSON files in `/workspace/.sessions/`:

```
/workspace/.sessions/
  {session-id}.json
```

Each file contains:
```typescript
interface SessionData {
  id: string;
  title: string;           // agent-generated, 3-5 words
  createdAt: string;        // ISO 8601
  sessionId?: string;       // Agent SDK session ID for resume
  lastAssistantUuid?: string; // for resumeSessionAt
  messages: Array<{
    role: 'user' | 'assistant' | 'error';
    content: string;
    toolUses?: Array<{ id: string; tool: string; input: unknown; output?: string }>;
    timestamp: string;
  }>;
}
```

### Session Lifecycle

1. **Creation:** When the first `user_message` arrives on a new session, `sessions.ts` generates a UUID for the `SessionData.id` and creates the JSON file. The SDK's `session_id` (from `session_init`) is stored separately as `SessionData.sessionId` for resume support.
2. **Saving:** After each agent turn (`done` message), `sessions.ts` appends the new messages and updates `lastAssistantUuid` in the session file.
3. **Loading:** When client sends `load_session`, the WebSocket handler in `index.ts` reads the session file, sends all messages to the client as a `session_loaded` batch message, then prepares a new `AgentSession` with `sessionId` and `lastAssistantUuid` from the saved data so the next user message resumes the SDK session.

### Title Generation

After the first agent response completes, the server makes a **separate one-shot `query()` call** (not through the main agent stream) to generate a title. This uses a simple string prompt: "Given this conversation start, generate a 3-5 word title. User asked: {first message}. Respond with just the title." The title is saved to the session file and sent to the client via a `session_title` message. This call is fire-and-forget — it does not block the chat flow and its output never appears in the chat UI.

### API

- `GET /api/sessions` — returns `{ id, title, createdAt }[]`, sorted newest first
- `GET /api/sessions/:id` — returns full `SessionData` for loading a past session

### UI

- Each session is a card: title (bold), relative timestamp below (muted text)
- Active session highlighted with `accent-gold` left border
- Click a session to load it — clears current chat, renders that session's messages, resumes the agent session via `resume`/`resumeSessionAt`
- New Session button creates a fresh session, appears at top of list
- Session list scrollable

### Protocol Additions

```typescript
// New server → client
| { type: 'session_title'; title: string }
| { type: 'session_loaded'; session: SessionData }  // full session data for rendering

// New client → server
| { type: 'load_session'; session_id: string }
```

When client sends `load_session`, the WebSocket handler in `index.ts`:
1. Ends the current agent stream (same as `new_session`)
2. Reads `/workspace/.sessions/{id}.json`
3. Sends `{ type: 'session_loaded', session }` to the client (client renders all messages)
4. Creates a new `AgentSession` with `sessionId` and `lastAssistantUuid` from the saved data, so the next `user_message` resumes the SDK session

This requires adding a `load_session` case to the WebSocket `switch` in `index.ts`.

## Feature 3: @ File Autocomplete

### Trigger

User types `@` in the chat input. A dropdown appears above the cursor showing matching files.

### Data Source

Reuses the file tree data already fetched by the `useFileTree` hook for the filesystem explorer. No extra API call — client filters locally.

### Matching

Matches against filename and relative path. `@q1` matches `reports/q1.pdf`. `@notes` matches `notes.md`. Case-insensitive. Flat list (not tree) in the dropdown — shows paths like `reports/q1.pdf`.

### UI

- Dropdown appears after `@`, filters as user types
- Max 8 results, scrollable if more
- Arrow keys to navigate, Enter/Tab to select, Esc to dismiss
- On select: inserts `@path/to/file` as plain text into the message
- Styled with `surface-2` background, `border-default` border, monospace font
- Positioned above the input, left-aligned with the textarea (not cursor-tracking — simpler to implement)

## New Server Files

| File | Purpose |
|------|---------|
| `server/src/files.ts` | Router for `/api/files` and `/api/files/*` endpoints |
| `server/src/sessions.ts` | Router for `/api/sessions` endpoints + session persistence logic |

## New Client Files

| File | Purpose |
|------|---------|
| `components/FileExplorer.tsx` | Left sidebar — tree view with expand/collapse |
| `components/FileTreeNode.tsx` | Single tree node (file or directory) |
| `components/FilePreview.tsx` | Read-only modal for file content |
| `components/SessionHistory.tsx` | Right sidebar — session list |
| `components/SessionItem.tsx` | Single session card |
| `components/FileAutocomplete.tsx` | Dropdown for `@` mentions |
| `hooks/useFileTree.ts` | Fetches and caches `/api/files` |
| `hooks/useSessions.ts` | Fetches and caches `/api/sessions` |

## Modified Files

| File | Changes |
|------|---------|
| `client/src/App.tsx` | Three-column flex layout, sidebar open/close state, session loading, file tree state |
| `client/src/components/Header.tsx` | Add left and right sidebar toggle buttons |
| `client/src/components/ChatInput.tsx` | Detect `@` keypress, render `FileAutocomplete` dropdown, handle selection |
| `client/src/types.ts` | Add `session_title`, `session_loaded`, `load_session` to message unions; add `FileTreeNode`, `SessionData` types |
| `client/src/App.tsx` | (also) Handle `session_title` in `handleMessage` — update active session title in session list; handle `session_loaded` — render saved messages |
| `client/src/index.css` | Add sidebar, modal, autocomplete, tree-node CSS classes |
| `server/src/index.ts` | Mount `filesRouter` and `sessionsRouter` **before** static/catch-all middleware; add `load_session` case to WebSocket handler |
| `server/src/agent.ts` | Accept callbacks for message persistence; emit session events |
| `server/src/protocol.ts` | Add `session_title`, `session_loaded`, and `load_session` message types |

## Design System Consistency

All new components follow the existing "Control Room Warmth" design system:
- Surfaces: `surface-0` for sidebars, `surface-1` for main area, `surface-2` for interactive elements
- Text: `text-primary` for content, `text-muted` for timestamps/labels
- Accents: `accent-gold` for active session indicator, `accent-red` for primary actions
- Font: `IBM Plex Mono` for file names and paths, `Nunito Sans` for session titles
- Borders: `border-default` for separators
- Animations: `fade-in-up 200ms` for modals and dropdowns

## Out of Scope

- Session search/filter (can be added later)
- Session deletion
- File editing from the explorer
- Drag-and-drop files into chat
- Mobile/responsive layout (desktop only for now)

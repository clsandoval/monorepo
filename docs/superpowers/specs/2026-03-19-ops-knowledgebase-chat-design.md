# ops-knowledgebase-chat — Design Spec

**Date:** 2026-03-19
**Location:** `projects/ops-knowledgebase-chat/`

## Purpose

A self-hosted, browser-based Claude Code experience for document Q&A. Seed a persistent filesystem with PDFs, docs, and any files — then interact with a Claude agent that can Read, Grep, Glob, and reason over them. An alternative to uploading files to ChatGPT or Claude.ai, with full agent capabilities.

## Architecture

```
┌─────────────────────┐       WebSocket        ┌─────────────────────────┐
│   React (Vite) SPA  │◄──────────────────────►│   Express + WS Server   │
│                     │                         │                         │
│  - Chat UI          │   { type, data }        │  - query() async gen    │
│  - Tool use blocks  │   JSON protocol         │  - Session management   │
│  - File upload      │                         │  - Slash command pass-  │
│                     │                         │    through to agent     │
└─────────────────────┘                         └────────────┬────────────┘
                                                             │
                                                    Agent SDK query()
                                                             │
                                                ┌────────────▼────────────┐
                                                │   /workspace volume     │
                                                │                         │
                                                │  Seeded PDFs, docs,     │
                                                │  any files              │
                                                └─────────────────────────┘
```

- Single Fly app, single Dockerfile
- Express serves static React build + WebSocket on same port
- `/workspace` is a Fly persistent volume for seeded files
- Agent SDK's `query()` async generator streams messages over WebSocket

## Server

### Technology
- **Runtime:** Node.js 22
- **Framework:** Express
- **WebSocket:** `ws` library
- **Agent SDK:** `@anthropic-ai/claude-agent-sdk`

### WebSocket Protocol

Client and server exchange JSON messages:

```typescript
// Client → Server
type ClientMessage =
  | { type: 'user_message'; content: string }      // Regular message or /slash command
  | { type: 'interrupt' }                           // Abort current stream

// Server → Client
type ServerMessage =
  | { type: 'assistant_text'; content: string }     // Streamed text chunk
  | { type: 'tool_use'; tool: string; input: any }  // Agent using a tool
  | { type: 'tool_result'; output: string }         // Tool result
  | { type: 'session_init'; session_id: string }    // Session created
  | { type: 'done' }                                // Stream complete
  | { type: 'error'; message: string }              // Error
```

### Agent Configuration

```typescript
query({
  prompt: userMessage,  // or MessageStream for multi-turn
  options: {
    cwd: '/workspace',
    permissionMode: 'bypassPermissions',
    allowDangerouslySkipPermissions: true,
    allowedTools: [
      'Read', 'Glob', 'Grep',
      'Write', 'Edit',
      'Bash',
      'WebSearch', 'WebFetch',
      'Skill', 'ToolSearch',
      'TodoWrite',
    ],
    systemPrompt: {
      type: 'preset',
      preset: 'claude_code',
      append: '... custom system prompt for knowledgebase context ...',
    },
  },
})
```

### Session Management

- Uses NanoClaw's `MessageStream` pattern — async iterable that keeps the session alive for multi-turn
- Session resume via `resume` + `resumeSessionAt` options
- `/new` meta action from client ends the current MessageStream and starts a fresh `query()`

### File Upload Endpoint

```
POST /api/upload
Content-Type: multipart/form-data

→ Writes files to /workspace/<original-filename>
→ Returns { files: [{ name, path, size }] }
```

## Client

### Technology
- **Framework:** React 19 (Vite)
- **Styling:** Tailwind CSS
- **Markdown:** `react-markdown` + `remark-gfm` + `rehype-highlight`

### Layout

```
┌──────────────────────────────────────────────┐
│  Header: ops-knowledgebase-chat    [New] [⚙] │
├──────────────────────────────────────────────┤
│                                              │
│  Message bubbles (scrollable)                │
│                                              │
│  ┌─ assistant ─────────────────────────────┐ │
│  │ Markdown rendered response              │ │
│  │ Code blocks with syntax highlighting    │ │
│  │ Tool use blocks (collapsible)           │ │
│  └─────────────────────────────────────────┘ │
│                                              │
│  ┌─ user ──────────────────────────────────┐ │
│  │ Your message                            │ │
│  └─────────────────────────────────────────┘ │
│                                              │
├──────────────────────────────────────────────┤
│  [📎] [  Type a message...        ] [Send]   │
│        Ctrl+Enter to send                    │
└──────────────────────────────────────────────┘
```

### Key Components

- **ChatView** — Main container, manages message list and scroll
- **MessageBubble** — Renders a single message (user or assistant)
- **ToolUseBlock** — Collapsible block showing tool name, input, and output
- **ChatInput** — Textarea with send button, upload button, keyboard shortcuts
- **Header** — App name, model indicator, New Session button

### Features

- **Streaming text** — Token-by-token rendering as WebSocket delivers
- **Markdown rendering** — Full GFM support with syntax-highlighted code blocks
- **Tool use visibility** — Collapsible sections showing what the agent did (Read file X, Grep for Y)
- **Slash commands** — Typed in input, sent to agent verbatim (agent handles via Skill tool)
- **File upload** — 📎 button opens file picker, POSTs to `/api/upload`, writes to `/workspace`

### Meta Controls (outside the agent)

| Action | Trigger | Behavior |
|--------|---------|----------|
| New session | Header button or `Ctrl+N` | Clears chat, starts fresh `query()` |
| Upload files | 📎 button or `Ctrl+U` | File picker → `POST /api/upload` → `/workspace` |
| Interrupt | `Esc` or stop button | Sends `{ type: 'interrupt' }` over WebSocket |

## Deployment

### Dockerfile

```dockerfile
# Stage 1: Build React app
FROM node:22-alpine AS frontend
WORKDIR /app/client
COPY client/ .
RUN npm ci && npm run build

# Stage 2: Server + static assets
FROM node:22-alpine
RUN npm i -g @anthropic-ai/claude-code
WORKDIR /app
COPY server/ .
RUN npm ci
COPY --from=frontend /app/client/dist ./public
CMD ["node", "dist/index.js"]
```

### Fly Configuration

- **App name:** `ops-knowledgebase-chat`
- **Volume:** `/workspace` — persistent, survives deploys
- **Secret:** `ANTHROPIC_API_KEY` via `fly secrets set`
- **Port:** 8080
- **Machine:** `shared-cpu-2x` or `performance-1x`

### File Seeding

- Upload via the UI (📎 button)
- Or `fly ssh console` and drop files directly into `/workspace`
- Files persist across deploys via Fly volume

## Project Structure

```
projects/ops-knowledgebase-chat/
├── client/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── components/
│   │   │   ├── ChatView.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── ToolUseBlock.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   └── Header.tsx
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts
│   │   ├── types.ts
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.ts
├── server/
│   ├── src/
│   │   ├── index.ts          # Express + WS setup
│   │   ├── agent.ts          # Agent SDK wrapper (query, MessageStream)
│   │   ├── protocol.ts       # WebSocket message types
│   │   └── upload.ts         # File upload handler
│   ├── package.json
│   └── tsconfig.json
├── Dockerfile
├── fly.toml
└── README.md
```

## Dependencies

### Server
- `express`
- `ws`
- `@anthropic-ai/claude-agent-sdk`
- `multer` (file uploads)
- `typescript`

### Client
- `react`, `react-dom`
- `react-markdown`, `remark-gfm`, `rehype-highlight`
- `tailwindcss`
- `typescript`, `vite`

## Out of Scope (for now)

- Conversation history / sidebar with past sessions
- Authentication / multi-user
- MCP server integration (can be added later)
- File browser UI (agent can list files via Glob)

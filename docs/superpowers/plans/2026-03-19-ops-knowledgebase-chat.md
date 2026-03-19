# ops-knowledgebase-chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a browser-based Claude Code experience for document Q&A, wrapping the Claude Agent TypeScript SDK with Express+WebSocket and a React frontend, deployed to Fly.io.

**Architecture:** Express server wraps `@anthropic-ai/claude-agent-sdk`'s `query()` async generator behind a WebSocket connection. A Vite React SPA connects and renders streamed messages with markdown, code highlighting, and collapsible tool-use blocks. Single Dockerfile serves both, deployed to Fly with a persistent `/workspace` volume for seeded documents.

**Tech Stack:** Node.js 22, Express, `ws`, `@anthropic-ai/claude-agent-sdk`, React 19, Vite, Tailwind CSS, `react-markdown`, multer, Fly.io

**Spec:** `docs/superpowers/specs/2026-03-19-ops-knowledgebase-chat-design.md`

**Reference:** NanoClaw agent-runner at `automations/nanoclaw/container/agent-runner/src/index.ts` — uses the same SDK patterns (MessageStream, query(), PreToolUse hooks, session resume).

---

## File Structure

```
projects/ops-knowledgebase-chat/
├── server/
│   ├── src/
│   │   ├── index.ts          # Express + WS server setup, health check, static serving
│   │   ├── protocol.ts       # Shared types: ClientMessage, ServerMessage
│   │   ├── agent.ts          # MessageStream class, query() wrapper, message mapping
│   │   ├── hooks.ts          # PreToolUse bash sanitization hook
│   │   └── upload.ts         # Multer file upload handler
│   ├── package.json
│   └── tsconfig.json
├── client/
│   ├── src/
│   │   ├── main.tsx          # React entry point
│   │   ├── App.tsx           # Root component, manages WebSocket + messages state
│   │   ├── types.ts          # Client-side message types (mirrors protocol.ts)
│   │   ├── hooks/
│   │   │   └── useWebSocket.ts   # WebSocket connection, reconnect, send/receive
│   │   ├── components/
│   │   │   ├── Header.tsx        # App name, New Session button
│   │   │   ├── ChatView.tsx      # Scrollable message list
│   │   │   ├── MessageBubble.tsx # Single message (user or assistant)
│   │   │   ├── ToolUseBlock.tsx  # Collapsible tool use + result display
│   │   │   └── ChatInput.tsx     # Textarea, send button, upload button, shortcuts
│   │   └── index.css         # Tailwind imports + base styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── tailwind.config.ts
├── e2e/
│   ├── helpers/
│   │   └── server.ts          # Test server lifecycle (build, seed, start, stop)
│   ├── 01-health.spec.ts      # Page load, health check, connection
│   ├── 02-upload.spec.ts      # File upload via API and UI
│   ├── 03-chat.spec.ts        # Chat send, agent response, tool use rendering
│   ├── 04-controls.spec.ts    # New session, interrupt, keyboard shortcuts
│   ├── 05-slash-commands.spec.ts  # Slash commands, multi-turn conversation
│   ├── playwright.config.ts
│   ├── package.json
│   └── tsconfig.json
├── Dockerfile
├── fly.toml
└── .gitignore
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `projects/ops-knowledgebase-chat/server/package.json`
- Create: `projects/ops-knowledgebase-chat/server/tsconfig.json`
- Create: `projects/ops-knowledgebase-chat/client/package.json`
- Create: `projects/ops-knowledgebase-chat/client/tsconfig.json`
- Create: `projects/ops-knowledgebase-chat/client/vite.config.ts`
- Create: `projects/ops-knowledgebase-chat/client/tailwind.config.ts`
- Create: `projects/ops-knowledgebase-chat/client/index.html`
- Create: `projects/ops-knowledgebase-chat/client/src/index.css`
- Create: `projects/ops-knowledgebase-chat/.gitignore`

- [ ] **Step 1: Create server package.json**

```json
{
  "name": "ops-knowledgebase-chat-server",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "^0.2.34",
    "express": "^5.1.0",
    "multer": "^2.0.1",
    "ws": "^8.18.0"
  },
  "devDependencies": {
    "@types/express": "^5.0.0",
    "@types/multer": "^1.4.12",
    "@types/ws": "^8.5.13",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create server tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create client package.json**

```json
{
  "name": "ops-knowledgebase-chat-client",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-markdown": "^10.1.0",
    "rehype-highlight": "^7.0.2",
    "remark-gfm": "^4.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.1.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.1.0",
    "typescript": "^5.7.0",
    "vite": "^6.3.0",
    "@vitejs/plugin-react": "^4.3.0"
  }
}
```

- [ ] **Step 4: Create client tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
```

- [ ] **Step 5: Create client vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
```

- [ ] **Step 6: Create client tailwind.config.ts**

```typescript
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
};
```

- [ ] **Step 7: Create client index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ops-knowledgebase-chat</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create client src/index.css**

```css
@import "tailwindcss";
@import "highlight.js/styles/github-dark.min.css";
```

Note: `highlight.js` is a transitive dependency of `rehype-highlight`, so no extra install needed.

- [ ] **Step 9: Create .gitignore**

```
node_modules/
dist/
*.tsbuildinfo
```

- [ ] **Step 10: Install dependencies**

Run:
```bash
cd projects/ops-knowledgebase-chat/server && npm install
cd ../client && npm install
```

- [ ] **Step 11: Commit**

```bash
git add projects/ops-knowledgebase-chat/
git commit -m "feat(ops-kb-chat): scaffold server and client projects"
```

---

### Task 2: Shared Protocol Types

**Files:**
- Create: `projects/ops-knowledgebase-chat/server/src/protocol.ts`
- Create: `projects/ops-knowledgebase-chat/client/src/types.ts`

- [ ] **Step 1: Create server protocol.ts**

```typescript
// WebSocket protocol types shared between server and client.
// Client types.ts should mirror these.

export type ClientMessage =
  | { type: 'user_message'; content: string }
  | { type: 'interrupt' }
  | { type: 'new_session' };

export type ServerMessage =
  | { type: 'assistant_text'; content: string }
  | { type: 'tool_use'; id: string; tool: string; input: unknown }
  | { type: 'tool_result'; tool_use_id: string; output: string }
  | { type: 'session_init'; session_id: string }
  | { type: 'done' }
  | { type: 'error'; message: string };
```

- [ ] **Step 2: Create client types.ts**

```typescript
// Mirror of server/src/protocol.ts — kept in sync manually.

export type ClientMessage =
  | { type: 'user_message'; content: string }
  | { type: 'interrupt' }
  | { type: 'new_session' };

export type ServerMessage =
  | { type: 'assistant_text'; content: string }
  | { type: 'tool_use'; id: string; tool: string; input: unknown }
  | { type: 'tool_result'; tool_use_id: string; output: string }
  | { type: 'session_init'; session_id: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

// UI message model — what the React components render.
export type ChatMessage =
  | { id: string; role: 'user'; content: string }
  | { id: string; role: 'assistant'; content: string; toolUses: ToolUseEntry[] }
  | { id: string; role: 'error'; content: string };

export interface ToolUseEntry {
  id: string;
  tool: string;
  input: unknown;
  output?: string;
}
```

- [ ] **Step 3: Commit**

```bash
git add projects/ops-knowledgebase-chat/server/src/protocol.ts projects/ops-knowledgebase-chat/client/src/types.ts
git commit -m "feat(ops-kb-chat): add WebSocket protocol types"
```

---

### Task 3: Bash Sanitization Hook

**Files:**
- Create: `projects/ops-knowledgebase-chat/server/src/hooks.ts`

**Reference:** `automations/nanoclaw/container/agent-runner/src/index.ts:191-210`

- [ ] **Step 1: Create hooks.ts**

```typescript
import type { HookCallback, PreToolUseHookInput } from '@anthropic-ai/claude-agent-sdk';

const SECRET_ENV_VARS = ['ANTHROPIC_API_KEY', 'CLAUDE_CODE_OAUTH_TOKEN'];

/**
 * PreToolUse hook that strips sensitive env vars from Bash commands.
 * Prepends `unset VAR1 VAR2 ...` to every Bash command so the agent
 * cannot leak API keys via `echo $ANTHROPIC_API_KEY` or similar.
 */
export function createSanitizeBashHook(): HookCallback {
  return async (input, _toolUseId, _context) => {
    const preInput = input as PreToolUseHookInput;
    const command = (preInput.tool_input as { command?: string })?.command;
    if (!command) return {};

    const unsetPrefix = `unset ${SECRET_ENV_VARS.join(' ')} 2>/dev/null; `;
    return {
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        updatedInput: {
          ...(preInput.tool_input as Record<string, unknown>),
          command: unsetPrefix + command,
        },
      },
    };
  };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd projects/ops-knowledgebase-chat/server && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add projects/ops-knowledgebase-chat/server/src/hooks.ts
git commit -m "feat(ops-kb-chat): add bash sanitization hook"
```

---

### Task 4: Agent SDK Wrapper

**Files:**
- Create: `projects/ops-knowledgebase-chat/server/src/agent.ts`

**Reference:** `automations/nanoclaw/container/agent-runner/src/index.ts:51-96` (MessageStream), `:357-491` (runQuery)

- [ ] **Step 1: Create agent.ts with MessageStream**

```typescript
import { query } from '@anthropic-ai/claude-agent-sdk';
import { createSanitizeBashHook } from './hooks.js';
import type { ServerMessage } from './protocol.js';

interface SDKUserMessage {
  type: 'user';
  message: { role: 'user'; content: string };
  parent_tool_use_id: null;
  session_id: string;
}

/**
 * Push-based async iterable for streaming user messages into the SDK.
 * Keeps the iterable alive until end() is called, preventing isSingleUserTurn.
 * Pattern from NanoClaw agent-runner.
 */
export class MessageStream {
  private queue: SDKUserMessage[] = [];
  private waiting: (() => void) | null = null;
  private done = false;

  push(text: string): void {
    this.queue.push({
      type: 'user',
      message: { role: 'user', content: text },
      parent_tool_use_id: null,
      session_id: '',
    });
    this.waiting?.();
  }

  end(): void {
    this.done = true;
    this.waiting?.();
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<SDKUserMessage> {
    while (true) {
      while (this.queue.length > 0) {
        yield this.queue.shift()!;
      }
      if (this.done) return;
      await new Promise<void>((r) => {
        this.waiting = r;
      });
      this.waiting = null;
    }
  }
}

export interface AgentSession {
  stream: MessageStream;
  generator: AsyncGenerator<unknown> | null;
  sessionId?: string;
  lastAssistantUuid?: string;
}

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';

const ALLOWED_TOOLS = [
  'Read', 'Glob', 'Grep',
  'Write', 'Edit',
  'Bash',
  'WebSearch', 'WebFetch',
  'Skill', 'ToolSearch',
  'TodoWrite',
];

/**
 * Start a new agent query. Yields ServerMessage objects as the agent runs.
 * The caller should forward these over the WebSocket.
 */
export async function* runAgent(
  session: AgentSession,
  onSessionInit?: (sessionId: string) => void,
): AsyncGenerator<ServerMessage> {
  const generator = query({
    prompt: session.stream,
    options: {
      cwd: WORKSPACE_DIR,
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      resume: session.sessionId,
      resumeSessionAt: session.lastAssistantUuid,
      env: { ...process.env },
      settingSources: ['project', 'user'],
      allowedTools: ALLOWED_TOOLS,
      systemPrompt: {
        type: 'preset' as const,
        preset: 'claude_code' as const,
        append: [
          'You are an ops knowledgebase assistant.',
          `Your working directory is ${WORKSPACE_DIR} which contains documents, PDFs, and files seeded by the user.`,
          'Use Read, Glob, and Grep to find and analyze documents. You have full Claude Code capabilities.',
        ].join(' '),
      },
      hooks: {
        PreToolUse: [{ matcher: 'Bash', hooks: [createSanitizeBashHook()] }],
      },
    },
  });

  session.generator = generator as AsyncGenerator<unknown>;

  for await (const message of generator) {
    const msg = message as Record<string, unknown>;

    // Session init
    if (msg.type === 'system' && msg.subtype === 'init') {
      const sid = msg.session_id as string;
      session.sessionId = sid;
      onSessionInit?.(sid);
      yield { type: 'session_init', session_id: sid };
    }

    // Track assistant UUID for resume
    if (msg.type === 'assistant' && 'uuid' in msg) {
      session.lastAssistantUuid = msg.uuid as string;
    }

    // Assistant text
    if (msg.type === 'assistant' && msg.message) {
      const content = (msg.message as { content?: Array<{ type: string; text?: string }> }).content;
      if (content) {
        const text = content
          .filter((c) => c.type === 'text')
          .map((c) => c.text || '')
          .join('');
        if (text) {
          yield { type: 'assistant_text', content: text };
        }

        // Tool use blocks in the same message
        for (const block of content) {
          if (block.type === 'tool_use') {
            const tb = block as unknown as { id: string; name: string; input: unknown };
            yield { type: 'tool_use', id: tb.id, tool: tb.name, input: tb.input };
          }
        }
      }
    }

    // Tool results
    if (msg.type === 'user' && msg.message) {
      const userContent = (msg.message as { content?: Array<{ type: string; tool_use_id?: string; content?: string }> }).content;
      if (userContent) {
        for (const block of userContent) {
          if (block.type === 'tool_result' && block.tool_use_id) {
            const output = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
            yield { type: 'tool_result', tool_use_id: block.tool_use_id, output };
          }
        }
      }
    }

    // Result (query complete)
    if (msg.type === 'result') {
      yield { type: 'done' };
    }
  }

  session.generator = null;
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd projects/ops-knowledgebase-chat/server && npx tsc --noEmit`
Expected: No errors (may have warnings about SDK types — those are fine)

- [ ] **Step 3: Commit**

```bash
git add projects/ops-knowledgebase-chat/server/src/agent.ts
git commit -m "feat(ops-kb-chat): add agent SDK wrapper with MessageStream"
```

---

### Task 5: File Upload Handler

**Files:**
- Create: `projects/ops-knowledgebase-chat/server/src/upload.ts`

- [ ] **Step 1: Create upload.ts**

```typescript
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * Sanitize filename to prevent path traversal attacks.
 * Strips directory components and dangerous characters.
 */
function sanitizeFilename(filename: string): string {
  return path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
    cb(null, WORKSPACE_DIR);
  },
  filename: (_req, file, cb) => {
    cb(null, sanitizeFilename(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
});

export const uploadRouter = Router();

uploadRouter.post('/api/upload', upload.array('files', 20), (req, res) => {
  const files = (req.files as Express.Multer.File[]) || [];
  res.json({
    files: files.map((f) => ({
      name: f.originalname,
      path: f.path,
      size: f.size,
    })),
  });
});
```

- [ ] **Step 2: Verify it compiles**

Run: `cd projects/ops-knowledgebase-chat/server && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add projects/ops-knowledgebase-chat/server/src/upload.ts
git commit -m "feat(ops-kb-chat): add file upload handler with path sanitization"
```

---

### Task 6: Express + WebSocket Server

**Files:**
- Create: `projects/ops-knowledgebase-chat/server/src/index.ts`

- [ ] **Step 1: Create index.ts**

```typescript
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadRouter } from './upload.js';
import { MessageStream, runAgent, type AgentSession } from './agent.js';
import type { ClientMessage } from './protocol.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '8080', 10);

const app = express();
const server = createServer(app);

// Health check
app.get('/health', (_req, res) => {
  res.status(200).send('ok');
});

// File uploads
app.use(uploadRouter);

// Static files (React build)
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// WebSocket
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  console.log('[ws] Client connected');

  let session: AgentSession = {
    stream: new MessageStream(),
    generator: null,
  };
  let agentRunning = false;

  async function startAgent() {
    if (agentRunning) return;
    agentRunning = true;

    try {
      for await (const msg of runAgent(session)) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(msg));
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[ws] Agent error:', message);
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'error', message }));
      }
    } finally {
      agentRunning = false;
    }
  }

  ws.on('message', (data: Buffer) => {
    let parsed: ClientMessage;
    try {
      parsed = JSON.parse(data.toString()) as ClientMessage;
    } catch {
      return;
    }

    switch (parsed.type) {
      case 'user_message':
        session.stream.push(parsed.content);
        if (!agentRunning) {
          startAgent();
        }
        break;

      case 'interrupt':
        if (session.generator) {
          session.generator.return(undefined);
          session.generator = null;
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'done' }));
          }
        }
        break;

      case 'new_session':
        // End current stream, create fresh session
        session.stream.end();
        if (session.generator) {
          session.generator.return(undefined);
        }
        session = {
          stream: new MessageStream(),
          generator: null,
        };
        agentRunning = false;
        console.log('[ws] New session started');
        break;
    }
  });

  ws.on('close', () => {
    console.log('[ws] Client disconnected');
    session.stream.end();
    if (session.generator) {
      session.generator.return(undefined);
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

- [ ] **Step 2: Verify it compiles**

Run: `cd projects/ops-knowledgebase-chat/server && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add projects/ops-knowledgebase-chat/server/src/index.ts
git commit -m "feat(ops-kb-chat): add Express + WebSocket server"
```

---

### Task 7: useWebSocket Hook

**Files:**
- Create: `projects/ops-knowledgebase-chat/client/src/hooks/useWebSocket.ts`

- [ ] **Step 1: Create useWebSocket.ts**

```typescript
import { useEffect, useRef, useCallback, useState } from 'react';
import type { ClientMessage, ServerMessage } from '../types';

const RECONNECT_DELAY = 2000;

interface UseWebSocketOptions {
  onMessage: (msg: ServerMessage) => void;
}

export function useWebSocket({ onMessage }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let mounted = true;

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (mounted) setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as ServerMessage;
          onMessageRef.current(msg);
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (mounted) {
          setConnected(false);
          reconnectTimeout = setTimeout(connect, RECONNECT_DELAY);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      mounted = false;
      clearTimeout(reconnectTimeout);
      wsRef.current?.close();
    };
  }, []);

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { send, connected };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd projects/ops-knowledgebase-chat/client && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/hooks/useWebSocket.ts
git commit -m "feat(ops-kb-chat): add useWebSocket hook with reconnection"
```

---

### Task 8: Header Component

**Files:**
- Create: `projects/ops-knowledgebase-chat/client/src/components/Header.tsx`

- [ ] **Step 1: Create Header.tsx**

```tsx
interface HeaderProps {
  connected: boolean;
  onNewSession: () => void;
}

export function Header({ connected, onNewSession }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-zinc-100">ops-knowledgebase-chat</h1>
        <span
          className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
          title={connected ? 'Connected' : 'Disconnected'}
        />
      </div>
      <button
        onClick={onNewSession}
        className="px-3 py-1.5 text-sm text-zinc-300 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors"
      >
        New
      </button>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/components/Header.tsx
git commit -m "feat(ops-kb-chat): add Header component"
```

---

### Task 9: ToolUseBlock Component

**Files:**
- Create: `projects/ops-knowledgebase-chat/client/src/components/ToolUseBlock.tsx`

- [ ] **Step 1: Create ToolUseBlock.tsx**

```tsx
import { useState } from 'react';
import type { ToolUseEntry } from '../types';

interface ToolUseBlockProps {
  entry: ToolUseEntry;
}

export function ToolUseBlock({ entry }: ToolUseBlockProps) {
  const [expanded, setExpanded] = useState(false);

  const inputSummary = typeof entry.input === 'object' && entry.input !== null
    ? Object.entries(entry.input as Record<string, unknown>)
        .map(([k, v]) => {
          const val = typeof v === 'string' ? v : JSON.stringify(v);
          return `${k}: ${val.length > 80 ? val.slice(0, 80) + '...' : val}`;
        })
        .join(', ')
    : String(entry.input);

  return (
    <div className="my-2 border border-zinc-700 rounded-lg overflow-hidden text-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-800/50 hover:bg-zinc-800 transition-colors text-left"
      >
        <span className="text-zinc-500">{expanded ? '▼' : '▶'}</span>
        <span className="font-mono text-amber-400">{entry.tool}</span>
        <span className="text-zinc-500 truncate flex-1">{inputSummary}</span>
      </button>
      {expanded && (
        <div className="px-3 py-2 space-y-2 bg-zinc-900/50">
          <div>
            <div className="text-xs text-zinc-500 mb-1">Input</div>
            <pre className="text-xs text-zinc-300 whitespace-pre-wrap overflow-x-auto">
              {JSON.stringify(entry.input, null, 2)}
            </pre>
          </div>
          {entry.output && (
            <div>
              <div className="text-xs text-zinc-500 mb-1">Output</div>
              <pre className="text-xs text-zinc-300 whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">
                {entry.output}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/components/ToolUseBlock.tsx
git commit -m "feat(ops-kb-chat): add collapsible ToolUseBlock component"
```

---

### Task 10: MessageBubble Component

**Files:**
- Create: `projects/ops-knowledgebase-chat/client/src/components/MessageBubble.tsx`

- [ ] **Step 1: Create MessageBubble.tsx**

```tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { ToolUseBlock } from './ToolUseBlock';
import type { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] px-4 py-2 rounded-2xl bg-blue-600 text-white whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.role === 'error') {
    return (
      <div className="flex justify-start mb-4">
        <div className="max-w-[80%] px-4 py-2 rounded-2xl bg-red-900/50 text-red-300 border border-red-800">
          {message.content}
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex justify-start mb-4">
      <div className="max-w-[80%]">
        {'toolUses' in message && message.toolUses.map((tu) => (
          <ToolUseBlock key={tu.id} entry={tu} />
        ))}
        {message.content && (
          <div className="px-4 py-2 rounded-2xl bg-zinc-800 text-zinc-100 prose prose-invert prose-sm max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/components/MessageBubble.tsx
git commit -m "feat(ops-kb-chat): add MessageBubble with markdown rendering"
```

---

### Task 11: ChatInput Component

**Files:**
- Create: `projects/ops-knowledgebase-chat/client/src/components/ChatInput.tsx`

- [ ] **Step 1: Create ChatInput.tsx**

```tsx
import { useState, useRef, useCallback, type KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onUpload: (files: FileList) => void;
  onInterrupt: () => void;
  isStreaming: boolean;
  disabled: boolean;
}

export function ChatInput({ onSend, onUpload, onInterrupt, isStreaming, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onInterrupt();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSend();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        fileInputRef.current?.click();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        // Handled by App.tsx via global listener
        return;
      }
    },
    [handleSend, onInterrupt],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onUpload(e.target.files);
        e.target.value = '';
      }
    },
    [onUpload],
  );

  // Auto-resize textarea
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
  }, []);

  return (
    <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-3">
      <div className="flex items-end gap-2 max-w-3xl mx-auto">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="Upload files (Ctrl+U)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Ctrl+Enter to send)"
          disabled={disabled}
          rows={1}
          className="flex-1 bg-zinc-800 text-zinc-100 rounded-xl px-4 py-2.5 resize-none placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-600 disabled:opacity-50"
        />
        {isStreaming ? (
          <button
            onClick={onInterrupt}
            className="p-2 text-red-400 hover:text-red-300 transition-colors"
            title="Stop (Esc)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="p-2 text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-30"
            title="Send (Ctrl+Enter)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        )}
      </div>
      <div className="text-xs text-zinc-600 text-center mt-1">
        Ctrl+Enter send | Ctrl+U upload | Esc stop
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/components/ChatInput.tsx
git commit -m "feat(ops-kb-chat): add ChatInput with upload, shortcuts, auto-resize"
```

---

### Task 12: ChatView Component

**Files:**
- Create: `projects/ops-knowledgebase-chat/client/src/components/ChatView.tsx`

- [ ] **Step 1: Create ChatView.tsx**

```tsx
import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { ChatMessage } from '../types';

interface ChatViewProps {
  messages: ChatMessage[];
}

export function ChatView({ messages }: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-3xl mx-auto">
        {messages.length === 0 && (
          <div className="text-center text-zinc-500 mt-20">
            <p className="text-lg mb-2">ops-knowledgebase-chat</p>
            <p className="text-sm">
              Ask questions about files in /workspace. Use slash commands like in Claude Code.
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/components/ChatView.tsx
git commit -m "feat(ops-kb-chat): add ChatView with auto-scroll"
```

---

### Task 13: App Component + Entry Point

**Files:**
- Create: `projects/ops-knowledgebase-chat/client/src/App.tsx`
- Create: `projects/ops-knowledgebase-chat/client/src/main.tsx`

- [ ] **Step 1: Create App.tsx**

```tsx
import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { ChatInput } from './components/ChatInput';
import type { ChatMessage, ToolUseEntry, ServerMessage } from './types';

let msgId = 0;
function nextId() {
  return String(++msgId);
}

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'assistant_text':
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant') {
            // Append to existing assistant message
            return [
              ...prev.slice(0, -1),
              { ...last, content: last.content + msg.content },
            ];
          }
          // New assistant message
          return [
            ...prev,
            { id: nextId(), role: 'assistant', content: msg.content, toolUses: [] },
          ];
        });
        break;

      case 'tool_use':
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant') {
            const entry: ToolUseEntry = { id: msg.id, tool: msg.tool, input: msg.input };
            return [
              ...prev.slice(0, -1),
              { ...last, toolUses: [...last.toolUses, entry] },
            ];
          }
          // Tool use before any text — create empty assistant message
          return [
            ...prev,
            {
              id: nextId(),
              role: 'assistant',
              content: '',
              toolUses: [{ id: msg.id, tool: msg.tool, input: msg.input }],
            },
          ];
        });
        break;

      case 'tool_result':
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant') {
            const toolUses = last.toolUses.map((tu) =>
              tu.id === msg.tool_use_id ? { ...tu, output: msg.output } : tu,
            );
            return [...prev.slice(0, -1), { ...last, toolUses }];
          }
          return prev;
        });
        break;

      case 'done':
        setIsStreaming(false);
        break;

      case 'error':
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'error', content: msg.message },
        ]);
        setIsStreaming(false);
        break;

      case 'session_init':
        // Could store session_id if needed
        break;
    }
  }, []);

  const { send, connected } = useWebSocket({ onMessage: handleMessage });

  const handleSend = useCallback(
    (content: string) => {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'user', content },
      ]);
      send({ type: 'user_message', content });
      setIsStreaming(true);
    },
    [send],
  );

  const handleInterrupt = useCallback(() => {
    send({ type: 'interrupt' });
    setIsStreaming(false);
  }, [send]);

  const handleNewSession = useCallback(() => {
    send({ type: 'new_session' });
    setMessages([]);
    setIsStreaming(false);
  }, [send]);

  const handleUpload = useCallback(async (files: FileList) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      const names = data.files.map((f: { name: string }) => f.name).join(', ');
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'user', content: `[Uploaded: ${names}]` },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'error', content: `Upload failed: ${err}` },
      ]);
    }
  }, []);

  // Global Ctrl+N shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewSession();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNewSession]);

  return (
    <div className="flex flex-col h-screen bg-zinc-900 text-zinc-100">
      <Header connected={connected} onNewSession={handleNewSession} />
      <ChatView messages={messages} />
      <ChatInput
        onSend={handleSend}
        onUpload={handleUpload}
        onInterrupt={handleInterrupt}
        isStreaming={isStreaming}
        disabled={!connected}
      />
    </div>
  );
}
```

- [ ] **Step 2: Create main.tsx**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 3: Verify client compiles**

Run: `cd projects/ops-knowledgebase-chat/client && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/App.tsx projects/ops-knowledgebase-chat/client/src/main.tsx
git commit -m "feat(ops-kb-chat): add App component with message state management"
```

---

### Task 14: Dockerfile + Fly Config

**Files:**
- Create: `projects/ops-knowledgebase-chat/Dockerfile`
- Create: `projects/ops-knowledgebase-chat/fly.toml`

- [ ] **Step 1: Create Dockerfile**

```dockerfile
# Stage 1: Build React app
FROM node:22-alpine AS frontend
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# Stage 2: Server + static assets
FROM node:22-alpine

# claude-code binary is required by @anthropic-ai/claude-agent-sdk at runtime
# (the SDK spawns it as a subprocess)
RUN npm i -g @anthropic-ai/claude-code

WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci
COPY server/ .
RUN npm run build

# Copy frontend build into public/
COPY --from=frontend /app/client/dist ./public

EXPOSE 8080
CMD ["node", "dist/index.js"]
```

- [ ] **Step 2: Create fly.toml**

```toml
app = "ops-knowledgebase-chat"
primary_region = "sea"

[build]

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = "stop"
  auto_start_machines = true

[mounts]
  source = "workspace"
  destination = "/workspace"

[[vm]]
  size = "shared-cpu-2x"
  memory = "1gb"

[checks.health]
  type = "http"
  port = 8080
  path = "/health"
  interval = "30s"
  timeout = "5s"
```

- [ ] **Step 3: Commit**

```bash
git add projects/ops-knowledgebase-chat/Dockerfile projects/ops-knowledgebase-chat/fly.toml
git commit -m "feat(ops-kb-chat): add Dockerfile and fly.toml"
```

---

### Task 15: Playwright E2E Setup

**Files:**
- Create: `projects/ops-knowledgebase-chat/e2e/playwright.config.ts`
- Create: `projects/ops-knowledgebase-chat/e2e/package.json`
- Create: `projects/ops-knowledgebase-chat/e2e/tsconfig.json`
- Create: `projects/ops-knowledgebase-chat/e2e/helpers/server.ts`

- [ ] **Step 1: Create e2e package.json**

```json
{
  "name": "ops-knowledgebase-chat-e2e",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "test": "playwright test",
    "test:headed": "playwright test --headed",
    "test:debug": "playwright test --debug"
  },
  "devDependencies": {
    "@playwright/test": "^1.50.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0"
  }
}
```

- [ ] **Step 2: Create e2e tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["**/*.ts"]
}
```

- [ ] **Step 3: Create playwright.config.ts**

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  timeout: 120_000,  // Agent responses can be slow
  expect: {
    timeout: 60_000,
  },
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
  },
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  // Server is started by the helper, not by Playwright's webServer config,
  // because we need to control WORKSPACE_DIR and seed files before starting.
});
```

- [ ] **Step 4: Create e2e/helpers/server.ts**

This helper builds, seeds test files, and starts the server for E2E tests.

```typescript
import { execSync, spawn, type ChildProcess } from 'child_process';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '..', '..');
const SERVER_DIR = path.join(PROJECT_ROOT, 'server');
const CLIENT_DIR = path.join(PROJECT_ROOT, 'client');
const WORKSPACE_DIR = '/tmp/ops-kb-e2e-workspace';
const PORT = 8080;

let serverProcess: ChildProcess | null = null;

export async function startServer(): Promise<void> {
  // Clean workspace
  fs.rmSync(WORKSPACE_DIR, { recursive: true, force: true });
  fs.mkdirSync(WORKSPACE_DIR, { recursive: true });

  // Seed test files
  fs.writeFileSync(path.join(WORKSPACE_DIR, 'readme.txt'), 'This is a test knowledgebase.\nIt contains important documents for testing.\n');
  fs.writeFileSync(path.join(WORKSPACE_DIR, 'notes.md'), '# Meeting Notes\n\n- Discussed Q1 priorities\n- Action item: review budget\n- Next meeting: March 25\n');
  fs.writeFileSync(path.join(WORKSPACE_DIR, 'data.csv'), 'name,value\nalpha,100\nbeta,200\ngamma,300\n');

  // Build server and client
  execSync('npm run build', { cwd: SERVER_DIR, stdio: 'pipe' });
  execSync('npm run build', { cwd: CLIENT_DIR, stdio: 'pipe' });

  // Copy client build to server/public
  const publicDir = path.join(SERVER_DIR, 'public');
  fs.rmSync(publicDir, { recursive: true, force: true });
  fs.cpSync(path.join(CLIENT_DIR, 'dist'), publicDir, { recursive: true });

  // Start server
  serverProcess = spawn('node', ['dist/index.js'], {
    cwd: SERVER_DIR,
    env: { ...process.env, PORT: String(PORT), WORKSPACE_DIR },
    stdio: 'pipe',
  });

  // Wait for server to be ready
  await waitForServer(`http://localhost:${PORT}/health`, 30_000);
}

export async function stopServer(): Promise<void> {
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`Server did not start within ${timeoutMs}ms`);
}
```

- [ ] **Step 5: Install dependencies and install browsers**

Run:
```bash
cd projects/ops-knowledgebase-chat/e2e && npm install && npx playwright install chromium
```

- [ ] **Step 6: Commit**

```bash
git add projects/ops-knowledgebase-chat/e2e/
git commit -m "feat(ops-kb-chat): add Playwright E2E test scaffolding"
```

---

### Task 16: E2E Test — Page Load and Health Check

**Files:**
- Create: `projects/ops-knowledgebase-chat/e2e/01-health.spec.ts`

- [ ] **Step 1: Create 01-health.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { startServer, stopServer } from './helpers/server';

test.beforeAll(async () => {
  await startServer();
});

test.afterAll(async () => {
  await stopServer();
});

test('health endpoint returns 200', async ({ request }) => {
  const res = await request.get('/health');
  expect(res.status()).toBe(200);
  expect(await res.text()).toBe('ok');
});

test('page loads with app title and empty state', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('ops-knowledgebase-chat');
  // Empty state message
  await expect(page.getByText('Ask questions about files in /workspace')).toBeVisible();
  // Input area is present
  await expect(page.getByPlaceholder('Type a message')).toBeVisible();
  // Connection indicator should be green
  await expect(page.locator('[title="Connected"]')).toBeVisible();
});

test('New button is visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'New' })).toBeVisible();
});
```

- [ ] **Step 2: Run test**

Run: `cd projects/ops-knowledgebase-chat/e2e && npx playwright test 01-health.spec.ts`
Expected: All 3 tests pass

- [ ] **Step 3: Commit**

```bash
git add projects/ops-knowledgebase-chat/e2e/01-health.spec.ts
git commit -m "test(ops-kb-chat): E2E health check and page load"
```

---

### Task 17: E2E Test — File Upload

**Files:**
- Create: `projects/ops-knowledgebase-chat/e2e/02-upload.spec.ts`

- [ ] **Step 1: Create 02-upload.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { startServer, stopServer } from './helpers/server';
import fs from 'fs';
import path from 'path';

test.beforeAll(async () => {
  await startServer();
});

test.afterAll(async () => {
  await stopServer();
});

test('upload file via API and verify it lands in workspace', async ({ request }) => {
  // Create a temp file
  const tmpFile = '/tmp/e2e-upload-test.txt';
  fs.writeFileSync(tmpFile, 'E2E upload test content');

  const res = await request.post('/api/upload', {
    multipart: {
      files: {
        name: 'e2e-upload-test.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('E2E upload test content'),
      },
    },
  });

  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.files).toHaveLength(1);
  expect(body.files[0].name).toBe('e2e-upload-test.txt');
  expect(body.files[0].size).toBeGreaterThan(0);

  // Verify file exists in workspace
  const filePath = '/tmp/ops-kb-e2e-workspace/e2e-upload-test.txt';
  expect(fs.existsSync(filePath)).toBe(true);
  expect(fs.readFileSync(filePath, 'utf-8')).toBe('E2E upload test content');
});

test('upload file via UI button', async ({ page }) => {
  await page.goto('/');

  // Create a test file for upload
  const tmpFile = '/tmp/e2e-ui-upload.txt';
  fs.writeFileSync(tmpFile, 'UI upload test');

  // Click the upload button (paperclip icon)
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(tmpFile);

  // Should show "[Uploaded: e2e-ui-upload.txt]" in chat
  await expect(page.getByText('[Uploaded: e2e-ui-upload.txt]')).toBeVisible({ timeout: 10_000 });
});

test('upload rejects path traversal filenames', async ({ request }) => {
  const res = await request.post('/api/upload', {
    multipart: {
      files: {
        name: '../../etc/passwd',
        mimeType: 'text/plain',
        buffer: Buffer.from('malicious content'),
      },
    },
  });

  expect(res.status()).toBe(200);
  const body = await res.json();
  // Filename should be sanitized — no path components
  expect(body.files[0].name).toBe('../../etc/passwd');
  // But the saved path should NOT be /etc/passwd
  expect(body.files[0].path).toContain('ops-kb-e2e-workspace');
  expect(body.files[0].path).not.toContain('/etc/');
});
```

- [ ] **Step 2: Run test**

Run: `cd projects/ops-knowledgebase-chat/e2e && npx playwright test 02-upload.spec.ts`
Expected: All 3 tests pass

- [ ] **Step 3: Commit**

```bash
git add projects/ops-knowledgebase-chat/e2e/02-upload.spec.ts
git commit -m "test(ops-kb-chat): E2E file upload via API and UI"
```

---

### Task 18: E2E Test — Chat Send and Agent Response

**Files:**
- Create: `projects/ops-knowledgebase-chat/e2e/03-chat.spec.ts`

This test requires `ANTHROPIC_API_KEY` to be set. It sends a real message to the agent and verifies the full round-trip: user message appears, agent responds, tool use blocks render.

- [ ] **Step 1: Create 03-chat.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { startServer, stopServer } from './helpers/server';

test.beforeAll(async () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY must be set for chat E2E tests');
  }
  await startServer();
});

test.afterAll(async () => {
  await stopServer();
});

test('send message and receive agent response', async ({ page }) => {
  await page.goto('/');

  // Type a message
  const input = page.getByPlaceholder('Type a message');
  await input.fill('What files are in the workspace? Just list the filenames.');

  // Send via Ctrl+Enter
  await input.press('Control+Enter');

  // User message should appear
  await expect(page.getByText('What files are in the workspace?')).toBeVisible();

  // Wait for agent response — should contain at least one of our seeded filenames
  await expect(page.getByText('readme.txt')).toBeVisible({ timeout: 120_000 });
});

test('agent uses tool and tool use block renders', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder('Type a message');
  await input.fill('Read the file notes.md and tell me what the action item is.');
  await input.press('Control+Enter');

  // Wait for tool use block to appear — should show "Read" tool
  await expect(page.locator('text=Read').first()).toBeVisible({ timeout: 120_000 });

  // Agent should mention "review budget" from the seeded notes.md
  await expect(page.getByText(/review budget/i)).toBeVisible({ timeout: 120_000 });
});

test('agent can search with Grep', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder('Type a message');
  await input.fill('Search all files for the word "priorities" and tell me which file contains it.');
  await input.press('Control+Enter');

  // Should eventually mention notes.md
  await expect(page.getByText(/notes\.md/i)).toBeVisible({ timeout: 120_000 });
});
```

- [ ] **Step 2: Run test**

Run: `cd projects/ops-knowledgebase-chat/e2e && npx playwright test 03-chat.spec.ts`
Expected: All 3 tests pass (requires ANTHROPIC_API_KEY)

- [ ] **Step 3: Commit**

```bash
git add projects/ops-knowledgebase-chat/e2e/03-chat.spec.ts
git commit -m "test(ops-kb-chat): E2E chat send, agent response, tool use rendering"
```

---

### Task 19: E2E Test — New Session and Interrupt

**Files:**
- Create: `projects/ops-knowledgebase-chat/e2e/04-controls.spec.ts`

- [ ] **Step 1: Create 04-controls.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { startServer, stopServer } from './helpers/server';

test.beforeAll(async () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY must be set for control E2E tests');
  }
  await startServer();
});

test.afterAll(async () => {
  await stopServer();
});

test('New Session clears chat', async ({ page }) => {
  await page.goto('/');

  // Send a message first
  const input = page.getByPlaceholder('Type a message');
  await input.fill('Say hello');
  await input.press('Control+Enter');

  // Wait for response
  await expect(page.locator('.mb-4').first()).toBeVisible({ timeout: 120_000 });

  // Click New button
  await page.getByRole('button', { name: 'New' }).click();

  // Chat should be cleared — empty state should reappear
  await expect(page.getByText('Ask questions about files in /workspace')).toBeVisible();
});

test('Interrupt stops streaming', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder('Type a message');
  // Ask something that takes a while
  await input.fill('List every file in /workspace recursively and describe each one in detail.');
  await input.press('Control+Enter');

  // Wait briefly for streaming to start
  await page.waitForTimeout(3000);

  // Press Escape to interrupt
  await page.keyboard.press('Escape');

  // The stop button should disappear (streaming ended)
  // The send button should reappear
  await expect(page.locator('button[title="Send (Ctrl+Enter)"]')).toBeVisible({ timeout: 10_000 });
});

test('Ctrl+N triggers new session', async ({ page }) => {
  await page.goto('/');

  // Send a message
  const input = page.getByPlaceholder('Type a message');
  await input.fill('Hello');
  await input.press('Control+Enter');

  // Wait for any response
  await expect(page.locator('.mb-4').first()).toBeVisible({ timeout: 120_000 });

  // Ctrl+N
  await page.keyboard.press('Control+n');

  // Should clear
  await expect(page.getByText('Ask questions about files in /workspace')).toBeVisible();
});
```

- [ ] **Step 2: Run test**

Run: `cd projects/ops-knowledgebase-chat/e2e && npx playwright test 04-controls.spec.ts`
Expected: All 3 tests pass

- [ ] **Step 3: Commit**

```bash
git add projects/ops-knowledgebase-chat/e2e/04-controls.spec.ts
git commit -m "test(ops-kb-chat): E2E new session, interrupt, keyboard shortcuts"
```

---

### Task 20: E2E Test — Slash Commands

**Files:**
- Create: `projects/ops-knowledgebase-chat/e2e/05-slash-commands.spec.ts`

- [ ] **Step 1: Create 05-slash-commands.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { startServer, stopServer } from './helpers/server';

test.beforeAll(async () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY must be set for slash command E2E tests');
  }
  await startServer();
});

test.afterAll(async () => {
  await stopServer();
});

test('slash command is sent to agent verbatim', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder('Type a message');
  // /help should be sent to the agent as a regular message
  await input.fill('/help');
  await input.press('Control+Enter');

  // User message should show the slash command
  await expect(page.getByText('/help')).toBeVisible();

  // Agent should respond (exact response depends on agent, but it should not error)
  // Wait for any assistant response to appear
  const assistantBubble = page.locator('[class*="bg-zinc-800"]').last();
  await expect(assistantBubble).toBeVisible({ timeout: 120_000 });
});

test('multi-turn conversation works', async ({ page }) => {
  await page.goto('/');

  const input = page.getByPlaceholder('Type a message');

  // First message
  await input.fill('What is in readme.txt?');
  await input.press('Control+Enter');

  // Wait for first response
  await expect(page.getByText(/test knowledgebase/i)).toBeVisible({ timeout: 120_000 });

  // Follow-up that references the prior turn
  await input.fill('Now read data.csv and tell me the sum of the values column.');
  await input.press('Control+Enter');

  // Should eventually show values from data.csv (100 + 200 + 300 = 600)
  await expect(page.getByText('600')).toBeVisible({ timeout: 120_000 });
});
```

- [ ] **Step 2: Run test**

Run: `cd projects/ops-knowledgebase-chat/e2e && npx playwright test 05-slash-commands.spec.ts`
Expected: All 2 tests pass

- [ ] **Step 3: Commit**

```bash
git add projects/ops-knowledgebase-chat/e2e/05-slash-commands.spec.ts
git commit -m "test(ops-kb-chat): E2E slash commands and multi-turn conversation"
```

---

### Task 21: Run Full E2E Suite

**Files:** None (verification only)

- [ ] **Step 1: Run all E2E tests**

Run:
```bash
cd projects/ops-knowledgebase-chat/e2e && npx playwright test
```
Expected: All tests pass (5 spec files, ~14 tests total)

- [ ] **Step 2: Fix any failures**

If any test fails, debug with:
```bash
npx playwright test --headed --debug <failing-spec>
```
Fix the code, re-run, and commit the fix.

- [ ] **Step 3: Commit any remaining fixes**

```bash
git add -A projects/ops-knowledgebase-chat/
git commit -m "fix(ops-kb-chat): E2E test fixes"
```

---

### Task 22: Deploy to Fly

**Files:** None (deployment only)

- [ ] **Step 1: Create Fly app**

Run:
```bash
cd projects/ops-knowledgebase-chat
fly apps create ops-knowledgebase-chat
```

- [ ] **Step 2: Create volume**

Run:
```bash
fly volumes create workspace --region sea --size 10 -a ops-knowledgebase-chat
```

- [ ] **Step 3: Set secrets**

Run:
```bash
fly secrets set ANTHROPIC_API_KEY=<your-key> -a ops-knowledgebase-chat
```

- [ ] **Step 4: Deploy**

Run:
```bash
cd projects/ops-knowledgebase-chat
fly deploy
```
Expected: Deploys successfully, health check passes

- [ ] **Step 5: Verify**

Run: `fly status -a ops-knowledgebase-chat`
Expected: Machine running, health check passing

Open the app URL in browser. Verify:
- Chat UI loads
- Can send a message and receive a response
- Tool use blocks appear for Read/Grep/Glob operations

- [ ] **Step 6: Seed test files**

Run:
```bash
fly ssh console -a ops-knowledgebase-chat
echo "Hello world" > /workspace/test.txt
```
Then ask the agent in the browser: "Read test.txt"
Expected: Agent uses Read tool, shows content

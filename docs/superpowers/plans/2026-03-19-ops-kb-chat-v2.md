# ops-knowledgebase-chat v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add filesystem explorer (left sidebar), session history (right sidebar), and `@` file autocomplete to the existing ops-knowledgebase-chat app.

**Architecture:** Three features added to the existing Express+WebSocket+React app. New REST endpoints serve file tree and session data. Session persistence uses JSON files in `/workspace/.sessions/`. File autocomplete reuses the file tree data client-side. Title generation uses a separate one-shot Agent SDK `query()` call.

**Tech Stack:** Existing stack (Express, ws, @anthropic-ai/claude-agent-sdk, React 19, Vite, Tailwind) + highlight.js for file preview syntax highlighting.

**Spec:** `docs/superpowers/specs/2026-03-19-ops-kb-chat-v2-design.md`

---

## File Structure

### New Server Files
```
server/src/
  files.ts        # GET /api/files (tree) + GET /api/files/* (content)
  sessions.ts     # GET /api/sessions + GET /api/sessions/:id + persistence helpers
```

### New Client Files
```
client/src/
  hooks/
    useFileTree.ts          # Fetch + cache /api/files
    useSessions.ts          # Fetch + cache /api/sessions
  components/
    FileExplorer.tsx        # Left sidebar — tree view
    FileTreeNode.tsx        # Single tree node (recursive)
    FilePreview.tsx         # Read-only file modal
    SessionHistory.tsx      # Right sidebar — session list
    SessionItem.tsx         # Single session card
    FileAutocomplete.tsx    # @ mention dropdown
```

### Modified Files
```
server/src/
  protocol.ts     # Add session_title, session_loaded, load_session types
  index.ts        # Mount routers before catch-all; add load_session WS handler
  agent.ts        # Export WORKSPACE_DIR; add generateTitle() helper

client/src/
  types.ts        # Mirror protocol additions + FileTreeNode, SessionData, SessionSummary
  App.tsx          # Three-column layout, sidebar state, session management
  components/
    Header.tsx     # Add sidebar toggle buttons
    ChatInput.tsx  # Add @ detection + autocomplete
```

---

### Task 1: Protocol Types Update

**Files:**
- Modify: `projects/ops-knowledgebase-chat/server/src/protocol.ts`
- Modify: `projects/ops-knowledgebase-chat/client/src/types.ts`

- [ ] **Step 1: Update server protocol.ts**

```typescript
export type ClientMessage =
  | { type: 'user_message'; content: string }
  | { type: 'interrupt' }
  | { type: 'new_session' }
  | { type: 'load_session'; session_id: string };

export type ServerMessage =
  | { type: 'assistant_text'; content: string }
  | { type: 'tool_use'; id: string; tool: string; input: unknown }
  | { type: 'tool_result'; tool_use_id: string; output: string }
  | { type: 'session_init'; session_id: string }
  | { type: 'session_title'; title: string }
  | { type: 'session_loaded'; session: SessionData }
  | { type: 'done' }
  | { type: 'error'; message: string };

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  size?: number;
  truncated?: boolean;
}

export interface SessionData {
  id: string;
  title: string;
  createdAt: string;
  sessionId?: string;
  lastAssistantUuid?: string;
  messages: SessionMessage[];
}

export interface SessionMessage {
  role: 'user' | 'assistant' | 'error';
  content: string;
  toolUses?: Array<{ id: string; tool: string; input: unknown; output?: string }>;
  timestamp: string;
}

export interface SessionSummary {
  id: string;
  title: string;
  createdAt: string;
}
```

- [ ] **Step 2: Update client types.ts**

Mirror the same types from protocol.ts, plus keep existing `ChatMessage` and `ToolUseEntry`:

```typescript
export type ClientMessage =
  | { type: 'user_message'; content: string }
  | { type: 'interrupt' }
  | { type: 'new_session' }
  | { type: 'load_session'; session_id: string };

export type ServerMessage =
  | { type: 'assistant_text'; content: string }
  | { type: 'tool_use'; id: string; tool: string; input: unknown }
  | { type: 'tool_result'; tool_use_id: string; output: string }
  | { type: 'session_init'; session_id: string }
  | { type: 'session_title'; title: string }
  | { type: 'session_loaded'; session: SessionData }
  | { type: 'done' }
  | { type: 'error'; message: string };

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

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  size?: number;
  truncated?: boolean;
}

export interface SessionData {
  id: string;
  title: string;
  createdAt: string;
  sessionId?: string;
  lastAssistantUuid?: string;
  messages: SessionMessage[];
}

export interface SessionMessage {
  role: 'user' | 'assistant' | 'error';
  content: string;
  toolUses?: Array<{ id: string; tool: string; input: unknown; output?: string }>;
  timestamp: string;
}

export interface SessionSummary {
  id: string;
  title: string;
  createdAt: string;
}
```

- [ ] **Step 3: Verify compilation**

Run: `cd projects/ops-knowledgebase-chat/server && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add projects/ops-knowledgebase-chat/server/src/protocol.ts projects/ops-knowledgebase-chat/client/src/types.ts
git commit -m "feat(ops-kb-chat): add v2 protocol types (sessions, file tree)"
```

---

### Task 2: Files API Router

**Files:**
- Create: `projects/ops-knowledgebase-chat/server/src/files.ts`

- [ ] **Step 1: Create files.ts**

```typescript
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import type { FileTreeNode } from './protocol.js';

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';
const MAX_FILES = 1000;
const MAX_DEPTH = 10;

function buildTree(dirPath: string, relativeTo: string, depth: number, fileCount: { count: number }): FileTreeNode[] {
  if (depth > MAX_DEPTH || fileCount.count >= MAX_FILES) {
    return [];
  }

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return [];
  }

  // Sort: directories first, then alphabetical
  entries.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name);
  });

  const nodes: FileTreeNode[] = [];

  for (const entry of entries) {
    if (fileCount.count >= MAX_FILES) {
      nodes.push({ name: '...', path: '', type: 'file', truncated: true });
      break;
    }

    // Skip hidden dirs except don't skip all dotfiles
    if (entry.name === '.sessions' || entry.name === 'node_modules' || entry.name === '.git') {
      continue;
    }

    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(relativeTo, fullPath);

    if (entry.isDirectory()) {
      const children = buildTree(fullPath, relativeTo, depth + 1, fileCount);
      nodes.push({ name: entry.name, path: relPath, type: 'directory', children });
    } else {
      fileCount.count++;
      let size: number | undefined;
      try {
        size = fs.statSync(fullPath).size;
      } catch { /* ignore */ }
      nodes.push({ name: entry.name, path: relPath, type: 'file', size });
    }
  }

  return nodes;
}

export const filesRouter = Router();

// GET /api/files — recursive directory tree
filesRouter.get('/api/files', (_req, res) => {
  const fileCount = { count: 0 };
  const tree = buildTree(WORKSPACE_DIR, WORKSPACE_DIR, 0, fileCount);
  res.json(tree);
});

// GET /api/files/* — raw file content
filesRouter.get('/api/files/*', (req, res) => {
  // req.params is { '0': 'path/to/file' } in Express 5 splat
  const filePath = (req.params as Record<string, string>)[0] || '';

  // Path traversal protection
  if (filePath.includes('..') || path.isAbsolute(filePath)) {
    res.status(400).json({ error: 'Invalid path' });
    return;
  }

  const fullPath = path.join(WORKSPACE_DIR, filePath);

  // Ensure resolved path is within workspace
  if (!fullPath.startsWith(WORKSPACE_DIR)) {
    res.status(400).json({ error: 'Path outside workspace' });
    return;
  }

  if (!fs.existsSync(fullPath) || fs.statSync(fullPath).isDirectory()) {
    res.status(404).json({ error: 'File not found' });
    return;
  }

  const content = fs.readFileSync(fullPath, 'utf-8');
  res.type('text/plain').send(content);
});
```

- [ ] **Step 2: Verify compilation**

Run: `cd projects/ops-knowledgebase-chat/server && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add projects/ops-knowledgebase-chat/server/src/files.ts
git commit -m "feat(ops-kb-chat): add files API router (tree + content)"
```

---

### Task 3: Sessions API Router + Persistence

**Files:**
- Create: `projects/ops-knowledgebase-chat/server/src/sessions.ts`

- [ ] **Step 1: Create sessions.ts**

```typescript
import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { query } from '@anthropic-ai/claude-agent-sdk';
import type { SessionData, SessionSummary, SessionMessage } from './protocol.js';

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';
const SESSIONS_DIR = path.join(WORKSPACE_DIR, '.sessions');

function ensureSessionsDir(): void {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

function sessionPath(id: string): string {
  return path.join(SESSIONS_DIR, `${id}.json`);
}

// --- Persistence helpers (exported for use in index.ts) ---

export function createSession(): SessionData {
  ensureSessionsDir();
  const session: SessionData = {
    id: crypto.randomUUID(),
    title: 'New conversation',
    createdAt: new Date().toISOString(),
    messages: [],
  };
  fs.writeFileSync(sessionPath(session.id), JSON.stringify(session, null, 2));
  return session;
}

export function loadSession(id: string): SessionData | null {
  const p = sessionPath(id);
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

export function saveSession(session: SessionData): void {
  ensureSessionsDir();
  fs.writeFileSync(sessionPath(session.id), JSON.stringify(session, null, 2));
}

export function appendMessages(id: string, messages: SessionMessage[], sdkSessionId?: string, lastAssistantUuid?: string): void {
  const session = loadSession(id);
  if (!session) return;
  session.messages.push(...messages);
  if (sdkSessionId) session.sessionId = sdkSessionId;
  if (lastAssistantUuid) session.lastAssistantUuid = lastAssistantUuid;
  saveSession(session);
}

export function updateTitle(id: string, title: string): void {
  const session = loadSession(id);
  if (!session) return;
  session.title = title;
  saveSession(session);
}

export async function generateTitle(firstMessage: string): Promise<string> {
  try {
    let title = '';
    for await (const msg of query({
      prompt: `Generate a 3-5 word title for a conversation that starts with: "${firstMessage}". Respond with just the title, nothing else.`,
      options: {
        cwd: WORKSPACE_DIR,
        permissionMode: 'bypassPermissions',
        allowDangerouslySkipPermissions: true,
        env: { ...process.env },
        maxTurns: 1,
      },
    })) {
      const m = msg as Record<string, unknown>;
      if (m.type === 'assistant' && m.message) {
        const content = (m.message as { content?: Array<{ type: string; text?: string }> }).content;
        if (content) {
          title = content
            .filter((c) => c.type === 'text')
            .map((c) => c.text || '')
            .join('')
            .trim();
        }
      }
    }
    return title || 'Untitled';
  } catch {
    return 'Untitled';
  }
}

// --- REST routes ---

export const sessionsRouter = Router();

sessionsRouter.get('/api/sessions', (_req, res) => {
  ensureSessionsDir();
  const files = fs.readdirSync(SESSIONS_DIR).filter((f) => f.endsWith('.json'));
  const summaries: SessionSummary[] = [];

  for (const file of files) {
    try {
      const data: SessionData = JSON.parse(fs.readFileSync(path.join(SESSIONS_DIR, file), 'utf-8'));
      summaries.push({ id: data.id, title: data.title, createdAt: data.createdAt });
    } catch { /* skip corrupt files */ }
  }

  summaries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(summaries);
});

sessionsRouter.get('/api/sessions/:id', (req, res) => {
  const session = loadSession(req.params.id);
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json(session);
});
```

- [ ] **Step 2: Verify compilation**

Run: `cd projects/ops-knowledgebase-chat/server && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add projects/ops-knowledgebase-chat/server/src/sessions.ts
git commit -m "feat(ops-kb-chat): add sessions API router with persistence + title generation"
```

---

### Task 4: Update Server index.ts

**Files:**
- Modify: `projects/ops-knowledgebase-chat/server/src/index.ts`

- [ ] **Step 1: Mount routers and add load_session handler**

The key changes to `index.ts`:
1. Import and mount `filesRouter` and `sessionsRouter` **before** static middleware
2. Add `load_session` case to WebSocket switch
3. Track active session data ID for persistence
4. Save messages and trigger title generation after agent turns

Replace the entire file with:

```typescript
import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadRouter } from './upload.js';
import { filesRouter } from './files.js';
import { sessionsRouter, createSession, loadSession, appendMessages, updateTitle, generateTitle } from './sessions.js';
import { MessageStream, runAgent, type AgentSession } from './agent.js';
import type { ClientMessage, SessionMessage } from './protocol.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = parseInt(process.env.PORT || '8080', 10);

const app = express();
const server = createServer(app);

app.get('/health', (_req, res) => {
  res.status(200).send('ok');
});

// API routers — must be before static/catch-all
app.use(uploadRouter);
app.use(filesRouter);
app.use(sessionsRouter);

const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));

app.get('/{*path}', (_req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  console.log('[ws] Client connected');

  let session: AgentSession = {
    stream: new MessageStream(),
    generator: null,
  };
  let agentRunning = false;
  let activeSessionDataId: string | null = null;
  let pendingMessages: SessionMessage[] = [];
  let firstMessageContent: string | null = null;
  let titleGenerated = false;

  function resetSession() {
    session.stream.end();
    if (session.generator) {
      session.generator.return(undefined);
    }
    session = {
      stream: new MessageStream(),
      generator: null,
    };
    agentRunning = false;
    activeSessionDataId = null;
    pendingMessages = [];
    firstMessageContent = null;
    titleGenerated = false;
  }

  async function startAgent() {
    if (agentRunning) return;
    agentRunning = true;

    try {
      for await (const msg of runAgent(session)) {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(msg));
        }

        // Collect messages for persistence
        if (msg.type === 'assistant_text') {
          pendingMessages.push({
            role: 'assistant',
            content: msg.content,
            timestamp: new Date().toISOString(),
          });
        }

        if (msg.type === 'done' && activeSessionDataId) {
          // Save pending messages
          appendMessages(activeSessionDataId, pendingMessages, session.sessionId, session.lastAssistantUuid);
          pendingMessages = [];

          // Generate title after first turn
          if (!titleGenerated && firstMessageContent) {
            titleGenerated = true;
            generateTitle(firstMessageContent).then((title) => {
              if (activeSessionDataId) {
                updateTitle(activeSessionDataId, title);
                if (ws.readyState === WebSocket.OPEN) {
                  ws.send(JSON.stringify({ type: 'session_title', title }));
                }
              }
            });
          }
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
      case 'user_message': {
        // Create session on first message if none active
        if (!activeSessionDataId) {
          const sessionData = createSession();
          activeSessionDataId = sessionData.id;
          firstMessageContent = parsed.content;
        }

        // Save user message immediately
        appendMessages(activeSessionDataId, [{
          role: 'user',
          content: parsed.content,
          timestamp: new Date().toISOString(),
        }]);

        session.stream.push(parsed.content);
        if (!agentRunning) {
          startAgent();
        }
        break;
      }

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
        resetSession();
        console.log('[ws] New session started');
        break;

      case 'load_session': {
        // End current session
        resetSession();

        const sessionData = loadSession(parsed.session_id);
        if (!sessionData) {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'error', message: 'Session not found' }));
          }
          break;
        }

        // Set up for resume
        activeSessionDataId = sessionData.id;
        titleGenerated = !!sessionData.title && sessionData.title !== 'New conversation';
        firstMessageContent = sessionData.messages.find((m) => m.role === 'user')?.content || null;

        // Prepare agent session with resume data
        session = {
          stream: new MessageStream(),
          generator: null,
          sessionId: sessionData.sessionId,
          lastAssistantUuid: sessionData.lastAssistantUuid,
        };

        // Send full session to client
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'session_loaded', session: sessionData }));
        }

        console.log(`[ws] Loaded session ${sessionData.id}: ${sessionData.title}`);
        break;
      }
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

- [ ] **Step 2: Verify compilation**

Run: `cd projects/ops-knowledgebase-chat/server && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add projects/ops-knowledgebase-chat/server/src/index.ts
git commit -m "feat(ops-kb-chat): wire up files/sessions routers + session lifecycle in WS handler"
```

---

### Task 5: useFileTree Hook

**Files:**
- Create: `projects/ops-knowledgebase-chat/client/src/hooks/useFileTree.ts`

- [ ] **Step 1: Create useFileTree.ts**

```typescript
import { useState, useEffect, useCallback } from 'react';
import type { FileTreeNode } from '../types';

export function useFileTree() {
  const [tree, setTree] = useState<FileTreeNode[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      setTree(data);
    } catch {
      setTree([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Flatten tree to list of file paths (for autocomplete)
  const flatFiles = flattenTree(tree);

  return { tree, flatFiles, loading, refresh };
}

function flattenTree(nodes: FileTreeNode[]): string[] {
  const result: string[] = [];
  for (const node of nodes) {
    if (node.type === 'file') {
      result.push(node.path);
    } else if (node.children) {
      result.push(...flattenTree(node.children));
    }
  }
  return result;
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/hooks/useFileTree.ts
git commit -m "feat(ops-kb-chat): add useFileTree hook"
```

---

### Task 6: useSessions Hook

**Files:**
- Create: `projects/ops-knowledgebase-chat/client/src/hooks/useSessions.ts`

- [ ] **Step 1: Create useSessions.ts**

```typescript
import { useState, useEffect, useCallback } from 'react';
import type { SessionSummary } from '../types';

export function useSessions() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      setSessions(data);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateSessionTitle = useCallback((title: string) => {
    setSessions((prev) => {
      if (prev.length === 0) return prev;
      // Update the most recent session's title
      return [{ ...prev[0], title }, ...prev.slice(1)];
    });
  }, []);

  return { sessions, loading, refresh, updateSessionTitle };
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/hooks/useSessions.ts
git commit -m "feat(ops-kb-chat): add useSessions hook"
```

---

### Task 7: FileTreeNode Component

**Files:**
- Create: `projects/ops-knowledgebase-chat/client/src/components/FileTreeNode.tsx`

- [ ] **Step 1: Create FileTreeNode.tsx**

```tsx
import { useState } from 'react';
import type { FileTreeNode as FileTreeNodeType } from '../types';

interface FileTreeNodeProps {
  node: FileTreeNodeType;
  depth: number;
  onFileClick: (path: string) => void;
}

export function FileTreeNode({ node, depth, onFileClick }: FileTreeNodeProps) {
  const [expanded, setExpanded] = useState(depth === 0);

  if (node.truncated) {
    return (
      <div className="text-text-muted text-xs py-1" style={{ paddingLeft: depth * 16 + 8 }}>
        ... (truncated)
      </div>
    );
  }

  if (node.type === 'directory') {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-1 py-1 px-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors text-left font-mono text-xs"
          style={{ paddingLeft: depth * 16 + 8 }}
        >
          <span className="text-text-muted w-3 text-center">{expanded ? '▼' : '▶'}</span>
          <span>{node.name}/</span>
        </button>
        {expanded && node.children?.map((child) => (
          <FileTreeNode key={child.path} node={child} depth={depth + 1} onFileClick={onFileClick} />
        ))}
      </div>
    );
  }

  return (
    <button
      onClick={() => onFileClick(node.path)}
      className="w-full flex items-center gap-1 py-1 px-2 text-text-secondary hover:text-text-primary hover:bg-surface-2 transition-colors text-left font-mono text-xs"
      style={{ paddingLeft: depth * 16 + 20 }}
    >
      <span>{node.name}</span>
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/components/FileTreeNode.tsx
git commit -m "feat(ops-kb-chat): add FileTreeNode component"
```

---

### Task 8: FilePreview Modal

**Files:**
- Create: `projects/ops-knowledgebase-chat/client/src/components/FilePreview.tsx`

- [ ] **Step 1: Create FilePreview.tsx**

```tsx
import { useState, useEffect, useCallback } from 'react';
import hljs from 'highlight.js';

interface FilePreviewProps {
  filePath: string;
  onClose: () => void;
}

export function FilePreview({ filePath, onClose }: FilePreviewProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/files/${filePath}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.text();
      })
      .then(setContent)
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [filePath]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const highlighted = content
    ? (() => {
        try {
          const ext = filePath.split('.').pop() || '';
          const lang = hljs.getLanguage(ext) ? ext : undefined;
          return lang
            ? hljs.highlight(content, { language: lang }).value
            : hljs.highlightAuto(content).value;
        } catch {
          return content;
        }
      })()
    : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface-1 border border-default rounded-lg shadow-md w-[80vw] max-h-[80vh] flex flex-col animate-fade-in-up">
        <div className="flex items-center justify-between px-4 py-3 border-b border-default">
          <span className="font-mono text-sm text-text-secondary">{filePath}</span>
          <button onClick={onClose} className="btn-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto p-4">
          {loading && <div className="text-text-muted text-sm">Loading...</div>}
          {!loading && content === null && <div className="text-text-muted text-sm">File not found</div>}
          {!loading && content !== null && (
            <pre className="text-xs text-code-text font-mono whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: highlighted }} />
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add highlight.js as a direct dependency**

Run: `cd projects/ops-knowledgebase-chat/client && npm install highlight.js`

- [ ] **Step 3: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/components/FilePreview.tsx projects/ops-knowledgebase-chat/client/package.json projects/ops-knowledgebase-chat/client/package-lock.json
git commit -m "feat(ops-kb-chat): add FilePreview modal with syntax highlighting"
```

---

### Task 9: FileExplorer Sidebar

**Files:**
- Create: `projects/ops-knowledgebase-chat/client/src/components/FileExplorer.tsx`

- [ ] **Step 1: Create FileExplorer.tsx**

```tsx
import { useState } from 'react';
import { FileTreeNode } from './FileTreeNode';
import { FilePreview } from './FilePreview';
import type { FileTreeNode as FileTreeNodeType } from '../types';

interface FileExplorerProps {
  tree: FileTreeNodeType[];
  loading: boolean;
  onRefresh: () => void;
}

export function FileExplorer({ tree, loading, onRefresh }: FileExplorerProps) {
  const [previewPath, setPreviewPath] = useState<string | null>(null);

  return (
    <>
      <div className="flex flex-col h-full bg-surface-0 border-r border-default">
        <div className="flex items-center justify-between px-3 py-2 border-b border-default">
          <span className="text-xs font-display font-semibold text-text-muted uppercase tracking-wider">Files</span>
          <button onClick={onRefresh} className="btn-icon" title="Refresh" disabled={loading}>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={loading ? 'animate-spin' : ''}>
              <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-1">
          {tree.length === 0 && !loading && (
            <div className="text-text-muted text-xs px-3 py-4 text-center">No files in workspace</div>
          )}
          {tree.map((node) => (
            <FileTreeNode key={node.path || node.name} node={node} depth={0} onFileClick={setPreviewPath} />
          ))}
        </div>
      </div>
      {previewPath && <FilePreview filePath={previewPath} onClose={() => setPreviewPath(null)} />}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/components/FileExplorer.tsx
git commit -m "feat(ops-kb-chat): add FileExplorer sidebar component"
```

---

### Task 10: SessionItem Component

**Files:**
- Create: `projects/ops-knowledgebase-chat/client/src/components/SessionItem.tsx`

- [ ] **Step 1: Create SessionItem.tsx**

```tsx
import type { SessionSummary } from '../types';

interface SessionItemProps {
  session: SessionSummary;
  isActive: boolean;
  onClick: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SessionItem({ session, isActive, onClick }: SessionItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 transition-colors ${
        isActive
          ? 'border-l-2 border-l-accent-gold bg-surface-2'
          : 'border-l-2 border-l-transparent hover:bg-surface-2'
      }`}
    >
      <div className="text-sm font-body font-medium text-text-primary truncate">
        {session.title}
      </div>
      <div className="text-xs text-text-muted mt-0.5">
        {timeAgo(session.createdAt)}
      </div>
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/components/SessionItem.tsx
git commit -m "feat(ops-kb-chat): add SessionItem component"
```

---

### Task 11: SessionHistory Sidebar

**Files:**
- Create: `projects/ops-knowledgebase-chat/client/src/components/SessionHistory.tsx`

- [ ] **Step 1: Create SessionHistory.tsx**

```tsx
import { SessionItem } from './SessionItem';
import type { SessionSummary } from '../types';

interface SessionHistoryProps {
  sessions: SessionSummary[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
}

export function SessionHistory({ sessions, activeSessionId, onSelectSession }: SessionHistoryProps) {
  return (
    <div className="flex flex-col h-full bg-surface-0 border-l border-default">
      <div className="px-3 py-2 border-b border-default">
        <span className="text-xs font-display font-semibold text-text-muted uppercase tracking-wider">Sessions</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 && (
          <div className="text-text-muted text-xs px-3 py-4 text-center">No sessions yet</div>
        )}
        {sessions.map((s) => (
          <SessionItem
            key={s.id}
            session={s}
            isActive={s.id === activeSessionId}
            onClick={() => onSelectSession(s.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/components/SessionHistory.tsx
git commit -m "feat(ops-kb-chat): add SessionHistory sidebar component"
```

---

### Task 12: FileAutocomplete Dropdown

**Files:**
- Create: `projects/ops-knowledgebase-chat/client/src/components/FileAutocomplete.tsx`

- [ ] **Step 1: Create FileAutocomplete.tsx**

```tsx
import { useState, useEffect, useCallback } from 'react';

interface FileAutocompleteProps {
  query: string;           // text after @
  files: string[];          // flat list of file paths
  onSelect: (path: string) => void;
  onDismiss: () => void;
}

export function FileAutocomplete({ query, files, onSelect, onDismiss }: FileAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const matches = files
    .filter((f) => f.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, matches.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (matches[selectedIndex]) {
          onSelect(matches[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onDismiss();
      }
    },
    [matches, selectedIndex, onSelect, onDismiss],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (matches.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 mb-1 w-full max-w-md bg-surface-2 border border-default rounded-md shadow-md overflow-hidden z-40 animate-fade-in-up">
      {matches.map((file, i) => (
        <button
          key={file}
          onMouseDown={(e) => { e.preventDefault(); onSelect(file); }}
          className={`w-full text-left px-3 py-1.5 font-mono text-xs transition-colors ${
            i === selectedIndex ? 'bg-surface-3 text-text-primary' : 'text-text-secondary hover:bg-surface-3'
          }`}
        >
          {file}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/components/FileAutocomplete.tsx
git commit -m "feat(ops-kb-chat): add FileAutocomplete dropdown component"
```

---

### Task 13: Update Header with Sidebar Toggles

**Files:**
- Modify: `projects/ops-knowledgebase-chat/client/src/components/Header.tsx`

- [ ] **Step 1: Update Header.tsx**

```tsx
interface HeaderProps {
  connected: boolean;
  onNewSession: () => void;
  filesOpen: boolean;
  onToggleFiles: () => void;
  sessionsOpen: boolean;
  onToggleSessions: () => void;
}

export function Header({ connected, onNewSession, filesOpen, onToggleFiles, sessionsOpen, onToggleSessions }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="flex items-center gap-3">
        <button onClick={onToggleFiles} className="btn-icon" title="Toggle file explorer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={filesOpen ? 'var(--accent-gold)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="app-header-title">ops-knowledgebase-chat</h1>
        <span
          className={`status-dot ${connected ? 'status-dot--connected' : 'status-dot--error'}`}
          title={connected ? 'Connected' : 'Disconnected'}
        />
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onNewSession} className="btn-ghost">
          New
        </button>
        <button onClick={onToggleSessions} className="btn-icon" title="Toggle session history">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={sessionsOpen ? 'var(--accent-gold)' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/components/Header.tsx
git commit -m "feat(ops-kb-chat): add sidebar toggle buttons to Header"
```

---

### Task 14: Update ChatInput with @ Autocomplete

**Files:**
- Modify: `projects/ops-knowledgebase-chat/client/src/components/ChatInput.tsx`

- [ ] **Step 1: Update ChatInput.tsx**

Add `filesList` prop, detect `@` in input, show `FileAutocomplete` dropdown:

Add to the existing props interface:
```typescript
  filesList: string[];  // flat file paths for autocomplete
```

Add state for autocomplete:
```typescript
const [showAutocomplete, setShowAutocomplete] = useState(false);
const [autocompleteQuery, setAutocompleteQuery] = useState('');
```

In `handleInput`, after setting the input value, detect `@`:
```typescript
// Check for @ autocomplete trigger
const value = e.target.value;
const cursorPos = e.target.selectionStart || 0;
const textBeforeCursor = value.slice(0, cursorPos);
const atIndex = textBeforeCursor.lastIndexOf('@');

if (atIndex !== -1 && (atIndex === 0 || textBeforeCursor[atIndex - 1] === ' ')) {
  setShowAutocomplete(true);
  setAutocompleteQuery(textBeforeCursor.slice(atIndex + 1));
} else {
  setShowAutocomplete(false);
}
```

Add autocomplete select handler:
```typescript
const handleAutocompleteSelect = useCallback((filePath: string) => {
  const cursorPos = textareaRef.current?.selectionStart || input.length;
  const textBeforeCursor = input.slice(0, cursorPos);
  const atIndex = textBeforeCursor.lastIndexOf('@');
  if (atIndex === -1) return;

  const before = input.slice(0, atIndex);
  const after = input.slice(cursorPos);
  setInput(`${before}@${filePath}${after}`);
  setShowAutocomplete(false);
}, [input]);
```

In the `handleKeyDown`, before existing key handlers, add early return if autocomplete is showing (let FileAutocomplete handle arrow/enter/tab/esc keys):
```typescript
if (showAutocomplete && ['ArrowDown', 'ArrowUp', 'Enter', 'Tab'].includes(e.key)) {
  return; // Let FileAutocomplete handle these
}
if (showAutocomplete && e.key === 'Escape') {
  e.preventDefault();
  setShowAutocomplete(false);
  return;
}
```

In the JSX, add `FileAutocomplete` inside the `chat-input-inner` div, positioned above the textarea:
```tsx
<div className="chat-input-inner relative">
  {showAutocomplete && (
    <FileAutocomplete
      query={autocompleteQuery}
      files={filesList}
      onSelect={handleAutocompleteSelect}
      onDismiss={() => setShowAutocomplete(false)}
    />
  )}
  {/* ... rest of existing JSX */}
</div>
```

Import at top:
```typescript
import { FileAutocomplete } from './FileAutocomplete';
```

- [ ] **Step 2: Verify compilation**

Run: `cd projects/ops-knowledgebase-chat/client && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/components/ChatInput.tsx
git commit -m "feat(ops-kb-chat): add @ file autocomplete to ChatInput"
```

---

### Task 15: Update App.tsx — Three-Column Layout + Session Management

**Files:**
- Modify: `projects/ops-knowledgebase-chat/client/src/App.tsx`

- [ ] **Step 1: Rewrite App.tsx**

Key changes:
1. Add sidebar open/close state
2. Add file tree and sessions hooks
3. Add session management (active session ID, loading sessions)
4. Handle new message types (`session_title`, `session_loaded`)
5. Three-column flex layout
6. Pass new props to Header and ChatInput

```tsx
import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { useFileTree } from './hooks/useFileTree';
import { useSessions } from './hooks/useSessions';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { ChatInput } from './components/ChatInput';
import { FileExplorer } from './components/FileExplorer';
import { SessionHistory } from './components/SessionHistory';
import type { ChatMessage, ToolUseEntry, ServerMessage } from './types';

let msgId = 0;
function nextId() {
  return String(++msgId);
}

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [filesOpen, setFilesOpen] = useState(true);
  const [sessionsOpen, setSessionsOpen] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const { tree, flatFiles, loading: filesLoading, refresh: refreshFiles } = useFileTree();
  const { sessions, refresh: refreshSessions, updateSessionTitle } = useSessions();

  const handleMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'assistant_text':
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
        refreshFiles();
        refreshSessions();
        break;

      case 'error':
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'error', content: msg.message },
        ]);
        setIsStreaming(false);
        break;

      case 'session_init':
        break;

      case 'session_title':
        updateSessionTitle(msg.title);
        break;

      case 'session_loaded': {
        const loaded = msg.session;
        setActiveSessionId(loaded.id);
        const restoredMessages: ChatMessage[] = loaded.messages.map((m) => {
          if (m.role === 'assistant') {
            return {
              id: nextId(),
              role: 'assistant' as const,
              content: m.content,
              toolUses: m.toolUses || [],
            };
          }
          return { id: nextId(), role: m.role, content: m.content };
        });
        setMessages(restoredMessages);
        break;
      }
    }
  }, [refreshFiles, refreshSessions, updateSessionTitle]);

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
    setActiveSessionId(null);
    refreshSessions();
  }, [send, refreshSessions]);

  const handleLoadSession = useCallback(
    (sessionId: string) => {
      send({ type: 'load_session', session_id: sessionId });
      setIsStreaming(false);
    },
    [send],
  );

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
      refreshFiles();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'error', content: `Upload failed: ${err}` },
      ]);
    }
  }, [refreshFiles]);

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
    <div className="flex flex-col h-screen bg-surface-1 text-text-primary">
      <Header
        connected={connected}
        onNewSession={handleNewSession}
        filesOpen={filesOpen}
        onToggleFiles={() => setFilesOpen((v) => !v)}
        sessionsOpen={sessionsOpen}
        onToggleSessions={() => setSessionsOpen((v) => !v)}
      />
      <div className="flex flex-1 overflow-hidden" style={{ marginTop: 48 }}>
        {filesOpen && (
          <div className="w-60 flex-shrink-0">
            <FileExplorer tree={tree} loading={filesLoading} onRefresh={refreshFiles} />
          </div>
        )}
        <div className="flex flex-col flex-1 min-w-0">
          <ChatView messages={messages} />
          <ChatInput
            onSend={handleSend}
            onUpload={handleUpload}
            onInterrupt={handleInterrupt}
            isStreaming={isStreaming}
            disabled={!connected}
            filesList={flatFiles}
          />
        </div>
        {sessionsOpen && (
          <div className="w-65 flex-shrink-0">
            <SessionHistory
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={handleLoadSession}
            />
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update ChatView to remove marginTop 48 padding**

The `chat-area` CSS class has `padding: 64px 20px 120px` which assumed no header offset. Since the main content now uses `marginTop: 48` in App.tsx, update ChatView's container to remove the extra top padding. Change the ChatView component's class from `chat-area flex-1 overflow-y-auto` to just use flex layout:

In `ChatView.tsx`, replace the outer div className:
```tsx
<div className="flex-1 overflow-y-auto px-5 py-6 pb-32">
```

- [ ] **Step 3: Update ChatInput to not use fixed positioning**

The `chat-input-container` CSS class uses `position: fixed` which won't work in the new flex layout. Override it in ChatInput:

In `ChatInput.tsx`, replace the outer div className:
```tsx
<div className="border-t border-default bg-surface-1 px-5 py-3">
```

- [ ] **Step 4: Verify compilation**

Run: `cd projects/ops-knowledgebase-chat/client && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add projects/ops-knowledgebase-chat/client/src/App.tsx projects/ops-knowledgebase-chat/client/src/components/ChatView.tsx projects/ops-knowledgebase-chat/client/src/components/ChatInput.tsx
git commit -m "feat(ops-kb-chat): three-column layout with sidebars + session management"
```

---

### Task 16: Build and Smoke Test

**Files:** None (verification only)

- [ ] **Step 1: Build server**

Run: `cd projects/ops-knowledgebase-chat/server && npm run build`
Expected: Compiles without errors

- [ ] **Step 2: Build client**

Run: `cd projects/ops-knowledgebase-chat/client && npm run build`
Expected: Compiles without errors

- [ ] **Step 3: Start server locally**

Run:
```bash
cd projects/ops-knowledgebase-chat/server
mkdir -p /tmp/ops-kb-v2-workspace
echo "Test file content" > /tmp/ops-kb-v2-workspace/test.txt
cp -r ../client/dist ./public
WORKSPACE_DIR=/tmp/ops-kb-v2-workspace node dist/index.js
```

- [ ] **Step 4: Test endpoints**

```bash
curl http://localhost:8080/health          # → ok
curl http://localhost:8080/api/files       # → JSON tree with test.txt
curl http://localhost:8080/api/files/test.txt  # → "Test file content"
curl http://localhost:8080/api/sessions    # → []
```

- [ ] **Step 5: Commit any fixes**

---

### Task 17: Playwright E2E — Sidebars and File Explorer

**Files:**
- Create: `projects/ops-knowledgebase-chat/e2e/06-sidebars.spec.ts`

- [ ] **Step 1: Create 06-sidebars.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { startServer, stopServer } from './helpers/server';

test.beforeAll(async () => {
  await startServer();
});

test.afterAll(async () => {
  await stopServer();
});

test('file explorer sidebar shows seeded files', async ({ page }) => {
  await page.goto('/');
  // File explorer should be visible by default
  await expect(page.getByText('FILES')).toBeVisible();
  // Seeded files should appear
  await expect(page.getByText('readme.txt')).toBeVisible();
  await expect(page.getByText('notes.md')).toBeVisible();
  await expect(page.getByText('data.csv')).toBeVisible();
});

test('file explorer toggle hides/shows sidebar', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('FILES')).toBeVisible();

  // Click toggle to hide
  await page.getByTitle('Toggle file explorer').click();
  await expect(page.getByText('FILES')).not.toBeVisible();

  // Click toggle to show
  await page.getByTitle('Toggle file explorer').click();
  await expect(page.getByText('FILES')).toBeVisible();
});

test('clicking a file opens preview modal', async ({ page }) => {
  await page.goto('/');
  await page.getByText('readme.txt').click();

  // Modal should show file path and content
  await expect(page.getByText('readme.txt').last()).toBeVisible();
  await expect(page.getByText('test knowledgebase')).toBeVisible({ timeout: 5000 });
});

test('session history sidebar shows', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('SESSIONS')).toBeVisible();
});

test('session history toggle works', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('SESSIONS')).toBeVisible();

  await page.getByTitle('Toggle session history').click();
  await expect(page.getByText('SESSIONS')).not.toBeVisible();
});

test('files API returns tree', async ({ request }) => {
  const res = await request.get('/api/files');
  expect(res.status()).toBe(200);
  const tree = await res.json();
  expect(tree.length).toBeGreaterThan(0);
  expect(tree.some((n: { name: string }) => n.name === 'readme.txt')).toBe(true);
});

test('files content API returns file', async ({ request }) => {
  const res = await request.get('/api/files/readme.txt');
  expect(res.status()).toBe(200);
  const text = await res.text();
  expect(text).toContain('test knowledgebase');
});

test('files API rejects path traversal', async ({ request }) => {
  const res = await request.get('/api/files/../../etc/passwd');
  expect(res.status()).toBe(400);
});
```

- [ ] **Step 2: Run test**

Run: `cd projects/ops-knowledgebase-chat/e2e && npx playwright test 06-sidebars.spec.ts`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add projects/ops-knowledgebase-chat/e2e/06-sidebars.spec.ts
git commit -m "test(ops-kb-chat): E2E tests for sidebars and file explorer"
```

---

### Task 18: Playwright E2E — Sessions and @ Autocomplete

**Files:**
- Create: `projects/ops-knowledgebase-chat/e2e/07-sessions-autocomplete.spec.ts`

- [ ] **Step 1: Create 07-sessions-autocomplete.spec.ts**

```typescript
import { test, expect } from '@playwright/test';
import { startServer, stopServer } from './helpers/server';

test.beforeAll(async () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY must be set');
  }
  await startServer();
});

test.afterAll(async () => {
  await stopServer();
});

test('sending a message creates a session', async ({ page }) => {
  await page.goto('/');
  const input = page.getByPlaceholder('Type a message');
  await input.fill('Hello');
  await input.press('Control+Enter');

  // Wait for response
  await expect(page.locator('.prose-chat').first()).toBeVisible({ timeout: 120_000 });

  // Session should appear in sidebar
  await expect(page.getByText('SESSIONS')).toBeVisible();
  // A session card should appear (title may take a moment)
  const sessionItems = page.locator('[class*="border-l-accent-gold"]');
  await expect(sessionItems.first()).toBeVisible({ timeout: 30_000 });
});

test('@ autocomplete shows files', async ({ page }) => {
  await page.goto('/');
  const input = page.getByPlaceholder('Type a message');
  await input.fill('@');

  // Autocomplete dropdown should appear with file names
  await expect(page.getByText('readme.txt').last()).toBeVisible({ timeout: 5_000 });
});

test('@ autocomplete filters on typing', async ({ page }) => {
  await page.goto('/');
  const input = page.getByPlaceholder('Type a message');
  await input.fill('@note');

  // Should show notes.md but not other files
  await expect(page.getByText('notes.md').last()).toBeVisible({ timeout: 5_000 });
});

test('sessions API returns list', async ({ request }) => {
  const res = await request.get('/api/sessions');
  expect(res.status()).toBe(200);
  const sessions = await res.json();
  expect(Array.isArray(sessions)).toBe(true);
});
```

- [ ] **Step 2: Run test**

Run: `cd projects/ops-knowledgebase-chat/e2e && export $(grep ANTHROPIC_API_KEY ../../../.env | xargs) && npx playwright test 07-sessions-autocomplete.spec.ts`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add projects/ops-knowledgebase-chat/e2e/07-sessions-autocomplete.spec.ts
git commit -m "test(ops-kb-chat): E2E tests for sessions and @ autocomplete"
```

---

### Task 19: Deploy to Fly

**Files:** None (deployment only)

- [ ] **Step 1: Deploy**

Run:
```bash
cd projects/ops-knowledgebase-chat
fly deploy
```
Expected: Deploys successfully, health check passes

- [ ] **Step 2: Verify**

Open https://ops-knowledgebase-chat.fly.dev/ and verify:
- File explorer sidebar shows `/workspace` contents
- Session history sidebar shows
- Sidebars toggle open/close
- Chat works with sessions persisting
- @ autocomplete shows files

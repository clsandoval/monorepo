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

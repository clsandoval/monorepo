// Per-user chat sessions. SQLite WAL — tiny concurrent writes, one row per message.
import Database from "better-sqlite3";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const SESSIONS_PATH = process.env.RFP_SESSIONS_DB ?? join(process.cwd(), "sessions.db");

let db: Database.Database | null = null;
function conn(): Database.Database {
  if (db) return db;
  db = new Database(SESSIONS_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 3000");
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY, owner TEXT NOT NULL, title TEXT,
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      tokens_used INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT NOT NULL REFERENCES sessions(id),
      role TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_msg_session ON messages(session_id, id);
    CREATE INDEX IF NOT EXISTS idx_sess_owner ON sessions(owner, updated_at DESC);
  `);
  return db;
}

const now = () => new Date().toISOString();

export function createSession(owner: string, title = "New chat"): string {
  const id = randomUUID();
  conn().prepare("INSERT INTO sessions (id,owner,title,created_at,updated_at) VALUES (?,?,?,?,?)")
    .run(id, owner, title, now(), now());
  return id;
}
export function listSessions(owner: string) {
  return conn().prepare("SELECT id,title,created_at,updated_at,tokens_used FROM sessions WHERE owner=? ORDER BY updated_at DESC").all(owner);
}
export function getMessages(sessionId: string, owner: string) {
  const s = conn().prepare("SELECT id FROM sessions WHERE id=? AND owner=?").get(sessionId, owner);
  if (!s) return null;
  return conn().prepare("SELECT role,content,created_at FROM messages WHERE session_id=? ORDER BY id").all(sessionId);
}
export function addMessage(sessionId: string, role: string, content: string) {
  conn().prepare("INSERT INTO messages (session_id,role,content,created_at) VALUES (?,?,?,?)").run(sessionId, role, content, now());
  conn().prepare("UPDATE sessions SET updated_at=? WHERE id=?").run(now(), sessionId);
}
export function deleteSession(sessionId: string, owner: string): boolean {
  const r = conn().prepare("DELETE FROM sessions WHERE id=? AND owner=?").run(sessionId, owner);
  if (r.changes) conn().prepare("DELETE FROM messages WHERE session_id=?").run(sessionId);
  return !!r.changes;
}
/** Per-session token budget: returns false when the session is over budget. */
const TOKEN_BUDGET = Number(process.env.RFP_SESSION_TOKEN_BUDGET ?? 500_000);
export function addTokens(sessionId: string, tokens: number): void {
  conn().prepare("UPDATE sessions SET tokens_used = tokens_used + ? WHERE id=?").run(tokens, sessionId);
}
export function withinBudget(sessionId: string): boolean {
  const r = conn().prepare("SELECT tokens_used FROM sessions WHERE id=?").get(sessionId) as { tokens_used: number } | undefined;
  return !r || r.tokens_used < TOKEN_BUDGET;
}

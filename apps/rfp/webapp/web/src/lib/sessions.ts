// Per-user chat sessions as JSON files (rung 0 — no native sqlite dependency).
// One file per session under RFP_SESSIONS_DIR/<owner>/<id>.json.
// ponytail: file-per-session with a synchronous read-modify-write. Fine for anonymous low-traffic
// launch; move to Postgres (pi session repo) at rung 1 when concurrency/volume warrants.
import { mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const ROOT = process.env.RFP_SESSIONS_DIR ?? join(process.cwd(), ".sessions");
const TOKEN_BUDGET = Number(process.env.RFP_SESSION_TOKEN_BUDGET ?? 500_000);

type Msg = { role: string; content: string; created_at: string };
type Session = { id: string; owner: string; title: string; created_at: string; updated_at: string; tokens_used: number; messages: Msg[] };

const ownerDir = (owner: string) => join(ROOT, owner.replace(/[^a-zA-Z0-9_-]/g, ""));
const file = (owner: string, id: string) => join(ownerDir(owner), `${id.replace(/[^a-zA-Z0-9_-]/g, "")}.json`);
const now = () => new Date().toISOString();

function read(owner: string, id: string): Session | null {
  const f = file(owner, id);
  if (!existsSync(f)) return null;
  try { return JSON.parse(readFileSync(f, "utf8")) as Session; } catch { return null; }
}
function write(s: Session): void {
  mkdirSync(ownerDir(s.owner), { recursive: true });
  writeFileSync(file(s.owner, s.id), JSON.stringify(s));
}

export function createSession(owner: string, title = "New chat"): string {
  const id = randomUUID();
  write({ id, owner, title, created_at: now(), updated_at: now(), tokens_used: 0, messages: [] });
  return id;
}

export function listSessions(owner: string) {
  const dir = ownerDir(owner);
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(readFileSync(join(dir, f), "utf8")) as Session)
    .map((s) => ({ id: s.id, title: s.title, created_at: s.created_at, updated_at: s.updated_at, tokens_used: s.tokens_used }))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

/** Returns messages, or null if the session doesn't exist / isn't owned by `owner`. */
export function getMessages(sessionId: string, owner: string): Msg[] | null {
  const s = read(owner, sessionId);
  return s ? s.messages : null;
}

export function addMessage(sessionId: string, owner: string, role: string, content: string): void {
  const s = read(owner, sessionId);
  if (!s) return;
  s.messages.push({ role, content, created_at: now() });
  // first user line becomes the title
  if (s.title === "New chat" && role === "user") s.title = content.slice(0, 48);
  s.updated_at = now();
  write(s);
}

export function deleteSession(sessionId: string, owner: string): boolean {
  const f = file(owner, sessionId);
  if (!existsSync(f)) return false;
  rmSync(f);
  return true;
}

export function addTokens(sessionId: string, owner: string, tokens: number): void {
  const s = read(owner, sessionId);
  if (!s) return;
  s.tokens_used += tokens;
  write(s);
}

export function withinBudget(sessionId: string, owner: string): boolean {
  const s = read(owner, sessionId);
  return !s || s.tokens_used < TOKEN_BUDGET;
}

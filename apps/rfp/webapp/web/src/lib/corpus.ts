// Read-only access to the shared notice corpus. One process-wide connection (WAL, readonly).
// ponytail: in-process better-sqlite3 replaces the python `rfp` spawn. On ingest swap the file
// changes inode under us — reopen on mtime change, else we'd read the old corpus forever.
import Database from "better-sqlite3";
import { statSync } from "node:fs";
import { join } from "node:path";

const CORPUS_PATH = process.env.RFP_CORPUS_DB ?? join(process.cwd(), "..", "..", "corpus.db");
const TAGS_PATH = process.env.RFP_TAGS_DB ?? join(process.cwd(), "..", "..", "tags.db");

let db: Database.Database | null = null;
let openedMtime = 0;

function conn(): Database.Database {
  const mtime = statSync(CORPUS_PATH).mtimeMs;
  if (db && mtime === openedMtime) return db;
  if (db) db.close();
  db = new Database(CORPUS_PATH, { readonly: true, fileMustExist: true });
  db.pragma("query_only = ON");
  db.pragma("busy_timeout = 3000");
  try { db.exec(`ATTACH DATABASE 'file:${TAGS_PATH}?mode=ro' AS tags`); } catch { /* tags optional */ }
  openedMtime = mtime;
  return db;
}

const WRITE = /^\s*(insert|update|delete|drop|alter|create|replace|attach|detach|pragma\s+\w+\s*=)/i;

/** Run one read-only SELECT/WITH/EXPLAIN. Rejects writes + ATTACH at the app layer; the readonly
 *  connection + query_only pragma are the real guard underneath. */
export function readSql(sql: string, limit = 40): Record<string, unknown>[] {
  const trimmed = sql.trim().replace(/;\s*$/, "");
  if (/;/.test(trimmed)) throw new Error("one statement only");
  if (!/^\s*(select|with|explain)\b/i.test(trimmed) || WRITE.test(trimmed))
    throw new Error("read-only SELECT/WITH/EXPLAIN only");
  const capped = /\blimit\b/i.test(trimmed) ? trimmed : `${trimmed} LIMIT ${limit}`;
  return conn().prepare(capped).all() as Record<string, unknown>[];
}

/** Does a notice id exist? The anti-hallucination check used by the eval gate. */
export function noticeExists(id: number): boolean {
  return !!conn().prepare("SELECT 1 FROM corpus WHERE id = ? LIMIT 1").get(id);
}

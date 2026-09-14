// Read-only corpus access via the proven `rfp sql --json` CLI — the same path the agent tools use,
// with the same authorizer/read-only guarantees. No native node module (better-sqlite3 segfaults in
// this env). ponytail: swap to in-process sqlite only if the per-call spawn (~0.1s) ever matters.
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { join } from "node:path";

const pexec = promisify(execFile);
const RFP_DIR = process.env.RFP_DIR ?? join(process.cwd(), "..", "..");

/** Run one read-only SELECT/WITH/EXPLAIN via the rfp CLI. The CLI enforces read-only + rejects
 *  writes/ATTACH at the sqlite authorizer; this is the real guard. Returns parsed JSON rows. */
export async function readSql(sql: string, limit = 40): Promise<Record<string, unknown>[]> {
  const { stdout } = await pexec("python3", ["rfp", "sql", sql, "--json", "--limit", String(limit)],
    { cwd: RFP_DIR, timeout: 15_000, maxBuffer: 8 << 20 });
  const trimmed = stdout.trim();
  return trimmed ? (JSON.parse(trimmed) as Record<string, unknown>[]) : [];
}

/** Does a notice id exist? The anti-hallucination check used by the eval gate. */
export async function noticeExists(id: number): Promise<boolean> {
  const rows = await readSql(`SELECT 1 AS ok FROM corpus WHERE id = ${Number(id)}`, 1);
  return rows.length > 0;
}

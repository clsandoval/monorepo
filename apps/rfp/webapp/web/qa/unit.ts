// G2 backend unit tests — assert-based, no framework, no server. Run: bun qa/unit.ts
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

process.env.RFP_SESSIONS_DIR = mkdtempSync(join(tmpdir(), "rfp-sess-"));
process.env.RFP_SESSION_TOKEN_BUDGET = "1000";
process.env.RFP_RATE_CAP = "3";
process.env.RFP_RATE_REFILL = "0"; // no refill during the test → deterministic

let fails = 0;
const ok = (name: string, cond: boolean, detail = "") => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${cond ? "" : "  " + detail}`);
  if (!cond) fails++;
};

// --- sessions (JSON-file store) ---
const S = await import("../src/lib/sessions");
const owner = "owner-A", other = "owner-B";
const id = S.createSession(owner);
ok("createSession returns id", !!id);
ok("listSessions shows it", S.listSessions(owner).length === 1);
ok("other owner sees nothing", S.listSessions(other).length === 0);
ok("getMessages empty for new", (S.getMessages(id, owner) ?? []).length === 0);
ok("getMessages null for wrong owner (isolation)", S.getMessages(id, other) === null);
S.addMessage(id, owner, "user", "hello drainage cavite");
S.addMessage(id, owner, "assistant", "[123] fits");
ok("messages persisted in order", (() => { const m = S.getMessages(id, owner)!; return m.length === 2 && m[0].role === "user" && m[1].role === "assistant"; })());
ok("first user line becomes title", S.listSessions(owner)[0].title.startsWith("hello drainage"));
ok("withinBudget true under cap", S.withinBudget(id, owner) === true);
S.addTokens(id, owner, 2000);
ok("withinBudget false over cap", S.withinBudget(id, owner) === false);
ok("deleteSession removes (owner)", S.deleteSession(id, owner) === true && S.listSessions(owner).length === 0);
ok("deleteSession false for missing", S.deleteSession("nope", owner) === false);

// --- rate limit (token bucket) ---
const R = await import("../src/lib/ratelimit");
const ip = "1.2.3.4";
ok("burst up to cap allowed", R.allow(ip) && R.allow(ip) && R.allow(ip));
ok("blocked after cap exhausted", R.allow(ip) === false);
ok("separate ip unaffected", R.allow("9.9.9.9") === true);

// --- corpus read-only guard (via rfp CLI) ---
const C = await import("../src/lib/corpus");
try {
  const rows = await C.readSql("SELECT id FROM corpus WHERE abc BETWEEN 300000 AND 5000000", 3);
  ok("readSql returns rows for SELECT", Array.isArray(rows) && rows.length > 0);
} catch (e) { ok("readSql returns rows for SELECT", false, (e as Error).message); }
let blocked = false;
try { await C.readSql("DELETE FROM corpus", 1); } catch { blocked = true; }
ok("readSql rejects a write (DELETE)", blocked);
let attachBlocked = false;
try { await C.readSql("ATTACH DATABASE 'x.db' AS x", 1); } catch { attachBlocked = true; }
ok("readSql rejects ATTACH", attachBlocked);
ok("noticeExists true for a real id", await C.noticeExists((await C.readSql("SELECT id FROM corpus LIMIT 1", 1))[0].id as number));
ok("noticeExists false for a fake id", (await C.noticeExists(999999999)) === false);

console.log(`\n${fails === 0 ? "ALL PASS" : fails + " FAILED"}`);
process.exit(fails ? 1 : 0);

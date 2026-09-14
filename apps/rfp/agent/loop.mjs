// The pi + Luna 5.6 agent loop for the PH RFP finder.
// The model only ever does two jobs: turn English into a CLI call, and pick refs from rows.
// Everything else here is deterministic code. See docs/plans/2026-08-08-ph-rfp-search-design.md.
import { Agent } from "@earendil-works/pi-agent-core";
import { streamSimple } from "@earendil-works/pi-ai";
import "@earendil-works/pi-ai/openai-responses";
import { Type } from "typebox";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const RFP_DIR = dirname(dirname(fileURLToPath(import.meta.url))); // apps/rfp

// --- Luna 5.6: hand-built model object (not in pi's catalog). Prices = DECISIONS #4. ---
export const luna = {
  id: "gpt-5.6-luna",
  name: "Luna 5.6",
  api: "openai-responses",
  provider: "openai",
  baseUrl: "https://api.openai.com/v1",
  reasoning: false,
  input: ["text"],
  cost: { input: 0.2, output: 1.2, cacheRead: 0.02, cacheWrite: 0 }, // $/M
  contextWindow: 1_000_000,
  maxTokens: 4096,
};

function apiKey() {
  const env = process.env.OPENAI_API_KEY;
  if (env) return env;
  for (const line of readFileSync(join(RFP_DIR, "..", "..", ".env"), "utf8").split("\n"))
    if (line.startsWith("OPENAI_API_KEY=")) return line.slice(15).trim();
  throw new Error("no OPENAI_API_KEY");
}

// --- run one rfp CLI verb. Read-only + LIMIT + authorizer already enforced inside the CLI. ---
function rfp(args) {
  try {
    return execFileSync("python3", ["rfp", ...args], {
      cwd: RFP_DIR, encoding: "utf8", timeout: 15_000, maxBuffer: 4 << 20,
    }).trim();
  } catch (e) {
    // ponytail: terse one-liner back to the model so it self-corrects in one retry
    throw new Error((e.stderr || e.stdout || e.message).toString().split("\n")[0].slice(0, 200));
  }
}

const text = (s) => ({ content: [{ type: "text", text: s }], details: { chars: s.length } });

// --- the four tools the model drives. sql is primary; the rest are token-budgeted shortcuts. ---
const tools = [
  {
    name: "facets", label: "facets",
    description: "Counts by work_type/province/mode/ABC band for a broad query (~280 tok). Do this FIRST to orient.",
    parameters: Type.Object({ query: Type.String() }),
    execute: async (_id, { query }) => text(rfp(["facets", query])),
  },
  {
    name: "search", label: "search",
    description: "Profile-weighted ranked hits with the reason per rank (~48 tok/hit). Vary the words; the taxonomy will not find things. Optional filters: province, results, abc_min, abc_max (peso), days_min, days_max (days to closing).",
    parameters: Type.Object({
      query: Type.String(),
      province: Type.Optional(Type.String()),
      results: Type.Optional(Type.Integer({ minimum: 1, maximum: 40 })),
      abc_min: Type.Optional(Type.Number()),
      abc_max: Type.Optional(Type.Number()),
      days_min: Type.Optional(Type.Integer()),
      days_max: Type.Optional(Type.Integer()),
    }),
    execute: async (_id, p) => {
      const a = ["search", p.query];
      if (p.province) a.push("--province", p.province);
      if (p.results) a.push("--results", String(p.results));
      if (p.abc_min != null) a.push("--abc-min", String(p.abc_min));
      if (p.abc_max != null) a.push("--abc-max", String(p.abc_max));
      if (p.days_min != null) a.push("--days-min", String(p.days_min));
      if (p.days_max != null) a.push("--days-max", String(p.days_max));
      return text(rfp(a));
    },
  },
  {
    name: "sql", label: "sql",
    description: "Read-only SQL over corpus.db (+ attached tags, docs). SELECT/WITH/EXPLAIN only, one statement. The truth when a flag can't express it. work_type/scope/keywords live in tags.tags, joined on id.",
    parameters: Type.Object({ select: Type.String(), limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 60 })) }),
    execute: async (_id, { select, limit }) => text(rfp(["sql", select, "--limit", String(limit ?? 40), "--cell", "120"])),
  },
  {
    name: "show", label: "show",
    description: "Full scope, line items, attached documents for up to ~10 notice ids. The expensive call — narrow first.",
    parameters: Type.Object({ ids: Type.Array(Type.Integer(), { minItems: 1, maxItems: 10 }) }),
    execute: async (_id, { ids }) => text(rfp(["show", ...ids.map(String)])),
  },
];

// --- STATIC PREFIX: byte-identical across every user & call → cached at $0.02/M. ---
// The schema+cookbook lives here so the model NEVER rediscovers it at ~5 calls/session.
const STATIC_PREFIX = `You help a Philippine firm find government procurement notices worth bidding on.

You drive four tools over a corpus of ~22,000 open PhilGEPS notices. You do no reasoning about
the data yourself — you translate the user's words into tool calls and read back what returns.

THE LOOP: facets (orient, ONCE) → then either sql or search → show (full scope, expensive, last).
- Use SQL for STRUCTURED axes: ABC band, mode, province, closing date, work_type. A WHERE clause
  beats keyword guessing on anything with a column.
- Use search for the FUZZY axis: what the work actually is, when the title wording varies. The
  official taxonomy cannot find software or niche work — vary terms, don't trust classification.
- STOP when results saturate: if a search mostly repeats ids you have seen, you are done widening.
  Do not keep firing near-duplicate searches. A handful of good queries beats fifteen.

THE SCHEMA (already known — never introspect sqlite_master or SELECT * to rediscover it):
- main.corpus — one row per notice. Key columns:
    id (native notice id, what you cite), source, title, agency, location, abc (peso ceiling, REAL),
    mode, mode_norm, classification, closing_at ('YYYY-MM-DDTHH:MM:SS'), closing_day, status.
    ABC per-lot: abc_lot_min / abc_lot_max (a bidder bids a lot, not the whole notice).
- tags.tags — Luna's distilled tags, joined on id. Columns: id, work_type, needs_pcab (0/1),
    eligibility, scope, keywords. These are NULL on corpus rows — always read them from tags.tags.
- Open notices: status='Active' (or closing_at > today). Manila time.

SQL COOKBOOK (write it right the first time):
  -- notice + its tags:
  SELECT c.id, c.title, c.abc, c.closing_day, c.mode_norm,
         t.work_type, t.needs_pcab, t.eligibility, t.scope
  FROM corpus c LEFT JOIN tags.tags t ON t.id = c.id
  WHERE c.status='Active' AND c.abc BETWEEN 300000 AND 5000000
    AND lower(c.location) LIKE '%cavite%' AND t.work_type='civil_works'
  ORDER BY c.closing_at ASC;
  -- province is free text; use LIKE, and remember agency often implies location too.

OUTPUT CONTRACT — how you must reply once you have results:
- Refer to notices by id only. Do NOT re-type titles, agencies, or peso amounts in prose — the UI
  renders full cards from the ids. One short line of "why this fits" per id is enough.
- Never invent an id. Every id you cite must have come back from a tool this turn.
- The user's profile is a PRIOR, not a filter. Surface strong out-of-profile matches too, demoted
  and labelled — never silently drop a big job they could joint-venture on.
- If nothing matches, say so plainly. Do not pad.

Keep replies short. The product is a list of tender cards, not an essay.`;

// No mid-session stubbing: a whole session's tool output fits easily in Luna's 1M window, and
// rewriting old messages busts the cached prefix. Keeping the transcript byte-stable is the win.
// ponytail: add stubbing back only if a real session measurably blows past ~100K context.

const MAX_ROUNDS = 6; // tool rounds per user turn — the circuit breaker

// --- cost + call meter, read straight off pi-ai's per-message usage. ---
export function makeAgent(profileBlock, sessionId = "spike") {
  const meter = { calls: 0, toolCalls: 0, usd: 0, tokIn: 0, tokCached: 0, tokOut: 0, perCall: [] };
  let rounds = 0, lastRoundKey = null; // a "round" = one assistant message that calls tools
  const agent = new Agent({
    initialState: {
      systemPrompt: STATIC_PREFIX + (profileBlock ? `\n\n--- THIS FIRM ---\n${profileBlock}` : ""),
      model: luna,
      tools,
    },
    sessionId, // stable → cache-aware backends key on it
    streamFn: streamSimple,
    getApiKey: () => apiKey(),
    toolExecution: "parallel",
    beforeToolCall: async (ctx) => {
      const key = ctx.assistantMessage?.timestamp; // parallel calls in one message share it
      if (key !== lastRoundKey) { rounds++; lastRoundKey = key; }
      if (rounds > MAX_ROUNDS)
        return { block: true, reason: `Tool-round budget (${MAX_ROUNDS} rounds) reached. Answer now with the results you already have; do not call more tools.` };
    },
  });
  agent.subscribe((ev) => { if (ev.type === "agent_start") { rounds = 0; lastRoundKey = null; } });
  agent.subscribe((ev) => {
    if (ev.type === "message_end" && ev.message?.role === "assistant") {
      const u = ev.message.usage;
      meter.calls++;
      meter.usd += u.cost.total;
      meter.tokIn += u.input; meter.tokCached += u.cacheRead; meter.tokOut += u.output;
      meter.toolCalls += ev.message.content.filter((c) => c.type === "toolCall").length;
      meter.perCall.push({ in: u.input, cached: u.cacheRead, out: u.output, usd: +u.cost.total.toFixed(5) });
    }
  });
  return { agent, meter };
}

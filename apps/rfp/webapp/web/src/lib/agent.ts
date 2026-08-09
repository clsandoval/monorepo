// Server-side pi + Luna 5.6 agent loop. Direct TS port of apps/rfp/agent/loop.mjs (validated:
// 0 hallucinated ids, read-only guard holds, ~90% cache, ~₱0.22/turn). Tools shell to the tested
// `rfp` CLI so the proven authorizer + ranking logic is reused verbatim.
import { Agent } from "@earendil-works/pi-agent-core";
import { createModels } from "@earendil-works/pi-ai";
import { openaiProvider } from "@earendil-works/pi-ai/providers/openai";
import { Type } from "typebox";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const pexec = promisify(execFile);
const RFP_DIR = process.env.RFP_DIR ?? join(process.cwd(), "..", "..");

export const luna = {
  id: "gpt-5.6-luna", name: "Luna 5.6", api: "openai-responses" as const, provider: "openai",
  baseUrl: "https://api.openai.com/v1", reasoning: false, input: ["text"] as const,
  cost: { input: 0.2, output: 1.2, cacheRead: 0.02, cacheWrite: 0 },
  contextWindow: 1_000_000, maxTokens: 4096,
};

function apiKey(): string {
  if (process.env.OPENAI_API_KEY) return process.env.OPENAI_API_KEY;
  for (const line of readFileSync(join(RFP_DIR, "..", "..", ".env"), "utf8").split("\n"))
    if (line.startsWith("OPENAI_API_KEY=")) return line.slice(15).trim();
  throw new Error("no OPENAI_API_KEY");
}

// NB: do NOT resolve the key at module load — that throws during `next build` (no env/.env in the
// image) and breaks page-data collection. Resolve lazily at request time inside runTurn().
const models = createModels();
models.setProvider(openaiProvider());
const streamFn = models.streamSimple.bind(models);

async function rfp(args: string[]): Promise<string> {
  try {
    const { stdout } = await pexec("python3", ["rfp", ...args], { cwd: RFP_DIR, timeout: 15_000, maxBuffer: 4 << 20 });
    return stdout.trim();
  } catch (e: unknown) {
    const err = e as { stderr?: string; stdout?: string; message?: string };
    throw new Error((err.stderr || err.stdout || err.message || "tool error").split("\n")[0].slice(0, 200));
  }
}
const text = (s: string) => ({ content: [{ type: "text" as const, text: s }], details: { chars: s.length } });

const tools = [
  { name: "facets", label: "facets",
    description: "Counts by work_type/province/mode/ABC band for a broad query (~280 tok). Orient FIRST.",
    parameters: Type.Object({ query: Type.String() }),
    execute: async (_id: string, { query }: { query: string }) => text(await rfp(["facets", query])) },
  { name: "search", label: "search",
    description: "Profile-weighted ranked hits with the reason per rank. Vary the words; taxonomy won't find things. Optional: province, results, abc_min, abc_max, days_min, days_max.",
    parameters: Type.Object({ query: Type.String(), province: Type.Optional(Type.String()),
      results: Type.Optional(Type.Integer({ minimum: 1, maximum: 40 })), abc_min: Type.Optional(Type.Number()),
      abc_max: Type.Optional(Type.Number()), days_min: Type.Optional(Type.Integer()), days_max: Type.Optional(Type.Integer()) }),
    execute: async (_id: string, p: Record<string, unknown>) => {
      const a = ["search", String(p.query)];
      if (p.province) a.push("--province", String(p.province));
      if (p.results) a.push("--results", String(p.results));
      if (p.abc_min != null) a.push("--abc-min", String(p.abc_min));
      if (p.abc_max != null) a.push("--abc-max", String(p.abc_max));
      if (p.days_min != null) a.push("--days-min", String(p.days_min));
      if (p.days_max != null) a.push("--days-max", String(p.days_max));
      return text(await rfp(a));
    } },
  { name: "sql", label: "sql",
    description: "Read-only SQL over corpus.db (+ tags, docs). SELECT/WITH/EXPLAIN, one statement. work_type/scope/keywords live in tags.tags joined on id.",
    parameters: Type.Object({ select: Type.String(), limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 60 })) }),
    execute: async (_id: string, { select, limit }: { select: string; limit?: number }) =>
      text(await rfp(["sql", select, "--limit", String(limit ?? 40), "--cell", "120"])) },
  { name: "show", label: "show",
    description: "Full scope, line items, attached documents for up to ~10 ids. Expensive — narrow first.",
    parameters: Type.Object({ ids: Type.Array(Type.Integer(), { minItems: 1, maxItems: 10 }) }),
    execute: async (_id: string, { ids }: { ids: number[] }) => text(await rfp(["show", ...ids.map(String)])) },
  { name: "present", label: "present",
    description: "FINAL step when you have matches. Render results to the user as cards. Pass a short `intro` sentence, `refs` = the notices to show (each: id, a one-line `why`, optional short `tag`), and an optional `note`. The UI renders the cards from refs — do NOT also list the ids or their details in prose. Call this exactly once, last.",
    parameters: Type.Object({
      intro: Type.String(),
      refs: Type.Array(Type.Object({ id: Type.Integer(), why: Type.String(), tag: Type.Optional(Type.String()) }), { minItems: 0, maxItems: 12 }),
      note: Type.Optional(Type.String()),
    }),
    // Terminal: the model's answer IS this structured payload; stop the loop after it.
    execute: async (_id: string, p: { intro: string; refs: PresentRef[]; note?: string }) => ({
      content: [{ type: "text" as const, text: "presented" }], details: p, terminate: true,
    }) },
];

// Resolve regardless of cwd/build layout: explicit env (prod), source path (dev), RFP_DIR fallback.
function loadPrefix(): string {
  const paths = [process.env.RFP_PROMPT_PATH,
                 join(process.cwd(), "src", "lib", "system-prompt.txt"),
                 join(RFP_DIR, "webapp", "web", "src", "lib", "system-prompt.txt")].filter(Boolean) as string[];
  for (const p of paths) { try { return readFileSync(p, "utf8"); } catch { /* try next */ } }
  throw new Error("system-prompt.txt not found");
}
export const STATIC_PREFIX = loadPrefix();

export const MAX_ROUNDS = 6;

export type PresentRef = { id: number; why: string; tag?: string };
export type Present = { intro: string; refs: PresentRef[]; note?: string };

export type ChatEvent =
  | { type: "delta"; text: string }
  | { type: "tool"; name: string }
  | { type: "present"; present: Present }
  | { type: "done"; reply: string; present?: Present; usage: { input: number; cached: number; output: number; usd: number } };

/** Run one user turn against a session's history. Streams events; returns final reply + usage. */
export async function runTurn(
  history: { role: string; content: string }[],
  profileBlock: string | null,
  userMessage: string,
  sessionId: string,
  onEvent: (e: ChatEvent) => void,
): Promise<{ reply: string; usage: { input: number; cached: number; output: number; usd: number }; rounds: number; present?: Present }> {
  process.env.OPENAI_API_KEY ||= apiKey(); // ambient auth for the provider; resolved at request time
  const usage = { input: 0, cached: 0, output: 0, usd: 0 };
  let rounds = 0, lastRoundKey: number | null = null;

  const agent = new Agent({
    initialState: {
      systemPrompt: STATIC_PREFIX + (profileBlock ? `\n\n--- THIS FIRM ---\n${profileBlock}` : ""),
      model: luna as never,
      tools: tools as never,
      // Seed prior turns in the exact shape pi/provider expects. User content may be a string;
      // assistant content MUST be text parts + carry api/provider/model/usage/stopReason, else the
      // openai-responses converter mangles the transcript and the model ignores it (re-greets).
      messages: history.map((m) =>
        m.role === "assistant"
          ? { role: "assistant", content: [{ type: "text", text: m.content }],
              api: luna.api, provider: luna.provider, model: luna.id,
              usage: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0,
                       cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 } },
              stopReason: "stop", timestamp: 0 }
          : { role: "user", content: m.content, timestamp: 0 }) as never,
    },
    sessionId,
    streamFn: streamFn as never,
    getApiKey: () => apiKey(),
    toolExecution: "parallel",
    beforeToolCall: async (ctx: { assistantMessage?: { timestamp?: number } }) => {
      const key = ctx.assistantMessage?.timestamp ?? 0;
      if (key !== lastRoundKey) { rounds++; lastRoundKey = key; }
      if (rounds > MAX_ROUNDS)
        return { block: true, reason: `Tool-round budget (${MAX_ROUNDS}) reached. Answer now with the results you have.` };
    },
  });

  let present: Present | undefined;
  agent.subscribe((ev: Record<string, unknown>) => {
    if (ev.type === "message_update") {
      const e = (ev as { assistantMessageEvent?: { type?: string; delta?: string } }).assistantMessageEvent;
      if (e?.type === "text_delta" && e.delta) onEvent({ type: "delta", text: e.delta });
    }
    if (ev.type === "tool_execution_start") {
      if (ev.toolName === "present") {
        const p = ev.args as Present;
        present = { intro: p.intro ?? "", refs: Array.isArray(p.refs) ? p.refs : [], note: p.note };
        onEvent({ type: "present", present });
      } else {
        onEvent({ type: "tool", name: String(ev.toolName) });
      }
    }
    if (ev.type === "message_end") {
      const m = (ev as { message?: { role?: string; usage?: { input: number; cacheRead: number; output: number; cost: { total: number } } } }).message;
      if (m?.role === "assistant" && m.usage) {
        usage.input += m.usage.input; usage.cached += m.usage.cacheRead;
        usage.output += m.usage.output; usage.usd += m.usage.cost.total;
      }
    }
  });

  await agent.prompt(userMessage);
  type MC = string | { type: string; text?: string }[];
  const msgs = agent.state.messages as { role: string; content: MC }[];
  const textOf = (c: MC): string =>
    typeof c === "string" ? c : c.filter((p) => p.type === "text").map((p) => p.text).join(" ");
  // When the model used present, the reply IS its intro/note (prose about the cards); else the last text.
  const last = [...msgs].reverse().find((m) => m.role === "assistant" && textOf(m.content).trim().length > 0);
  const reply = present ? [present.intro, present.note].filter(Boolean).join("\n\n").trim()
                        : (last ? textOf(last.content).trim() : "");
  onEvent({ type: "done", reply, present, usage });
  return { reply, usage, rounds, present };
}

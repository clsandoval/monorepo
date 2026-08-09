// Drive each persona end-to-end through the real Luna loop. Prints per-turn LLM calls, tokens,
// cache ratio, tool calls, cost — and asserts the invariants the design promises.
import { makeAgent } from "./loop.mjs";
import { personas } from "./personas.mjs";
import { writeFileSync, appendFileSync } from "node:fs";

const peso = (usd) => `₱${(usd * 58).toFixed(3)}`; // ~58 PHP/USD, for feel

const TRANSCRIPT = new URL("./transcripts.txt", import.meta.url);
writeFileSync(TRANSCRIPT, `pi + Luna 5.6 spike transcripts\n`);
const T = (s) => appendFileSync(TRANSCRIPT, s + "\n");
const clip = (s, n = 700) => (s.length > n ? s.slice(0, n) + ` …[+${s.length - n} chars]` : s);

async function runPersona(p) {
  console.log(`\n${"=".repeat(78)}\n${p.label}\n${"=".repeat(78)}`);
  T(`\n${"=".repeat(78)}\n${p.label}\nprofile: ${p.profileBlock ?? "(none given)"}\n${"=".repeat(78)}`);
  const { agent, meter } = makeAgent(p.profileBlock, p.id);
  const citedAll = [];

  // full transcript: every tool call (name+args) and every tool result, as they happen
  agent.subscribe((ev) => {
    if (ev.type === "tool_execution_start")
      T(`  → tool ${ev.toolName}(${clip(JSON.stringify(ev.args), 300)})`);
    if (ev.type === "tool_execution_end") {
      const body = ev.result?.content?.map((c) => c.text).filter(Boolean).join("\n") ?? "";
      T(`  ← ${ev.result?.isError ? "ERROR " : ""}${clip(body)}`);
    }
  });

  for (const [i, turn] of p.turns.entries()) {
    T(`\n[T${i + 1}] USER: ${turn}`);
    const before = { calls: meter.calls, tool: meter.toolCalls, usd: meter.usd };
    console.log(`\n[T${i + 1}] user: ${turn}`);
    await agent.prompt(turn);

    // last assistant text = the reply the user sees
    const msgs = agent.state.messages;
    const reply = [...msgs].reverse().find((m) => m.role === "assistant" && m.content.some((c) => c.type === "text"));
    const replyText = reply?.content.filter((c) => c.type === "text").map((c) => c.text).join(" ").trim() ?? "";
    console.log(`     bot: ${replyText.replace(/\s+/g, " ").slice(0, 400)}`);
    T(`  BOT: ${replyText}`);

    const cited = [...replyText.matchAll(/\b(\d{5,9})\b/g)].map((m) => m[1]);
    citedAll.push(...cited);
    const d = { calls: meter.calls - before.calls, tool: meter.toolCalls - before.tool, usd: meter.usd - before.usd };
    console.log(`     ↳ ${d.calls} LLM call(s), ${d.tool} tool call(s), ${peso(d.usd)}, ids cited: ${cited.join(",") || "—"}`);
  }

  // cache ratio across the whole session (cached input / all input), the number that drives cost
  const totIn = meter.tokIn + meter.tokCached;
  const cacheRatio = totIn ? meter.tokCached / totIn : 0;
  const perTurn = meter.usd / p.turns.length;
  console.log(`\n  SESSION: ${meter.calls} LLM calls · ${meter.toolCalls} tool calls · ` +
    `${meter.tokIn}+${meter.tokCached}c in / ${meter.tokOut} out · ${peso(meter.usd)} ($${meter.usd.toFixed(4)})`);
  console.log(`  cache ratio: ${(cacheRatio * 100).toFixed(0)}%   ·   ${peso(perTurn)}/turn`);
  return { meter, citedAll, cacheRatio, perTurn };
}

const results = [];
for (const p of personas) results.push({ p, ...(await runPersona(p)) });

// --- invariants (the QA scenarios, mechanical) ---
console.log(`\n${"#".repeat(78)}\nINVARIANTS\n${"#".repeat(78)}`);
import { execFileSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
const RFP_DIR = dirname(dirname(fileURLToPath(import.meta.url)));
const exists = (id) => {
  const out = execFileSync("python3", ["rfp", "sql", `select 1 from corpus where id=${id} limit 1`], { cwd: RFP_DIR, encoding: "utf8" });
  return /\b1\b/.test(out);
};
let pass = 0, fail = 0;
const check = (name, ok) => { console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}`); ok ? pass++ : fail++; };

for (const r of results) {
  const uniq = [...new Set(r.citedAll)];
  const bad = uniq.filter((id) => !exists(id));
  check(`[${r.p.id}] every cited id exists in corpus (${uniq.length} cited)`, bad.length === 0);
  if (bad.length) console.log(`        hallucinated: ${bad.join(",")}`);
  check(`[${r.p.id}] cost/turn under ₱0.15 (${peso(r.perTurn)})`, r.perTurn * 58 < 0.15);
  check(`[${r.p.id}] cache ratio over 80% (${(r.cacheRatio * 100).toFixed(0)}%)`, r.cacheRatio > 0.8);
}
console.log(`\n  ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

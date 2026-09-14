# pi + Luna 5.6 agent-loop spike — results

Ran `agent/spike.mjs`: two personas, 5 turns each, real Luna via pi's `openai-responses` API,
real `rfp` CLI tools over the live 22,324-notice corpus. 2026-08-09.

## Verdict: the harness works. The ₱0.02/search economics do NOT hold as configured.

| | shell-launderer | ernesto-small |
|---|---|---|
| LLM calls | 29 | 20 |
| tool calls | 35 | 36 |
| input tok | 243,077 (+47,433 cached) | 170,989 (+57,431 cached) |
| output tok | 5,674 | 4,328 |
| session cost | **₱3.27 ($0.056)** | **₱2.35 ($0.041)** |
| ids cited | 97, **0 hallucinated** | 27, **0 hallucinated** |

## What held (the design is sound)
- **Zero hallucinated ids** across 124 cited — every id existed in the corpus. The output contract
  + ref-existence check works.
- **Read-only guard held** — no write/attach escaped the CLI authorizer.
- **Prior-not-filter behaved**: Ernesto got bigger out-of-band JV jobs surfaced and *labelled*, not
  hidden (T4). The shell corp got honest facts, not moralising or refusal — "competition data isn't
  published", "this requires PCAB", which is exactly correct and exactly unhelpful to a launderer.
- The model stays in its lane: turns English into CLI calls, picks refs. Never invented data.

## What broke (all cost, one bug)
1. **~50-100× over the ₱0.02/search target.** Two causes, both fixable:
   - **No tool-round cap.** Shell T2 = 10 LLM calls / 13 tool calls for ONE user turn. The model
     fishes (facets → 5-15 searches → show), which SKILL.md tells it to. Correct, but uncapped.
     The 6-round circuit breaker from the design is **not implemented**. Biggest lever.
   - **Cache underused: ~16% hit, not the assumed 90%.** Caching *is* engaging (cacheRead is
     nonzero), but growing context + tool-result churn + mid-session stubbing keep busting the
     prefix. At 90% cache the shell session would be ~₱1.0 instead of ₱3.3 (math: 0.9·290K·$0.02
     + 0.1·290K·$0.20 + out ≈ $0.018).
2. **SQL bug**: Ernesto T2 threw `OperationalError: no such column: id` — the model wrote a query
   with a bare `id` that was ambiguous across a join/subquery. It self-corrected in one retry
   (results still landed), but the SQL cookbook in the prompt should pin the `tags.tags` join form
   so this never happens.

## Reframe: was ₱0.02 ever the turn cost?
No — ₱0.02 was the design's *per-search* (per tool call) token cost. A *turn* is 5-10 tool calls.
So ₱0.10-0.15/turn is the honest target, and a fishing-heavy 5-turn session is ₱0.5-1.0 **once
caching works and rounds are capped.** The spike didn't disprove the economics; it showed the two
knobs that get you there.

## Next (small, in order of leverage)
1. Cap tool rounds per turn (~6) via `afterToolCall` terminate / a counter. 3 lines.
2. Make caching real: stop stubbing mid-session (the whole session fits easily — stubbing is
   premature here), keep the prefix byte-stable, pass a stable `sessionId`. Re-measure cacheRead.
3. Add the `tags.tags` join form to the SQL cookbook in the system prompt.
4. THEN re-run the spike and assert `cost/turn < ₱0.15` and `cacheRatio > 0.8`.

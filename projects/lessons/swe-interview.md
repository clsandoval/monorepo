---
type: lesson
topic: Anthropic-tier SWE interview (L4+, AI infra)
started: 2026-07-26
goal: Walk into an Anthropic-tier L4+ loop and clear all six rounds. Not LeetCode — the loop is
  practical concurrency, LLM-serving system design, a 45-60 min project deep dive, and a values round
  that eliminates technically-strong candidates. NOTE: this topic is the deliberate EXCEPTION to
  Carlos's critic-in/author-out pattern — the coding rounds are live authoring, on a clock, in a
  shared editor, with no agent. Authoring fluency is a required output here, unlike every other
  lesson topic.
level: Strong senior distributed-systems reflexes (6y backend, Python). DIAGNOSES correctly, NAMES
  incorrectly — called single-global-lock contention a "deadlock", knew `+=` races but described it as
  writes "failing" rather than a lost update. Picked asyncio for 5k HTTP calls with the right reason,
  but thinks a blocking call's blast radius is scoped to the resource, not the whole event loop.
  Project deep dive is his strongest branch (named rate limits as first-to-fail at 10x, and a real
  architectural reversal: native BYOK/multi-key with all config DB-side instead of split between DB
  and Anthropic-side) — but answered in 2 sentences where the round goes 10 layers deep. Values round:
  has the honesty instinct (went to more data, flagged leakage unprompted) but framed it as a
  methodology problem, not a disclosure problem. Zero read on live authoring under a clock — untested
  and structurally the biggest risk.
hours_estimate: 105
hours_done: 0.9
next_up: Rung 4 — LLM serving / continuous batching. NEGLECT DEBT IS NOW DUE: total blank in the
  diagnostic, adjacent to his day job, and deferred twice. Do it before any more concurrency.
  Warm-up (interleave): (1) the LRU opener he never assembled end-to-end — make him deliver all 4 beats
  in one unbroken 45-sec take, no scaffolding questions from me; (2) three names cold again: lost update,
  cache stampede, lock striping (he had contention + the single-flight FIX but blanked on both NAMES).
  (3) blast radius of a blocking call in a coroutine — STILL untested across two sessions, stop skipping it.
---

# Anthropic-tier SWE interview (L4+, AI infra)

Source material: a candidate writeup of the 2025 L4 remote loop (recruiter screen → technical screen
→ HM discussion → onsite: coding, system design, project deep dive, behavioral, culture/values).
Reported signal: practical concurrency over LeetCode; project deep dive underestimated; values round
eliminates technically-strong candidates.

## Roadmap (time-based, breadth-first — six rounds to cover, sweep then deepen)
- [ ] 1. Concurrency mechanisms & the right NAMES (~15h) — read-modify-write / lost update, atomicity,
      lock granularity, contention vs deadlock vs livelock, stampede/single-flight, queues, backpressure
- [ ] 2. Async I/O properly (~10h) — event loop, blocking-in-coroutine blast radius, `to_thread` /
      `run_in_executor`, gather vs as_completed, semaphores for rate limiting, cancellation & timeouts
- [ ] 3. Live authoring reps, NO agent (~30h) — the exception branch, and the expensive one. Hand-write
      the thread-safe cache, the reservation service, the streaming pipeline. On a clock. Typed, not directed.
- [ ] 4. LLM serving internals (~15h) — prefill vs decode, KV cache, static vs continuous batching,
      tail latency, GPU scheduling, token streaming
- [ ] 5. System design reps (~20h) — distributed inference API at volume, real-time streaming with
      fault tolerance, observability/instrumentation
- [ ] 6. Project deep dive narration — Daimon (~8h) — drilling ONE decision ten layers down, out loud
- [ ] 7. Values & decision-under-uncertainty (~10h) — disclosure framing, asymmetric costs, intellectual
      honesty when results conflict with what a launch needs

## Sessions (newest at top)

### 2026-07-27 · 37 min · Concurrency names + the LRU+TTL spoken opener
- **Names warm-up, 2.5/3 (was 0/3 last session):** "lock contention" correct cold; "read-modify-write"
  correct for the mechanism (gave him **lost update** for the bug, **atomicity** for the missing
  property); blanked on **cache stampede** as a name but produced the FIX unprompted — "placeholder
  future," which is exactly single-flight. Pattern holds hard: mechanism owned, vocabulary missing.
- **The opener drill — real progress.** Last session: total blank. This session he asked for the
  derivation process rather than freezing, then produced all three invariants cold and in his own
  words (fresh/unexpired · size bounded by N · map<->list agree bidirectionally).
- **What unlocked it:** teaching invariants as *"true BETWEEN operations, temporarily false DURING one"*
  → therefore **you find your critical section by finding where the invariant breaks**. That reframe
  turned invariants from recitation into a tool. Reuse this framing verbatim.
- **Best moment of the session:** answered the RWLock trap cold and correctly — "in an LRU the get also
  writes, it moves the node to the front." That's the discriminating insight for this question and he
  got it with no prompting.
- Then hedged on sharding ("I don't know the exact answer") despite having produced lock striping
  himself 20 min earlier on the rate limiter. **Confidence lags competence — call this out every time.**
- Taught on request: sharding mechanics (hash & (N-1), per-segment map/list/lock, approximate LRU,
  capacity skew, expensive size()) and the Caffeine trick (lock-free ring buffer of access records,
  tryLock batch replay, droppable records). Generalized principle delivered: **eviction policy is a
  hint, not a correctness requirement** — separate correctness state from policy state and relax
  consistency only where correctness doesn't depend on it.
- NOT DONE: beat 4 (deferring) and a full unbroken 45-sec delivery. He assembled beats 1 and 3 only
  in fragments, with me prompting each. **The end-to-end take is still untested — that IS the round.**

### 2026-07-26 · 18 min · Diagnostic + Rung 1 (concurrency names) — mostly cleared
- Diagnostic: 6 questions across all branches. See `level` above. Headline: verdicts good, names wrong.
- Covered: contention vs deadlock (one lock can't deadlock — no cycle possible); lock ordering as the
  structural fix for the deadlock class; lost update / read-modify-write and why "the writes fail" is the
  wrong phrasing (it's silent); lock the multi-step invariant, not the dict ops (atomic under GIL);
  check-then-act / TOCTOU; cache stampede; why the naive lock fix trades stampede for total serialization;
  single-flight with a Future placeholder; the two placeholder failure modes (unresolved → permanent hang,
  poisoned → cached failure) and resolve-and-remove-in-`finally`; negative caching as a deliberate choice.
- Got cold: deadlock verdict; 4/4 on which CPython ops need a lock; TOCTOU retrieved by name; exception
  propagation to all 49 waiters; "never returning" as one of the two placeholder failure modes.
- Missed: the word "contention" (guessed deadlock); lock-ordering policy; all three names unprompted.
- Delivered at end of session: the Q2 correction (blocking call in a coroutine blocks the WHOLE event
  loop, not just that resource — `to_thread`/`run_in_executor`/`asyncpg`; tell is unrelated endpoints
  slowing). Untested — retest next session.
- Stopped at: gave him the 4-beat spoken-opener scaffold after he blanked on producing one ("no idea
  where to start, it's been a while"). Scaffold delivered, ZERO reps done on it.
- Next: three-name cold retrieval + blast-radius retest, then drill the 4-beat scaffold on three fresh
  prompts out loud.

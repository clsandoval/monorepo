# Managed Agents Investigative Podcast — Spec

> **Date:** 2026-04-16
> **Format:** ~30-minute podcast script (single host, investigative)
> **Audience:** Developers and AI engineers

## Problem Statement

The Anthropic Managed Agents API launched in public beta on April 8, 2026. It bundles agent loop, tool execution, sandbox containers, and state persistence into a REST API. But what happens when real systems are built on top of it? The API's abstractions (agents, environments, sessions, events) shape architecture in ways that aren't obvious from the docs. This podcast investigates those architectural consequences through three real systems.

## Chosen Approach

A single-host investigative podcast that treats the three systems as case studies. The host has read the actual codebases and is reporting findings — not speculating. The throughline is the tension between **simplicity** (what the API gives you for free) and **control** (what you give up when Anthropic owns the runtime).

## Key Decisions

1. **Single host, no guests** — Tighter pacing, consistent voice, easier to control technical depth
2. **Three-act structure within the case studies** — Each system gets its own segment with a clear narrative arc
3. **Cold open uses a concrete code example** — Start with the Autopilot `ask_user` custom tool pause/resume pattern to immediately hook technical listeners
4. **The Daimon case study focuses on what gets deleted** — The most dramatic story is the 90+ tools and entire E2B/Supabase stack that becomes unnecessary
5. **Close with the "who owns the runtime" question** — This is the philosophical payload the episode builds toward

## Segment Structure (6 segments, ~30 minutes)

| # | Segment | Minutes | Purpose |
|---|---------|---------|---------|
| 1 | Cold Open | ~2 min | Hook: the `ask_user` pattern — an agent that pauses itself |
| 2 | The API Itself | ~5 min | Walk through the four core abstractions |
| 3 | Case Study: Autopilot | ~6 min | CLI orchestrator, skill uploads, the interactive bridge |
| 4 | Case Study: Podplay Ops Chat | ~6 min | Web app, SSE streaming, event buffering, multi-subscriber |
| 5 | Case Study: Daimon | ~6 min | The planned migration — what gets deleted, what gets simpler |
| 6 | Patterns & Close | ~5 min | Cross-cutting themes, the runtime ownership question, takeaways |

## Out of Scope

- Tutorial/how-to content (this is investigative, not instructional)
- Pricing analysis
- Comparison to competitor agent platforms (LangGraph, AWS Bedrock Agents, etc.)
- Performance benchmarks

---
repo: milla-jovovich/mempalace
slug: milla-jovovich-mempalace
stars_at_research: 48969
pushed_at: 2026-04-22
sibling_repo: MemPalace/mempalace
sources:
  - https://api.github.com/repos/milla-jovovich/mempalace/readme
  - https://api.github.com/repos/milla-jovovich/mempalace/git/trees/main
  - https://api.github.com/repos/milla-jovovich/mempalace/git/trees/main?recursive=1
  - https://api.github.com/repos/milla-jovovich/mempalace/commits
  - https://api.github.com/repos/milla-jovovich/mempalace/contents/pyproject.toml
  - https://api.github.com/repos/milla-jovovich/mempalace/contents/mempalace/backends/base.py
  - https://api.github.com/repos/milla-jovovich/mempalace/contents/mempalace/searcher.py
  - https://api.github.com/repos/milla-jovovich/mempalace/contents/mempalace/palace.py
  - https://api.github.com/repos/milla-jovovich/mempalace/contents/mempalace/layers.py
  - https://api.github.com/repos/milla-jovovich/mempalace/contents/mempalace/mcp_server.py
  - https://api.github.com/repos/milla-jovovich/mempalace/contents/benchmarks/longmemeval_bench.py
  - https://api.github.com/repos/milla-jovovich/mempalace/contents/benchmarks/BENCHMARKS.md
  - https://api.github.com/repos/MemPalace/mempalace/git/trees/main
researched_at: 2026-04-23
---

## What this repo actually achieves

MemPalace is a local-first AI-memory library that stores conversation and
project content as **verbatim text** (no summarization, no LLM-extracted
"facts") and retrieves it through a pluggable vector backend. The thesis
is structural: rather than having an LLM decide which facts to keep and
discarding the rest, store the raw words in a structured index — *wings*
(people/projects), *rooms* (topics), *drawers* (original chunks) — and
let semantic search plus keyword re-ranking do the work. Nothing leaves
the machine unless the caller opts in; the default install needs only
`chromadb` and `pyyaml` (`pyproject.toml`).

The headline number in this repo is **96.6% R@5 on LongMemEval (500
questions, session granularity)** with raw semantic search and no LLM at
any stage, reproduced end-to-end by `benchmarks/longmemeval_bench.py`
against the `longmemeval_s_cleaned.json` dataset. A tuned hybrid mode
(v4) adds keyword boosting, temporal-proximity boosting, and
preference-pattern extraction, and reports **98.4% R@5 on the held-out
450-question split** (tuned on 50 dev questions, per
`benchmarks/lme_split_50_450.json` and `benchmarks/BENCHMARKS.md`). The
optional LLM-rerank stage pushes past 99% and is model-agnostic
(reproduced with Haiku, Sonnet, and minimax-m2.7). The baseline being
out-scored is the set of academic dense/sparse retrievers that sit in the
70–85% R@5 range on the same benchmark (`benchmarks/BENCHMARKS.md`
comparison table).

Around the retrieval core, the repo ships an MCP server exposing ~29
tools for palace reads/writes, knowledge-graph ops, and agent diaries
(`mempalace/mcp_server.py`), a CLI (`mempalace/cli.py`,
`mempalace/__main__.py`), a temporal entity-relationship graph
(`mempalace/knowledge_graph.py`), mining adapters for Claude Code
JSONL conversations (`mempalace/convo_miner.py`,
`mempalace/miner.py`), and hooks for auto-saving before context
compression (`hooks/`). It is packaged on PyPI as `mempalace` 3.3.0.

## Six-axis walk (advocating)

### 1. Compute topology

MemPalace is a **Python library plus two thin process wrappers**: a CLI
(`mempalace/cli.py`, registered as `mempalace = mempalace.cli:main`) and
an MCP stdio server (`mempalace/mcp_server.py`, registered as
`mempalace-mcp = mempalace.mcp_server:main`). Storage is the ChromaDB
collection under the palace directory; lifetime is bound to the caller,
not a long-running daemon. For an agent, the typical topology is:
MCP server spawned as a subprocess of Claude Code, reading/writing a
local palace directory through `ChromaBackend`. The
`mcp_server.py` preamble explicitly handles the stdio-multiplexing
subtlety — stdout is fd-level redirected to stderr before heavy imports
so chromadb/onnxruntime banners can't corrupt the JSON-RPC stream — which
is exactly the kind of detail you only get right if you've actually
shipped an MCP server.

### 2. LLM locus

The **core retrieval path uses no LLM**. Embeddings default to
ChromaDB's `all-MiniLM-L6-v2` (384-dim, local), with opt-in
`fastembed`-backed models (`bge-base`, `bge-large`, `nomic`, `mxbai`) via
the `--embed-model` flag in `benchmarks/longmemeval_bench.py`. An LLM
only enters the pipeline at two optional sites: (a) the rerank stage in
the hybrid benchmark mode, which the repo explicitly designs to be
model-agnostic (Haiku, Sonnet, or a local Ollama model all reproduce the
number), and (b) `mempalace/closet_llm.py` / `fact_checker.py` as
optional enrichment. The `dependencies` list in `pyproject.toml` is
`chromadb` and `pyyaml` — no provider SDK is a hard dependency. This is
a considered choice: the product story is "works offline, no API key,
one dependency," and the code respects that story.

### 3. Tool mechanics

The public surface is the MCP tool set listed in `mempalace/mcp_server.py`:
reads (`mempalace_status`, `mempalace_list_wings`, `mempalace_list_rooms`,
`mempalace_get_taxonomy`, `mempalace_search`,
`mempalace_check_duplicate`), writes (`mempalace_add_drawer`,
`mempalace_delete_drawer`), and maintenance (`mempalace_reconnect`).
The CLI exposes the same operations as subcommands (`mempalace mine`,
`mempalace search`, `mempalace wake-up`, `mempalace init`). Under the
hood, every tool funnels through `mempalace/palace.py`'s
`get_collection`/`get_closets_collection` accessors, which return a
`BaseCollection` from the backend registry — so the primitives are
really just `query`, `get`, `add`, `delete` on a typed collection
interface defined in `mempalace/backends/base.py` (`QueryResult`,
`GetResult`, `PalaceRef`). The MCP layer is thin; the semantics live in
the backend contract.

### 4. Extension loading (skills + MCP)

MemPalace is a **hybrid**: a pip-installable Python library, a CLI entry
point, and an MCP server, all from the same package. It also declares
two entry-point groups in `pyproject.toml`:
`mempalace.backends` (so third parties can register alternative vector
stores — `ChromaBackend` is the only in-tree implementation) and
`mempalace.sources` (RFC 002 source adapters for mining new content
types). This is plugin architecture by the book: publish the ABC in
`backends/base.py`, wire the registry through `setuptools` entry points,
let the ecosystem add backends without forking. The MCP server is a
first-class peer, not an afterthought grafted onto a library.

### 5. Context & memory strategy

This is the load-bearing axis and the thesis of the repo.

**"Verbatim" is taken literally.** `mempalace/palace.py` defines a
`NORMALIZE_VERSION = 2` constant whose only job is to strip framing
noise from Claude Code JSONL (system tags, hook chrome) before storage;
the actual conversational content is never summarized or paraphrased.
When the mining pipeline detects that existing drawers were stored under
an older `normalize_version`, it silently rebuilds them — users don't
manually re-mine. That is the opposite of the dominant pattern in the
memory-system space, where an LLM is used to extract "user prefers
PostgreSQL"-style facts at ingestion time and the original text is
discarded.

**Storage schema.** Content is chunked into *drawers* and filed into a
wing/room taxonomy (`build_where_filter` in `mempalace/searcher.py`
shows the ChromaDB `$and` predicate shape). A second collection,
`mempalace_closets`, holds compact pointer documents of the form
`topic|entities|→drawer_id_a,drawer_id_b` that the closets-based search
path uses to promote drawers whose topical closet matches the query
(see `_CLOSET_DRAWER_REF_RE` and `_extract_drawer_ids_from_closet` in
`searcher.py`). A third SQLite-backed store powers the temporal entity
graph (`mempalace/knowledge_graph.py`), with validity windows so facts
can be invalidated rather than destructively overwritten.

**Retrieval algorithm.** `mempalace/searcher.py` runs hybrid ranking:
the drawer-level vector query is the floor ("always runs"), and closet
hits can only *boost* — closets are explicitly a ranking signal, not a
gate, so a noisy closet can't hide a drawer the direct path would have
found. The re-rank in `_hybrid_rank` is a convex combination of vector
similarity (`max(0, 1 - distance)` over ChromaDB cosine distance) and
Okapi-BM25 with smoothed IDF computed over the candidate set
(`_bm25_scores`, `log((N - df + 0.5) / (df + 0.5) + 1)`). BM25 is
min-max normalized so the weights (0.6 vector / 0.4 BM25 by default) are
commensurable. When a match is returned, `_expand_with_neighbors`
fetches the ±radius sibling chunks from the same source file so
retrieval doesn't clip mid-thought — a small but real UX gain over naive
chunk retrieval.

**Context budget.** `mempalace/layers.py` implements a 4-layer wake-up
protocol. Layer 0 (~100 tokens, `~/.mempalace/identity.txt`) and Layer 1
(~500–800 tokens, top moments) are always loaded; Layer 2 is loaded
on-demand per wing/room; Layer 3 is unbounded semantic search. Total
wake-up cost is budgeted at ~600–900 tokens, leaving 95%+ of a model's
context free. This is the "pinning" story: the repo is explicit about
what gets loaded when, with named layers rather than implicit heuristics.

**How 96.6% is operationalized.** `benchmarks/longmemeval_bench.py` is
the source of truth. For each of the 500 LongMemEval questions, it
builds a fresh ephemeral ChromaDB collection from the haystack sessions,
queries it with the question, and scores with `recall_any`, `recall_all`,
and `ndcg`. The raw mode uses ChromaDB's default embedder against session-
or turn-granularity docs — no hybrid re-rank, no LLM. The hybrid v4 mode
layers in the keyword/temporal boosts and produces the held-out 98.4%.
The result files (`benchmarks/results_mempal_raw_session_*.jsonl`,
`benchmarks/results_mempal_hybrid_v4_*.jsonl`) are committed alongside
the harness, so the numbers are reproducible and auditable per question.

### 6. Scaling topology

Reference deployment is **single-process, single-user, local
filesystem**. ChromaDB owns persistence; there is no queue, no shard, no
multi-tenancy layer in-tree. The `BaseBackend` ABC in
`mempalace/backends/base.py` anticipates scale-out — `PalaceRef` carries
a `namespace` field for server-mode tenant/prefix routing, and
`HealthStatus` is the uniform health signal every backend must
implement — but the only shipped backend is `ChromaBackend`. This is
honest about the target: a developer's laptop / agent host, not a
multi-tenant SaaS. The abstraction is in place for the day someone
registers a Qdrant, Weaviate, or server-mode backend through the
`mempalace.backends` entry-point group, without asking the core to grow
a different deployment model.

## The contribution

The contribution is **empirical, not architectural** — and the repo is
explicit about that framing in `benchmarks/BENCHMARKS.md`: "raw
verbatim text with good embeddings is a stronger baseline than anyone
realized — because it doesn't lose information." The dominant pattern in
the AI-memory space (Mem0, Mastra, Supermemory, Hindsight) is to run an
LLM at ingestion time to extract structured memories and index those;
MemPalace's headline finding is that skipping that step entirely and
running plain semantic search over verbatim conversation chunks scores
96.6% R@5 on LongMemEval with zero API calls. The surrounding code —
wing/room/drawer taxonomy, closet pointer index, hybrid BM25+vector
re-rank, 4-layer wake-up — is a packaged, usable wrapper around that
empirical claim, turned into an MCP server with 29 tools and auto-save
hooks for Claude Code. Call it what it is: a well-measured baseline
that had been missing from the literature, shipped as a production-ready
library.

## Relationship to MemPalace/mempalace

The top-level tree of `milla-jovovich/mempalace` and `MemPalace/mempalace`
is byte-for-byte identical at the directory level (same 14 dirs and 14
root files). The `pyproject.toml` at `milla-jovovich/mempalace` lists
`milla-jovovich` as the sole author and points
`Homepage`/`Repository` URLs at `github.com/MemPalace/mempalace`, and
the README shipped in this repo links "the only official source" to the
`MemPalace/mempalace` org — so this appears to be the personal/author
account that mirrors or sits upstream of the org repo, with the
MemPalace org serving as the canonical public-facing home.

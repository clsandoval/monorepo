"use client";
// Google-style results-first shell: header + search, Results / AI Mode tabs.
// Both panes stay mounted (inactive hidden with CSS) so state survives switching.
import { useCallback, useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Workspace } from "@/components/workspace";
import { ResultRowItem } from "@/components/result-row";
import type { ResultRow, SearchPlan, SearchRequest, SearchResponse } from "@/lib/search-types";

const PAGE = 20;

type ListState =
  | { phase: "loading" }        // board fetch → skeleton
  | { phase: "interpreting" }   // fresh q → "Reading your search…"
  | { phase: "error"; retryQ: string }
  | { phase: "ready"; plan: SearchPlan; total: number; results: ResultRow[]; more: boolean };

async function postSearch(body: SearchRequest, signal?: AbortSignal): Promise<SearchResponse> {
  const r = await fetch("/api/search", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body), signal,
  });
  if (!r.ok) throw new Error(`search failed (${r.status})`);
  return r.json();
}

export function SearchShell() {
  const [tab, setTab] = useState<"results" | "ai">("results");
  const [input, setInput] = useState("");
  const [activeQ, setActiveQ] = useState("");   // q behind the current list (for AI seed)
  const [aiSeed, setAiSeed] = useState<string | undefined>(undefined);
  const [state, setState] = useState<ListState>({ phase: "loading" });
  const [appending, setAppending] = useState(false);
  const [appendFailed, setAppendFailed] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inflightQ = useRef<string | null>(null);
  const busyRef = useRef(false); // sync double-append guard

  // Fresh load: {} = board, {q} = interpreted search. Latest request wins.
  const run = useCallback(async (q: string) => {
    if (inflightQ.current === q) return; // double-submit guard (same q); new q supersedes below
    abortRef.current?.abort();
    const c = new AbortController();
    abortRef.current = c;
    inflightQ.current = q;
    setState(q ? { phase: "interpreting" } : { phase: "loading" });
    setAppendFailed(false);
    try {
      const r = await postSearch(q ? { q, limit: PAGE } : { limit: PAGE }, c.signal);
      if (c.signal.aborted) return;
      // atomic replace — the whole page lands at once, no partial old/new mix
      setState({ phase: "ready", plan: r.plan, total: r.total, results: r.results, more: r.more });
      setActiveQ(q);
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setState({ phase: "error", retryQ: q });
    } finally {
      if (inflightQ.current === q) inflightQ.current = null;
    }
  }, []);

  // On load: a saved snapshot (coming back from a detail page) wins over refetching — bfcache
  // is CDP-hostile and evictable, so restoration must not depend on it. Else honor ?q=/board.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q") ?? "";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ?q=/sessionStorage are external state, read once on mount
    if (q) setInput(q);
    try {
      const saved = JSON.parse(sessionStorage.getItem("bidkita-results") ?? "null") as
        { q: string; state: ListState; scrollTop: number } | null;
      if (saved && saved.q === q && saved.state.phase === "ready") {
        setState(saved.state); setActiveQ(q);
        requestAnimationFrame(() => {
          const el = document.getElementById("pane-results");
          if (el) el.scrollTop = saved.scrollTop;
        });
        return;
      }
    } catch { /* corrupt snapshot → normal load */ }
    run(q);
  }, [run]);

  // Snapshot results + scroll on every navigation away (row click → detail page).
  const stateRef = useRef(state);
  const activeQRef = useRef(activeQ);
  useEffect(() => { stateRef.current = state; activeQRef.current = activeQ; });
  useEffect(() => {
    const save = () => {
      if (stateRef.current.phase !== "ready") return;
      try {
        sessionStorage.setItem("bidkita-results", JSON.stringify({
          q: activeQRef.current, state: stateRef.current,
          scrollTop: document.getElementById("pane-results")?.scrollTop ?? 0,
        }));
      } catch { /* quota — nonfatal */ }
    };
    window.addEventListener("pagehide", save);
    return () => window.removeEventListener("pagehide", save);
  }, []);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const q = input.trim();
    history.replaceState(null, "", q ? `?q=${encodeURIComponent(q)}` : window.location.pathname);
    run(q);
  }

  function clearPlan() {
    setInput("");
    setActiveQ("");
    history.replaceState(null, "", window.location.pathname);
    run("");
  }

  // Sort/filter changes re-execute the current plan with edited fields — no Luna call, ~₱0.
  const applyPlan = useCallback(async (plan: SearchPlan) => {
    abortRef.current?.abort();
    const c = new AbortController();
    abortRef.current = c;
    setAppendFailed(false);
    try {
      const r = await postSearch({ plan, limit: PAGE }, c.signal);
      if (c.signal.aborted) return;
      setState({ phase: "ready", plan: r.plan, total: r.total, results: r.results, more: r.more });
    } catch (e) {
      if ((e as Error).name !== "AbortError") setState({ phase: "error", retryQ: activeQ });
    }
  }, [activeQ]);

  // Edit fields of the live plan (from the sort/filter controls) and re-execute.
  const patchPlan = useCallback((patch: Partial<SearchPlan>, drop: (keyof SearchPlan)[] = []) => {
    if (state.phase !== "ready") return;
    const next = { ...state.plan, ...patch };
    for (const k of drop) delete next[k];
    applyPlan(next);
  }, [state, applyPlan]);

  // Filter facet + UI state
  const [provs, setProvs] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  useEffect(() => {
    fetch("/api/search").then((r) => r.json())
      .then((d) => setProvs(d.provinces ?? [])).catch(() => {});
  }, []);

  // Stateless pagination: post the echoed plan + offset back.
  const loadMore = useCallback(async () => {
    if (busyRef.current || state.phase !== "ready" || !state.more) return;
    busyRef.current = true;
    setAppending(true);
    setAppendFailed(false);
    const s = state;
    try {
      const r = await postSearch({ plan: s.plan, offset: s.results.length, limit: PAGE });
      setState((cur) =>
        cur.phase === "ready" && cur.plan === s.plan && cur.results.length === s.results.length
          ? { ...cur, results: [...cur.results, ...r.results], more: r.more, total: r.total }
          : cur); // a fresh search superseded this append — drop it
    } catch {
      setAppendFailed(true);
    } finally {
      busyRef.current = false;
      setAppending(false);
    }
  }, [state]);

  // Observer recreated when loadMore changes (i.e. per page) → re-fires if sentinel still visible.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const ob = new IntersectionObserver(
      (es) => { if (es.some((x) => x.isIntersecting)) loadMore(); },
      { rootMargin: "600px" });
    ob.observe(el);
    return () => ob.disconnect();
  }, [loadMore]);

  const ready = state.phase === "ready" ? state : null;

  return (
    <div className="flex h-dvh flex-col bg-background text-foreground">
      {/* style 11: the blue rule under the header is the brand's one structural accent */}
      <header className="shrink-0 border-b border-primary">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 pt-4 md:flex-row md:items-center md:gap-6">
          <span className="whitespace-nowrap text-2xl font-bold lowercase tracking-tight text-primary">bidkita</span>
          <form onSubmit={submit} role="search" className="relative min-w-0 flex-1 md:max-w-2xl">
            <label htmlFor="shell-q" className="sr-only">Search open government tenders</label>
            <Input id="shell-q" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Search 18,000+ open government tenders — e.g. drainage works in Cavite under ₱5M"
              data-testid="search-input" autoComplete="off"
              className="h-11 rounded-full bg-muted/40 pl-4 pr-12 md:text-base" />
            <button type="submit" data-testid="search-submit" aria-label="Search"
              className="absolute right-1 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Search className="size-4" />
            </button>
          </form>
        </div>
        <div role="tablist" aria-label="Result view" className="mx-auto flex max-w-5xl gap-2 px-4 pt-1">
          <TabBtn testid="tab-results" active={tab === "results"} controls="pane-results"
            onClick={() => setTab("results")}>Results</TabBtn>
          <TabBtn testid="tab-ai" active={tab === "ai"} controls="pane-ai"
            onClick={() => { setTab("ai"); if (activeQ) setAiSeed(activeQ); }}>AI Mode</TabBtn>
        </div>
      </header>

      {/* Results pane */}
      <div role="tabpanel" id="pane-results" aria-label="Results"
        className={tab === "results" ? "min-h-0 flex-1 overflow-y-auto" : "hidden"}>
        <div className="mx-auto max-w-5xl px-4 py-4">
          <div aria-live="polite" className="flex min-h-8 flex-wrap items-center gap-x-3 gap-y-2">
            {ready && (
              <p className="font-mono text-xs text-muted-foreground tabular-nums">
                {ready.total.toLocaleString()} {ready.plan.kind === "search" ? "results" : "open notices"} · Source: PhilGEPS
              </p>
            )}
            {ready && ready.plan.kind === "search" && (
              <span data-testid="plan-note"
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 py-0.5 pl-3 pr-1 text-xs text-foreground/80">
                {ready.plan.note}
                <button onClick={clearPlan} aria-label="Clear search, back to all open notices"
                  className="grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">×</button>
              </span>
            )}
            {ready && (() => {
              const p = ready.plan;
              const nFilters = (p.province ? 1 : 0) + (p.abc_min != null || p.abc_max != null ? 1 : 0) + (p.days_max != null ? 1 : 0) + (p.round ? 1 : 0);
              const sortVal = p.sort ?? (p.kind === "search" ? "relevance" : "closing");
              const set = patchPlan;
              return (
                <span className="ml-auto flex items-center gap-2">
                  <button onClick={() => setFiltersOpen((v) => !v)} data-testid="filters-toggle"
                    aria-expanded={filtersOpen}
                    className={`h-9 rounded-md border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      filtersOpen || nFilters ? "border-primary/50 text-primary" : "border-input text-muted-foreground hover:text-foreground"}`}>
                    Filters{nFilters ? ` · ${nFilters}` : ""}
                  </button>
                  <label htmlFor="sort" className="sr-only">Sort by</label>
                  <select id="sort" data-testid="sort" value={sortVal}
                    onChange={(e) => {
                      const v = e.target.value as NonNullable<SearchPlan["sort"]>;
                      set(v === "relevance" ? {} : { sort: v }, v === "relevance" ? ["sort"] : []);
                    }}
                    className="h-9 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="relevance">Sort: relevance</option>
                    <option value="closing">Sort: closing soon</option>
                    <option value="newest">Sort: newest first</option>
                    <option value="abc_desc">Sort: budget high → low</option>
                    <option value="abc_asc">Sort: budget low → high</option>
                  </select>
                </span>
              );
            })()}
          </div>
          {ready && filtersOpen && (() => {
            const p = ready.plan;
            const set = patchPlan;
            const sel = "h-9 max-w-44 rounded-md border border-input bg-background px-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
            const budgetVal = p.abc_min != null ? "min" : p.abc_max != null ? String(p.abc_max) : "";
            const BUDGETS = [5e5, 1e6, 5e6, 1e7, 5e7];
            return (
              <div className="mt-2 flex flex-wrap items-center gap-2" data-testid="filters-row">
                <label htmlFor="f-prov" className="sr-only">Province</label>
                <select id="f-prov" data-testid="filter-province" value={p.province ?? ""} className={sel}
                  onChange={(e) => set(e.target.value ? { province: e.target.value } : {}, e.target.value ? [] : ["province"])}>
                  <option value="">All provinces</option>
                  {p.province && !provs.includes(p.province) && <option value={p.province}>{p.province}</option>}
                  {provs.map((pr) => <option key={pr} value={pr}>{pr}</option>)}
                </select>
                <label htmlFor="f-budget" className="sr-only">Budget</label>
                <select id="f-budget" data-testid="filter-budget" value={budgetVal} className={sel}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) set({}, ["abc_min", "abc_max"]);
                    else if (v === "min") set({ abc_min: 5e7 }, ["abc_max"]);
                    else set({ abc_max: Number(v) }, ["abc_min"]);
                  }}>
                  <option value="">Any budget</option>
                  {p.abc_max != null && !BUDGETS.includes(p.abc_max) &&
                    <option value={String(p.abc_max)}>≤ ₱{(p.abc_max / 1e6).toLocaleString()}M</option>}
                  {BUDGETS.map((b) => <option key={b} value={String(b)}>≤ ₱{b >= 1e6 ? `${b / 1e6}M` : `${b / 1e3}K`}</option>)}
                  <option value="min">₱50M and up</option>
                </select>
                <label htmlFor="f-close" className="sr-only">Closing within</label>
                <select id="f-close" data-testid="filter-closing" value={p.days_max != null ? String(p.days_max) : ""} className={sel}
                  onChange={(e) => set(e.target.value ? { days_max: Number(e.target.value) } : {}, e.target.value ? [] : ["days_max"])}>
                  <option value="">Any deadline</option>
                  {p.days_max != null && ![2, 7, 30].includes(p.days_max) &&
                    <option value={String(p.days_max)}>closing ≤ {p.days_max} days</option>}
                  <option value="2">closing ≤ 2 days</option>
                  <option value="7">closing ≤ 7 days</option>
                  <option value="30">closing ≤ 30 days</option>
                </select>
                <label htmlFor="f-round" className="sr-only">Bidding round</label>
                {/* re-bids + two-failed-negotiated = the least competitive, highest win-rate notices */}
                <select id="f-round" data-testid="filter-round" value={p.round ?? ""} className={sel}
                  onChange={(e) => set(e.target.value ? { round: e.target.value as "fresh" | "rebid" | "negotiated" } : {}, e.target.value ? [] : ["round"])}>
                  <option value="">Any round</option>
                  <option value="fresh">1st posting</option>
                  <option value="rebid">re-bid (failed once)</option>
                  <option value="negotiated">negotiated (failed twice)</option>
                </select>
              </div>
            );
          })()}

          {state.phase === "loading" && (
            <ul aria-hidden className="mt-2 animate-pulse border-t border-border">
              {Array.from({ length: 8 }, (_, i) => (
                <li key={i} className="border-b border-border px-3 py-4 md:px-4">
                  <div className="h-4 w-2/3 rounded bg-muted" />
                  <div className="mt-2 h-3 w-1/3 rounded bg-muted" />
                </li>
              ))}
            </ul>
          )}

          {state.phase === "interpreting" && (
            <p className="animate-pulse py-10 text-center text-sm text-muted-foreground">Reading your search…</p>
          )}

          {state.phase === "error" && (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground">Couldn&apos;t load results.</p>
              <Button variant="outline" className="mt-3 h-11 px-5" onClick={() => run(state.retryQ)}>Retry</Button>
            </div>
          )}

          {ready && ready.results.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              nothing matches — try wider words or ask AI Mode
            </p>
          )}

          {ready && ready.results.length > 0 && (
            <>
              <ul className="mt-2 border-t border-border">
                {ready.results.map((r, i) => <li key={`${r.id}-${i}`}><ResultRowItem row={r} /></li>)}
              </ul>
              {appending && (
                <p className="animate-pulse py-4 text-center font-mono text-xs text-muted-foreground">loading more…</p>
              )}
              {appendFailed && (
                <div className="py-4 text-center">
                  <p className="text-xs text-muted-foreground">Couldn&apos;t load more.</p>
                  <Button variant="outline" size="sm" className="mt-2 h-11 px-4" onClick={loadMore}>Retry</Button>
                </div>
              )}
              {!ready.more && !appending && (
                <p className="py-6 text-center font-mono text-xs text-muted-foreground">
                  {ready.total > ready.results.length
                    ? `— top ${ready.results.length} of ${ready.total.toLocaleString()} shown · narrow your search or ask AI Mode —`
                    : "— end of results —"}
                </p>
              )}
              <div ref={sentinelRef} aria-hidden className="h-px" />
            </>
          )}
        </div>
      </div>

      {/* AI Mode pane — the existing chat workspace, kept mounted */}
      <div role="tabpanel" id="pane-ai" aria-label="AI Mode"
        className={tab === "ai" ? "min-h-0 flex-1" : "hidden"}>
        <Workspace seedQuery={aiSeed} />
      </div>
    </div>
  );
}

function TabBtn({ testid, active, controls, onClick, children }: {
  testid: string; active: boolean; controls: string; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button role="tab" aria-selected={active} aria-controls={controls} data-testid={testid} onClick={onClick}
      className={`h-11 border-b-2 px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
        active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
      {children}
    </button>
  );
}

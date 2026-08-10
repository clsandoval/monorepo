"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TenderCard, type Notice } from "@/components/tender-card";

type Session = { id: string; title: string; updated_at: string };
// "#13141421" in any bubble becomes a link to the notice page.
const linkRefs = (s: string) => s.replace(/#(\d{5,12})\b/g, "[#$1](/notice/$1)");
type Ref = { id: number; why: string; tag?: string };
type Msg = { role: "user" | "assistant"; content: string; refs?: Ref[]; notices?: Notice[] };

// Parse a stored assistant message: present-JSON -> {intro/note text, refs}; else plain text.
function parseStored(role: string, content: string): Msg {
  if (role === "assistant" && content.startsWith('{"__present"')) {
    try {
      const p = JSON.parse(content) as { intro?: string; note?: string; refs?: Ref[] };
      return { role: "assistant", content: [p.intro, p.note].filter(Boolean).join("\n\n"), refs: p.refs ?? [] };
    } catch { /* fall through */ }
  }
  return { role: role as Msg["role"], content };
}

export function Workspace({ seedQuery }: { seedQuery?: string } = {}) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false); // mobile drawer
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // "#" notice references autocomplete as you type (Claude-Code-@-files style).
  type Sug = { id: number; title: string; agency: string; abc: number | null };
  const [sug, setSug] = useState<Sug[] | null>(null);
  const [sugIdx, setSugIdx] = useState(0);
  const sugToken = useRef<{ start: number; end: number } | null>(null);
  const sugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  function refreshSuggest(value: string, caret: number) {
    // spaces allowed while the palette is open ("#school feeding"); a newline,
    // a second '#', or Escape ends the token
    const m = value.slice(0, caret).match(sug ? /#([^\n#]{0,40})$/ : /#([^\s#]*)$/);
    if (!m) { setSug(null); sugToken.current = null; return; }
    sugToken.current = { start: caret - m[1].length - 1, end: caret };
    if (sugTimer.current) clearTimeout(sugTimer.current);
    sugTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/notices/suggest?q=${encodeURIComponent(m[1])}`);
        const d = (await r.json()) as { suggestions: Sug[] };
        setSug(d.suggestions.length ? d.suggestions : null);
        setSugIdx(0);
      } catch { setSug(null); }
    }, 180);
  }

  // resolved chips for every #id currently in the input — verify + remove
  const [attached, setAttached] = useState<{ id: number; title: string }[]>([]);
  const attTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    const ids = [...new Set([...input.matchAll(/#(\d{5,12})\b/g)].map((m) => Number(m[1])))].slice(0, 3);
    if (!ids.length) { setAttached([]); return; }
    if (attTimer.current) clearTimeout(attTimer.current);
    attTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/notices?ids=${ids.join(",")}`).then((x) => x.json());
        const byId = new Map((r.notices ?? []).map((n: { id: number; title: string }) => [Number(n.id), n]));
        setAttached(ids.map((id) => {
          const n = byId.get(id) as { title?: string } | undefined;
          return { id, title: n?.title ?? "unknown notice" };
        }));
      } catch { /* keep previous chips */ }
    }, 250);
  }, [input]);
  const removeRef = (id: number) =>
    setInput((v) => v.replace(new RegExp(`#${id}\\b\\s?`, "g"), "").replace(/\s{2,}/g, " "));

  function pickSug(s: Sug) {
    const t = sugToken.current;
    if (!t) return;
    const next = `${input.slice(0, t.start)}#${s.id} ${input.slice(t.end)}`;
    setInput(next);
    setSug(null);
    sugToken.current = null;
    requestAnimationFrame(() => taRef.current?.focus());
  }

  function stop() { abortRef.current?.abort(); }

  // Google-style handoff: opening the AI tab with an active search query starts a NEW session and
  // auto-runs that query. Each distinct query runs once — toggling tabs never re-runs it.
  const seedDone = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!seedQuery || seedQuery === seedDone.current) return;
    seedDone.current = seedQuery;
    (async () => {
      abortRef.current?.abort(); // a turn mid-stream in the old session yields to the handoff
      const id = await newSession();
      runSend(seedQuery, id);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- newSession/runSend are stable per render
  }, [seedQuery]);

  const loadSessions = useCallback(async () => {
    const r = await fetch("/api/sessions").then((x) => x.json());
    setSessions(r.sessions ?? []);
    return r.sessions as Session[];
  }, []);

  const [atBottom, setAtBottom] = useState(true);
  const nearBottom = () => {
    const el = scrollRef.current; if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- mount-time data load
  useEffect(() => { loadSessions().then((s) => { if (s?.length) selectSession(s[0].id); else newSession(); }); }, [loadSessions]);
  // auto-stick to bottom while streaming ONLY if the user is already at the bottom
  useEffect(() => { if (atBottom) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [msgs, atBottom]);
  const toBottom = () => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); setAtBottom(true); };
  // Escape closes the mobile drawer
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPanelOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function newSession(): Promise<string> {
    const { id } = await fetch("/api/sessions", { method: "POST" }).then((x) => x.json());
    await loadSessions(); setActive(id); setMsgs([]); setPanelOpen(false);
    return id;
  }
  async function selectSession(id: string) {
    setActive(id); setPanelOpen(false);
    const r = await fetch(`/api/sessions/${id}`).then((x) => x.json());
    const parsed: Msg[] = (r.messages ?? []).map((m: { role: string; content: string }) => parseStored(m.role, m.content));
    setMsgs(parsed);
    // hydrate cards for any present turns
    parsed.forEach((m, i) => {
      if (m.refs?.length) hydrateRefs(m.refs).then((notices) => setMsgs((cur) => {
        const copy = [...cur]; if (copy[i]) copy[i] = { ...copy[i], notices }; return copy;
      }));
    });
  }
  async function delSession(id: string) {
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    const s = await loadSessions();
    if (active === id) { if (s?.length) selectSession(s[0].id); else newSession(); }
  }

  // Fetch full notice rows for the model's refs, preserving order + attaching its why/tag.
  async function hydrateRefs(refs: Ref[]): Promise<Notice[]> {
    const ids = refs.map((r) => r.id).filter(Boolean);
    if (!ids.length) return [];
    const r = await fetch(`/api/notices?ids=${ids.join(",")}`).then((x) => x.json());
    const byId = new Map<number, Notice>((r.notices ?? []).map((n: Notice) => [n.id, n]));
    return refs.map((rf) => { const n = byId.get(rf.id); return n ? { ...n, why: rf.why, tag: rf.tag } : null; })
               .filter(Boolean) as Notice[];
  }

  async function send() {
    if (!input.trim() || !active || busy) return;
    const message = input.trim();
    setInput("");
    await runSend(message, active);
  }

  // One chat turn against an explicit session — callable by both the Send button and the AI-tab
  // query handoff (which targets a session id newer than the `active` state it just set).
  async function runSend(message: string, sessionId: string) {
    setBusy(true);
    setMsgs((m) => [...m, { role: "user", content: message }, { role: "assistant", content: "" }]);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message }), signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const msg = res.status === 402 ? "This chat has reached its usage limit. Start a new chat."
          : res.status === 429 ? "Too many requests — give it a moment and try again."
          : "Something went wrong. Please try again.";
        setMsgs((m) => upsertLast(m, msg)); return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "", acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const parts = buf.split("\n\n"); buf = parts.pop() ?? "";
        for (const p of parts) {
          if (!p.startsWith("data: ")) continue;
          const ev = JSON.parse(p.slice(6));
          if (ev.type === "delta") { acc += ev.text; setMsgs((m) => upsertLast(m, acc)); }
          else if (ev.type === "present") {
            const notices = await hydrateRefs(ev.present.refs);
            setMsgs((m) => upsertLast(m, [ev.present.intro, ev.present.note].filter(Boolean).join("\n\n"), notices, ev.present.refs));
          } else if (ev.type === "done") {
            if (!ev.present) { acc = ev.reply || acc; setMsgs((m) => upsertLast(m, acc)); }
          }
        }
      }
      loadSessions();
    } catch (e) {
      if (abortRef.current !== controller) return; // superseded by a handoff turn — don't touch its messages
      if ((e as Error).name === "AbortError") {
        setMsgs((m) => { // keep whatever streamed, append a stopped marker
          const c = [...m];
          for (let i = c.length - 1; i >= 0; i--) if (c[i].role === "assistant") {
            c[i] = { ...c[i], content: (c[i].content?.trim() ? c[i].content + "\n\n" : "") + "_(stopped)_" }; break;
          }
          return c;
        });
      } else {
        setMsgs((m) => upsertLast(m, "Connection lost. Please try again."));
      }
    } finally {
      // an aborted turn may resolve after its successor started — only the live turn clears busy
      if (abortRef.current === controller) { setBusy(false); abortRef.current = null; }
    }
  }

  return (
    <div className="flex h-full bg-background text-foreground">
      {/* backdrop for the mobile drawer */}
      {panelOpen && (
        <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setPanelOpen(false)} aria-hidden />
      )}

      {/* session panel — hidden on mobile until opened; always a static column on md+ */}
      <aside
        className={`w-60 shrink-0 flex-col border-r border-border bg-background md:static md:z-auto md:flex
          ${panelOpen ? "fixed inset-y-0 left-0 z-30 flex" : "hidden"}`}>
        <div className="flex items-center gap-2 p-3">
          <Button onClick={newSession} className="w-full" variant="secondary" data-testid="new-session">+ New chat</Button>
          {panelOpen && (
            <button onClick={() => setPanelOpen(false)} aria-label="close menu"
              className="grid size-9 shrink-0 place-items-center rounded-md text-lg leading-none text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden">×</button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          {sessions.map((s) => (
            <div key={s.id}
              className={`group flex items-center gap-1 rounded-md px-2 py-2 text-sm ${active === s.id ? "bg-muted" : "hover:bg-muted/50"}`}>
              <button onClick={() => selectSession(s.id)} className="flex-1 truncate py-1 text-left focus-visible:outline-none focus-visible:underline" data-testid="session-item">{s.title}</button>
              <button onClick={() => delSession(s.id)} aria-label={`delete chat: ${s.title}`}
                className="grid size-8 shrink-0 place-items-center rounded-md text-base text-muted-foreground opacity-70 hover:bg-background hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:opacity-0 md:group-hover:opacity-100"
                data-testid="delete-session">×</button>
            </div>
          ))}
        </div>
        <div className="border-t border-border p-3 text-[11px] text-muted-foreground">bidkita · PhilGEPS</div>
      </aside>

      {/* chat */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* mobile header with menu toggle */}
        <div className="flex items-center gap-2 border-b border-border p-3 md:hidden">
          <button onClick={() => setPanelOpen(true)} aria-label="open menu"
            className="grid size-11 -ml-2 place-items-center rounded-md text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid="open-menu">
            <span className="flex flex-col gap-1">
              <span className="block h-0.5 w-5 bg-current" /><span className="block h-0.5 w-5 bg-current" /><span className="block h-0.5 w-5 bg-current" />
            </span>
          </button>
          <span className="text-sm font-bold lowercase text-primary">bidkita</span>
        </div>
        <div ref={scrollRef} onScroll={() => setAtBottom(nearBottom())} className="relative flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-4 py-6" role="log" aria-live="polite" aria-busy={busy}>
            {msgs.length === 0 && (
              <div className="mt-24 text-center text-muted-foreground" data-testid="empty-state">
                <p className="text-lg font-medium text-foreground">Find government contracts worth bidding on</p>
                <p className="mt-2 text-sm">Tell me what your firm does, where, and your budget range.</p>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className="mb-5">
                {m.role === "user" ? (
                  <div className="prose-chat ml-auto w-fit max-w-[85%] rounded-2xl bg-muted px-4 py-2 text-sm">
                    <ReactMarkdown>{linkRefs(m.content)}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="prose-chat text-sm leading-relaxed" data-testid="assistant-text">
                      {m.content
                        ? <ReactMarkdown>{linkRefs(m.content)}</ReactMarkdown>
                        : (i === msgs.length - 1 && busy
                            ? <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />Searching notices…
                              </span>
                            : "")}
                    </div>
                    {m.notices && m.notices.length > 0 && (
                      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2
                        [scrollbar-width:thin]" data-testid="cards">
                        {m.notices.map((n) => (
                          <div key={n.id} className="w-72 shrink-0 snap-start"><TenderCard n={n} /></div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="relative border-t border-border p-3">
          {!atBottom && (
            <button onClick={toBottom} data-testid="jump-latest"
              className="absolute -top-11 left-1/2 -translate-x-1/2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground shadow-sm hover:text-foreground">
              ↓ Jump to latest
            </button>
          )}
          <div className="relative mx-auto max-w-2xl">
            {attached.length > 0 && (
              <div className="mb-1.5 flex flex-wrap gap-1.5" data-testid="attached-refs">
                {attached.map((a) => (
                  <span key={a.id} className="inline-flex max-w-full items-center gap-1.5 rounded border border-primary/40 bg-primary/5 px-2 py-0.5 text-xs">
                    <span className="font-mono text-primary tabular-nums">#{a.id}</span>
                    <span className="min-w-0 truncate text-muted-foreground" style={{ maxWidth: "16rem" }}>{a.title}</span>
                    <button type="button" aria-label={`remove #${a.id}`} onClick={() => removeRef(a.id)}
                      className="text-muted-foreground hover:text-foreground">×</button>
                  </span>
                ))}
              </div>
            )}
          <div className="relative flex items-end gap-2">
            {sug && (
              <ul data-testid="notice-suggest"
                className="absolute bottom-full left-0 z-20 mb-1 w-full overflow-hidden rounded-md border border-border bg-background shadow-md">
                {sug.map((s, i) => (
                  <li key={s.id}>
                    <button type="button" onMouseDown={(e) => { e.preventDefault(); pickSug(s); }}
                      className={`flex w-full items-baseline gap-2 px-3 py-1.5 text-left text-sm ${i === sugIdx ? "bg-muted" : ""}`}>
                      <span className="shrink-0 font-mono text-xs text-primary tabular-nums">#{s.id}</span>
                      <span className="min-w-0 flex-1 truncate">{s.title}</span>
                      {s.abc != null && <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                        {s.abc >= 1e6 ? `₱${(s.abc / 1e6).toFixed(1)}M` : `₱${Math.round(s.abc / 1e3)}K`}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <Textarea value={input} ref={taRef}
              onChange={(e) => { setInput(e.target.value); refreshSuggest(e.target.value, e.target.selectionStart ?? e.target.value.length); }}
              onBlur={() => setSug(null)}
              onKeyDown={(e) => {
                if (sug) {
                  if (e.key === "ArrowDown") { e.preventDefault(); setSugIdx((i) => (i + 1) % sug.length); return; }
                  if (e.key === "ArrowUp") { e.preventDefault(); setSugIdx((i) => (i - 1 + sug.length) % sug.length); return; }
                  if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); pickSug(sug[sugIdx]); return; }
                  if (e.key === "Escape") { setSug(null); return; }
                }
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              placeholder="e.g. small drainage jobs in Cavite — or ask about a notice with #id (#13141421)"
              aria-label="Message" rows={1}
              className="min-h-[44px] max-h-40 resize-none" data-testid="chat-input" />
            {busy
              ? <Button onClick={stop} variant="secondary" className="h-11 px-5" data-testid="stop">Stop</Button>
              : <Button onClick={send} disabled={!input.trim()} className="h-11 px-5" data-testid="send">Send</Button>}
          </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function upsertLast(m: Msg[], content: string, notices?: Notice[], refs?: Ref[]): Msg[] {
  const copy = [...m];
  for (let i = copy.length - 1; i >= 0; i--) {
    if (copy[i].role === "assistant") {
      copy[i] = { ...copy[i], content, ...(notices ? { notices } : {}), ...(refs ? { refs } : {}) };
      break;
    }
  }
  return copy;
}

"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TenderCard, type Notice } from "@/components/tender-card";

type Session = { id: string; title: string; updated_at: string };
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

export function Workspace() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false); // mobile drawer
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  function stop() { abortRef.current?.abort(); }

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

  async function newSession() {
    const { id } = await fetch("/api/sessions", { method: "POST" }).then((x) => x.json());
    await loadSessions(); setActive(id); setMsgs([]); setPanelOpen(false);
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
    setInput(""); setBusy(true);
    setMsgs((m) => [...m, { role: "user", content: message }, { role: "assistant", content: "" }]);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: active, message }), signal: controller.signal,
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
    } finally { setBusy(false); abortRef.current = null; }
  }

  return (
    <div className="flex h-dvh bg-background text-foreground">
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
              className="md:hidden shrink-0 text-lg leading-none text-muted-foreground hover:text-foreground px-1">×</button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto px-2">
          {sessions.map((s) => (
            <div key={s.id}
              className={`group flex items-center gap-1 rounded-md px-2 py-2 text-sm ${active === s.id ? "bg-muted" : "hover:bg-muted/50"}`}>
              <button onClick={() => selectSession(s.id)} className="flex-1 truncate text-left" data-testid="session-item">{s.title}</button>
              <button onClick={() => delSession(s.id)} aria-label="delete"
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground" data-testid="delete-session">×</button>
            </div>
          ))}
        </div>
        <div className="border-t border-border p-3 text-[11px] text-muted-foreground">RFP Finder · PhilGEPS</div>
      </aside>

      {/* chat */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* mobile header with menu toggle */}
        <div className="flex items-center gap-2 border-b border-border p-3 md:hidden">
          <button onClick={() => setPanelOpen(true)} aria-label="open menu"
            className="text-foreground" data-testid="open-menu">
            <span className="block h-0.5 w-5 bg-current" /><span className="mt-1 block h-0.5 w-5 bg-current" /><span className="mt-1 block h-0.5 w-5 bg-current" />
          </button>
          <span className="text-sm font-medium">RFP Finder</span>
        </div>
        <div ref={scrollRef} onScroll={() => setAtBottom(nearBottom())} className="relative flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl px-4 py-6">
            {msgs.length === 0 && (
              <div className="mt-24 text-center text-muted-foreground" data-testid="empty-state">
                <p className="text-lg font-medium text-foreground">Find government contracts worth bidding on</p>
                <p className="mt-2 text-sm">Tell me what your firm does, where, and your budget range.</p>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className="mb-5">
                {m.role === "user" ? (
                  <div className="ml-auto w-fit max-w-[85%] rounded-2xl bg-muted px-4 py-2 text-sm">{m.content}</div>
                ) : (
                  <div className="space-y-3">
                    <div className="prose-chat text-sm leading-relaxed" data-testid="assistant-text">
                      {m.content
                        ? <ReactMarkdown>{m.content}</ReactMarkdown>
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
          <div className="mx-auto flex max-w-2xl items-end gap-2">
            <Textarea value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="e.g. small drainage jobs in Cavite, PCAB C, under ₱5M"
              className="min-h-[44px] max-h-40 resize-none" data-testid="chat-input" />
            {busy
              ? <Button onClick={stop} variant="secondary" data-testid="stop">Stop</Button>
              : <Button onClick={send} disabled={!input.trim()} data-testid="send">Send</Button>}
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

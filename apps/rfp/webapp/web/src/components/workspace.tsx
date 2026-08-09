"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TenderCard, type Notice } from "@/components/tender-card";

type Session = { id: string; title: string; updated_at: string };
type Msg = { role: "user" | "assistant"; content: string; notices?: Notice[] };

const ID_RE = /\b(\d{5,9})\b/g;

export function Workspace() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadSessions = useCallback(async () => {
    const r = await fetch("/api/sessions").then((x) => x.json());
    setSessions(r.sessions ?? []);
    return r.sessions as Session[];
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps -- mount-time data load
  useEffect(() => { loadSessions().then((s) => { if (s?.length) selectSession(s[0].id); else newSession(); }); }, [loadSessions]);
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }); }, [msgs]);

  async function newSession() {
    const { id } = await fetch("/api/sessions", { method: "POST" }).then((x) => x.json());
    await loadSessions(); setActive(id); setMsgs([]);
  }
  async function selectSession(id: string) {
    setActive(id);
    const r = await fetch(`/api/sessions/${id}`).then((x) => x.json());
    setMsgs((r.messages ?? []).map((m: Msg) => ({ role: m.role, content: m.content })));
  }
  async function delSession(id: string) {
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    const s = await loadSessions();
    if (active === id) { if (s?.length) selectSession(s[0].id); else newSession(); }
  }

  async function hydrate(text: string): Promise<Notice[]> {
    const ids = [...new Set([...text.matchAll(ID_RE)].map((m) => m[1]))].slice(0, 12);
    if (!ids.length) return [];
    const r = await fetch(`/api/notices?ids=${ids.join(",")}`).then((x) => x.json());
    return r.notices ?? [];
  }

  async function send() {
    if (!input.trim() || !active || busy) return;
    const message = input.trim();
    setInput(""); setBusy(true);
    setMsgs((m) => [...m, { role: "user", content: message }, { role: "assistant", content: "" }]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: active, message }),
      });
      const reader = res.body!.getReader();
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
          if (ev.type === "done") {
            acc = ev.reply || acc;
            const notices = await hydrate(acc);
            setMsgs((m) => upsertLast(m, acc, notices));
          }
        }
      }
      loadSessions();
    } catch { setMsgs((m) => upsertLast(m, "Something went wrong. Try again.")); }
    finally { setBusy(false); }
  }

  return (
    <div className="flex h-dvh bg-background text-foreground">
      {/* session panel */}
      <aside className="flex w-60 shrink-0 flex-col border-r border-border">
        <div className="p-3">
          <Button onClick={newSession} className="w-full" variant="secondary" data-testid="new-session">+ New chat</Button>
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
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
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
                    <div className="whitespace-pre-wrap text-sm leading-relaxed" data-testid="assistant-text">{m.content || (busy ? "…" : "")}</div>
                    {m.notices && m.notices.length > 0 && (
                      <div className="grid gap-2" data-testid="cards">
                        {m.notices.map((n) => <TenderCard key={n.id} n={n} />)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-border p-3">
          <div className="mx-auto flex max-w-2xl items-end gap-2">
            <Textarea value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="e.g. small drainage jobs in Cavite, PCAB C, under ₱5M"
              className="min-h-[44px] max-h-40 resize-none" data-testid="chat-input" />
            <Button onClick={send} disabled={busy || !input.trim()} data-testid="send">Send</Button>
          </div>
        </div>
      </main>
    </div>
  );
}

function upsertLast(m: Msg[], content: string, notices?: Notice[]): Msg[] {
  const copy = [...m];
  for (let i = copy.length - 1; i >= 0; i--) {
    if (copy[i].role === "assistant") { copy[i] = { ...copy[i], content, ...(notices ? { notices } : {}) }; break; }
  }
  return copy;
}

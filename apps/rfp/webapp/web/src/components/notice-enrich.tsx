"use client";
// Enrich section — GET the cached result on mount; otherwise one prominent button that POSTs
// the pipeline (2–3 min worst case) with an elapsed-time-staged progress line. T1 owns the
// route + pipeline; a GET 404 is simply "not yet enriched".
import { useEffect, useRef, useState } from "react";
import type { Enrich } from "@/lib/enrich-types";
import { Button } from "@/components/ui/button";

type Phase =
  | { kind: "checking" }
  | { kind: "idle" }
  | { kind: "running"; startedAt: number }
  | { kind: "done"; enrich: Enrich }
  | { kind: "error"; message: string };

const STAGES: [number, string][] = [ // [starts at s, label]
  [0, "Fetching documents from PhilGEPS…"],
  [25, "Reading the attachments…"],
  [70, "Extracting deliverables and requirements…"],
  [150, "Still working — large or scanned documents take longer…"],
];

export function NoticeEnrich({ id }: { id: number }) {
  const [phase, setPhase] = useState<Phase>({ kind: "checking" });
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/notice/${id}/enrich`)
      .then(async (r) => {
        if (!alive) return;
        if (r.ok) setPhase({ kind: "done", enrich: (await r.json()).enrich as Enrich });
        else setPhase({ kind: "idle" }); // 404 = not yet enriched; any failure → offer the button
      })
      .catch(() => { if (alive) setPhase({ kind: "idle" }); });
    return () => { alive = false; };
  }, [id]);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  async function run() {
    const startedAt = Date.now();
    setPhase({ kind: "running", startedAt });
    setElapsed(0);
    timer.current = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    const ctrl = new AbortController();
    const kill = setTimeout(() => ctrl.abort(), 300_000); // pipeline worst case ~2-3 min
    try {
      const r = await fetch(`/api/notice/${id}/enrich`, { method: "POST", signal: ctrl.signal });
      if (!r.ok) throw new Error(r.status === 429 ? "Rate limited — try again in a minute." : `Enrich failed (${r.status}).`);
      setPhase({ kind: "done", enrich: (await r.json()).enrich as Enrich });
    } catch (e) {
      setPhase({
        kind: "error",
        message: (e as Error).name === "AbortError"
          ? "Timed out after 5 minutes — the documents may be very large. Try again."
          : (e as Error).message || "Enrich failed — PhilGEPS may be slow. Try again.",
      });
    } finally {
      clearTimeout(kill);
      if (timer.current) clearInterval(timer.current);
    }
  }

  return (
    <section aria-label="Enriched bid intelligence" data-testid="enrich-section">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">From the bid documents</h2>
      <div className="mt-3">
        {phase.kind === "checking" && (
          <p className="animate-pulse font-mono text-xs text-muted-foreground">checking for enriched data…</p>
        )}
        {phase.kind === "idle" && (
          <div className="rounded-lg border border-primary/40 bg-primary/5 p-4">
            <p className="text-sm text-foreground/80">
              Pull the supporting documents and extract the deliverables, qualification checklist,
              key dates and red flags — grounded in the actual bid documents.
            </p>
            <Button onClick={run} data-testid="enrich-btn"
              className="mt-3 h-11 w-full bg-primary px-6 text-primary-foreground hover:bg-primary/90 sm:w-auto">
              Enrich this notice — read the bid documents
            </Button>
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">takes 2–3 minutes · cached for everyone after the first run</p>
          </div>
        )}
        {phase.kind === "running" && (
          <div className="rounded-lg border border-border p-4" data-testid="enrich-progress" aria-live="polite">
            <p className="animate-pulse text-sm font-medium text-primary">
              {STAGES.filter(([at]) => elapsed >= at).at(-1)?.[1]}
            </p>
            <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
              {String(Math.floor(elapsed / 60))}:{String(elapsed % 60).padStart(2, "0")} elapsed — usually done in 2–3 minutes
            </p>
          </div>
        )}
        {phase.kind === "error" && (
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm text-foreground/80">{phase.message}</p>
            <Button variant="outline" onClick={run} className="mt-3 h-11 px-5">Retry enrich</Button>
          </div>
        )}
        {phase.kind === "done" && <EnrichPanels e={phase.enrich} />}
      </div>
    </section>
  );
}

function EnrichPanels({ e }: { e: Enrich }) {
  const docQuals = e.qualifications.filter((q) => q.kind === "document");
  const statQuals = e.qualifications.filter((q) => q.kind === "statutory");
  return (
    <div className="space-y-5" data-testid="enrich-panels">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded border border-border px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
          enriched {e.at.slice(0, 10)}
        </span>
        {e.source_kind === "notice-text" && (
          <span className="rounded border border-primary/50 bg-primary/5 px-2 py-0.5 text-[11px] font-medium text-primary">
            From the notice text — attachments are login-gated on legacy PhilGEPS
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed text-foreground/90">{e.summary}</p>

      {e.red_flags.length > 0 && (
        <div className="flex flex-wrap gap-1.5" data-testid="enrich-redflags">
          {e.red_flags.map((f, i) => (
            <span key={i} className="rounded border border-primary/60 px-2 py-0.5 text-xs font-medium text-primary">⚑ {f}</span>
          ))}
        </div>
      )}

      {e.deliverables.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Deliverables</h3>
          <div className="mt-2 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[28rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-[11px] uppercase text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Item</th>
                  <th className="px-3 py-2 text-right font-medium">Qty</th>
                  <th className="px-3 py-2 font-medium">Unit</th>
                  <th className="px-3 py-2 font-medium">Source</th>
                </tr>
              </thead>
              <tbody>
                {e.deliverables.map((d, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="px-3 py-2">
                      {d.item}
                      {d.detail && <span className="block text-xs text-muted-foreground">{d.detail}</span>}
                    </td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">{d.qty ?? ""}</td>
                    <td className="px-3 py-2 font-mono text-xs">{d.unit ?? ""}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{d.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {docQuals.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Qualifications — found in the documents</h3>
          <ul className="mt-2 space-y-3">
            {docQuals.map((q, i) => (
              <li key={i} className="text-sm">
                <p className="font-medium">{q.requirement}</p>
                {q.quote && (
                  <blockquote className="mt-1 border-l-2 border-border pl-3 text-xs leading-relaxed text-muted-foreground">
                    “{q.quote}”
                  </blockquote>
                )}
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{q.source}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {statQuals.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Qualifications — statutory</h3>
          <ul className="mt-2 space-y-1.5">
            {statQuals.map((q, i) => (
              <li key={i} className="flex flex-col gap-0.5 text-sm sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                <span>{q.requirement}</span>
                <span className="shrink-0 font-mono text-[11px] text-muted-foreground">{q.source}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {e.key_dates.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Key dates</h3>
          <dl className="mt-2 space-y-1 text-sm">
            {e.key_dates.map((d, i) => (
              <div key={i} className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                <dt className="text-muted-foreground">{d.label}</dt>
                <dd className="font-mono tabular-nums sm:text-right">{d.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {e.bid_security && (
        <p className="text-sm"><span className="font-semibold">Bid security:</span> {e.bid_security}</p>
      )}

      {e.docs.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Documents read</h3>
          <ul className="mt-2 space-y-1">
            {e.docs.map((d, i) => (
              <li key={i} className="flex items-baseline justify-between gap-3 font-mono text-xs">
                <span className="min-w-0 truncate">{d.name}{d.pages != null ? ` · ${d.pages}p` : ""}</span>
                <span className={`shrink-0 rounded border px-1.5 py-0.5 text-[11px] ${
                  d.status === "extracted" || d.status === "ocr"
                    ? "border-border text-muted-foreground" : "border-primary/50 text-primary"}`}>
                  {d.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import { NextResponse } from "next/server";
import { allow } from "@/lib/ratelimit";
import { EnrichError, getCached, runEnrich } from "@/lib/enrich";
import type { Enrich } from "@/lib/enrich-types";

export const runtime = "nodejs";
export const maxDuration = 300; // fetch (≤180s) + OCR + one Luna pass

// Per-notice in-flight lock: concurrent POSTs coalesce to one pipeline run.
const inflight = new Map<number, Promise<Enrich>>();

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const cached = Number.isInteger(id) && id > 0 ? getCached(id) : null;
  if (!cached) return NextResponse.json({ error: "not enriched yet" }, { status: 404 });
  return NextResponse.json({ enrich: cached });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id) || id <= 0) return NextResponse.json({ error: "invalid id" }, { status: 400 });

  let force = false;
  try { force = Boolean(((await req.json()) as { force?: unknown })?.force); } catch { /* empty body ok */ }

  const cached = getCached(id);
  if (cached && !force) return NextResponse.json({ enrich: cached });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!allow(ip)) return NextResponse.json({ error: "rate limited" }, { status: 429 });

  try {
    let run = inflight.get(id);
    if (!run) {
      run = runEnrich(id).finally(() => inflight.delete(id));
      inflight.set(id, run);
    }
    const enrich = await run;
    console.log(`enrich id=${id} usd=${enrich.usd.toFixed(4)} source=${enrich.source_kind} docs=${enrich.docs.length} quals=${enrich.qualifications.length}`);
    return NextResponse.json({ enrich });
  } catch (err) {
    if (err instanceof EnrichError)
      return NextResponse.json({ error: err.message }, { status: err.status });
    console.error(`enrich ${id} failed:`, (err as Error).message);
    return NextResponse.json({ error: "enrich failed, please try again" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { allow } from "@/lib/ratelimit";
import { planQuery, executePlan, sanitizePlan, provinces } from "@/lib/search";
import type { SearchPlan, SearchRequest } from "@/lib/search-types";

export const runtime = "nodejs";
export const maxDuration = 30;

// Facet for the filter UI: the 90 normalized provinces. Cached server-side, cheap.
export async function GET() {
  try { return NextResponse.json({ provinces: await provinces() }); }
  catch { return NextResponse.json({ provinces: [] }); }
}

// {q} → plan (one Luna call) + execute · {plan,offset} → execute only · {}/{q:""} → board, ₱0.
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!allow(ip)) return NextResponse.json({ error: "rate limited" }, { status: 429 });

  let body: SearchRequest;
  try { body = (await req.json()) as SearchRequest; } catch { return NextResponse.json({ error: "invalid JSON body" }, { status: 400 }); }
  if (typeof body !== "object" || body === null || Array.isArray(body)) return NextResponse.json({ error: "body must be an object" }, { status: 400 });
  const offset = body.offset, limit = body.limit;
  if (offset !== undefined && (typeof offset !== "number" || !Number.isFinite(offset) || offset < 0))
    return NextResponse.json({ error: "offset must be a non-negative number" }, { status: 400 });
  if (limit !== undefined && (typeof limit !== "number" || !Number.isFinite(limit) || limit < 1))
    return NextResponse.json({ error: "limit must be a positive number" }, { status: 400 });

  try {
    let plan: SearchPlan;
    let usd = 0;
    if (body.plan !== undefined) {
      const raw = body.plan as unknown;
      if (typeof raw !== "object" || raw === null || !Array.isArray((raw as { terms?: unknown }).terms))
        return NextResponse.json({ error: "plan must be an object with a terms array" }, { status: 400 });
      plan = sanitizePlan(raw);
    } else if (typeof body.q === "string" && body.q.trim()) {
      ({ plan, usd } = await planQuery(body.q));
    } else {
      plan = { kind: "board", terms: [], note: "Open opportunities" }; // empty q → board, no Luna call
    }
    const res = await executePlan(plan, offset, limit);
    console.log(`search usd=${usd.toFixed(4)} offset=${res.offset} n=${res.results.length} plan=${JSON.stringify(res.plan)}`);
    return NextResponse.json(res);
  } catch (err) {
    console.error("search failed:", (err as Error).message);
    return NextResponse.json({ error: "search failed, please try again" }, { status: 500 });
  }
}

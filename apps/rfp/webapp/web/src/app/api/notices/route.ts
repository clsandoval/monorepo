import { NextResponse } from "next/server";
import { readSql } from "@/lib/corpus";

export const runtime = "nodejs";

// Hydrate tender cards from ids. The model cites ids; the UI renders truth from the DB.
export async function GET(req: Request) {
  const ids = (new URL(req.url).searchParams.get("ids") ?? "")
    .split(",").map((s) => parseInt(s, 10)).filter((n) => Number.isFinite(n)).slice(0, 30);
  if (!ids.length) return NextResponse.json({ notices: [] });
  const list = ids.join(",");
  const rows = await readSql(
    `SELECT c.id, c.source, c.title, c.agency, c.location, c.abc, c.abc_lot_min, c.abc_lot_max,
            c.mode_norm, c.closing_day, c.closing_at,
            (SELECT t.work_type FROM tags.tags t WHERE t.id = c.id) AS work_type,
            (SELECT t.needs_pcab FROM tags.tags t WHERE t.id = c.id) AS needs_pcab
     FROM corpus c WHERE c.id IN (${list})`, 30);
  // preserve caller id order
  const byId = new Map(rows.map((r) => [Number(r.id), r]));
  return NextResponse.json({ notices: ids.map((i) => byId.get(i)).filter(Boolean) });
}

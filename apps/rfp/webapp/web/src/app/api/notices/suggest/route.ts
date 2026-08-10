import { NextResponse } from "next/server";
import { readSql } from "@/lib/corpus";

export const runtime = "nodejs";

// Autocomplete for "#" notice references in AI Mode (Claude-Code-@-files style).
// Digits → id prefix match; words → title/agency substring, open notices first.
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 60);
  const now = new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 19); // Manila
  const open = `c.status='Active' AND (c.closing_at IS NULL OR c.closing_at >= '${now}')`;
  const sel = "SELECT c.id, c.title, c.agency, c.abc FROM corpus c";
  let rows;
  if (/^\d+$/.test(q)) {
    rows = await readSql(`${sel} WHERE ${open} AND CAST(c.id AS TEXT) LIKE '${q}%' ORDER BY c.closing_at LIMIT 8`, 8);
  } else if (q.length >= 2) {
    const esc = q.replace(/'/g, "''");
    rows = await readSql(
      `${sel} WHERE ${open} AND (c.title LIKE '%${esc}%' OR c.agency LIKE '%${esc}%') ORDER BY c.closing_at LIMIT 8`, 8);
  } else {
    rows = await readSql(`${sel} WHERE ${open} ORDER BY c.closing_at LIMIT 8`, 8);
  }
  return NextResponse.json({ suggestions: rows.map((r) => ({
    id: Number(r.id), title: String(r.title ?? ""), agency: String(r.agency ?? ""),
    abc: r.abc == null ? null : Number(r.abc),
  })) });
}

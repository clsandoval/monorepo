import { NextResponse } from "next/server";
import { getOwner } from "@/lib/owner";
import { createSession, listSessions } from "@/lib/sessions";

export const runtime = "nodejs";

export async function GET() {
  const owner = await getOwner();
  return NextResponse.json({ sessions: listSessions(owner) });
}

export async function POST() {
  const owner = await getOwner();
  const id = createSession(owner);
  return NextResponse.json({ id });
}

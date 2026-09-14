import { NextResponse } from "next/server";
import { getOwner } from "@/lib/owner";
import { getMessages, deleteSession } from "@/lib/sessions";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owner = await getOwner();
  const messages = getMessages(id, owner);
  if (messages === null) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ messages });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const owner = await getOwner();
  return NextResponse.json({ ok: deleteSession(id, owner) });
}

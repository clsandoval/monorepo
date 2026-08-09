import { NextResponse } from "next/server";
import { getOwner } from "@/lib/owner";
import { allow } from "@/lib/ratelimit";
import { getMessages, addMessage, withinBudget } from "@/lib/sessions";

export const runtime = "nodejs";

// W1 stub: validates session/owner/rate-limit/budget and echoes. W2 replaces the body with the
// real pi + Luna Agent loop streamed as SSE.
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!allow(ip)) return NextResponse.json({ error: "rate limited" }, { status: 429 });

  const owner = await getOwner();
  const { sessionId, message } = (await req.json()) as { sessionId?: string; message?: string };
  if (!sessionId || !message) return NextResponse.json({ error: "sessionId and message required" }, { status: 400 });
  if (getMessages(sessionId, owner) === null) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!withinBudget(sessionId)) return NextResponse.json({ error: "session token budget reached" }, { status: 402 });

  addMessage(sessionId, "user", message);
  const reply = "[stub] loop wired in W2";
  addMessage(sessionId, "assistant", reply);
  return NextResponse.json({ reply });
}

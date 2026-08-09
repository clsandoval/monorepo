import { NextResponse } from "next/server";
import { getOwner } from "@/lib/owner";
import { allow } from "@/lib/ratelimit";
import { getMessages, addMessage, addTokens, withinBudget } from "@/lib/sessions";
import { runTurn, type ChatEvent } from "@/lib/agent";

export const runtime = "nodejs";
export const maxDuration = 120;

// Streams the pi + Luna Agent loop as SSE: {type:"delta"|"tool"|"done"} lines.
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (!allow(ip)) return NextResponse.json({ error: "rate limited" }, { status: 429 });

  const owner = await getOwner();
  const { sessionId, message, profile } = (await req.json()) as { sessionId?: string; message?: string; profile?: string };
  if (!sessionId || !message) return NextResponse.json({ error: "sessionId and message required" }, { status: 400 });
  const history = getMessages(sessionId, owner) as { role: string; content: string }[] | null;
  if (history === null) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!withinBudget(sessionId, owner)) return NextResponse.json({ error: "session token budget reached" }, { status: 402 });

  addMessage(sessionId, owner, "user", message);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: ChatEvent) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
      try {
        const { reply, usage } = await runTurn(history, profile ?? null, message, sessionId, send);
        addMessage(sessionId, owner, "assistant", reply);
        addTokens(sessionId, owner, usage.input + usage.cached + usage.output);
      } catch (err) {
        send({ type: "done", reply: `error: ${(err as Error).message}`, usage: { input: 0, cached: 0, output: 0, usd: 0 } });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}

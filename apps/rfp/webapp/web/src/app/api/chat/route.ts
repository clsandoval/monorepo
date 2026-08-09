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
  const stored = getMessages(sessionId, owner) as { role: string; content: string }[] | null;
  if (stored === null) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!withinBudget(sessionId, owner)) return NextResponse.json({ error: "session token budget reached" }, { status: 402 });

  // Seed the model with PLAIN TEXT: convert any stored present-JSON assistant turns to a short
  // textual summary so the model has context without the render JSON leaking into the prompt.
  const history = stored.map((m) => {
    if (m.role === "assistant" && m.content.startsWith("{\"__present\"")) {
      try {
        const p = JSON.parse(m.content) as { intro?: string; note?: string; refs?: { id: number }[] };
        const ids = (p.refs ?? []).map((r) => r.id).join(", ");
        return { role: "assistant", content: [p.intro, p.note, ids && `(shown notices: ${ids})`].filter(Boolean).join(" ") };
      } catch { return m; }
    }
    return m;
  });

  addMessage(sessionId, owner, "user", message);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: ChatEvent) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
      try {
        const { reply, usage, present } = await runTurn(history, profile ?? null, message, sessionId, send);
        // Persist present turns as JSON so reload re-renders cards; plain replies as text.
        addMessage(sessionId, owner, "assistant",
          present ? JSON.stringify({ __present: 1, intro: present.intro, note: present.note, refs: present.refs }) : reply);
        addTokens(sessionId, owner, usage.input + usage.cached + usage.output);
      } catch (err) {
        send({ type: "done", reply: `Something went wrong on that request. Please try again.`, usage: { input: 0, cached: 0, output: 0, usd: 0 } });
        console.error("chat turn failed:", (err as Error).message);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}

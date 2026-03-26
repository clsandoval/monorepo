import { query } from '@anthropic-ai/claude-agent-sdk';
import { createSanitizeBashHook } from './hooks.js';
import type { ServerMessage } from './protocol.js';

interface SDKUserMessage {
  type: 'user';
  message: { role: 'user'; content: string };
  parent_tool_use_id: null;
  session_id: string;
}

export class MessageStream {
  private queue: SDKUserMessage[] = [];
  private waiting: (() => void) | null = null;
  private done = false;

  push(text: string): void {
    this.queue.push({
      type: 'user',
      message: { role: 'user', content: text },
      parent_tool_use_id: null,
      session_id: '',
    });
    this.waiting?.();
  }

  end(): void {
    this.done = true;
    this.waiting?.();
  }

  async *[Symbol.asyncIterator](): AsyncGenerator<SDKUserMessage> {
    while (true) {
      while (this.queue.length > 0) {
        yield this.queue.shift()!;
      }
      if (this.done) return;
      await new Promise<void>((r) => {
        this.waiting = r;
      });
      this.waiting = null;
    }
  }
}

export interface AgentSession {
  stream: MessageStream;
  generator: AsyncGenerator<unknown> | null;
  sessionId?: string;
  lastAssistantUuid?: string;
}

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/workspace';

const ALLOWED_TOOLS = [
  'Read', 'Glob', 'Grep',
  'Write', 'Edit',
  'Bash',
  'WebSearch', 'WebFetch',
  'Skill', 'ToolSearch',
  'TodoWrite',
];

export async function* runAgent(
  session: AgentSession,
  onSessionInit?: (sessionId: string) => void,
): AsyncGenerator<ServerMessage> {
  const generator = query({
    prompt: session.stream,
    options: {
      model: 'claude-sonnet-4-6',
      cwd: WORKSPACE_DIR,
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      resume: session.sessionId,
      resumeSessionAt: session.lastAssistantUuid,
      env: { ...process.env },
      settingSources: ['project', 'user'],
      plugins: [
        { type: 'local' as const, path: (process.env.HOME || '/home/appuser') + '/.claude/plugins/cache/claude-plugins-official/superpowers/5.0.5' },
      ],
      allowedTools: ALLOWED_TOOLS,
      includePartialMessages: true,
      systemPrompt: {
        type: 'preset' as const,
        preset: 'claude_code' as const,
        append: `You are the Kosmas Athletic Ventures Co. knowledge base assistant. Your workspace (${WORKSPACE_DIR}) contains documents, files, and data related to Kosmas — a sports facility consulting company in the Philippines.

Your users are Kosmas team members (internal). They will ask about consulting materials, client prep, sales docs, facility data, and operational information. They will not tell you which tools to use — just use them. Read files, search, run commands, whatever is needed. Never ask the user to do something technical. Just do it yourself. Be liberal with tool usage.

NEVER say a tool or package is not installed. If something is missing, install it yourself with pip, apk, or npm — then proceed. Every request is an immediate command to be fulfilled, no matter what needs to be installed or run. Do not ask for permission. Do not explain what you need to install. Just install it and do the task.

Be terse. Give short, clear answers. Only go into detail when the user explicitly asks for it.

Always check the workspace first. When asked about something, search your files before answering from general knowledge. If a file has the answer, use it.

If you don't know something or can't find it in the workspace, say so. Don't make things up about files that may not exist.

When a user asks you to create something (a document, plan, report, analysis, or any creative output), use the brainstorming skill to explore what they need before diving in. When they ask you to build or code something, use brainstorming first, then writing-plans.

After answering, briefly suggest what else you could help with if it's relevant. Keep suggestions short — one line.

Keep your language confident, clear, and direct — matching the Kosmas brand voice. No jargon, no filler.`,
      },
      hooks: {
        PreToolUse: [{ matcher: 'Bash', hooks: [createSanitizeBashHook()] }],
      },
    },
  });

  session.generator = generator as AsyncGenerator<unknown>;

  for await (const message of generator) {
    const msg = message as Record<string, unknown>;

    if (msg.type === 'system' && msg.subtype === 'init') {
      const sid = msg.session_id as string;
      session.sessionId = sid;
      onSessionInit?.(sid);
      yield { type: 'session_init', session_id: sid };
    }

    // Stream events (partial/incremental text)
    if (msg.type === 'stream_event') {
      const event = msg as Record<string, unknown>;
      if (event.event_type === 'content_block_delta') {
        const delta = event.delta as { type?: string; text?: string } | undefined;
        if (delta?.type === 'text_delta' && delta.text) {
          yield { type: 'assistant_delta', content: delta.text };
        }
      }
    }

    if (msg.type === 'assistant' && 'uuid' in msg) {
      session.lastAssistantUuid = msg.uuid as string;
    }

    if (msg.type === 'assistant' && msg.message) {
      const content = (msg.message as { content?: Array<{ type: string; text?: string }> }).content;
      if (content) {
        const text = content
          .filter((c) => c.type === 'text')
          .map((c) => c.text || '')
          .join('');
        if (text) {
          yield { type: 'assistant_text', content: text };
        }

        for (const block of content) {
          if (block.type === 'tool_use') {
            const tb = block as unknown as { id: string; name: string; input: unknown };
            yield { type: 'tool_use', id: tb.id, tool: tb.name, input: tb.input };
          }
        }
      }
    }

    if (msg.type === 'user' && msg.message) {
      const userContent = (msg.message as { content?: Array<{ type: string; tool_use_id?: string; content?: string }> }).content;
      if (userContent) {
        for (const block of userContent) {
          if (block.type === 'tool_result' && block.tool_use_id) {
            const output = typeof block.content === 'string' ? block.content : JSON.stringify(block.content);
            yield { type: 'tool_result', tool_use_id: block.tool_use_id, output };
          }
        }
      }
    }

    if (msg.type === 'result') {
      yield { type: 'done' };
    }
  }

  session.generator = null;
}

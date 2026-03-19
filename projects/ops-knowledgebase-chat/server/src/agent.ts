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
      cwd: WORKSPACE_DIR,
      permissionMode: 'bypassPermissions',
      allowDangerouslySkipPermissions: true,
      resume: session.sessionId,
      resumeSessionAt: session.lastAssistantUuid,
      env: { ...process.env },
      settingSources: ['project', 'user'],
      allowedTools: ALLOWED_TOOLS,
      systemPrompt: {
        type: 'preset' as const,
        preset: 'claude_code' as const,
        append: [
          'You are an ops knowledgebase assistant.',
          `Your working directory is ${WORKSPACE_DIR} which contains documents, PDFs, and files seeded by the user.`,
          'Use Read, Glob, and Grep to find and analyze documents. You have full Claude Code capabilities.',
        ].join(' '),
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

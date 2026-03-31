import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod/v4';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { SYSTEM_PROMPT, buildPrompt } from '@/lib/agent-prompt';
import type { InstanceConfig } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

const REPO_URL = 'https://github.com/pymc-labs/decision-orchestrator.git';
const WORKSPACE_DIR = '/tmp/daimon-workspace';

function ensureRepo(): void {
  if (!existsSync(WORKSPACE_DIR)) {
    execSync(`git clone --depth 1 ${REPO_URL} ${WORKSPACE_DIR}`, {
      stdio: 'pipe',
      timeout: 60_000,
    });
  }
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  const { messages, config } = body as {
    messages: Array<{ role: string; content: string }>;
    config: InstanceConfig;
  };

  const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
  if (!lastUserMessage) {
    return Response.json({ error: 'No user message found' }, { status: 400 });
  }

  // Clone repo if needed
  try {
    ensureRepo();
  } catch (err) {
    console.error('Failed to clone repo:', err);
    // Continue anyway — agent can still work without the repo
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: Record<string, unknown>) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      // Define render_ui tool — its handler writes directly to the SSE stream
      const renderTool = tool(
        'render_ui',
        'Render a React component in the user\'s config panel. The component will be transpiled and rendered live in the browser. The component must be named ConfigPanel and receives props: { config, onConfigChange }. Use inline styles only.',
        { jsx: z.string().describe('Complete React function component. Must be named ConfigPanel. Receives props: { config, onConfigChange }. Use inline styles only.') },
        async ({ jsx }) => {
          send('render', { jsx });
          return { content: [{ type: 'text' as const, text: 'Component rendered successfully.' }] };
        },
      );

      // Create MCP server with the render tool
      const uiServer = createSdkMcpServer({
        name: 'ui',
        tools: [renderTool],
      });

      try {
        const prompt = buildPrompt(lastUserMessage.content, config);

        const q = query({
          prompt,
          options: {
            cwd: WORKSPACE_DIR,
            tools: ['Read', 'Glob', 'Grep'],
            allowedTools: ['Read', 'Glob', 'Grep', 'mcp__ui__render_ui'],
            mcpServers: { ui: uiServer },
            systemPrompt: SYSTEM_PROMPT,
            maxTurns: 15,
            permissionMode: 'bypassPermissions',
            allowDangerouslySkipPermissions: true,
            persistSession: false,
          },
        });

        for await (const message of q) {
          if (message.type === 'assistant') {
            // Extract text content from the assistant message
            const textBlocks = message.message.content.filter(
              (block: { type: string }) => block.type === 'text',
            );
            for (const block of textBlocks) {
              if ('text' in block && block.text) {
                send('text', { content: block.text });
              }
            }
          } else if (message.type === 'result') {
            if ('result' in message && message.result) {
              send('text', { content: message.result });
            }
          }
        }
      } catch (err) {
        console.error('Agent SDK error:', err);
        send('text', {
          content: `Error: ${err instanceof Error ? err.message : 'Unknown error occurred'}`,
        });
      } finally {
        send('done', {});
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}

// Must clear before SDK import — SDK checks for nested Claude Code execution
delete process.env.CLAUDECODE;
delete process.env.CLAUDE_CODE_ENTRYPOINT;

import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod/v4';
import { SYSTEM_PROMPT, buildPrompt } from '@/lib/agent-prompt';
import type { DeploymentBrief } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

// Use the local submodule instead of cloning
const WORKSPACE_DIR = '/home/clsandoval/cs/monorepo/projects/decision-orchestrator';

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();
  const { messages, brief } = body as {
    messages: Array<{ role: string; content: string }>;
    brief: DeploymentBrief;
  };

  const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
  if (!lastUserMessage) {
    return Response.json({ error: 'No user message found' }, { status: 400 });
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
        'Render a React component in the user\'s deployment brief panel. The component will be transpiled and rendered live in the browser. The component must be named ConfigPanel and receives props: { brief, onBriefChange, onAnnotationAdd }. Use inline styles only.',
        { jsx: z.string().describe('Complete React function component. Must be named ConfigPanel. Receives props: { brief, onBriefChange, onAnnotationAdd }. Use inline styles only.') },
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
        const prompt = buildPrompt(lastUserMessage.content, brief);

        // Strip Claude Code env vars to avoid nested execution detection
        const cleanEnv = { ...process.env };
        delete cleanEnv.CLAUDECODE;
        delete cleanEnv.CLAUDE_CODE_ENTRYPOINT;

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
            env: cleanEnv,
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

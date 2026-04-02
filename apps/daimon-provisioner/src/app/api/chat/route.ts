// Must clear before SDK import — SDK checks for nested Claude Code execution
delete process.env.CLAUDECODE;
delete process.env.CLAUDE_CODE_ENTRYPOINT;

import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod/v4';
import { SYSTEM_PROMPT, buildPrompt } from '@/lib/agent-prompt';
import type { DeploymentBrief } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 300;

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

      // Track accumulated brief state across tool calls within a single turn
      let currentBrief = { ...brief };

      const askQuestionTool = tool(
        'ask_question',
        'Present a question to the user in the progressive brief UI. The question appears at the frontier (bottom edge) of the brief.',
        {
          section: z.string().describe('Section key: organization, discord_setup, integrations, journeys, credentials, or infrastructure'),
          text: z.string().describe('The question text to display'),
          options: z.array(z.object({
            key: z.string().describe('Option key badge: A, B, C, etc.'),
            label: z.string().describe('Option label text'),
            description: z.string().nullable().describe('Optional description below the label'),
          })).nullable().describe('Structured options, or null for free-text only'),
          multiselect: z.boolean().optional().describe('If true, user can select multiple options before submitting. Use for "select all that apply" questions.'),
        },
        async ({ section, text, options, multiselect }) => {
          send('question', {
            question: { id: crypto.randomUUID(), section, text, options, multiselect: multiselect ?? false },
          });
          return { content: [{ type: 'text' as const, text: 'Question presented to user.' }] };
        },
      );

      const lockSectionTool = tool(
        'lock_section',
        'Finalize a section of the deployment brief. The section locks at the top of the brief and cannot be edited. Call this when you have enough information from the user to complete the section.',
        {
          section: z.string().describe('Section key to lock: organization, discord_setup, integrations, journeys, credentials, or infrastructure'),
          content: z.any().describe('The structured data for this section, matching the DeploymentBrief type field'),
          brief_updates: z.record(z.string(), z.any()).optional().describe('Additional brief fields to update (e.g. title, summary)'),
        },
        async ({ section, content, brief_updates }) => {
          send('section_lock', { section, content });
          // Always update accumulated brief state and send a brief event for persistence
          currentBrief = {
            ...currentBrief,
            [section]: content,
            ...brief_updates,
            locked_sections: [...new Set([...currentBrief.locked_sections, section])],
          };
          send('brief', { brief: currentBrief });
          return { content: [{ type: 'text' as const, text: `Section "${section}" locked.` }] };
        },
      );

      const uiServer = createSdkMcpServer({
        name: 'ui',
        tools: [askQuestionTool, lockSectionTool],
      });

      try {
        const prompt = buildPrompt(lastUserMessage.content, brief);

        const cleanEnv = { ...process.env };
        delete cleanEnv.CLAUDECODE;
        delete cleanEnv.CLAUDE_CODE_ENTRYPOINT;

        const q = query({
          prompt,
          options: {
            cwd: WORKSPACE_DIR,
            tools: ['Read', 'Glob', 'Grep'],
            allowedTools: ['Read', 'Glob', 'Grep', 'mcp__ui__ask_question', 'mcp__ui__lock_section'],
            mcpServers: { ui: uiServer },
            systemPrompt: SYSTEM_PROMPT,
            maxTurns: 15,
            permissionMode: 'bypassPermissions',
            allowDangerouslySkipPermissions: true,
            env: cleanEnv,
          },
        });

        for await (const message of q) {
          // We don't render text events — all agent output goes through tools
        }
      } catch (err) {
        console.error('Agent SDK error:', err);
        send('question', {
          question: {
            id: crypto.randomUUID(),
            section: 'organization',
            text: `Something went wrong: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`,
            options: null,
          },
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

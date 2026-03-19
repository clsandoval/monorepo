export type ClientMessage =
  | { type: 'user_message'; content: string }
  | { type: 'interrupt' }
  | { type: 'new_session' };

export type ServerMessage =
  | { type: 'assistant_text'; content: string }
  | { type: 'tool_use'; id: string; tool: string; input: unknown }
  | { type: 'tool_result'; tool_use_id: string; output: string }
  | { type: 'session_init'; session_id: string }
  | { type: 'done' }
  | { type: 'error'; message: string };

export type ChatMessage =
  | { id: string; role: 'user'; content: string }
  | { id: string; role: 'assistant'; content: string; toolUses: ToolUseEntry[] }
  | { id: string; role: 'error'; content: string };

export interface ToolUseEntry {
  id: string;
  tool: string;
  input: unknown;
  output?: string;
}

export type ClientMessage =
  | { type: 'user_message'; content: string }
  | { type: 'interrupt' }
  | { type: 'new_session' }
  | { type: 'load_session'; session_id: string };

export type ServerMessage =
  | { type: 'assistant_text'; content: string }
  | { type: 'tool_use'; id: string; tool: string; input: unknown }
  | { type: 'tool_result'; tool_use_id: string; output: string }
  | { type: 'session_init'; session_id: string }
  | { type: 'session_title'; title: string }
  | { type: 'session_loaded'; session: SessionData }
  | { type: 'done' }
  | { type: 'error'; message: string };

export interface FileTreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileTreeNode[];
  size?: number;
  truncated?: boolean;
}

export interface SessionData {
  id: string;
  title: string;
  createdAt: string;
  sessionId?: string;
  lastAssistantUuid?: string;
  messages: SessionMessage[];
}

export interface SessionMessage {
  role: 'user' | 'assistant' | 'error';
  content: string;
  toolUses?: Array<{ id: string; tool: string; input: unknown; output?: string }>;
  timestamp: string;
}

export interface SessionSummary {
  id: string;
  title: string;
  createdAt: string;
}

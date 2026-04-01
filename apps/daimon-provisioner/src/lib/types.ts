export interface DeploymentBrief {
  id: string;
  title: string;
  summary: string;
  status: 'brainstorming' | 'ready' | 'deploying' | 'deployed';

  integrations: Integration[];
  journeys: Journey[];
  credentials: Credential[];
  notes: string[];

  annotations: Annotation[];
  chat_messages: ChatMessage[];
  current_jsx: string | null;
  created_at: string;
  updated_at: string;
}

export interface Integration {
  platform: string;
  purpose: string;
  tools: string[];
  env_vars: string[];
}

export interface Journey {
  title: string;
  description: string;
  steps: JourneyStep[];
}

export interface JourneyStep {
  action: string;
  tool: string | null;
  platform: string | null;
}

export interface Credential {
  env_var: string;
  platform: string;
  status: 'needed' | 'have' | 'unknown';
  note: string | null;
}

export interface Annotation {
  id: string;
  section: string;
  text: string;
  resolved: boolean;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

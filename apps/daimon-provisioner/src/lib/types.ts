export interface InstanceConfig {
  id: string;
  client: {
    name: string;
    description: string;
  };
  integrations: string[];
  system_packages: string[];
  prompt_variant: 'interactive' | 'scheduled' | 'routed' | 'custom';
  custom_prompt: string | null;
  features: {
    discord_archive: boolean;
    langfuse_tracing: boolean;
    bluedot_webhooks: boolean;
    ssr_panels: boolean;
  };
  frontends: {
    discord: boolean;
    slack: boolean;
    teams: boolean;
  };
  workflows: Workflow[];
  alerts: Alert[];
  status: 'running' | 'deploying' | 'stopped' | 'draft';
  chat_messages: ChatMessage[];
  current_jsx: string | null;
  created_at: string;
  updated_at: string;
}

export interface Workflow {
  title: string;
  steps: WorkflowStep[];
}

export interface WorkflowStep {
  text: string;
  tool?: string; // if this step uses a specific integration
}

export interface Alert {
  integration: string;
  message: string;
  detail: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

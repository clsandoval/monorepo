export interface DeploymentBrief {
  id: string;
  title: string;
  summary: string;
  status: 'brainstorming' | 'ready' | 'deploying' | 'deployed';

  // Section data
  organization: OrganizationSection | null;
  discord_setup: DiscordSetupSection | null;
  integrations: Integration[];
  journeys: Journey[];
  credentials: Credential[];
  infrastructure: InfrastructureSection | null;
  notes: string[];

  // Interaction state
  pending_question: PendingQuestion | null;
  locked_sections: string[];

  annotations: Annotation[];
  current_jsx: string | null; // deprecated — ignored by ProgressiveBrief, kept so existing DB rows don't break
  chat_messages: ChatMessage[]; // deprecated — kept for DB compat
  created_at: string;
  updated_at: string;
}

export interface OrganizationSection {
  company_name: string;
  description: string;
  team_size: string | null;
  bot_purpose: string;
}

export interface DiscordSetupSection {
  guild_id: string;
  channels: string[];
  channel_mappings: Record<string, string>;
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

export interface InfrastructureSection {
  fly_region: string;
  supabase_project: string | null;
  langfuse_workspace: string | null;
  e2b_template: string | null;
}

export interface PendingQuestion {
  id: string;
  section: string;
  text: string;
  options: QuestionOption[] | null; // null = free-text only
}

export interface QuestionOption {
  key: string;   // "A", "B", "C"
  label: string;
  description: string | null;
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

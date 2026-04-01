import { supabase } from './supabase';
import { InstanceConfig } from './types';

export async function getInstances(): Promise<InstanceConfig[]> {
  const { data, error } = await supabase
    .from('instance_configs')
    .select('config')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(row => row.config as InstanceConfig);
}

export async function getInstance(id: string): Promise<InstanceConfig | null> {
  const { data, error } = await supabase
    .from('instance_configs')
    .select('config')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ? (data.config as InstanceConfig) : null;
}

export async function saveInstance(config: InstanceConfig): Promise<void> {
  const now = new Date().toISOString();
  const updated = { ...config, updated_at: now };

  const { error } = await supabase
    .from('instance_configs')
    .upsert({
      id: config.id,
      config: updated,
      updated_at: now,
    });

  if (error) throw error;
}

export async function deleteInstance(id: string): Promise<void> {
  const { error } = await supabase
    .from('instance_configs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export function createEmptyConfig(): InstanceConfig {
  return {
    id: crypto.randomUUID(),
    client: { name: '', description: '' },
    integrations: [],
    system_packages: [],
    prompt_variant: 'interactive',
    custom_prompt: null,
    features: {
      discord_archive: false,
      langfuse_tracing: false,
      bluedot_webhooks: false,
      ssr_panels: false,
    },
    frontends: { discord: true, slack: false, teams: false },
    workflows: [],
    alerts: [],
    status: 'draft',
    chat_messages: [],
    current_jsx: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

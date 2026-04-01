import { supabase } from './supabase';
import { DeploymentBrief } from './types';

export async function getBriefs(): Promise<DeploymentBrief[]> {
  const { data, error } = await supabase
    .from('instance_configs')
    .select('config')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(row => row.config as DeploymentBrief);
}

export async function getBrief(id: string): Promise<DeploymentBrief | null> {
  const { data, error } = await supabase
    .from('instance_configs')
    .select('config')
    .eq('id', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ? (data.config as DeploymentBrief) : null;
}

export async function saveBrief(brief: DeploymentBrief): Promise<void> {
  const now = new Date().toISOString();
  const updated = { ...brief, updated_at: now };

  const { error } = await supabase
    .from('instance_configs')
    .upsert({
      id: brief.id,
      config: updated,
      updated_at: now,
    });

  if (error) throw error;
}

export async function deleteBrief(id: string): Promise<void> {
  const { error } = await supabase
    .from('instance_configs')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export function createEmptyBrief(): DeploymentBrief {
  return {
    id: crypto.randomUUID(),
    title: '',
    summary: '',
    status: 'brainstorming',
    organization: null,
    discord_setup: null,
    integrations: [],
    journeys: [],
    credentials: [],
    infrastructure: null,
    notes: [],
    pending_question: null,
    locked_sections: [],
    annotations: [],
    chat_messages: [],
    current_jsx: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

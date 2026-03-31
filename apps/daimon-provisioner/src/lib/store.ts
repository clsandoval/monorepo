import { InstanceConfig } from './types';

const STORAGE_KEY = 'daimon-provisioner-instances';

export function getInstances(): InstanceConfig[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function getInstance(id: string): InstanceConfig | null {
  return getInstances().find(i => i.id === id) || null;
}

export function saveInstance(config: InstanceConfig): void {
  const instances = getInstances();
  const idx = instances.findIndex(i => i.id === config.id);
  if (idx >= 0) {
    instances[idx] = { ...config, updated_at: new Date().toISOString() };
  } else {
    instances.push(config);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(instances));
}

export function deleteInstance(id: string): void {
  const instances = getInstances().filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(instances));
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

'use client';

import { useState } from 'react';
import { InstanceConfig } from '@/lib/types';
import { getAlertsForIntegrations } from '@/lib/known-integrations';
import { TagInput } from './TagInput';
import { ToggleSwitch } from './ToggleSwitch';
import { RadioGroup } from './RadioGroup';
import { WorkflowSection } from './WorkflowSection';
import { AlertCard } from './AlertCard';

interface ConfigPanelProps {
  config: InstanceConfig;
  onChange: (config: InstanceConfig) => void;
  isNew?: boolean;
}

const PROMPT_OPTIONS = ['Interactive', 'Scheduled', 'Routed', 'Custom'];

const FEATURE_LABELS: { key: keyof InstanceConfig['features']; label: string }[] = [
  { key: 'discord_archive', label: 'Discord Archive' },
  { key: 'langfuse_tracing', label: 'Langfuse Tracing' },
  { key: 'bluedot_webhooks', label: 'Bluedot Webhooks' },
  { key: 'ssr_panels', label: 'SSR Panels' },
];

export function ConfigPanel({ config, onChange, isNew }: ConfigPanelProps) {
  const [showJson, setShowJson] = useState(false);

  function update(partial: Partial<InstanceConfig>) {
    onChange({ ...config, ...partial });
  }

  function updateClient(field: 'name' | 'description', value: string) {
    onChange({ ...config, client: { ...config.client, [field]: value } });
  }

  const alerts = getAlertsForIntegrations(config.integrations);

  const title = isNew ? 'New Instance' : config.client.name || 'New Instance';

  const promptValue = config.prompt_variant.charAt(0).toUpperCase() + config.prompt_variant.slice(1);

  return (
    <div className="config">
      {/* Header */}
      <div className="config-head">
        <div className="config-title">{title}</div>
        <div className="config-badge">Draft</div>
      </div>

      {/* Client */}
      <div className="section">
        <div className="section-label">Client</div>
        <div className="section-body">
          <div className="field-row">
            <div className="field-label">Name</div>
            <input
              className="field-input"
              value={config.client.name}
              onChange={e => updateClient('name', e.target.value)}
              placeholder="Client name"
            />
          </div>
          <div className="field-row">
            <div className="field-label">Description</div>
            <input
              className="field-input secondary"
              value={config.client.description}
              onChange={e => updateClient('description', e.target.value)}
              placeholder="What does this bot do?"
            />
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="section">
        <div className="section-label">
          Integrations
          <span className="section-count">{config.integrations.length}</span>
        </div>
        <div className="section-body">
          <TagInput
            tags={config.integrations}
            onChange={integrations => update({ integrations })}
            placeholder="Add integration..."
          />
          {alerts.map((alert, i) => (
            <AlertCard key={i} alert={alert} />
          ))}
          <WorkflowSection workflows={config.workflows} />
        </div>
      </div>

      {/* System Packages */}
      <div className="section">
        <div className="section-label">
          System Packages
          <span className="section-count">{config.system_packages.length}</span>
        </div>
        <div className="section-body">
          <TagInput
            tags={config.system_packages}
            onChange={system_packages => update({ system_packages })}
            placeholder="Add package..."
          />
        </div>
      </div>

      {/* Prompt Variant */}
      <div className="section">
        <div className="section-label">Prompt Variant</div>
        <div className="section-body">
          <RadioGroup
            options={PROMPT_OPTIONS}
            value={promptValue}
            onChange={val => {
              const variant = val.toLowerCase() as InstanceConfig['prompt_variant'];
              update({
                prompt_variant: variant,
                custom_prompt: variant === 'custom' ? (config.custom_prompt || '') : null,
              });
            }}
          />
          {config.prompt_variant === 'custom' && (
            <textarea
              className="custom-prompt-textarea"
              value={config.custom_prompt || ''}
              onChange={e => update({ custom_prompt: e.target.value })}
              placeholder="Enter your custom prompt..."
            />
          )}
        </div>
      </div>

      {/* Features */}
      <div className="section">
        <div className="section-label">Features</div>
        <div className="section-body">
          {FEATURE_LABELS.map(({ key, label }) => (
            <div key={key} className="toggle-row">
              <span className={`toggle-name${config.features[key] ? ' on' : ''}`}>{label}</span>
              <ToggleSwitch
                checked={config.features[key]}
                onChange={() => update({ features: { ...config.features, [key]: !config.features[key] } })}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Frontend Integrations */}
      <div className="section">
        <div className="section-label">Frontend Integrations</div>
        <div className="section-body">
          <div className="fe-row">
            <div className="fe-left">
              <div className="fe-icon discord">
                <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
                  <path d="M13.5 3.4A13 13 0 0 0 10.3 2.5a.05.05 0 0 0-.05.02c-.14.25-.3.58-.41.84a12 12 0 0 0-3.68 0A8 8 0 0 0 5.74 2.52a.05.05 0 0 0-.05-.02 13 13 0 0 0-3.2.9.05.05 0 0 0-.02.02C.88 6.1.35 8.7.61 11.27a.06.06 0 0 0 .02.04 13 13 0 0 0 4 2.02.05.05 0 0 0 .06-.02c.31-.42.58-.87.82-1.34a.05.05 0 0 0-.03-.07 8.6 8.6 0 0 1-1.25-.6.05.05 0 0 1 0-.09c.08-.06.17-.13.25-.2a.05.05 0 0 1 .05 0 9.3 9.3 0 0 0 8.02 0 .05.05 0 0 1 .05 0c.08.07.17.14.25.2a.05.05 0 0 1 0 .1 8 8 0 0 1-1.25.59.05.05 0 0 0-.03.07c.24.47.52.92.82 1.34a.05.05 0 0 0 .06.02 13 13 0 0 0 4-2.02.05.05 0 0 0 .03-.04c.3-3.15-.51-5.72-2.16-8.08a.04.04 0 0 0-.02-.01Z" />
                </svg>
              </div>
              <span className="fe-name active">Discord</span>
            </div>
            <ToggleSwitch
              checked={config.frontends.discord}
              onChange={checked => update({ frontends: { ...config.frontends, discord: checked } })}
            />
          </div>
          <div className="fe-row">
            <div className="fe-left">
              <div className="fe-icon slack">
                <svg viewBox="0 0 16 16" fill="currentColor" width="11" height="11">
                  <path d="M3.4 10a1.4 1.4 0 1 1-1.4-1.4h1.4V10zm.7 0a1.4 1.4 0 1 1 2.8 0v3.5a1.4 1.4 0 1 1-2.8 0V10zM6 3.4A1.4 1.4 0 1 1 7.4 2v1.4H6zm0 .7a1.4 1.4 0 1 1 0 2.8H2.5a1.4 1.4 0 1 1 0-2.8H6z" />
                </svg>
              </div>
              <span className="fe-name locked">Slack</span>
            </div>
            <div className="fe-locked">Locked</div>
          </div>
          <div className="fe-row">
            <div className="fe-left">
              <div className="fe-icon teams">
                <svg viewBox="0 0 16 16" fill="currentColor" width="11" height="11">
                  <path d="M11.3 4.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm2.2 1H10a.8.8 0 0 0-.8.8v3.5a2.6 2.6 0 0 0 2.2 2.6V7h1.3a.8.8 0 0 0 .8-.8v-.7zm-5-1.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                </svg>
              </div>
              <span className="fe-name locked">Teams</span>
            </div>
            <div className="fe-locked">Locked</div>
          </div>
        </div>
      </div>

      {/* Generate Config */}
      <div className="section">
        <button className="gen-btn" onClick={() => setShowJson(!showJson)} type="button">
          Generate Config
        </button>
        {showJson && (
          <pre style={{ marginTop: 12, fontSize: 12, lineHeight: 1.6, color: 'var(--ink-2)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: 'var(--bg)', border: '1px solid var(--rule)', borderRadius: 'var(--radius)', padding: 16 }}>
            {JSON.stringify(config, null, 2)}
          </pre>
        )}
      </div>

      {/* JSON Modal - kept for backward compat but gen-btn now toggles inline */}
    </div>
  );
}

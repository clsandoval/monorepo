'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { InstanceConfig } from '@/lib/types';
import { buildSystemPrompt, CHAT_TOOLS } from '@/lib/chat-system-prompt';
import { getAlertsForIntegrations } from '@/lib/known-integrations';

interface ChatPanelProps {
  config: InstanceConfig;
  onConfigChange: (config: InstanceConfig) => void;
}

interface DisplayMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  tags?: string[];
  alerts?: { integration: string; message: string }[];
  changes?: { type: 'add' | 'remove'; label: string }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string | AnthropicContentBlock[];
}

interface AnthropicContentBlock {
  type: 'text' | 'tool_use' | 'tool_result';
  text?: string;
  id?: string;
  name?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input?: any;
  tool_use_id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any;
}

const API_KEY = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

export function ChatPanel({ config, onConfigChange }: ChatPanelProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      role: 'system',
      content: "Tell me what this bot instance needs. I'll update the configuration as we go.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<AnthropicMessage[]>([]);
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  function applyToolCalls(
    toolBlocks: AnthropicContentBlock[],
    currentConfig: InstanceConfig
  ): { updatedConfig: InstanceConfig; changes: DisplayMessage['changes']; alerts: DisplayMessage['alerts']; tags: string[] } {
    let updated = { ...currentConfig };
    const changes: DisplayMessage['changes'] = [];
    const tags: string[] = [];
    const alertsList: DisplayMessage['alerts'] = [];

    for (const block of toolBlocks) {
      if (block.type !== 'tool_use' || !block.name) continue;
      const inp = block.input || {};

      switch (block.name) {
        case 'add_integration': {
          const name = inp.name as string;
          if (!updated.integrations.includes(name)) {
            updated = { ...updated, integrations: [...updated.integrations, name] };
            changes.push({ type: 'add', label: name });
            tags.push(name);
          }
          break;
        }
        case 'remove_integration': {
          const name = inp.name as string;
          updated = { ...updated, integrations: updated.integrations.filter((i: string) => i !== name) };
          changes.push({ type: 'remove', label: name });
          break;
        }
        case 'add_package': {
          const name = inp.name as string;
          if (!updated.system_packages.includes(name)) {
            updated = { ...updated, system_packages: [...updated.system_packages, name] };
            changes.push({ type: 'add', label: `pkg:${name}` });
            tags.push(name);
          }
          break;
        }
        case 'remove_package': {
          const name = inp.name as string;
          updated = { ...updated, system_packages: updated.system_packages.filter((p: string) => p !== name) };
          changes.push({ type: 'remove', label: `pkg:${name}` });
          break;
        }
        case 'set_feature': {
          const feature = inp.feature as keyof InstanceConfig['features'];
          const enabled = inp.enabled as boolean;
          updated = { ...updated, features: { ...updated.features, [feature]: enabled } };
          changes.push({ type: enabled ? 'add' : 'remove', label: `feature:${feature}` });
          break;
        }
        case 'set_prompt_variant': {
          const variant = inp.variant as InstanceConfig['prompt_variant'];
          updated = { ...updated, prompt_variant: variant };
          changes.push({ type: 'add', label: `prompt:${variant}` });
          break;
        }
        case 'set_client_info': {
          const client = { ...updated.client };
          if (inp.name) client.name = inp.name as string;
          if (inp.description) client.description = inp.description as string;
          updated = { ...updated, client };
          changes.push({ type: 'add', label: `client:${client.name}` });
          break;
        }
        case 'add_workflow': {
          const workflow = { title: inp.title as string, steps: inp.steps as { text: string; tool?: string }[] };
          updated = { ...updated, workflows: [...updated.workflows, workflow] };
          changes.push({ type: 'add', label: `workflow:${workflow.title}` });
          break;
        }
      }
    }

    // Update alerts based on new integrations
    const newAlerts = getAlertsForIntegrations(updated.integrations);
    updated = { ...updated, alerts: newAlerts };
    for (const alert of newAlerts) {
      if (!currentConfig.alerts.find(a => a.integration === alert.integration)) {
        alertsList.push({ integration: alert.integration, message: alert.message });
      }
    }

    return { updatedConfig: updated, changes, alerts: alertsList, tags };
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    const userMsg: DisplayMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);

    conversationRef.current.push({ role: 'user', content: text });
    setLoading(true);

    try {
      const systemPrompt = buildSystemPrompt(configRef.current);

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': API_KEY || '',
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1024,
          system: systemPrompt,
          tools: CHAT_TOOLS,
          messages: conversationRef.current,
        }),
      });

      const data = await response.json();
      const contentBlocks: AnthropicContentBlock[] = data.content || [];

      // Extract text and tool_use blocks
      const textParts = contentBlocks.filter((b: AnthropicContentBlock) => b.type === 'text').map((b: AnthropicContentBlock) => b.text || '');
      const toolBlocks = contentBlocks.filter((b: AnthropicContentBlock) => b.type === 'tool_use');

      let assistantMsg: DisplayMessage = {
        role: 'assistant',
        content: textParts.join('\n'),
      };

      // Apply tool calls if present
      if (toolBlocks.length > 0) {
        const { updatedConfig, changes, alerts, tags } = applyToolCalls(toolBlocks, configRef.current);
        onConfigChange(updatedConfig);

        assistantMsg = {
          ...assistantMsg,
          changes: changes && changes.length > 0 ? changes : undefined,
          alerts: alerts && alerts.length > 0 ? alerts : undefined,
          tags: tags.length > 0 ? tags : undefined,
        };

        // Add the assistant response and tool results to conversation history
        conversationRef.current.push({ role: 'assistant', content: contentBlocks });

        // Add tool results for each tool use
        const toolResults: AnthropicContentBlock[] = toolBlocks.map((b: AnthropicContentBlock) => ({
          type: 'tool_result' as const,
          tool_use_id: b.id || '',
          content: 'Done',
        }));
        conversationRef.current.push({ role: 'user', content: toolResults });

        // If the API stopped for tool_use, we need to continue the conversation
        if (data.stop_reason === 'tool_use') {
          const followUp = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': API_KEY || '',
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true',
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-6',
              max_tokens: 1024,
              system: buildSystemPrompt(updatedConfig),
              tools: CHAT_TOOLS,
              messages: conversationRef.current,
            }),
          });
          const followUpData = await followUp.json();
          const followUpBlocks: AnthropicContentBlock[] = followUpData.content || [];
          const followUpText = followUpBlocks.filter((b: AnthropicContentBlock) => b.type === 'text').map((b: AnthropicContentBlock) => b.text || '');

          if (followUpText.length > 0) {
            assistantMsg.content = followUpText.join('\n');
          }

          conversationRef.current.push({ role: 'assistant', content: followUpBlocks });
        }
      } else {
        conversationRef.current.push({ role: 'assistant', content: contentBlocks });
      }

      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (!API_KEY) {
    return (
      <div className="chat">
        <div className="chat-head">
          <div className="chat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
          </div>
          <div className="chat-title-group">
            <div className="chat-title">Config Assistant</div>
            <div className="chat-sub">Describe your needs in plain language</div>
          </div>
        </div>
        <div className="chat-messages">
          <div className="msg msg-sys">
            Set <strong>NEXT_PUBLIC_ANTHROPIC_API_KEY</strong> in .env.local to enable the chat assistant. You can still configure manually using the panel on the left.
          </div>
        </div>
        <div className="chat-input-area">
          <div className="chat-input-row">
            <input className="chat-field" placeholder="API key required..." disabled />
            <button className="chat-send" disabled>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat">
      <div className="chat-head">
        <div className="chat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </div>
        <div className="chat-title-group">
          <div className="chat-title">Config Assistant</div>
          <div className="chat-sub">Describe your needs in plain language</div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.map((msg, i) => {
          if (msg.role === 'system') {
            return (
              <div key={i} className="msg msg-sys">
                {msg.content}
              </div>
            );
          }

          if (msg.role === 'user') {
            return (
              <div key={i} className="msg msg-u">
                {msg.content}
              </div>
            );
          }

          // assistant
          return (
            <div key={i} className="msg msg-b">
              {msg.content}

              {msg.tags && msg.tags.length > 0 && (
                <div className="msg-tags">
                  {msg.tags.map((tag, j) => (
                    <span key={j} className="msg-tag">{tag}</span>
                  ))}
                </div>
              )}

              {msg.changes && msg.changes.length > 0 && (
                <div>
                  {msg.changes.map((change, j) => (
                    <div key={j} className="msg-diff">
                      {change.type === 'add' ? (
                        <span className="diff-add">+ {change.label}</span>
                      ) : (
                        <span className="diff-remove">- {change.label}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {msg.alerts && msg.alerts.length > 0 && msg.alerts.map((alert, j) => (
                <div key={j} className="msg-alert">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <span><strong>{alert.integration}</strong>: {alert.message}</span>
                </div>
              ))}

              {msg.changes && msg.changes.length > 0 && (
                <div className="msg-note">Config updated</div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="msg msg-b" style={{ opacity: 0.6 }}>
            Thinking...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-row">
          <input
            className="chat-field"
            placeholder="Describe what the bot needs..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button className="chat-send" onClick={sendMessage} disabled={loading}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

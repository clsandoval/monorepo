'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { InstanceConfig } from '@/lib/types';

interface ChatPanelProps {
  config: InstanceConfig;
  onConfigChange: (config: InstanceConfig) => void;
  onRender?: (jsx: string) => void;
}

interface DisplayMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function ChatPanel({ config, onConfigChange, onRender }: ChatPanelProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([
    {
      role: 'system',
      content: "Tell me what this bot instance needs. I'll update the configuration as we go.",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
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

  async function sendMessage(content?: string) {
    const text = (content ?? input).trim();
    if (!text || loading) return;

    setInput('');
    const userMsg: DisplayMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const chatMessages = [...messages.filter(m => m.role !== 'system'), userMsg].map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages, config: configRef.current }),
      });

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        let eventType = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7);
          } else if (line.startsWith('data: ') && eventType) {
            const data = JSON.parse(line.slice(6));

            if (eventType === 'text') {
              assistantText += data.content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant') {
                  return [...prev.slice(0, -1), { ...last, content: assistantText }];
                }
                return [...prev, { role: 'assistant', content: assistantText }];
              });
            } else if (eventType === 'render') {
              onRender?.(data.jsx);
            } else if (eventType === 'config') {
              onConfigChange(data.config);
            } else if (eventType === 'done') {
              // Finalize
            }
            eventType = '';
          }
        }
      }

      // Ensure final assistant message is in history
      if (assistantText) {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === 'assistant') {
            return [...prev.slice(0, -1), { role: 'assistant', content: assistantText }];
          }
          return [...prev, { role: 'assistant', content: assistantText }];
        });
      }
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
          <button className="chat-send" onClick={() => sendMessage()} disabled={loading}>
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

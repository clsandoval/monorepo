'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { DeploymentBrief, ChatMessage } from '@/lib/types';

const SYSTEM_MESSAGE: ChatMessage = {
  role: 'system',
  content: "Describe the client and what the bot should do. I'll build the deployment brief as we go.",
};

interface ChatPanelProps {
  brief: DeploymentBrief;
  onBriefChange: (brief: DeploymentBrief) => void;
  onRender?: (jsx: string) => void;
  initialMessages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
}

export function ChatPanel({ brief, onBriefChange, onRender, initialMessages, onMessagesChange }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialMessages && initialMessages.length > 0) return initialMessages;
    return [SYSTEM_MESSAGE];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const briefRef = useRef(brief);

  useEffect(() => {
    briefRef.current = brief;
  }, [brief]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    onMessagesChange?.(messages);
  }, [messages]); // eslint-disable-line react-hooks/exhaustive-deps

  async function sendMessage(content?: string) {
    const text = (content ?? input).trim();
    if (!text || loading) return;

    setInput('');
    const userMsg: ChatMessage = { role: 'user', content: text };
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
        body: JSON.stringify({ messages: chatMessages, brief: briefRef.current }),
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
            } else if (eventType === 'brief') {
              onBriefChange(data.brief);
            } else if (eventType === 'done') {
              // Finalize
            }
            eventType = '';
          }
        }
      }

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
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div className="chat-title-group">
          <div className="chat-title">Deploy Assistant</div>
          <div className="chat-status">
            <span className={`chat-status-dot${loading ? ' thinking' : ''}`} />
            {loading ? 'Thinking' : 'Ready'}
          </div>
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

          return (
            <div key={i} className="msg msg-b msg-markdown">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          );
        })}

        {loading && (
          <div className="typing-indicator">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <div className="chat-input-row">
          <input
            className="chat-field"
            placeholder="Describe the client and what the bot should do..."
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
        <div className="chat-hint">Enter to send · Shift+Enter for new line</div>
      </div>
    </div>
  );
}

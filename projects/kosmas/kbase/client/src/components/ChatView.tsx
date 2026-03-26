import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { ChatMessage } from '../types';

interface ChatViewProps {
  messages: ChatMessage[];
  agentStatus: string | null;
}

export function ChatView({ messages, agentStatus }: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, agentStatus]);

  return (
    <div className="flex-1 overflow-y-auto px-3 md:px-5 py-4 md:py-6 pb-32">
      {messages.length === 0 && (
        <div className="text-center text-text-muted mt-20">
          <p className="app-header-title text-text-primary text-2xl mb-2" style={{ fontSize: '32px', letterSpacing: '0.08em' }}>KOSMAS KB</p>
          <p className="text-sm" style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', textTransform: 'none', letterSpacing: 'normal' }}>
            Ask questions about docs in /workspace. Upload files or use slash commands.
          </p>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {agentStatus && <TypingIndicator status={agentStatus} />}
      <div ref={bottomRef} />
    </div>
  );
}

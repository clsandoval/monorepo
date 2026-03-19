import { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import type { ChatMessage } from '../types';

interface ChatViewProps {
  messages: ChatMessage[];
}

export function ChatView({ messages }: ChatViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat-area flex-1 overflow-y-auto">
      {messages.length === 0 && (
        <div className="text-center text-text-muted mt-20">
          <p className="text-lg font-display mb-2">ops-knowledgebase-chat</p>
          <p className="text-sm">
            Ask questions about files in /workspace. Use slash commands like in Claude Code.
          </p>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

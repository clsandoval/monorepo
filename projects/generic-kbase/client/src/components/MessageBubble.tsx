import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { ToolUseBlock } from './ToolUseBlock';
import type { ChatMessage } from '../types';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end mb-2">
        <div className="max-w-[90%] md:max-w-[85%] bg-white border border-default rounded-lg px-3 md:px-4 py-2 md:py-3 text-text-primary font-body text-sm md:text-base whitespace-pre-wrap animate-fade-in-up break-words">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.role === 'error') {
    return (
      <div className="flex justify-start mb-2">
        <div className="max-w-prose rounded-lg px-4 py-3 border border-accent-red-subtle animate-fade-in-up" style={{ background: 'rgba(168, 50, 39, 0.08)' }}>
          <span className="text-status-error text-sm">{message.content}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-2 animate-fade-in-up">
      <div className="max-w-full md:max-w-prose rounded-lg px-3 md:px-4 py-2 md:py-3 border border-default overflow-hidden" style={{ background: 'rgba(250, 172, 84, 0.08)' }}>
        {'toolUses' in message && message.toolUses.map((tu) => (
          <ToolUseBlock key={tu.id} entry={tu} />
        ))}
        {message.content && (
          <div className="prose-chat text-text-primary font-body text-base">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

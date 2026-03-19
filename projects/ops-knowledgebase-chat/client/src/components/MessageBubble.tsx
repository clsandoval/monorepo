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
        <div className="max-w-[85%] bg-surface-2 rounded-lg px-4 py-3 text-text-primary font-body text-base whitespace-pre-wrap animate-fade-in-up">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.role === 'error') {
    return (
      <div className="flex justify-start mb-2">
        <div className="error-banner max-w-prose">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-2 animate-fade-in-up">
      <div className="max-w-prose py-3 text-text-primary font-body text-base">
        {'toolUses' in message && message.toolUses.map((tu) => (
          <ToolUseBlock key={tu.id} entry={tu} />
        ))}
        {message.content && (
          <div className="prose-chat">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

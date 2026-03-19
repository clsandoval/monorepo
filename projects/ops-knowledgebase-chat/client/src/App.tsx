import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { ChatInput } from './components/ChatInput';
import type { ChatMessage, ToolUseEntry, ServerMessage } from './types';

let msgId = 0;
function nextId() {
  return String(++msgId);
}

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'assistant_text':
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant') {
            return [
              ...prev.slice(0, -1),
              { ...last, content: last.content + msg.content },
            ];
          }
          return [
            ...prev,
            { id: nextId(), role: 'assistant', content: msg.content, toolUses: [] },
          ];
        });
        break;

      case 'tool_use':
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant') {
            const entry: ToolUseEntry = { id: msg.id, tool: msg.tool, input: msg.input };
            return [
              ...prev.slice(0, -1),
              { ...last, toolUses: [...last.toolUses, entry] },
            ];
          }
          return [
            ...prev,
            {
              id: nextId(),
              role: 'assistant',
              content: '',
              toolUses: [{ id: msg.id, tool: msg.tool, input: msg.input }],
            },
          ];
        });
        break;

      case 'tool_result':
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === 'assistant') {
            const toolUses = last.toolUses.map((tu) =>
              tu.id === msg.tool_use_id ? { ...tu, output: msg.output } : tu,
            );
            return [...prev.slice(0, -1), { ...last, toolUses }];
          }
          return prev;
        });
        break;

      case 'done':
        setIsStreaming(false);
        break;

      case 'error':
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'error', content: msg.message },
        ]);
        setIsStreaming(false);
        break;

      case 'session_init':
        break;
    }
  }, []);

  const { send, connected } = useWebSocket({ onMessage: handleMessage });

  const handleSend = useCallback(
    (content: string) => {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'user', content },
      ]);
      send({ type: 'user_message', content });
      setIsStreaming(true);
    },
    [send],
  );

  const handleInterrupt = useCallback(() => {
    send({ type: 'interrupt' });
    setIsStreaming(false);
  }, [send]);

  const handleNewSession = useCallback(() => {
    send({ type: 'new_session' });
    setMessages([]);
    setIsStreaming(false);
  }, [send]);

  const handleUpload = useCallback(async (files: FileList) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file);
    }
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      const names = data.files.map((f: { name: string }) => f.name).join(', ');
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'user', content: `[Uploaded: ${names}]` },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'error', content: `Upload failed: ${err}` },
      ]);
    }
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        handleNewSession();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNewSession]);

  return (
    <div className="flex flex-col h-screen bg-surface-1 text-text-primary">
      <Header connected={connected} onNewSession={handleNewSession} />
      <ChatView messages={messages} />
      <ChatInput
        onSend={handleSend}
        onUpload={handleUpload}
        onInterrupt={handleInterrupt}
        isStreaming={isStreaming}
        disabled={!connected}
      />
    </div>
  );
}

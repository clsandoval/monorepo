import { useState, useCallback, useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { useFileTree } from './hooks/useFileTree';
import { useSessions } from './hooks/useSessions';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { ChatInput } from './components/ChatInput';
import { FileExplorer } from './components/FileExplorer';
import { SessionHistory } from './components/SessionHistory';
import type { ChatMessage, ToolUseEntry, ServerMessage } from './types';

let msgId = 0;
function nextId() {
  return String(++msgId);
}

export function App() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [agentStatus, setAgentStatus] = useState<string | null>(null);
  const [filesOpen, setFilesOpen] = useState(true);
  const [sessionsOpen, setSessionsOpen] = useState(true);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const { tree, flatFiles, loading: filesLoading, refresh: refreshFiles } = useFileTree();
  const { sessions, refresh: refreshSessions, updateSessionTitle } = useSessions();

  const handleMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'assistant_delta':
        setAgentStatus(null); // Clear status once text starts flowing
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

      case 'assistant_text':
        setAgentStatus(null);
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
        // Derive typing status from tool use
        {
          const toolInput = msg.input as Record<string, unknown> | undefined;
          let statusText = `Using ${msg.tool}...`;
          switch (msg.tool) {
            case 'Read': statusText = `Reading ${toolInput?.file_path || 'file'}...`; break;
            case 'Grep': statusText = `Searching for ${toolInput?.pattern || 'pattern'}...`; break;
            case 'Glob': statusText = 'Finding files...'; break;
            case 'Bash': statusText = 'Running command...'; break;
            case 'Write': statusText = `Writing ${toolInput?.file_path || 'file'}...`; break;
            case 'Edit': statusText = `Editing ${toolInput?.file_path || 'file'}...`; break;
            case 'WebSearch': statusText = 'Searching the web...'; break;
            case 'WebFetch': statusText = 'Fetching page...'; break;
          }
          setAgentStatus(statusText);
        }
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
        setAgentStatus(null);
        refreshFiles();
        refreshSessions();
        break;

      case 'error':
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'error', content: msg.message },
        ]);
        setIsStreaming(false);
        setAgentStatus(null);
        break;

      case 'session_init':
        break;

      case 'session_title':
        updateSessionTitle(msg.title);
        break;

      case 'session_loaded': {
        const loaded = msg.session;
        setActiveSessionId(loaded.id);
        const restoredMessages: ChatMessage[] = loaded.messages.map((m) => {
          if (m.role === 'assistant') {
            return {
              id: nextId(),
              role: 'assistant' as const,
              content: m.content,
              toolUses: m.toolUses || [],
            };
          }
          return { id: nextId(), role: m.role, content: m.content };
        });
        setMessages(restoredMessages);
        break;
      }
    }
  }, [refreshFiles, refreshSessions, updateSessionTitle]);

  const { send, connected } = useWebSocket({ onMessage: handleMessage });

  const handleSend = useCallback(
    (content: string) => {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'user', content },
      ]);
      send({ type: 'user_message', content });
      setIsStreaming(true);
      setAgentStatus('Thinking...');
    },
    [send],
  );

  const handleInterrupt = useCallback(() => {
    send({ type: 'interrupt' });
    setIsStreaming(false);
    setAgentStatus(null);
  }, [send]);

  const handleNewSession = useCallback(() => {
    send({ type: 'new_session' });
    setMessages([]);
    setIsStreaming(false);
    setAgentStatus(null);
    setActiveSessionId(null);
    refreshSessions();
  }, [send, refreshSessions]);

  const handleLoadSession = useCallback(
    (sessionId: string) => {
      send({ type: 'load_session', session_id: sessionId });
      setIsStreaming(false);
      setAgentStatus(null);
    },
    [send],
  );

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
      refreshFiles();
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'error', content: `Upload failed: ${err}` },
      ]);
    }
  }, [refreshFiles]);

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
      <Header
        connected={connected}
        onNewSession={handleNewSession}
        filesOpen={filesOpen}
        onToggleFiles={() => setFilesOpen((v) => !v)}
        sessionsOpen={sessionsOpen}
        onToggleSessions={() => setSessionsOpen((v) => !v)}
      />
      <div className="flex flex-1 overflow-hidden" style={{ marginTop: 48 }}>
        {filesOpen && (
          <div className="w-60 flex-shrink-0">
            <FileExplorer tree={tree} loading={filesLoading} onRefresh={refreshFiles} />
          </div>
        )}
        <div className="flex flex-col flex-1 min-w-0">
          <ChatView messages={messages} agentStatus={agentStatus} />
          <ChatInput
            onSend={handleSend}
            onUpload={handleUpload}
            onInterrupt={handleInterrupt}
            isStreaming={isStreaming}
            disabled={!connected}
            filesList={flatFiles}
          />
        </div>
        {sessionsOpen && (
          <div className="w-65 flex-shrink-0">
            <SessionHistory
              sessions={sessions}
              activeSessionId={activeSessionId}
              onSelectSession={handleLoadSession}
            />
          </div>
        )}
      </div>
    </div>
  );
}

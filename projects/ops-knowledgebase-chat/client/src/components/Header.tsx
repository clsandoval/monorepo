interface HeaderProps {
  connected: boolean;
  onNewSession: () => void;
}

export function Header({ connected, onNewSession }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-zinc-100">ops-knowledgebase-chat</h1>
        <span
          className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
          title={connected ? 'Connected' : 'Disconnected'}
        />
      </div>
      <button
        onClick={onNewSession}
        className="px-3 py-1.5 text-sm text-zinc-300 bg-zinc-800 rounded hover:bg-zinc-700 transition-colors"
      >
        New
      </button>
    </header>
  );
}

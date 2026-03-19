interface HeaderProps {
  connected: boolean;
  onNewSession: () => void;
}

export function Header({ connected, onNewSession }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="flex items-center gap-3">
        <h1 className="app-header-title">ops-knowledgebase-chat</h1>
        <span
          className={`status-dot ${connected ? 'status-dot--connected' : 'status-dot--error'}`}
          title={connected ? 'Connected' : 'Disconnected'}
        />
      </div>
      <button onClick={onNewSession} className="btn-ghost">
        New
      </button>
    </header>
  );
}

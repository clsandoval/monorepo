interface HeaderProps {
  connected: boolean;
  onNewSession: () => void;
  filesOpen: boolean;
  onToggleFiles: () => void;
  sessionsOpen: boolean;
  onToggleSessions: () => void;
}

export function Header({ connected, onNewSession, filesOpen, onToggleFiles, sessionsOpen, onToggleSessions }: HeaderProps) {
  return (
    <header className="app-header">
      <div className="flex items-center gap-3">
        <button onClick={onToggleFiles} className="btn-icon text-white hover:bg-white/10" title="Toggle file explorer">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={filesOpen ? '#faac54' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="app-header-title hidden sm:block">marigold-kbase</h1>
        <span
          className={`status-dot ${connected ? 'status-dot--connected' : 'status-dot--error'}`}
          title={connected ? 'Connected' : 'Disconnected'}
        />
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onNewSession} className="btn-ghost text-white hover:bg-white/10">
          New
        </button>
        <button onClick={onToggleSessions} className="btn-icon text-white hover:bg-white/10" title="Toggle session history">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={sessionsOpen ? '#faac54' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
      </div>
    </header>
  );
}

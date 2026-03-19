import { SessionItem } from './SessionItem';
import type { SessionSummary } from '../types';

interface SessionHistoryProps {
  sessions: SessionSummary[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
}

export function SessionHistory({ sessions, activeSessionId, onSelectSession }: SessionHistoryProps) {
  return (
    <div className="flex flex-col h-full bg-surface-0 border-l border-default">
      <div className="px-3 py-2 border-b border-default">
        <span className="text-xs font-display font-semibold text-text-muted uppercase tracking-wider">Sessions</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {sessions.length === 0 && (
          <div className="text-text-muted text-xs px-3 py-4 text-center">No sessions yet</div>
        )}
        {sessions.map((s) => (
          <SessionItem
            key={s.id}
            session={s}
            isActive={s.id === activeSessionId}
            onClick={() => onSelectSession(s.id)}
          />
        ))}
      </div>
    </div>
  );
}

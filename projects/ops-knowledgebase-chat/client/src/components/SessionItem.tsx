import type { SessionSummary } from '../types';

interface SessionItemProps {
  session: SessionSummary;
  isActive: boolean;
  onClick: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function SessionItem({ session, isActive, onClick }: SessionItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2 transition-colors ${
        isActive
          ? 'border-l-2 border-l-accent-gold bg-surface-2'
          : 'border-l-2 border-l-transparent hover:bg-surface-2'
      }`}
    >
      <div className="text-sm font-body font-medium text-text-primary truncate">
        {session.title}
      </div>
      <div className="text-xs text-text-muted mt-0.5">
        {timeAgo(session.createdAt)}
      </div>
    </button>
  );
}

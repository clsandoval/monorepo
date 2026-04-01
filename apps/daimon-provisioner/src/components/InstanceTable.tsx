'use client';

import { useRouter } from 'next/navigation';
import { DeploymentBrief } from '@/lib/types';

interface BriefTableProps {
  briefs: DeploymentBrief[];
  onDelete?: (id: string) => void;
}

function formatTimestamp(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 2) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
}

function statusClass(status: DeploymentBrief['status']): string {
  switch (status) {
    case 'brainstorming': return 'status-draft';
    case 'ready': return 'status-running';
    case 'deploying': return 'status-deploying';
    case 'deployed': return 'status-running';
  }
}

function statusLabel(status: DeploymentBrief['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function BriefTable({ briefs, onDelete }: BriefTableProps) {
  const router = useRouter();

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Brief</th>
            <th>Status</th>
            <th>Integrations</th>
            <th>Journeys</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {briefs.map(brief => (
            <tr key={brief.id} onClick={() => router.push(`/instances/${brief.id}`)} style={{ cursor: 'pointer' }}>
              <td>
                <div className="client-name">{brief.title || '(untitled)'}</div>
                <div className="client-desc">{brief.summary}</div>
              </td>
              <td>
                <span className={`status-badge ${statusClass(brief.status)}`}>
                  <span className="status-dot-sm" />
                  {statusLabel(brief.status)}
                </span>
              </td>
              <td>
                <span className="timestamp">{brief.integrations.length}</span>
              </td>
              <td>
                <span className="timestamp">{brief.journeys.length}</span>
              </td>
              <td>
                <span className="timestamp">{formatTimestamp(brief.updated_at)}</span>
              </td>
              <td>
                {onDelete && (
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(brief.id);
                    }}
                    title="Delete brief"
                  >
                    <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                      <path d="M5.75 1a.75.75 0 00-.75.75V3H2a.75.75 0 000 1.5h.37l.63 9.49A1.75 1.75 0 004.75 15.5h6.5A1.75 1.75 0 0013 13.99l.63-9.49H14A.75.75 0 0014 3h-3V1.75A.75.75 0 0010.25 1h-4.5zM6.5 3V2.5h3V3h-3zm-2.13 1.5h7.26l-.62 9.31a.25.25 0 01-.25.19h-6.5a.25.25 0 01-.25-.19L4.37 4.5z" />
                    </svg>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

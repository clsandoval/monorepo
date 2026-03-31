'use client';

import Link from 'next/link';
import { InstanceConfig } from '@/lib/types';

interface InstanceTableProps {
  instances: InstanceConfig[];
}

const discordSvg = (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <path d="M13.5 3.4A13 13 0 0 0 10.3 2.5a.05.05 0 0 0-.05.02c-.14.25-.3.58-.41.84a12 12 0 0 0-3.68 0A8 8 0 0 0 5.74 2.52a.05.05 0 0 0-.05-.02 13 13 0 0 0-3.2.9.05.05 0 0 0-.02.02C.88 6.1.35 8.7.61 11.27a.06.06 0 0 0 .02.04 13 13 0 0 0 4 2.02.05.05 0 0 0 .06-.02c.31-.42.58-.87.82-1.34a.05.05 0 0 0-.03-.07 8.6 8.6 0 0 1-1.25-.6.05.05 0 0 1 0-.09c.08-.06.17-.13.25-.2a.05.05 0 0 1 .05 0 9.3 9.3 0 0 0 8.02 0 .05.05 0 0 1 .05 0c.08.07.17.14.25.2a.05.05 0 0 1 0 .1 8 8 0 0 1-1.25.59.05.05 0 0 0-.03.07c.24.47.52.92.82 1.34a.05.05 0 0 0 .06.02 13 13 0 0 0 4-2.02.05.05 0 0 0 .03-.04c.3-3.15-.51-5.72-2.16-8.08a.04.04 0 0 0-.02-.01Z" />
  </svg>
);

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

function statusClass(status: InstanceConfig['status']): string {
  switch (status) {
    case 'running': return 'status-running';
    case 'deploying': return 'status-deploying';
    case 'stopped': return 'status-stopped';
    case 'draft': return 'status-draft';
  }
}

function statusLabel(status: InstanceConfig['status']): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function InstanceTable({ instances }: InstanceTableProps) {
  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Status</th>
            <th>Frontend</th>
            <th>Alerts</th>
            <th>Last Deploy</th>
          </tr>
        </thead>
        <tbody>
          {instances.map(instance => (
            <tr key={instance.id}>
              <td>
                <Link href={`/instances/${instance.id}`} style={{ display: 'block' }}>
                  <div className="client-name">{instance.client.name}</div>
                  <div className="client-desc">{instance.client.description}</div>
                </Link>
              </td>
              <td>
                <span className={`status-badge ${statusClass(instance.status)}`}>
                  <span className="status-dot-sm" />
                  {statusLabel(instance.status)}
                </span>
              </td>
              <td>
                {instance.frontends.discord ? (
                  <span className="fe-badge discord">
                    {discordSvg}
                    Discord
                  </span>
                ) : (
                  <span className="fe-badge">&mdash;</span>
                )}
              </td>
              <td>
                {instance.alerts.length > 0 ? (
                  <span className="alert-count has-alerts">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 1L1 14h14L8 1zm0 4.5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 5.5zM8 13a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                    {instance.alerts.length}
                  </span>
                ) : (
                  <span className="alert-count clear">&mdash;</span>
                )}
              </td>
              <td>
                <span className="timestamp">{formatTimestamp(instance.updated_at)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

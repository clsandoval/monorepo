'use client';

import { Alert } from '@/lib/types';

interface AlertCardProps {
  alert: Alert;
}

export function AlertCard({ alert }: AlertCardProps) {
  return (
    <div className="alert alert-amber">
      <div className="alert-icon">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1L1 14h14L8 1zm0 4.5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 5.5zM8 13a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </div>
      <div className="alert-content">
        <div className="alert-title">{alert.message}</div>
        <div className="alert-desc">
          {alert.detail} <span className="alert-action">Learn more</span>
        </div>
      </div>
    </div>
  );
}

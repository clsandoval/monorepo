'use client';

import React, { useState } from 'react';

export function SettingsClient() {
  const [defaultMode, setDefaultMode] = useState<'quick' | 'wizard'>('quick');

  return (
    <div className="space-y-3">
      <p className="font-body text-sm text-secondary">
        Default calculator mode when opening a new computation.
      </p>
      <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-lg w-fit">
        <button
          onClick={() => setDefaultMode('quick')}
          className={[
            'px-4 py-1.5 rounded-md text-sm font-body font-medium transition-colors duration-150',
            defaultMode === 'quick' ? 'bg-primary text-white' : 'text-secondary hover:text-primary',
          ].join(' ')}
        >
          Quick
        </button>
        <button
          onClick={() => setDefaultMode('wizard')}
          className={[
            'px-4 py-1.5 rounded-md text-sm font-body font-medium transition-colors duration-150',
            defaultMode === 'wizard' ? 'bg-primary text-white' : 'text-secondary hover:text-primary',
          ].join(' ')}
        >
          Step-by-step
        </button>
      </div>
      <p className="text-xs font-body text-muted">
        Preference is saved to your browser.
      </p>
    </div>
  );
}

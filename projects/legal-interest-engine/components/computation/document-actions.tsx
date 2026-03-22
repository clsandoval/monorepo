'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

type DocumentType = 'worksheet' | 'demand_letter' | 'court_filing' | 'summary_memo';

type UserTier = 'free' | 'consumer' | 'professional';

interface DocumentAction {
  type: DocumentType;
  label: string;
  tiers: UserTier[];
}

const DOCUMENT_ACTIONS: DocumentAction[] = [
  { type: 'worksheet',     label: 'Worksheet PDF',    tiers: ['consumer', 'professional'] },
  { type: 'summary_memo',  label: 'Summary Memo',     tiers: ['consumer', 'professional'] },
  { type: 'demand_letter', label: 'Demand Letter',    tiers: ['professional'] },
  { type: 'court_filing',  label: 'Court Filing',     tiers: ['professional'] },
];

interface DocumentActionsProps {
  tier: UserTier;
  onGenerate: (type: DocumentType) => Promise<void>;
  className?: string;
}

export function DocumentActions({ tier, onGenerate, className = '' }: DocumentActionsProps) {
  const [loading, setLoading] = useState<DocumentType | null>(null);

  async function handleGenerate(type: DocumentType) {
    if (loading) return;
    setLoading(type);
    try {
      await onGenerate(type);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className={['flex flex-wrap items-center gap-2', className].filter(Boolean).join(' ')}>
      {DOCUMENT_ACTIONS.map(({ type, label, tiers }) => {
        const enabled = tier !== 'free' && tiers.includes(tier);
        const isFreeBlocked = tier === 'free';
        const isConsumerBlocked = tier === 'consumer' && !tiers.includes('consumer');
        const isBlocked = isFreeBlocked || isConsumerBlocked;

        return (
          <div key={type} className="relative group">
            <Button
              variant="secondary"
              size="sm"
              disabled={isBlocked || loading !== null}
              loading={loading === type}
              onClick={() => enabled && handleGenerate(type)}
              className={isBlocked ? 'opacity-50' : ''}
            >
              {label}
            </Button>

            {/* Upgrade hint tooltip */}
            {isBlocked && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 pointer-events-none">
                <div className="bg-primary text-white text-[11px] font-body rounded-md px-3 py-1.5 whitespace-nowrap shadow-lg">
                  {isFreeBlocked
                    ? 'Upgrade to generate documents'
                    : 'Upgrade to Professional to generate this document'}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary" />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

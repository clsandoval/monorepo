'use client';

import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ComputationPeriod } from '@/lib/engine/types';
import { formatPeso, formatRate } from '@/lib/engine/format';
import { Card, CardBody } from '@/components/ui/card';

interface PeriodCardProps {
  period: ComputationPeriod;
}

function formatDateRange(startDate: string, endDate: string, days: number): string {
  const start = format(parseISO(startDate), 'MMMM d, yyyy');
  const end = format(parseISO(endDate), 'MMMM d, yyyy');
  return `${start} → ${end} · ${days.toLocaleString('en-PH')} days`;
}

function buildFormula(period: ComputationPeriod): string {
  const principal = formatPeso(period.baseAmount);
  const rate = formatRate(period.rateBps);
  const days = period.days.toLocaleString('en-PH');
  const interest = formatPeso(period.interest);
  return `${principal} × ${rate} × (${days} / 365) = ${interest}`;
}

export function PeriodCard({ period }: PeriodCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border-border">
      <CardBody className="py-4">
        {/* Top row: label + amount */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="font-heading font-semibold text-primary text-[14px] leading-snug">
              {period.label}
            </span>
            <span className="text-muted text-[12px] font-body">
              {formatDateRange(period.startDate, period.endDate, period.days)}
            </span>
          </div>
          <span className="font-mono text-[18px] font-semibold text-primary shrink-0">
            {formatPeso(period.interest)}
          </span>
        </div>

        {/* Expandable formula */}
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-[11px] font-body text-secondary hover:text-primary transition-colors duration-150 select-none"
            aria-expanded={expanded}
          >
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-150 ${expanded ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {expanded ? 'Hide formula' : 'Show formula'}
          </button>

          {expanded && (
            <div className="mt-2 rounded-md bg-accent/15 border border-accent/30 px-4 py-3">
              <span className="font-mono text-[12px] text-primary block leading-relaxed">
                {buildFormula(period)}
              </span>
            </div>
          )}
        </div>

        {/* Legal citation */}
        {period.legalCitation && (
          <p className="mt-2 text-[11px] font-body italic text-muted leading-relaxed">
            {period.legalCitation}
          </p>
        )}
      </CardBody>
    </Card>
  );
}

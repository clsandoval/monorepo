import React from 'react';
import { ComputationResult } from '@/lib/engine/types';

interface LegalBasisProps {
  result: ComputationResult;
  className?: string;
}

function collectCitations(result: ComputationResult): string[] {
  const seen = new Set<string>();
  const citations: string[] = [];

  function add(citation: string | undefined) {
    if (citation && !seen.has(citation)) {
      seen.add(citation);
      citations.push(citation);
    }
  }

  for (const period of result.periods) {
    add(period.legalCitation);
  }

  if (result.art2212) {
    add(result.art2212.legalCitation);
  }

  if (result.postFinality) {
    for (const period of result.postFinality) {
      add(period.legalCitation);
    }
  }

  return citations;
}

export function LegalBasis({ result, className = '' }: LegalBasisProps) {
  const citations = collectCitations(result);

  if (citations.length === 0) return null;

  return (
    <div
      className={[
        'border-l-[3px] border-primary pl-5 py-1',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <h3 className="font-heading font-semibold text-primary text-[15px] mb-3">
        Legal Basis
      </h3>
      <ul className="space-y-2">
        {citations.map((citation, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[13px] font-body text-secondary leading-relaxed"
          >
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary/50 shrink-0" aria-hidden="true" />
            <span>{citation}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

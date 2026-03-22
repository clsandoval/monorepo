'use client';

import React from 'react';
import { format, parseISO } from 'date-fns';
import { ComputationResult } from '@/lib/engine/types';
import { formatPeso, formatRateLabel } from '@/lib/engine/format';
import { PeriodCard } from './period-card';
import { LegalBasis } from './legal-basis';
import { DocumentActions } from './document-actions';
import { Card, CardBody, CardHeader } from '@/components/ui/card';

type UserTier = 'free' | 'consumer' | 'professional';

interface ResultsBreakdownProps {
  result: ComputationResult;
  tier?: UserTier;
  label?: string;
  onSave?: () => void;
  onGenerateDocument?: (type: string) => Promise<void>;
}

export function ResultsBreakdown({
  result,
  tier = 'free',
  label,
  onSave,
  onGenerateDocument,
}: ResultsBreakdownProps) {
  const targetDate = format(parseISO(result.input.targetDate), 'MMMM d, yyyy');
  const hasAdditionalAwards =
    result.additionalAwards && result.additionalAwards.length > 0;

  async function handleGenerate(type: string) {
    if (onGenerateDocument) {
      await onGenerateDocument(type);
    }
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="rounded-lg bg-primary px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            {label && (
              <p className="text-accent text-[11px] font-body uppercase tracking-[1.5px] mb-1">
                {label}
              </p>
            )}
            <p className="font-mono text-[32px] font-semibold text-white leading-none">
              {formatPeso(result.grandTotal)}
            </p>
            <p className="text-accent/80 text-[13px] font-body mt-1.5">
              As of {targetDate}
            </p>
          </div>

          <div className="flex flex-col gap-2 items-start sm:items-end">
            {/* Document actions */}
            <DocumentActions
              tier={tier}
              onGenerate={handleGenerate}
            />

            {/* Save button */}
            {onSave && (
              <button
                onClick={onSave}
                className="text-[12px] font-body text-accent/80 hover:text-white transition-colors duration-150 underline underline-offset-2"
              >
                Save computation
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Pre-judgment interest periods */}
      {result.periods.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-heading font-semibold text-primary text-[13px] uppercase tracking-[1px] px-1">
            Pre-Judgment Interest
          </h3>
          {result.periods.map((period, i) => (
            <PeriodCard key={i} period={period} />
          ))}
        </div>
      )}

      {/* Art. 2212 card */}
      {result.art2212 && (
        <div className="space-y-2">
          <h3 className="font-heading font-semibold text-primary text-[13px] uppercase tracking-[1px] px-1">
            Interest on Accrued Interest (Art. 2212)
          </h3>
          <Card className="border-accent/40 bg-accent/5">
            <CardBody className="py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="font-heading font-semibold text-primary text-[14px]">
                    Interest on Accrued Stipulated Interest
                  </span>
                  <span className="text-muted text-[12px] font-body">
                    Base: {formatPeso(result.art2212.accruedStipulatedInterest)} accrued interest
                    · {formatRateLabel(result.art2212.rateBps)}
                    · {result.art2212.days.toLocaleString('en-PH')} days
                  </span>
                  {result.art2212.legalCitation && (
                    <p className="mt-1 text-[11px] font-body italic text-muted">
                      {result.art2212.legalCitation}
                    </p>
                  )}
                </div>
                <span className="font-mono text-[18px] font-semibold text-primary shrink-0">
                  {formatPeso(result.art2212.interest)}
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Post-finality periods */}
      {result.postFinality && result.postFinality.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-heading font-semibold text-primary text-[13px] uppercase tracking-[1px] px-1">
            Post-Finality Interest
          </h3>
          {result.postFinality.map((period, i) => (
            <PeriodCard key={i} period={period} />
          ))}
        </div>
      )}

      {/* Additional awards */}
      {hasAdditionalAwards && (
        <div className="space-y-2">
          <h3 className="font-heading font-semibold text-primary text-[13px] uppercase tracking-[1px] px-1">
            Additional Awards
          </h3>
          {result.additionalAwards!.map((award, i) => (
            <Card key={i} className="border-border">
              <CardBody className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-heading font-semibold text-primary text-[14px]">
                      {award.label}
                    </span>
                    <span className="text-muted text-[12px] font-body">
                      Principal: {formatPeso(award.amount)} · {formatRateLabel(award.rateBps)} · {award.days.toLocaleString('en-PH')} days
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="font-mono text-[12px] text-muted">
                      Principal: {formatPeso(award.amount)}
                    </span>
                    <span className="font-mono text-[18px] font-semibold text-primary">
                      + {formatPeso(award.interest)}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}

          {/* Additional awards subtotal */}
          {(result.totalAdditionalAwards + result.totalAdditionalAwardsInterest > 0) && (
            <div className="flex items-center justify-between px-4 py-2 rounded-md bg-primary/5 border border-border">
              <span className="text-[13px] font-body text-secondary">
                Additional awards subtotal
              </span>
              <span className="font-mono text-[14px] font-semibold text-primary">
                {formatPeso(result.totalAdditionalAwards + result.totalAdditionalAwardsInterest)}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Grand total card */}
      <Card className="border-primary bg-primary">
        <CardBody>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-accent text-[11px] font-body uppercase tracking-[1.5px]">
                Grand Total
              </p>
              <p className="text-accent/70 text-[12px] font-body mt-0.5">
                As of {targetDate}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[28px] font-semibold text-white leading-none">
                {formatPeso(result.grandTotal)}
              </p>
              <div className="flex flex-col items-end gap-0.5 mt-1.5">
                <span className="text-accent/70 text-[11px] font-body">
                  Principal: {formatPeso(result.totalPrincipal)}
                </span>
                <span className="text-accent/70 text-[11px] font-body">
                  Interest: {formatPeso(result.totalInterest)}
                </span>
                {result.totalAdditionalAwards > 0 && (
                  <span className="text-accent/70 text-[11px] font-body">
                    Awards: {formatPeso(result.totalAdditionalAwards + result.totalAdditionalAwardsInterest)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Legal basis */}
      <LegalBasis result={result} className="mt-6" />
    </div>
  );
}

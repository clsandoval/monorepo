import React from 'react';

interface ProgressStep {
  label: string;
}

interface ProgressProps {
  steps: ProgressStep[];
  currentStep: number; // 0-indexed
  className?: string;
}

export function Progress({ steps, currentStep, className = '' }: ProgressProps) {
  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={index}>
              {/* Step dot */}
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className={[
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium font-mono border-2 transition-colors duration-200',
                    isCompleted
                      ? 'bg-primary border-primary text-white'
                      : isCurrent
                      ? 'bg-surface border-primary text-primary'
                      : 'bg-surface border-border text-muted',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <span
                  className={[
                    'text-[11px] font-body whitespace-nowrap',
                    isCurrent
                      ? 'text-primary font-semibold'
                      : isCompleted
                      ? 'text-secondary font-medium'
                      : 'text-muted',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  className={[
                    'flex-1 h-0.5 mx-2 mb-5 rounded-full transition-colors duration-200',
                    isCompleted ? 'bg-primary' : 'bg-border',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

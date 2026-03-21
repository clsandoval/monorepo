import type { ValidationWarning } from '@/types/common';

interface WarningsBannerProps {
  warnings: ValidationWarning[];
}

export function WarningsBanner({ warnings }: WarningsBannerProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2">
      {warnings.map((w) => (
        <div
          key={w.code}
          className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm px-4 py-3 rounded-md"
        >
          <p className="font-medium mb-0.5">
            {w.severity === 'WARNING' ? 'Warning' : 'Notice'}
          </p>
          <p className="text-amber-400">{w.message}</p>
        </div>
      ))}
    </div>
  );
}

export default WarningsBanner;

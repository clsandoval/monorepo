import type { ManualReviewFlag } from '@/types/common';

interface ManualReviewFlagsProps {
  manualReviewFlags: ManualReviewFlag[];
}

export function ManualReviewFlags({ manualReviewFlags }: ManualReviewFlagsProps) {
  if (manualReviewFlags.length === 0) return null;

  return (
    <div className="bg-amber-500/5 border border-amber-500/10 rounded-md p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs uppercase tracking-wide text-amber-500/70">Manual Review Required</span>
        <span className="text-xs border border-amber-500/30 text-amber-500 rounded px-1.5 py-0.5">
          {manualReviewFlags.length}
        </span>
      </div>
      <ul className="space-y-3">
        {manualReviewFlags.map((flag) => (
          <li key={flag.code} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs border border-amber-500/30 text-amber-500 rounded px-1.5 py-0.5 font-mono">
                {flag.code}
              </span>
              <span className="text-sm text-amber-400 font-medium">{flag.title}</span>
            </div>
            <p className="text-sm text-zinc-400">{flag.message}</p>
            <p className="text-xs text-zinc-500">
              Field: <span className="font-mono text-zinc-400">{flag.fieldAffected}</span>
            </p>
            <p className="text-xs text-zinc-500">
              Engine action: {flag.engineAction}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ManualReviewFlags;

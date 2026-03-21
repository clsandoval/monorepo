import { Button } from '@/components/ui/button';
// TaxComputationDocument lazy-loaded for PDF export (spec §14.2 rule 4)
// const TaxComputationDocument = lazy(() => import('@/components/pdf/TaxComputationDocument'));

interface ActionsBarProps {
  readOnly?: boolean;
  onCompute?: () => void;
  onFinalize?: () => void;
  onShare?: () => void;
  isComputing?: boolean;
  status?: string;
}

export function ActionsBar({ readOnly, onCompute, onFinalize, onShare, isComputing }: ActionsBarProps) {
  if (readOnly) return null;

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={onCompute}
        disabled={isComputing}
        className="h-9 px-4 bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
      >
        {isComputing ? 'Computing…' : 'Compute'}
      </Button>
      <Button
        variant="outline"
        onClick={onFinalize}
        className="h-9 px-4"
      >
        Finalize
      </Button>
      <Button
        variant="ghost"
        onClick={onShare}
        className="h-9 px-4"
      >
        Share
      </Button>
    </div>
  );
}

export default ActionsBar;

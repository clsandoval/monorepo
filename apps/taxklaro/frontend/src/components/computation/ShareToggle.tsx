import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw } from 'lucide-react';

interface ShareToggleProps {
  shareUrl?: string | null;
  isShared?: boolean;
  onRotate?: () => void;
  onToggleShare?: (enabled: boolean) => void;
}

export function ShareToggle({ shareUrl, isShared, onRotate }: ShareToggleProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!isShared || !shareUrl) return null;

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-800 border border-zinc-700">
      <span className="text-xs text-zinc-400 flex-1 truncate">{shareUrl}</span>
      <Button variant="ghost" size="icon" onClick={handleCopy} className="h-7 w-7 shrink-0">
        <Copy className="h-3.5 w-3.5" />
        <span className="sr-only">{copied ? 'Copied' : 'Copy link'}</span>
      </Button>
      <Button variant="ghost" size="icon" onClick={onRotate} className="h-7 w-7 shrink-0">
        <RefreshCw className="h-3.5 w-3.5" />
        <span className="sr-only">Rotate link</span>
      </Button>
    </div>
  );
}

export default ShareToggle;

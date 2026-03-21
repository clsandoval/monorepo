interface AutoSaveIndicatorProps {
  status: 'idle' | 'saving' | 'saved' | 'error';
}

export function AutoSaveIndicator({ status }: AutoSaveIndicatorProps) {
  if (status === 'idle') return null;

  const label = status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : 'Save failed';
  const colorClass = status === 'error' ? 'text-red-400' : 'text-zinc-500';

  return (
    <span className={`text-xs ${colorClass}`}>{label}</span>
  );
}

export default AutoSaveIndicator;

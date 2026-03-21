interface ComputationPageHeaderProps {
  title: string;
  taxYear?: number;
  status?: string;
  children?: React.ReactNode;
}

export function ComputationPageHeader({ title, taxYear, status, children }: ComputationPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h1
          className="font-display text-zinc-50 truncate"
          style={{ fontSize: 'var(--text-h2)', lineHeight: 'var(--text-h2-lh)' }}
        >
          {title}
        </h1>
        {taxYear && (
          <p className="text-sm text-zinc-400 mt-0.5">Tax Year {taxYear}{status ? ` · ${status}` : ''}</p>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

export default ComputationPageHeader;

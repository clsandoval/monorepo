interface TypingIndicatorProps {
  status: string;
}

export function TypingIndicator({ status }: TypingIndicatorProps) {
  return (
    <div className="flex items-center gap-2 py-2 animate-fade-in-up">
      <span
        className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-streaming flex-shrink-0"
      />
      <span className="text-sm text-text-secondary italic font-body">
        {status}
      </span>
    </div>
  );
}

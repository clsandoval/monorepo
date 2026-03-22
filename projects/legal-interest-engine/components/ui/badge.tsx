import React from 'react';

type BadgeVariant =
  | 'active'
  | 'demand_sent'
  | 'filed'
  | 'judgment'
  | 'execution'
  | 'closed'
  | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  active: 'bg-green-100 text-green-800 border-green-200',
  demand_sent: 'bg-amber-100 text-amber-800 border-amber-200',
  filed: 'bg-blue-100 text-blue-800 border-blue-200',
  judgment: 'bg-purple-100 text-purple-800 border-purple-200',
  execution: 'bg-orange-100 text-orange-800 border-orange-200',
  closed: 'bg-gray-100 text-gray-600 border-gray-200',
  default: 'bg-stone-100 text-stone-600 border-stone-200',
};

export function Badge({
  variant = 'default',
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium font-body border',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}

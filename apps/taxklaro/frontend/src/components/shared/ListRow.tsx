import { cn } from '@/lib/utils'

interface ListRowProps {
  title: string
  subtitle?: string
  onClick?: () => void
  className?: string
  children?: React.ReactNode
  rightContent?: React.ReactNode
}

export function ListRow({ title, subtitle, onClick, className, children, rightContent }: ListRowProps) {
  return (
    <div
      className={cn('flex items-center justify-between px-4 py-3 bg-zinc-900/50 cursor-pointer hover:bg-zinc-900', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-zinc-50 truncate">{title}</div>
        {subtitle && <div className="text-xs text-zinc-500 mt-0.5 truncate">{subtitle}</div>}
        {children}
      </div>
      {rightContent ?? <span className="text-xs text-zinc-600 ml-4 shrink-0">›</span>}
    </div>
  )
}

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
      className={cn('flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick() } : undefined}
    >
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground truncate">{title}</div>
        {subtitle && <div className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</div>}
        {children}
      </div>
      {rightContent ?? <span className="text-xs text-muted-foreground ml-4 shrink-0">›</span>}
    </div>
  )
}

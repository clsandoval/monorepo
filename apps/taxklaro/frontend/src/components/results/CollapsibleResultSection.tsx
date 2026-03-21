import { useState } from 'react'
import { cn } from '@/lib/utils'
export function CollapsibleResultSection({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={cn('bg-gray-50/50', className)}>
      <button className="flex items-center justify-between w-full px-4 py-3 text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="text-[13px] text-foreground">{title}</span>
        <span className={cn('text-xs text-muted-foreground transition-transform duration-200', open && 'rotate-90')}>›</span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

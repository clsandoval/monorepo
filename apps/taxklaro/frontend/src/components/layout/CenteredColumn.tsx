import { cn } from '@/lib/utils'

interface CenteredColumnProps {
  wide?: boolean
  className?: string
  children: React.ReactNode
}

export function CenteredColumn({ wide, className, children }: CenteredColumnProps) {
  return (
    <div className={cn('mx-auto w-full px-6', wide ? 'max-w-3xl' : 'max-w-xl', className)}>
      {children}
    </div>
  )
}

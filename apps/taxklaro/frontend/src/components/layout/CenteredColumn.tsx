import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

interface CenteredColumnProps extends HTMLAttributes<HTMLDivElement> {
  wide?: boolean
  children: React.ReactNode
}

export function CenteredColumn({ wide, className, children, ...rest }: CenteredColumnProps) {
  return (
    <div className={cn('mx-auto w-full px-6', wide ? 'max-w-3xl' : 'max-w-xl', className)} {...rest}>
      {children}
    </div>
  )
}

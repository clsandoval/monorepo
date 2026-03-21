import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'

interface CenteredColumnProps extends HTMLAttributes<HTMLDivElement> {
  wide?: boolean
  fluid?: boolean
  children: React.ReactNode
}

export function CenteredColumn({ wide, fluid, className, children, ...rest }: CenteredColumnProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-6 lg:px-8',
        fluid ? '' : wide ? 'max-w-3xl' : 'max-w-xl',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

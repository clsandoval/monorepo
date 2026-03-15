'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface IconButtonProps {
  icon: React.ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  isLoading?: boolean
  disabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  'aria-label': string
  tooltip?: string
  type?: 'button' | 'submit'
  className?: string
}

const variantMapping: Record<
  NonNullable<IconButtonProps['variant']>,
  'default' | 'secondary' | 'ghost' | 'destructive'
> = {
  primary: 'default',
  secondary: 'secondary',
  ghost: 'ghost',
  danger: 'destructive',
}

const sizeMapping: Record<
  NonNullable<IconButtonProps['size']>,
  'icon-xs' | 'icon-sm' | 'icon' | 'icon-lg'
> = {
  xs: 'icon-xs',
  sm: 'icon-sm',
  md: 'icon',
  lg: 'icon-lg',
}

function IconButtonInner({
  icon,
  variant = 'ghost',
  size = 'sm',
  isLoading = false,
  disabled = false,
  onClick,
  'aria-label': ariaLabel,
  type = 'button',
  className,
}: Omit<IconButtonProps, 'tooltip'>) {
  return (
    <Button
      variant={variantMapping[variant]}
      size={sizeMapping[size]}
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading ? 'true' : undefined}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={cn(className)}
    >
      {isLoading ? <Loader2 className="animate-spin" /> : icon}
    </Button>
  )
}

export function IconButton({ tooltip, ...props }: IconButtonProps) {
  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={<IconButtonInner {...props} />} />
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }
  return <IconButtonInner {...props} />
}

export default IconButton

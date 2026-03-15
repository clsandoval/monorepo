'use client'

import * as React from 'react'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

export interface ToggleProps {
  id: string
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'
  labelPosition?: 'left' | 'right'
  className?: string
}

export function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  size = 'md',
  labelPosition = 'right',
  className,
}: ToggleProps) {
  const switchSize = size === 'sm' ? 'sm' : 'default'

  const labelTextBlock = (
    <span className="flex flex-col">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {description && (
        <span className="text-[13px] text-muted-foreground mt-0.5">
          {description}
        </span>
      )}
    </span>
  )

  return (
    <div className={cn('inline-flex', className)}>
      <label
        htmlFor={id}
        className={cn(
          'flex items-center gap-2.5',
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        )}
      >
        {labelPosition === 'left' && labelTextBlock}
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          size={switchSize}
        />
        {labelPosition === 'right' && labelTextBlock}
      </label>
    </div>
  )
}

export default Toggle

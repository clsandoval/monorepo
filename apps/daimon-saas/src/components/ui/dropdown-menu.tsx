'use client'
// Spec library component — built per spec but not yet wired to pages; available for future integration

import * as React from 'react'
import * as RadixDropdownMenu from '@radix-ui/react-dropdown-menu'
import Link from 'next/link'

export interface DropdownMenuItem {
  type: 'item' | 'separator' | 'label'
  label?: string
  icon?: React.ReactNode
  onClick?: () => void
  href?: string
  disabled?: boolean
  variant?: 'default' | 'danger'
  shortcut?: string
}

export interface DropdownMenuProps {
  trigger: React.ReactNode
  items: DropdownMenuItem[]
  align?: 'start' | 'end' | 'center'
  side?: 'bottom' | 'top' | 'right' | 'left'
  sideOffset?: number
  disabled?: boolean
  className?: string
}

export function DropdownMenu({
  trigger,
  items,
  align = 'end',
  side = 'bottom',
  sideOffset = 4,
  disabled = false,
  className,
}: DropdownMenuProps) {
  return (
    <RadixDropdownMenu.Root>
      <RadixDropdownMenu.Trigger asChild disabled={disabled}>
        <span className="inline-flex">{trigger}</span>
      </RadixDropdownMenu.Trigger>

      <RadixDropdownMenu.Portal>
        <RadixDropdownMenu.Content
          align={align}
          side={side}
          sideOffset={sideOffset}
          className={[
            'z-[200] min-w-[160px] max-w-[240px]',
            'bg-white border border-[rgba(12,31,64,0.10)]',
            'shadow-[0_4px_16px_rgba(12,31,64,0.12),0_1px_4px_rgba(12,31,64,0.06)]',
            'py-1',
            'data-[state=open]:animate-dropdown-open',
            'data-[state=closed]:animate-dropdown-close',
            className ?? '',
          ].join(' ')}
          style={{ borderRadius: 0 }}
        >
          {items.map((item, index) => {
            if (item.type === 'separator') {
              return (
                <RadixDropdownMenu.Separator
                  key={index}
                  className="h-px my-1 bg-[rgba(12,31,64,0.08)]"
                />
              )
            }

            if (item.type === 'label') {
              return (
                <RadixDropdownMenu.Label
                  key={index}
                  className="flex items-center h-7 px-3 font-inter text-[11px] font-semibold text-[rgba(12,31,64,0.45)] uppercase tracking-[0.06em] cursor-default"
                >
                  {item.label}
                </RadixDropdownMenu.Label>
              )
            }

            // type === 'item'
            const isDanger = item.variant === 'danger'
            const itemClasses = [
              'flex items-center gap-2 h-9 px-3 w-full text-left cursor-pointer',
              'font-inter text-[14px] font-normal',
              'transition-colors duration-100 ease-out',
              'outline-none focus-visible:outline-none',
              isDanger
                ? 'text-[#EF4444] data-[highlighted]:text-[#DC2626] data-[highlighted]:bg-[rgba(239,68,68,0.06)] focus:bg-[rgba(239,68,68,0.10)] focus:text-[#DC2626]'
                : 'text-[#0C1F40] data-[highlighted]:bg-[rgba(12,31,64,0.05)] focus:bg-[rgba(180,231,221,0.20)]',
              item.disabled
                ? 'opacity-100 cursor-not-allowed text-[rgba(12,31,64,0.35)]'
                : '',
            ].join(' ')

            if (item.href && !item.disabled) {
              return (
                <RadixDropdownMenu.Item
                  key={index}
                  asChild
                  disabled={item.disabled}
                  className={itemClasses}
                >
                  <Link href={item.href}>
                    {item.icon && (
                      <span className="flex-shrink-0 w-4 h-4">{item.icon}</span>
                    )}
                    <span className="flex-1">{item.label}</span>
                    {item.shortcut && (
                      <span className="ml-auto font-inter text-[12px] font-normal text-[rgba(12,31,64,0.40)]">
                        {item.shortcut}
                      </span>
                    )}
                  </Link>
                </RadixDropdownMenu.Item>
              )
            }

            return (
              <RadixDropdownMenu.Item
                key={index}
                disabled={item.disabled}
                onSelect={item.onClick}
                className={itemClasses}
              >
                {item.icon && (
                  <span className={['flex-shrink-0 w-4 h-4', isDanger ? 'text-[#EF4444]' : ''].join(' ')}>
                    {item.icon}
                  </span>
                )}
                <span className="flex-1">{item.label}</span>
                {item.shortcut && (
                  <span className="ml-auto font-inter text-[12px] font-normal text-[rgba(12,31,64,0.40)]">
                    {item.shortcut}
                  </span>
                )}
              </RadixDropdownMenu.Item>
            )
          })}
        </RadixDropdownMenu.Content>
      </RadixDropdownMenu.Portal>
    </RadixDropdownMenu.Root>
  )
}

'use client'

import * as React from 'react'

export interface TabItem {
  value: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
  disabled?: boolean
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onChange: (value: string) => void
  variant?: 'underline' | 'pills' | 'bordered'
  size?: 'sm' | 'md'
  fullWidth?: boolean
  className?: string
}

export function Tabs({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  size = 'md',
  fullWidth = false,
  className,
}: TabsProps) {
  const tabListRef = React.useRef<HTMLDivElement>(null)

  function handleKeyDown(e: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const enabledIndexes = tabs
      .map((t, i) => (!t.disabled ? i : -1))
      .filter((i) => i !== -1)

    const currentPos = enabledIndexes.indexOf(index)

    let nextIndex: number | undefined

    if (e.key === 'ArrowRight') {
      nextIndex = enabledIndexes[(currentPos + 1) % enabledIndexes.length]
    } else if (e.key === 'ArrowLeft') {
      nextIndex =
        enabledIndexes[(currentPos - 1 + enabledIndexes.length) % enabledIndexes.length]
    } else if (e.key === 'Home') {
      nextIndex = enabledIndexes[0]
    } else if (e.key === 'End') {
      nextIndex = enabledIndexes[enabledIndexes.length - 1]
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!tabs[index].disabled) {
        onChange(tabs[index].value)
      }
      return
    } else {
      return
    }

    if (nextIndex !== undefined) {
      e.preventDefault()
      const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('button[role="tab"]')
      if (buttons && buttons[nextIndex]) {
        buttons[nextIndex].focus()
        onChange(tabs[nextIndex].value)
      }
    }
  }

  // --- Container classes ---
  let containerClass = ''
  if (variant === 'underline') {
    containerClass = 'flex border-b border-[rgba(12,31,64,0.10)] overflow-x-auto'
  } else if (variant === 'pills') {
    containerClass =
      'flex gap-1 bg-[#F3F4F6] p-1 border border-[rgba(12,31,64,0.08)] overflow-x-auto'
  } else if (variant === 'bordered') {
    containerClass =
      'flex border border-[rgba(12,31,64,0.10)] bg-white overflow-x-auto'
  }

  return (
    <div
      ref={tabListRef}
      role="tablist"
      aria-label="Tab navigation"
      className={[containerClass, className ?? ''].join(' ')}
    >
      {tabs.map((tab, index) => {
        const isActive = tab.value === activeTab
        const isDisabled = tab.disabled ?? false

        // --- Tab button classes ---
        let tabClass = ''
        let tabHeight = ''
        let tabPadding = ''
        let tabFont = ''

        if (variant === 'underline') {
          tabHeight = size === 'sm' ? 'h-9' : 'h-11'
          tabPadding = size === 'sm' ? 'px-3' : 'px-4'
          tabFont = size === 'sm' ? 'text-[13px]' : 'text-[14px]'
          const activeClasses = isActive
            ? 'text-[#0C1F40] border-b-2 border-[#B4E7DD] -mb-px'
            : 'text-[rgba(12,31,64,0.55)] border-b-2 border-transparent -mb-px'
          const hoverClasses = !isDisabled && !isActive ? 'hover:text-[#0C1F40] hover:bg-[rgba(12,31,64,0.04)]' : ''
          const disabledClasses = isDisabled ? 'text-[rgba(12,31,64,0.25)] cursor-not-allowed' : 'cursor-pointer'
          tabClass = [
            'flex items-center gap-1.5 whitespace-nowrap font-inter font-medium',
            'transition-[color,background,border-color] duration-150 ease-in-out',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B4E7DD] focus-visible:-outline-offset-2',
            'outline-none',
            tabHeight,
            tabPadding,
            tabFont,
            activeClasses,
            hoverClasses,
            disabledClasses,
            fullWidth ? 'flex-1 justify-center' : '',
          ].join(' ')
        } else if (variant === 'pills') {
          tabHeight = size === 'sm' ? 'h-7' : 'h-[34px]'
          tabPadding = size === 'sm' ? 'px-2.5' : 'px-3.5'
          tabFont = size === 'sm' ? 'text-[12px]' : 'text-[13px]'
          const activeClasses = isActive
            ? 'bg-white text-[#0C1F40] border border-[rgba(12,31,64,0.12)] shadow-[0_1px_2px_rgba(12,31,64,0.08)]'
            : 'bg-transparent text-[rgba(12,31,64,0.55)] border border-transparent'
          const hoverClasses = !isDisabled && !isActive ? 'hover:bg-[rgba(12,31,64,0.06)] hover:text-[#0C1F40]' : ''
          const disabledClasses = isDisabled ? 'text-[rgba(12,31,64,0.25)] cursor-not-allowed' : 'cursor-pointer'
          tabClass = [
            'flex items-center gap-1.5 whitespace-nowrap font-inter font-medium',
            'transition-[color,background,border-color] duration-150 ease-in-out',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B4E7DD] focus-visible:-outline-offset-2',
            'outline-none',
            tabHeight,
            tabPadding,
            tabFont,
            activeClasses,
            hoverClasses,
            disabledClasses,
            fullWidth ? 'flex-1 justify-center' : '',
          ].join(' ')
        } else if (variant === 'bordered') {
          tabHeight = 'h-11'
          tabPadding = 'px-5'
          tabFont = 'text-[14px]'
          const activeClasses = isActive
            ? 'bg-[rgba(180,231,221,0.12)] text-[#0C1F40] border-b-2 border-[#B4E7DD] -mb-px'
            : 'bg-white text-[rgba(12,31,64,0.55)] border-b-2 border-transparent -mb-px'
          const hoverClasses = !isDisabled && !isActive ? 'hover:bg-[rgba(12,31,64,0.03)] hover:text-[#0C1F40]' : ''
          const disabledClasses = isDisabled ? 'text-[rgba(12,31,64,0.25)] cursor-not-allowed' : 'cursor-pointer'
          tabClass = [
            'flex items-center gap-1.5 whitespace-nowrap font-inter font-medium border-r border-r-[rgba(12,31,64,0.10)] last:border-r-0',
            'transition-[color,background,border-color] duration-150 ease-in-out',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#B4E7DD] focus-visible:-outline-offset-2',
            'outline-none',
            tabHeight,
            tabPadding,
            tabFont,
            activeClasses,
            hoverClasses,
            disabledClasses,
            fullWidth ? 'flex-1 justify-center' : '',
          ].join(' ')
        }

        const tabId = `tab-${tab.value}`
        const panelId = `tabpanel-${tab.value}`

        return (
          <button
            key={tab.value}
            id={tabId}
            role="tab"
            aria-selected={isActive}
            aria-controls={panelId}
            aria-disabled={isDisabled || undefined}
            disabled={isDisabled}
            tabIndex={isActive ? 0 : -1}
            className={tabClass}
            onClick={() => {
              if (!isDisabled) {
                onChange(tab.value)
              }
            }}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            {tab.icon && <span className="w-4 h-4 flex-shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={[
                  'ml-1 font-inter text-[11px] font-semibold text-[#0C1F40] px-1.5 py-px',
                  isActive
                    ? 'bg-[rgba(180,231,221,0.50)]'
                    : 'bg-[rgba(180,231,221,0.30)]',
                ].join(' ')}
                style={{ borderRadius: 0 }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

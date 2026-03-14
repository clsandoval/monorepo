'use client'
// Spec library component — built per spec but not yet wired to pages; available for future integration

import * as React from 'react'
import { Search, X, Loader2 } from 'lucide-react'

// ---------------------------------------------------------------------------
// SearchInput
// ---------------------------------------------------------------------------

export interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
  disabled?: boolean
  isLoading?: boolean
  autoFocus?: boolean
  className?: string
  size?: 'sm' | 'md'
  id?: string
  'aria-label'?: string
}

let _idCounter = 0

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder,
  disabled = false,
  isLoading = false,
  autoFocus = false,
  className = '',
  size = 'md',
  id: idProp,
  'aria-label': ariaLabel,
}: SearchInputProps) {
  const [autoId] = React.useState(() => `search-input-${++_idCounter}`)
  const id = idProp ?? autoId

  const isSm = size === 'sm'
  const iconSize = isSm ? 14 : 16
  const clearIconSize = isSm ? 12 : 14
  const height = isSm ? 'h-[36px]' : 'h-[44px]'
  // left padding accounts for icon; right accounts for clear button (if value)
  const paddingLeft = isSm ? 'pl-[32px]' : 'pl-[40px]'
  const paddingRight = value.length > 0 && !disabled
    ? (isSm ? 'pr-[32px]' : 'pr-[40px]')
    : 'pr-[12px]'
  const fontSize = isSm ? 'text-[14px]' : 'text-[15px]'
  const clearBtnWidth = isSm ? 'w-[32px]' : 'w-[40px]'

  const wrapperClass = [
    'relative flex items-center w-full bg-white border transition-[border-color,box-shadow] duration-150 ease-in-out',
    height,
    disabled
      ? 'bg-[#F7F7F7] border-[rgba(12,31,64,0.10)] opacity-60'
      : 'border-[rgba(12,31,64,0.20)] hover:border-[rgba(12,31,64,0.40)] focus-within:!border-[1.5px] focus-within:!border-[#0C1F40] focus-within:![box-shadow:0_0_0_3px_rgba(180,231,221,0.30)]',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const inputClass = [
    'w-full h-full bg-transparent border-none outline-none font-[Inter,sans-serif] font-[400] text-[#0C1F40]',
    fontSize,
    paddingLeft,
    paddingRight,
    disabled ? 'cursor-not-allowed text-[rgba(12,31,64,0.35)]' : '',
    '[&::placeholder]:text-[rgba(12,31,64,0.35)]',
    // Hide native search clear button
    '[&::-webkit-search-cancel-button]:hidden [&::-ms-clear]:hidden',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapperClass}>
      {/* Search / loading icon */}
      <span
        className={[
          'absolute left-[12px] flex items-center justify-center pointer-events-none transition-colors duration-150 ease-in-out',
          isLoading ? 'text-[rgba(12,31,64,0.45)]' : 'text-[rgba(12,31,64,0.40)]',
        ].join(' ')}
        aria-hidden="true"
      >
        {isLoading
          ? <Loader2 size={iconSize} className="animate-spin" />
          : <Search size={iconSize} />}
      </span>

      <input
        type="search"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? 'Search...'}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={ariaLabel ?? 'Search'}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        className={inputClass}
      />

      {value.length > 0 && !disabled && (
        <button
          type="button"
          className={[
            'absolute right-0 flex items-center justify-center h-full bg-transparent border-none cursor-pointer',
            'text-[rgba(12,31,64,0.45)] hover:text-[rgba(12,31,64,0.80)] transition-colors duration-150 ease-in-out',
            'focus-visible:outline-2 focus-visible:outline-[#B4E7DD] focus-visible:outline-offset-[-2px]',
            clearBtnWidth,
          ].join(' ')}
          onClick={() => (onClear ? onClear() : onChange(''))}
          aria-label="Clear search"
          tabIndex={0}
        >
          <X size={clearIconSize} />
        </button>
      )}
    </div>
  )
}

export default SearchInput

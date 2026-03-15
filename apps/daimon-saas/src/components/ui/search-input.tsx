'use client'
// Spec library component — built per spec but not yet wired to pages; available for future integration

import * as React from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

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

  return (
    <div
      className={cn(
        'relative flex w-full items-center',
        className
      )}
    >
      {/* Search / loading icon */}
      <span
        className={cn(
          'pointer-events-none absolute left-3 flex items-center justify-center text-muted-foreground transition-colors',
          isLoading && 'animate-spin'
        )}
        aria-hidden="true"
      >
        {isLoading ? (
          <Loader2 className={isSm ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        ) : (
          <Search className={isSm ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        )}
      </span>

      <Input
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
        className={cn(
          isSm ? 'h-9 text-sm' : 'h-11 text-[15px]',
          isSm ? 'pl-8' : 'pl-10',
          value.length > 0 && !disabled
            ? (isSm ? 'pr-8' : 'pr-10')
            : 'pr-3',
          '[&::-webkit-search-cancel-button]:hidden [&::-ms-clear]:hidden'
        )}
      />

      {value.length > 0 && !disabled && (
        <button
          type="button"
          className={cn(
            'absolute right-0 flex h-full items-center justify-center border-none bg-transparent',
            'cursor-pointer text-muted-foreground transition-colors hover:text-foreground',
            'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px]',
            isSm ? 'w-8' : 'w-10'
          )}
          onClick={() => (onClear ? onClear() : onChange(''))}
          aria-label="Clear search"
          tabIndex={0}
        >
          <X className={isSm ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
        </button>
      )}
    </div>
  )
}

export default SearchInput

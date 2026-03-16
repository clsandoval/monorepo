'use client'

import { useCallback } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce'

interface FiltersBarProps {
  q?: string
  plan?: string
  status?: string
  sort?: string
}

const PLAN_OPTIONS = [
  { value: '', label: 'All Plans' },
  { value: 'free', label: 'Free' },
  { value: 'starter', label: 'Starter' },
  { value: 'pro', label: 'Pro' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'configured', label: 'Configured' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
]

const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Newest First' },
  { value: 'created_asc', label: 'Oldest First' },
  { value: 'name_asc', label: 'Name A–Z' },
  { value: 'name_desc', label: 'Name Z–A' },
  { value: 'plan_desc', label: 'Plan (Pro first)' },
  { value: 'heartbeat_desc', label: 'Recently Active' },
]

export function FiltersBar({ q = '', plan = '', status = '', sort = '' }: FiltersBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const hasActiveFilters = !!(q || plan || status || (sort && sort !== 'created_desc'))

  function buildParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    }
    // Reset to page 1 on filter change
    params.delete('page')
    return params.toString()
  }

  const handleSearch = useDebouncedCallback((value: string) => {
    const qs = buildParams({ q: value })
    router.push(`${pathname}${qs ? '?' + qs : ''}`)
  }, 300)

  const handleSelect = useCallback(
    (key: string, value: string) => {
      const qs = buildParams({ [key]: value })
      router.push(`${pathname}${qs ? '?' + qs : ''}`)
    },
    [router, pathname, searchParams] // eslint-disable-line react-hooks/exhaustive-deps
  )

  function handleReset() {
    router.push(pathname)
  }

  const selectStyle: React.CSSProperties = {
    color: '#374151',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    padding: '6px 32px 6px 10px',
    borderRadius: 0,
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 8px center',
    cursor: 'pointer'}

  return (
    <div
      className="flex flex-wrap items-center gap-3"
      style={{
        padding: '12px 0',
        borderBottom: '1px solid #E5E7EB',
        marginBottom: '0',
      }}
    >
      {/* Search */}
      <div className="relative" style={{ width: '320px' }}>
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9CA3AF',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Search by tenant name or owner email…"
          defaultValue={q}
          onChange={(e) => handleSearch(e.target.value)}
          className="font-body text-sm" style={{width: '100%',
            color: '#374151',
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            padding: '6px 10px 6px 34px',
            borderRadius: 0,
            outline: 'none'}}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#B4E7DD')}
          onBlur={(e) => (e.currentTarget.style.borderColor = '#E5E7EB')}
        />
      </div>

      {/* Plan filter */}
      <select
        value={plan}
        onChange={(e) => handleSelect('plan', e.target.value)}
        className="font-body text-sm" style={selectStyle}
        aria-label="Filter by plan"
      >
        {PLAN_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Status filter */}
      <select
        value={status}
        onChange={(e) => handleSelect('status', e.target.value)}
        className="font-body text-sm" style={selectStyle}
        aria-label="Filter by status"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Sort */}
      <select
        value={sort || 'created_desc'}
        onChange={(e) => handleSelect('sort', e.target.value === 'created_desc' ? '' : e.target.value)}
        className="font-body text-sm" style={selectStyle}
        aria-label="Sort order"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <button
          onClick={handleReset}
          className="flex items-center gap-1 transition-colors duration-150 font-body text-sm font-medium"
          style={{color: '#0C1F40',
            background: 'transparent',
            border: 'none',
            padding: '6px 8px',
            cursor: 'pointer',
            borderRadius: 0}}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.7')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
          <X size={14} />
          Reset Filters
        </button>
      )}
    </div>
  )
}

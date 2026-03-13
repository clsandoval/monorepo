'use client'

import * as React from 'react'
import { ChevronUpIcon, ChevronDownIcon, TableIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton-loader'

// ChevronUpDown icon (not available in all lucide versions — inline it)
function ChevronUpDownIcon({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  )
}

function DefaultTableEmptyState() {
  return (
    <div className="flex flex-col items-center gap-2">
      <TableIcon size={32} style={{ color: 'rgba(12,31,64,0.20)' }} />
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', fontWeight: 500, color: '#0C1F40' }}>
        No results
      </p>
      <p style={{ fontFamily: 'var(--font-inter)', fontSize: '13px', color: 'rgba(12,31,64,0.55)' }}>
        No data to display.
      </p>
    </div>
  )
}

interface Column<T> {
  key: string
  header: string
  width?: string
  align?: 'left' | 'right' | 'center'
  sortable?: boolean
  render: (row: T, index: number) => React.ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  rows: T[]
  keyExtractor: (row: T) => string
  onRowClick?: (row: T) => void
  sortKey?: string
  sortDirection?: 'asc' | 'desc'
  onSort?: (key: string) => void
  emptyState?: React.ReactNode
  loading?: boolean
  rowClassName?: (row: T) => string
  stickyHeader?: boolean
  caption?: string
  className?: string
}

export function Table<T>({
  columns,
  rows,
  keyExtractor,
  onRowClick,
  sortKey,
  sortDirection,
  onSort,
  emptyState,
  loading = false,
  rowClassName,
  stickyHeader = false,
  caption,
  className,
}: TableProps<T>) {
  return (
    <div
      className={`overflow-x-auto border border-[#E5E7EB]${className ? ` ${className}` : ''}`}
    >
      <table
        className="w-full"
        style={{ borderCollapse: 'collapse', tableLayout: 'auto' }}
        role="table"
      >
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead
          className="bg-[#F9FAFB] border-b border-[#E5E7EB]"
          style={stickyHeader ? { position: 'sticky', top: 0, zIndex: 10 } : undefined}
        >
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width, textAlign: col.align ?? 'left' }}
                className={`px-[16px] py-[10px] text-[12px] font-medium text-[#374151] uppercase tracking-[0.05em] whitespace-nowrap select-none${col.sortable ? ' cursor-pointer' : ''}`}
                onClick={() => col.sortable && onSort?.(col.key)}
                aria-sort={
                  sortKey === col.key
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : col.sortable
                    ? 'none'
                    : undefined
                }
              >
                <span className="inline-flex items-center gap-[4px]">
                  {col.header}
                  {col.sortable && (
                    sortKey === col.key ? (
                      sortDirection === 'asc' ? (
                        <ChevronUpIcon size={14} color="#0C1F40" />
                      ) : (
                        <ChevronDownIcon size={14} color="#0C1F40" />
                      )
                    ) : (
                      <ChevronUpDownIcon size={14} className="text-[#9CA3AF]" />
                    )
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="px-[16px] py-[12px] border-b border-[#F3F4F6]">
                    <Skeleton width="80%" height="14px" />
                  </td>
                ))}
              </tr>
            ))
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-[24px] py-[48px] text-center">
                {emptyState ?? <DefaultTableEmptyState />}
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr
                key={keyExtractor(row)}
                className={[
                  'transition-colors duration-100 hover:bg-[#F9FAFB] last:border-b-0',
                  onRowClick ? 'cursor-pointer focus-visible:outline-2 focus-visible:outline-[#B4E7DD]' : '',
                  rowClassName?.(row) ?? '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onRowClick?.(row)}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    onRowClick(row)
                  }
                }}
                tabIndex={onRowClick ? 0 : undefined}
                role={onRowClick ? 'button' : undefined}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    style={{ textAlign: col.align ?? 'left' }}
                    className="px-[16px] py-[12px] text-[14px] text-[#0C1F40] border-b border-[#F3F4F6] align-middle"
                  >
                    {col.render(row, index)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

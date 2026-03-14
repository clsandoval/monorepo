'use client'
// Spec library component — built per spec but not yet wired to pages; available for future integration

import * as React from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  className?: string
}

function getPageNumbers(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 1) return [1]

  const pages: (number | '...')[] = []
  const delta = 2

  const rangeStart = Math.max(2, currentPage - delta)
  const rangeEnd = Math.min(totalPages - 1, currentPage + delta)

  pages.push(1)

  if (rangeStart > 2) {
    pages.push('...')
  }

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i)
  }

  if (rangeEnd < totalPages - 1) {
    pages.push('...')
  }

  if (totalPages > 1) {
    pages.push(totalPages)
  }

  return pages
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className,
}: PaginationProps) {
  const start = (currentPage - 1) * itemsPerPage + 1
  const end = Math.min(currentPage * itemsPerPage, totalItems)
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  const buttonBase: React.CSSProperties = {
    height: '36px',
    minWidth: '36px',
    padding: '0 10px',
    fontFamily: 'var(--font-inter)',
    fontSize: '14px',
    fontWeight: 500,
    borderRadius: '0px',
    border: '1px solid #E5E7EB',
    background: 'transparent',
    color: '#374151',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.1s ease, border-color 0.1s ease',
    gap: '6px',
  }

  const buttonCurrent: React.CSSProperties = {
    ...buttonBase,
    background: '#0C1F40',
    color: '#FFFFFF',
    border: 'none',
    cursor: 'default',
  }

  const buttonDisabled: React.CSSProperties = {
    ...buttonBase,
    color: '#D1D5DB',
    cursor: 'not-allowed',
  }

  return (
    <nav
      aria-label="Pagination"
      className={`flex justify-between items-center mt-[24px]${className ? ` ${className}` : ''}`}
    >
      {/* Item range — hidden on mobile < 640px */}
      <span
        className="hidden sm:block"
        style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#6B7280' }}
      >
        Showing {start}–{end} of {totalItems.toLocaleString()}
      </span>

      {/* Mobile: simplified view */}
      <span
        className="block sm:hidden"
        style={{ fontFamily: 'var(--font-inter)', fontSize: '14px', color: '#6B7280' }}
      >
        Page {currentPage} of {totalPages}
      </span>

      {/* Page controls */}
      <div className="flex items-center gap-[4px]">
        {/* Prev button */}
        <button
          style={currentPage === 1 ? buttonDisabled : buttonBase}
          disabled={currentPage === 1}
          aria-disabled={currentPage === 1}
          aria-label="Go to previous page"
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
        >
          <ChevronLeftIcon size={16} />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page numbers — hidden on mobile < 640px */}
        <div className="hidden sm:flex items-center gap-[4px]">
          {pageNumbers.map((page, idx) =>
            page === '...' ? (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  height: '36px',
                  minWidth: '36px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9CA3AF',
                  fontSize: '14px',
                  padding: '0 4px',
                }}
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                style={page === currentPage ? buttonCurrent : buttonBase}
                aria-label={`Go to page ${page}`}
                aria-current={page === currentPage ? 'page' : undefined}
                onClick={() => page !== currentPage && onPageChange(page as number)}
                className={page !== currentPage ? 'hover:bg-[#F9FAFB] hover:border-[#D1D5DB] focus-visible:outline-2 focus-visible:outline-[#B4E7DD] focus-visible:outline-offset-2' : ''}
              >
                {page}
              </button>
            )
          )}
        </div>

        {/* Next button */}
        <button
          style={currentPage === totalPages ? buttonDisabled : buttonBase}
          disabled={currentPage === totalPages}
          aria-disabled={currentPage === totalPages}
          aria-label="Go to next page"
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRightIcon size={16} />
        </button>
      </div>
    </nav>
  )
}

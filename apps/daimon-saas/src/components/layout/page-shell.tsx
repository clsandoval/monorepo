import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center"
      style={{ marginBottom: '8px' }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight
                size={12}
                style={{ color: 'rgba(12,31,64,0.30)', margin: '0 4px', flexShrink: 0 }}
                aria-hidden="true"
              />
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="transition-colors duration-150"
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '13px',
                  fontWeight: 400,
                  color: 'rgba(12,31,64,0.55)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'rgba(12,31,64,0.80)'
                  e.currentTarget.style.textDecoration = 'underline'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'rgba(12,31,64,0.55)'
                  e.currentTarget.style.textDecoration = 'none'
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                style={{
                  fontFamily: 'var(--font-inter)',
                  fontSize: '13px',
                  fontWeight: 400,
                  color: 'rgba(12,31,64,0.80)',
                }}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}

interface PageShellProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: React.ReactNode
  children: React.ReactNode
}

export function PageShell({
  title,
  description,
  breadcrumbs,
  actions,
  children,
}: PageShellProps) {
  return (
    <div className="page-shell flex flex-col gap-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}

      {/* Header: title + actions */}
      <div className="page-shell-header flex items-start justify-between gap-4 max-sm:flex-col">
        <div className="page-shell-heading flex flex-col gap-1">
          <h1
            style={{
              fontFamily: 'var(--font-archivo)',
              fontVariationSettings: "'wdth' 112.5",
              fontSize: 'clamp(24px, 4vw, 28px)',
              fontWeight: 500,
              color: '#0C1F40',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {title}
          </h1>
          {description && (
            <p
              style={{
                fontFamily: 'var(--font-inter)',
                fontSize: '15px',
                fontWeight: 400,
                color: 'rgba(12,31,64,0.55)',
                lineHeight: 1.6,
                margin: 0,
                maxWidth: '600px',
              }}
            >
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div
            className="page-shell-actions flex items-center gap-3 shrink-0 max-sm:w-full"
          >
            {actions}
          </div>
        )}
      </div>

      {/* Page content */}
      <div className="page-shell-content flex flex-col gap-6">
        {children}
      </div>
    </div>
  )
}

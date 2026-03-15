// Spec library component — not yet wired to dashboard/admin/settings pages; available for future integration
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

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
      className="mb-2 flex items-center"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={index} className="flex items-center">
            {index > 0 && (
              <ChevronRight
                size={12}
                className="mx-1 shrink-0 text-muted-foreground/50"
                aria-hidden="true"
              />
            )}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className={cn(
                  'font-sans text-[13px] font-normal text-muted-foreground',
                  'no-underline transition-colors duration-150',
                  'hover:text-foreground/80 hover:underline'
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className="font-sans text-[13px] font-normal text-foreground/80"
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
            className={cn(
              'font-heading font-medium text-foreground leading-[1.2]',
              'text-[clamp(24px,4vw,28px)]',
              '[font-variation-settings:"wdth"_112.5]'
            )}
          >
            {title}
          </h1>
          {description && (
            <p className="max-w-[600px] font-sans text-[15px] font-normal leading-relaxed text-muted-foreground">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="page-shell-actions flex shrink-0 items-center gap-3 max-sm:w-full">
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

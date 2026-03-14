// Spec library component — not yet wired to auth pages; available for future integration
import React from 'react'

interface AuthCardProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function AuthCard({ children, title, description }: AuthCardProps) {
  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid rgba(12,31,64,0.10)',
        borderRadius: '0',
        boxShadow: 'none',
        padding: '40px',
        width: '100%',
      }}
      className="max-[440px]:!p-6"
    >
      {/* Card Header */}
      <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-archivo)',
            fontVariationSettings: "'wdth' 112.5",
            fontSize: '24px',
            fontWeight: 500,
            color: '#0C1F40',
            lineHeight: '1.2',
            margin: 0,
          }}
        >
          {title}
        </h1>
        {description && (
          <p
            style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '14px',
              fontWeight: 400,
              color: 'rgba(12,31,64,0.55)',
              lineHeight: '1.5',
              margin: 0,
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: '1px solid rgba(12,31,64,0.08)',
          margin: '0 0 24px 0',
        }}
      />

      {/* Card Body */}
      <div>{children}</div>
    </div>
  )
}

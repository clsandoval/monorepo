import * as React from 'react'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ width = '100%', height = '16px', className, style }: SkeletonProps) {
  return (
    <span
      className={`block${className ? ` ${className}` : ''}`}
      style={{
        width,
        height,
        background:
          'linear-gradient(90deg, rgba(12,31,64,0.06) 25%, rgba(12,31,64,0.10) 50%, rgba(12,31,64,0.06) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
        borderRadius: 0,
        display: 'block',
        ...style,
      }}
      aria-hidden="true"
    />
  )
}

// Circular variant — for avatars and icon placeholders
interface SkeletonCircleProps {
  size?: string | number
  className?: string
}

export function SkeletonCircle({ size = 40, className }: SkeletonCircleProps) {
  return (
    <Skeleton
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: '50%' }}
    />
  )
}

// Convenience row — horizontal strip (default rectangular)
export function SkeletonText({
  lines = 1,
  className,
}: {
  lines?: number
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-2${className ? ` ${className}` : ''}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 && lines > 1 ? '66%' : '100%'}
          height="14px"
        />
      ))}
    </div>
  )
}

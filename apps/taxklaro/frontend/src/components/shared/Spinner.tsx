import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn('h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400', className)}
      role="status"
      aria-label="Loading"
    />
  )
}

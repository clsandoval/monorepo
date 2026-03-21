import { cn } from '@/lib/utils'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function AutoSaveDot({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null
  return (
    <div
      className={cn(
        'h-2 w-2 rounded-full transition-colors duration-300',
        status === 'saved' && 'bg-green-500',
        status === 'saving' && 'bg-amber-500',
        status === 'error' && 'bg-red-500'
      )}
      title={status === 'saved' ? 'Saved' : status === 'saving' ? 'Saving...' : 'Save failed'}
    />
  )
}

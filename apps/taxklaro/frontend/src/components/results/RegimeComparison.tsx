import { cn } from '@/lib/utils'
interface RegimeOption { name: string; amount: string | number; effectiveRate: string; isRecommended: boolean }
export function RegimeComparison({ options }: { options: RegimeOption[] }) {
  return (
    <div className="mb-6">
      <div className="text-[13px] font-medium mb-3">Regime Comparison</div>
      <div className="flex flex-col gap-px">
        {options.map((option, i) => (
          <div key={option.name} className={cn(
            'flex items-center justify-between px-4 py-3',
            option.isRecommended ? 'bg-green-500/5 border border-green-500/10' : 'bg-zinc-900/50 border border-zinc-800',
            i === 0 && 'rounded-t-md', i === options.length - 1 && 'rounded-b-md'
          )}>
            <div className="flex items-center gap-2">
              <div className={cn('w-1.5 h-1.5 rounded-full', option.isRecommended ? 'bg-green-500' : 'bg-zinc-600')} />
              <span className={cn('text-[13px]', option.isRecommended ? 'font-medium' : 'text-zinc-500')}>{option.name}</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className={cn('text-[13px] tabular-nums', option.isRecommended ? 'font-semibold' : 'text-zinc-500')}>
                ₱{typeof option.amount === 'number' ? option.amount.toLocaleString() : option.amount}
              </span>
              <span className="text-[11px] text-zinc-500">{option.effectiveRate} eff.</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

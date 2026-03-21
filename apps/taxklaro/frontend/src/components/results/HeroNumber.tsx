interface HeroNumberProps { label: string; amount: string | number }
export function HeroNumber({ label, amount }: HeroNumberProps) {
  return (
    <div className="text-center mb-10">
      <div className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2">{label}</div>
      <div className="text-[52px] font-bold tabular-nums tracking-tight leading-none text-zinc-50">
        ₱{typeof amount === 'number' ? amount.toLocaleString('en-PH', { minimumFractionDigits: 2 }) : amount}
      </div>
    </div>
  )
}

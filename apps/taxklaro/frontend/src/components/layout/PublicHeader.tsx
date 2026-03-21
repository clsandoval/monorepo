interface PublicHeaderProps {
  label?: string
}

export function PublicHeader({ label }: PublicHeaderProps) {
  return (
    <header className="flex items-center gap-3 h-12 px-6 border-b border-zinc-800">
      <span className="text-sm font-bold text-zinc-50">TaxKlaro</span>
      {label && <span className="text-xs text-zinc-500">{label}</span>}
    </header>
  )
}

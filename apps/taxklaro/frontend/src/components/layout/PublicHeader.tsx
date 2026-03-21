interface PublicHeaderProps {
  label?: string
}

export function PublicHeader({ label }: PublicHeaderProps) {
  return (
    <header className="flex items-center gap-3 h-12 px-6 border-b border-border">
      <span className="text-sm font-bold text-foreground">TaxKlaro</span>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </header>
  )
}

interface SectionProgressBarProps {
  total: number
  completed: number
}

export function SectionProgressBar({ total, completed }: SectionProgressBarProps) {
  return (
    <div className="flex gap-1 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-0.5 flex-1 rounded-full transition-colors duration-300"
          style={{ backgroundColor: i < completed ? '#FAFAFA' : 'rgba(255,255,255,0.1)' }}
        />
      ))}
    </div>
  )
}

import { Button } from '@/components/ui/button'

interface ErrorStateProps {
  message?: string
  description?: string
  onRetry?: () => void
}

export function ErrorState({ message = 'Something went wrong', description, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <p className="text-sm text-foreground mb-1">{message}</p>
      {description && <p className="text-xs text-muted-foreground mb-4">{description}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>Try again</Button>
      )}
    </div>
  )
}

export default ErrorState

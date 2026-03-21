import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/shared/Spinner'

export function ComputeButton({
  disabled,
  loading,
  onClick,
}: {
  disabled: boolean
  loading: boolean
  onClick: () => void
}) {
  return (
    <div className="pt-6">
      <Button
        className="w-full h-11"
        disabled={disabled || loading}
        onClick={onClick}
        style={{ opacity: disabled && !loading ? 0.3 : 1 }}
      >
        {loading ? <Spinner className="h-4 w-4" /> : 'Compute Tax'}
      </Button>
    </div>
  )
}

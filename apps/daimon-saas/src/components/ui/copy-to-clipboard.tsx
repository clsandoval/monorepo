'use client'

import * as React from 'react'
import { CopyIcon, CheckIcon, XIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useToast } from '@/lib/toast'
import { cn } from '@/lib/utils'

type CopyState = 'default' | 'success' | 'error'

interface CopyToClipboardProps {
  value: string
  displayValue?: string
  masked?: boolean
  size?: 'sm' | 'md'
  variant?: 'inline' | 'block'
  label?: string
  className?: string
}

export function CopyToClipboard({
  value,
  displayValue,
  masked = false,
  size = 'md',
  variant = 'block',
  label = 'Copy to clipboard',
  className,
}: CopyToClipboardProps) {
  const [copyState, setCopyState] = React.useState<CopyState>('default')
  const [revealed, setRevealed] = React.useState(false)
  const { toast } = useToast()

  const iconSize = size === 'sm' ? 14 : variant === 'inline' ? 16 : 14
  const btnSize = size === 'sm' ? 'xs' as const : 'icon' as const

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopyState('success')
      toast.success('Copied to clipboard', { duration: 2000 })
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = value
      textArea.style.cssText = 'position:fixed;top:-9999px;left:-9999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        setCopyState('success')
        toast.success('Copied to clipboard', { duration: 2000 })
      } catch {
        setCopyState('error')
      }
      document.body.removeChild(textArea)
    }
    setTimeout(() => setCopyState('default'), 2000)
  }

  const tooltipLabel =
    copyState === 'success' ? 'Copied!' : copyState === 'error' ? 'Failed to copy' : label

  const CopyStateIcon =
    copyState === 'success' ? CheckIcon : copyState === 'error' ? XIcon : CopyIcon

  if (variant === 'inline') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size={btnSize}
                onClick={handleCopy}
                aria-label={tooltipLabel}
                aria-live="polite"
                className={cn(
                  'rounded-none',
                  copyState === 'success' && 'bg-green-500/10',
                  copyState === 'error' && 'bg-red-500/10',
                  className,
                )}
              />
            }
          >
            <CopyStateIcon size={iconSize} />
          </TooltipTrigger>
          <TooltipContent>{tooltipLabel}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // block variant
  const shownDisplay =
    masked && !revealed
      ? '••••••••••••••••••••'
      : (displayValue ?? value)

  return (
    <div
      className={cn(
        'flex items-center gap-2 border border-input bg-muted/50 px-3 py-2',
        className,
      )}
    >
      <span
        className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-sm text-foreground"
        aria-label={`API key value: ${masked && !revealed ? 'masked' : (displayValue ?? value)}`}
      >
        {shownDisplay}
      </span>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                aria-label={tooltipLabel}
                aria-live="polite"
                className={cn(
                  'shrink-0 rounded-none',
                  copyState === 'success' && 'bg-green-500/10',
                  copyState === 'error' && 'bg-red-500/10',
                )}
              />
            }
          >
            <CopyStateIcon size={14} />
          </TooltipTrigger>
          <TooltipContent>{tooltipLabel}</TooltipContent>
        </Tooltip>

        {masked && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRevealed((r) => !r)}
                  aria-label={revealed ? 'Hide API key' : 'Reveal API key'}
                  aria-pressed={revealed}
                  className="shrink-0 rounded-none text-muted-foreground hover:text-foreground"
                />
              }
            >
              {revealed ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
            </TooltipTrigger>
            <TooltipContent>{revealed ? 'Hide' : 'Reveal'}</TooltipContent>
          </Tooltip>
        )}
      </TooltipProvider>
    </div>
  )
}

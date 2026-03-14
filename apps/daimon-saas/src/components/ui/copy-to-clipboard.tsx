'use client'
// Spec library component — built per spec but not yet wired to pages; available for future integration

import * as React from 'react'
import { CopyIcon, CheckIcon, XIcon, EyeIcon, EyeOffIcon } from 'lucide-react'
import { useToast } from '@/lib/toast'

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

  const btnSize = size === 'sm' ? { w: 28, h: 28 } : { w: 32, h: 32 }
  const iconSize = size === 'sm' ? 14 : (variant === 'inline' ? 16 : 14)
  const inlineBtnSize = size === 'sm' ? 24 : 28

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopyState('success')
      toast.success('Copied to clipboard', { duration: 2000 })
    } catch {
      // Fallback for older browsers / HTTP contexts
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

  const copyBtnAriaLabel =
    copyState === 'success' ? 'Copied!' : copyState === 'error' ? 'Failed to copy' : label

  const copyBtnBg =
    copyState === 'success'
      ? 'rgba(34,197,94,0.12)'
      : copyState === 'error'
      ? 'rgba(239,68,68,0.12)'
      : 'transparent'

  const CopyStateIcon =
    copyState === 'success' ? CheckIcon : copyState === 'error' ? XIcon : CopyIcon

  if (variant === 'inline') {
    return (
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copyBtnAriaLabel}
        aria-live="polite"
        className={className}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: inlineBtnSize,
          height: inlineBtnSize,
          padding: '4px',
          background: copyBtnBg,
          border: 'none',
          borderRadius: 0,
          cursor: 'pointer',
          transition: 'background 0.1s ease',
          color: '#0C1F40',
        }}
      >
        <CopyStateIcon size={iconSize} />
      </button>
    )
  }

  // block variant
  const shown = masked ? revealed : true
  const shownDisplay = masked && !revealed
    ? '••••••••••••••••••••'
    : (displayValue ?? value)

  return (
    <div
      className={`flex items-center gap-2${className ? ` ${className}` : ''}`}
      style={{
        background: '#F9FAFB',
        border: '1px solid #E5E7EB',
        padding: '8px 12px',
      }}
    >
      <span
        className="flex-1 font-mono overflow-hidden text-ellipsis whitespace-nowrap"
        style={{ fontSize: '14px', color: '#0C1F40' }}
        aria-label={`API key value: ${shown ? (displayValue ?? value) : 'masked'}`}
      >
        {shownDisplay}
      </span>

      <button
        type="button"
        onClick={handleCopy}
        aria-label={copyBtnAriaLabel}
        aria-live="polite"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: btnSize.w,
          height: btnSize.h,
          background: copyBtnBg,
          border: 'none',
          borderRadius: 0,
          cursor: 'pointer',
          transition: 'background 0.1s ease',
          flexShrink: 0,
          color: '#0C1F40',
        }}
        onMouseEnter={(e) => {
          if (copyState === 'default') {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(12,31,64,0.06)'
          }
        }}
        onMouseLeave={(e) => {
          if (copyState === 'default') {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          }
        }}
      >
        <CopyStateIcon size={14} />
      </button>

      {masked && (
        <button
          type="button"
          onClick={() => setRevealed(r => !r)}
          aria-label={revealed ? 'Hide API key' : 'Reveal API key'}
          aria-pressed={revealed}
          title={revealed ? 'Hide' : 'Reveal'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: btnSize.w,
            height: btnSize.h,
            background: 'transparent',
            border: 'none',
            borderRadius: 0,
            cursor: 'pointer',
            transition: 'color 0.15s ease',
            flexShrink: 0,
            color: 'rgba(12,31,64,0.45)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(12,31,64,0.75)'
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = 'rgba(12,31,64,0.45)'
          }}
        >
          {revealed ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
        </button>
      )}
    </div>
  )
}

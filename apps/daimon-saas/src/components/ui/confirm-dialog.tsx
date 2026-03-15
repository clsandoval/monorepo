'use client'

import { useState, useCallback } from 'react'
import { Trash2, AlertTriangle, HelpCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Input } from './input'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from './alert-dialog'

type ConfirmVariant = 'danger' | 'warning' | 'default'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant?: ConfirmVariant
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  loading?: boolean
  confirmationText?: string
  confirmationPlaceholder?: string
}

const VARIANT_CONFIG: Record<
  ConfirmVariant,
  {
    Icon: React.ElementType
    iconClassName: string
    mediaBgClassName: string
    confirmClassName: string
  }
> = {
  danger: {
    Icon: Trash2,
    iconClassName: 'text-destructive',
    mediaBgClassName: 'bg-destructive/10',
    confirmClassName:
      'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
  warning: {
    Icon: AlertTriangle,
    iconClassName: 'text-amber-600',
    mediaBgClassName: 'bg-amber-600/10',
    confirmClassName:
      'bg-amber-600 text-white hover:bg-amber-700',
  },
  default: {
    Icon: HelpCircle,
    iconClassName: 'text-foreground',
    mediaBgClassName: 'bg-muted',
    confirmClassName:
      'bg-primary text-primary-foreground hover:bg-primary/90',
  },
}

export function ConfirmDialog({
  open,
  onOpenChange,
  variant = 'default',
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  loading = false,
  confirmationText,
  confirmationPlaceholder,
}: ConfirmDialogProps) {
  const [confirmInput, setConfirmInput] = useState('')
  const [internalLoading, setInternalLoading] = useState(false)

  const cfg = VARIANT_CONFIG[variant]
  const isLoading = loading || internalLoading
  const isConfirmDisabled =
    isLoading ||
    (confirmationText !== undefined && confirmInput !== confirmationText)

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!isLoading) {
        onOpenChange(nextOpen)
        if (!nextOpen) setConfirmInput('')
      }
    },
    [isLoading, onOpenChange]
  )

  async function handleConfirm() {
    const result = onConfirm()
    if (result instanceof Promise) {
      setInternalLoading(true)
      try {
        await result
      } finally {
        setInternalLoading(false)
      }
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia className={cfg.mediaBgClassName}>
            <cfg.Icon size={20} className={cfg.iconClassName} />
          </AlertDialogMedia>
          <AlertDialogTitle className="font-heading">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>

        {confirmationText !== undefined && (
          <div className="grid gap-1.5">
            <p className="text-[13px] font-medium text-foreground">
              Type{' '}
              <code className="bg-muted px-1 py-0.5 font-mono text-[13px]">
                {confirmationText}
              </code>{' '}
              to confirm
            </p>
            <Input
              id="confirm-dialog-input"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={
                confirmationPlaceholder ??
                `Type ${confirmationText} to confirm`
              }
              disabled={isLoading}
              className="h-[44px]"
            />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleConfirm()
            }}
            disabled={isConfirmDisabled}
            className={cn(cfg.confirmClassName)}
          >
            {isLoading && (
              <Loader2 size={14} className="animate-spin" />
            )}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

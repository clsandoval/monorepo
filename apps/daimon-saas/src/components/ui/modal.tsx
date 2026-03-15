'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  footer?: React.ReactNode
  showClose?: boolean
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  loading?: boolean
}

const SIZE_CLASSES: Record<string, string> = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  size = 'md',
  children,
  footer,
  showClose = true,
  loading = false,
}: ModalProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (loading && !next) return
        onOpenChange(next)
      }}
    >
      <DialogContent
        className={cn('flex max-h-[calc(100vh-5rem)] flex-col gap-0 p-0', SIZE_CLASSES[size])}
        showCloseButton={showClose}
      >
        <DialogHeader className="shrink-0 border-b border-border px-6 py-5">
          <DialogTitle className="font-heading text-lg font-medium text-foreground">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="mt-0.5 text-[13px] text-muted-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="relative flex-1 overflow-y-auto p-6">
          {children}
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/75">
              <Loader2 size={24} className="animate-spin text-foreground" />
            </div>
          )}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-border px-6 py-4">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

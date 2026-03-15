'use client'

import { toast as sonnerToast, type ExternalToast } from 'sonner'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

type ToastOptions = Omit<ToastItem, 'id' | 'variant' | 'title'>

interface ToastAPI {
  success: (title: string, opts?: ToastOptions) => void
  error: (title: string, opts?: ToastOptions) => void
  warning: (title: string, opts?: ToastOptions) => void
  info: (title: string, opts?: ToastOptions) => void
  (item: Omit<ToastItem, 'id'>): void
}

function toSonnerOpts(opts?: ToastOptions): ExternalToast | undefined {
  if (!opts) return undefined
  const result: ExternalToast = {}
  if (opts.description) result.description = opts.description
  if (opts.duration !== undefined) result.duration = opts.duration
  if (opts.action) {
    result.action = {
      label: opts.action.label,
      onClick: opts.action.onClick,
    }
  }
  return result
}

/**
 * useToast — backward-compatible hook that delegates to Sonner.
 *
 * Usage unchanged:
 *   const { toast } = useToast()
 *   toast.success('Saved!')
 *   toast.error('Something went wrong', { description: 'Try again' })
 */
export function useToast() {
  const toastFn = function (item: Omit<ToastItem, 'id'>) {
    const opts = toSonnerOpts(item)
    switch (item.variant) {
      case 'success':
        sonnerToast.success(item.title, opts)
        break
      case 'error':
        sonnerToast.error(item.title, opts)
        break
      case 'warning':
        sonnerToast.warning(item.title, opts)
        break
      case 'info':
        sonnerToast.info(item.title, opts)
        break
      default:
        sonnerToast(item.title, opts)
    }
  } as ToastAPI

  toastFn.success = (title: string, opts?: ToastOptions) =>
    sonnerToast.success(title, toSonnerOpts(opts))
  toastFn.error = (title: string, opts?: ToastOptions) =>
    sonnerToast.error(title, toSonnerOpts(opts))
  toastFn.warning = (title: string, opts?: ToastOptions) =>
    sonnerToast.warning(title, toSonnerOpts(opts))
  toastFn.info = (title: string, opts?: ToastOptions) =>
    sonnerToast.info(title, toSonnerOpts(opts))

  return { toast: toastFn }
}

// Re-export for any code that imported these (e.g., the old ToastProvider)
export type { ToastOptions }

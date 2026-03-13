'use client'

import { createContext, useContext } from 'react'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  duration?: number // ms; default 4000; 0 = no auto-dismiss
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

export interface ToastContextValue {
  toasts: ToastItem[]
  addToast: (item: Omit<ToastItem, 'id'>) => void
  removeToast: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  const { addToast } = ctx

  const toastFn = function (item: Omit<ToastItem, 'id'>) {
    addToast(item)
  } as ToastAPI

  toastFn.success = (title: string, opts?: ToastOptions) =>
    addToast({ variant: 'success', title, ...opts })
  toastFn.error = (title: string, opts?: ToastOptions) =>
    addToast({ variant: 'error', title, ...opts })
  toastFn.warning = (title: string, opts?: ToastOptions) =>
    addToast({ variant: 'warning', title, ...opts })
  toastFn.info = (title: string, opts?: ToastOptions) =>
    addToast({ variant: 'info', title, ...opts })

  return { toast: toastFn }
}

'use client'

import { Toaster as SonnerToaster } from 'sonner'

/**
 * Daimon-themed Toaster — renders the Sonner toast viewport with brand tokens.
 * Place in layout.tsx as a sibling to children (not wrapper).
 */
export function DaimonToaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        className:
          'font-body border-border bg-card text-foreground shadow-lg',
        style: {
          borderRadius: '0',
        },
        classNames: {
          success: 'border-l-[3px] border-l-green-600',
          error: 'border-l-[3px] border-l-destructive',
          warning: 'border-l-[3px] border-l-amber-600',
          info: 'border-l-[3px] border-l-primary',
          title: 'text-[13px] font-semibold text-foreground',
          description: 'text-xs text-muted-foreground',
          actionButton:
            'text-xs font-semibold underline cursor-pointer bg-transparent border-none p-0',
        },
      }}
      richColors={false}
      expand
      closeButton
    />
  )
}

/**
 * @deprecated Use DaimonToaster as a sibling instead.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <DaimonToaster />
    </>
  )
}

'use client'

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

export function NavigationProgressBar() {
  return (
    <ProgressBar
      height="2px"
      color="hsl(var(--primary))"
      options={{ showSpinner: false }}
      shallowRouting
    />
  )
}

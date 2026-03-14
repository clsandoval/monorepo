'use client'

import { AppProgressBar as ProgressBar } from 'next-nprogress-bar'

export function NavigationProgressBar() {
  return (
    <ProgressBar
      height="2px"
      color="#B4E7DD"
      options={{ showSpinner: false }}
      shallowRouting
    />
  )
}

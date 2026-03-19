declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function trackEvent(name: string, params?: Record<string, unknown>) {
  if (window.gtag) {
    window.gtag('event', name, params);
  }
}

export function trackQuickCalcUsed(heirCount: number) {
  trackEvent('quick_calc_used', { heir_count: heirCount });
}

export function trackSignupStarted() {
  trackEvent('signup_started');
}

export function trackSignupCompleted() {
  trackEvent('signup_completed');
}

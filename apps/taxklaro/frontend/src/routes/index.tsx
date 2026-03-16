import { createRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { rootRoute } from './__root';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/button';

export const IndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
});

/* ------------------------------------------------------------------ */
/*  Animated counter — counts up to a target number                    */
/* ------------------------------------------------------------------ */
function AnimatedNumber({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(target); // default to target so content is correct without JS/IO
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return; // already showing target

    // Reset to 0 for animation — only if we can animate
    setValue(0);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            setValue(Math.round(target * eased));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{value.toLocaleString()}</span>;
}

/* ------------------------------------------------------------------ */
/*  Scroll-triggered fade-in                                           */
/* ------------------------------------------------------------------ */
function FadeIn({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  // Start visible (graceful degradation if JS/IO fails), hide in effect
  const [state, setState] = useState<'idle' | 'hidden' | 'visible'>('idle');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setState('visible');
      return;
    }

    // Only hide once we know we can animate
    setState('hidden');

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState('visible');
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const isHidden = state === 'hidden';

  return (
    <div
      ref={ref}
      className={className}
      style={state === 'idle' ? undefined : {
        opacity: isHidden ? 0 : 1,
        transform: isHidden ? 'translateY(16px)' : 'translateY(0)',
        transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tax comparison card                                                */
/* ------------------------------------------------------------------ */
function TaxComparisonPreview() {
  return (
    <div className="landing-comparison" role="figure" aria-label="Sample tax computation comparing 8% GIT vs Graduated rate for ₱720,000 annual income">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-[0.6875rem] font-semibold tracking-[0.08em] uppercase text-muted-foreground/70">
          Sample Computation
        </span>
        <span className="text-[0.6875rem] font-medium text-muted-foreground/50">
          ₱720,000 annual income
        </span>
      </div>

      {/* Regime comparison */}
      <div className="space-y-3">
        {/* Graduated */}
        <div className="flex items-baseline justify-between py-3 border-b border-border/40">
          <div>
            <div className="text-[var(--text-small)] font-medium text-foreground/70">Graduated + OSD</div>
            <div className="text-[0.6875rem] text-muted-foreground mt-0.5">Standard rate table</div>
          </div>
          <div className="text-[1.25rem] font-semibold tabular-nums text-foreground/80">₱62,400</div>
        </div>

        {/* 8% GIT — the winner */}
        <div className="flex items-baseline justify-between py-3 rounded-lg -mx-3 px-3" style={{ backgroundColor: 'rgb(var(--regime-optimal-bg))' }}>
          <div>
            <div className="text-[var(--text-small)] font-medium text-foreground flex items-center gap-1.5">
              8% Gross Income Tax
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full" style={{ backgroundColor: 'rgb(var(--peso-savings))', color: 'white' }} aria-label="Recommended">
                <Check className="w-2.5 h-2.5" strokeWidth={3} aria-hidden="true" />
              </span>
            </div>
            <div className="text-[0.6875rem] text-muted-foreground mt-0.5">Flat rate, simplified</div>
          </div>
          <div className="text-[1.25rem] font-semibold tabular-nums text-foreground">₱48,000</div>
        </div>
      </div>

      {/* Savings */}
      <div className="mt-6 pt-5 border-t-2 border-dashed" style={{ borderColor: 'rgb(var(--peso-savings) / 0.25)' }}>
        <div className="flex items-baseline justify-between">
          <span className="text-[var(--text-small)] font-medium text-foreground/70">You keep</span>
          <span
            className="font-display text-[1.75rem]"
            style={{ color: 'rgb(var(--peso-savings))' }}
          >
            ₱<AnimatedNumber target={14400} />
          </span>
        </div>
        <div className="text-[0.6875rem] text-muted-foreground mt-1">more per year with 8% GIT</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */
function IndexPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate({ to: '/dashboard', replace: true });
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background overflow-hidden" data-testid="index-page">

      {/* ---- HERO ---- */}
      <main>
        <section className="relative" aria-labelledby="hero-heading">
          {/* Subtle background texture */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
            style={{
              backgroundImage: 'radial-gradient(circle at 70% 20%, rgb(var(--brand-600) / 0.03) 0%, transparent 60%)',
            }}
          />

          <div className="relative max-w-6xl mx-auto px-6 sm:px-10 pt-12 sm:pt-16 pb-20 sm:pb-28">
            {/* Logo */}
            <FadeIn className="mb-12 sm:mb-16">
              <span className="font-display text-xl tracking-tight text-foreground" aria-label="TaxKlaro">
                <span className="text-primary" aria-hidden="true">₱</span>TaxKlaro
              </span>
            </FadeIn>

            {/* Two-column hero */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
              {/* Left — copy */}
              <FadeIn delay={100}>
                <h1
                  id="hero-heading"
                  className="font-display text-foreground mb-6"
                  style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', lineHeight: '1.08' }}
                >
                  Your taxes,{' '}
                  <span className="relative inline-block">
                    finally clear
                    <span className="landing-underline-bar" aria-hidden="true" />
                  </span>.
                </h1>
                <p
                  className="text-muted-foreground max-w-md mb-10"
                  style={{ fontSize: 'var(--text-body)', lineHeight: '1.7' }}
                >
                  Compare tax regimes, compute dues, and know exactly which BIR forms to file.
                  Built for Filipino freelancers and small businesses.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <Button
                    size="lg"
                    onClick={() => navigate({ to: '/auth', search: { redirect: '/', mode: 'signup' } })}
                    className="h-12 px-8 rounded-lg text-[var(--text-body)] font-medium group landing-cta"
                  >
                    Start computing
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Button>
                  <span className="text-[0.75rem] text-muted-foreground/60">
                    Free &middot; No credit card
                  </span>
                </div>
              </FadeIn>

              {/* Right — computation preview */}
              <FadeIn delay={300}>
                <TaxComparisonPreview />
              </FadeIn>
            </div>
          </div>
        </section>

        {/* ---- VALUE STRIP ---- */}
        <FadeIn>
          <section
            className="relative py-16 sm:py-20"
            style={{ backgroundColor: 'rgb(var(--brand-600))' }}
            aria-label="Key features"
          >
            <div className="max-w-6xl mx-auto px-6 sm:px-10">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8 text-white">
                <div>
                  <h3 className="font-display text-[2rem] sm:text-[2.5rem] leading-none mb-3">8% vs Graduated</h3>
                  <p className="text-white/75 text-[var(--text-small)] leading-relaxed">
                    Side-by-side regime comparison. OSD vs itemized deductions. See which path saves the most.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-[2rem] sm:text-[2.5rem] leading-none mb-3">1701, 2551Q</h3>
                  <p className="text-white/75 text-[var(--text-small)] leading-relaxed">
                    Know exactly which BIR forms to file based on your income type and registration.
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-[2rem] sm:text-[2.5rem] leading-none mb-3">In seconds</h3>
                  <p className="text-white/75 text-[var(--text-small)] leading-relaxed">
                    Fill in income, deductions, and withholding. Get your tax due or refund instantly.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* ---- CLOSING CTA ---- */}
        <FadeIn>
          <section className="py-20 sm:py-28" aria-labelledby="cta-heading">
            <div className="max-w-6xl mx-auto px-6 sm:px-10 text-center">
              <h2
                id="cta-heading"
                className="font-display text-foreground mb-4"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', lineHeight: '1.15' }}
              >
                Stop guessing your taxes.
              </h2>
              <p className="text-muted-foreground text-[var(--text-body)] mb-8 max-w-md mx-auto">
                Join freelancers and small business owners who compute with confidence.
              </p>
              <Button
                size="lg"
                onClick={() => navigate({ to: '/auth', search: { redirect: '/', mode: 'signup' } })}
                className="h-12 px-8 w-full sm:w-auto rounded-lg text-[var(--text-body)] font-medium group landing-cta"
              >
                Get started — it's free
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Button>
            </div>
          </section>
        </FadeIn>
      </main>

      {/* ---- FOOTER ---- */}
      <footer className="border-t border-border/40 py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-[0.75rem] text-muted-foreground/50">
            &copy; {new Date().getFullYear()} TaxKlaro
          </span>
          <span className="text-[0.75rem] text-muted-foreground/50">
            Philippine income tax computation
          </span>
        </div>
      </footer>
    </div>
  );
}

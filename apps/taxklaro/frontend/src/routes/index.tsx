import { createRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { rootRoute } from './__root'
import { useAuth } from '../hooks/useAuth'
import { QuickCalculator } from '../components/landing/QuickCalculator'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export const IndexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
})

function IndexPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showGate, setShowGate] = useState(false)

  useEffect(() => {
    if (user) {
      navigate({ to: '/computations', replace: true })
    }
  }, [user, navigate])

  if (user) return null

  return (
    <div className="flex flex-col items-center min-h-screen bg-zinc-950 px-6 py-16" data-testid="index-page">
      <div className="text-center mb-10">
        <span className="text-[32px] font-bold text-zinc-50 mb-2 block">TaxKlaro</span>
        <p className="text-base text-zinc-400 max-w-md mx-auto">
          Find the best tax regime for your situation. Philippine tax computation for freelancers and professionals.
        </p>
      </div>

      <QuickCalculator onSignupGate={() => setShowGate(true)} />

      <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
        <button
          onClick={() => navigate({ to: '/auth', search: { redirect: '/', mode: 'signin' } })}
          className="flex items-center gap-2 h-10 px-6 rounded-lg bg-zinc-50 text-zinc-900 text-sm font-medium hover:bg-zinc-200 transition-colors"
        >
          Sign In <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
        <button
          onClick={() => navigate({ to: '/auth', search: { redirect: '/', mode: 'signup' } })}
          className="h-10 px-6 rounded-lg border border-zinc-700 text-zinc-400 text-sm font-medium hover:border-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Create account
        </button>
      </div>

      {/* Signup gate modal */}
      <Dialog open={showGate} onOpenChange={setShowGate}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-zinc-50">Create a Free Account</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Sign up to save your results and run unlimited detailed computations.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-4">
            <Button onClick={() => navigate({ to: '/auth', search: { redirect: '/', mode: 'signup' } })}>
              Create Account
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: '/auth', search: { redirect: '/', mode: 'signin' } })}>
              Sign In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

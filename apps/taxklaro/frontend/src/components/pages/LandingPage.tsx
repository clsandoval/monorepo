// LandingPage: renders the public landing / index route
// Route logic lives in src/routes/index.tsx
import { useNavigate } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 px-6">
      <h1 className="font-display text-zinc-50 text-4xl mb-3">TaxKlaro</h1>
      <p className="text-sm text-zinc-400 mb-8 text-center max-w-sm">
        Philippine income tax computation for freelancers and professionals.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          onClick={() => navigate({ to: '/auth', search: { redirect: '/', mode: 'signin' } })}
          className="h-10 px-6"
        >
          Sign In <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate({ to: '/auth', search: { redirect: '/', mode: 'signup' } })}
          className="h-10 px-6"
        >
          Create account
        </Button>
      </div>
    </div>
  );
}

export default LandingPage;

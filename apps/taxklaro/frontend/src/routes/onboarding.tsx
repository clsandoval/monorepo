import { createRoute, useNavigate } from '@tanstack/react-router';
import { publicRootRoute } from './__root';
import { authGuard } from '../lib/auth-guard';
import { supabase } from '../lib/supabase';
import { OnboardingForm } from '../components/onboarding/OnboardingForm';

export const OnboardingRoute = createRoute({
  getParentRoute: () => publicRootRoute,
  path: '/onboarding',
  beforeLoad: authGuard,
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();

  async function handleCreateOrg(name: string, slug: string) {
    const { data, error } = await supabase.rpc('create_org_with_member', {
      org_name: name,
      org_slug: slug,
    });

    if (error || !data) return;

    navigate({ to: '/' });
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-background"
      data-testid="onboarding-page"
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-[22px] font-bold text-foreground">TaxKlaro</span>
          <p className="text-sm text-muted-foreground mt-1">Set up your firm to get started.</p>
        </div>
        <div className="bg-background rounded-xl p-6 sm:p-8 border border-border">
          <OnboardingForm onCreateOrg={handleCreateOrg} />
        </div>
      </div>
    </div>
  );
}

// SetupPage: onboarding / org setup page component
// Route logic lives in src/routes/onboarding.tsx
import { OnboardingForm } from '@/components/onboarding/OnboardingForm';

interface SetupPageProps {
  onCreateOrg: (name: string, slug: string) => Promise<void>;
}

export function SetupPage({ onCreateOrg }: SetupPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-950">
      <div className="w-full max-w-md">
        <OnboardingForm onCreateOrg={onCreateOrg} />
      </div>
    </div>
  );
}

export default SetupPage;

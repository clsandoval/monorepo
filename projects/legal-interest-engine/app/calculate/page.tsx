import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { SessionProvider } from '@/components/providers/session-provider';
import { CalculatorClient } from './calculator-client';

export default async function CalculatePage() {
  const session = await getServerSession(authOptions);
  const tier = (session?.user?.tier ?? 'free') as 'free' | 'consumer' | 'professional';

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="font-heading text-3xl font-semibold text-primary mb-2">
                Interest Calculator
              </h1>
              <p className="font-body text-secondary text-sm">
                Nacar-compliant legal interest computation for Philippine courts.
              </p>
            </div>
            <CalculatorClient tier={tier} isAuthenticated={!!session} />
          </div>
        </main>
        <Footer />
      </div>
    </SessionProvider>
  );
}

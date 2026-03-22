import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Header } from '@/components/layout/header';
import { Nav } from '@/components/layout/nav';
import { SessionProvider } from '@/components/providers/session-provider';
import type { Tier } from '@prisma/client';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const tier = session.user.tier as Tier;

  // Map Prisma Tier to nav's simplified pro/free concept
  const navTier: 'free' | 'pro' = tier === 'professional' ? 'pro' : 'free';

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Nav tier={navTier} />
          <main className="flex-1 overflow-y-auto p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ComputationsListClient } from './computations-list-client';

export default async function ComputationsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const userId = session.user.id;

  const computations = await prisma.computation.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-primary mb-1">
            Computations
          </h1>
          <p className="font-body text-secondary text-sm">
            {computations.length} saved computation{computations.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <ComputationsListClient computations={computations} />
    </div>
  );
}

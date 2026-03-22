import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { NewComputationClient } from './new-computation-client';

export default async function NewComputationPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const tier = session.user.tier as 'free' | 'consumer' | 'professional';

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-semibold text-primary mb-1">
          New Computation
        </h1>
        <p className="font-body text-secondary text-sm">
          Compute legal interest and save it to your account.
        </p>
      </div>
      <NewComputationClient tier={tier} />
    </div>
  );
}

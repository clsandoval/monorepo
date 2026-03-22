import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { NewCaseClient } from './new-case-client';

export default async function NewCasePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  if (session.user.tier !== 'professional') {
    redirect('/cases');
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-semibold text-primary mb-1">New Case</h1>
        <p className="font-body text-secondary text-sm">
          Create a case to organize your computations.
        </p>
      </div>
      <NewCaseClient />
    </div>
  );
}

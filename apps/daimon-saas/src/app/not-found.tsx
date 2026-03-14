import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
      <FileQuestion size={48} className="text-gray-400" />
      <h1 className="text-2xl font-semibold text-navy text-center">
        Page not found
      </h1>
      <p className="text-sm text-gray-500 text-center max-w-md">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border bg-[#B4E7DD] text-[#0C1F40] border-[#B4E7DD] hover:bg-[#B4E7DD]/85 transition-colors"
        >
          Go to dashboard
        </Link>
        <Link
          href="/docs"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border bg-transparent text-[#0C1F40] border-transparent hover:bg-[#0C1F40]/6 transition-colors"
        >
          Go to docs
        </Link>
      </div>
    </div>
  );
}

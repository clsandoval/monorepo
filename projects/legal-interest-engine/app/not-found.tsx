import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        <p className="font-mono text-sm text-muted uppercase tracking-widest mb-4">
          404
        </p>
        <h1 className="font-heading text-3xl sm:text-4xl font-semibold text-primary mb-4 leading-tight">
          Page Not Found
        </h1>
        <p className="font-body text-secondary text-base leading-relaxed mb-8">
          The page you are looking for does not exist or has been moved.
          Head back home to continue your work.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-2.5 rounded-md bg-primary text-white font-body font-medium text-sm hover:bg-primary-light transition-colors duration-150"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

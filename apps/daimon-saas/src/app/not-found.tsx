import Link from 'next/link'
import { PublicLayout } from '@/components/layout/public-layout'

export default function NotFound() {
  return (
    <PublicLayout>
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <p className="font-heading text-8xl font-bold tracking-tight text-foreground sm:text-9xl">
          404
        </p>
        <h1 className="mt-4 font-heading text-2xl font-semibold text-foreground sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex gap-3">
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-none bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            Back to home
          </Link>
          <Link
            href="/docs"
            className="inline-flex h-10 items-center justify-center rounded-none border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            Documentation
          </Link>
        </div>
      </div>
    </PublicLayout>
  )
}

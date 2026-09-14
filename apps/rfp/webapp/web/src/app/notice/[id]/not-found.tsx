// 404 for unknown notice ids — same shell, plain way back.
import Link from "next/link";
export default function NoticeNotFound() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-primary">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4">
          <Link href="/" className="text-2xl font-bold lowercase tracking-tight text-primary">bidkita</Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-16 text-center" data-testid="notice-404">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="mt-2 text-xl font-bold">Notice not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">It may have been removed from PhilGEPS, or the link is wrong.</p>
        <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-md bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          Browse open notices
        </Link>
      </main>
    </div>
  );
}

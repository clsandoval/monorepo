// One header frames every detail page: wordmark · compact search · breadcrumb.
// The form GETs / with ?q= — the board already restores a search from the URL.
import Link from "next/link";

export function SiteHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="border-b border-primary">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/"
          className="whitespace-nowrap text-2xl font-bold lowercase tracking-tight text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          bidkita
        </Link>
        <form action="/" className="hidden min-w-0 flex-1 justify-center sm:flex">
          <input name="q" type="search" placeholder="Search open tenders"
            aria-label="Search open tenders"
            className="h-9 w-full max-w-sm rounded-full border border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </form>
        {right ?? <Link href="/" className="shrink-0 text-sm text-muted-foreground hover:text-foreground">← Results</Link>}
      </div>
    </header>
  );
}

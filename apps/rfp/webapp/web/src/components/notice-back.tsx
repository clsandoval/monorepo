"use client";
import Link from "next/link";
// "← Results" goes BACK (preserving search state) when we came from our own results;
// direct/external visitors get a plain link home.
export function BackLink() {
  return (
    <Link href="/" data-testid="back-results"
      onClick={(e) => {
        try {
          if (document.referrer && new URL(document.referrer).origin === location.origin && history.length > 1) {
            e.preventDefault();
            history.back();
          }
        } catch { /* malformed referrer — fall through to href */ }
      }}
      className="inline-flex h-11 items-center gap-1 whitespace-nowrap px-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      ← Results
    </Link>
  );
}

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white border-b border-divider">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-semibold text-charcoal hover:opacity-80 transition-opacity">
          SEC Compliance Navigator
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-body text-charcoal hover:text-sec-blue transition-colors"
          >
            Home
          </Link>
          <Link
            href="/wizard"
            className="text-sm font-body text-charcoal hover:text-sec-blue transition-colors"
          >
            Check Status
          </Link>
        </nav>
      </div>
    </header>
  );
}

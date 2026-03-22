import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role ?? "free";
  const isProUser = role === "pro";

  return (
    <header className="bg-white border-b border-divider">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link
          href={isProUser ? "/dashboard" : "/"}
          className="font-display text-xl font-semibold text-charcoal hover:opacity-80 transition-opacity"
        >
          SEC Compliance Navigator
        </Link>
        <nav className="flex items-center gap-6">
          {isProUser ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-body text-charcoal hover:text-sec-blue transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/reports"
                className="text-sm font-body text-charcoal hover:text-sec-blue transition-colors"
              >
                Reports
              </Link>
              <Link
                href="/settings"
                className="text-sm font-body text-charcoal hover:text-sec-blue transition-colors"
              >
                Settings
              </Link>
            </>
          ) : (
            <>
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
              <Link
                href="/pro"
                className="text-sm font-body font-semibold text-sec-blue hover:text-sec-blue/80 transition-colors"
              >
                Pro
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

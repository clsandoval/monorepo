"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <div className="flex gap-4 border-b border-divider mb-8">
      <Link
        href="/settings"
        className={cn(
          "pb-2.5 font-body text-sm border-b-2 transition-colors",
          pathname === "/settings"
            ? "border-sec-blue text-sec-blue font-semibold"
            : "border-transparent text-gray-secondary hover:text-charcoal"
        )}
      >
        General
      </Link>
      <Link
        href="/settings/billing"
        className={cn(
          "pb-2.5 font-body text-sm border-b-2 transition-colors",
          pathname === "/settings/billing"
            ? "border-sec-blue text-sec-blue font-semibold"
            : "border-transparent text-gray-secondary hover:text-charcoal"
        )}
      >
        Billing
      </Link>
    </div>
  );
}

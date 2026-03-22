"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export function ProNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-divider bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-6">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "py-3 font-body text-sm border-b-2 transition-colors",
                isActive
                  ? "border-sec-blue text-sec-blue font-semibold"
                  : "border-transparent text-gray-secondary hover:text-charcoal"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavProps {
  tier: 'free' | 'pro';
  computationsUsed?: number;
  computationsLimit?: number;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  proOnly?: boolean;
}

function DashboardIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  );
}

function ComputationsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 13h.01M12 13h.01M15 13h.01M4 5a2 2 0 012-2h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5z" />
    </svg>
  );
}

function CasesIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-label="Pro only">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { href: '/computations', label: 'Computations', icon: <ComputationsIcon /> },
  { href: '/cases', label: 'Cases', icon: <CasesIcon />, proOnly: true },
  { href: '/settings', label: 'Settings', icon: <SettingsIcon /> },
];

export function Nav({ tier, computationsUsed, computationsLimit }: NavProps) {
  const pathname = usePathname();
  const isPro = tier === 'pro';

  return (
    <nav
      className="flex flex-col h-full bg-background border-r border-border w-56 shrink-0"
      aria-label="Dashboard navigation"
    >
      <div className="flex-1 py-4 px-2 flex flex-col gap-0.5">
        {navItems.map((item) => {
          const locked = item.proOnly && !isPro;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

          if (locked) {
            return (
              <div
                key={item.href}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-muted/60 cursor-not-allowed select-none"
                title="Pro plan required"
                aria-disabled="true"
              >
                <span className="shrink-0 opacity-50">{item.icon}</span>
                <span className="text-sm font-body flex-1">{item.label}</span>
                <span className="shrink-0 text-muted/60">
                  <LockIcon />
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-body transition-colors duration-150',
                isActive
                  ? 'border-l-2 border-primary bg-primary/5 text-primary font-medium pl-[10px]'
                  : 'text-secondary hover:bg-primary/5 hover:text-primary',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Free tier usage counter */}
      {!isPro && computationsUsed !== undefined && computationsLimit !== undefined && (
        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] tracking-[1.5px] uppercase text-muted font-body font-medium">
              Computations
            </span>
            <span className="text-xs font-mono text-muted">
              {computationsUsed}/{computationsLimit}
            </span>
          </div>
          <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (computationsUsed / computationsLimit) * 100)}%`,
              }}
              role="progressbar"
              aria-valuenow={computationsUsed}
              aria-valuemin={0}
              aria-valuemax={computationsLimit}
            />
          </div>
          <Link
            href="/pricing"
            className="mt-2 block text-xs font-body text-secondary hover:text-primary transition-colors duration-150"
          >
            Upgrade to Pro &rarr;
          </Link>
        </div>
      )}
    </nav>
  );
}

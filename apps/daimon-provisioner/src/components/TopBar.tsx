'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getBriefs } from '@/lib/store';

export function TopBar() {
  const pathname = usePathname();
  const isBriefsPage = pathname === '/';
  const isNewPage = pathname === '/new' || pathname.startsWith('/instances/');

  const [briefCount, setBriefCount] = useState(0);

  useEffect(() => {
    getBriefs().then(briefs => {
      setBriefCount(briefs.length);
    });
  }, [pathname]);

  return (
    <div className="topbar">
      <Link href="/" className="logo">
        <div className="logo-mark">
          <svg viewBox="0 0 16 16" fill="white">
            <path d="M4 3h8a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1zm1 2v2h2V5H5zm4 0v2h2V5H9zM5 9v2h6V9H5z" />
          </svg>
        </div>
        Daimon
      </Link>
      <nav>
        <Link href="/" className={isBriefsPage ? 'active' : ''}>
          Briefs
        </Link>
        <Link href="/new" className={isNewPage ? 'active' : ''}>
          New
        </Link>
      </nav>
      <div className="topbar-right">
        <div className="status-dot" />
        {briefCount} brief{briefCount !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { BriefTable } from '@/components/InstanceTable';
import { getBriefs, deleteBrief } from '@/lib/store';
import { DeploymentBrief } from '@/lib/types';

export default function Home() {
  const [briefs, setBriefs] = useState<DeploymentBrief[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBriefs()
      .then(setBriefs)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <TopBar />
      <div className="content">
        <div className="page-head">
          <h1 className="page-title">Deployment Briefs</h1>
          <Link href="/new" className="new-btn">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
            </svg>
            New Brief
          </Link>
        </div>
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#999', fontSize: '13px' }}>
            Loading briefs...
          </div>
        ) : (
          <BriefTable briefs={briefs} onDelete={async (id) => {
            await deleteBrief(id);
            setBriefs(prev => prev.filter(b => b.id !== id));
          }} />
        )}
      </div>
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { InstanceTable } from '@/components/InstanceTable';
import { getInstances } from '@/lib/store';
import { InstanceConfig } from '@/lib/types';

export default function Home() {
  const [instances, setInstances] = useState<InstanceConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInstances()
      .then(setInstances)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <TopBar />
      <div className="content">
        <div className="page-head">
          <h1 className="page-title">Instances</h1>
          <Link href="/new" className="new-btn">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
            </svg>
            New Instance
          </Link>
        </div>
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#999', fontSize: '13px' }}>
            Loading instances...
          </div>
        ) : (
          <InstanceTable instances={instances} />
        )}
      </div>
    </>
  );
}

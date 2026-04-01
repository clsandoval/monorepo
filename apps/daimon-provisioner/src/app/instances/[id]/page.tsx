'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { ProgressiveBrief } from '@/components/ProgressiveBrief';
import { getBrief, saveBrief } from '@/lib/store';
import { DeploymentBrief } from '@/lib/types';

export default function BriefDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [brief, setBrief] = useState<DeploymentBrief | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getBrief(id).then(loaded => {
      if (!loaded) {
        router.push('/');
        return;
      }
      setBrief(loaded);
    });
  }, [id, router]);

  const save = useCallback((updated: DeploymentBrief) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveBrief(updated), 300);
  }, []);

  const handleBriefChange = useCallback((updated: DeploymentBrief) => {
    setBrief(updated);
    save(updated);
  }, [save]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  if (!brief) return null;

  return (
    <>
      <TopBar />
      <ProgressiveBrief brief={brief} onBriefChange={handleBriefChange} />
    </>
  );
}

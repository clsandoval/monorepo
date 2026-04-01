'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TopBar } from '@/components/TopBar';
import { ProgressiveBrief } from '@/components/ProgressiveBrief';
import { createEmptyBrief, saveBrief } from '@/lib/store';
import { DeploymentBrief } from '@/lib/types';

export default function NewBriefPage() {
  const [brief, setBrief] = useState<DeploymentBrief>(() => createEmptyBrief());
  const savedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback((updated: DeploymentBrief) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveBrief(updated), 300);
  }, []);

  const handleBriefChange = useCallback((updated: DeploymentBrief) => {
    setBrief(updated);
    if (!savedRef.current) savedRef.current = true;
    save(updated);
  }, [save]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return (
    <>
      <TopBar />
      <ProgressiveBrief brief={brief} onBriefChange={handleBriefChange} />
    </>
  );
}

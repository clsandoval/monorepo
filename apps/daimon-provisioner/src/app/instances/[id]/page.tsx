'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { ReactCanvas } from '@/components/ReactCanvas';
import { ChatPanel } from '@/components/ChatPanel';
import { getInstance, saveInstance } from '@/lib/store';
import { InstanceConfig } from '@/lib/types';

export default function InstanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [config, setConfig] = useState<InstanceConfig | null>(null);
  const [jsx, setJsx] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load instance on mount
  useEffect(() => {
    const instance = getInstance(id);
    if (!instance) {
      router.push('/');
      return;
    }
    setConfig(instance);
  }, [id, router]);

  // Auto-save with 300ms debounce
  useEffect(() => {
    if (!config) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      saveInstance(config);
    }, 300);

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [config]);

  function handleChange(updated: InstanceConfig) {
    setConfig(updated);
  }

  if (!config) {
    return null;
  }

  return (
    <>
      <TopBar />
      <div className="main-split">
        <ReactCanvas jsx={jsx} config={config} onConfigChange={handleChange} />
        <ChatPanel config={config} onConfigChange={handleChange} onRender={setJsx} />
      </div>
    </>
  );
}

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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

  useEffect(() => {
    getInstance(id).then(instance => {
      if (!instance) {
        router.push('/');
        return;
      }
      setConfig(instance);
    });
  }, [id, router]);

  const handleChange = useCallback((updated: InstanceConfig) => {
    setConfig(updated);

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      saveInstance(updated);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

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

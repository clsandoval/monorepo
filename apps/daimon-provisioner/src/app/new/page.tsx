'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TopBar } from '@/components/TopBar';
import { ReactCanvas } from '@/components/ReactCanvas';
import { ChatPanel } from '@/components/ChatPanel';
import { createEmptyConfig, saveInstance } from '@/lib/store';
import { InstanceConfig } from '@/lib/types';

export default function NewInstancePage() {
  const [config, setConfig] = useState<InstanceConfig>(() => createEmptyConfig());
  const [jsx, setJsx] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save as draft immediately on creation
  useEffect(() => {
    saveInstance(config);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

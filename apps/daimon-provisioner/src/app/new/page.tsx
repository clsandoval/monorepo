'use client';

import { useState, useEffect, useRef } from 'react';
import { TopBar } from '@/components/TopBar';
import { ReactCanvas } from '@/components/ReactCanvas';
import { ChatPanel } from '@/components/ChatPanel';
import { createEmptyConfig, saveInstance } from '@/lib/store';
import { InstanceConfig } from '@/lib/types';

export default function NewInstancePage() {
  const [config, setConfig] = useState<InstanceConfig>(() => createEmptyConfig());
  const [jsx, setJsx] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save with 300ms debounce
  useEffect(() => {
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

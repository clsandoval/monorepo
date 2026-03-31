'use client';

import { useState, useEffect, useRef } from 'react';
import { TopBar } from '@/components/TopBar';
import { ConfigPanel } from '@/components/ConfigPanel';
import { ChatPanel } from '@/components/ChatPanel';
import { createEmptyConfig, saveInstance } from '@/lib/store';
import { InstanceConfig } from '@/lib/types';

export default function NewInstancePage() {
  const [config, setConfig] = useState<InstanceConfig>(() => createEmptyConfig());
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
        <ConfigPanel config={config} onChange={handleChange} isNew />
        <ChatPanel config={config} onConfigChange={handleChange} />
      </div>
    </>
  );
}

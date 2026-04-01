'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TopBar } from '@/components/TopBar';
import { ReactCanvas } from '@/components/ReactCanvas';
import { ChatPanel } from '@/components/ChatPanel';
import { createEmptyConfig, saveInstance } from '@/lib/store';
import { InstanceConfig, ChatMessage } from '@/lib/types';

export default function NewInstancePage() {
  const [config, setConfig] = useState<InstanceConfig>(() => createEmptyConfig());
  const [jsx, setJsx] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const savedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback((updated: InstanceConfig) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      saveInstance(updated);
    }, 300);
  }, []);

  const handleRender = useCallback((newJsx: string) => {
    setJsx(newJsx);
    // First render triggers the initial save
    if (!savedRef.current) {
      savedRef.current = true;
    }
    setConfig(prev => {
      const updated = { ...prev, current_jsx: newJsx };
      save(updated);
      return updated;
    });
  }, [save]);

  const handleChange = useCallback((updated: InstanceConfig) => {
    setConfig(updated);
    if (savedRef.current) {
      save(updated);
    }
  }, [save]);

  const handleMessagesChange = useCallback((msgs: ChatMessage[]) => {
    setMessages(msgs);
    if (savedRef.current) {
      setConfig(prev => {
        const updated = { ...prev, chat_messages: msgs };
        save(updated);
        return updated;
      });
    }
  }, [save]);

  // Cleanup timer on unmount
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
        <ChatPanel
          config={config}
          onConfigChange={handleChange}
          onRender={handleRender}
          onMessagesChange={handleMessagesChange}
        />
      </div>
    </>
  );
}

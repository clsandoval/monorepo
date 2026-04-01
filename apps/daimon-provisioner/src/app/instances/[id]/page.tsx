'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { ReactCanvas } from '@/components/ReactCanvas';
import { ChatPanel } from '@/components/ChatPanel';
import { getInstance, saveInstance } from '@/lib/store';
import { InstanceConfig, ChatMessage } from '@/lib/types';

export default function InstanceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [config, setConfig] = useState<InstanceConfig | null>(null);
  const [jsx, setJsx] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load instance on mount
  useEffect(() => {
    getInstance(id).then(instance => {
      if (!instance) {
        router.push('/');
        return;
      }
      setConfig(instance);
      if (instance.current_jsx) {
        setJsx(instance.current_jsx);
      }
      if (instance.chat_messages?.length > 0) {
        setInitialMessages(instance.chat_messages);
      }
    });
  }, [id, router]);

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
    setConfig(prev => {
      if (!prev) return prev;
      const updated = { ...prev, current_jsx: newJsx };
      save(updated);
      return updated;
    });
  }, [save]);

  const handleChange = useCallback((updated: InstanceConfig) => {
    setConfig(updated);
    save(updated);
  }, [save]);

  const handleMessagesChange = useCallback((msgs: ChatMessage[]) => {
    setConfig(prev => {
      if (!prev) return prev;
      const updated = { ...prev, chat_messages: msgs };
      save(updated);
      return updated;
    });
  }, [save]);

  // Cleanup timer on unmount
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
        <ChatPanel
          config={config}
          onConfigChange={handleChange}
          onRender={handleRender}
          initialMessages={initialMessages}
          onMessagesChange={handleMessagesChange}
        />
      </div>
    </>
  );
}

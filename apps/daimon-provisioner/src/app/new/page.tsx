'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { TopBar } from '@/components/TopBar';
import { ReactCanvas } from '@/components/ReactCanvas';
import { ChatPanel } from '@/components/ChatPanel';
import { createEmptyBrief, saveBrief } from '@/lib/store';
import { DeploymentBrief, Annotation } from '@/lib/types';

export default function NewBriefPage() {
  const [brief, setBrief] = useState<DeploymentBrief>(() => createEmptyBrief());
  const [jsx, setJsx] = useState<string | null>(null);
  const savedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback((updated: DeploymentBrief) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      saveBrief(updated);
    }, 300);
  }, []);

  const handleRender = useCallback((newJsx: string) => {
    setJsx(newJsx);
    if (!savedRef.current) {
      savedRef.current = true;
    }
    setBrief(prev => {
      const updated = { ...prev, current_jsx: newJsx };
      save(updated);
      return updated;
    });
  }, [save]);

  const handleBriefChange = useCallback((updated: DeploymentBrief) => {
    setBrief(updated);
    if (savedRef.current) {
      save(updated);
    }
  }, [save]);

  const handleAnnotationAdd = useCallback((section: string, text: string) => {
    const annotation: Annotation = {
      id: crypto.randomUUID(),
      section,
      text,
      resolved: false,
    };
    setBrief(prev => {
      const updated = { ...prev, annotations: [...prev.annotations, annotation] };
      if (savedRef.current) {
        save(updated);
      }
      return updated;
    });
  }, [save]);

  const handleMessagesChange = useCallback((msgs: import('@/lib/types').ChatMessage[]) => {
    setBrief(prev => {
      const updated = { ...prev, chat_messages: msgs };
      if (savedRef.current) {
        save(updated);
      }
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

  return (
    <>
      <TopBar />
      <div className="main-split">
        <ReactCanvas
          jsx={jsx}
          brief={brief}
          onBriefChange={handleBriefChange}
          onAnnotationAdd={handleAnnotationAdd}
        />
        <ChatPanel
          brief={brief}
          onBriefChange={handleBriefChange}
          onRender={handleRender}
          onMessagesChange={handleMessagesChange}
        />
      </div>
    </>
  );
}

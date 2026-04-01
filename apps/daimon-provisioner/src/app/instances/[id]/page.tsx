'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TopBar } from '@/components/TopBar';
import { ReactCanvas } from '@/components/ReactCanvas';
import { ChatPanel } from '@/components/ChatPanel';
import { getBrief, saveBrief } from '@/lib/store';
import { DeploymentBrief, Annotation, ChatMessage } from '@/lib/types';

export default function BriefDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [brief, setBrief] = useState<DeploymentBrief | null>(null);
  const [jsx, setJsx] = useState<string | null>(null);
  const [initialMessages, setInitialMessages] = useState<ChatMessage[]>([]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load brief on mount
  useEffect(() => {
    getBrief(id).then(loaded => {
      if (!loaded) {
        router.push('/');
        return;
      }
      setBrief(loaded);
      if (loaded.current_jsx) {
        setJsx(loaded.current_jsx);
      }
      if (loaded.chat_messages?.length > 0) {
        setInitialMessages(loaded.chat_messages);
      }
    });
  }, [id, router]);

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
    setBrief(prev => {
      if (!prev) return prev;
      const updated = { ...prev, current_jsx: newJsx };
      save(updated);
      return updated;
    });
  }, [save]);

  const handleBriefChange = useCallback((updated: DeploymentBrief) => {
    setBrief(updated);
    save(updated);
  }, [save]);

  const handleAnnotationAdd = useCallback((section: string, text: string) => {
    const annotation: Annotation = {
      id: crypto.randomUUID(),
      section,
      text,
      resolved: false,
    };
    setBrief(prev => {
      if (!prev) return prev;
      const updated = { ...prev, annotations: [...prev.annotations, annotation] };
      save(updated);
      return updated;
    });
  }, [save]);

  const handleMessagesChange = useCallback((msgs: ChatMessage[]) => {
    setBrief(prev => {
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

  if (!brief) {
    return null;
  }

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
          initialMessages={initialMessages}
          onMessagesChange={handleMessagesChange}
        />
      </div>
    </>
  );
}

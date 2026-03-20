import { useState, useEffect, useCallback } from 'react';
import type { SessionSummary } from '../types';

export function useSessions() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      setSessions(data);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateSessionTitle = useCallback((title: string) => {
    setSessions((prev) => {
      if (prev.length === 0) return prev;
      // Update the most recent session's title
      return [{ ...prev[0], title }, ...prev.slice(1)];
    });
  }, []);

  return { sessions, loading, refresh, updateSessionTitle };
}

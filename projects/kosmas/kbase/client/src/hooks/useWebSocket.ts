import { useEffect, useRef, useCallback, useState } from 'react';
import type { ClientMessage, ServerMessage } from '../types';

const RECONNECT_DELAY = 2000;

interface UseWebSocketOptions {
  onMessage: (msg: ServerMessage) => void;
  onReconnect?: () => void;
}

export function useWebSocket({ onMessage, onReconnect }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;
  const onReconnectRef = useRef(onReconnect);
  onReconnectRef.current = onReconnect;
  const [connected, setConnected] = useState(false);
  const hasConnectedBefore = useRef(false);

  useEffect(() => {
    let reconnectTimeout: ReturnType<typeof setTimeout>;
    let mounted = true;

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (mounted) {
          setConnected(true);
          if (hasConnectedBefore.current) {
            onReconnectRef.current?.();
          }
          hasConnectedBefore.current = true;
        }
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as ServerMessage;
          onMessageRef.current(msg);
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (mounted) {
          setConnected(false);
          reconnectTimeout = setTimeout(connect, RECONNECT_DELAY);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      mounted = false;
      clearTimeout(reconnectTimeout);
      wsRef.current?.close();
    };
  }, []);

  const send = useCallback((msg: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { send, connected };
}

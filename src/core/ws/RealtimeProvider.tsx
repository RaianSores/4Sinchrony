import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useAuthStore } from '../auth/store/useAuthStore';

type EventHandler = (data: unknown) => void;

interface RealtimeContextValue {
  subscribe: (event: string, handler: EventHandler) => () => void;
  emit: (event: string, data: unknown) => void;
  isConnected: boolean;
}

const RealtimeContext = createContext<RealtimeContextValue>({
  subscribe: () => () => {},
  emit: () => {},
  isConnected: false,
});

export const useRealtime = () => useContext(RealtimeContext);

interface RealtimeProviderProps {
  children: ReactNode;
  url?: string;
}

export const RealtimeProvider = ({ children, url }: RealtimeProviderProps) => {
  const token = useAuthStore(state => state.token);
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, Set<EventHandler>>>(new Map());
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (!token) return;

    const wsUrl = url || process.env.EXPO_PUBLIC_WS_URL || 'ws://10.0.2.2:3333/ws';
    const ws = new WebSocket(`${wsUrl}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => { isConnectedRef.current = true; };
    ws.onclose = () => { isConnectedRef.current = false; };
    ws.onerror = () => { isConnectedRef.current = false; };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const { type, payload } = parsed;
        const handlers = handlersRef.current.get(type);
        if (handlers) {
          handlers.forEach(handler => handler(payload));
        }
      } catch {}
    };

    return () => {
      ws.close();
      wsRef.current = null;
      isConnectedRef.current = false;
    };
  }, [token, url]);

  const subscribe = (event: string, handler: EventHandler): (() => void) => {
    if (!handlersRef.current.has(event)) {
      handlersRef.current.set(event, new Set());
    }
    handlersRef.current.get(event)!.add(handler);

    return () => {
      handlersRef.current.get(event)?.delete(handler);
    };
  };

  const emit = (event: string, data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: event, payload: data }));
    }
  };

  return (
    <RealtimeContext.Provider value={{ subscribe, emit, isConnected: isConnectedRef.current }}>
      {children}
    </RealtimeContext.Provider>
  );
};

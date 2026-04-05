import { useEffect, useRef, useState } from 'react';
import {
  connectEventsSocket,
  getRecentEvents,
  type RealtimeEvent,
} from '../apiClient';

export function useRealtimeEvents() {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      const initial = await getRecentEvents(100);
      if (!mounted) return;

      setEvents(initial.events);

      const connect = (since: number) => {
        const ws = connectEventsSocket(
          since,
          (event) => {
            setEvents((prev) => [...prev, event].slice(-500));
          },
          () => setIsConnected(true),
          () => {
            setIsConnected(false);
            if (mounted) {
              reconnectRef.current = window.setTimeout(async () => {
                const latest = await getRecentEvents(1);
                connect(latest.latest_seq);
              }, 1500);
            }
          },
          () => setIsConnected(false),
        );
        wsRef.current = ws;
      };

      connect(initial.latest_seq);
    };

    start().catch(console.error);

    return () => {
      mounted = false;
      if (reconnectRef.current) window.clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, []);

  return { events, isConnected };
}

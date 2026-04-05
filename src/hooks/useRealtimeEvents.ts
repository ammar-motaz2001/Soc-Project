import { useEffect, useRef, useState } from 'react';
import {
  connectEventsSocket,
  getRecentEvents,
  shouldAttemptRealtimeWebSocket,
  type RealtimeEvent,
} from '../apiClient';

/** Used when WebSocket is unavailable (e.g. Vercel); faster than WS but not instant. */
const POLL_MS = 3500;

function eventSeq(e: RealtimeEvent): number | undefined {
  return typeof e.seq === 'number' ? e.seq : undefined;
}

export function useRealtimeEvents() {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const pollRef = useRef<number | null>(null);
  const everConnectedRef = useRef(false);
  const lastSeqRef = useRef(0);

  useEffect(() => {
    let mounted = true;

    const clearReconnect = () => {
      if (reconnectRef.current != null) {
        window.clearTimeout(reconnectRef.current);
        reconnectRef.current = null;
      }
    };

    const stopPolling = () => {
      if (pollRef.current != null) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };

    const mergeNewBySeq = (incoming: RealtimeEvent[]) => {
      const withSeq = incoming.filter((e) => {
        const s = eventSeq(e);
        return s != null && s > lastSeqRef.current;
      });
      if (withSeq.length === 0) {
        return;
      }
      const maxSeq = Math.max(...withSeq.map((e) => eventSeq(e) ?? 0));
      lastSeqRef.current = Math.max(lastSeqRef.current, maxSeq);
      setEvents((prev) => [...prev, ...withSeq].slice(-500));
    };

    const runPoll = async () => {
      try {
        const data = await getRecentEvents(100);
        if (!mounted) {
          return;
        }
        mergeNewBySeq(data.events ?? []);
        lastSeqRef.current = Math.max(lastSeqRef.current, data.latest_seq ?? 0);
      } catch {
        /* ignore */
      }
    };

    const startPolling = () => {
      stopPolling();
      void runPoll();
      pollRef.current = window.setInterval(() => void runPoll(), POLL_MS);
    };

    const start = async () => {
      try {
        const initial = await getRecentEvents(100);
        if (!mounted) {
          return;
        }
        setEvents(initial.events ?? []);
        lastSeqRef.current = initial.latest_seq ?? 0;
      } catch {
        if (!mounted) {
          return;
        }
        setEvents([]);
        lastSeqRef.current = 0;
      }

      if (!shouldAttemptRealtimeWebSocket()) {
        startPolling();
        return;
      }

      const tryWs = () => {
        if (!mounted) {
          return;
        }
        clearReconnect();
        let openedThisAttempt = false;
        const ws = connectEventsSocket(
          lastSeqRef.current,
          (event) => {
            setEvents((prev) => [...prev, event].slice(-500));
            const s = eventSeq(event);
            if (s != null) {
              lastSeqRef.current = Math.max(lastSeqRef.current, s);
            }
          },
          () => {
            openedThisAttempt = true;
            everConnectedRef.current = true;
            setIsConnected(true);
          },
          () => {
            setIsConnected(false);
            if (!mounted) {
              return;
            }
            if (!openedThisAttempt && !everConnectedRef.current) {
              startPolling();
              return;
            }
            reconnectRef.current = window.setTimeout(async () => {
              try {
                const latest = await getRecentEvents(1);
                if (!mounted) {
                  return;
                }
                lastSeqRef.current = latest.latest_seq ?? lastSeqRef.current;
              } catch {
                /* keep lastSeqRef */
              }
              if (mounted) {
                tryWs();
              }
            }, 3000);
          },
          () => setIsConnected(false),
        );
        wsRef.current = ws;
      };

      tryWs();
    };

    void start();

    return () => {
      mounted = false;
      clearReconnect();
      stopPolling();
      wsRef.current?.close();
    };
  }, []);

  return { events, isConnected };
}

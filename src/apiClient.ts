const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? 'https://python-model-sigma.vercel.app';

/** Base URL for dashboard `/alerts` list (v8dl service). */
const ALERTS_LIST_BASE =
  process.env.NEXT_PUBLIC_ALERTS_API_URL ?? 'https://python-model-v8dl.vercel.app';

export interface RealtimeEvent {
  seq?: number;
  kind?: string;
  timestamp?: string;
  [key: string]: unknown;
}

export interface RecentEventsResponse {
  events: RealtimeEvent[];
  count: number;
  latest_seq: number;
}

async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export async function getHealth() {
  const res = await fetch(`${API_BASE}/`);
  return parseJson<{ message: string }>(res);
}

export async function getRecentEvents(limit = 100) {
  const res = await fetch(`${API_BASE}/events/recent?limit=${limit}`);
  return parseJson<RecentEventsResponse>(res);
}

export function connectEventsSocket(
  since: number,
  onEvent: (event: RealtimeEvent) => void,
  onOpen?: () => void,
  onClose?: () => void,
  onError?: (ev: Event) => void,
) {
  const wsBase = API_BASE.replace('https://', 'wss://').replace('http://', 'ws://');
  const ws = new WebSocket(`${wsBase}/ws/events?since=${since}`);
  ws.onopen = () => onOpen?.();
  ws.onclose = () => onClose?.();
  ws.onerror = (ev) => onError?.(ev);
  ws.onmessage = (message) => {
    const payload = JSON.parse(message.data) as RealtimeEvent;
    if (payload.kind === 'system') return;
    onEvent(payload);
  };
  return ws;
}

// Detection APIs
export async function postDetect(body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJson<Record<string, unknown>>(res);
}

export async function postAutomatedDetect(body: Record<string, unknown>) {
  const res = await fetch(`${API_BASE}/automated-actions/detect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseJson<Record<string, unknown>>(res);
}

// Actions APIs
export async function postBlockIp(ip: string, reason?: string) {
  const res = await fetch(`${API_BASE}/actions/block-ip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip, reason }),
  });
  return parseJson<Record<string, unknown>>(res);
}

export async function postUnblockIp(ip: string, reason?: string) {
  const res = await fetch(`${API_BASE}/actions/unblock-ip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip, reason }),
  });
  return parseJson<Record<string, unknown>>(res);
}

// --- Dashboard alerts API (python-model-v8dl) ---

export interface RemoteDashboardAlert {
  id: string;
  device_id?: string;
  is_closed: boolean;
  type: string;
  attack_counts: Record<string, number>;
  created_at: string;
  priority: string;
  title: string;
  true_positive_count: number;
  updated_at: string;
  false_positive_count: number;
}

export interface RemoteDashboardAlertsResponse {
  alerts: RemoteDashboardAlert[];
}

export async function getDashboardAlerts() {
  const res = await fetch(`${ALERTS_LIST_BASE}/alerts`);
  return parseJson<RemoteDashboardAlertsResponse>(res);
}

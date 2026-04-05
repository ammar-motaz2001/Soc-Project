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
  const text = await res.text();
  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    if (text) {
      try {
        const errBody = JSON.parse(text) as { detail?: unknown };
        if (errBody?.detail != null) {
          message = String(errBody.detail);
        } else {
          message = `${message}: ${text}`;
        }
      } catch {
        message = `${message}: ${text}`;
      }
    }
    throw new Error(message);
  }
  if (!text) return {} as T;
  return JSON.parse(text) as T;
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
  device_ip?: string;
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
  total_alerts?: number;
  total_closed?: number;
  alerts: RemoteDashboardAlert[];
}

export async function getDashboardAlerts(): Promise<RemoteDashboardAlertsResponse> {
  const res = await fetch(`${ALERTS_LIST_BASE}/alerts`, {
    headers: { accept: 'application/json' },
  });
  const body = await parseJson<RemoteDashboardAlertsResponse | RemoteDashboardAlert[]>(res);
  if (Array.isArray(body)) {
    return { alerts: body };
  }
  return {
    ...body,
    alerts: body.alerts ?? [],
  };
}

export async function patchCloseAlertAsTruePositive(alertId: string) {
  const res = await fetch(
    `${ALERTS_LIST_BASE}/alerts/${encodeURIComponent(alertId)}/close-as-true-positive`,
    { method: 'PATCH', headers: { accept: 'application/json' } },
  );
  return parseJson<Record<string, unknown>>(res);
}

export async function patchCloseAlertAsFalsePositive(alertId: string) {
  const res = await fetch(
    `${ALERTS_LIST_BASE}/alerts/${encodeURIComponent(alertId)}/close-as-false-positive`,
    { method: 'PATCH', headers: { accept: 'application/json' } },
  );
  return parseJson<Record<string, unknown>>(res);
}

// --- Automated actions (python-model-v8dl) ---

export interface RemoteAutomatedActionEnforcement {
  enabled?: boolean;
  attempted?: boolean;
  applied?: boolean;
  message?: string;
}

export interface RemoteAutomatedAction {
  id: string;
  action: string;
  ip: string;
  reason: string;
  status: string;
  device_id: string;
  alert_id: string | null;
  created_at: string;
  enforcement?: RemoteAutomatedActionEnforcement;
}

export interface RemoteAutomatedActionsResponse {
  automated_actions: RemoteAutomatedAction[];
}

export async function getAutomatedActionsList() {
  const res = await fetch(`${ALERTS_LIST_BASE}/automated-actions`, {
    headers: { accept: 'application/json' },
  });
  return parseJson<RemoteAutomatedActionsResponse>(res);
}

# Frontend guide: detect → UI via `/ws/events`

How it fits together:

- `POST /detect`, `POST /automated-actions/detect`, `GET /detect/packet-auto`, etc. run the models and call `publish_event(...)`.
- Each event is appended to an in-memory ring buffer (`EVENT_HISTORY`) with a monotonic `seq`.
- `GET /events/recent` returns the tail of that buffer + `latest_seq` (good for first paint).
- WebSocket `/ws/events` sends a small system message on connect, optionally replays past events, then polls the same buffer every ~1s and pushes any event with `seq > last seen`.

So the **detect → UI** path is: HTTP detect succeeds → event lands in `EVENT_HISTORY` → WebSocket delivers JSON to the browser (on the same server process that handled the detect).

### Single stream — there is no separate “detect WebSocket”

You **do not** call a different WebSocket for detections. You open **`/ws/events` once**, parse each JSON message, and **filter** on `kind`, `attack_detected`, etc.

In **`main.py`**, `publish_event()` appends every event to **`EVENT_HISTORY`**; the WebSocket loop pushes **anything new** to connected clients. Detection-related traffic includes at least:

| `kind` | Meaning |
| ------ | ------- |
| **`ddos`** | DDoS detection: `attack_detected` true/false, `attack_type`, `client_ip`, … |
| **`bruteforce`** | Brute-force detection: same pattern |
| **`alert`** | e.g. alert closed, with `"action": "closed"`, etc. |
| **`system`** | First message `type: "connected"`, or `pong` after you send `ping` |

So **“detect via WebSocket”** = connect to `/ws/events`, parse JSON, filter on `kind` / `attack_detected`.

**Requirements**

- API must be running (e.g. `uvicorn main:app …`).
- New detection messages only appear after something hits the detector (e.g. **`POST /detect`**). **Benign** runs also publish (`attack_detected: false`) unless you filter them out in the UI.

**Example: only real attacks (browser)**

```js
const ws = new WebSocket('ws://localhost:8000/ws/events?since=0');
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.kind === 'system') return;
  if (msg.attack_detected === true) {
    console.log('Detection:', msg.kind, msg);
  }
};
```

**Example: Python (`websockets` package)**

```bash
pip install websockets
```

```python
import asyncio
import json
import websockets

async def main():
    uri = "ws://localhost:8000/ws/events?since=0"
    async with websockets.connect(uri) as ws:
        async for raw in ws:
            msg = json.loads(raw)
            if msg.get("kind") == "system":
                continue
            if msg.get("attack_detected") is True:
                print("detection:", msg)

asyncio.run(main())
```

*(Spotting WebSocket traffic on the wire — pcap / firewall / IDS — is different from this app’s dashboard stream.)*

**Deployment note:** On Vercel / multiple workers, HTTP and WebSocket may hit different instances with separate memory, so live detect events might not show on every WS connection. For reliable realtime with scale-out, you’d need a shared bus (e.g. Redis pub/sub subscribed by a dedicated WS service). Locally with one uvicorn process, this works as described.

**This repo:** Realtime uses `NEXT_PUBLIC_API_URL` (`src/apiClient.ts`). Vite loads `.env` via `loadEnv` in `vite.config.ts`. `useRealtimeEvents` calls `getRecentEvents` then, when supported, `connectEventsSocket`. **If the API host is `*.vercel.app`, the app does not open a WebSocket at all** (`shouldAttemptRealtimeWebSocket()` in `apiClient.ts`) because that connection almost always fails on Vercel; it uses **polling** `GET /events/recent` every **~3.5s** with an immediate first poll—detections still arrive via the same `EVENT_HISTORY` tail. Use **`NEXT_PUBLIC_FORCE_WEBSOCKET=true`** to try WS anyway (e.g. testing). Use **`NEXT_PUBLIC_DISABLE_WEBSOCKET=true`** to force polling on any host.

### “WebSocket connection to wss://…/ws/events failed”

Typical causes:

1. **Wrong host in the bundle** — If the app still uses `python-model-sigma.vercel.app` but your API lives elsewhere, ensure `.env` has `NEXT_PUBLIC_API_URL=…` and restart the dev server (Vite bakes env at startup).
2. **Vercel / multi-worker** — Long-lived WebSockets often do not work the same way as on a single `uvicorn` process; the upgrade may fail or the edge may not proxy WS. Use a long-running host for WS, or rely on **HTTP polling** (this app does that automatically when the socket never connects).
3. **Firewall / mixed content** — A page on `https://` must use `wss://` (the client does this when `NEXT_PUBLIC_API_URL` is `https://…`).

---

## 1. Bootstrap HTTP (avoid missing recent events)

Before (or in parallel with) opening the socket:

```http
GET https://your-api.example.com/events/recent?limit=100
```

Response shape:

```json
{
  "events": [
    { "kind": "ddos", "seq": 42, "timestamp": "...", "...": "..." }
  ],
  "count": 100,
  "latest_seq": 142
}
```

Render events in your UI, then remember `latest_seq` for the socket.

---

## 2. WebSocket URL

Use `wss://` when the site is `https://`:

```ts
function apiToWsBase(httpBase: string): string {
  return httpBase.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
}

const API = 'https://python-model-v8dl.vercel.app';
const wsUrl = `${apiToWsBase(API)}/ws/events?since=${latestSeq}`;
// Or replay last N instead of since:
// const wsUrl = `${apiToWsBase(API)}/ws/events?replay=50`;
```

Query params (from your server):

| Param    | Meaning                                                                 |
| -------- | ----------------------------------------------------------------------- |
| `replay` | On connect, send the last N events (default 50, capped by server max).   |
| `since`  | Send all events with `seq > since`, then live (use `latest_seq` from `/events/recent` to skip duplicates). |

---

## 3. Messages you’ll receive

**First message (always):**

```json
{
  "kind": "system",
  "type": "connected",
  "latest_seq": 142,
  "replayed": 50
}
```

**Detect-related** (after each DDoS / brute-force classification):

- **`kind: "ddos"`** — DDoS path  
  - **Attack:** `attack_detected: true`, `attack_type: "DDoS"`, `client_ip`, optional `device_id`, `alert_id`, ports…  
  - **Benign:** `attack_detected: false`, `attack_type: "Benign"`, `client_ip`, …

- **`kind: "bruteforce"`** — Brute-force path  
  - **Attack:** `attack_detected: true`, `attack_type: "BruteForce"`, `client_ip`, `username`, `foreign_ip`, `password_count`, optional `device_id`, `alert_id`  
  - **Benign:** `attack_detected: false`, `attack_type: "Benign"`, …

Every event also has `seq` and `timestamp` (added by the server).

**Other kinds you may want to handle:**

- **`kind: "action"`** — block / unblock / isolate / unisolate (`action`, `ip`, …)
- **`kind: "alert"`** — e.g. `action: "closed"` after PATCH close-as-FP/TP (`alert` object, `close_verdict`, …)

**Keepalive:** send text `ping`; server replies with `{ kind: "system", type: "pong", ... }`.

---

## 4. Minimal React hook (example)

```ts
import { useEffect, useRef, useState, useCallback } from 'react';

type SocEvent = Record<string, unknown> & { seq?: number; kind?: string };

export function useSocRealtime(apiBaseHttp: string) {
  const [events, setEvents] = useState<SocEvent[]>([]);
  const lastSeq = useRef(0);
  const wsRef = useRef<WebSocket | null>(null);

  const merge = useCallback((batch: SocEvent[]) => {
    setEvents((prev) => {
      const next = [...prev, ...batch];
      const cap = 500;
      return next.length > cap ? next.slice(-cap) : next;
    });
    for (const e of batch) {
      if (typeof e.seq === 'number' && e.seq > lastSeq.current) {
        lastSeq.current = e.seq;
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const base = apiBaseHttp.replace(/\/$/, '');
      const res = await fetch(`${base}/events/recent?limit=100`);
      const data = await res.json();
      if (cancelled) return;

      merge((data.events ?? []) as SocEvent[]);
      lastSeq.current = data.latest_seq ?? lastSeq.current;

      const wsBase = base.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');
      const ws = new WebSocket(`${wsBase}/ws/events?since=${lastSeq.current}`);
      wsRef.current = ws;

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data as string) as SocEvent;
          if (msg.kind === 'system') return;
          merge([msg]);
        } catch {
          /* ignore */
        }
      };

      const id = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send('ping');
      }, 25000);
      ws.onclose = () => clearInterval(id);
    })();

    return () => {
      cancelled = true;
      wsRef.current?.close();
    };
  }, [apiBaseHttp, merge]);

  /** Call when you POST /detect from the same browser — you already have the body; WS adds the same-shaped event. */
  return { events, lastSeq: lastSeq.current };
}
```

Filter for the dashboard (all DDoS / brute-force classification messages):

```ts
function isDetectEvent(e: SocEvent): boolean {
  return e.kind === 'ddos' || e.kind === 'bruteforce';
}
```

Only **attacks** (exclude benign):

```ts
function isAttackDetection(e: SocEvent): boolean {
  return (
    (e.kind === 'ddos' || e.kind === 'bruteforce') &&
    (e as { attack_detected?: boolean }).attack_detected === true
  );
}
```

---

## 5. Flow with `POST /detect`

1. Open `/ws/events` (after `/events/recent` as above).
2. From the frontend (or another client), call `POST /detect` with packet or brute-force JSON as today.
3. When the request returns 200, the backend has already queued a `ddos` or `bruteforce` event; the WebSocket will deliver it within about a second (server poll interval).
4. You can still use the HTTP JSON response for immediate UI feedback; use the WS event for a live feed / multi-tab sync.

---

## 6. CORS

Your API already allows browser origins via `CORS_ORIGINS`. WebSockets use the `Origin` header on upgrade; ensure your frontend origin is allowed if you move off `*`.

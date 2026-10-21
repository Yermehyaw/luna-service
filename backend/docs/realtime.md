# Realtime Queue — WebSocket Contract

Written for @Peter and @Asher, who have to build against it. WebSocket routes do not
appear at `/docs`: OpenAPI describes HTTP only, so this file is the source of truth for
the realtime surface until something replaces it.

Backend status: implemented and covered by tests. No part of this is speculative.

---

## 1. Two sockets, two audiences

| Audience | URL | Query params | Gets |
|---|---|---|---|
| Staff console | `GET /api/queue/ws/branches/{branch_id}` | `business_id` (required) | every ticket event for one branch |
| Customer | `GET /api/queue/ws/tickets/{ticket_number}` | none | status and wait for one ticket |

Both are ordinary WebSocket upgrades:

```js
const socket = new WebSocket(
  "ws://localhost:8000/api/queue/ws/branches/BRANCH_ID?business_id=BUSINESS_ID"
);
```

There is no auth on either yet (plan.md Q2). On the staff socket `business_id` comes from
the query string, so it is **tenant filtering, not enforcement** — the same honest caveat
the HTTP routes carry. The customer socket takes no tenant argument at all: the backend
resolves the business from the ticket number, so there is nothing to forge.

---

## 2. What arrives, and in what order

Every frame is JSON with the same envelope:

```json
{"type": "...", "timestamp": "2026-10-08T11:04:21.482197+00:00", "data": {...}}
```

On open:

1. `connected` — `data` is `{"channel": "queue:branch:..."}`. Use it to confirm the
   subscription landed rather than assuming it did.
2. `ticket.snapshot` — **customer socket only.** Current state of the ticket, sent because
   the next event may be hours away for a ticket booked for later in the day.

Then, whenever something happens:

| `type` | Sent to | `data` |
|---|---|---|
| `ticket.created` | branch + that ticket's channel | a `TicketResponse` |
| `ticket.status_changed` | branch + that ticket's channel | a `TicketResponse` plus `previous_status` |
| `ticket.wait_updated` | that ticket's own channel | a `TicketResponse` |
| `pong` | whoever pinged | `{}` |

`data` is exactly the body the matching HTTP endpoint returns — same builder, same fields,
one shared function (`build_ticket_response`). A client rendering `/api/queue/tickets/...`
and one rendering a socket event will not disagree about the same ticket. The single
exception is `previous_status`, which only the `status_changed` event carries.

So the full frame looks like:

```json
{
  "type": "ticket.status_changed",
  "timestamp": "2026-10-08T11:04:21.482197+00:00",
  "data": {
    "id": "…",
    "ticket_number": "AC-H2JKP",
    "status": "called",
    "previous_status": "booked",
    "customer_name": "Ada Lovelace",
    "wait": {"minutes": 15, "tickets_ahead": 1, "service_duration_mins": 15, "display": "About 15 min"}
  }
}
```

A `TicketResponse` carries `customer_name` and `customer_email` because the console needs
to render them. That is the whole privacy surface of a frame: the branch socket sees its
branch's tickets, and a customer socket sees only its own ticket — never the rest of the
branch's queue, and never another business' data.

---

## 3. The rule worth knowing: the wait fan-out

When one ticket moves, **every ticket waiting behind it on the same branch and service is
told its new estimate**. That is `ticket.wait_updated`.

It exists because otherwise a customer's page is correct at the moment they open it and
then quietly wrong for the rest of their wait — someone else gets called and their number
never changes. The payload is the waiting customer's *own* ticket, with their own
estimate, so nothing about the person who moved is disclosed.

Two boundaries on it:

- Same branch **and** same service. A ticket on a different service, or in a different
  branch, is not affected and receives nothing.
- Capped at 50 tickets per fan-out (`MAX_WAIT_FANOUT`). A packed branch degrades to
  slightly stale estimates rather than a slow request, and stale-but-labelled beats a
  request that times out.

---

## 4. Sending anything back

Only one frame is understood from the client: the text `"ping"`.

```js
socket.send("ping");  // you get {"type": "pong", "data": {}}
```

Everything else sent by the client is ignored, not rejected. This is a keepalive so a
browser can tell a live socket from a half-open one that stopped delivering.

---

## 5. What happens when Redis is down

Redis is optional, and this is the part most likely to matter during a demo.

Every event is dispatched to this process' sockets **first, always, without Redis**. Redis
pub/sub is only the second hop, reaching sockets held by a *different* worker. So a
deployment with no Redis at all still pushes live updates correctly on a single process;
what it loses is nothing more than delivery to other workers.

`GET /health` reports it:

```json
{
  "checks": {"database": "ok"},
  "realtime": {"redis": "unreachable", "connections": 3}
}
```

`realtime.redis` being `"unreachable"` means cross-worker delivery is off, not that
realtime is broken. `realtime.connections` is the number of open sockets on this worker.

---

## 6. Reconnection, and the one thing you must do after it

There is **no event history and no backlog**. If the socket drops for five seconds, the
events in those five seconds are gone and are never replayed.

So on reconnect: subscribe, then re-read over HTTP and reconcile —
`GET /api/queue/tickets` for the console, `GET /api/queue/tickets/{number}` for a customer.
Treat the socket as a stream of *changes*, not as the source of truth.

The backend retries Redis every 5 seconds on its own; your client should do the same
for the socket.

---

## 7. Failure modes you may see

| What happens | Code | Why |
|---|---|---|
| Close before accept | `1008` policy violation, reason `unknown branch` | no such branch, or it belongs to another business |
| Close before accept | `1008` policy violation, reason `unknown ticket` | no such ticket number |
| Nothing arrives after a change | — | Redis is down and the change happened on another worker; `/health` will say so |
| `wait.minutes` is `null` | — | the estimate is past the credible horizon (4 hours), so the backend refuses to name a number. `wait` itself is still set, with `display` reading `Being scheduled`. Do not render it as `0` |

Realtime frames always carry a `wait` object; it is the *minutes* that go null. A `null`
`wait` only ever comes from an HTTP response that was asked for no estimate at all.

`1008` is used rather than `404` on purpose: a caller who guessed an id is told "not for
you" instead of "doesn't exist", which is the same answer the HTTP routes give.

---

## 8. Where the code lives

| File | Job |
|---|---|
| `app/routers/ws.py` | the two endpoints and their handshake checks |
| `app/realtime/channels.py` | channel names, which are the tenant boundary |
| `app/realtime/payloads.py` | the wire format above |
| `app/realtime/manager.py` | sockets connected to this process |
| `app/realtime/broker.py` | Redis fan-out, optional by design |
| `app/realtime/events.py` | what is published when, including the wait fan-out |

Tests: `tests/test_channels.py`, `tests/test_payloads.py`, `tests/test_manager.py`,
`tests/test_broker.py`, `tests/integration/test_realtime_broadcasts.py`, and
`tests/integration/test_ws_endpoints.py` (the last one drives real connections, so it is
the closest thing to what your browser will see).

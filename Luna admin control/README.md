# Luna Platform Admin Control Center

This module houses the standalone **Platform Administration and Network Control Suite** for the Luna Multi-Tenant SaaS platform.

## Features & Capabilities

- **Tenant Owners Management**: Search, filter, inspect business metrics, toggle account status (Active, Pending, Suspended), and review SLA tiers.
- **Global Network & Node Telemetry**: Real-time status checks for Edge API gateways, WebSocket fan-out clusters, Redis event brokers, and database health.
- **Maintenance Mode & Global Controls**: Emergency one-click maintenance switcher, rate-limiting locks, and system broadcast banners.
- **Security & Audit Logs**: Immutable chronological record of platform administrative interventions, permission changes, and security escalations.
- **Platform Analytics & Telemetry**: Consolidated views of cross-tenant queue throughput, customer transaction volumes, and service latency.

## Usage

This module can be mounted into any route or App Router layout:

```tsx
import { AdminControlPage } from '@/Luna admin control';

export default function AdminRoute() {
  return <AdminControlPage />;
}
```

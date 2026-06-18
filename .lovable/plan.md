## Site Safety Hub — UI Prototype Plan

Build an enterprise dashboard prototype for the AI-Powered Excavator Blind-Spot Safety Monitoring System using mock data only. No backend, no auth servers, no real APIs.

### Scope (10 screens)
1. **Login** — mock auth, industrial design
2. **Executive Dashboard** — KPIs, site heat map, recent critical events, trend charts
3. **Live Machine Monitoring** — camera feed placeholder with detection overlays, machine info, worker detection, hazard status
4. **Captured Evidence Center** — image gallery with filters and detail view
5. **Worker Safety Tracking** — directory + worker detail (info, activity, incident timeline)
6. **Incident Management** — table, filters, incident detail drawer
7. **Alerts & Notifications** — active alerts, types, actions (acknowledge/escalate/resolve)
8. **Analytics** — hazard charts, KPIs (Recharts, mock data)
9. **Machine Fleet Management** — fleet table + machine detail
10. **Reports Center** — list + mock PDF/Excel/CSV export buttons

### Architecture (strict 3-tier)
```text
src/
├── routes/                        # TanStack Start file-based routes (presentation entry)
│   ├── __root.tsx                 # shell with sidebar layout (auth-gated)
│   ├── login.tsx
│   └── _app/                      # authenticated layout
│       ├── index.tsx              # Executive Dashboard
│       ├── live.tsx
│       ├── evidence.tsx
│       ├── workers.tsx, workers.$id.tsx
│       ├── incidents.tsx
│       ├── alerts.tsx
│       ├── analytics.tsx
│       ├── machines.tsx, machines.$id.tsx
│       └── reports.tsx
├── components/
│   ├── common/    (Sidebar, Topbar, StatusBadge, KpiCard, DataTable, Modal, Drawer, EmptyState)
│   ├── dashboard/ (SiteHeatMap, TrendChart, RecentEventsTable)
│   ├── alerts/    (AlertCard, AlertList, NotificationPanel)
│   ├── workers/   (WorkerCard, WorkerDetail, IncidentTimeline)
│   ├── machines/  (MachineCard, SensorStatusGrid, LiveCameraViewer, DistanceWidget)
│   └── reports/   (ReportCard)
├── services/
│   ├── api/httpClient.ts          # fetch wrapper using config.BASE_URL (unused in mock mode)
│   ├── adapters/                  # normalize raw API → domain types
│   └── repositories/              # WorkerRepository, MachineRepository, IncidentRepository, AlertRepository, DashboardRepository, ReportRepository, AuthRepository
│                                    each: getAll/getById/create/update/delete; switches on config.USE_MOCK
├── store/         (Zustand slices: auth, dashboard, workers, machines, incidents, alerts)
├── hooks/         (useWorkers, useMachines, useIncidents, useAlerts, useDashboard — wrap repositories via TanStack Query)
├── business/      (risk calc, zone classification, alert processing, distance formatting)
├── utils/         (date, format, csv helpers)
├── constants/     (zones, severity, colors, routes)
├── types/         (Worker, Machine, Incident, Alert, KPI, …)
├── mock/          (workers.json, machines.json, incidents.json, alerts.json, kpis.json, evidence.json)
├── config/environment.ts          # { BASE_URL, USE_MOCK } from import.meta.env
└── assets/                        # placeholder camera frames, worker avatars
```

### Future API swap
- `config/environment.ts` exposes `USE_MOCK` (default `true`) and `BASE_URL`.
- Every repository has two implementations: `*.mock.ts` reads from `/mock/*.json`; `*.http.ts` calls `httpClient`. A single factory returns the right one based on `USE_MOCK`.
- Components never import repositories directly — they use hooks (`useWorkers()`, etc.), so swapping mock → http requires changing only `.env`.

### Design system
- Industrial enterprise / AWS-console feel: deep navy primary, white surfaces, light gray bg, monospace accents for IDs.
- Status tokens: `--safe` (green), `--warning` (amber), `--critical` (red), `--info` (blue) — defined in `src/styles.css` with oklch + `@theme inline`, used via semantic classes / shadcn variants. No hardcoded color utilities.
- Inter for UI text, JetBrains Mono for IDs/metrics. Loaded via `<link>` in `__root.tsx`.
- shadcn primitives (Card, Table, Badge, Button, Dialog, Drawer/Sheet, Tabs, Input, Select) with custom variants (`badge variant="safe|warning|critical"`, `button variant="hero|danger"`).

### Tech choices
- TanStack Router (already in template) for routes + nav.
- TanStack Query for hook-level data caching against repositories.
- Zustand for cross-screen UI state (selected machine, notification panel, auth user).
- Recharts for analytics & trend charts.
- Lucide icons.
- Mock auth: login form stores a fake user in Zustand + `localStorage`; `_app` layout redirects to `/login` if absent. (Prototype-only; clearly marked.)

### Mock data volume
~20 workers, ~12 machines, ~60 incidents across last 30 days, ~15 active alerts, ~40 evidence images (generated placeholder thumbnails / SVG frames so no external requests).

### Out of scope (per user)
Real backend, real auth, real camera streams, real LiDAR, MQTT, AWS IoT, mobile app — architecture leaves room for them but they are not built.

### Deliverable
A fully navigable prototype where every screen renders with realistic mock data, components are reusable, and switching to a real backend later means implementing the `.http.ts` repository siblings and flipping `USE_MOCK=false`.
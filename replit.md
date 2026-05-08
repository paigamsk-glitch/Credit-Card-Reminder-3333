# Credit Card Payment Reminder & Tracker

A mobile app for managing and tracking 100+ credit card payment due dates, statuses, and expiry alerts — all without opening a spreadsheet.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo (React Native) with Expo Router
- State: React Context + AsyncStorage (local persistence)
- API: Express 5 (api-server artifact)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/mobile/` — Expo mobile app
- `artifacts/mobile/context/CardsContext.tsx` — All card state, CRUD, AsyncStorage, stats
- `artifacts/mobile/app/(tabs)/` — Dashboard, Cards, Reminders, Settings screens
- `artifacts/mobile/app/card/` — Card detail, add, edit screens
- `artifacts/mobile/components/` — CardVisual, CardListItem, StatCard, PaymentStatusBadge, EmptyState
- `artifacts/mobile/constants/colors.ts` — Design tokens (navy + gold finance theme)
- `lib/api-spec/openapi.yaml` — API contract source of truth

## Architecture decisions

- Frontend-only for first build: All card data stored in AsyncStorage via CardsContext. No backend DB calls.
- Payment status auto-computed on load: if due date passed and not Paid → auto-marked Overdue.
- Sample data pre-loaded on first app launch (5 demo cards across multiple banks).
- Bank-color-coded card visuals using LinearGradient per bank name.
- Reminder grouping: Overdue → Due Today → Due Tomorrow → 2-3 days → This week → Later.

## Product

- Dashboard with real-time stats (total/paid/pending/overdue), expiry alerts, progress tracker
- Full card list with search and filter by status (All/Pending/Paid/Overdue)
- Reminders screen with cards grouped by urgency (overdue, today, tomorrow, this week, later)
- Card detail with one-tap "Mark as Paid" action
- Add/Edit card forms with bank picker, expiry, due date, phone number
- Settings with Twilio/WhatsApp reminder configuration UI and monthly reset

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Due date is a day-of-month (1–31), not a full date. `getNextDueDate()` computes the actual upcoming date.
- Payment status is re-computed on every app load from the stored raw status + current date.
- `isExpiringSoon()` checks if expiry is within 30 days; `isExpired()` checks if past last day of expiry month.
- Always run codegen after changing `lib/api-spec/openapi.yaml`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details

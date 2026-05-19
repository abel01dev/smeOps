# SME Ops Platform

> AI-Powered Business Operations Optimization SaaS for Small & Medium Enterprises

A multi-tenant SaaS platform that gives buy-and-resell businesses (mini markets, electronics
shops, village shops) a fast POS, inventory, customers, dashboards, and AI-driven business
insights — built around a desktop-first selling experience (mobile layout deferred).

## Monorepo layout

```
sme-ops-platform/
├── apps/
│   ├── api/        # NestJS + Prisma + PostgreSQL
│   └── web/        # Next.js 15 + Tailwind + shadcn/ui
├── packages/
│   └── shared/     # Zod schemas + shared TypeScript types
└── docs/
    └── API.md      # Endpoint quick reference
```

## Tech stack

| Layer       | Tech                                                 |
| ----------- | ---------------------------------------------------- |
| Frontend    | Next.js 15 (App Router), React 19, Tailwind, shadcn  |
| State       | Zustand (client) + TanStack Query (server)           |
| Charts      | Recharts                                             |
| Backend     | NestJS 10, Prisma 5, Zod                             |
| Database    | PostgreSQL (Supabase)                                |
| Auth        | Supabase Auth (JWT verified via JWKS)                |
| Docs        | Swagger / OpenAPI at `/docs`                         |
| Deployment  | Vercel (web) + Railway (api) + Supabase (db)         |

## Prerequisites

- Node.js >= 20
- pnpm >= 9 (`corepack enable pnpm`)
- Supabase project (Postgres + Auth)

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# Edit DATABASE_URL, DIRECT_URL, SUPABASE_* keys (see apps/api/.env.example)

# 3. Generate Prisma client + run migrations
pnpm db:generate
pnpm db:migrate

# 4. Seed demo data (recommended)
pnpm db:seed

# 5. Run both apps
pnpm dev
```

| App | URL |
|-----|-----|
| Web | http://localhost:3000 |
| API | http://localhost:4000 |
| Swagger | http://localhost:4000/docs |

## Demo account

After seeding (`pnpm db:seed`):

| Field | Value |
|-------|-------|
| Role | Email | Password |
|------|-------|----------|
| Owner | `owner@demo.local` | `Password123!` |
| Manager | `manager@demo.local` | `Password123!` |
| Cashier | `cashier@demo.local` | `Password123!` |

The seed creates **Abel Mini Market** with categories, products (including low-stock items), customers, and ~30 days of sales so the dashboard and AI insights show real charts.

To wipe and re-seed: `pnpm db:reset` (runs migrations + seed).

## API documentation

- **Swagger UI:** http://localhost:4000/docs — try endpoints after **Authorize** with your `accessToken` from login.
- **Markdown reference:** [docs/API.md](./docs/API.md)

Typical flow in Swagger:

1. `POST /api/v1/auth/login` with demo credentials
2. Copy `accessToken` from the response
3. Click **Authorize** → paste token
4. Call `GET /api/v1/dashboard/summary`, `GET /api/v1/ai/insights?days=30`, etc.

## Architecture highlights

- **Multi-tenancy:** every tenant table has `organizationId`. NestJS guards + Prisma scope queries per organization.
- **Money safety:** `Decimal(12,2)` / `Decimal(14,2)` — no floats.
- **POS integrity:** `POST /sales` runs in a single `prisma.$transaction` (sale, items, stock, customer totals).
- **Historical accuracy:** `SaleItem` snapshots prices at checkout; editing products never rewrites past reports.
- **AI:** rule-based insights in `apps/api/src/ai/` — swap for an LLM later behind the same response shape.

## Scripts (root)

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Run API + Web concurrently                   |
| `pnpm dev:api`      | Run only the API                             |
| `pnpm dev:web`      | Run only the Web app                         |
| `pnpm build`        | Production build (shared + API + web)        |
| `pnpm lint`         | Lint all packages and apps                   |
| `pnpm typecheck`    | TypeScript type-check across the workspace   |
| `pnpm db:migrate`   | Run Prisma migrations                        |
| `pnpm db:seed`      | Seed demo data (Supabase user + sales)       |
| `pnpm db:reset`     | Reset DB, migrate, and re-seed               |
| `pnpm db:studio`    | Open Prisma Studio                           |

## Roadmap

- [x] Day 1: Monorepo + schema + skeletons
- [x] Day 2: Auth (register / login / me) + tenant guard
- [x] Day 3: Products + Categories CRUD
- [x] Day 4: Customers + Sales transactional endpoint
- [x] Day 5: Dashboard aggregations + seed script
- [x] Day 6–7: Web shell, auth pages, dashboard
- [x] Day 8: Inventory UI
- [x] Day 9: POS UI (priority feature)
- [x] Day 10: Customers + Sales UI
- [x] Day 11: AI insights (rule-based)
- [ ] Day 12: Polish + responsiveness *(deferred — V3)*
- [x] Day 13: Seeds, Swagger, docs
- [x] Day 14: Production prep + deploy guide *(live deploy skipped)*
- [x] V2: Role-based access (Owner / Manager / Cashier) + English & Amharic UI

## Production (when you are ready)

Configs are in place; no live URLs were created during the MVP sprint.

| File | Purpose |
|------|---------|
| [docs/DEPLOY.md](./docs/DEPLOY.md) | Step-by-step Vercel + Railway + Supabase |
| `apps/web/vercel.json` | Monorepo build for Vercel |
| `apps/api/railway.toml` | Build, health check, start command |

Verify a production build locally: `pnpm build`

## License

Private — graduation / portfolio project.

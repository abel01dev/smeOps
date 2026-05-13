# SME Ops Platform

> AI-Powered Business Operations Optimization SaaS for Small & Medium Enterprises

A multi-tenant SaaS platform that gives buy-and-resell businesses (mini markets, electronics
shops, village shops) a fast POS, inventory, customers, dashboards, and AI-driven business
insights — all built around a touch-friendly, mobile-first selling experience.

## Monorepo layout

```
sme-ops-platform/
├── apps/
│   ├── api/        # NestJS + Prisma + PostgreSQL
│   └── web/        # Next.js 15 + Tailwind + shadcn/ui
└── packages/
    └── shared/     # Zod schemas + shared TypeScript types (used by both apps)
```

## Tech stack

| Layer       | Tech                                                 |
| ----------- | ---------------------------------------------------- |
| Frontend    | Next.js 15 (App Router), React 19, Tailwind, shadcn  |
| State       | Zustand (client) + TanStack Query (server)           |
| Charts      | Recharts                                             |
| Backend     | NestJS 10, Prisma 5, Zod                             |
| Database    | PostgreSQL (Supabase)                                |
| Auth        | JWT (access + refresh) with bcrypt                   |
| Docs        | Swagger / OpenAPI                                    |
| Deployment  | Vercel (web) + Railway (api) + Supabase (db)         |

## Prerequisites

- Node.js >= 20
- pnpm >= 9 (`corepack enable pnpm`)
- PostgreSQL connection string (Supabase recommended)

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
# then edit DATABASE_URL, JWT_SECRET, etc.

# 3. Generate Prisma client + push schema to your DB
pnpm db:generate
pnpm db:migrate

# 4. Seed demo data (optional but recommended for development)
pnpm db:seed

# 5. Run both apps
pnpm dev
```

API will start at `http://localhost:4000` (Swagger at `/docs`).
Web will start at `http://localhost:3000`.

## Architecture highlights

- **Multi-tenancy**: every tenant table has an `organizationId`. A NestJS `TenantGuard` and a
  Prisma client extension scope all queries automatically — application-level row isolation.
- **Money safety**: all monetary fields use `Decimal(12,2)` / `Decimal(14,2)`. No floats.
- **POS integrity**: `POST /sales` runs inside a single `prisma.$transaction` — sale, sale
  items, stock decrement, and customer totals either all succeed or all roll back.
- **Historical accuracy**: each `SaleItem` snapshots `productName`, `buyPriceAtSale`, and
  `sellPriceAtSale` at the moment of sale, so editing or archiving a product never
  retroactively changes past revenue or profit numbers.
- **AI**: rule-based insights engine in `apps/api/src/ai/` — fast, deterministic, no API key
  required. Designed to be swapped for an LLM provider behind the same interface.

## Scripts (root)

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Run API + Web concurrently                   |
| `pnpm dev:api`      | Run only the API                             |
| `pnpm dev:web`      | Run only the Web app                         |
| `pnpm build`        | Build all packages and apps                  |
| `pnpm lint`         | Lint all packages and apps                   |
| `pnpm typecheck`    | TypeScript type-check across the workspace   |
| `pnpm db:migrate`   | Run Prisma migrations                        |
| `pnpm db:seed`      | Seed the database with demo data             |
| `pnpm db:studio`    | Open Prisma Studio                           |

## Roadmap

- [x] Day 1: Monorepo + schema + skeletons
- [ ] Day 2: Auth (register / login / me) + tenant guard
- [ ] Day 3: Products + Categories CRUD
- [ ] Day 4: Customers + Sales transactional endpoint
- [ ] Day 5: Dashboard aggregations + seed script
- [ ] Day 6–7: Web shell, auth pages, dashboard
- [ ] Day 8: Inventory UI
- [ ] Day 9: POS UI (priority feature)
- [ ] Day 10: Customers UI
- [ ] Day 11: AI insights
- [ ] Day 12: Polish + responsiveness
- [ ] Day 13: Seeds, Swagger, docs
- [ ] Day 14: Deploy

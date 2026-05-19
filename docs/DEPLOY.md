# Deployment guide

Use this when you are ready to ship. **Live deployment was skipped** during the 14-day MVP; configs and checklists are prepared so you can deploy in one session later.

## Architecture

| Component | Platform | Notes |
|-----------|----------|--------|
| Web (Next.js) | [Vercel](https://vercel.com) | Root directory: `apps/web` |
| API (NestJS) | [Railway](https://railway.app) or Render | Root directory: `apps/api` |
| Database + Auth | [Supabase](https://supabase.com) | Postgres + Auth (already in use) |

## 1. Supabase (production)

1. Use your existing project or create a new one.
2. **Database → Settings → Connection string**
   - `DATABASE_URL` = **Transaction pooler** (port `6543`) + `?pgbouncer=true&connection_limit=1`
   - `DIRECT_URL` = **Session pooler** (port `5432`) — required for `prisma migrate deploy`
3. **Project Settings → API** — copy `SUPABASE_URL`, anon key, service role key.
4. **Authentication → URL configuration** — add your Vercel URL to redirect allow list when using Supabase-hosted flows later.

Run migrations against production (from your machine or CI):

```bash
cd apps/api
# DATABASE_URL + DIRECT_URL must point at production
pnpm db:migrate:prod
```

Optional demo data (not recommended on a public production DB):

```bash
pnpm db:seed
```

## 2. API on Railway

1. New project → **Deploy from GitHub** → this repo.
2. Add a service with **root directory** `apps/api`.
3. Railway picks up `apps/api/railway.toml` (build + health check).
4. Set environment variables (see checklist below).
5. After deploy, open `https://<your-api>.up.railway.app/api/v1/health` — expect `{ "status": "ok", "db": "up" }`.
6. Swagger (optional): set `SWAGGER_ENABLED=true` and open `/docs`.

**Start command:** `node dist/main.js` (already in `railway.toml`).

## 3. Web on Vercel

1. Import the GitHub repo on Vercel.
2. Set **Root Directory** to `apps/web`.
3. Vercel uses `apps/web/vercel.json` for monorepo install/build.
4. Set environment variables:

| Variable | Example |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://<your-api>.up.railway.app/api/v1` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / publishable key |

5. Deploy. Smoke test: register or log in with demo seed credentials (if seeded).

## 4. Environment checklist

### API (`apps/api`)

| Variable | Required | Notes |
|----------|----------|--------|
| `NODE_ENV` | yes | `production` |
| `PORT` | yes | Railway sets this automatically |
| `CORS_ORIGIN` | yes | Your Vercel URL, e.g. `https://sme-ops.vercel.app` |
| `DATABASE_URL` | yes | Supabase transaction pooler |
| `DIRECT_URL` | yes | Supabase session pooler (migrations) |
| `SUPABASE_URL` | yes | |
| `SUPABASE_ANON_KEY` | yes | |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Secret — backend only |
| `SWAGGER_ENABLED` | no | `true` to expose `/docs` in production |

### Web (`apps/web`)

| Variable | Required |
|----------|----------|
| `NEXT_PUBLIC_API_URL` | yes |
| `NEXT_PUBLIC_SUPABASE_URL` | yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes |

Never put `SUPABASE_SERVICE_ROLE_KEY` in the web app.

## 5. Post-deploy smoke test

1. `GET /api/v1/health` → `db: "up"`
2. Log in on the web app (or Swagger `POST /auth/login`)
3. Dashboard loads KPIs
4. POS → add product → **Charge** → sale appears under **Sales**
5. Dashboard **Business insights** panel loads

## 6. Local production build (verify before deploy)

From repo root:

```bash
pnpm install
pnpm build
```

API artifact: `apps/api/dist/main.js`  
Web artifact: `apps/web/.next/`

## 7. What we skipped in the MVP

- No live Vercel / Railway URLs were created in the graduation sprint.
- Day 12 mobile/tablet layout polish is still deferred.
- When ready, follow sections 1–5 above — estimated ~30–45 minutes if Supabase is already configured.

# API reference

Base URL (local): `http://localhost:4000/api/v1`

Interactive docs: **http://localhost:4000/docs** (Swagger UI)

## Authentication

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | Public | Create organization + owner user |
| POST | `/auth/login` | Public | Email + password → tokens |
| POST | `/auth/refresh` | Public | New access token from refresh token |
| GET | `/auth/me` | Bearer | Current user + organization |

**Swagger:** After login, copy `accessToken` from the response → **Authorize** → `Bearer <token>`.

## Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | Public | `{ status, db, uptime }` |

## Categories

| Method | Path | Description |
|--------|------|-------------|
| GET | `/categories` | List all |
| POST | `/categories` | Create |
| PATCH | `/categories/:id` | Update name |
| DELETE | `/categories/:id` | Delete (products keep categoryId null) |

## Products

| Method | Path | Description |
|--------|------|-------------|
| GET | `/products` | Paginated list (`search`, `categoryId`, `status`, `lowStockOnly`) |
| GET | `/products/:id` | Single product |
| POST | `/products` | Create |
| PATCH | `/products/:id` | Update |
| DELETE | `/products/:id` | Archive (soft delete) |

## Customers

| Method | Path | Description |
|--------|------|-------------|
| GET | `/customers` | Paginated list + search |
| GET | `/customers/:id` | Profile + recent sales |
| POST | `/customers` | Create |
| PATCH | `/customers/:id` | Update |
| DELETE | `/customers/:id` | Delete |

## Sales (POS)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/sales` | **Atomic checkout** — items, stock, customer total in one transaction |
| GET | `/sales` | History (`dateFrom`, `dateTo`, `paymentMethod`, pagination) |
| GET | `/sales/:id` | Receipt detail |

### Example checkout body

```json
{
  "customerId": null,
  "items": [{ "productId": "clx...", "quantity": 2 }],
  "discount": 0,
  "paymentMethod": "CASH"
}
```

## Dashboard

| Method | Path | Query | Description |
|--------|------|-------|-------------|
| GET | `/dashboard/summary` | — | KPI cards (today / week / month) |
| GET | `/dashboard/revenue-trend` | `days=30` | Daily revenue + profit buckets |
| GET | `/dashboard/top-products` | `days=30&limit=5` | Top sellers by revenue |

## AI insights

| Method | Path | Query | Description |
|--------|------|-------|-------------|
| GET | `/ai/insights` | `days=30` (7–90) | Rule-based tips + 7-day forecast |

No external AI API key required.

## Response envelope

Successful JSON responses are wrapped:

```json
{
  "success": true,
  "data": { ... }
}
```

Errors return `{ "success": false, "message": "..." }` with an appropriate HTTP status.

## Demo data

After `pnpm db:seed`:

- **Email:** `owner@demo.local`
- **Password:** `Password123!`

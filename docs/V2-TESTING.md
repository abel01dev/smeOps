# V2 testing — roles & i18n

## Demo accounts

Password for all: `Password123!`

| Role | Email |
|------|-------|
| Owner | `owner@demo.local` |
| Shop manager | `manager@demo.local` |
| Inventory manager | `inventory@demo.local` |
| Cashier | `cashier@demo.local` |

Run `pnpm db:migrate` then `pnpm db:seed` after pulling changes so Prisma includes `INVENTORY_MANAGER` and seed creates all users.

## Role expectations

| Area | Owner | Shop manager | Inventory manager | Cashier |
|------|-------|--------------|-------------------|---------|
| Team (add employees) | Yes | No | No | No |
| Dashboard | Yes | Yes | No (redirects to inventory) | No (redirects to POS) |
| AI Assistant | Yes | Yes | No | No |
| POS | Yes | Yes | No | Yes |
| Inventory | Yes | Yes | Yes | No |
| Customers | Yes | Yes | No | Yes |
| Sales | Yes | Yes | No | Yes |

API returns `403` when a role calls a route outside its matrix (e.g. cashier on dashboard, inventory manager on sales).

## i18n

1. Open the app → header **language** dropdown (or login page).
2. Switch **English** ↔ **አማርኛ**.
3. Nav labels and login form should update immediately.
4. Preference is stored in localStorage (`sme-locale`).

## Quick smoke test

1. Log in as **cashier** → lands on **POS**, sidebar shows POS / Customers / Sales only.
2. Try opening `/dashboard` manually → redirected or blocked.
3. Log in as **manager** → full nav except **Team** (owner only).
4. Log in as **owner** → open **Team**, add a user with email + role + temp password; list updates.
5. Log in as **inventory** → **Inventory** only in nav; opening `/pos` or `/customers` should be denied or redirected.
6. Switch language to Amharic → nav shows Amharic labels.

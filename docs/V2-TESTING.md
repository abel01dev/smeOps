# V2 testing — roles & i18n

## Demo accounts

Password for all: `Password123!`

| Role | Email |
|------|-------|
| Owner | `owner@demo.local` |
| Manager | `manager@demo.local` |
| Cashier | `cashier@demo.local` |

Run `pnpm db:seed` after pulling this branch to create manager and cashier users.

## Role expectations

| Area | Owner | Manager | Cashier |
|------|-------|---------|---------|
| Dashboard | Yes | Yes | No (redirects to POS) |
| AI Assistant | Yes | Yes | No |
| POS | Yes | Yes | Yes |
| Inventory | Yes | Yes | No |
| Customers | Yes | Yes | Yes |
| Sales | Yes | Yes | Yes |

API returns `403` if a cashier calls `/dashboard` or edits products.

## i18n

1. Open the app → header **language** dropdown (or login page).
2. Switch **English** ↔ **አማርኛ**.
3. Nav labels and login form should update immediately.
4. Preference is stored in localStorage (`sme-locale`).

## Quick smoke test

1. Log in as **cashier** → lands on **POS**, sidebar shows POS / Customers / Sales only.
2. Try opening `/dashboard` manually → redirected or blocked.
3. Log in as **manager** → full nav except same as owner for API writes.
4. Switch language to Amharic → nav shows Amharic labels.

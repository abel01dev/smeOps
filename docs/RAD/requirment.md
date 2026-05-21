# SME Ops — Requirements Documentation (OOSE Lab Format)

**Project:** SME Ops (SME Optimizer)  
**Related documents:** [senarios.md](./senarios.md) (AS-IS S1–S8, Visionary V1–V8), [businessrule.md](./businessrule.md) (implicit rules)  
**Notation:** S*n* = AS-IS scenario, V*n* = Visionary scenario

This document completes **Lab Task 3 — Elicit functional and non-functional requirements** that bridge the gap between AS-IS and visionary scenarios.

---

## 1. Requirement attribute model

| Attribute | Description |
|-----------|-------------|
| **Requirement Id** | `FREQ-n` |
| **Type** | Functional / Non-Functional |
| **Priority** | High / Medium / Low |
| **Description** | What the system shall do |
| **Source** | AS-IS and/or Visionary scenario(s) |

---

## 2. Functional requirements

### 2.1 Organization, authentication, and access

| ID | Type | Priority | Source | Description |
|----|------|----------|--------|-------------|
| FREQ-1 | Functional | High | S7, V1 | The system shall allow a guest to register a new organization and an owner account in one operation. |
| FREQ-2 | Functional | High | S7, V1 | The system shall store organization details (name, slug, default currency ETB). |
| FREQ-3 | Functional | High | S7, V1 | The system shall assign the registering user the **OWNER** role linked to that organization. |
| FREQ-4 | Functional | High | S7, V5 | The system shall allow users to log in and obtain a JWT access token (Supabase Auth). |
| FREQ-5 | Functional | High | S7, V5 | The system shall allow token refresh without re-entering credentials. |
| FREQ-6 | Functional | High | S7, V5 | The system shall return the authenticated user profile (`GET /auth/me`) including role and organization. |
| FREQ-7 | Functional | High | S7, V5 | The system shall enforce role-based access on API endpoints and web routes per `UserRole`. |
| FREQ-8 | Functional | High | S7, V5 | The system shall redirect users to a default home route based on role after login (e.g. cashier → POS). |

### 2.2 Inventory — categories and products

| ID | Type | Priority | Source | Description |
|----|------|----------|--------|-------------|
| FREQ-9 | Functional | High | S1, S4, V2 | The system shall allow authorized users to create, read, update, and delete product **categories** scoped to the tenant. |
| FREQ-10 | Functional | High | S1, S4, V2 | The system shall allow authorized users to create, read, update products with name, buy price, sell price, stock quantity, and minimum stock. |
| FREQ-11 | Functional | High | S1, V2 | The system shall associate each product with a category within the same organization. |
| FREQ-12 | Functional | Medium | S1, V2 | The system shall support **archiving** a product (`ARCHIVED`) instead of physical delete to preserve sales history. |
| FREQ-13 | Functional | High | S1, S4, V2, V7 | The system shall identify **low-stock** products when `stockQuantity ≤ minStock` and `minStock > 0`. |
| FREQ-14 | Functional | High | S1, V2 | The system shall allow searching and filtering products (search text, category, status, low-stock only, pagination). |
| FREQ-15 | Functional | High | S2, V3 | The system shall prevent selling **ARCHIVED** or inactive products at POS. |

### 2.3 Point of sale and sales history

| ID | Type | Priority | Source | Description |
|----|------|----------|--------|-------------|
| FREQ-16 | Functional | High | S2, S5, S7, V3 | The system shall allow cashiers and managers to record a sale through a POS interface with multiple line items. |
| FREQ-17 | Functional | High | S2, S7, V3 | The system shall validate that requested quantity does not exceed available stock before completing a sale. |
| FREQ-18 | Functional | High | S2, S7, V3 | The system shall process checkout in a **single database transaction** (sale header, line items, stock decrement, customer totals). |
| FREQ-19 | Functional | High | S2, V3 | The system shall snapshot product name, buy price, and sell price on each sale line for historical reporting. |
| FREQ-20 | Functional | High | S2, V3 | The system shall compute and store sale **subtotal**, **discount**, **total**, and **profit** per transaction. |
| FREQ-21 | Functional | High | S2, V3 | The system shall record **payment method** (cash; mobile money and card reserved for future use). |
| FREQ-22 | Functional | High | S2, V3 | The system shall record the **cashier** (authenticated user) on each sale. |
| FREQ-23 | Functional | High | S3, V3, V4 | The system shall allow an optional **customer** to be linked to a sale. |
| FREQ-24 | Functional | High | S5, V3, V7 | The system shall provide sales history with filters (date range, customer, payment method) and sale detail view. |

### 2.4 Customers

| ID | Type | Priority | Source | Description |
|----|------|----------|--------|-------------|
| FREQ-25 | Functional | High | S3, V4 | The system shall allow authorized users to register customers with name and optional phone and address. |
| FREQ-26 | Functional | High | S3, V4 | The system shall allow searching and listing customers within the tenant. |
| FREQ-27 | Functional | High | S3, V4 | The system shall maintain denormalized **total spent** per customer updated on checkout. |
| FREQ-28 | Functional | Medium | S3, V4 | The system shall allow owner/manager to delete a customer while retaining historical sales records. |

### 2.5 Team management (owner)

| ID | Type | Priority | Source | Description |
|----|------|----------|--------|-------------|
| FREQ-29 | Functional | High | S7, V5 | The system shall allow the **owner** to list all employees in the organization. |
| FREQ-30 | Functional | High | S7, V5 | The system shall allow the owner to **invite** employees with roles: Manager, Inventory Manager, or Cashier. |
| FREQ-31 | Functional | High | S7, V5 | The system shall allow the owner to change an employee’s role (except promoting to Owner via API). |
| FREQ-32 | Functional | High | S7, V5 | The system shall create Supabase auth credentials for invited employees. |

### 2.6 Operating expenses and profitability

| ID | Type | Priority | Source | Description |
|----|------|----------|--------|-------------|
| FREQ-33 | Functional | High | S6, V6 | The system shall allow owner/manager to manage **expense categories** per tenant. |
| FREQ-34 | Functional | Medium | S6, V6 | The system shall auto-seed default expense categories (Rent, Salaries, Transport, Utilities, Other) on first access. |
| FREQ-35 | Functional | High | S6, V6 | The system shall allow recording **operational expenses** with amount, date, category, optional description, and recorder. |
| FREQ-36 | Functional | High | S6, S8, V6 | The system shall compute **gross profit** from sales for a selected period. |
| FREQ-37 | Functional | High | S6, S8, V6 | The system shall sum **operating expenses** for the same period. |
| FREQ-38 | Functional | High | S6, S8, V6 | The system shall display **net profit** = gross profit − operating expenses on the dashboard. |
| FREQ-39 | Functional | Medium | S6, V6 | The system shall block deletion of an expense category that is referenced by existing expenses. |

### 2.7 Dashboard and analytics

| ID | Type | Priority | Source | Description |
|----|------|----------|--------|-------------|
| FREQ-40 | Functional | High | S5, S8, V7 | The system shall provide dashboard KPIs for today, last 7 days, and last 30 days (revenue, gross profit, OPEX, net profit, sales count). |
| FREQ-41 | Functional | High | S8, V7 | The system shall show counts of active products, customers, and low-stock items. |
| FREQ-42 | Functional | Medium | S8, V7 | The system shall provide a **revenue trend** chart over a configurable number of days. |
| FREQ-43 | Functional | Medium | S8, V7 | The system shall provide a **top products** report for a configurable period. |

### 2.8 AI insights and assistant

| ID | Type | Priority | Source | Description |
|----|------|----------|--------|-------------|
| FREQ-44 | Functional | Medium | S8, V7 | The system shall generate **rule-based business insights** from live tenant data without an external LLM. |
| FREQ-45 | Functional | Medium | S8, V8 | The system shall allow owner/manager to configure an optional OpenRouter API key for LLM chat. |
| FREQ-46 | Functional | Medium | S8, V8 | The system shall stream AI assistant replies (SSE) using organization business context. |
| FREQ-47 | Functional | Low | S8, V8 | The system shall persist AI conversation threads and messages per user within the tenant. |

### 2.9 User interface and localization

| ID | Type | Priority | Source | Description |
|----|------|----------|--------|-------------|
| FREQ-48 | Functional | Medium | V1–V8 | The system shall provide web screens for landing, auth, dashboard, POS, inventory, customers, sales, expenses, team, and assistant. |
| FREQ-49 | Functional | Medium | V1–V8 | The system shall support **English** and **Amharic** UI labels via localization files. |
| FREQ-50 | Functional | Medium | V1–V8 | The system shall support **light**, **dark**, and **system** theme preference. |

---

## 3. Non-functional requirements

| ID | Type | Priority | Source | Description |
|----|------|----------|--------|-------------|
| FREQ-51 | Non-Functional | High | S7, V3, V5 | The system shall isolate all tenant data by **organizationId** on every query (multi-tenancy). |
| FREQ-52 | Non-Functional | High | S2, V3 | The system shall use **decimal** types for monetary values (no floating-point money). |
| FREQ-53 | Non-Functional | High | S7, V3 | The system shall handle **concurrent** checkout attempts safely via database transactions and stock checks. |
| FREQ-54 | Non-Functional | High | S7, V5 | The system shall authenticate API requests with **JWT** verified against Supabase JWKS. |
| FREQ-55 | Non-Functional | High | V1–V8 | The system shall respond to dashboard and list APIs within acceptable time for SME daily use (target &lt; 3 s on broadband). |
| FREQ-56 | Non-Functional | Medium | V3 | The POS workflow shall be optimized for **desktop-first** counter use (keyboard/mouse). |
| FREQ-57 | Non-Functional | Medium | V1–V8 | The system shall be deployable as a **web SaaS** (browser client, REST API, PostgreSQL). |
| FREQ-58 | Non-Functional | Medium | V8 | The system shall **encrypt** stored third-party API keys (OpenRouter) per user. |
| FREQ-59 | Non-Functional | Medium | V1–V8 | The system shall document HTTP APIs with **OpenAPI / Swagger** for integrators and testers. |
| FREQ-60 | Non-Functional | Low | V1–V8 | The system shall support horizontal scaling of the stateless API tier (no session state on server). |
| FREQ-61 | Non-Functional | Low | V1–V8 | Mobile-responsive layout is **deferred**; acceptable for MVP desktop-first scope. |

---

## 4. Requirements traceability matrix

| Visionary | Key functional requirements |
|-----------|----------------------------|
| V1 | FREQ-1 – FREQ-8 |
| V2 | FREQ-9 – FREQ-15 |
| V3 | FREQ-16 – FREQ-24 |
| V4 | FREQ-25 – FREQ-28 |
| V5 | FREQ-7, FREQ-29 – FREQ-32 |
| V6 | FREQ-33 – FREQ-39 |
| V7 | FREQ-40 – FREQ-44 |
| V8 | FREQ-45 – FREQ-47 |
| All | FREQ-48 – FREQ-50, FREQ-51 – FREQ-61 |

---

## 5. Sample requirement tables (lab style)

### Table 1 — Registration (from S7, V1)

| Attribute | Value |
|-----------|-------|
| **ID** | FREQ-1 |
| **Type** | Functional |
| **Priority** | High |
| **Description** | The system shall allow registering an organization with a unique owner account. |

### Table 2 — Atomic POS (from S2, S7, V3)

| Attribute | Value |
|-----------|-------|
| **ID** | FREQ-18 |
| **Type** | Functional |
| **Priority** | High |
| **Description** | The system shall process checkout in a single transaction including stock decrement and profit calculation. |

### Table 3 — Net profit (from S6, S8, V6)

| Attribute | Value |
|-----------|-------|
| **ID** | FREQ-38 |
| **Type** | Functional |
| **Priority** | High |
| **Description** | The system shall display net profit as gross profit minus operating expenses for the selected period. |

### Table 4 — Tenant isolation (non-functional)

| Attribute | Value |
|-----------|-------|
| **ID** | FREQ-51 |
| **Type** | Non-Functional |
| **Priority** | High |
| **Description** | The system shall scope all business data to the authenticated user’s organization. |

---

## 6. Implementation reference (as built)

| Area | Primary implementation |
|------|------------------------|
| Auth | `apps/api/src/auth/`, `POST /api/v1/auth/register`, `login`, `refresh` |
| RBAC | `apps/api/src/auth/permissions.ts`, `apps/web/src/lib/roles.ts` |
| Inventory | `/api/v1/categories`, `/api/v1/products` |
| POS / sales | `POST /api/v1/sales` (Prisma `$transaction`) |
| Customers | `/api/v1/customers` |
| Expenses | `/api/v1/expenses`, `/api/v1/expense-categories` |
| Dashboard | `/api/v1/dashboard/summary`, `revenue-trend`, `top-products` |
| AI | `/api/v1/ai/insights`, `/api/v1/ai/chat/stream` |
| Schema | `apps/api/prisma/schema.prisma` |

---

## Document status

| Item | File | Status |
|------|------|--------|
| Scenarios | `senarios.md` | Complete |
| Requirements | `requirment.md` | Complete |
| Business rules | `businessrule.md` | Complete |

---

*Prepared following OOSE Lab Manual Task 3, adapted for SME Ops.*

# SME Ops — Business Rules Documentation (OOSE Lab Format)

**Project:** SME Ops (SME Optimizer)  
**Related documents:** [senarios.md](./senarios.md), [requirment.md](./requirment.md)  
**Notation:** S*n* = AS-IS scenario, V*n* = Visionary scenario, BR-*n* = Business rule

This document lists **implicit rules** elicited from each scenario (Lab Task 3 — business rules). Rules govern valid states and operations regardless of UI flow.

---

## 1. Business rule attribute model

| Attribute | Description |
|-----------|-------------|
| **Business Rule Id** | `BR-n` |
| **Name** | Short title |
| **Description** | Rule statement |
| **Source** | Scenario(s) where the rule appears |
| **Enforcement** | Where implemented (API, DB, UI) |

---

## 2. Security, tenancy, and access control

| Rule ID | Name | Description | Source | Enforcement |
|---------|------|-------------|--------|-------------|
| BR-1 | Authorized access | Only authenticated users with a valid JWT may call protected APIs. | S7, V1, V5 | Auth guard, JWT verification (Supabase JWKS) |
| BR-2 | Tenant isolation | Every business record belongs to exactly one **organization**; queries must filter by `organizationId` from the user profile. | S7, V1 | Prisma services, tenant guard |
| BR-3 | Role permissions | A user may only perform actions allowed for their **UserRole** (Owner, Manager, Inventory Manager, Cashier). | S7, V5 | `permissions.ts`, web route guards |
| BR-4 | Owner-only team | Only **OWNER** may invite employees or change employee roles. | S7, V5 | `employees` API — `API_ROLE_ACCESS.employees` |
| BR-5 | No owner via invite | An employee cannot be assigned role **OWNER** through the invite or role-change API. | V5 | Employees service validation |
| BR-6 | Owner role immutable | The OWNER’s role cannot be changed to another role via the employee role endpoint. | V5 | Employees service validation |

---

## 3. Organization and registration

| Rule ID | Name | Description | Source | Enforcement |
|---------|------|-------------|--------|-------------|
| BR-7 | Unique organization slug | Each organization must have a unique **slug** derived from its name. | V1 | Registration transaction, DB unique constraint |
| BR-8 | Default currency | New organizations default to currency **ETB** unless configured otherwise. | V1 | Registration defaults in schema |
| BR-9 | One owner per registration | Registering creates exactly one user with role OWNER for the new organization. | V1 | `POST /auth/register` transaction |
| BR-10 | Registration atomicity | If database profile creation fails after auth user creation, the orphan auth user shall be removed (rollback). | V1 | Auth register service |

---

## 4. Products, categories, and inventory

| Rule ID | Name | Description | Source | Enforcement |
|---------|------|-------------|--------|-------------|
| BR-11 | Unique category name | Category names must be unique within an organization. | S1, V2 | DB unique `(organizationId, name)` |
| BR-12 | Product belongs to tenant | A product must reference a category in the same organization. | S1, V2 | API validation |
| BR-13 | Non-negative stock | `stockQuantity` must not be negative. | S1, S4, V2 | Schema + validation |
| BR-14 | Low-stock definition | A product is **low stock** when `minStock > 0` and `stockQuantity ≤ minStock`. | S4, V2, V7 | Dashboard + product list filters |
| BR-15 | Archive instead of delete | Products are not physically deleted; they are set to status **ARCHIVED** to preserve sale history. | S1, V2 | `DELETE /products/:id` → archive |
| BR-16 | Active product for sale | Only **ACTIVE** products may be sold at POS. | S2, V3 | Sales service validation |
| BR-17 | Inventory write roles | Only Owner, Manager, and Inventory Manager may create or update products and categories. | S7, V2, V5 | `categoriesWrite`, `productsWrite` |

---

## 5. Point of sale and sales

| Rule ID | Name | Description | Source | Enforcement |
|---------|------|-------------|--------|-------------|
| BR-18 | Stock sufficiency | A sale line quantity must not exceed current `stockQuantity` for that product. | S2, S7, V3 | Pre-transaction check in `POST /sales` |
| BR-19 | Stock on sale | When a sale completes successfully, product stock decreases by the sold quantity. | S2, V3 | Same Prisma transaction |
| BR-20 | Sale atomicity | Sale creation, line items, stock updates, and customer `totalSpent` update succeed or fail together. | S2, S7, V3 | `prisma.$transaction` |
| BR-21 | Price snapshot | Each `SaleItem` stores `productName`, `buyPriceAtSale`, and `sellPriceAtSale` at checkout time. | S2, S5, V3 | Sales service on create |
| BR-22 | Historical immutability | Changing a product’s current prices does not alter past sale line snapshots. | S2, V3 | Immutable `SaleItem` fields |
| BR-23 | Profit per sale | Sale **profit** is derived from line profits (sell − buy) minus discounts according to service logic. | S2, V3 | Sales service calculation |
| BR-24 | Cashier attribution | Every sale records the authenticated user as **cashierId**. | S5, V3 | Sales create DTO |
| BR-25 | Valid customer on sale | If a customer is specified, they must exist in the same organization. | S3, V4 | Sales validation |
| BR-26 | Customer spend update | Linking a customer on sale increases that customer’s **totalSpent** by the sale total. | S3, V4 | Transaction update |
| BR-27 | Payment method enum | Payment method must be one of: CASH, MOBILE_MONEY, CARD (latter two reserved for future integrations). | S2, V3 | Enum + schema |

---

## 6. Customers

| Rule ID | Name | Description | Source | Enforcement |
|---------|------|-------------|--------|-------------|
| BR-28 | Customer tenant scope | Customers belong to one organization; cross-tenant customer use is forbidden. | S3, V4 | Tenant-scoped queries |
| BR-29 | Customer delete preserves sales | Deleting a customer sets `customerId` to null on past sales; sales rows are not deleted. | S3, V4 | Prisma `onDelete: SetNull` |
| BR-30 | Customer delete roles | Only Owner and Manager may delete customers. | S7, V4 | `customersDelete` permission |

---

## 7. Operating expenses and reporting

| Rule ID | Name | Description | Source | Enforcement |
|---------|------|-------------|--------|-------------|
| BR-31 | Expense tenant scope | Expenses and categories are scoped to the organization. | S6, V6 | Tenant guard |
| BR-32 | Expense roles | Only Owner and Manager may read or write expenses. | S6, V6 | `expensesRead`, `expensesWrite` |
| BR-33 | Default expense categories | On first list of expense categories, system seeds Rent, Salaries, Transport, Utilities, Other if none exist. | S6, V6 | Expense categories service |
| BR-34 | Category delete guard | An expense category cannot be deleted if any expense references it. | S6, V6 | Service validation |
| BR-35 | Net profit formula | For a period, **net profit = gross profit from sales − sum of operating expenses** in that period. | S6, S8, V6 | Dashboard summary service |
| BR-36 | Gross profit from sales | Gross profit is computed from completed sales’ profit fields, not from current product catalog prices alone. | S8, V6, V7 | Dashboard aggregation |
| BR-37 | Expense recorder | Each expense records which user (**recordedById**) created it. | S6, V6 | Expense create |

---

## 8. Dashboard and AI

| Rule ID | Name | Description | Source | Enforcement |
|---------|------|-------------|--------|-------------|
| BR-38 | Dashboard roles | Only Owner and Manager may access dashboard and AI insight endpoints. | S8, V7 | `dashboard`, `aiInsights` permissions |
| BR-39 | Insights without LLM | Rule-based insights must be derivable from tenant data without requiring an external API key. | S8, V7 | `AiService` deterministic rules |
| BR-40 | AI chat key required | LLM assistant chat requires the user to configure a valid OpenRouter API key in settings. | V8 | AI assistant service |
| BR-41 | AI context tenant-bound | AI context builders may only include data from the user’s organization. | V8 | `AiContextService` scoped queries |
| BR-42 | Conversation ownership | AI conversations belong to the creating user within their organization. | V8 | Schema relations |

---

## 9. Money and data integrity

| Rule ID | Name | Description | Source | Enforcement |
|---------|------|-------------|--------|-------------|
| BR-43 | No float money | All monetary amounts use `Decimal` in the database (never binary floating point). | S2, S6, V3, V6 | Prisma `Decimal` columns |
| BR-44 | Positive sale amounts | Sale totals and line totals must be consistent with quantities and prices (validated on create). | S2, V3 | Zod DTO + service |
| BR-45 | Restrict product delete | Products referenced by sale items cannot be hard-deleted (use archive). | S2, V3 | FK `Restrict` on `SaleItem.product` |

---

## 10. Business rules by scenario (implicit rules index)

| Scenario | Business rules |
|----------|----------------|
| **S1 / V2** | BR-11 – BR-17 |
| **S2 / V3** | BR-16, BR-18 – BR-27, BR-43 – BR-45 |
| **S3 / V4** | BR-25 – BR-30 |
| **S4 / V2, V7** | BR-13, BR-14 |
| **S5 / V3, V7** | BR-21 – BR-24, BR-36 |
| **S6 / V6** | BR-31 – BR-37 |
| **S7 / V1, V3, V5** | BR-1 – BR-6, BR-18 – BR-20 |
| **S8 / V7, V8** | BR-35 – BR-42 |

---

## 11. Role × feature matrix (supports BR-3)

| Feature | Owner | Manager | Inventory Mgr | Cashier |
|---------|:-----:|:-------:|:-------------:|:-------:|
| Dashboard & net profit | ✓ | ✓ | — | — |
| AI insights & assistant | ✓ | ✓ | — | — |
| POS checkout | ✓ | ✓ | — | ✓ |
| Sales history | ✓ | ✓ | — | ✓ |
| Inventory UI (write) | ✓ | ✓ | ✓ | — |
| Product read (POS) | ✓ | ✓ | ✓ | ✓ |
| Customers (CRUD) | ✓ | ✓ | — | ✓ |
| Delete customer | ✓ | ✓ | — | — |
| Operating expenses | ✓ | ✓ | — | — |
| Team management | ✓ | — | — | — |

---

## 12. Sample business rule tables (lab style)

### Table 1 — Tenant isolation (from S7, V1)

| Attribute | Value |
|-----------|-------|
| **Business Rule Id** | BR-2 |
| **Description** | All business data must be scoped to the authenticated user’s organization. |

### Table 2 — Stock on sale (from S2, V3)

| Attribute | Value |
|-----------|-------|
| **Business Rule Id** | BR-19 |
| **Description** | Completing a sale decreases product stock by the quantity sold. |

### Table 3 — Net profit (from S6, V6)

| Attribute | Value |
|-----------|-------|
| **Business Rule Id** | BR-35 |
| **Description** | Net profit equals gross profit from sales minus operating expenses for the period. |

### Table 4 — Sale atomicity (from S7, V3)

| Attribute | Value |
|-----------|-------|
| **Business Rule Id** | BR-20 |
| **Description** | A checkout operation must be all-or-nothing: no partial sale with updated stock. |

---

## Document status

| Item | File | Status |
|------|------|--------|
| Scenarios | `senarios.md` | Complete |
| Requirements | `requirment.md` | Complete |
| Business rules | `businessrule.md` | Complete |

---

*Prepared following OOSE Lab Manual Task 3 (implicit rules per scenario), aligned with implemented SME Ops behavior.*

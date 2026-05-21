# SME Ops — Scenario Documentation (OOSE Lab Format)

**Project:** SME Ops (SME Optimizer)  
**Case study organization:** Abel Mini Market (buy-and-resell retail SME, Ethiopia)  
**Notation:** S*n* = AS-IS scenario *n* (current workflow, no system); V*n* = Visionary scenario *n* (with SME Ops)

This document completes **Lab Task 1** (identify problems from AS-IS) and **Lab Task 2** (visionary scenarios with improvements). Functional and non-functional requirements are in **`requirment.md`**; business rules are in **`businessrule.md`**.

---

## Part A — AS-IS Scenarios (Current Workflow, No System)

### Scenario 1: Manual Product and Stock Recording in a Notebook

Abel opens his mini market. New stock arrives from a supplier. The inventory clerk writes each product name, buy price, sell price, and quantity in a large notebook. Categories are grouped by handwriting in different sections.

When a product sells, the clerk is supposed to subtract quantity by hand, but during busy hours updates are skipped until closing time.

Sometimes the same product is listed twice on different pages with different prices. When Abel asks “how many bottles of cooking oil are left?”, the clerk flips through pages and estimates.

**Problems and inefficiencies**

| # | Problem |
|---|---------|
| P1-1 | No single source of truth for stock quantity |
| P1-2 | Handwritten updates lag behind actual sales |
| P1-3 | Duplicate or inconsistent product entries |
| P1-4 | Slow lookup; errors in spelling and pricing |
| P1-5 | No automatic low-stock warning |

---

### Scenario 2: Paper-Based Checkout at the Counter

Sara is the cashier. A customer brings items to the counter. Sara adds prices on a calculator or in her head, writes the total on a paper slip, and collects cash.

She does not reduce stock in the notebook immediately. Payment method (cash vs mobile) is noted inconsistently.

At night, Sara totals slips in a separate ledger. If a line item price was wrong, correcting historical totals is difficult.

**Problems and inefficiencies**

| # | Problem |
|---|---------|
| P2-1 | Checkout is disconnected from live inventory |
| P2-2 | No enforced link between sale and stock decrement |
| P2-3 | Profit per sale is unknown until manual calculation |
| P2-4 | Paper slips can be lost or illegible |
| P2-5 | Discounts and payment types are recorded inconsistently |

---

### Scenario 3: Customer Follow-Up Without a Central Record

A regular customer, Musa, asks for credit or a discount on his next visit. The cashier remembers Musa’s face but not his total spend or last purchase date.

Another staff member served Musa last week; there is no shared customer file. Musa’s phone number is saved in a personal phone contact list.

When Musa returns, staff cannot quickly see purchase history or link today’s sale to his profile.

**Problems and inefficiencies**

| # | Problem |
|---|---------|
| P3-1 | No organization-wide customer database |
| P3-2 | No spend history or loyalty context at POS |
| P3-3 | Duplicate or missing customer details across staff |
| P3-4 | Cannot attach a sale to a customer for reporting |

---

### Scenario 4: Physical Stock Check Before Reordering

The inventory manager, Hana, walks the shelves weekly with a clipboard. She compares shelf count to the notebook and marks differences.

Low-stock decisions depend on memory (“we usually run out of sugar before holidays”). Min-stock levels are not formalized.

Abel orders from suppliers based on Hana’s verbal report. Overstock and stock-outs both occur.

**Problems and inefficiencies**

| # | Problem |
|---|---------|
| P4-1 | Stock checks are periodic, not real-time |
| P4-2 | No systematic low-stock threshold |
| P4-3 | Reordering relies on intuition |
| P4-4 | Discrepancies between shelf, notebook, and sales |

---

### Scenario 5: End-of-Day Sales Reconciliation on Paper

At closing, Abel and Sara count cash in the drawer and sum paper receipts. They compare the total to the notebook’s “expected” sales.

If the cashier forgot to log a sale, cash and records do not match. They spend time finding missing slips.

Completed sales, voids, and discounts are not categorized in a standard report.

**Problems and inefficiencies**

| # | Problem |
|---|---------|
| P5-1 | Manual reconciliation is slow and error-prone |
| P5-2 | Missing entries discovered only at day end |
| P5-3 | No audit trail per cashier or payment method |
| P5-4 | Management cannot see intraday performance |

---

### Scenario 6: Operating Expenses in a Separate Cash Book

Rent, salaries, transport, and utilities are written in a different notebook from sales. Abel pays rent in cash and records it when he remembers.

At month end, Abel tries to subtract “all expenses” from “all sales” to estimate net profit. Some expense entries are missing dates or categories.

Gross sales look good, but Abel is unsure of true net profit.

**Problems and inefficiencies**

| # | Problem |
|---|---------|
| P6-1 | Expenses are not linked to sales data |
| P6-2 | No standard expense categories |
| P6-3 | Net profit requires manual, delayed calculation |
| P6-4 | Incomplete or backdated expense entries |

---

### Scenario 7: Multiple Staff Selling Without a Shared Stock View

Abel employs a manager, inventory clerk, and cashier. Each uses the same notebook, but two people sometimes sell the last unit of the same product without updating the book in time.

The manager authorizes a discount on the counter while the owner is away; there is no log of who changed prices.

New employees learn processes verbally; access to sensitive actions (inviting staff, seeing full financials) is not technically enforced.

**Problems and inefficiencies**

| # | Problem |
|---|---------|
| P7-1 | Concurrent sales cause stock conflicts |
| P7-2 | No role-based permissions |
| P7-3 | No central schedule of who did what |
| P7-4 | Onboarding and access control are informal |

---

### Scenario 8: Monthly Business Review Without Integrated Analytics

Abel meets with his manager at month end. They estimate revenue from the sales ledger, guess top products, and discuss expenses from memory.

Decisions about which products to promote or discontinue are based on intuition, not charts. Trends (weekly revenue, margin) are not available on demand.

There is no assistant to summarize “what should I reorder?” from live data.

**Problems and inefficiencies**

| # | Problem |
|---|---------|
| P8-1 | Reporting is monthly and manual |
| P8-2 | Top products and trends are guessed, not measured |
| P8-3 | No real-time dashboard for owner/manager |
| P8-4 | No data-driven insights or AI support |

---

## Part B — Visionary Scenarios (With SME Ops)

### Scenario V1: Digital Organization Registration and Owner Onboarding  
*(from Scenario 1 — informal shop setup; supports all later scenarios)*

**Observations (AS-IS gap)**

- No formal tenant boundary for one business  
- Owner account and shop data are not created together  
- Currency and organization settings are implicit  

**Visionary narrative**

Abel decides to use SME Ops. On the registration page he enters **Abel Mini Market**, his name, email, and password. The system creates a Supabase auth account, an **Organization** (tenant) with currency **ETB**, and his **User** profile with role **OWNER** in one transaction.

He logs in and is redirected to the dashboard. If he tries to register again with the same email, the system rejects duplicate registration.

**Improvements over AS-IS**

- One-step org + owner provisioning  
- Unique tenant (`organizationId`) for all data  
- Secure authentication (JWT) instead of shared notebooks  
- Clear owner role for later team management  

---

### Scenario V2: Centralized Product Catalog and Real-Time Inventory  
*(from Scenario 1, Scenario 4)*

**Observations**

- Notebook stock is stale and duplicated  
- No categories, archive, or min-stock rules  

**Visionary narrative**

Hana logs in as **INVENTORY_MANAGER** and opens **Inventory**. She creates categories (e.g. Groceries, Beverages) and adds products with buy price, sell price, quantity, and minimum stock.

When Abel sells 3 units at POS, stock decreases immediately in the database. The dashboard shows a **low-stock** list when `stockQuantity ≤ minStock`.

A discontinued item is **archived** instead of deleted, so past sales reports stay accurate.

**Improvements over AS-IS**

- Single catalog per organization  
- Real-time quantity after each sale  
- Low-stock visibility without a full shelf walk  
- Historical integrity via archived products and price snapshots on sales  

---

### Scenario V3: Atomic POS Checkout at the Counter  
*(from Scenario 2, Scenario 5, Scenario 7)*

**Observations**

- Paper checkout does not update stock atomically  
- Concurrent staff can oversell the same SKU  
- Profit and payment method are inconsistent  

**Visionary narrative**

Sara logs in as **CASHIER** and opens **POS**. She searches products, adds them to the cart, optionally selects customer Musa, applies a discount, and chooses payment method **CASH**.

On confirm, the system runs one **transaction**: validates stock, creates **Sale** and **SaleItem** rows with snapshotted names and prices, decrements stock, updates Musa’s **totalSpent**, and stores **profit** on the sale.

If stock is insufficient, the sale is rejected with a clear message—no partial update.

**Improvements over AS-IS**

- Checkout and inventory stay consistent  
- Concurrent checkouts handled safely per SKU  
- Per-sale profit recorded automatically  
- Sales history available for reconciliation without paper slips  

---

### Scenario V4: Customer Registry and Spend History at POS  
*(from Scenario 3)*

**Observations**

- Customer data is fragmented across phones and memory  
- No link between customer and sales for analytics  

**Visionary narrative**

Sara opens **Customers**, registers Musa with phone and address, and links him during POS checkout. Later, the owner views Musa’s profile and sees recent sales and total spend.

When Musa is deleted (by manager/owner), past sales remain in history with customer unlinked (`SetNull`), preserving audit integrity.

**Improvements over AS-IS**

- Shared customer database for the whole shop  
- Spend history visible at counter and in back office  
- Optional customer on each sale for reporting  

---

### Scenario V5: Role-Based Team Management  
*(from Scenario 7)*

**Observations**

- Verbal rules for who may do what  
- No secure invite flow for employees  

**Visionary narrative**

Abel opens **Team** (owner only). He invites `manager@abelmarket.et` as **MANAGER**, `inventory@...` as **INVENTORY_MANAGER**, and `cashier@...` as **CASHIER**. Each receives credentials and sees only allowed menus (e.g. cashier → POS and sales, not expenses or team).

Abel changes a role from Cashier to Manager via **PATCH role**; the system blocks assigning **OWNER** through the API.

**Improvements over AS-IS**

- Enforced role-based UI and API access  
- Documented permission matrix (owner, manager, inventory, cashier)  
- Safer onboarding than verbal handover of notebooks  

---

### Scenario V6: Operating Expenses and Net Profit on the Dashboard  
*(from Scenario 6, Scenario 8)*

**Observations**

- Expenses live in a separate book from sales  
- Net profit is calculated late and manually  

**Visionary narrative**

The manager opens **Expenses**. On first use, the system seeds categories: Rent, Salaries, Transport, Utilities, Other. She records rent paid today with amount, date, and category.

On **Dashboard**, Abel selects **This month** and sees revenue, gross profit, operating expenses, and **net profit** (gross profit − OPEX) in one view—without month-end manual merging.

**Improvements over AS-IS**

- Expenses stored with categories and dates in the same system as sales  
- Net profit visible by period (today / week / month)  
- No separate cash book reconciliation for management view  

---

### Scenario V7: Real-Time Analytics and Rule-Based Business Insights  
*(from Scenario 5, Scenario 8)*

**Observations**

- End-of-day and month-end counts are manual  
- No charts for revenue trend or top products  

**Visionary narrative**

Abel opens **Dashboard** and toggles **7 / 30 / 90 days**. Charts show revenue trend and top-selling products. KPI cards show sales count, active products, customers, and low-stock count.

The **Insights** panel calls `GET /ai/insights` and displays rule-based cards (e.g. margin trend, low-stock warning)—generated from live tenant data without manual tallying.

**Improvements over AS-IS**

- Automatic daily/weekly/monthly aggregates  
- Visual trends instead of notebook estimates  
- Actionable insight cards for owners and managers  

---

### Scenario V8: AI Business Assistant with Tenant Context  
*(from Scenario 8 — extended)*

**Observations**

- No on-demand answers from shop data  
- External advice is generic, not tied to Abel Mini Market  

**Visionary narrative**

Abel opens **Assistant**, adds his OpenRouter API key in settings, and asks: “Which products are low stock and how were sales this week?” The system builds context from his organization’s dashboard and catalog, streams a reply via SSE, and saves the thread in **AIConversation** history.

If no API key is configured, he still uses rule-based insights on the dashboard; chat requires explicit setup.

**Improvements over AS-IS**

- Natural-language questions over real business data  
- Conversation history per user within the tenant  
- Optional LLM while core ops remain deterministic and reliable  

---

## Part C — AS-IS ↔ Visionary Traceability

| AS-IS | Visionary | SME Ops capability (summary) |
|-------|-----------|------------------------------|
| S1 | V1, V2 | Register org/owner; products & categories |
| S2 | V3 | POS checkout (`POST /sales` transaction) |
| S3 | V4 | Customers CRUD + link to sales |
| S4 | V2, V7 | Min stock, low-stock KPI, dashboard |
| S5 | V3, V7 | Sales history, dashboard summary |
| S6 | V6 | Expense categories & expenses; net profit KPI |
| S7 | V3, V5 | Atomic stock; roles & team invite |
| S8 | V7, V8 | Dashboard charts; insights & AI assistant |

---

## Part D — Actors

Full actor and role documentation (Lab Task 4): **[actors.md](./actors.md)**.

---

## Document status

| Item | Status |
|------|--------|
| AS-IS scenarios (S1–S8) | Complete |
| Visionary scenarios (V1–V8) | Complete |
| Functional / non-functional requirements | Complete — `requirment.md` |
| Business rules | Complete — `businessrule.md` |
| Actors & roles | Complete — `actors.md` |
| Use cases (from scenarios) | Complete — `usecases.md` |
| Use case descriptions (Task 6) | Complete — `use-case-descriptions.md` |
| UML diagrams (Tasks 7+) | Complete — `diagrams/` |

---

*Prepared following the OOSE Lab Manual structure (Smart Clinic case study as template), adapted for the SME Ops multi-tenant retail platform.*

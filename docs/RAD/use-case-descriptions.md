# SME Ops — Use Case Descriptions (OOSE Lab Task 6)

**Project:** SME Ops (SME Optimizer)  
**Related:** [usecases.md](./usecases.md), [senarios.md](./senarios.md), [actors.md](./actors.md), [businessrule.md](./businessrule.md)

Format per lab template: **Use Case ID**, **Use Case Name**, **Actors**, **Preconditions**, **Main Flow**, **Alternate Flow**, **Includes**, **Extends**, **Postcondition**.

---

## UC1 — Register organization and owner account

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC1 |
| **Use Case Name** | Register organization and owner account |
| **Actors** | Guest |
| **Preconditions** | Guest is not logged in; email is not already registered |
| **Main Flow** | 1. Guest opens the registration page.<br>2. Guest enters organization name, owner name, email, and password.<br>3. System validates the input.<br>4. System creates Supabase auth user, organization (tenant), and owner profile with role OWNER.<br>5. System returns access and refresh tokens.<br>6. Guest is redirected to the dashboard. |
| **Alternate Flow** | **3a.** Validation fails → system shows errors; guest corrects the form.<br>**4a.** Email already exists → system rejects registration; guest remains on the page.<br>**4b.** Database fails after auth user is created → system returns error; orphan auth user may require cleanup. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | Organization and owner user exist; guest holds a valid session |

---

## UC2 — Login

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC2 |
| **Use Case Name** | Login |
| **Actors** | Guest, Owner, Manager, Inventory Manager, Cashier |
| **Preconditions** | User account exists in Supabase and local profile is complete |
| **Main Flow** | 1. Actor opens the login page.<br>2. Actor enters email and password.<br>3. System authenticates via Supabase.<br>4. System loads user profile and role.<br>5. System returns JWT tokens.<br>6. System redirects actor to the default route for their role. |
| **Alternate Flow** | **3a.** Invalid credentials → system shows error; actor remains on login page.<br>**4a.** Auth succeeds but profile missing → system shows “account incomplete” message. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | Actor is authenticated with a valid JWT session |

---

## UC3 — Manage product categories

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC3 |
| **Use Case Name** | Manage product categories |
| **Actors** | Inventory Manager, Owner, Manager |
| **Preconditions** | Actor is authenticated with category write permission |
| **Main Flow** | 1. Actor opens the inventory page.<br>2. Actor opens category management.<br>3. Actor creates or edits a category name.<br>4. Actor confirms save.<br>5. System stores the category scoped to the organization.<br>6. System refreshes the category list. |
| **Alternate Flow** | **4a.** Duplicate category name in tenant → system rejects save and shows error.<br>**5a.** Actor deletes unused category → system removes category if no products reference it. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | Category list is updated for the tenant |

---

## UC4 — Manage products (catalog, prices, stock)

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC4 |
| **Use Case Name** | Manage products (catalog, prices, stock) |
| **Actors** | Inventory Manager, Owner, Manager |
| **Preconditions** | Actor has product write permission; at least one category may exist |
| **Main Flow** | 1. Actor opens the inventory page.<br>2. System displays the product list (search/filter optional).<br>3. Actor creates or selects a product to edit.<br>4. Actor enters name, category, buy price, sell price, stock quantity, and minimum stock.<br>5. Actor confirms save.<br>6. System validates and stores the product under the tenant. |
| **Alternate Flow** | **6a.** Invalid prices or negative stock → system rejects save.<br>**3a.** Actor searches with no results → system shows empty list. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | Product record exists or is updated in the catalog |

---

## UC5 — Archive product

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC5 |
| **Use Case Name** | Archive product |
| **Actors** | Inventory Manager, Owner, Manager |
| **Preconditions** | Product exists and may have past sales history |
| **Main Flow** | 1. Actor selects a product on the inventory page.<br>2. Actor chooses archive (soft delete).<br>3. System sets product status to ARCHIVED.<br>4. System removes product from active POS listing. |
| **Alternate Flow** | **3a.** Product already archived → system shows current status; no change. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | Product is ARCHIVED; historical sale lines remain unchanged |

---

## UC6 — Record sale (POS checkout)

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC6 |
| **Use Case Name** | Record sale (POS checkout) |
| **Actors** | Cashier, Owner, Manager |
| **Preconditions** | Actor has sales permission; cart has at least one line; products are ACTIVE |
| **Main Flow** | 1. Cashier opens the POS page.<br>2. Cashier adds products and quantities to the cart.<br>3. Cashier optionally selects a customer.<br>4. Cashier sets discount and payment method.<br>5. Cashier confirms checkout.<br>6. System validates stock and runs a single transaction (sale, lines, stock, customer total).<br>7. System displays success and clears the cart. |
| **Alternate Flow** | **6a.** Insufficient stock → system aborts; shows which product failed.<br>**6b.** Archived or invalid product → system rejects line.<br>**6c.** Network or server error → no partial sale is committed. |
| **Includes** | UC7 Validate stock availability; UC8 Apply discount and payment method; UC9 Decrement stock on sale |
| **Extends** | UC13 Link customer to sale (optional step 3) |
| **Postcondition** | Sale exists; stock decreased; profit recorded; optional customer total updated |

---

## UC7 — Validate stock availability

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC7 |
| **Use Case Name** | Validate stock availability |
| **Actors** | System |
| **Preconditions** | Checkout has been initiated with line quantities |
| **Main Flow** | 1. System reads current stock for each cart line.<br>2. System compares requested quantity to available stock.<br>3. System allows checkout to continue only if all lines pass. |
| **Alternate Flow** | **2a.** Any line exceeds stock → system fails validation and returns error to UC6. |
| **Includes** | None (included by UC6) |
| **Extends** | None |
| **Postcondition** | Stock validation passed or checkout aborted |

---

## UC8 — Apply discount and payment method

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC8 |
| **Use Case Name** | Apply discount and payment method |
| **Actors** | Cashier |
| **Preconditions** | POS cart is open |
| **Main Flow** | 1. Cashier enters discount amount (if any).<br>2. Cashier selects payment method (e.g. CASH).<br>3. System recalculates cart subtotal, discount, and total for display. |
| **Alternate Flow** | **1a.** Discount exceeds subtotal → system caps or rejects per validation rules. |
| **Includes** | None (included by UC6) |
| **Extends** | None |
| **Postcondition** | Sale totals and payment method are set for checkout |

---

## UC9 — Decrement stock on sale

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC9 |
| **Use Case Name** | Decrement stock on sale |
| **Actors** | System |
| **Preconditions** | Stock validation succeeded; sale transaction in progress |
| **Main Flow** | 1. System creates sale and line items with price snapshots.<br>2. System reduces each product’s stock quantity by sold amount.<br>3. System commits the transaction. |
| **Alternate Flow** | **2a.** Concurrent sale caused race → transaction rolls back; UC6 shows error. |
| **Includes** | None (included by UC6) |
| **Extends** | None |
| **Postcondition** | Product stock reflects the completed sale |

---

## UC10 — List and filter sales history

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC10 |
| **Use Case Name** | List and filter sales history |
| **Actors** | Cashier, Manager, Owner |
| **Preconditions** | Actor is authenticated with sales read permission |
| **Main Flow** | 1. Actor opens the sales history page.<br>2. Actor optionally sets date range, customer, or payment filters.<br>3. System retrieves matching sales for the tenant.<br>4. System displays the sales list. |
| **Alternate Flow** | **3a.** No sales match filters → system shows empty list. |
| **Includes** | None |
| **Extends** | UC11 View sale receipt detail |
| **Postcondition** | Actor views filtered sales list |

---

## UC11 — View sale receipt detail

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC11 |
| **Use Case Name** | View sale receipt detail |
| **Actors** | Cashier, Manager, Owner |
| **Preconditions** | Sale exists in the tenant |
| **Main Flow** | 1. Actor selects a sale from the list.<br>2. System loads sale header and line items (snapshotted prices).<br>3. System displays receipt detail (cashier, customer, payment, profit). |
| **Alternate Flow** | **2a.** Sale not found → system shows not found message. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | Actor has viewed complete sale detail |

---

## UC12 — Create or update customer

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC12 |
| **Use Case Name** | Create or update customer |
| **Actors** | Cashier, Manager, Owner |
| **Preconditions** | Actor has customer write permission |
| **Main Flow** | 1. Actor opens the customers page.<br>2. Actor opens create or edit form.<br>3. Actor enters name and optional phone and address.<br>4. Actor confirms save.<br>5. System stores the customer under the tenant. |
| **Alternate Flow** | **4a.** Required fields missing → system shows validation errors. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | Customer record exists or is updated |

---

## UC13 — Link customer to sale

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC13 |
| **Use Case Name** | Link customer to sale |
| **Actors** | Cashier |
| **Preconditions** | POS cart is open; customer exists (or is created first via UC12) |
| **Main Flow** | 1. Cashier searches or selects a customer on POS.<br>2. System attaches customer to the current cart.<br>3. On checkout (UC6), system links customerId on the sale and updates total spent. |
| **Alternate Flow** | **1a.** No customer selected → sale proceeds without customer link. |
| **Includes** | None |
| **Extends** | UC6 Record sale (optional at checkout) |
| **Postcondition** | Sale is linked to customer when selected; total spent updated on completion |

---

## UC14 — Delete customer

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC14 |
| **Use Case Name** | Delete customer |
| **Actors** | Owner, Manager |
| **Preconditions** | Customer exists; actor has delete permission |
| **Main Flow** | 1. Actor selects customer on customers page.<br>2. Actor confirms deletion.<br>3. System removes customer record.<br>4. System sets customerId to null on past sales (history preserved). |
| **Alternate Flow** | **2a.** Actor cancels → no change. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | Customer removed; historical sales remain |

---

## UC15 — View low-stock alerts

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC15 |
| **Use Case Name** | View low-stock alerts |
| **Actors** | Owner, Manager |
| **Preconditions** | Products exist with minStock &gt; 0 |
| **Main Flow** | 1. Actor opens dashboard or inventory with low-stock filter.<br>2. System finds products where stockQuantity ≤ minStock.<br>3. System displays low-stock count and product list. |
| **Alternate Flow** | **2a.** No low-stock products → system shows zero alerts. |
| **Includes** | None |
| **Extends** | UC19 View dashboard KPIs |
| **Postcondition** | Actor is aware of items needing reorder |

---

## UC16 — Manage expense categories

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC16 |
| **Use Case Name** | Manage expense categories |
| **Actors** | Owner, Manager |
| **Preconditions** | Actor has expense write permission |
| **Main Flow** | 1. Actor opens the expenses page.<br>2. Actor views category list.<br>3. Actor creates, edits, or deletes a category.<br>4. System saves changes scoped to the tenant. |
| **Alternate Flow** | **4a.** Delete category with existing expenses → system blocks deletion.<br>**2a.** First access with no categories → UC29 runs (auto-seed). |
| **Includes** | UC29 Auto-seed default expense categories (on first list, optional) |
| **Extends** | None |
| **Postcondition** | Expense category list is current |

---

## UC17 — Record operating expense

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC17 |
| **Use Case Name** | Record operating expense |
| **Actors** | Owner, Manager |
| **Preconditions** | At least one expense category exists |
| **Main Flow** | 1. Actor opens the expenses page.<br>2. Actor selects category and enters amount, date, and optional note.<br>3. Actor confirms save.<br>4. System records expense with recordedById.<br>5. Dashboard net profit reflects new OPEX for overlapping periods. |
| **Alternate Flow** | **2a.** Invalid amount or date → system shows validation error. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | Operating expense is stored for the tenant |

---

## UC18 — Edit or delete expense

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC18 |
| **Use Case Name** | Edit or delete expense |
| **Actors** | Owner, Manager |
| **Preconditions** | Expense exists in the tenant |
| **Main Flow** | 1. Actor selects an expense from the register.<br>2. Actor edits fields or chooses delete.<br>3. Actor confirms.<br>4. System updates or removes the expense row. |
| **Alternate Flow** | **4a.** Expense not found → system shows error. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | Expense register reflects edit or deletion |

---

## UC19 — View dashboard KPIs

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC19 |
| **Use Case Name** | View dashboard KPIs (revenue, profit, counts) |
| **Actors** | Owner, Manager |
| **Preconditions** | Actor has dashboard permission |
| **Main Flow** | 1. Actor opens the dashboard.<br>2. System aggregates today, week, and month metrics.<br>3. System displays revenue, gross profit, OPEX, net profit, sales count, product count, customer count, and low-stock count. |
| **Alternate Flow** | **2a.** No sales in period → system shows zero values where applicable. |
| **Includes** | None |
| **Extends** | UC20 View gross and net profit; UC15 View low-stock alerts |
| **Postcondition** | Actor has current KPI snapshot |

---

## UC20 — View gross and net profit

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC20 |
| **Use Case Name** | View gross and net profit |
| **Actors** | Owner, Manager |
| **Preconditions** | Dashboard summary is available |
| **Main Flow** | 1. Actor views dashboard period cards (today / 7 days / 30 days).<br>2. System shows gross profit from sales for the period.<br>3. System shows operating expenses for the period.<br>4. System displays net profit = gross profit − OPEX. |
| **Alternate Flow** | None |
| **Includes** | None |
| **Extends** | UC19 View dashboard KPIs |
| **Postcondition** | Actor understands net profitability for the period |

---

## UC21 — View revenue trend chart

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC21 |
| **Use Case Name** | View revenue trend chart |
| **Actors** | Owner, Manager |
| **Preconditions** | Actor is on dashboard with chart permission |
| **Main Flow** | 1. Actor selects trend period (e.g. 7, 30, 90 days).<br>2. System loads daily revenue buckets.<br>3. System renders revenue trend chart. |
| **Alternate Flow** | **2a.** No data in range → chart shows flat or empty state. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | Actor sees revenue over time |

---

## UC22 — View top products report

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC22 |
| **Use Case Name** | View top products report |
| **Actors** | Owner, Manager |
| **Preconditions** | Sales exist in the selected period |
| **Main Flow** | 1. Actor selects report period on dashboard.<br>2. System ranks products by sales volume or revenue.<br>3. System displays top products list or chart. |
| **Alternate Flow** | **2a.** No sales → system shows empty report. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | Actor identifies best-selling products |

---

## UC23 — View AI business insights

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC23 |
| **Use Case Name** | View AI business insights |
| **Actors** | Owner, Manager |
| **Preconditions** | Tenant has sufficient data; no LLM API key required |
| **Main Flow** | 1. Actor opens dashboard insights panel or assistant insights tab.<br>2. System computes rule-based insight cards from live data.<br>3. System displays insights (e.g. margin, low stock, trend). |
| **Alternate Flow** | **2a.** Limited data → system shows fewer or generic insights. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | Actor receives data-driven recommendations |

---

## UC24 — Chat with AI assistant

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC24 |
| **Use Case Name** | Chat with AI assistant |
| **Actors** | Owner, Manager |
| **Preconditions** | Actor has AI permission; OpenRouter API key configured in settings |
| **Main Flow** | 1. Actor opens the assistant page.<br>2. Actor selects or creates a conversation.<br>3. Actor sends a business question.<br>4. System builds tenant context and streams reply via SSE.<br>5. System saves user and assistant messages. |
| **Alternate Flow** | **4a.** No API key → system prompts actor to add key in settings.<br>**4b.** Provider error → system shows error; message may not be saved. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | Conversation history includes new exchange |

---

## UC25 — Manage AI conversations

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC25 |
| **Use Case Name** | Manage AI conversations |
| **Actors** | Owner, Manager |
| **Preconditions** | Actor is authenticated |
| **Main Flow** | 1. Actor opens assistant conversation list.<br>2. Actor creates, renames, or deletes a conversation.<br>3. System updates conversation records for the user within the tenant. |
| **Alternate Flow** | **3a.** Delete active conversation → system opens another or empty state. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | Conversation list matches actor’s intent |

---

## UC26 — List employees

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC26 |
| **Use Case Name** | List employees |
| **Actors** | Owner |
| **Preconditions** | Actor is OWNER |
| **Main Flow** | 1. Owner opens the team page.<br>2. System retrieves all users for the organization.<br>3. System displays name, email, and role per employee. |
| **Alternate Flow** | **2a.** Only owner exists → list shows single owner row. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | Owner sees current team roster |

---

## UC27 — Invite employee

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC27 |
| **Use Case Name** | Invite employee |
| **Actors** | Owner |
| **Preconditions** | Owner is authenticated; email not already used |
| **Main Flow** | 1. Owner opens invite form on team page.<br>2. Owner enters name, email, password, and role (Manager, Inventory Manager, or Cashier).<br>3. Owner confirms invite.<br>4. System creates Supabase user and tenant profile.<br>5. System shows new employee in the list. |
| **Alternate Flow** | **3a.** Role OWNER selected → system rejects (BR-12).<br>**4a.** Email exists → system shows error. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | New employee can log in with assigned role |

---

## UC28 — Change employee role

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC28 |
| **Use Case Name** | Change employee role |
| **Actors** | Owner |
| **Preconditions** | Target user is not OWNER |
| **Main Flow** | 1. Owner selects an employee on team page.<br>2. Owner selects new role (Manager, Inventory Manager, or Cashier).<br>3. Owner confirms change.<br>4. System updates user role.<br>5. Employee’s menu access changes on next login. |
| **Alternate Flow** | **3a.** Attempt to set OWNER → system rejects.<br>**3b.** Target is OWNER → system rejects role change. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | Employee has the new role |

---

## UC29 — Auto-seed default expense categories

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC29 |
| **Use Case Name** | Auto-seed default expense categories |
| **Actors** | System |
| **Preconditions** | Tenant has zero expense categories on first list request |
| **Main Flow** | 1. Actor or system triggers expense category list.<br>2. System detects empty category set.<br>3. System inserts Rent, Salaries, Transport, Utilities, Other.<br>4. System returns category list to the UI. |
| **Alternate Flow** | **2a.** Categories already exist → system skips seeding. |
| **Includes** | None |
| **Extends** | UC16 Manage expense categories |
| **Postcondition** | Default categories exist for the tenant |

---

## UC30 — Refresh access token

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC30 |
| **Use Case Name** | Refresh access token |
| **Actors** | Owner, Manager, Inventory Manager, Cashier |
| **Preconditions** | Valid refresh token held by client |
| **Main Flow** | 1. Client detects expired or near-expired access token.<br>2. Client sends refresh token to API.<br>3. System validates and issues new access token.<br>4. Client continues session without re-login. |
| **Alternate Flow** | **3a.** Refresh token invalid → client redirects to UC2 Login. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | Session continues with valid access token |

---

## UC31 — View user profile

| Field | Description |
|-------|-------------|
| **Use Case ID** | UC31 |
| **Use Case Name** | View user profile |
| **Actors** | Owner, Manager, Inventory Manager, Cashier |
| **Preconditions** | Actor is authenticated |
| **Main Flow** | 1. Application requests current user on load or menu action.<br>2. System returns profile (name, email, role, organization).<br>3. UI displays role-appropriate navigation. |
| **Alternate Flow** | **2a.** Token invalid → redirect to UC2 Login. |
| **Includes** | None |
| **Extends** | None |
| **Postcondition** | Application knows actor identity and permissions |

---

## Traceability index

| Lab UC | Implementation UC | Source scenarios |
|--------|-------------------|------------------|
| UC1 | UC-AUTH-1 | S7, V1 |
| UC2 | UC-AUTH-2 | S7, V1 |
| UC6 | UC-POS-1 | S2, S5, S7 |
| UC12 | UC-CUST-1 | S3 |
| UC17 | UC-EXP-2 | S6 |
| UC19 | UC-DASH-1 | S5, S8 |
| UC27 | UC-TEAM-2 | S7, V5 |

Full mapping: [usecases.md](./usecases.md) §3.

---

## Document status

| Item | File | Status |
|------|------|--------|
| Use case descriptions (Task 6) | `use-case-descriptions.md` | Complete |
| Use case catalogue (Task 5) | `usecases.md` | Complete |
| Extended specs + API trace | `use-case-specifications.md` | Existing |

---

*Prepared for OOSE Lab Task 6 — Write use case descriptions (Register Patient template).*

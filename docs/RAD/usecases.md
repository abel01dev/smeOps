# SME Ops — Use Cases Identified from Scenarios (OOSE Lab Task 5)

**Project:** SME Ops (SME Optimizer)  
**Related documents:** [senarios.md](./senarios.md), [actors.md](./actors.md)  
**Notation:** S*n* = AS-IS scenario *n* (from `senarios.md`)

This table follows the lab manual format: **Use Case ID**, **Use Case Name**, **Primary Actor**, **Source** (scenario).

Detailed flows (Task 6): **[use-case-descriptions.md](./use-case-descriptions.md)** · API trace: [use-case-specifications.md](./use-case-specifications.md) · UML: [`docs/uml/use-case-overview.puml`](../uml/use-case-overview.puml).

---

## 1. Use case catalogue (from scenarios)

| Use Case ID | Use Case Name | Primary Actor | Source |
|-------------|---------------|---------------|--------|
| UC1 | Register organization and owner account | Guest | S7, V1 |
| UC2 | Login | Guest, Owner, Manager, Inventory Manager, Cashier | S7, V1 |
| UC3 | Manage product categories | Inventory Manager | S1, S4 |
| UC4 | Manage products (catalog, prices, stock) | Inventory Manager | S1, S4 |
| UC5 | Archive product | Inventory Manager | S1 |
| UC6 | Record sale (POS checkout) | Cashier | S2, S5, S7 |
| UC7 | Validate stock availability | System | S2, S7 |
| UC8 | Apply discount and payment method | Cashier | S2 |
| UC9 | Decrement stock on sale | System | S2, S7 |
| UC10 | List and filter sales history | Cashier, Manager, Owner | S5 |
| UC11 | View sale receipt detail | Cashier, Manager, Owner | S5 |
| UC12 | Create or update customer | Cashier, Manager, Owner | S3 |
| UC13 | Link customer to sale | Cashier | S3 |
| UC14 | Delete customer | Owner, Manager | S3 |
| UC15 | View low-stock alerts | Owner, Manager | S4 |
| UC16 | Manage expense categories | Owner, Manager | S6 |
| UC17 | Record operating expense | Owner, Manager | S6 |
| UC18 | Edit or delete expense | Owner, Manager | S6 |
| UC19 | View dashboard KPIs (revenue, profit, counts) | Owner, Manager | S5, S8 |
| UC20 | View gross and net profit | Owner, Manager | S6, S8 |
| UC21 | View revenue trend chart | Owner, Manager | S8 |
| UC22 | View top products report | Owner, Manager | S8 |
| UC23 | View AI business insights | Owner, Manager | S8 |
| UC24 | Chat with AI assistant | Owner, Manager | S8, V8 |
| UC25 | Manage AI conversations | Owner, Manager | S8, V8 |
| UC26 | List employees | Owner | S7, V5 |
| UC27 | Invite employee | Owner | S7, V5 |
| UC28 | Change employee role | Owner | S7, V5 |
| UC29 | Auto-seed default expense categories | System | S6 |
| UC30 | Refresh access token | Owner, Manager, Inventory Manager, Cashier | S7 |
| UC31 | View user profile | Owner, Manager, Inventory Manager, Cashier | S7 |

---

## 2. Use cases grouped by source scenario

### Scenario S1 — Manual product and stock recording in a notebook

| Use Case ID | Use Case Name | Primary Actor |
|-------------|---------------|---------------|
| UC3 | Manage product categories | Inventory Manager |
| UC4 | Manage products (catalog, prices, stock) | Inventory Manager |
| UC5 | Archive product | Inventory Manager |

**Problems addressed:** single catalog, real-time stock fields, no duplicate handwritten entries.

---

### Scenario S2 — Paper-based checkout at the counter

| Use Case ID | Use Case Name | Primary Actor |
|-------------|---------------|---------------|
| UC6 | Record sale (POS checkout) | Cashier |
| UC7 | Validate stock availability | System |
| UC8 | Apply discount and payment method | Cashier |
| UC9 | Decrement stock on sale | System |

**Problems addressed:** checkout linked to inventory, profit recorded, payment method captured.

---

### Scenario S3 — Customer follow-up without a central record

| Use Case ID | Use Case Name | Primary Actor |
|-------------|---------------|---------------|
| UC12 | Create or update customer | Cashier, Manager, Owner |
| UC13 | Link customer to sale | Cashier |
| UC14 | Delete customer | Owner, Manager |

**Problems addressed:** shared customer database and spend history at POS.

---

### Scenario S4 — Physical stock check before reordering

| Use Case ID | Use Case Name | Primary Actor |
|-------------|---------------|---------------|
| UC4 | Manage products (catalog, prices, stock) | Inventory Manager |
| UC15 | View low-stock alerts | Owner, Manager |

**Problems addressed:** min-stock rules and dashboard visibility without a full shelf walk.

---

### Scenario S5 — End-of-day sales reconciliation on paper

| Use Case ID | Use Case Name | Primary Actor |
|-------------|---------------|---------------|
| UC6 | Record sale (POS checkout) | Cashier |
| UC10 | List and filter sales history | Cashier, Manager, Owner |
| UC11 | View sale receipt detail | Cashier, Manager, Owner |
| UC19 | View dashboard KPIs | Owner, Manager |

**Problems addressed:** digital sales register and KPIs instead of paper slips.

---

### Scenario S6 — Operating expenses in a separate cash book

| Use Case ID | Use Case Name | Primary Actor |
|-------------|---------------|---------------|
| UC16 | Manage expense categories | Owner, Manager |
| UC17 | Record operating expense | Owner, Manager |
| UC18 | Edit or delete expense | Owner, Manager |
| UC20 | View gross and net profit | Owner, Manager |
| UC29 | Auto-seed default expense categories | System |

**Problems addressed:** expenses in the same system as sales; net profit on dashboard.

---

### Scenario S7 — Multiple staff selling without shared stock view

| Use Case ID | Use Case Name | Primary Actor |
|-------------|---------------|---------------|
| UC1 | Register organization and owner account | Guest |
| UC2 | Login | All staff roles |
| UC6 | Record sale (POS checkout) | Cashier |
| UC7 | Validate stock availability | System |
| UC9 | Decrement stock on sale | System |
| UC26 | List employees | Owner |
| UC27 | Invite employee | Owner |
| UC28 | Change employee role | Owner |
| UC30 | Refresh access token | All staff roles |
| UC31 | View user profile | All staff roles |

**Problems addressed:** concurrent safe checkout, role-based access, formal team onboarding.

---

### Scenario S8 — Monthly business review without integrated analytics

| Use Case ID | Use Case Name | Primary Actor |
|-------------|---------------|---------------|
| UC19 | View dashboard KPIs | Owner, Manager |
| UC20 | View gross and net profit | Owner, Manager |
| UC21 | View revenue trend chart | Owner, Manager |
| UC22 | View top products report | Owner, Manager |
| UC23 | View AI business insights | Owner, Manager |
| UC24 | Chat with AI assistant | Owner, Manager |
| UC25 | Manage AI conversations | Owner, Manager |

**Problems addressed:** real-time analytics and optional AI instead of month-end manual estimates.

---

## 3. Mapping to implementation use case IDs (UML)

| Lab ID | Implementation ID | Package |
|--------|-------------------|---------|
| UC1 | UC-AUTH-1 | Authentication |
| UC2 | UC-AUTH-2 | Authentication |
| UC30 | UC-AUTH-3 | Authentication |
| UC31 | UC-AUTH-4 | Authentication |
| UC3 | UC-INV-2 | Inventory |
| UC4 | UC-INV-1 | Inventory |
| UC5 | UC-INV-3 | Inventory |
| UC15 | UC-INV-4 | Inventory / Dashboard |
| UC6 | UC-POS-1 | Point of sale |
| UC8 | UC-POS-2 | Point of sale |
| UC9 | UC-POS-3 | Point of sale |
| UC7 | UC-POS-4 | Point of sale |
| UC10 | UC-SALES-1 | Sales history |
| UC11 | UC-SALES-2 | Sales history |
| UC12 | UC-CUST-1 | Customers |
| UC14 | UC-CUST-2 | Customers |
| UC13 | UC-CUST-3 | Customers |
| UC16 | UC-EXP-1 | Operating expenses |
| UC17 | UC-EXP-2 | Operating expenses |
| UC18 | UC-EXP-3 | Operating expenses |
| UC29 | UC-EXP-5 | Operating expenses |
| UC19 | UC-DASH-1 | Dashboard |
| UC20 | UC-DASH-4 | Dashboard |
| UC21 | UC-DASH-2 | Dashboard |
| UC22 | UC-DASH-3 | Dashboard |
| UC26 | UC-TEAM-1 | Team |
| UC27 | UC-TEAM-2 | Team |
| UC28 | UC-TEAM-3 | Team |
| UC23 | UC-AI-1 | AI assistant |
| UC24 | UC-AI-2 | AI assistant |
| UC25 | UC-AI-3 | AI assistant |

---

## 4. Comparison with clinic lab example (structure)

| Clinic example | SME Ops equivalent |
|----------------|-------------------|
| UC1 Register Patient | UC1 Register organization and owner |
| UC2 Search Patient | UC12 Create/update customer (+ search in POS/history flows) |
| UC3 Book Appointment | UC6 Record sale (POS checkout) |
| UC4 Cancel Appointment | UC18 Edit/delete expense; UC5 Archive product |
| UC5 View Doctor Schedule | UC19 View dashboard KPIs |
| UC6 Join Queue | UC6 Record sale (walk-in counter flow) |
| UC7 Generate Queue Token | UC9 Decrement stock / UC29 Auto-seed categories (**System**) |
| UC8 View Queue Status | UC10 List sales history |
| UC9 Call Next Patient | UC11 View sale detail |
| UC10 Update Consultation Status | UC17 Record operating expense |
| UC11 Generate Daily Report | UC19–UC23 Dashboard and analytics |

---

## 5. Primary actor summary per use case (for diagram)

| Primary actor | Use case IDs |
|---------------|--------------|
| **Guest** | UC1, UC2 |
| **Owner** | UC2, UC10–UC28, UC30, UC31 (inherits Manager cases) |
| **Manager** | UC2, UC6, UC8, UC10–UC25, UC30, UC31 |
| **Inventory Manager** | UC2, UC3–UC5, UC30, UC31 |
| **Cashier** | UC2, UC6, UC8, UC10–UC13, UC30, UC31 |
| **System** | UC7, UC9, UC29 |

---

## Document status

| Item | File | Status |
|------|------|--------|
| Use cases from scenarios | `usecases.md` | Complete |
| Use case descriptions (Task 6) | `use-case-descriptions.md` | Complete |
| Use case specifications (API trace) | `use-case-specifications.md` | Existing |
| UML diagram | `docs/uml/use-case-overview.puml` | Existing |

---

*Prepared for OOSE Lab Task 5 — Identify use cases from each scenario (Smart Clinic table format).*

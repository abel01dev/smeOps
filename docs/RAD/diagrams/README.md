# SME Ops — UML Diagrams (RAD)

PlantUML sources for the Requirement Analysis Document (Ch. 2) and Design Document (Ch. 3).

## Folder structure

| Folder | Chapter | Count | Purpose |
|--------|---------|-------|---------|
| `use-case/` | 2.3.2.1 | 6 | Actors, use cases, include/extend, inheritance |
| `state/` | 2.3.5 | 4 | Object lifecycle state machines |
| `activity/` | 2.3.6 | 6 | Business process flows (major use cases) |
| `sequence/` | 2.3.7 | 8 | Object interactions (major use cases) |
| `class/` | 2.3.8 | 1 | Analysis domain class model |
| `architectural/` | 3.1 | 3 | Subsystem + component (API, Web) |
| `deployment/` | 3.1.2 | 1 | Physical deployment |
| `design-class/` | 3.2.1 | 2 | Design classes with methods |
| `persistence/` | 3.2.2 | 1 | ER / relational persistent model (Prisma) |
| `images/` | — | — | Exported PNGs for Word/PDF |

**Total: 32 PlantUML files**

## Chapter 3 — Design diagrams

| Section | File |
|---------|------|
| 3.1 Subsystem | `architectural/subsystem.puml` |
| 3.1.1 Component (API) | `architectural/component-api.puml` |
| 3.1.1 Component (Web) | `architectural/component-web.puml` |
| 3.1.2 Deployment | `deployment/production.puml` |
| 3.2.1 Design class (API) | `design-class/api-layer.puml` |
| 3.2.1 Design class (Web) | `design-class/web-layer.puml` |
| 3.2.2 Persistent model | `persistence/er-model.puml` |

## Render

**VS Code:** PlantUML extension → Alt+D preview → export PNG.

**CLI:**

```powershell
cd docs/RAD/diagrams
npx --yes node-plantuml -o images "**/*.puml"
```

**Online:** https://www.plantuml.com/plantuml/uml/

## Troubleshooting (Alt+D errors)

1. Do not use `as manager` — reserved word; use `as mgr`.
2. Prefer `and` instead of `&` in labels.
3. Avoid Unicode em dashes and section symbols in titles.
4. Install Java for the PlantUML VS Code extension.

## Traceability (analysis)

| Lab UC | Sequence | Activity |
|--------|----------|----------|
| UC1 | `sequence/uc01-register-org.puml` | `activity/uc01-register-org.puml` |
| UC2 | — | `activity/uc02-login.puml` |
| UC6 | `sequence/uc06-pos-checkout.puml` | `activity/uc06-pos-checkout.puml` |
| UC12 | `sequence/uc12-customer.puml` | — |
| UC17 | `sequence/uc17-record-expense.puml` | `activity/uc17-record-expense.puml` |
| UC19 | `sequence/uc19-dashboard-summary.puml` | — |
| UC23 | `sequence/uc23-ai-insights.puml` | — |
| UC24 | `sequence/uc24-ai-chat.puml` | `activity/uc24-ai-chat.puml` |
| UC27 | `sequence/uc27-invite-employee.puml` | `activity/uc27-invite-employee.puml` |

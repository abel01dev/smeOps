# SME Ops — UML Diagrams (RAD §2.3)

PlantUML sources for the Requirement Analysis Document. Render to PNG for Word/PDF.

## Folder structure

| Folder | § RAD | Count | Purpose |
|--------|-------|-------|---------|
| `use-case/` | 2.3.2.1 | 6 | Actors, use cases, `<<include>>`, `<<extend>>`, inheritance |
| `state/` | 2.3.5 | 4 | Object lifecycle state machines |
| `activity/` | 2.3.6 | 6 | Business process flows per major use case |
| `sequence/` | 2.3.7 | 8 | Object interactions per major use case |
| `class/` | 2.3.8 | 1 | Domain class model |
| `deployment/` | — | 1 | Production deployment |

## Render

**VS Code:** PlantUML extension → preview → export PNG.

**CLI (Java + PlantUML jar):**

```powershell
cd docs/RAD/diagrams
java -jar plantuml.jar -tpng use-case/*.puml state/*.puml activity/*.puml sequence/*.puml class/*.puml deployment/*.puml
```

**Online:** https://www.plantuml.com/plantuml/uml/

Save PNGs under `images/` and reference in `RAD.md`.

## Traceability

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

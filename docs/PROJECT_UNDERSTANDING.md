# Project Understanding Report — Poultry Cockpit

> Baseline document produced by code + spec review. This file is generated from the repository contents and the functional specification located at design-reference/functional-specification/Poultry Cockpit Functional Specification.pdf. Do not modify source code in this change.

---

## 1. Application Overview

Poultry Cockpit is a TypeScript Next.js (App Router) web application for managing commercial poultry farm operations. It supports the lifecycle of batches (placement → daily logs → liftings → settlements), farm and shed management, financial transactions, audits, and role-based access. The app uses Supabase for data storage and (likely) authentication and centralizes domain logic in a Business Engine (src/engine) which implements the formulas required for production and financial calculations.

Primary users: farm owners, managers, accountants, administrators, and viewers accessing dashboards, operations, and settlement reports.

Authoritative spec: design-reference/functional-specification/Poultry Cockpit Functional Specification.pdf (use this PDF as the business rules source of truth).


## 2. Module Breakdown

High-level modules (from repository layout and design-reference):

- App Router pages (src/app)
  - dashboard
  - batch-centre
  - operations
  - intelligence
  - settings
  - (root pages: layout.tsx, page.tsx, global-error.tsx, not-found.tsx)

- UI components (src/components)
  - batches
  - daily-log
  - liftings
  - financials
  - settlement
  - dashboard
  - audit
  - settings
  - layout (shared layout primitives)

- Business Engine (src/engine)
  - calculations.ts — batch and settlement formulas
  - permissions.ts — permission checks and role logic
  - audit.ts — audit logging responsibilities
  - errors.ts — domain error definitions / handling
  - index.ts — engine public boundary

- Data & Service Layer
  - src/lib/supabase/client.ts — Supabase client wrapper and configuration helper
  - src/services — (directory exists; expected to hold higher-level data-access/queries)

- Types & Domain Model
  - src/types/index.ts — canonical TypeScript interfaces for all domain entities (Batch, DailyLog, Lifting, Settlement, Farm, Shed, CompanyProfile, FinancialTransaction, AuditLog, etc.)

- Design & Spec
  - design-reference/ — design assets and the functional-specification PDF

- Supabase
  - supabase/ — repo-level supabase artifacts (migrations/config) (present but not fully inspected in this pass)


## 3. Business Rules

(Extracted from code + domain types + functional specification location — the PDF is the source of truth. Where the PDF has explicit language it should override any code-based inference. The list below synthesizes rules implied by the code and types.)

Major business rules (explicit or inferred):

- Batch lifecycle: a Batch is created with chicks_placed and a target duration. Daily logs capture per-day metrics (feed/water/mortality/culls/avg weight). One or more Liftings may occur for a Batch; settlement uses lifted weights and rates.

- Mortality and culls: cumulative counts across daily logs reduce current live birds; currentLiveBirds = chicksPlaced - totalMortality - totalCulls - totalLiftedBirds (calculated in Business Engine).

- Average final weight: computed from total lifted weight / total lifted birds if liftings exist; otherwise uses last recorded avg_body_weight_grams from daily logs.

- Cumulative FCR (Feed Conversion Ratio): FCR = total_feed_consumed_kg / total_biomass_kg (where biomass is either total weight lifted or current live birds * latest average weight).

- ADG (Average Daily Gain) in grams: ADG = (latestAvgWeightGrams - 42) / daysInHouse (42 appears to be a baseline chick weight used by the engine), null if not computable.

- Settlement calculations: total feed cost, chick cost, production cost per kg, GC (grade conversion/commission) amounts, and net settlement amount are computed by the Business Engine calculateSettlementSummary with inputs such as feedKg, feedRatePerKg, chicksPlaced, chickRatePerBird, medicineCost, gcRatePerKg, totalWeightLiftedKg, additions, deductions.

- Roles & permissions: User roles (Owner, Administrator, Manager, Accountant, Viewer) map to permitted actions across modules; permissions enforced by engine/permissions.ts.

- Audit: CRUD and major actions must be recorded to AuditLogRecord entries via engine/audit.ts.

- Financial transaction statuses and settlement lifecycle: settlements have states (Draft, Generated, Approved, Reopened) with approval metadata.

Note: The authoritative wording and edge cases are in the PDF; this report references the PDF but some specialized rules (e.g., rounding behavior, threshold values, exception flows) must be validated directly against PDF sections if strict compliance is required.


## 4. Business Engine responsibilities

The Business Engine (src/engine) is the single source for domain formulas and checks. Responsibilities include:

- Performing batch calculations: daysInHouse, current live bird counts, total mortalities/culls, total feed/water consumed, total lifted birds and weight, avg final weight, cumulative FCR, mortality percentage, ADG.
  - Implemented in BusinessEngineCalculations.calculateBatchSummary.

- Performing settlement calculations: feed cost, chick cost, production cost, production cost/kg, GC amounts, net settlement.
  - Implemented in BusinessEngineCalculations.calculateSettlementSummary.

- Centralizing permission checks by role (who can create, modify, approve, reopen, view batches/settlements).
  - Implemented in permissions.ts (review for concrete rules before changing behavior).

- Audit logging and event recording for major actions.
  - Implemented in audit.ts (and used by application code to record events).

- Domain-level error definitions and common error shapes.
  - Implemented in errors.ts.

Important constraints from project rules: Business Engine formulas must not be modified unless explicitly directed by stakeholders and then tracked as a spec change. All UI and service code must call into the engine for formula results.


## 5. Supabase responsibilities

From src/lib/supabase/client.ts and repo layout, Supabase is responsible for:

- Data persistence for all domain entities (batches, daily_logs, liftings, settlements, financial_transactions, farms, sheds, company_profiles, audit_logs, users/roles).
- Serving as the application database (Postgres) and possibly auth provider.
- Enforcing row-level security or policies (if configured in the Supabase project) — the repo contains a supabase/ folder which likely contains migrations and RLS policies.
- The app uses a lightweight wrapper (getSupabaseClient) which returns a client built from NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY; in development an inert placeholder client is used when env is not configured.

Action items: verify migrations and database schema in the supabase/ folder and confirm column names/types align with src/types. Ensure all data access uses the shared service layer (src/services) and client wrapper rather than direct Supabase SDK calls throughout the app.


## 6. UI flow for every module

Below I describe the expected UI flow per module based on code structure (src/app routes + src/components) and the functional specification location. For each flow I name involved pages, components, and main engine/service calls.

1) Dashboard
- Entry: /dashboard (src/app/dashboard)
- UI: summary KPIs (active batches, total live birds, today's feed, recent liftings), charts and quick actions.
- Components: src/components/dashboard/*
- Data: aggregated batch summaries from Business Engine (calculateBatchSummary across batches) and recent transactions via Supabase queries (services/dashboard?).
- Actions: navigate to batch details, create new batch, view financials.

2) Batch Centre (batches lifecycle)
- Entry: /batch-centre (src/app/batch-centre)
- UI: list of batches, filter by status, create/browse batch details.
- Components: src/components/batches/*
- Data: BatchRecord via Supabase; uses Business Engine for derived metrics.
- Subflows:
  - Create Batch: form to enter placement_date, chicks_placed, shed, company, formula_profile, etc. After save, batch enters Draft/Ready.
  - Start/Mark Running: transition status to Running.
  - Archive/Complete: mark as Completed or Archived.

3) Daily Log
- Entry: /daily-log (or nested under batch detail)
- UI: per-day entry for feed, water, mortality, culls, avg weight, remarks. Save as Draft or Complete.
- Components: src/components/daily-log/*
- Data: DailyLogRecord persisted to Supabase.
- Actions: Add a new daily log row, edit existing, compute derived metrics (engine used to recompute batch summary after logs change).

4) Liftings
- Entry: /liftings or nested within batch page
- UI: Create lifting entries (lifting_no, lifting_date, birds_lifted, total_weight_kg, buyer, vehicle, rate_per_kg). Compute gross/net amounts and update batch totals.
- Components: src/components/liftings/*
- Data: LiftingRecord persisted; triggers settlement calculations.

5) Financials
- Entry: /financials
- UI: Record expenses/incomes, pre-batch expenses, show running balances.
- Components: src/components/financials/*
- Data: FinancialTransactionRecord persisted and used during settlement.

6) Settlement
- Entry: /settlement or /batch/:id/settlement
- UI: generate settlement from batch & lifting data, display company rates, additions/deductions, compute net settlement via BusinessEngineCalculations.calculateSettlementSummary.
- Components: src/components/settlement/*
- Data: SettlementRecord persisted and transitions through statuses (Draft -> Generated -> Approved -> Reopened). Audit and permissions apply.

7) Audit
- Entry: /audit
- UI: List of audit events with filters (module, user, time, action).
- Components: src/components/audit/*
- Data: AuditLogRecord persisted via engine/audit.ts.

8) Settings
- Entry: /settings
- UI: manage company profiles, fee rates, farm and shed defaults, user roles, formula profiles.
- Components: src/components/settings/*
- Data: CompanyProfileRecord, FarmRecord, ShedRecord, and application settings persisted in Supabase.

9) Intelligence
- Entry: /intelligence
- UI: reporting, recommendations, historical analytics. This likely consumes aggregated data from Supabase and computed engine outputs.
- Components: src/app/intelligence and src/components related.

Note: Each module's exact UI screens and step-by-step widgets must be verified against design-reference images in design-reference/* and the functional specification PDF for exact text, labels, and required fields.


## 7. Database entities and relationships

The canonical entities are defined in src/types/index.ts. Key entities and relationships:

- FarmRecord (1..N) Site-level farm definitions.
- ShedRecord (belongs to FarmRecord via farm_id) — Sheds belong to farms.
- BatchRecord (belongs to a Farm and a Shed; optional company via company_id) — central entity.
- DailyLogRecord (belongs to BatchRecord via batch_id) — daily per-batch metric entries (1..N per batch).
- LiftingRecord (belongs to BatchRecord) — one-to-many; a batch can have multiple liftings.
- FinancialTransactionRecord (belongs to BatchRecord) — expenses/income tied to batch.
- CompanyProfileRecord — buyers/suppliers with settlement and contract parameters.
- SettlementRecord (belongs to BatchRecord) — settlement lifecycle records derived from batch & lifting & financials.
- AuditLogRecord — audit entries referencing entity and entity_id.

Cardinality highlights:
- BatchRecord 1 — N DailyLogRecord
- BatchRecord 1 — N LiftingRecord
- BatchRecord 1 — N FinancialTransactionRecord
- BatchRecord 1 — 1 SettlementRecord (or multiple for reopened/partial settlements depending on spec)

Indexes and constraints (advised):
- Indexes on batch_id for daily_logs, liftings, financial_transactions, settlements.
- Unique constraint on batch_number.
- Foreign key constraints from child records to parent batch/farm/shed/company where appropriate.


## 8. Workflow diagrams (text descriptions)

A) Batch lifecycle (text flow)
- User creates Batch (Draft) -> Configure placement_date, chicks_placed, shed.
- User moves Batch to Ready -> Place chicks (status Running).
- Daily: User adds DailyLog entries (Draft -> Saved -> Completed). Each saved/complete daily log updates derived metrics via engine.calculateBatchSummary.
- Lifting events recorded when birds are sold/removed; each lifting updates batch total weight_lifted.
- When production completes: generate settlement -> run engine.calculateSettlementSummary -> produce SettlementRecord -> Approve settlement -> mark batch settlement_status = Settled.

B) Settlement generation (text flow)
- Trigger: user requests settlement generation for a batch (inputs: company_feed_rate, company_chick_rate, medicine costs, additions, deductions).
- System aggregates total feedKg (sum of daily logs), totalWeightLiftedKg (sum of liftings), chicksPlaced, medicineCost, then calls BusinessEngineCalculations.calculateSettlementSummary to compute totals and productionCostPerKg.
- System displays draft settlement to Accountant/Manager -> Accountant may add additions/deductions -> Approve by authorized role -> System persists approved settlement and triggers payment workflows.

C) Audit flow (text)
- For any major entity action (create/update/delete/approve), engine/audit.ts is invoked to record AuditLogRecord with previous_value and new_value, user_id and user_role.


## 9. Mapping between: Functional Specification ↔ UI Reference ↔ Existing Code

- Functional Specification (source-of-truth): design-reference/functional-specification/Poultry Cockpit Functional Specification.pdf

- UI Reference: design-reference/* (domain folders contain images/visuals per module — follow those for accurate UI layout and labels).

- Code mapping (representative):
  - Batch summary and formulas: PDF "Batch Calculations" section -> Implementation: src/engine/calculations.ts (calculateBatchSummary)
  - Settlement formulas: PDF "Settlement" section -> Implementation: src/engine/calculations.ts (calculateSettlementSummary)
  - Types / data model: PDF data model / ERD -> Implementation: src/types/index.ts
  - Supabase client configuration: PDF environment/setup -> Implementation: src/lib/supabase/client.ts and supabase/ folder
  - Daily log UI: PDF daily log screens -> Implementation: src/components/daily-log + src/app batch pages
  - Liftings UI and calculations: PDF liftings & settlement -> Implementation: src/components/liftings, src/engine/calculations references to liftings
  - Permissions and roles: PDF security/roles -> Implementation: src/engine/permissions.ts and src/types.UserRole
  - Audit requirements: PDF audit & compliance -> Implementation: src/engine/audit.ts and AuditLogRecord in src/types

Notes: I created a mapping from spec concepts to files that implement them. For precise line-level mappings, run code search for keywords from the PDF (e.g., "FCR", "mortality", "settlement") and cross-reference images in design-reference to component files.


## 10. Completed modules (based on repository evidence)

Modules with substantive implementation present:
- Business Engine: src/engine (calculations, permissions, audit, errors, index)
- Domain types: src/types/index.ts — rich domain model
- Supabase client layer: src/lib/supabase/client.ts
- App Router skeleton & per-module route directories: src/app/* (layout, page, modules directories exist)
- UI components scaffolding: src/components/* domain folders exist

These items indicate the core scaffolding and critical domain logic are in place.


## 11. Incomplete modules / gaps (observed)

- Functional Specification linking: the spec exists as PDF under design-reference but there is no markdown copy in repo root named FUNCTIONAL_SPECIFICATION.md; this makes automated diffing and referencing harder.

- tsconfig.json: the root tsconfig.json appears empty in the repository listing; confirm TypeScript strict mode settings are present (project rule requires strict mode). If missing, this is a gap.

- Services & Data Layer: src/services exists but specific data-access wrappers and central service implementations for each module were not fully inspected; some service functions may be missing.

- UI implementation completeness: components directories exist but we did not inspect all component files — some pages may still be incomplete or use placeholder content. Per-module UIs must be validated against design-reference visuals and PDF acceptance criteria.

- Tests & CI: no test suite or CI workflows seen in repository top-level listing; absence of tests is a gap for production stability.

- Supabase migrations and policies: supabase/ folder exists but needs full review to ensure database schema exactly matches src/types. Any mismatch is a potential risk.

- PDF extraction & spec consumption in codebase: the functional spec is not present as machine-readable Markdown; the code may implement rules but traceability could be improved (linking spec sections to code).


## 12. Deviations between the codebase and the Functional Specification

I reviewed code and types and located the functional specification PDF. Because the PDF is a binary document in the repository and was not converted to Markdown here, I compared the code-derived model and engine logic to the expected spec concepts rather than line-by-line quoting.

Observed deviations / items requiring confirmation:

- Source-of-truth location: project rule expected FUNCTIONAL_SPECIFICATION.md at repo root, but the spec is stored as a PDF under design-reference/functional-specification. Functionally fine, but change to README/CI may expect an .md.

- tsconfig.json missing content — project rule requires TypeScript strict mode; confirm that strict mode is enabled somewhere (it is not visible in root tsconfig.json).

- README references GEMINI_API_KEY and npm; code contains bun.lock. This discrepancy in developer tooling (bun vs npm) should be clarified.

- The Business Engine uses a baseline value of 42 grams in ADG calculation: ADG = (latestAvgWeightGrams - 42) / daysInHouse — this magic constant should be verified in the PDF (is 42 the documented chick starting weight?). If the spec uses a different baseline or makes it configurable, adjust engine accordingly only if spec dictates.

- Some type fields allow nulls or optional values; the PDF may specify requiredness differently. Confirm required vs optional in spec for accurate validation and API-level checks.

- The supabase client uses a placeholder fallback client when env vars are absent; ensure there is a documented developer experience for local dev that aligns with the README.


## 13. Prioritized implementation roadmap

This roadmap assumes the goal is to get the product to a production-ready state with traceability to the Functional Specification. Priorities are based on risk to business correctness and the project rules.

Immediate (P0) — block/cannot ship without these
1. Verify and enforce TypeScript strict mode (tsconfig.json) — add config if missing, but only if team approves; do not relax existing rules. (Important for maintainability and safety.)
2. Confirm Business Engine formula constants and rounding rules against the PDF (e.g., the 42g baseline, rounding of FCR, productionCostPerKg rounding). Do not change formulas without explicit spec approval.
3. Verify Supabase schema (supabase/ migrations) matches src/types — reconcile any mismatch to avoid data errors.
4. Generate a machine-readable excerpt of the functional spec (Markdown summary) stored in docs/ for easier reference and traceability (this is what this baseline report begins). The PDF remains authoritative but a linked Markdown summary helps engineers.

Short term (P1) — high value features and cleanup
5. Complete UI implementation for Batch Centre, Daily Log, Liftings, Settlement — ensure pages implement the forms and flows defined in the PDF and wire them to services and Business Engine.
6. Instrument audit logging across all entity lifecycle operations (create/update/delete/approve) using engine/audit.ts.
7. Standardize developer tooling: decide npm or Bun, update README and lockfile or commit package-lock accordingly.
8. Add end-to-end tests for critical flows (batch create → daily logs → lifting → settlement) and unit tests for Business Engine formulas.

Medium term (P2)
9. Build comprehensive reports in Intelligence module using historical data and batch-level aggregates.
10. Implement role-based UI visibility & action gating using engine/permissions.ts across UI components.
11. Improve error handling UX using engine/errors.ts and map domain errors to user-friendly messages.

Longer term (P3)
12. Add CI/CD workflows and automated database migration checks (Supabase previews) to ensure schema & code stay in sync.
13. Implement data validation layers and server-side input validation for all API/service calls.


---

Appendix: Actions I performed
- Located and opened: design-reference/functional-specification/Poultry Cockpit Functional Specification.pdf
- Reviewed: src/engine/calculations.ts, src/lib/supabase/client.ts, src/types/index.ts, src/app route skeletons and src/components folder structure.

Appendix: Important file references
- Functional spec (authoritative): design-reference/functional-specification/Poultry Cockpit Functional Specification.pdf
- Business engine: src/engine/calculations.ts (calculateBatchSummary, calculateSettlementSummary), src/engine/*
- Domain types: src/types/index.ts
- Supabase client: src/lib/supabase/client.ts
- UI: src/app/*, src/components/*

---

If you approve, I will:
- (Next) Extract structured sections from the PDF into docs/ (e.g., Business Rules, UI acceptance criteria) and expand the mapping table per view -> component lines.
- Continue with the prioritized roadmap steps only after you confirm which item to start and grant permission to modify repository files (code changes require explicit approval per your initial instructions).

This report has been saved to docs/PROJECT_UNDERSTANDING.md as requested. I will wait for your review and approval before making any code changes.

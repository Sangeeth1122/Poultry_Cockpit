# AI_CONTEXT — Permanent Operating Rules for AI Contributors

Version: 1.0
Source documents used to author this file:
- docs/PROJECT_UNDERSTANDING.md (Version 1.0)
- design-reference/functional-specification/Poultry Cockpit Functional Specification.pdf (Functional Specification)
- Current repository contents (src/, supabase/, design-reference/)

Purpose
This document defines the permanent operating rules every AI agent must follow when working on the Poultry Cockpit repository. It is a machine-readable policy and guidance sheet to ensure safe, consistent, and spec-compliant code contributions.

Do NOT modify application source code when you are only updating this document. Wait for explicit approval before making changes beyond this file.

---

1) Project Overview
- Poultry Cockpit is a web application for managing commercial poultry farm operations. Core capabilities: batch lifecycle (placement → daily logging → liftings → settlements), farm & shed management, financial recording, audit logging, and reporting/intelligence.
- Authoritative business rules: design-reference/functional-specification/Poultry Cockpit Functional Specification.pdf.
- Operational summary and current implementation status are in docs/PROJECT_UNDERSTANDING.md (Version 1.0).

2) Technology Stack
- Frontend: Next.js (App Router), React, TypeScript
- Backend / persistence: Supabase (Postgres) via the Supabase JS client
- Repo language: TypeScript; project follows a Next.js App Router architecture
- Business Engine: src/engine — TypeScript modules that implement domain formulas (calculations, permissions, audit, errors)
- Types: src/types/index.ts provides canonical domain interfaces

3) Repository Structure (key folders)
- design-reference/ — UI reference images and the Functional Specification PDF (authoritative business rules)
- src/app/ — Next.js App Router pages and route handlers
- src/components/ — UI components grouped by domain (batches, daily-log, liftings, financials, settlement, audit, settings, dashboard, layout)
- src/engine/ — Business Engine (calculation formulas and domain logic)
- src/lib/supabase/ — Supabase client initialization
- src/services/ — higher-level data access / application services (use these instead of raw DB calls where present)
- src/types/ — domain type definitions
- supabase/migrations/ — database schema migrations (SQL)
- docs/ — project documentation (PROJECT_UNDERSTANDING.md, AI_CONTEXT.md)

4) Architectural Principles (must follow)
- Single source of truth: The Functional Specification PDF (design-reference/functional-specification) and docs/PROJECT_UNDERSTANDING.md are the authoritative business references.
- Separation of concerns: Business-formulas and domain rules must live only in the Business Engine (src/engine). UI, services, and data access layers may call into the engine but must not reimplement formulas.
- Reuse components: Reuse existing UI components in src/components whenever possible. Do not redesign or replace the visual design; follow the design-reference images exactly for layout, text, and flows unless the product owner approves changes.
- App Router architecture: Follow Next.js App Router conventions used in src/app (file routes, server/client components where appropriate).
- Types-first development: Use the domain types in src/types for all entities and preserve TypeScript strictness (project rule).

5) Business Engine Rules (mandatory)
- The Business Engine (src/engine) is the canonical place for all formula and calculation code. Examples implemented today: calculateBatchSummary and calculateSettlementSummary in src/engine/calculations.ts.
- DO NOT modify existing engine formulas, constants, or rounding logic unless there is an explicit, documented change request referencing the Functional Specification and approval from the product owner/stakeholders.
- When adding new calculations, document the formula and link to the exact section in the Functional Specification or PROJECT_UNDERSTANDING.md that authorizes it.
- Unit tests must be added for any new or changed formulas; tests should cover numeric edge cases and rounding behavior.

6) Supabase Rules (mandatory)
- All data persistence should use the Supabase client wrapper in src/lib/supabase/client.ts or higher-level services in src/services. Do not instantiate ad-hoc Supabase clients across the codebase.
- Database schema changes must be made via the supabase/migrations SQL files and reviewed for parity with src/types. Do not directly alter the production database without an approved migration.
- Ensure column names and types in TypeScript types (src/types) match the Supabase migration definitions. If disparities are found, create a migration and update types as part of the same change, with stakeholder approval.
- Never push secrets (e.g., Supabase keys) to the repository. The client uses NEXT_PUBLIC_* env vars; CI and deployment must supply these securely.

7) UI Rules (mandatory)
- The design-reference folder contains the visual source of truth for UI. Do not redesign, re-style, or alter layout without explicit approval from product/design.
- Reuse existing components in src/components. When a new component is necessary, follow project component conventions (TypeScript, strict typing, accessible HTML, and CSS modules or global styles in src/app/globals.css as used by the repo).
- Preserve text, labels, and field requirements exactly as shown in the design assets and the Functional Specification.
- Accessibility: new UI must follow basic ARIA semantics and keyboard accessibility consistent with the existing codebase.

8) Development Workflow (AI-specific guidance)
- Always read docs/PROJECT_UNDERSTANDING.md and the Functional Specification before making changes.
- For any feature or bug fix, produce: a short implementation plan mapping spec sections → code files → tests. Wait for human approval before implementing significant changes.
- When implementing code changes, prefer small atomic commits with clear commit messages following the repo's conventions (see section 10 below).
- Add unit tests for business rules changes and integration tests for critical flows. If tests or CI are missing, raise an issue and propose a test plan rather than bypass testing.

9) Coding Standards
- Use TypeScript with strict typing. Prefer explicit types over any. Keep code idiomatic and consistent with existing patterns in the repo.
- Prefer pure functions for calculations in src/engine. Side-effects (DB writes, logging) should be in services or server components.
- Follow the existing folder and naming patterns (e.g., domain folders under src/components and app routes under src/app).
- Write clear JSDoc or TypeScript comments on exported engine functions documenting inputs, outputs, units, and rounding behavior. Link to the Functional Specification sections when applicable.

10) Git Workflow
- Branching:
  - Create branches from main for features and fixes: feature/<short-description> or fix/<short-description>.
  - Keep changes small and focused per branch.
- Commits:
  - Use present-tense imperative commit messages: "feat: add settlement calculation" or "fix: correct rounding in FCR calculation".
  - Include references to spec sections or issue numbers where applicable.
- Pull requests:
  - Open PRs targeting main. Include a short summary: what changed, why (spec reference), and test plan.
  - Include mapping from spec → files changed in the PR description.

11) Review Checklist (AI must validate before proposing changes)
- Does the change implement a requirement explicitly present in the Functional Specification or PROJECT_UNDERSTANDING.md? If not, stop and ask for clarification.
- Does the change avoid modifying business engine formulas? If formulas must change, is there stakeholder approval and a documented rationale linking to the spec?
- Are types updated and consistent with supabase/migrations SQL? If not, include schema reconciliation steps in the PR.
- Are UI updates consistent with the images in design-reference and the UI rules? Include annotated screenshots in PRs when UI changes are made.
- Are unit tests included for any new/changed calculation logic? Do tests cover edge cases and rounding?
- Are secrets excluded from commits and PRs? Are environment variables referenced correctly (NEXT_PUBLIC_ or server-only envs as appropriate)?
- Has the change been described in the PR with mapping to spec sections and acceptance criteria?

12) Things an AI must NEVER do (absolute prohibitions)
- NEVER modify business-engine formulas or numeric constants (src/engine) without explicit, documented stakeholder approval that references the Functional Specification.
- NEVER redesign UI or change visual assets from design-reference without product and design approval. The UI images and the Functional Specification are the visual and behavioral truths.
- NEVER invent business rules, rates, thresholds, or formulas that are not present in the Functional Specification or PROJECT_UNDERSTANDING.md. If a rule is missing, raise an issue and ask for clarification.
- NEVER commit secrets or credentials into the repository (env vars, API keys, private keys). If secrets are found in the repo, report immediately and follow security incident guidance.
- NEVER run migrations against production or change database schema in production without an approved migration and rollback plan.
- NEVER bypass TypeScript strictness or add quick "any"-typed solutions to silence the type system without documenting and obtaining approval.
- NEVER push code that lacks tests for business logic changes — tests are mandatory for formulas and calculation code.
- NEVER add or change user-facing text, labels, or field semantics without verifying the Functional Specification and design-reference images.

---

Operational notes
- This document must be used as the living rule set for every AI-assisted change. Any AI agent must load docs/PROJECT_UNDERSTANDING.md and the Functional Specification before making suggestions or edits.
- When in doubt, STOP and request a human clarification. When an inconsistency between code and spec is found, document the inconsistency and propose options rather than guessing.

---

Change control
- This file was generated from the specified authoritative sources. Do not update this file except by explicit approval. If the product owner approves updates, create a new version with a changelog and a link to the approving evidence.

---

I have created docs/AI_CONTEXT.md in the repository. I will wait for your approval before making any further changes or starting implementation tasks.
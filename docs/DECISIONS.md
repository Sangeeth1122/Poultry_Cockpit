# DECISIONS

Version: 1.0

| ID | Decision |
|----|----------|
| D001 | The Functional Specification is the business source of truth. |
| D002 | The design-reference folder is the UI source of truth. |
| D003 | DESIGN_SYSTEM.md is the visual implementation standard. |
| D004 | PROJECT_UNDERSTANDING.md defines the application architecture. |
| D005 | AI_CONTEXT.md defines AI operating rules. |
| D006 | Desktop-first development. Mobile implementation will begin only after the desktop application is completed and approved. |
| D007 | Reuse existing components before creating new ones. |
| D008 | Business logic belongs only in src/engine. |
| D009 | UI components must never contain business calculations. |
| D010 | All database access must go through the existing Supabase service layer. |
| D011 | Business Engine formulas must not be modified without explicit approval. |
| D012 | Do not redesign approved screens. Improve only until they match the design reference. |
| D013 | Completed modules are considered frozen. Modify them only to fix bugs or when explicitly requested. |
| D014 | Documentation changes and implementation changes must be committed separately. |
| D015 | Every implementation must update IMPLEMENTATION_STATUS.md before completion. |
| D016 | When switching to a new AI agent, do not reanalyse the repository. Continue from the current implementation status. |
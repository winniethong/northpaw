# Northpaw - MVP Product Requirements (Master)

> Product vision, audience, problems, goals, the feature map, and scope boundaries. Detailed, buildable specs (schema, formulas, rules, flows) live in the per-feature PRDs under [`docs/prds/`](./prds/)

---

## Product Overview

Northpaw is a pet health and financial planning platform. Unlike most pet apps that focus only on health records, Northpaw combines five things in one place:

1. Health history
2. Medical records
3. Insurance management
4. Care cost planning
5. Preventative care

**Core belief.** Pet owners don't just want to know what happened. They want to know: *How is my pet doing? What care is needed next? What will it cost me? What will insurance cover?* Northpaw becomes the single source of truth for both pet health and pet healthcare finances.

---

## Target Audience

**Primary:** Millennial and Gen Z pet owners, owners with insurance, owners of senior pets, and owners managing chronic conditions.

**Secondary:** Multi-pet households and first-time pet owners.

---

## Core User Problems

1. **Health information is fragmented** across PDFs, vet portals, emails, notes, and photos.
2. **Owners forget preventative care:** annual exams, vaccines, dental cleanings, bloodwork.
3. **Pet insurance is hard to understand:** deductible, reimbursement rate, coverage limits, renewal dates.
4. **Owners can't estimate future costs:** dental, bloodwork, ultrasound, surgery.

---

## MVP Goals

The MVP should let users store pet health history, upload and organize records, manage insurance information, estimate future healthcare costs, and stay on top of preventative care.

**The MVP contains no AI.** AI is deferred to V2, once meaningful data exists.

---

## Tech Stack

- **Frontend:** Next.js, TypeScript, Tailwind, shadcn/ui
- **Backend:** Next.js server actions, Supabase RPC functions
- **Database / Auth / Storage:** Supabase (PostgreSQL, Auth, Storage)
- **Hosting:** Vercel

## Technical Foundations

- Supabase Auth for account identity and sessions
- Postgres tables for pet profiles, health events, documents, insurance, benchmarks, and rules
- RLS policies keyed on `auth.uid()`
- Database views for derived values such as current weight
- RPC functions for atomic multi-table writes
- Next.js server actions for validation, mutations, revalidation, and redirects
- Vercel deployment for the Next.js app
- Python analytics workflows deferred until enough structured data exists

---

## Feature Map

The MVP's 11 features are grouped into the PRDs below. Two original "features" (Vet Visit Tracking, Vaccination Tracking) are folded into the Health Timeline because the timeline is the single spine for all health events; see [Data Model](./prds/data-model.md). Insurance Vault and Insurance Dashboard are covered by one Insurance PRD.

| Area | PRD | Covers (original feature #) |
|---|---|---|
| Shared schema & security | [data-model.md](./prds/data-model.md) | cross-cutting: spine, RLS, export/delete |
| First-run experience | [onboarding.md](./prds/onboarding.md) | cold-start / time-to-value |
| Authentication | [authentication.md](./prds/authentication.md) | F1 |
| Pet Profiles | [pet-profiles.md](./prds/pet-profiles.md) | F2 |
| Health Timeline | [health-timeline.md](./prds/health-timeline.md) | F3, F5 Vet Visits, F6 Vaccinations |
| Document Management | [document-management.md](./prds/document-management.md) | F4 |
| Insurance | [insurance.md](./prds/insurance.md) | F7 Vault, F8 Dashboard |
| Care Cost Planner | [care-cost-planner.md](./prds/care-cost-planner.md) | F9 |
| Preventative Care & Reminders | [preventative-care.md](./prds/preventative-care.md) | F10, F11 |

---

## Suggested MVP Phasing

11 features is heavy for a v1. Ship the spine and the differentiator first; layer the rules-driven features once the engine is proven.

- **v1 (core):** Auth, Pet Profiles, Health Timeline + Documents, Insurance (Vault + Dashboard), Care Cost Planner.
- **v1.1:** Preventative Care Dashboard + Reminders (both depend on the rules engine; ship together once validated).

**Dependency-aware build order:** (1) schema + RLS, (2) onboarding + quick-add, (3) cost benchmarks + planner, (4) care-rules engine, (5) preventative dashboard + reminders on top of #4.

### Dashboard: v0 (home) vs v1 (metrics)

The dashboard ships in two stages, because the metrics that make it valuable depend on engines that come later:

- **Dashboard v0 (ships with F2/F3):** pet roster + per-pet health timeline: name, species, age, current weight (derived view), and recent activity. This is the interim home; it shows only what the data supports.
- **Dashboard v1 (v1.1, with the engines):** engine-driven metric widgets: **"care due next"** (care-rules engine), **cost estimates** (cost planner), and the **insurance snapshot** (vault).

**Rule: do not build a metric widget before its engine exists:** an empty "care due" or "estimated cost" card is worse than not having it. Metrics wait for their data source.

**No spend tracker.** `health_events` stores **no cost** on events; cost in Northpaw is *forward-looking estimate only* (the Care Cost Planner). Do not add a "total spent this year" metric because the data model does not support it.

---

## Out of Scope (Not MVP)

AI Chat, AI Search, RAG, embeddings, symptom diagnosis, insurance claim submission, pet-sitter marketplace, multi-user households, wearables, cost forecasting, and health-correlation detection.

**V2 (after MVP is stable):** AI Health Summary, AI Vet Visit Preparation, AI Record Search, AI Insurance Policy Search. *(Placeholder PRD: [ai-health-summary.md](./prds/ai-health-summary.md).)*

**V3:** Senior pet planning, cost forecasting, health pattern detection, pet-sitter integrations (Rover, Wag, etc.).

---

## Core Product Principle

Every feature must answer one of two questions:

1. **How is my pet doing?**
2. **What is this going to cost me?**

If a feature supports neither, it does not belong in the MVP.

# PRD - Insurance Vault (F7) + Insurance Dashboard (F8)

> Store insurance details and surface them at a glance. Also holds the usage fields the Care Cost Planner needs for accurate estimates.

## Problem

Pet insurance is hard to understand: owners often don't know their deductible, reimbursement rate, coverage limits, or renewal date, and they shouldn't have to dig through policy PDFs.

## Goals

Store one policy per pet and present the key terms on one screen, while capturing enough detail (deductible progress, benefit used) for the cost planner to estimate out-of-pocket cost correctly.

## Users

Owners with pet insurance.

## Requirements

### Vault (F7)

Store: provider, policy number, reimbursement rate, deductible, annual limit, renewal date, plus usage tracking so estimates reflect reality:

- `deductible_type`: `annual` or `per_incident`
- `deductible_met`: amount of deductible satisfied this policy year
- `benefit_used`: amount reimbursed so far this policy year

**Terminology:** use **"Reimbursement rate"** consistently (the share reimbursed after the deductible). Drop "Coverage %"/"Coverage Percentage" used loosely in the original spec; add helper text explaining the term.

### Dashboard (F8)

Display provider, reimbursement rate, deductible, annual limit, and renewal date on one screen with zero clicks after opening the pet. This removes the need to search policy documents.

## Data

```sql
insurance_policies (
  id, pet_id → pets, provider, policy_number,
  reimbursement_percent,            -- e.g. 0.80
  deductible, annual_limit, renewal_date,
  deductible_type   text default 'annual',
  deductible_met    numeric default 0,
  benefit_used      numeric default 0
)
```

These feed the planner as `D_left = max(0, deductible − deductible_met)` and `L_left = max(0, annual_limit − benefit_used)` (see [care-cost-planner.md](./care-cost-planner.md)).

## Technical Design

- Route: pet-level insurance view
- Components: policy form and policy summary card
- Reads: `insurance_policies` by `pet_id`
- Writes: upsert one active policy per pet
- Planner dependency: expose deductible left and annual limit left
- Document dependency: policy PDF stored through Document Management
- Display rule: use "Reimbursement rate" label only

## Data Ownership

- `pet_id`: parent ownership checked through RLS
- Policy fields: user-entered
- Remaining deductible: derived from `deductible` and `deductible_met`
- Remaining annual limit: derived from `annual_limit` and `benefit_used`
- Historical policies: out of scope for MVP

## Validation Rules

- Provider: required
- Reimbursement percent: required, 0 to 1
- Deductible: required non-negative number
- Annual limit: required non-negative number
- Renewal date: optional date
- Deductible type: `annual` or `per_incident`
- Deductible met and benefit used: non-negative numbers

## Edge Cases

- Pet has no policy
- Deductible met exceeds deductible
- Benefit used exceeds annual limit
- Policy has no annual limit
- User uploads policy document without policy fields

## Acceptance Criteria

- User can create, edit, and view one policy per pet
- Summary card shows provider, rate, deductible, annual limit, and renewal date
- Planner can compute remaining deductible and remaining annual limit
- Invalid numeric fields return validation errors
- User A cannot read or update User B's policy

## Success Metrics

All five key fields appear on one screen with zero clicks after opening the pet (replaces the original untestable "under 5 seconds" criterion). The planner can pull accurate remaining-deductible and remaining-limit values.

## Out of Scope

Claim submission, multiple/historical policies per pet, AI policy search (V2+).

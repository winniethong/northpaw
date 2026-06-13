# PRD — Care Cost Planner (F9)

> Northpaw's major differentiator: estimate out-of-pocket cost before a care decision. Fixes the original spec's incorrect math and missing insurance factors. No AI, no real-time provider integrations.

## Problem

Owners can't estimate future costs (dental, bloodwork, ultrasound, surgery) or how much insurance will actually cover.

## Goals

For a selected procedure, show the national average cost range and an accurate estimated owner cost given the pet's policy.

## Users

Owners weighing care decisions; especially those with insurance and senior/chronic-care pets.

## Requirements

User selects a procedure (wellness exam, bloodwork, dental cleaning, x-ray, ultrasound, surgery). Northpaw shows the **species-aware** national average range and the estimated owner cost.

### The formula (corrected)

For cost `C`, reimbursement rate `r`, remaining deductible `D_left`, remaining annual limit `L_left`:

```
covered_base = max(0, C - D_left)              # deductible applied first
reimbursed   = min(covered_base * r, L_left)   # capped by annual limit
owner_cost   = C - reimbursed
```

`D_left` and `L_left` come from the policy's usage fields (see [insurance.md](./insurance.md)).

### Worked example (the spec's own numbers, corrected)

Dental cleaning, C = $500–$1,500, r = 0.80, deductible $250 (unmet, no limit hit):

| | Low ($500) | High ($1,500) |
|---|---|---|
| covered_base = C − 250 | 250 | 1,250 |
| reimbursed = base × 0.80 | 200 | 1,000 |
| **owner_cost = C − reimbursed** | **$300** | **$500** |

Correct estimate: **$300–$500**. (The original spec said $250–$550 — wrong, and it ignored deductible-met, deductible type, and the annual limit. All three are now modeled.)

### Reference implementation

```ts
// Pure function — unit-test against a case table (verification step).
export function estimateOwnerCost(opts: {
  cost: number; rate: number; deductibleLeft: number; limitLeft: number;
}): number {
  const { cost, rate, deductibleLeft, limitLeft } = opts;
  const coveredBase = Math.max(0, cost - deductibleLeft);
  const reimbursed = Math.min(coveredBase * rate, limitLeft);
  return cost - reimbursed;
}
```

### Required disclaimer (legal)

Render near every cost/reimbursement figure: *"Estimate only. Based on national average ranges and the policy details you entered — not a quote. Actual costs and reimbursement vary by provider, region, and policy terms."*

## Data

Static, species-keyed seed table (dog and cat costs differ):

```sql
cost_benchmarks (
  id, procedure_key, species,       -- 'dental_cleaning' × 'dog'/'cat'
  low_usd, high_usd, source_note    -- source + date the range came from
)
```

## Success Metrics

Owners can estimate out-of-pocket expenses before a care decision. The estimate matches the formula on a hand-checked case table (incl. deductible met, limit reached, no-insurance). Every figure shows the disclaimer.

## Out of Scope

Real-time provider pricing, AI cost forecasting, regional adjustment (V2/V3).

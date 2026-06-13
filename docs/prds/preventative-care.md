# PRD — Preventative Care Dashboard (F10) + Reminders (F11)

> Both features are UIs over one rules engine. The original spec defined the UIs but not the logic that decides when care is due — this PRD supplies it.

## Problem

Owners forget preventative care (annual exams, vaccines, dental, bloodwork). In the original spec, "Vaccine Due," "Bloodwork Recommended," etc. had no defined trigger — the dashboards had no engine behind them.

## Goals

Compute what care each pet needs next, when it's due, and at what priority — from the pet's own history — and surface overdue/soon items as reminders.

## Users

All owners; highest value for senior-pet and chronic-condition owners.

## Requirements

### The rules engine

Define care rules once; compute due dates from each pet's history. Rules are species- and age-aware.

```sql
care_rules (
  id, care_key, label,
  species,            -- 'dog'|'cat'|'all'
  min_age_months,     -- rule applies from this age
  max_age_months,     -- null = no upper bound
  interval_months,    -- cadence
  trigger_event_type, -- which event resets the clock
  priority            -- 'high'|'medium'|'low'
)
```

**Seed examples:**

| care_key | species | from age | interval | resets on | priority |
|---|---|---|---|---|---|
| wellness_exam | all | 0 | 12 mo | vet_visit | high |
| wellness_exam (senior) | all | 84 mo | 6 mo | vet_visit | high |
| rabies | all | 3 mo | 36 mo* | vaccination | high |
| dhpp / fvrcp | dog/cat | 2 mo | 12 mo | vaccination | medium |
| dental_cleaning | all | 36 mo | 12 mo | procedure | medium |
| bloodwork | all | 84 mo | 12 mo | vet_visit/lab | medium |

\*Prefer the vaccine's own `expiration_date` when present; otherwise fall back to `interval_months`.

### Due-date computation

For each rule that applies to a pet (species + current age in range):

```
last     = most recent health_event of trigger_event_type for this pet
           (for vaccines, prefer vaccination_details.expiration_date)
due_date = (last ? last.event_date : pet.birth_date) + interval_months
status   = due_date < today        → 'overdue'
           due_date <= today + 30d  → 'due_soon'
           else                     → 'upcoming'
```

Implement as a SQL view or a single server function `getCareSchedule(petId)`.

### Preventative Care Dashboard (F10)

Renders all applicable rules with `due_date`, `status`, and `priority`. Shows upcoming care, due dates, and priority.

### Reminders (F11)

The same query filtered to `status in ('overdue','due_soon')`, surfaced as **in-app dashboard alerts only** (no email, no push for MVP). One engine powers both features — nothing is hardcoded in the UI.

## Data

`care_rules` (above) reading from `health_events` / `vaccination_details` (see [data-model.md](./data-model.md)). No new event storage.

## Success Metrics

Owners see what care is needed next, correctly computed against hand-checked fixture pets (puppy, adult, senior; with and without recent events). Overdue and due-soon items appear automatically without manual setup.

## Out of Scope

Email / push notifications, cost forecasting, AI vet-visit prep (V2+).

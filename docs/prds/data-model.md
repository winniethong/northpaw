# PRD — Data Model, Spine & Security (cross-cutting)

> Shared foundation referenced by every feature PRD. Resolves the review's structural issues: timeline-as-spine, schema duplication, stale weight, attachment overlap, and row-level security.

## Purpose

Define one consistent schema so that every health event has a single home, no data is double-entered, and no user can read another user's records.

---

## Decision: the Health Timeline is the spine

`health_events` is the single source of truth. Everything that happens to a pet is an event. Specialized tables hold structured detail and link 1:1 back to one event. There is **never** a vet visit, vaccination, or procedure that does not also exist as exactly one `health_events` row.

```
health_events (spine)
  ├─ event_type = 'vet_visit'     → vet_visit_details   (1:1)
  ├─ event_type = 'vaccination'   → vaccination_details (1:1)
  ├─ event_type = 'procedure'     → procedure_details   (1:1)
  ├─ event_type = 'weight'        → weight_details      (1:1)
  └─ symptom | medication | food_change | custom → no detail table
```

This replaces the standalone `vet_visits` and `vaccinations` tables from the original spec. The timeline, preventative dashboard, and reminders all read from this one place.

---

## Core tables

```sql
-- USERS (Supabase Auth; mirror for joins)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

-- PETS  (no weight column — weight is derived, see below)
create table pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  species text not null,            -- 'dog' | 'cat'
  breed text,
  birth_date date,
  sex text,                         -- 'male' | 'female' | 'unknown'
  profile_image_url text,
  archived_at timestamptz,          -- soft delete / RIP
  created_at timestamptz not null default now()
);

-- HEALTH EVENTS (the spine)
create table health_events (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  event_type text not null,         -- symptom|medication|weight|food_change|
                                     -- vet_visit|vaccination|procedure|custom
  title text not null,
  notes text,
  event_date date not null,
  created_at timestamptz not null default now()
);
create index on health_events (pet_id, event_date desc);
```

## Detail tables (1:1 extensions)

```sql
create table vet_visit_details (
  event_id uuid primary key references health_events(id) on delete cascade,
  clinic_name text,
  diagnosis text,
  follow_up text
);

create table vaccination_details (
  event_id uuid primary key references health_events(id) on delete cascade,
  vaccine_name text not null,
  administered_date date not null,  -- == parent event_date
  expiration_date date              -- drives reminders
);

create table procedure_details (
  event_id uuid primary key references health_events(id) on delete cascade,
  procedure_name text,
  outcome text
);

create table weight_details (
  event_id uuid primary key references health_events(id) on delete cascade,
  weight_kg numeric not null
);
```

## Weight is derived, never stored on the pet

```sql
create view pet_current_weight as
select p.id as pet_id, wd.weight_kg, he.event_date as measured_on
from pets p
join lateral (
  select he.id, he.event_date from health_events he
  where he.pet_id = p.id and he.event_type = 'weight'
  order by he.event_date desc limit 1
) he on true
join weight_details wd on wd.event_id = he.id;
```

The pet header reads "Current weight" from this view, so it can never go stale.

## Documents: one store, optionally linked to an event

```sql
create table documents (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references pets(id) on delete cascade,
  category text not null,           -- vaccination|bloodwork|lab|vet_notes|
                                     -- procedure|insurance|misc
  file_url text not null,
  event_id uuid references health_events(id) on delete set null,
  uploaded_at timestamptz not null default now()
);
```

Attachments live **only** here (replacing `health_events.attachment_url`). An event can have zero or many documents via `documents.event_id`; the timeline shows a paperclip when any exist.

## Reference / seed tables

`insurance_policies`, `cost_benchmarks`, and `care_rules` are defined in their respective feature PRDs ([insurance](./insurance.md), [care-cost-planner](./care-cost-planner.md), [preventative-care](./preventative-care.md)).

---

## Row-Level Security (mandatory)

Without RLS, any authenticated user can read any pet. Enable on every pet-scoped table and gate by ownership.

```sql
alter table pets enable row level security;
create policy pets_owner on pets
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Pattern for every child table (repeat for documents, insurance_policies):
alter table health_events enable row level security;
create policy he_owner on health_events
  using (exists (select 1 from pets p
                 where p.id = health_events.pet_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from pets p
                 where p.id = health_events.pet_id and p.owner_id = auth.uid()));
```

Detail tables (`*_details`) gate through their parent event's pet. Supabase Storage buckets get matching policies so files are owner-only, served via signed, time-limited URLs.

## Deletion, archiving & export

- **Archive pet (RIP/inactive):** set `pets.archived_at`; hidden from default views, records retained.
- **Hard delete pet:** `on delete cascade` clears events, details, documents, policies; delete storage objects in the same edge function.
- **Document delete:** explicit action removes row + storage object.
- **Account delete:** cascade `profiles` → `auth.users`; offer "Download my data" first.
- **Export:** one endpoint returns a ZIP — JSON of all the user's rows plus uploaded files (supports vet handoff).

## PII posture

Pet health + financial PII (not HIPAA, but handled carefully): Supabase encryption at rest, TLS in transit, RLS as the access boundary, signed URLs for downloads, no PII in logs.

## Success Criteria

A second authenticated user cannot read or write pet A's rows (RLS policy test). No feature stores weight on `pets`. No attachment exists outside `documents`. Every vet visit / vaccination / procedure resolves to exactly one `health_events` row.

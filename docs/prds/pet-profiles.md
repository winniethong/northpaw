# PRD — Pet Profiles (F2)

>  A central profile for each pet; the anchor every other record hangs off.

## Problem

A pet's information is scattered. Owners need one profile per pet as the root of all health and financial records.

## Goals

Let users create, edit, view, archive, and manage multiple pets.

## Users

All owners, including multi-pet households.

## Requirements

Users can create a pet, edit it, view it, and archive it (soft delete for inactive/deceased pets). The header surfaces the pet's **current weight derived from the latest weight event** — weight is not stored on the pet record (see [data-model.md](./data-model.md)). Species is constrained to `dog`/`cat` so species-aware cost and care logic can key off it.

## Data

```sql
pets (
  id, owner_id → profiles, name, species, breed,
  birth_date, sex, profile_image_url, archived_at, created_at
)
-- current weight via the pet_current_weight view (see data-model.md)
```

Note vs. original spec: the `weight` column is removed; it lives in `weight_details` and is read through a view to avoid staleness.

## Success Metrics

A user can create and manage multiple pets. The displayed weight always matches the most recent weight event. Archived pets disappear from default lists without losing data.

## Out of Scope

Shared/co-owned pets, breed-specific auto-suggestions beyond cost/care keys (post-MVP).

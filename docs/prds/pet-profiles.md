# PRD - Pet Profiles (F2)

>  A central profile for each pet; the anchor every other record hangs off.

## Problem

A pet's information is scattered. Owners need one profile per pet as the root of all health and financial records.

## Goals

Let users create, edit, view, archive, and manage multiple pets.

## Users

All owners, including multi-pet households.

## Requirements

Users can create a pet, edit it, view it, and archive it (soft delete for inactive/deceased pets). The header surfaces the pet's **current weight derived from the latest weight event**; weight is not stored on the pet record (see [data-model.md](./data-model.md)). Species supports common household pets (`dog`, `cat`, `bird`, `rabbit`, `guinea_pig`, `turtle`, `fish`, `reptile`, `horse`, `other`). Species-aware cost and care logic should use exact rules where available and fall back to generic rules for less common species.

## Data

```sql
pets (
  id, owner_id → profiles, name, species, breed,
  birth_date, sex, profile_image_url, archived_at, created_at
)
-- current weight via the pet_current_weight view (see data-model.md)
```

Note vs. original spec: the `weight` column is removed; it lives in `weight_details` and is read through a view to avoid staleness.

## Technical Design

- Routes: `/dashboard`, `/dashboard/pets/new`, `/dashboard/pets/[petId]`
- Components: `PetCard`, `PetForm`, `PetProfileCard`, `ArchivePetButton`
- Server actions: `createPet`, `updatePet`, `archivePet`
- Reads: `pets`, `pet_current_weight`, recent `health_events`
- Writes: `pets` inserts and updates scoped to the authenticated user
- Cache behavior: revalidate `/dashboard` after create, update, or archive
- Redirect behavior: unauthenticated users redirect to `/login`

## Validation Rules

- `name`: required, trimmed
- `species`: required, must match supported species list
- `breed`: optional, trimmed
- `birth_date`: optional date
- `sex`: optional enum value
- `weight`: never accepted on `pets`

## Data Ownership

- `owner_id`: set from `auth.uid()`
- RLS: users can only read and write their own pets
- Archive: set `archived_at`, keep child records
- Default dashboard query: hide archived pets

## Edge Cases

- Pet has no current weight
- Pet has no recent timeline events
- User submits unsupported species manually
- User archives a pet with existing events or documents
- Supabase insert or update fails

## Acceptance Criteria

- Authenticated user can create, edit, view, and archive a pet
- Archived pets do not appear on the default dashboard
- Current weight comes from `pet_current_weight`
- User A cannot read or mutate User B's pets
- Unsupported species returns a validation error

## Success Metrics

A user can create and manage multiple pets. The displayed weight always matches the most recent weight event. Archived pets disappear from default lists without losing data.

## Out of Scope

Shared/co-owned pets, breed-specific auto-suggestions beyond cost/care keys (post-MVP).

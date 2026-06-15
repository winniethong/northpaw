# PRD - Health Timeline (F3) + Vet Visits (F5) + Vaccinations (F6)

> The single source of truth for pet health history. Vet Visit Tracking and Vaccination Tracking are **not** separate features. They are event types on this one spine (see [data-model.md](./data-model.md)). This eliminates the original spec's double-entry problem.

## Problem

Health information is fragmented across PDFs, portals, emails, notes, and photos. Owners need one chronological record. In the original spec, vet visits and vaccinations existed both as timeline event types *and* as standalone tables, so the same visit could appear in one place but not the other.

## Goals

Give owners one chronological timeline where every health event lives, and let structured records (vet visits, vaccinations, procedures, weight) extend that timeline without duplicating it.

## Users

All owners; especially those managing chronic or senior-pet conditions.

## Requirements

Users add health events of these types: **symptom, medication, weight entry, food change, vet visit, vaccination, procedure, custom**. The UI is a chronological timeline per pet.

Vet visit, vaccination, procedure, and weight events open a detail panel backed by a 1:1 detail table. A paperclip appears when linked documents exist.

```
Example:
Mar 3   Started new food
Mar 10  Loose stool (symptom)
Apr 1   Vet visit: Bayview Animal Hospital, dx: dietary intolerance
```

### Folded-in: Vet Visit Tracking (was F5)

Logged as `event_type = 'vet_visit'` with `vet_visit_details` (clinic_name, diagnosis, follow_up). A "Vet Visits" filtered view of the timeline replaces the standalone feature. `clinic_name` is normalized on input (trim, title-case) to limit "VCA" vs "VCA Animal Hospital" drift.

### Folded-in: Vaccination Tracking (was F6)

Logged as `event_type = 'vaccination'` with `vaccination_details` (vaccine_name, administered_date, expiration_date). `expiration_date` feeds the reminders engine (see [preventative-care.md](./preventative-care.md)).

## Data

Spine `health_events` plus `vet_visit_details`, `vaccination_details`, `procedure_details`, `weight_details`; full definitions in [data-model.md](./data-model.md). Attachments live in `documents` (see [document-management.md](./document-management.md)), never on the event row.

## Technical Design

- Route: `/dashboard/pets/[petId]`
- Components: `Timeline`, `AddEventDialog`, `AddEventForm`, `UpdateWeightDialog`
- Server actions: `addTimelineEvent`, `logWeight`
- RPC: `add_timeline_event`
- Reads: `health_events`, detail tables, `documents`, `pet_current_weight`
- Writes: one parent event plus optional detail row
- Cache behavior: revalidate pet page and dashboard after event insert

## Event Contracts

- `symptom`: parent `health_events` row only
- `medication`: parent `health_events` row only
- `food_change`: parent `health_events` row only
- `custom`: parent `health_events` row only
- `vet_visit`: parent row plus `vet_visit_details`
- `vaccination`: parent row plus `vaccination_details`
- `procedure`: parent row plus `procedure_details`
- `weight`: parent row plus `weight_details`

## Validation Rules

- `event_type`: required, must match supported event list
- `title`: required, trimmed
- `event_date`: required date
- `notes`: optional, trimmed
- `vaccine_name`: required for vaccinations
- `weight_kg`: required positive number for weight events
- Detail fields: read only for their matching event type

## Data Ownership

- `pet_id`: parent ownership checked through RLS
- Detail tables: access inherited through parent `health_events`
- Documents: linked by nullable `documents.event_id`
- Weight display: derived from latest `weight` event

## Edge Cases

- Pet has no timeline events
- User adds event with unsupported type
- Vaccination missing vaccine name
- Weight entry is zero, negative, or non-numeric
- Document exists without a linked event
- RPC creates parent event but detail insert fails

## Acceptance Criteria

- Timeline renders events in reverse chronological order
- Typed events create exactly one parent row and one matching detail row
- Parent-only events create no detail row
- Weight update changes `pet_current_weight`
- Timeline paperclip appears when linked documents exist
- User A cannot add events to User B's pet

## Success Metrics

Users can review a pet's full history in one chronological view. A vet visit or vaccination entered anywhere appears everywhere it's relevant (timeline, filtered views, reminders). No event has a stranded attachment.

## Out of Scope

Health correlation / pattern detection, AI summaries (V2+).

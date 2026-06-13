# PRD — Health Timeline (F3) + Vet Visits (F5) + Vaccinations (F6)

> The single source of truth for pet health history. Vet Visit Tracking and Vaccination Tracking are **not** separate features — they are event types on this one spine (see [data-model.md](./data-model.md)). This eliminates the original spec's double-entry problem.

## Problem

Health information is fragmented across PDFs, portals, emails, notes, and photos. Owners need one chronological record. In the original spec, vet visits and vaccinations existed both as timeline event types *and* as standalone tables — so the same visit could appear in one place but not the other.

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
Apr 1   Vet visit — Bayview Animal Hospital · dx: dietary intolerance
```

### Folded-in: Vet Visit Tracking (was F5)

Logged as `event_type = 'vet_visit'` with `vet_visit_details` (clinic_name, diagnosis, follow_up). A "Vet Visits" filtered view of the timeline replaces the standalone feature. `clinic_name` is normalized on input (trim, title-case) to limit "VCA" vs "VCA Animal Hospital" drift.

### Folded-in: Vaccination Tracking (was F6)

Logged as `event_type = 'vaccination'` with `vaccination_details` (vaccine_name, administered_date, expiration_date). `expiration_date` feeds the reminders engine (see [preventative-care.md](./preventative-care.md)).

## Data

Spine `health_events` plus `vet_visit_details`, `vaccination_details`, `procedure_details`, `weight_details` — full definitions in [data-model.md](./data-model.md). Attachments live in `documents` (see [document-management.md](./document-management.md)), never on the event row.

## Success Metrics

Users can review a pet's full history in one chronological view. A vet visit or vaccination entered anywhere appears everywhere it's relevant (timeline, filtered views, reminders). No event has a stranded attachment.

## Out of Scope

Health correlation / pattern detection, AI summaries (V2+).

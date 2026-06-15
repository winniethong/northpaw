# PRD - Onboarding & First-Run Experience

> Addresses the biggest product risk: the value prop is "fix fragmentation," but the MVP asks users to re-key everything. The likely failure mode is an empty dashboard the user abandons. Goal: time-to-first-value without AI.

## Problem

Northpaw's value depends on data the user must enter manually (events, documents, insurance). If the first session is all data entry with no payoff, users churn before the product proves itself.

## Goals

Get a new user to a *populated, useful* dashboard within the first few minutes with minimal typing and no required uploads.

## Users

All new users, especially first-time pet owners and busy millennial/Gen Z owners.

## Requirements

1. **3-screen setup wizard** on first run:
   - **(a) Pet basics:** name, species, breed, birth date, sex.
   - **(b) "What's coming up?":** pick any known vaccine/exam dates so the preventative dashboard lights up immediately.
   - **(c) Insurance (optional, skippable):** provider + key fields.
2. **Quick-add everywhere.** A single "+ Add" affordance creates any health event in ≤2 taps, with smart defaults (`event_date = today`, type pre-filled by context).
3. **Defer, don't block.** Insurance and documents are skippable. The app is useful with just a pet + a couple of dates.
4. **Value before completeness.** With even one vaccine entered, render the next due date and a sample cost estimate so the payoff is visible.
5. **Document upload = instant win.** Lead with "drag in a PDF, tag a category" as the fastest path to centralizing records; an upload can optionally create a linked timeline event.

No OCR or AI is required. This is entirely flow and defaults.

> **Sequencing note.** The "populated, useful dashboard" payoff (an upcoming-care item / cost estimate) depends on the **v1.1 engines** (care-rules + cost planner); see the Dashboard v0/v1 split in [prod-requirements.md](../prod-requirements.md). Until those land, **Dashboard v0** delivers the interim home: pet roster + recent timeline activity + current weight. The 3-screen wizard described here is a **polish layer over Pet Profiles (F2)**, built after the underlying create-pet/timeline flows and the v0 home exist.

## Technical Design

- Entry point: first authenticated dashboard visit with no active pets
- Step 1: pet basics through `createPet`
- Step 2: known vaccine or exam dates through `addTimelineEvent`
- Step 3: optional insurance through insurance policy action
- Quick-add: shared event creation entry point
- Dashboard v0 result: pet roster, recent events, current weight
- Dashboard v1 result: care due, cost estimate, insurance snapshot

## Dependencies

- Requires Auth PRD for session boundary
- Requires Pet Profiles PRD for first pet creation
- Requires Health Timeline PRD for quick-add events
- Requires Data Model PRD for RLS and derived weight
- Blocks metric widgets until cost and care engines exist

## Validation Rules

- Pet name: required
- Species: required, supported species only
- Insurance fields: optional
- Document upload: optional
- Timeline date defaults: today when context allows

## Edge Cases

- User skips insurance
- User has no known vaccine or exam dates
- User abandons wizard after pet creation
- User returns with one pet and no events
- User has archived pets only

## Acceptance Criteria

- New user can create a first pet without uploading a document
- Skipped insurance does not block dashboard access
- Quick-add creates a valid timeline event in two taps or less
- Dashboard v0 never renders empty metric widgets
- Dashboard v1 metrics render only after their engines exist

## Success Metrics

A new user reaches a dashboard showing at least one upcoming-care item and/or one cost estimate before being asked to upload anything. Setup wizard completes in under ~2 minutes.

## Out of Scope

OCR / auto-import of records, AI-assisted entry, vet-portal sync (all post-MVP).

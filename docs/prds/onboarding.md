# PRD — Onboarding & First-Run Experience

> Addresses the biggest product risk: the value prop is "fix fragmentation," but the MVP asks users to re-key everything. The likely failure mode is an empty dashboard the user abandons. Goal: time-to-first-value without AI.

## Problem

Northpaw's value depends on data the user must enter manually (events, documents, insurance). If the first session is all data entry with no payoff, users churn before the product proves itself.

## Goals

Get a new user to a *populated, useful* dashboard within the first few minutes — with minimal typing and no required uploads.

## Users

All new users, especially first-time pet owners and busy millennial/Gen Z owners.

## Requirements

1. **3-screen setup wizard** on first run:
   - **(a) Pet basics** — name, species, breed, birth date, sex.
   - **(b) "What's coming up?"** — pick any known vaccine/exam dates so the preventative dashboard lights up immediately.
   - **(c) Insurance (optional, skippable)** — provider + key fields.
2. **Quick-add everywhere.** A single "+ Add" affordance creates any health event in ≤2 taps, with smart defaults (`event_date = today`, type pre-filled by context).
3. **Defer, don't block.** Insurance and documents are skippable. The app is useful with just a pet + a couple of dates.
4. **Value before completeness.** With even one vaccine entered, render the next due date and a sample cost estimate so the payoff is visible.
5. **Document upload = instant win.** Lead with "drag in a PDF, tag a category" as the fastest path to centralizing records; an upload can optionally create a linked timeline event.

No OCR or AI is required — this is entirely flow and defaults.

## Success Metrics

A new user reaches a dashboard showing at least one upcoming-care item and/or one cost estimate before being asked to upload anything. Setup wizard completes in under ~2 minutes.

## Out of Scope

OCR / auto-import of records, AI-assisted entry, vet-portal sync (all post-MVP).

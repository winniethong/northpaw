# PRD — AI Health Summary (V2 — NOT in MVP)

> **Status: deferred to V2.** Placeholder only. The MVP contains **no AI** — see the [master PRD](../prod-requirements.md). AI is added only after meaningful data exists in the spine.

## Why deferred

AI features (summary, vet-visit prep, record search, policy search) need a populated `health_events` history and document corpus to be useful and safe. Building them before users have data produces empty, low-quality output. The MVP's job is to accumulate that data through the timeline, documents, and insurance vault.

## V2 scope (when revisited)

1. **AI Health Summary** — natural-language "how is my pet doing" over the timeline.
2. **AI Vet Visit Preparation** — surface relevant history before an appointment.
3. **AI Record Search** — semantic search across documents.
4. **AI Insurance Policy Search** — answer coverage questions from policy docs.

## Prerequisites before building

A stable MVP with real timeline/document/insurance data, plus a privacy/retention review for sending health + financial PII to any model. Out of scope: everything in this file, until V2.

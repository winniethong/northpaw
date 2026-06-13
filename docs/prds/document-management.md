# PRD — Document Management (F4)

> Centralize all pet records in one store. Resolves the attachment overlap with the timeline.

## Problem

Records live across PDFs, emails, and photos. Owners need one place to find everything.

## Goals

Let users upload, categorize, find, and delete records, optionally linking a document to a timeline event.

## Users

All owners.

## Requirements

Upload PDF, JPG, PNG into categories: **Vaccination Record, Bloodwork, Lab Results, Vet Notes, Procedure Records, Insurance Documents, Miscellaneous.**

Attachments live **only** in the `documents` table — `health_events` has no `attachment_url`. A document may optionally link to one event via `documents.event_id`; an event can have many documents. This single store powers both the document library and the timeline's paperclip indicator. Files are stored in Supabase Storage with owner-only policies and served via signed, time-limited URLs.

Documents can be deleted (row + storage object) and are included in the account data export (see [data-model.md](./data-model.md)).

## Data

```sql
documents ( id, pet_id → pets, category, file_url,
            event_id → health_events (nullable), uploaded_at )
```

## Success Metrics

Users find all records in one location, filtered by category. Uploading and tagging a document takes ≤2 steps. No attachment exists outside this table.

## Out of Scope

OCR / text extraction, AI record search, auto-categorization (V2+).

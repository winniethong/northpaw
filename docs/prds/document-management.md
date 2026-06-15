# PRD - Document Management (F4)

> Centralize all pet records in one store. Resolves the attachment overlap with the timeline.

## Problem

Records live across PDFs, emails, and photos. Owners need one place to find everything.

## Goals

Let users upload, categorize, find, and delete records, optionally linking a document to a timeline event.

## Users

All owners.

## Requirements

Upload PDF, JPG, PNG into categories: **Vaccination Record, Bloodwork, Lab Results, Vet Notes, Procedure Records, Insurance Documents, Miscellaneous.**

Attachments live **only** in the `documents` table; `health_events` has no `attachment_url`. A document may optionally link to one event via `documents.event_id`; an event can have many documents. This single store powers both the document library and the timeline's paperclip indicator. Files are stored in Supabase Storage with owner-only policies and served via signed, time-limited URLs.

Documents can be deleted (row + storage object) and are included in the account data export (see [data-model.md](./data-model.md)).

## Data

```sql
documents ( id, pet_id → pets, category, file_url,
            event_id → health_events (nullable), uploaded_at )
```

## Technical Design

- Storage: Supabase Storage bucket with owner-only policies
- Metadata: `documents` table
- Upload flow: file upload, category select, optional event link, row insert
- Download flow: signed URL generation
- Delete flow: remove storage object, then remove row
- Timeline link: paperclip indicator through `documents.event_id`
- Export flow: include rows and files in account export

## Data Ownership

- `pet_id`: parent ownership checked through RLS
- `event_id`: nullable link to `health_events`
- `file_url`: storage object path, not public URL
- Signed URLs: time-limited access only
- Attachments: never stored on `health_events`

## Validation Rules

- File type: PDF, JPG, PNG
- Category: required supported category
- Pet: required active pet
- Event link: optional, must belong to same pet
- File size: enforce upload limit before storage write

## Edge Cases

- Upload succeeds but row insert fails
- Row delete succeeds but storage delete fails
- Event is deleted after document link
- Document has no linked event
- User requests another user's file path

## Acceptance Criteria

- User can upload and categorize a document
- User can link a document to a timeline event
- Timeline shows paperclip for events with linked documents
- User can delete row and storage object
- Signed URL access expires
- User A cannot access User B's documents

## Success Metrics

Users find all records in one location, filtered by category. Uploading and tagging a document takes ≤2 steps. No attachment exists outside this table.

## Out of Scope

OCR / text extraction, AI record search, auto-categorization (V2+).

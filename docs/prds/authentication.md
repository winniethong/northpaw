# PRD — Authentication (F1)

> Secure access to a user's pets and records via Supabase Auth.

## Problem

Users need a private, secure account boundary around sensitive pet health and financial data.

## Goals

Let users create an account, log in, and log out, and ensure every downstream query is scoped to the authenticated user.

## Users

All users.

## Requirements

Users can create an account, log in, and log out (Supabase Auth, email + password for MVP). On signup, a `profiles` row mirrors the `auth.users` record for joins. All data access is gated by Row-Level Security keyed on `auth.uid()` — see [data-model.md](./data-model.md).

## Data

```sql
profiles ( id uuid PK → auth.users, email text, created_at timestamptz )
```

## Success Metrics

Users can authenticate and reach their dashboard. A logged-out request returns no pet data. A logged-in user sees only their own pets (verified by RLS test in [data-model.md](./data-model.md)).

## Out of Scope

Multi-user households / shared pets, SSO, magic links (post-MVP).

# PRD - Authentication (F1)

> Secure access to a user's pets and records via Supabase Auth.

## Problem

Users need a private, secure account boundary around sensitive pet health and financial data.

## Goals

Let users create an account, log in, and log out, and ensure every downstream query is scoped to the authenticated user.

## Users

All users.

## Requirements

Users can create an account, log in, and log out (Supabase Auth, name + email + password for MVP). On signup, a `profiles` row mirrors the `auth.users` record for joins and app display. All data access is gated by Row-Level Security keyed on `auth.uid()`; see [data-model.md](./data-model.md).

## Data

```sql
profiles ( id uuid PK → auth.users, email text, name text, created_at timestamptz )
```

## Technical Design

- Provider: Supabase Auth
- Auth method: email and password
- Signup input: `name`, `email`, `password`
- Profile sync: `handle_new_user` trigger
- Session access: Supabase server client
- Route guard: middleware through `updateSession`
- Public routes: `/`, `/login`, `/signup`
- Protected routes: `/dashboard`, pet pages, authenticated actions

## Server Actions

- `signup`: validate name, email, password, then create Supabase Auth user
- `login`: validate email and password, then create session
- `logout`: clear session and redirect
- `signup` metadata: pass `name` through `options.data`

## Data Ownership

- `profiles.id`: matches `auth.users.id`
- `profiles.email`: copied from Supabase Auth user
- `profiles.name`: copied from signup metadata or fallback
- RLS dependency: downstream tables compare owner IDs to `auth.uid()`

## Edge Cases

- Missing name on signup
- Missing email or password
- Password shorter than minimum length
- Supabase Auth error
- Logged-out request to protected route
- Logged-in request to auth pages

## Acceptance Criteria

- New signup creates an Auth user and a `profiles` row
- Logged-in user reaches `/dashboard`
- Logged-out user cannot load protected data
- Logged-in user redirects away from `/login` and `/signup`
- RLS prevents cross-user pet access

## Success Metrics

Users can authenticate and reach their dashboard. A logged-out request returns no pet data. A logged-in user sees only their own pets (verified by RLS test in [data-model.md](./data-model.md)).

## Out of Scope

Multi-user households / shared pets, SSO, magic links (post-MVP).

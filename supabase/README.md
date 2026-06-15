# Supabase

## Schema

The full database schema lives in [`schema.sql`](./schema.sql) — it's the source
of truth: tables, the derived `pet_current_weight` view, the `add_timeline_event`
and `handle_new_user` functions, the signup trigger, and all Row-Level Security.

It's idempotent (`if not exists` / `create or replace`), so it's safe to re-run.

## Working with it

- **Day-to-day changes:** use the Supabase **SQL editor** on the hosted project.
  When you make a *structural* change there, mirror it into `schema.sql` so the
  repo stays in sync with the database (this is what prevents code/schema drift).
- **Rebuild a fresh database:** paste `schema.sql` into the SQL editor, or
  `psql "$DATABASE_URL" -f supabase/schema.sql`.

The hosted project already matches `schema.sql`.

> Not using the Supabase CLI migration workflow. If you adopt it later, the CLI
> wants timestamped files under `supabase/migrations/` (`supabase migration new …`).

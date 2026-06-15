-- Northpaw database schema — the source of truth for the whole database.
--
-- Tables, the derived `pet_current_weight` view, the `add_timeline_event` /
-- `handle_new_user` functions, the signup trigger, and all Row-Level Security.
-- Idempotent (`if not exists` / `create or replace`), so it's safe to re-run.
--
-- To build a fresh database: paste this into the Supabase SQL editor, or run
--   psql "$DATABASE_URL" -f supabase/schema.sql
-- The hosted project already matches this file.

-- ─────────────────────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────────────────────

-- Users — mirror of auth.users for joins (see docs/prds/data-model.md).
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  name text not null,
  created_at timestamptz not null default now()
);

-- Pets — owner-scoped. Weight is NOT stored here; it is derived (see view).
create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  species text not null,            -- dog|cat|bird|rabbit|guinea_pig|turtle|fish|reptile|horse|other
  breed text,
  birth_date date,
  sex text,                         -- 'male' | 'female' | 'unknown'
  profile_image_url text,
  archived_at timestamptz,          -- soft delete (RIP/inactive)
  created_at timestamptz not null default now()
);

-- Health events — the timeline spine; every health record is one row here.
create table if not exists public.health_events (
  id uuid primary key default gen_random_uuid(),
  pet_id uuid not null references public.pets (id) on delete cascade,
  event_type text not null,         -- symptom|medication|weight|food_change|vet_visit|vaccination|procedure|custom
  title text not null,
  notes text,
  event_date date not null,
  created_at timestamptz not null default now()
);
create index if not exists health_events_pet_id_event_date_idx
  on public.health_events (pet_id, event_date desc);

-- 1:1 detail extensions (gated through their parent event's pet).
create table if not exists public.vet_visit_details (
  event_id uuid primary key references public.health_events (id) on delete cascade,
  clinic_name text,
  diagnosis text,
  follow_up text
);

create table if not exists public.vaccination_details (
  event_id uuid primary key references public.health_events (id) on delete cascade,
  vaccine_name text not null,
  administered_date date not null,
  expiration_date date
);

create table if not exists public.procedure_details (
  event_id uuid primary key references public.health_events (id) on delete cascade,
  procedure_name text,
  outcome text
);

create table if not exists public.weight_details (
  event_id uuid primary key references public.health_events (id) on delete cascade,
  weight_kg numeric not null
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Derived current weight (security_invoker so the caller's RLS applies)
-- ─────────────────────────────────────────────────────────────────────────────
create or replace view public.pet_current_weight
  with (security_invoker = true) as
select
  p.id as pet_id,
  wd.weight_kg,
  he.event_date as measured_on
from public.pets p
join lateral (
  select he_1.id, he_1.event_date
  from public.health_events he_1
  where he_1.pet_id = p.id and he_1.event_type = 'weight'
  order by he_1.event_date desc, he_1.created_at desc
  limit 1
) he on true
join public.weight_details wd on wd.event_id = he.id;

-- ─────────────────────────────────────────────────────────────────────────────
-- Functions
-- ─────────────────────────────────────────────────────────────────────────────

-- Mirror new auth users into profiles, copying the display name from signup
-- metadata (key 'name'), falling back to the email local-part.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(new.email, '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Atomic insert: spine event + matching typed detail in one transaction.
-- security invoker => RLS is enforced as the calling user.
create or replace function public.add_timeline_event(
  p_pet_id uuid,
  p_event_type text,
  p_title text,
  p_event_date date,
  p_notes text default null,
  p_detail jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_event_id uuid;
begin
  insert into public.health_events (pet_id, event_type, title, notes, event_date)
  values (p_pet_id, p_event_type, p_title, p_notes, p_event_date)
  returning id into v_event_id;

  if p_event_type = 'vet_visit' then
    insert into public.vet_visit_details (event_id, clinic_name, diagnosis, follow_up)
    values (v_event_id,
            nullif(p_detail->>'clinic_name',''),
            nullif(p_detail->>'diagnosis',''),
            nullif(p_detail->>'follow_up',''));
  elsif p_event_type = 'vaccination' then
    insert into public.vaccination_details (event_id, vaccine_name, administered_date, expiration_date)
    values (v_event_id,
            p_detail->>'vaccine_name',
            coalesce((p_detail->>'administered_date')::date, p_event_date),
            nullif(p_detail->>'expiration_date','')::date);
  elsif p_event_type = 'procedure' then
    insert into public.procedure_details (event_id, procedure_name, outcome)
    values (v_event_id,
            nullif(p_detail->>'procedure_name',''),
            nullif(p_detail->>'outcome',''));
  elsif p_event_type = 'weight' then
    insert into public.weight_details (event_id, weight_kg)
    values (v_event_id, (p_detail->>'weight_kg')::numeric);
  end if;

  return v_event_id;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Row-Level Security — every pet-scoped table gated by ownership
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.health_events enable row level security;
alter table public.vet_visit_details enable row level security;
alter table public.vaccination_details enable row level security;
alter table public.procedure_details enable row level security;
alter table public.weight_details enable row level security;

drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles
  for all to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists pets_owner on public.pets;
create policy pets_owner on public.pets
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

drop policy if exists he_owner on public.health_events;
create policy he_owner on public.health_events
  for all to authenticated
  using (exists (select 1 from public.pets p
                 where p.id = health_events.pet_id and p.owner_id = auth.uid()))
  with check (exists (select 1 from public.pets p
                 where p.id = health_events.pet_id and p.owner_id = auth.uid()));

-- Detail tables gate through their parent event's pet.
do $$
declare t text;
begin
  foreach t in array array['vet_visit_details','vaccination_details','procedure_details','weight_details']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_owner', t);
    execute format($f$
      create policy %I on public.%I
        for all to authenticated
        using (exists (select 1 from public.health_events he
                       join public.pets p on p.id = he.pet_id
                       where he.id = %I.event_id and p.owner_id = auth.uid()))
        with check (exists (select 1 from public.health_events he
                            join public.pets p on p.id = he.pet_id
                            where he.id = %I.event_id and p.owner_id = auth.uid()))
    $f$, t || '_owner', t, t, t);
  end loop;
end $$;

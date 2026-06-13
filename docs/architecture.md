# Northpaw — Architecture

This is the "how it's built and why" doc. Table-level detail lives in [data-model.md](./prds/data-model.md).

One honest caveat up front: the MVP ships **no AI**. OpenAI is in the diagram because the system is shaped to add it later, but it's dark for now. More info on that below.

---

## The shape of it

```
            Next.js Frontend          ← what the user sees
                   │
            Next.js API Routes         ← the brains: auth, business logic, the engines
                   │
      ┌────────────┼────────────┐
      │            │            │
 Supabase     Supabase      OpenAI API
 Postgres     Storage       (V2 — off in MVP)
 (data +      (files)
  Auth + RLS)
```

Four moving parts, and one of them is asleep. That's the point — I kept the MVP small on purpose.

- **Next.js frontend** — the UI. Dashboards, the health timeline, forms.
- **Next.js API routes** — same framework, server side. This is where authorization happens and where the cost and care-reminder logic runs.
- **Supabase** — Postgres for structured data, Storage for files, Auth for identity. One platform instead of three.
- **OpenAI** — planned for V2 (health summaries, record search). Not wired up yet.

---

## How the pieces talk

Frontend talks to API routes over plain HTTPS, same origin. Reads can go straight to Postgres from the server for fast page loads; anything that writes or needs a permission check goes through an API route so the logic lives server-side, not in the browser.

The important bit is auth. A user logs in via Supabase Auth and gets a token. Every database query carries that token, and **Postgres Row-Level Security uses it to filter rows down to that user.** So even if I screw up a check in application code, the database itself won't hand back someone else's pet records. For an app holding health and money data, that's the safety net I wanted at the lowest possible layer.

Files don't flow through my server. The API hands the browser a short-lived signed URL and the browser uploads or downloads straight to Storage. Less compute for me, and the same ownership rules apply.

OpenAI, when it exists, only ever gets called server-side, the API key never touches the client.

---

## Where data lives

Two stores, split by what they hold. **Structured stuff in Postgres, files in Storage.** A document row keeps a pointer to the file; the bytes stay in Storage.

The core idea in the data model: **`health_events` is the single source of truth.** Everything that happens to a pet (vet visit, vaccine, weight check, symptoms) is an event. Vet visits and vaccinations aren't their own separate tables, they're 1:1 detail extensions of an event. That's what lets the timeline, the reminders, and the preventative-care dashboard all read from one place instead of three tables that drift out of sync.

The main tables:

- `profiles` / `pets` — users and their pets
- `health_events` — the spine; every event hangs here
- `*_details` (vet visit, vaccination, procedure, weight), 1:1 extensions of an event
- `documents` — file metadata + a Storage pointer
- `insurance_policies` — policy terms plus deductible/benefit usage (the cost planner needs these)
- `cost_benchmarks` / `care_rules` — seeded reference data for the planner and reminders

Weight isn't stored on the pet — it's derived from the latest weight event via a view, so it can't go stale. Full schema and the RLS policies are in [data-model.md](./prds/data-model.md).

---

## Why I built it this way

**One framework, front to back.** Next.js gives me UI and API in one language, one repo, one deploy. Also solo-building an MVP.

**Supabase because of RLS.** Postgres, Auth, and Storage in one product is convenient, but the real reason is row-level security. It puts the "you can only see your own data" rule in the database, which is exactly where I want it for sensitive data.

**Auth split in two.** Authentication ("who are you?") is all Supabase Auth — it verifies the login and issues a JWT, and I don't build session or password handling myself. Authorization ("what can you touch?") is the part I own, and it lives in Postgres RLS: every policy filters rows against the user's `auth.uid()` from that token. I put it in the database instead of the API routes because app-code checks are opt-in  (the endpoint you forget is the leak) while RLS filters every query whether I remember or not.

**Postgres because the domain is relational.** Pets own events, events have typed details, policies feed cost math. Foreign keys and SQL views express that cleanly. A document store would just push all that logic up into my code.

**Vercel because it's the path of least resistance for Next.js** Preview deploys per PR, scales to zero, fine for early traffic.

**AI deferred on purpose.** The product call was: don't build AI until there's real data to make it useful. Architecturally that's easy to honor, because AI is just one more server-side reader of the same data.Adding it later doesn't disturb anything else. Designing for it now (server-only, feature-flagged) means no rewrite when it lands.

---

## The tradeoff descisons

Nothing here is free. Tradeoffs:

- **Serverless means cold starts and no persistent DB connections.** I lean on Supabase's connection pooler. Fine at this scale; a high-throughput workload might later need a long-running service.
- **Supabase.** Auth and RLS are its flavor of Postgres. Worth it for the speed; Acknowledge the exit cost.
- **RLS has to be tested like real code.** Wrong policy can leak data silently, so "a second user can't read pet A" is an actual test.
- **Cost estimates use static, hand-maintained ranges.** They can drift from the market. I chose that over brittle real-time pricing integrations, and every estimate ships with a disclaimer.
- **Frontend and backend deploy as one unit.** Simple now. If a mobile app or public API shows up later, I wrote the cost/care logic as pure functions so it's cheap to pull out.
- **AI will send PII off my boundary.** Gated behind a privacy review before V2 ever ships. Out of scope today.

---

**More detail:** [Master PRD](./prod-requirements.md) · [Data Model & Security](./prds/data-model.md) · [Care Cost Planner](./prds/care-cost-planner.md) · [Preventative Care](./prds/preventative-care.md)

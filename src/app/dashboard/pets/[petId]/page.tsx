import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addTimelineEvent } from "@/app/actions/timeline";
import { vaccineReminders } from "@/lib/care";
import { PetProfileHeader } from "@/components/pet-profile-header";
import { PetAbout } from "@/components/pet-about";
import { UpcomingCare } from "@/components/upcoming-care";
import { TimelineSection } from "@/components/timeline-section";
import type { CurrentWeight, HealthEvent, Pet } from "@/lib/types";

// PostgREST returns 1:1 embeds as an object, but coerce defensively.
function one<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function PetPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: pet } = await supabase
    .from("pets")
    .select("*")
    .eq("id", petId)
    .maybeSingle();
  if (!pet) notFound();

  const [{ data: weight }, { data: rawEvents }] = await Promise.all([
    supabase
      .from("pet_current_weight")
      .select("*")
      .eq("pet_id", petId)
      .maybeSingle(),
    supabase
      .from("health_events")
      .select(
        `id, pet_id, event_type, title, notes, event_date, created_at,
         vet_visit_details(clinic_name, diagnosis, follow_up),
         vaccination_details(vaccine_name, administered_date, expiration_date),
         procedure_details(procedure_name, outcome),
         weight_details(weight_kg)`
      )
      .eq("pet_id", petId)
      .order("event_date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  const events: HealthEvent[] = (rawEvents ?? []).map((e) => ({
    ...e,
    vet_visit_details: one(e.vet_visit_details),
    vaccination_details: one(e.vaccination_details),
    procedure_details: one(e.procedure_details),
    weight_details: one(e.weight_details),
  })) as HealthEvent[];

  const reminders = vaccineReminders(events);
  const addEvent = addTimelineEvent.bind(null, petId);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> All pets
      </Link>

      <PetProfileHeader pet={pet as Pet} />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-6 md:col-span-1">
          <PetAbout pet={pet as Pet} weight={weight as CurrentWeight | null} />
          <UpcomingCare reminders={reminders} />
        </div>
        <div className="md:col-span-2">
          <TimelineSection events={events} action={addEvent} />
        </div>
      </div>
    </main>
  );
}

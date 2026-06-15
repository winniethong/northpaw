"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { EVENT_TYPES, type EventType } from "@/lib/types";

export type TimelineFormState = { error: string } | { ok: true } | undefined;

export async function addTimelineEvent(
  petId: string,
  _prev: TimelineFormState,
  formData: FormData
): Promise<TimelineFormState> {
  const eventType = String(formData.get("event_type") ?? "") as EventType;
  const title = String(formData.get("title") ?? "").trim();
  const eventDate = String(formData.get("event_date") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!EVENT_TYPES.includes(eventType)) return { error: "Pick an event type." };
  if (!title) return { error: "Title is required." };
  if (!eventDate) return { error: "Date is required." };

  // Typed detail fields (only the relevant ones are read per type).
  const detail: Record<string, string> = {};
  if (eventType === "vet_visit") {
    detail.clinic_name = String(formData.get("clinic_name") ?? "").trim();
    detail.diagnosis = String(formData.get("diagnosis") ?? "").trim();
    detail.follow_up = String(formData.get("follow_up") ?? "").trim();
  } else if (eventType === "vaccination") {
    const vaccine = String(formData.get("vaccine_name") ?? "").trim();
    if (!vaccine) return { error: "Vaccine name is required." };
    detail.vaccine_name = vaccine;
    detail.administered_date =
      String(formData.get("administered_date") ?? "").trim() || eventDate;
    detail.expiration_date = String(
      formData.get("expiration_date") ?? ""
    ).trim();
  } else if (eventType === "procedure") {
    detail.procedure_name = String(formData.get("procedure_name") ?? "").trim();
    detail.outcome = String(formData.get("outcome") ?? "").trim();
  } else if (eventType === "weight") {
    const kg = String(formData.get("weight_kg") ?? "").trim();
    if (!kg || Number.isNaN(Number(kg)))
      return { error: "Enter a valid weight in kg." };
    detail.weight_kg = kg;
  }

  const supabase = await createClient();
  // Atomic insert (spine event + typed detail) via the DB function.
  const { error } = await supabase.rpc("add_timeline_event", {
    p_pet_id: petId,
    p_event_type: eventType,
    p_title: title,
    p_event_date: eventDate,
    p_notes: notes,
    p_detail: detail,
  });
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/pets/${petId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

// Weight is a profile stat, not a manually-added event type. Logging a new
// weight writes a `weight` event so the value (and history) lives on the
// timeline spine — see docs/prds/data-model.md (weight is derived).
export async function logWeight(
  petId: string,
  _prev: TimelineFormState,
  formData: FormData
): Promise<TimelineFormState> {
  const kg = String(formData.get("weight_kg") ?? "").trim();
  const eventDate =
    String(formData.get("event_date") ?? "").trim() ||
    new Date().toISOString().slice(0, 10);

  if (!kg || Number.isNaN(Number(kg)) || Number(kg) <= 0) {
    return { error: "Enter a valid weight in kg." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("add_timeline_event", {
    p_pet_id: petId,
    p_event_type: "weight",
    p_title: `${kg} kg`,
    p_event_date: eventDate,
    p_notes: null,
    p_detail: { weight_kg: kg },
  });
  if (error) return { error: error.message };

  revalidatePath(`/dashboard/pets/${petId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

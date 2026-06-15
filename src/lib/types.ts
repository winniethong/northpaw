// Shared domain types. Hand-written to match the schema in docs/prds/data-model.md.

export const SPECIES_OPTIONS = [
  { value: "dog", label: "Dog" },
  { value: "cat", label: "Cat" },
  { value: "bird", label: "Bird" },
  { value: "rabbit", label: "Rabbit" },
  { value: "guinea_pig", label: "Guinea pig" },
  { value: "turtle", label: "Turtle" },
  { value: "fish", label: "Fish" },
  { value: "reptile", label: "Reptile" },
  { value: "horse", label: "Horse" },
  { value: "other", label: "Other" },
] as const;

export type Species = (typeof SPECIES_OPTIONS)[number]["value"];

export function speciesLabel(species: string) {
  return (
    SPECIES_OPTIONS.find((option) => option.value === species)?.label ??
    species.replaceAll("_", " ")
  );
}

export type Pet = {
  id: string;
  owner_id: string;
  name: string;
  species: Species;
  breed: string | null;
  birth_date: string | null; // ISO date
  sex: string | null;
  profile_image_url: string | null;
  archived_at: string | null;
  created_at: string;
};

export const EVENT_TYPES = [
  "symptom",
  "medication",
  "weight",
  "food_change",
  "vet_visit",
  "vaccination",
  "procedure",
  "custom",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

// Event types that open a 1:1 typed detail panel.
export const TYPED_EVENTS: EventType[] = [
  "vet_visit",
  "vaccination",
  "procedure",
  "weight",
];

export type HealthEvent = {
  id: string;
  pet_id: string;
  event_type: EventType;
  title: string;
  notes: string | null;
  event_date: string; // ISO date
  created_at: string;
  // Joined 1:1 details (present only for the matching event_type).
  vet_visit_details?: VetVisitDetail | null;
  vaccination_details?: VaccinationDetail | null;
  procedure_details?: ProcedureDetail | null;
  weight_details?: WeightDetail | null;
};

export type VetVisitDetail = {
  clinic_name: string | null;
  diagnosis: string | null;
  follow_up: string | null;
};

export type VaccinationDetail = {
  vaccine_name: string;
  administered_date: string;
  expiration_date: string | null;
};

export type ProcedureDetail = {
  procedure_name: string | null;
  outcome: string | null;
};

export type WeightDetail = {
  weight_kg: number;
};

export type CurrentWeight = {
  pet_id: string;
  weight_kg: number;
  measured_on: string;
};

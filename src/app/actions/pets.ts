"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SPECIES_OPTIONS, type Species } from "@/lib/types";

export type PetFormState = { error: string } | undefined;

const SPECIES = SPECIES_OPTIONS.map((option) => option.value);

function readPetFields(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const species = String(formData.get("species") ?? "").trim();
  const breed = String(formData.get("breed") ?? "").trim() || null;
  const birth_date = String(formData.get("birth_date") ?? "").trim() || null;
  const sex = String(formData.get("sex") ?? "").trim() || null;
  return { name, species, breed, birth_date, sex };
}

function validate(name: string, species: string): string | null {
  if (!name) return "Name is required.";
  if (!SPECIES.includes(species as Species))
    return "Choose a supported species.";
  return null;
}

export async function createPet(
  _prev: PetFormState,
  formData: FormData
): Promise<PetFormState> {
  const { name, species, breed, birth_date, sex } = readPetFields(formData);
  const invalid = validate(name, species);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("pets")
    .insert({ owner_id: user.id, name, species, breed, birth_date, sex });
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updatePet(
  petId: string,
  _prev: PetFormState,
  formData: FormData
): Promise<PetFormState> {
  const { name, species, breed, birth_date, sex } = readPetFields(formData);
  const invalid = validate(name, species);
  if (invalid) return { error: invalid };

  const supabase = await createClient();
  const { error } = await supabase
    .from("pets")
    .update({ name, species, breed, birth_date, sex })
    .eq("id", petId);
  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/pets/${petId}`);
  redirect(`/dashboard/pets/${petId}`);
}

export async function archivePet(petId: string) {
  const supabase = await createClient();
  await supabase
    .from("pets")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", petId);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

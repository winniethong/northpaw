import { redirect } from "next/navigation";

import { createPet } from "@/app/actions/pets";
import { AddPetStepper } from "@/components/add-pet-stepper";
import { createClient } from "@/lib/supabase/server";

export default async function NewPetPage() {
  // Page-level auth check because this page can otherwise be statically served.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <main className="flex min-h-[calc(100dvh-89px)] flex-1 flex-col">
      <AddPetStepper action={createPet} />
    </main>
  );
}

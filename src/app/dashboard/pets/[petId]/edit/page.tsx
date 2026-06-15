import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePet } from "@/app/actions/pets";
import { PetForm } from "@/components/pet-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Pet } from "@/lib/types";

export default async function EditPetPage({
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

  const action = updatePet.bind(null, petId);

  return (
    <main className="flex flex-1 justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-lg">
        <Link
          href={`/dashboard/pets/${petId}`}
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back
        </Link>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              Edit {(pet as Pet).name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PetForm action={action} submitLabel="Save changes" pet={pet as Pet} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

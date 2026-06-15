import Link from "next/link";
import { PawPrint, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PetCard } from "@/components/pet-card";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CurrentWeight, Pet } from "@/lib/types";

type LatestEvent = {
  pet_id: string;
  title: string;
  event_date: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // RLS scopes all queries to the current user. Archived pets are hidden.
  const [{ data: pets }, { data: weights }, { data: latestEvents }] =
    await Promise.all([
    supabase
      .from("pets")
      .select("*")
      .is("archived_at", null)
      .order("created_at", { ascending: false }),
    supabase.from("pet_current_weight").select("*"),
    supabase
      .from("health_events")
      .select("pet_id, title, event_date")
      .order("event_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const weightByPet = new Map<string, CurrentWeight>(
    ((weights as CurrentWeight[]) ?? []).map((w) => [w.pet_id, w])
  );
  const latestEventByPet = new Map<string, LatestEvent>();
  for (const event of (latestEvents as LatestEvent[]) ?? []) {
    if (!latestEventByPet.has(event.pet_id)) {
      latestEventByPet.set(event.pet_id, event);
    }
  }
  const petList = (pets as Pet[]) ?? [];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10">
      <section className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Pet home
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold tracking-tight md:text-5xl">
            Your pets
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
            Every record starts with a pet profile. Add the basics now, then
            build out health history, documents, and care costs over time.
          </p>
        </div>

        {petList.length > 0 && (
          <Link
            href="/dashboard/pets/new"
            className={buttonVariants({ variant: "secondary" })}
          >
            <Plus className="size-4" /> Add a pet
          </Link>
        )}
      </section>

      {petList.length > 0 ? (
        <section className="grid gap-5 md:grid-cols-2">
          {petList.map((pet) => (
            <PetCard
              key={pet.id}
              pet={pet}
              weight={weightByPet.get(pet.id) ?? null}
              latestEvent={latestEventByPet.get(pet.id) ?? null}
            />
          ))}
        </section>
      ) : (
        <Card className="max-w-2xl border-border/80 bg-card/70">
          <CardHeader>
            <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-secondary/15 text-secondary">
              <PawPrint className="size-6" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl">Add your first pet</CardTitle>
            <CardDescription className="text-base leading-7">
              Start with the basics. You can add health events, insurance, and
              documents once the profile exists.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/dashboard/pets/new"
              className={buttonVariants({ variant: "secondary" })}
            >
              <Plus className="size-4" /> Add a pet
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  );
}

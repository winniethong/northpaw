import Link from "next/link";
import { ArrowRight, Scale } from "lucide-react";

import { formatAge, formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { speciesLabel, type Pet, type CurrentWeight } from "@/lib/types";

type LatestEvent = {
  title: string;
  event_date: string;
};

export function PetCard({
  pet,
  weight,
  latestEvent,
}: {
  pet: Pet;
  weight: CurrentWeight | null;
  latestEvent: LatestEvent | null;
}) {
  const initial = pet.name.trim().charAt(0).toUpperCase() || "?";
  const sex = pet.sex && pet.sex !== "unknown" ? pet.sex : null;

  return (
    <Link href={`/dashboard/pets/${pet.id}`} className="group">
      <Card className="h-full border-border/80 bg-card/70 transition-colors group-hover:border-secondary/70">
        <CardHeader className="grid grid-cols-[auto_1fr] gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground">
            {initial}
          </div>

          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <CardTitle className="truncate text-2xl">{pet.name}</CardTitle>
              <Badge variant="secondary" className="capitalize">
                {speciesLabel(pet.species)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {[pet.breed, formatAge(pet.birth_date), sex]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </CardHeader>

        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border/70 bg-background/35 p-3">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              <Scale className="size-3.5" aria-hidden="true" />
              Weight
            </p>
            <p className="mt-2 text-sm text-foreground">
              {weight ? `${weight.weight_kg} kg` : "No weight logged"}
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-background/35 p-3">
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Latest update
            </p>
            <p className="mt-2 line-clamp-1 text-sm text-foreground">
              {latestEvent ? latestEvent.title : "No health events yet"}
            </p>
            {latestEvent && (
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(latestEvent.event_date)}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="justify-between text-sm text-muted-foreground transition-colors group-hover:text-secondary">
          Open profile
          <ArrowRight className="size-4" aria-hidden="true" />
        </CardFooter>
      </Card>
    </Link>
  );
}

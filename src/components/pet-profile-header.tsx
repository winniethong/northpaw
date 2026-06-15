import Link from "next/link";
import { formatAge } from "@/lib/format";
import { speciesLabel, type Pet } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ArchivePetButton } from "@/components/archive-pet-button";

export function PetProfileHeader({ pet }: { pet: Pet }) {
  const initial = pet.name.trim().charAt(0).toUpperCase() || "?";
  const sex = pet.sex && pet.sex !== "unknown" ? pet.sex : null;
  const meta = [pet.breed, formatAge(pet.birth_date), sex]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground">
          {initial}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{pet.name}</h1>
            <Badge variant="secondary" className="capitalize">
              {speciesLabel(pet.species)}
            </Badge>
          </div>
          {meta && <p className="mt-1 text-sm text-muted-foreground">{meta}</p>}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <Link
          href={`/dashboard/pets/${pet.id}/edit`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Edit
        </Link>
        <ArchivePetButton petId={pet.id} petName={pet.name} />
      </div>
    </header>
  );
}

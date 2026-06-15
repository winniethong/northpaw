import type { ReactNode } from "react";
import { formatAge, formatDate } from "@/lib/format";
import { speciesLabel, type Pet, type CurrentWeight } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UpdateWeightDialog } from "@/components/update-weight-dialog";

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/60 py-2 last:border-0">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium">{value}</dd>
    </div>
  );
}

export function PetAbout({
  pet,
  weight,
}: {
  pet: Pet;
  weight: CurrentWeight | null;
}) {
  const sex = pet.sex && pet.sex !== "unknown" ? pet.sex : "—";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">About</CardTitle>
      </CardHeader>
      <CardContent>
        <dl>
          <Row
            label="Species"
            value={<span className="capitalize">{speciesLabel(pet.species)}</span>}
          />
          <Row label="Breed" value={pet.breed || "—"} />
          <Row label="Sex" value={<span className="capitalize">{sex}</span>} />
          <Row label="Birthday" value={formatDate(pet.birth_date)} />
          <Row label="Age" value={formatAge(pet.birth_date)} />
          <Row
            label="Weight"
            value={
              <span className="flex items-center justify-end gap-2">
                {weight ? (
                  `${weight.weight_kg} kg`
                ) : (
                  <span className="text-muted-foreground">Not logged</span>
                )}
                <UpdateWeightDialog
                  petId={pet.id}
                  label={weight ? "Update" : "Log"}
                  variant="ghost"
                />
              </span>
            }
          />
        </dl>
      </CardContent>
    </Card>
  );
}

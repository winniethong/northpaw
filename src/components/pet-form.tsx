"use client";

import { useActionState, useState } from "react";
import type { PetFormState } from "@/app/actions/pets";
import { SPECIES_OPTIONS, speciesLabel, type Pet, type Species } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OptionalHint, RequiredMark } from "@/components/field-hint";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SEX_LABELS: Record<string, string> = {
  unknown: "Unknown",
  male: "Male",
  female: "Female",
};

type PetFormProps = {
  action: (state: PetFormState, formData: FormData) => Promise<PetFormState>;
  submitLabel: string;
  pet?: Pet;
};

export function PetForm({ action, submitLabel, pet }: PetFormProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  // Base UI Select doesn't post via FormData — mirror values into hidden inputs.
  const [species, setSpecies] = useState(pet?.species ?? "");
  const [sex, setSex] = useState(pet?.sex ?? "unknown");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">
          Name <RequiredMark />
        </Label>
        <Input
          id="name"
          name="name"
          required
          aria-required
          defaultValue={pet?.name ?? ""}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="species">
          Species <RequiredMark />
        </Label>
        <Select value={species} onValueChange={(v) => setSpecies(v ?? "")}>
          <SelectTrigger id="species" className="w-full">
            <SelectValue>
              {(v) => (v ? speciesLabel(v as Species) : "Select…")}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SPECIES_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input type="hidden" name="species" value={species} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="breed">
          Breed <OptionalHint />
        </Label>
        <Input id="breed" name="breed" defaultValue={pet?.breed ?? ""} />
      </div>

      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="birth_date">
            Birth date <OptionalHint />
          </Label>
          <Input
            id="birth_date"
            name="birth_date"
            type="date"
            defaultValue={pet?.birth_date ?? ""}
          />
        </div>

        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="sex">
            Sex <OptionalHint />
          </Label>
          <Select value={sex} onValueChange={(v) => setSex(v ?? "unknown")}>
            <SelectTrigger id="sex" className="w-full">
              <SelectValue>{(v) => SEX_LABELS[v as string] ?? "Unknown"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unknown">Unknown</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="sex" value={sex === "unknown" ? "" : sex} />
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

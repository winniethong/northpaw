"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  PawPrint,
} from "lucide-react";
import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import type { PetFormState } from "@/app/actions/pets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SPECIES_OPTIONS, speciesLabel } from "@/lib/types";

type AddPetStepperProps = {
  action: (state: PetFormState, formData: FormData) => Promise<PetFormState>;
};

const steps = [
  "Name",
  "Species",
  "Details",
  "Review",
] as const;
const primarySpecies = new Set(["dog", "cat"]);

export function AddPetStepper({ action }: AddPetStepperProps) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [sex, setSex] = useState("unknown");
  const [showMoreSpecies, setShowMoreSpecies] = useState(false);

  const progress = `${((step + 1) / steps.length) * 100}%`;
  const visibleSpecies = showMoreSpecies
    ? SPECIES_OPTIONS
    : SPECIES_OPTIONS.filter((option) => primarySpecies.has(option.value));
  const canContinue = useMemo(() => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return species.length > 0;
    return true;
  }, [name, species, step]);

  function goNext() {
    if (!canContinue) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter" || step === steps.length - 1) return;
    event.preventDefault();
    goNext();
  }

  return (
    <form
      action={formAction}
      className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-6 py-8"
      onKeyDown={handleKeyDown}
    >
      <input type="hidden" name="name" value={name} />
      <input type="hidden" name="species" value={species} />
      <input type="hidden" name="breed" value={breed} />
      <input type="hidden" name="birth_date" value={birthDate} />
      <input type="hidden" name="sex" value={sex === "unknown" ? "" : sex} />

      <div className="flex items-center justify-between gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to pets
        </Link>
        <p className="text-sm text-muted-foreground">
          Step {step + 1} of {steps.length}
        </p>
      </div>

      <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-secondary transition-all duration-300"
          style={{ width: progress }}
        />
      </div>

      <section className="grid min-h-[320px] flex-1 items-start py-10">
        {step === 0 && (
          <div className="mx-auto mt-10 w-full max-w-3xl">
            <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              What&apos;s your pet&apos;s name?
            </h1>
            <Input
              autoFocus
              className="mt-7 h-12 rounded-xl px-4 text-lg md:text-xl"
              onChange={(event) => setName(event.target.value)}
              placeholder="Bella"
              value={name}
            />
          </div>
        )}

        {step === 1 && (
          <div className="mx-auto mt-10 w-full max-w-3xl">
            <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              What kind of pet is {name || "your pet"}?
            </h1>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {visibleSpecies.map((option) => (
                <button
                  className={`flex items-center justify-between rounded-xl border p-3 text-left transition-colors ${
                    species === option.value
                      ? "border-secondary bg-secondary/15 text-foreground"
                      : "border-border bg-card/60 text-muted-foreground hover:border-secondary/70 hover:text-foreground"
                  }`}
                  key={option.value}
                  onClick={() => setSpecies(option.value)}
                  type="button"
                >
                  <span className="text-base font-medium">{option.label}</span>
                  {species === option.value ? (
                    <Check className="size-5 text-secondary" aria-hidden="true" />
                  ) : (
                    <PawPrint className="size-5" aria-hidden="true" />
                  )}
                </button>
              ))}
            </div>
            <button
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setShowMoreSpecies((current) => !current)}
              type="button"
            >
              {showMoreSpecies ? "Show less" : "Show more species"}
              {showMoreSpecies ? (
                <ChevronUp className="size-4" aria-hidden="true" />
              ) : (
                <ChevronDown className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mx-auto mt-10 w-full max-w-3xl">
            <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              Anything else you know today?
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              These are optional. A pet profile can start simple.
            </p>
            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label htmlFor="breed">Breed or type</Label>
                <Input
                  id="breed"
                  onChange={(event) => setBreed(event.target.value)}
                  placeholder={species === "other" ? "Tell us what kind" : "Optional"}
                  value={breed}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="birth_date">Birth date</Label>
                <Input
                  id="birth_date"
                  onChange={(event) => setBirthDate(event.target.value)}
                  type="date"
                  value={birthDate}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="sex">Sex</Label>
                <Select value={sex} onValueChange={(value) => setSex(value ?? "unknown")}>
                  <SelectTrigger id="sex" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unknown">Unknown</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mx-auto mt-10 w-full max-w-3xl">
            <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
              Ready to add {name}?
            </h1>
            <div className="mt-8 rounded-2xl border border-border bg-card/70 p-6">
              <dl className="grid gap-5 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-muted-foreground">Name</dt>
                  <dd className="mt-1 text-lg font-medium">{name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Species</dt>
                  <dd className="mt-1 text-lg font-medium">
                    {speciesLabel(species)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Breed or type</dt>
                  <dd className="mt-1 text-lg font-medium">{breed || "Not added"}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Birth date</dt>
                  <dd className="mt-1 text-lg font-medium">
                    {birthDate || "Not added"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </section>

      {state?.error && (
        <p className="mx-auto mb-4 w-full max-w-3xl text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
        <Button
          disabled={step === 0 || pending}
          onClick={goBack}
          type="button"
          variant="ghost"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Button>

        {step < steps.length - 1 ? (
          <Button
            disabled={!canContinue}
            onClick={goNext}
            type="button"
            variant="secondary"
            className="h-12 px-7"
          >
            Continue
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            disabled={pending}
            type="submit"
            variant="secondary"
            className="h-12 px-7"
          >
            {pending ? "Creating..." : "Create pet"}
          </Button>
        )}
      </div>
    </form>
  );
}

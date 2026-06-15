"use client";

import { useActionState, useEffect, useState } from "react";
import type { TimelineFormState } from "@/app/actions/timeline";
import { EVENT_TYPES, type EventType } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { OptionalHint, RequiredMark } from "@/components/field-hint";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EVENT_LABELS: Record<EventType, string> = {
  symptom: "Symptom",
  medication: "Medication",
  weight: "Weight",
  food_change: "Food change",
  vet_visit: "Vet visit",
  vaccination: "Vaccination",
  procedure: "Procedure",
  custom: "Custom",
};

// Weight is logged from the profile (Update weight), not added here.
const ADD_EVENT_TYPES = EVENT_TYPES.filter((t) => t !== "weight");

const today = new Date().toISOString().slice(0, 10);

export function AddEventForm({
  action,
  onSuccess,
}: {
  action: (
    state: TimelineFormState,
    formData: FormData
  ) => Promise<TimelineFormState>;
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [type, setType] = useState<EventType>("symptom");

  useEffect(() => {
    if (state && "ok" in state) onSuccess?.();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="event_type">
            Type <RequiredMark />
          </Label>
          <Select
            value={type}
            onValueChange={(v) => setType((v as EventType) ?? "symptom")}
          >
            <SelectTrigger id="event_type" className="w-full">
              <SelectValue>
                {(v) => (v ? EVENT_LABELS[v as EventType] : null)}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {ADD_EVENT_TYPES.map((t) => (
                <SelectItem key={t} value={t}>
                  {EVENT_LABELS[t]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input type="hidden" name="event_type" value={type} />
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="event_date">
            Date <RequiredMark />
          </Label>
          <Input
            id="event_date"
            name="event_date"
            type="date"
            defaultValue={today}
            aria-required
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">
          Title <RequiredMark />
        </Label>
        <Input id="title" name="title" required aria-required />
      </div>

      {type === "vet_visit" && (
        <div className="flex flex-col gap-3">
          <Input name="clinic_name" placeholder="Clinic name" />
          <Input name="diagnosis" placeholder="Diagnosis" />
          <Input name="follow_up" placeholder="Follow-up" />
        </div>
      )}

      {type === "vaccination" && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="vaccine_name">
              Vaccine name <RequiredMark />
            </Label>
            <Input id="vaccine_name" name="vaccine_name" required aria-required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="expiration_date">
              Expiration date <OptionalHint />
            </Label>
            <Input id="expiration_date" name="expiration_date" type="date" />
          </div>
        </div>
      )}

      {type === "procedure" && (
        <div className="flex flex-col gap-3">
          <Input name="procedure_name" placeholder="Procedure name" />
          <Input name="outcome" placeholder="Outcome" />
        </div>
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="notes">
          Notes <OptionalHint />
        </Label>
        <Textarea id="notes" name="notes" rows={2} />
      </div>

      {state && "error" in state && (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Adding…" : "Add event"}
      </Button>
    </form>
  );
}

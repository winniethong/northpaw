"use client";

import { useActionState, useEffect, useState } from "react";
import { logWeight } from "@/app/actions/timeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const today = new Date().toISOString().slice(0, 10);

export function UpdateWeightDialog({
  petId,
  label = "Update",
  variant = "outline",
  size = "sm",
}: {
  petId: string;
  label?: string;
  variant?: "outline" | "ghost" | "link" | "secondary";
  size?: "sm" | "default";
}) {
  const [open, setOpen] = useState(false);
  const action = logWeight.bind(null, petId);
  const [state, formAction, pending] = useActionState(action, undefined);

  useEffect(() => {
    // Close the dialog once the server action reports success.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (state && "ok" in state) setOpen(false);
  }, [state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant={variant} size={size}>
            {label}
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update weight</DialogTitle>
          <DialogDescription>
            Saved as a weight entry on the timeline, so you keep a history.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="weight_kg">Weight (kg)</Label>
              <Input
                id="weight_kg"
                name="weight_kg"
                type="number"
                step="0.01"
                min="0"
                required
                aria-required
              />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="event_date">Date</Label>
              <Input
                id="event_date"
                name="event_date"
                type="date"
                defaultValue={today}
              />
            </div>
          </div>

          {state && "error" in state && (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="self-start">
            {pending ? "Saving…" : "Save weight"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

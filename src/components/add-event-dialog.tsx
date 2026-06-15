"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { TimelineFormState } from "@/app/actions/timeline";
import { AddEventForm } from "@/components/add-event-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function AddEventDialog({
  action,
}: {
  action: (
    state: TimelineFormState,
    formData: FormData
  ) => Promise<TimelineFormState>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm">
            <Plus className="size-4" /> Add event
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to timeline</DialogTitle>
          <DialogDescription>
            Log a health event for your pet.
          </DialogDescription>
        </DialogHeader>
        <AddEventForm action={action} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

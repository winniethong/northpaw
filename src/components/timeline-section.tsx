"use client";

import { useState } from "react";
import type { TimelineFormState } from "@/app/actions/timeline";
import type { HealthEvent } from "@/lib/types";
import { Timeline } from "@/components/timeline";
import { AddEventDialog } from "@/components/add-event-dialog";
import { Button } from "@/components/ui/button";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "vet_visit", label: "Vet visits" },
  { value: "vaccination", label: "Vaccinations" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

export function TimelineSection({
  events,
  action,
  eventIdsWithDocs,
}: {
  events: HealthEvent[];
  action: (
    state: TimelineFormState,
    formData: FormData
  ) => Promise<TimelineFormState>;
  eventIdsWithDocs?: Set<string>;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const filtered =
    filter === "all" ? events : events.filter((e) => e.event_type === filter);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Timeline</h2>
        <AddEventDialog action={action} />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            type="button"
            size="sm"
            variant={filter === f.value ? "secondary" : "ghost"}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <Timeline events={filtered} eventIdsWithDocs={eventIdsWithDocs} />
    </section>
  );
}

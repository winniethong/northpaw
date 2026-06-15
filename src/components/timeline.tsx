import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import type { EventType, HealthEvent } from "@/lib/types";

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

function detailSummary(event: HealthEvent): string | null {
  switch (event.event_type) {
    case "vet_visit": {
      const d = event.vet_visit_details;
      if (!d) return null;
      return [d.clinic_name, d.diagnosis && `dx: ${d.diagnosis}`]
        .filter(Boolean)
        .join(" · ");
    }
    case "vaccination": {
      const d = event.vaccination_details;
      if (!d) return null;
      return [
        d.vaccine_name,
        d.expiration_date && `expires ${formatDate(d.expiration_date)}`,
      ]
        .filter(Boolean)
        .join(" · ");
    }
    case "procedure": {
      const d = event.procedure_details;
      if (!d) return null;
      return [d.procedure_name, d.outcome].filter(Boolean).join(" · ");
    }
    case "weight": {
      const d = event.weight_details;
      return d ? `${d.weight_kg} kg` : null;
    }
    default:
      return null;
  }
}

export function Timeline({ events }: { events: HealthEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-muted-foreground">
        No events yet. Add the first one to start the timeline.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-3">
      {events.map((event) => {
        const summary = detailSummary(event);
        return (
          <li
            key={event.id}
            className="flex gap-4 rounded-lg border bg-card px-4 py-3"
          >
            <time className="w-24 shrink-0 text-sm text-muted-foreground">
              {formatDate(event.event_date)}
            </time>
            <div className="flex flex-col items-start gap-1">
              <Badge variant="secondary">
                {EVENT_LABELS[event.event_type]}
              </Badge>
              <span className="font-medium">{event.title}</span>
              {summary && (
                <span className="text-sm text-muted-foreground">{summary}</span>
              )}
              {event.notes && (
                <span className="text-sm text-muted-foreground">
                  {event.notes}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

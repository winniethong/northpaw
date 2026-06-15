import { formatDate } from "@/lib/format";
import type { CareStatus, VaccineReminder } from "@/lib/care";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STATUS_STYLES: Record<CareStatus, { dot: string; label: string }> = {
  overdue: { dot: "bg-destructive", label: "Overdue" },
  due_soon: { dot: "bg-warning", label: "Due soon" },
  upcoming: { dot: "bg-muted-foreground", label: "Upcoming" },
};

export function UpcomingCare({ reminders }: { reminders: VaccineReminder[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upcoming care</CardTitle>
      </CardHeader>
      <CardContent>
        {reminders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No vaccine reminders yet — add a vaccination with an expiration date
            to track what&apos;s due.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {reminders.map((r) => {
              const style = STATUS_STYLES[r.status];
              return (
                <li
                  key={`${r.vaccineName}-${r.expirationDate}`}
                  className="flex items-start gap-2.5"
                >
                  <span
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${style.dot}`}
                    aria-hidden="true"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {r.vaccineName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {style.label} · {formatDate(r.expirationDate)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

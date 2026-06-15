import type { HealthEvent } from "@/lib/types";

export type CareStatus = "overdue" | "due_soon" | "upcoming";

export type VaccineReminder = {
  vaccineName: string;
  expirationDate: string; // ISO date
  status: CareStatus;
};

const DUE_SOON_DAYS = 30;

function daysUntil(isoDate: string, today: Date): number {
  const target = new Date(isoDate + "T00:00:00");
  const start = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}

export function careStatus(expirationDate: string, today = new Date()): CareStatus {
  const days = daysUntil(expirationDate, today);
  if (days < 0) return "overdue";
  if (days <= DUE_SOON_DAYS) return "due_soon";
  return "upcoming";
}

// Derives vaccine reminders from timeline events that carry an expiration date.
// Pure — no I/O — so it can be unit-tested against fixture pets.
export function vaccineReminders(
  events: HealthEvent[],
  today = new Date()
): VaccineReminder[] {
  const reminders: VaccineReminder[] = [];

  for (const event of events) {
    if (event.event_type !== "vaccination") continue;
    const detail = event.vaccination_details;
    if (!detail?.expiration_date) continue;
    reminders.push({
      vaccineName: detail.vaccine_name,
      expirationDate: detail.expiration_date,
      status: careStatus(detail.expiration_date, today),
    });
  }

  // Most urgent first: soonest expiration date.
  return reminders.sort((a, b) =>
    a.expirationDate.localeCompare(b.expirationDate)
  );
}

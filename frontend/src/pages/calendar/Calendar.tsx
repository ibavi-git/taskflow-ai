import { CalendarDays } from "lucide-react";

export default function CalendarPage() {
  return (
    <div className="mx-auto max-w-4xl rounded-lg border border-border bg-card p-8">
      <CalendarDays className="mb-4 h-8 w-8 text-primary" />
      <h1 className="text-2xl font-semibold tracking-normal">Calendar</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        The calendar module will use `/api/calendar/events` and `/api/tasks/:taskId/sync-calendar` without changing the
        backend.
      </p>
    </div>
  );
}

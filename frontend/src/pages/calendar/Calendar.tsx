import { FormEvent, useMemo, useState } from "react";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/common/Loader";
import { getApiErrorMessage } from "@/services/api";
import { useCreateCalendarEvent, useDeleteCalendarEvent, useListCalendarEvents, type CalendarEvent } from "@workspace/api-client-react";

const defaultStart = () => new Date().toISOString().slice(0, 16);

export default function Calendar() {
  const { data: events = [], isLoading, error } = useListCalendarEvents();
  const createEvent = useCreateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(defaultStart());
  const [endDate, setEndDate] = useState(defaultStart());
  const [formError, setFormError] = useState("");

  const sortedEvents = useMemo(() => [...events].sort((a, b) => a.startDate.localeCompare(b.startDate)), [events]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) return;

    setFormError("");

    try {
      await createEvent.mutateAsync({ title: title.trim(), description: description.trim() || undefined, startDate, endDate });
      setTitle("");
      setDescription("");
      setStartDate(defaultStart());
      setEndDate(defaultStart());
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Schedule work items and review the events currently stored in the backend.</p>
      </div>

      {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{getApiErrorMessage(error)}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" />Create event</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Design review" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Optional notes" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start</label>
                  <Input type="datetime-local" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End</label>
                  <Input type="datetime-local" value={endDate} onChange={(event) => setEndDate(event.target.value)} required />
                </div>
              </div>
              {formError ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{formError}</p> : null}
              <Button type="submit" className="w-full" disabled={createEvent.isPending}>
                <Plus className="mr-2 h-4 w-4" />{createEvent.isPending ? "Creating..." : "Add event"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle>Upcoming events</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader label="Loading events" />
            ) : sortedEvents.length > 0 ? (
              <div className="space-y-3">
                {sortedEvents.map((event: CalendarEvent) => (
                  <div key={event.id} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background/70 p-4">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{event.description || "No description"}</p>
                      <p className="mt-2 text-xs text-muted-foreground">{new Date(event.startDate).toLocaleString()} → {new Date(event.endDate).toLocaleString()}</p>
                    </div>
                    <Button type="button" variant="ghost" size="icon" onClick={() => deleteEvent.mutate({ eventId: event.id })}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No calendar events returned by the backend yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

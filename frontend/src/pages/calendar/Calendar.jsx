import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Edit3, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/common/Loader";
import { ConfirmAction } from "@/components/app/ConfirmAction";
import { getApiErrorMessage } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateCalendarEvent,
  useDeleteCalendarEvent,
  useListCalendarEvents,
  useUpdateCalendarEvent
} from "@workspace/api-client-react";
const defaultStart = () => (/* @__PURE__ */ new Date()).toISOString().slice(0, 16);
const toInputDateTime = (value) => value ? value.slice(0, 16) : defaultStart();
function Calendar() {
  const { data: events = [], isLoading, error } = useListCalendarEvents();
  const createEvent = useCreateCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(defaultStart());
  const [endDate, setEndDate] = useState(defaultStart());
  const [formError, setFormError] = useState("");
  const sortedEvents = useMemo(() => [...events].sort((a, b) => a.startDate.localeCompare(b.startDate)), [events]);
  const handleCreate = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    setFormError("");
    try {
      await createEvent.mutateAsync({ title: title.trim(), description: description.trim() || void 0, startDate, endDate });
      setTitle("");
      setDescription("");
      setStartDate(defaultStart());
      setEndDate(defaultStart());
      toast({ title: "Event created" });
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };
  return <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Calendar</h1>
        <p className="mt-1 text-sm text-muted-foreground">Create, update, delete, and review calendar events stored in the backend.</p>
      </div>

      {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{getApiErrorMessage(error)}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="border-border bg-card">
          <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" />Create event</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreate}>
              <label className="space-y-2 block"><span className="text-sm font-medium">Title</span><Input value={title} onChange={(event) => setTitle(event.target.value)} required /></label>
              <label className="space-y-2 block"><span className="text-sm font-medium">Description</span><Textarea value={description} onChange={(event) => setDescription(event.target.value)} /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 block"><span className="text-sm font-medium">Start</span><Input type="datetime-local" value={startDate} onChange={(event) => setStartDate(event.target.value)} required /></label>
                <label className="space-y-2 block"><span className="text-sm font-medium">End</span><Input type="datetime-local" value={endDate} onChange={(event) => setEndDate(event.target.value)} required /></label>
              </div>
              {formError ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{formError}</p> : null}
              <Button type="submit" className="w-full" disabled={createEvent.isPending}><Plus className="mr-2 h-4 w-4" />{createEvent.isPending ? "Creating..." : "Add event"}</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader><CardTitle>Upcoming events</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <Loader label="Loading events" /> : sortedEvents.length > 0 ? <div className="space-y-3">
                {sortedEvents.map((event) => <div key={event.id} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-background/70 p-4">
                    <div className="min-w-0">
                      <p className="font-medium">{event.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{event.description || "No description"}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(event.startDate).toLocaleString()} to {event.endDate ? new Date(event.endDate).toLocaleString() : "No end"}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <CalendarEventEditDialog
    event={event}
    isSaving={updateEvent.isPending}
    onSave={async (data) => {
      await updateEvent.mutateAsync({ eventId: event.id, data });
      toast({ title: "Event updated" });
    }}
  />
                      <ConfirmAction title="Delete event?" description="This deletes the calendar event from the backend." onConfirm={() => deleteEvent.mutate({ eventId: event.id })}>
                        <Button type="button" variant="ghost" size="icon"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </ConfirmAction>
                    </div>
                  </div>)}
              </div> : <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No calendar events returned by the backend yet.
              </div>}
          </CardContent>
        </Card>
      </div>
    </div>;
}
function CalendarEventEditDialog({
  event,
  isSaving,
  onSave
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description ?? "");
  const [startDate, setStartDate] = useState(toInputDateTime(event.startDate));
  const [endDate, setEndDate] = useState(toInputDateTime(event.endDate));
  const { toast } = useToast();
  useEffect(() => {
    if (open) {
      setTitle(event.title);
      setDescription(event.description ?? "");
      setStartDate(toInputDateTime(event.startDate));
      setEndDate(toInputDateTime(event.endDate));
    }
  }, [event, open]);
  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault();
    try {
      await onSave({ title, description: description || void 0, startDate, endDate });
      setOpen(false);
    } catch (error) {
      toast({ title: "Update failed", description: getApiErrorMessage(error), variant: "destructive" });
    }
  };
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button type="button" variant="ghost" size="icon"><Edit3 className="h-4 w-4" /></Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit event</DialogTitle>
          <DialogDescription>Updates are sent to the calendar event API.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input value={title} onChange={(event2) => setTitle(event2.target.value)} required />
          <Textarea value={description} onChange={(event2) => setDescription(event2.target.value)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input type="datetime-local" value={startDate} onChange={(event2) => setStartDate(event2.target.value)} required />
            <Input type="datetime-local" value={endDate} onChange={(event2) => setEndDate(event2.target.value)} required />
          </div>
          <DialogFooter><Button type="submit" disabled={isSaving}>Save event</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>;
}
export {
  Calendar as default
};

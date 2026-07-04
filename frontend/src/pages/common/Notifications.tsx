import { useEffect, useState } from "react";
import { Bell, Inbox } from "lucide-react";
import { notificationService, type Notification } from "@/services/notificationService";
import { getApiErrorMessage } from "@/services/api";
import { Loader } from "@/components/common/Loader";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadNotifications() {
      try {
        const data = await notificationService.listNotifications();
        if (active) setNotifications(data);
      } catch (err) {
        if (active) setError(getApiErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadNotifications();

    return () => {
      active = false;
    };
  }, []);

  if (loading) return <Loader label="Loading notifications" />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Live notifications from `/api/notifications`.</p>
      </div>

      {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}

      <div className="divide-y divide-border rounded-lg border border-border bg-card">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <article key={notification.id} className="flex gap-4 p-5">
              <Bell className="mt-0.5 h-5 w-5 text-primary" />
              <div className="min-w-0">
                <p className="font-medium">{notification.message}</p>
                <p className="mt-1 text-sm text-muted-foreground">{notification.type}</p>
              </div>
            </article>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-10 text-center text-muted-foreground">
            <Inbox className="mb-3 h-8 w-8" />
            <p>No notifications returned by the backend.</p>
          </div>
        )}
      </div>
    </div>
  );
}

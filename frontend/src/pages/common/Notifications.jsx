import { Bell, Inbox, CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/common/Loader";
import { getApiErrorMessage } from "@/services/api";
import { useDeleteNotification, useListNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from "@workspace/api-client-react";
function NotificationsPage() {
  const { data: notifications = [], isLoading, error } = useListNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markOneRead = useMarkNotificationRead();
  const deleteNotification = useDeleteNotification();
  return <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-normal">Notifications</h1>
          <p className="mt-1 text-sm text-muted-foreground">Keep your inbox aligned with the backend notifications feed.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => markAllRead.mutate()} disabled={markAllRead.isPending || notifications.length === 0}>
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark all read
        </Button>
      </div>

      {error ? <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{getApiErrorMessage(error)}</p> : null}

      {isLoading ? <Loader label="Loading notifications" /> : <div className="divide-y divide-border rounded-lg border border-border bg-card">
          {notifications.length > 0 ? notifications.map((notification) => <article key={notification.id} className="flex items-start justify-between gap-4 p-5">
                <div className="flex gap-3">
                  <Bell className={`mt-0.5 h-5 w-5 ${notification.read ? "text-muted-foreground" : "text-primary"}`} />
                  <div className="min-w-0">
                    <p className="font-medium">{notification.message}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{notification.type}</p>
                    <p className="mt-2 text-xs text-muted-foreground">{new Date(notification.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.read ? <Button type="button" variant="outline" size="sm" onClick={() => markOneRead.mutate({ notificationId: notification.id })}>
                      Mark read
                    </Button> : null}
                  <Button type="button" variant="ghost" size="icon" onClick={() => deleteNotification.mutate({ notificationId: notification.id })}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </article>) : <div className="flex flex-col items-center justify-center p-10 text-center text-muted-foreground">
              <Inbox className="mb-3 h-8 w-8" />
              <p>No notifications returned by the backend.</p>
            </div>}
        </div>}
    </div>;
}
export {
  NotificationsPage as default
};

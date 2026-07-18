import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [compactMode, setCompactMode] = useState(false);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-normal">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Adjust the workspace experience without changing the backend contract.</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Fine-tune how TaskFlow AI feels while you work.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="font-medium">Notifications</p>
              <p className="text-sm text-muted-foreground">Receive in-app alerts for important updates.</p>
            </div>
            <Button type="button" variant={notificationsEnabled ? "default" : "outline"} size="sm" onClick={() => setNotificationsEnabled((value) => !value)}>
              {notificationsEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <p className="font-medium">Compact mode</p>
              <p className="text-sm text-muted-foreground">Reduce spacing to fit more boards and task cards on screen.</p>
            </div>
            <Button type="button" variant={compactMode ? "default" : "outline"} size="sm" onClick={() => setCompactMode((value) => !value)}>
              {compactMode ? "On" : "Off"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

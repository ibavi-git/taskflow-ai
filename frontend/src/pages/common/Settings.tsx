import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Settings() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage global preferences and application settings.</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>TaskFlow AI uses a dark-first aesthetic by default.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            The dark theme is enforced globally to reduce eye strain during deep work. Future updates will introduce custom color palettes.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configure how you receive alerts.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <div className="font-medium text-sm">Email Notifications</div>
                <div className="text-xs text-muted-foreground">Receive daily summaries and urgent alerts via email.</div>
              </div>
              <div className="text-sm text-primary font-medium bg-primary/10 px-2 py-1 rounded">Enabled</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

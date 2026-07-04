import { BarChart3 } from "lucide-react";

export default function Reports() {
  return (
    <div className="mx-auto max-w-4xl rounded-lg border border-border bg-card p-8">
      <BarChart3 className="mb-4 h-8 w-8 text-primary" />
      <h1 className="text-2xl font-semibold tracking-normal">Reports</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Reports will be connected to `/api/reports/task-stats`, `/api/reports/project-progress`, and
        `/api/reports/productivity` in the reports module.
      </p>
    </div>
  );
}
